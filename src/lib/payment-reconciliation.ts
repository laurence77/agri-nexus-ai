import { createClient } from '@supabase/supabase-js';
import { SecurityService } from '@/lib/security';

export interface PaymentTransaction {
  id: string;
  tenant_id: string;
  transaction_type: 'income' | 'expense' | 'transfer';
  category: string;
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  reference_number?: string;
  transaction_date: string;
  processed_date?: string;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  external_id?: string; // Bank/payment processor ID
  metadata: Record<string, any>;
  created_by: string;
  approved_by?: string;
  reconciliation_id?: string;
  attachments?: string[];
}

export interface PaymentMethod {
  type: 'bank_account' | 'credit_card' | 'cash' | 'check' | 'wire_transfer' | 'mobile_payment' | 'crypto';
  provider: string;
  account_identifier: string; // Last 4 digits or masked account
  account_name?: string;
}

export type TransactionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'disputed' 
  | 'reconciled' 
  | 'partially_reconciled';

export interface ReconciliationRule {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  conditions: ReconciliationCondition[];
  actions: ReconciliationAction[];
  priority: number;
  is_active: boolean;
  auto_apply: boolean;
  created_by: string;
}

export interface ReconciliationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'regex' | 'amount_range' | 'date_range';
  value: any;
  case_sensitive?: boolean;
}

export interface ReconciliationAction {
  type: 'categorize' | 'match_transaction' | 'create_adjustment' | 'flag_review' | 'auto_approve';
  parameters: Record<string, any>;
}

export interface ReconciliationSession {
  id: string;
  tenant_id: string;
  name: string;
  period_start: string;
  period_end: string;
  account_ids: string[];
  status: 'in_progress' | 'completed' | 'cancelled';
  total_transactions: number;
  matched_transactions: number;
  discrepancies: number;
  total_amount_reconciled: number;
  created_by: string;
  started_at: string;
  completed_at?: string;
  notes?: string;
}

export interface ReconciliationMatch {
  id: string;
  session_id: string;
  internal_transaction_id: string;
  external_transaction_id?: string;
  match_type: 'exact' | 'partial' | 'manual' | 'rule_based';
  match_confidence: number; // 0-1
  amount_difference: number;
  date_difference_days: number;
  matched_by: string;
  matched_at: string;
  notes?: string;
}

export interface PaymentDiscrepancy {
  id: string;
  session_id: string;
  discrepancy_type: 'missing_internal' | 'missing_external' | 'amount_mismatch' | 'date_mismatch' | 'duplicate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  internal_transaction_id?: string;
  external_transaction_id?: string;
  expected_amount?: number;
  actual_amount?: number;
  resolution_status: 'open' | 'investigating' | 'resolved' | 'accepted';
  resolution_notes?: string;
  assigned_to?: string;
  created_at: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  type: 'bank' | 'payment_processor' | 'marketplace' | 'government' | 'insurance';
  api_endpoint?: string;
  credentials_encrypted: string;
  last_sync: string;
  sync_frequency_hours: number;
  is_active: boolean;
  supported_transaction_types: string[];
}

