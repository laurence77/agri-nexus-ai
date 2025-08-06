/**
 * Digital Wallet Service for AgriNexus Platform
 * Handles wallet management, transactions, automated billing, and farm credit
 */

import { supabase } from '@/lib/supabase';
import { mobileMoneyService } from '../payments/MobileMoneyService';

export interface Wallet {
  id: string;
  tenant_id: string;
  user_id: string;
  balance: number;
  currency: string;
  credit_limit: number;
  available_credit: number;
  status: 'active' | 'suspended' | 'frozen';
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'credit_disbursement' | 'credit_repayment';
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
  created_at: string;
  processed_at?: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  recipient_id: string;
  amount: number;
  currency: string;
  invoice_type: 'subscription' | 'usage' | 'input_purchase' | 'equipment_rental' | 'labor_payment' | 'credit_payment';
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  line_items: InvoiceLineItem[];
  payment_terms: number; // days
  auto_charge: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  paid_at?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  item_type: string;
}

export interface CreditApplication {
  id: string;
  tenant_id: string;
  applicant_id: string;
  amount_requested: number;
  currency: string;
  purpose: 'input_purchase' | 'equipment' | 'land_preparation' | 'planting' | 'fertilizers' | 'harvesting' | 'emergency';
  farm_size_hectares: number;
  crop_type: string;
  expected_harvest_date: string;
  collateral_type?: string;
  collateral_value?: number;
  guarantor_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid';
  interest_rate: number;
  repayment_period_months: number;
  assessment_score?: number;
  approved_amount?: number;
  created_at: string;
  processed_at?: string;
}

class WalletService {
  /**
   * Create a new wallet for a user
   */
  async createWallet(
    tenantId: string,
    userId: string,
    currency: string = 'KES',
    initialCredit: number = 0
  ): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        balance: 0,
        currency,
        credit_limit: initialCredit,
        available_credit: initialCredit,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create wallet: ${error.message}`);
    // Provenance recording
    const { ProvenanceService } = await import('@/lib/provenance');
    await ProvenanceService.recordRecordChanges('wallets', data.id, {
      tenant_id: { newValue: tenantId },
      user_id: { newValue: userId },
      balance: { newValue: 0 },
      currency: { newValue: currency },
      credit_limit: { newValue: initialCredit },
      available_credit: { newValue: initialCredit },
      status: { newValue: 'active' }
    }, { source: 'system', entered_by: userId, timestamp: new Date().toISOString() });
    return data;
  }

  /**
   * Get wallet for a user
   */
  async getWallet(userId: string, tenantId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch wallet: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Get or create wallet for user
   */
  async ensureWallet(userId: string, tenantId: string, currency: string = 'KES'): Promise<Wallet> {
    let wallet = await this.getWallet(userId, tenantId);
    
    if (!wallet) {
      wallet = await this.createWallet(tenantId, userId, currency);
    }

    return wallet;
  }

  /**
   * Add funds to wallet via mobile money
   */
  async topUpWallet(
    walletId: string,
    amount: number,
    phoneNumber: string,
    country: string = 'KE'
  ): Promise<WalletTransaction> {
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (walletError) throw new Error(`Wallet not found: ${walletError.message}`);

    // Create pending transaction
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        transaction_type: 'deposit',
        amount,
        currency: wallet.currency,
        description: `Wallet top-up via mobile money`,
        reference: `TOPUP_${Date.now()}`,
        status: 'pending',
        metadata: {
          phone_number: phoneNumber,
          country,
          payment_method: 'mobile_money'
        }
      })
      .select()
      .single();

    if (txError) throw new Error(`Failed to create transaction: ${txError.message}`);

    try {
      // Initiate mobile money payment
      const paymentResponse = await mobileMoneyService.initiatePayment({
        amount,
        currency: wallet.currency,
        phoneNumber,
        country,
        description: 'AgriNexus Wallet Top-up',
        reference: transaction.reference,
        metadata: {
          walletId,
          transactionId: transaction.id,
          transactionType: 'wallet_topup'
        }
      });

      // Update transaction with payment details
      await supabase
        .from('wallet_transactions')
        .update({
          metadata: {
            ...transaction.metadata,
            payment_transaction_id: paymentResponse.transactionId,
            provider: paymentResponse.provider
          }
        })
        .eq('id', transaction.id);

      // Provenance recording
      const { ProvenanceService } = await import('@/lib/provenance');
      await ProvenanceService.recordRecordChanges('wallet_transactions', transaction.id, {
        wallet_id: { newValue: walletId },
        transaction_type: { newValue: 'deposit' },
        amount: { newValue: amount },
        currency: { newValue: wallet.currency },
        description: { newValue: `Wallet top-up via mobile money` },
        reference: { newValue: transaction.reference },
        status: { newValue: 'pending' },
        metadata: { newValue: JSON.stringify(transaction.metadata) }
      }, { source: 'system', entered_by: wallet.user_id, timestamp: new Date().toISOString() });
      return { ...transaction, metadata: { ...transaction.metadata, payment_transaction_id: paymentResponse.transactionId } };

    } catch (error) {
      // Mark transaction as failed
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      throw error;
    }
  }

  /**
   * Process wallet transaction completion (called by webhook)
   */
  async completeWalletTransaction(transactionId: string): Promise<void> {
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*, wallet:wallets(*)')
      .eq('id', transactionId)
      .single();

    if (txError) throw new Error(`Transaction not found: ${txError.message}`);

    if (transaction.status !== 'pending') {
      return; // Already processed
    }

    // Update wallet balance
    const newBalance = transaction.wallet.balance + transaction.amount;
    
    const { error: walletUpdateError } = await supabase
      .from('wallets')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.wallet_id);

    if (walletUpdateError) throw new Error(`Failed to update wallet: ${walletUpdateError.message}`);

    // Mark transaction as completed
    const { error: txUpdateError } = await supabase
      .from('wallet_transactions')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (txUpdateError) throw new Error(`Failed to update transaction: ${txUpdateError.message}`);
    // Provenance recording
    const { ProvenanceService } = await import('@/lib/provenance');
    await ProvenanceService.recordRecordChanges('wallet_transactions', transactionId, {
      status: { newValue: 'completed' },
      processed_at: { newValue: new Date().toISOString() }
    }, { source: 'system', entered_by: transaction.wallet.user_id, timestamp: new Date().toISOString() });
  }

  /**
   * Make payment from wallet
   */
  async makePayment(
    walletId: string,
    amount: number,
    description: string,
    reference: string,
    metadata: Record<string, any> = {}
  ): Promise<WalletTransaction> {
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (walletError) throw new Error(`Wallet not found: ${walletError.message}`);

    const totalAvailable = wallet.balance + wallet.available_credit;
    
    if (amount > totalAvailable) {
      throw new Error(`Insufficient funds. Available: ${totalAvailable}, Required: ${amount}`);
    }

    // Create payment transaction
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        transaction_type: 'payment',
        amount: -amount, // Negative for debit
        currency: wallet.currency,
        description,
        reference,
        status: 'completed',
        metadata,
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (txError) throw new Error(`Failed to create payment: ${txError.message}`);

    // Update wallet balance
    let newBalance = wallet.balance;
    let newAvailableCredit = wallet.available_credit;

    if (amount <= wallet.balance) {
      // Pay from balance
      newBalance = wallet.balance - amount;
    } else {
      // Pay from balance + credit
      const creditUsed = amount - wallet.balance;
      newBalance = 0;
      newAvailableCredit = wallet.available_credit - creditUsed;
    }

    const { error: walletUpdateError } = await supabase
      .from('wallets')
      .update({
        balance: newBalance,
        available_credit: newAvailableCredit,
        updated_at: new Date().toISOString()
      })
      .eq('id', walletId);

    if (walletUpdateError) throw new Error(`Failed to update wallet: ${walletUpdateError.message}`);
    // Provenance recording
    const { ProvenanceService } = await import('@/lib/provenance');
    await ProvenanceService.recordRecordChanges('wallet_transactions', transaction.id, {
      wallet_id: { newValue: walletId },
      transaction_type: { newValue: 'payment' },
      amount: { newValue: -amount },
      currency: { newValue: wallet.currency },
      description: { newValue: description },
      reference: { newValue: reference },
      status: { newValue: 'completed' },
      metadata: { newValue: JSON.stringify(metadata) }
    }, { source: 'system', entered_by: wallet.user_id, timestamp: new Date().toISOString() });
    return transaction;
  }

  /**
   * Get wallet transaction history
   */
  async getTransactionHistory(
    walletId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<WalletTransaction[]> {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);
    return data || [];
  }

  /**
   * Create invoice
   */
  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'status'>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...invoice,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create invoice: ${error.message}`);

    return data;
  }

  /**
   * Process automated invoice payment
   */
  async processInvoicePayment(invoiceId: string): Promise<void> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, recipient:profiles(*)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw new Error(`Invoice not found: ${invoiceError.message}`);

    if (invoice.status !== 'pending') {
      return; // Already processed
    }

    // Get recipient's wallet
    const wallet = await this.getWallet(invoice.recipient_id, invoice.tenant_id);
    if (!wallet) {
      throw new Error('Recipient wallet not found');
    }

    try {
      // Make payment from wallet
      await this.makePayment(
        wallet.id,
        invoice.amount,
        `Invoice payment: ${invoice.invoice_type}`,
        `INV_${invoice.id}`,
        {
          invoice_id: invoiceId,
          invoice_type: invoice.invoice_type,
          auto_charged: invoice.auto_charge
        }
      );

      // Mark invoice as paid
      await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
      // Provenance recording
      const { ProvenanceService } = await import('@/lib/provenance');
      await ProvenanceService.recordRecordChanges('invoices', invoiceId, {
        status: { newValue: 'paid' },
        paid_at: { newValue: new Date().toISOString() }
      }, { source: 'system', entered_by: invoice.recipient_id, timestamp: new Date().toISOString() });
    } catch (error) {
      // Mark invoice as overdue if payment failed
      await supabase
        .from('invoices')
        .update({ status: 'overdue' })
        .eq('id', invoiceId);

      throw error;
    }
  }

  /**
   * Apply for farm credit
   */
  async applyCreditApplication(application: Omit<CreditApplication, 'id' | 'created_at' | 'status' | 'assessment_score'>): Promise<CreditApplication> {
    const { data, error } = await supabase
      .from('credit_applications')
      .insert({
        ...application,
        status: 'pending',
        assessment_score: await this.calculateCreditScore(application)
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create credit application: ${error.message}`);

    return data;
  }

  /**
   * Calculate credit score based on farmer data
   */
  private async calculateCreditScore(application: Partial<CreditApplication>): Promise<number> {
    let score = 0;

    // Base score factors
    if (application.farm_size_hectares) {
      score += Math.min(application.farm_size_hectares * 10, 100); // Up to 100 points for farm size
    }

    if (application.collateral_value && application.amount_requested) {
      const collateralRatio = application.collateral_value / application.amount_requested;
      score += Math.min(collateralRatio * 50, 100); // Up to 100 points for collateral
    }

    if (application.guarantor_id) {
      score += 50; // Bonus for having guarantor
    }

    // Historical data (if available)
    if (application.applicant_id && application.tenant_id) {
      const { data: history } = await supabase
        .from('credit_applications')
        .select('status')
        .eq('applicant_id', application.applicant_id)
        .eq('tenant_id', application.tenant_id);

      if (history && history.length > 0) {
        const repaidLoans = history.filter(h => h.status === 'repaid').length;
        const totalLoans = history.length;
        const repaymentRate = repaidLoans / totalLoans;
        score += repaymentRate * 100; // Up to 100 points for good history
      }
    }

    return Math.min(Math.max(score, 0), 500); // Score between 0-500
  }

  /**
   * Process credit disbursement
   */
  async disburseCreditApplication(applicationId: string, approvedAmount: number): Promise<void> {
    const { data: application, error: appError } = await supabase
      .from('credit_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError) throw new Error(`Application not found: ${appError.message}`);

    // Get applicant's wallet
    const wallet = await this.ensureWallet(
      application.applicant_id,
      application.tenant_id,
      application.currency
    );

    // Update credit limit
    const newCreditLimit = wallet.credit_limit + approvedAmount;
    const newAvailableCredit = wallet.available_credit + approvedAmount;

    const { error: walletError } = await supabase
      .from('wallets')
      .update({
        credit_limit: newCreditLimit,
        available_credit: newAvailableCredit,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (walletError) throw new Error(`Failed to update wallet: ${walletError.message}`);

    // Create credit disbursement transaction
    await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        transaction_type: 'credit_disbursement',
        amount: 0, // Credit doesn't affect balance, only available credit
        currency: wallet.currency,
        description: `Credit disbursement - ${application.purpose}`,
        reference: `CREDIT_${applicationId}`,
        status: 'completed',
        metadata: {
          credit_amount: approvedAmount,
          purpose: application.purpose,
          application_id: applicationId
        },
        processed_at: new Date().toISOString()
      });

    // Update application status
    await supabase
      .from('credit_applications')
      .update({
        status: 'disbursed',
        approved_amount: approvedAmount,
        processed_at: new Date().toISOString()
      })
      .eq('id', applicationId);
  }

  /**
   * Process automated billing for subscriptions and usage
   */
  async processAutomatedBilling(): Promise<void> {
    // Get all pending invoices that should be auto-charged
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'pending')
      .eq('auto_charge', true)
      .lte('due_date', new Date().toISOString());

    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);

    for (const invoice of invoices || []) {
      try {
        await this.processInvoicePayment(invoice.id);
      } catch (error) {
        console.error(`Failed to process invoice ${invoice.id}:`, error);
      }
    }
  }

  /**
   * Generate usage-based invoice for tenant
   */
  async generateUsageInvoice(tenantId: string, period: string = 'monthly'): Promise<Invoice> {
    // Get usage data for the period
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*, field:fields(*)')
      .eq('tenant_id', tenantId)
      .gte('date', this.getPeriodStart(period))
      .lt('date', this.getPeriodEnd(period));

    if (activitiesError) throw new Error(`Failed to fetch activities: ${activitiesError.message}`);

    // Calculate line items based on usage
    const lineItems: InvoiceLineItem[] = [];
    
    // API calls
    const apiCalls = activities?.length || 0;
    if (apiCalls > 1000) { // Free tier: 1000 calls
      const billableApiCalls = apiCalls - 1000;
      lineItems.push({
        description: 'API Calls (excess)',
        quantity: billableApiCalls,
        unit_price: 0.01, // $0.01 per call
        total: billableApiCalls * 0.01,
        item_type: 'api_usage'
      });
    }

    // Storage usage (simplified)
    const storageUsage = Math.ceil((activities?.length || 0) / 100); // MB estimate
    if (storageUsage > 100) { // Free tier: 100MB
      const billableStorage = storageUsage - 100;
      lineItems.push({
        description: 'Data Storage (excess MB)',
        quantity: billableStorage,
        unit_price: 0.10, // $0.10 per MB
        total: billableStorage * 0.10,
        item_type: 'storage_usage'
      });
    }

    if (lineItems.length === 0) {
      throw new Error('No billable usage found for period');
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

    // Get tenant admin for billing
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('admin_user_id')
      .eq('id', tenantId)
      .single();

    if (tenantError) throw new Error(`Tenant not found: ${tenantError.message}`);

    return await this.createInvoice({
      tenant_id: tenantId,
      recipient_id: tenant.admin_user_id,
      amount: totalAmount,
      currency: 'USD',
      invoice_type: 'usage',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      line_items: lineItems,
      payment_terms: 7,
      auto_charge: true,
      metadata: {
        period,
        billing_cycle: 'usage_based',
        activities_count: apiCalls,
        storage_mb: storageUsage
      }
    });
  }

  /**
   * Helper methods for date calculations
   */
  private getPeriodStart(period: string): string {
    const now = new Date();
    if (period === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
    // Default to start of current day
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  }

  private getPeriodEnd(period: string): string {
    const now = new Date();
    if (period === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    }
    // Default to end of current day
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  }
}

export const walletService = new WalletService();
export default walletService;