export class PaymentReconciliationService {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Import transactions from external payment providers
   */
  static async importTransactions(
    tenantId: string,
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PaymentTransaction[]> {
    try {
      // Get provider configuration
      const { data: provider } = await this.supabase
        .from('payment_providers')
        .select('*')
        .eq('id', providerId)
        .eq('tenant_id', tenantId)
        .single();

      if (!provider) {
        throw new Error('Payment provider not found');
      }

      // Decrypt credentials
      const credentials = SecurityService.decryptField(provider.credentials_encrypted);
      
      // Import transactions based on provider type
      const importedTransactions = await this.importFromProvider(
        provider,
        credentials,
        startDate,
        endDate
      );

      // Store imported transactions
      const transactions: PaymentTransaction[] = [];
      for (const txn of importedTransactions) {
        const { data, error } = await this.supabase
          .from('payment_transactions')
          .insert({
            ...txn,
            tenant_id: tenantId,
            status: 'completed',
            metadata: {
              ...txn.metadata,
              imported_from: providerId,
              imported_at: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to store transaction:', error);
          continue;
        }

        transactions.push(data);
      }

      // Log import activity
      await SecurityService.logUserActivity({
        userId: 'system',
        tenantId,
        action: 'payment_import',
        resourceType: 'payment_transaction',
        success: true,
        metadata: {
          provider_id: providerId,
          transactions_imported: transactions.length,
          date_range: { start: startDate, end: endDate }
        }
      });

      return transactions;

    } catch (error) {
      console.error('Transaction import failed:', error);
      throw error;
    }
  }

  /**
   * Start a reconciliation session
   */
  static async startReconciliationSession(
    tenantId: string,
    name: string,
    periodStart: Date,
    periodEnd: Date,
    accountIds: string[],
    userId: string
  ): Promise<ReconciliationSession> {
    try {
      // Create reconciliation session
      const { data: session, error } = await this.supabase
        .from('reconciliation_sessions')
        .insert({
          tenant_id: tenantId,
          name,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          account_ids: accountIds,
          status: 'in_progress',
          created_by: userId,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Get transactions for the period
      const { data: transactions } = await this.supabase
        .from('payment_transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('transaction_date', periodStart.toISOString())
        .lte('transaction_date', periodEnd.toISOString())
        .in('payment_method->account_identifier', accountIds);

      // Update session with transaction count
      await this.supabase
        .from('reconciliation_sessions')
        .update({ 
          total_transactions: transactions?.length || 0 
        })
        .eq('id', session.id);

      // Start auto-reconciliation
      await this.performAutoReconciliation(session.id);

      return { ...session, total_transactions: transactions?.length || 0 };

    } catch (error) {
      console.error('Reconciliation session start failed:', error);
      throw error;
    }
  }

  /**
   * Perform automatic reconciliation using rules
   */
  static async performAutoReconciliation(sessionId: string): Promise<void> {
    try {
      const { data: session } = await this.supabase
        .from('reconciliation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) return;

      // Get active reconciliation rules
      const { data: rules } = await this.supabase
        .from('reconciliation_rules')
        .select('*')
        .eq('tenant_id', session.tenant_id)
        .eq('is_active', true)
        .eq('auto_apply', true)
        .order('priority', { ascending: false });

      if (!rules) return;

      // Get unmatched transactions
      const { data: transactions } = await this.supabase
        .from('payment_transactions')
        .select('*')
        .eq('tenant_id', session.tenant_id)
        .gte('transaction_date', session.period_start)
        .lte('transaction_date', session.period_end)
        .is('reconciliation_id', null);

      if (!transactions) return;

      let matchedCount = 0;

      // Apply reconciliation rules
      for (const rule of rules) {
        for (const transaction of transactions) {
          if (transaction.reconciliation_id) continue; // Already matched

          const matches = await this.evaluateRuleConditions(rule, transaction);
          if (matches) {
            await this.applyRuleActions(rule, transaction, sessionId);
            matchedCount++;
          }
        }
      }

      // Update session progress
      await this.supabase
        .from('reconciliation_sessions')
        .update({
          matched_transactions: matchedCount
        })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Auto-reconciliation failed:', error);
    }
  }

  /**
   * Manually match transactions
   */
  static async manualMatch(
    sessionId: string,
    internalTransactionId: string,
    externalTransactionId: string,
    userId: string,
    notes?: string
  ): Promise<ReconciliationMatch> {
    try {
      // Get both transactions
      const [internal, external] = await Promise.all([
        this.supabase
          .from('payment_transactions')
          .select('*')
          .eq('id', internalTransactionId)
          .single(),
        this.supabase
          .from('external_transactions')
          .select('*')
          .eq('id', externalTransactionId)
          .single()
      ]);

      if (!internal.data || !external.data) {
        throw new Error('Transaction not found');
      }

      // Calculate match metrics
      const amountDiff = Math.abs(internal.data.amount - external.data.amount);
      const dateDiff = Math.abs(
        new Date(internal.data.transaction_date).getTime() - 
        new Date(external.data.transaction_date).getTime()
      ) / (1000 * 60 * 60 * 24);

      // Create match record
      const { data: match, error } = await this.supabase
        .from('reconciliation_matches')
        .insert({
          session_id: sessionId,
          internal_transaction_id: internalTransactionId,
          external_transaction_id: externalTransactionId,
          match_type: 'manual',
          match_confidence: amountDiff === 0 && dateDiff <= 1 ? 1.0 : 0.8,
          amount_difference: amountDiff,
          date_difference_days: dateDiff,
          matched_by: userId,
          matched_at: new Date().toISOString(),
          notes
        })
        .select()
        .single();

      if (error) throw error;

      // Update transaction status
      await this.supabase
        .from('payment_transactions')
        .update({
          status: 'reconciled',
          reconciliation_id: match.id
        })
        .eq('id', internalTransactionId);

      // Log the manual match
      await SecurityService.logUserActivity({
        userId,
        tenantId: internal.data.tenant_id,
        action: 'manual_reconciliation',
        resourceType: 'payment_transaction',
        resourceId: internalTransactionId,
        success: true,
        metadata: {
          session_id: sessionId,
          external_transaction_id: externalTransactionId,
          amount_difference: amountDiff
        }
      });

      return match;

    } catch (error) {
      console.error('Manual match failed:', error);
      throw error;
    }
  }

  /**
   * Detect payment discrepancies
   */
  static async detectDiscrepancies(sessionId: string): Promise<PaymentDiscrepancy[]> {
    try {
      const { data: session } = await this.supabase
        .from('reconciliation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) return [];

      const discrepancies: PaymentDiscrepancy[] = [];

      // Get all transactions for the period
      const { data: internalTxns } = await this.supabase
        .from('payment_transactions')
        .select('*')
        .eq('tenant_id', session.tenant_id)
        .gte('transaction_date', session.period_start)
        .lte('transaction_date', session.period_end);

      const { data: externalTxns } = await this.supabase
        .from('external_transactions')
        .select('*')
        .eq('tenant_id', session.tenant_id)
        .gte('transaction_date', session.period_start)
        .lte('transaction_date', session.period_end);

      if (!internalTxns || !externalTxns) return [];

      // Find unmatched internal transactions
      const unmatchedInternal = internalTxns.filter(txn => !txn.reconciliation_id);
      for (const txn of unmatchedInternal) {
        discrepancies.push({
          id: `missing_external_${txn.id}`,
          session_id: sessionId,
          discrepancy_type: 'missing_external',
          severity: txn.amount > 10000 ? 'critical' : txn.amount > 1000 ? 'high' : 'medium',
          description: `Internal transaction ${txn.reference_number} not found in external records`,
          internal_transaction_id: txn.id,
          expected_amount: txn.amount,
          resolution_status: 'open',
          created_at: new Date().toISOString()
        });
      }

      // Find unmatched external transactions
      const matchedExternalIds = new Set(
        (await this.supabase
          .from('reconciliation_matches')
          .select('external_transaction_id')
          .eq('session_id', sessionId)).data?.map(m => m.external_transaction_id) || []
      );

      const unmatchedExternal = externalTxns.filter(txn => !matchedExternalIds.has(txn.id));
      for (const txn of unmatchedExternal) {
        discrepancies.push({
          id: `missing_internal_${txn.id}`,
          session_id: sessionId,
          discrepancy_type: 'missing_internal',
          severity: txn.amount > 10000 ? 'critical' : txn.amount > 1000 ? 'high' : 'medium',
          description: `External transaction ${txn.reference_number} not found in internal records`,
          external_transaction_id: txn.id,
          actual_amount: txn.amount,
          resolution_status: 'open',
          created_at: new Date().toISOString()
        });
      }

      // Find amount mismatches in matched transactions
      const { data: matches } = await this.supabase
        .from('reconciliation_matches')
        .select(`
          *,
          internal_transaction:payment_transactions(*),
          external_transaction:external_transactions(*)
        `)
        .eq('session_id', sessionId)
        .gt('amount_difference', 0);

      if (matches) {
        for (const match of matches) {
          if (match.amount_difference > 0.01) { // Ignore rounding differences
            discrepancies.push({
              id: `amount_mismatch_${match.id}`,
              session_id: sessionId,
              discrepancy_type: 'amount_mismatch',
              severity: match.amount_difference > 1000 ? 'high' : 'medium',
              description: `Amount mismatch: Internal $${match.internal_transaction?.amount} vs External $${match.external_transaction?.amount}`,
              internal_transaction_id: match.internal_transaction_id,
              external_transaction_id: match.external_transaction_id,
              expected_amount: match.internal_transaction?.amount,
              actual_amount: match.external_transaction?.amount,
              resolution_status: 'open',
              created_at: new Date().toISOString()
            });
          }
        }
      }

      // Store discrepancies in database
      if (discrepancies.length > 0) {
        await this.supabase
          .from('payment_discrepancies')
          .upsert(discrepancies, { onConflict: 'id' });
      }

      return discrepancies;

    } catch (error) {
      console.error('Discrepancy detection failed:', error);
      return [];
    }
  }

  /**
   * Generate reconciliation report
   */
  static async generateReconciliationReport(sessionId: string): Promise<{
    summary: ReconciliationSummary;
    transactions: PaymentTransaction[];
    discrepancies: PaymentDiscrepancy[];
    matches: ReconciliationMatch[];
  }> {
    try {
      // Get session details
      const { data: session } = await this.supabase
        .from('reconciliation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        throw new Error('Reconciliation session not found');
      }

      // Get all data
      const [transactionsResult, discrepanciesResult, matchesResult] = await Promise.all([
        this.supabase
          .from('payment_transactions')
          .select('*')
          .eq('tenant_id', session.tenant_id)
          .gte('transaction_date', session.period_start)
          .lte('transaction_date', session.period_end),
        this.supabase
          .from('payment_discrepancies')
          .select('*')
          .eq('session_id', sessionId),
        this.supabase
          .from('reconciliation_matches')
          .select('*')
          .eq('session_id', sessionId)
      ]);

      const transactions = transactionsResult.data || [];
      const discrepancies = discrepanciesResult.data || [];
      const matches = matchesResult.data || [];

      // Calculate summary
      const summary: ReconciliationSummary = {
        session_id: sessionId,
        total_transactions: transactions.length,
        matched_transactions: matches.length,
        unmatched_transactions: transactions.filter(t => !t.reconciliation_id).length,
        total_discrepancies: discrepancies.length,
        critical_discrepancies: discrepancies.filter(d => d.severity === 'critical').length,
        total_amount_processed: transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
        total_amount_matched: matches.reduce((sum, m) => {
          const txn = transactions.find(t => t.id === m.internal_transaction_id);
          return sum + (txn ? Math.abs(txn.amount) : 0);
        }, 0),
        reconciliation_rate: transactions.length > 0 ? (matches.length / transactions.length) * 100 : 0,
        generated_at: new Date().toISOString()
      };

      return {
        summary,
        transactions,
        discrepancies,
        matches
      };

    } catch (error) {
      console.error('Report generation failed:', error);
      throw error;
    }
  }

  /**
   * Create adjustment entry for discrepancies
   */
  static async createAdjustmentEntry(
    tenantId: string,
    discrepancyId: string,
    adjustmentAmount: number,
    reason: string,
    userId: string
  ): Promise<PaymentTransaction> {
    try {
      // Create adjustment transaction
      const { data: adjustment, error } = await this.supabase
        .from('payment_transactions')
        .insert({
          tenant_id: tenantId,
          transaction_type: adjustmentAmount > 0 ? 'income' : 'expense',
          category: 'Reconciliation Adjustments',
          subcategory: 'System Adjustment',
          amount: Math.abs(adjustmentAmount),
          currency: 'USD', // Default - should be configurable
          description: `Reconciliation adjustment: ${reason}`,
          transaction_date: new Date().toISOString(),
          payment_method: {
            type: 'adjustment' as any,
            provider: 'System',
            account_identifier: 'ADJ'
          },
          status: 'completed',
          metadata: {
            discrepancy_id: discrepancyId,
            adjustment_reason: reason,
            created_for_reconciliation: true
          },
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Update discrepancy status
      await this.supabase
        .from('payment_discrepancies')
        .update({
          resolution_status: 'resolved',
          resolution_notes: `Adjustment entry created: ${adjustment.id}`
        })
        .eq('id', discrepancyId);

      // Log the adjustment
      await SecurityService.logUserActivity({
        userId,
        tenantId,
        action: 'reconciliation_adjustment',
        resourceType: 'payment_transaction',
        resourceId: adjustment.id,
        success: true,
        metadata: {
          discrepancy_id: discrepancyId,
          adjustment_amount: adjustmentAmount,
          reason
        }
      });

      return adjustment;

    } catch (error) {
      console.error('Adjustment creation failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private static async importFromProvider(
    provider: PaymentProvider,
    credentials: string,
    startDate: Date,
    endDate: Date
  ): Promise<Partial<PaymentTransaction>[]> {
    // This would implement actual API calls to different payment providers
    // For now, return mock data
    const mockTransactions: Partial<PaymentTransaction>[] = [
      {
        transaction_type: 'income',
        category: 'Crop Sales',
        amount: 25000.00,
        currency: 'USD',
        description: 'Wheat harvest payment - Batch #2024-001',
        reference_number: 'WHT-2024-001',
        transaction_date: new Date().toISOString(),
        payment_method: {
          type: 'bank_account',
          provider: provider.name,
          account_identifier: '****1234'
        },
        external_id: `${provider.id}_txn_001`,
        metadata: {
          batch_number: '2024-001',
          crop_type: 'wheat',
          quantity_tons: 125
        }
      }
    ];

    return mockTransactions;
  }

  private static async evaluateRuleConditions(
    rule: ReconciliationRule,
    transaction: PaymentTransaction
  ): Promise<boolean> {
    for (const condition of rule.conditions) {
      const fieldValue = this.getFieldValue(transaction, condition.field);
      
      if (!this.evaluateCondition(fieldValue, condition)) {
        return false;
      }
    }
    return true;
  }

  private static async applyRuleActions(
    rule: ReconciliationRule,
    transaction: PaymentTransaction,
    sessionId: string
  ): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'categorize':
          await this.supabase
            .from('payment_transactions')
            .update({
              category: action.parameters.category,
              subcategory: action.parameters.subcategory
            })
            .eq('id', transaction.id);
          break;
        
        case 'auto_approve':
          await this.supabase
            .from('payment_transactions')
            .update({ status: 'reconciled' })
            .eq('id', transaction.id);
          break;
      }
    }
  }

  private static getFieldValue(transaction: PaymentTransaction, field: string): any {
    const parts = field.split('.');
    let value: any = transaction;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  private static evaluateCondition(
    fieldValue: any,
    condition: ReconciliationCondition
  ): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'starts_with':
        return String(fieldValue).startsWith(String(condition.value));
      case 'amount_range':
        const [min, max] = condition.value;
        return fieldValue >= min && fieldValue <= max;
      default:
        return false;
    }
  }
}

export interface ReconciliationSummary {
  session_id: string;
  total_transactions: number;
  matched_transactions: number;
  unmatched_transactions: number;
  total_discrepancies: number;
  critical_discrepancies: number;
  total_amount_processed: number;
  total_amount_matched: number;
  reconciliation_rate: number;
  generated_at: string;
}

export default PaymentReconciliationService;