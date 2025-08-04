import { NextApiRequest, NextApiResponse } from 'next';
import { walletService } from '@/services/billing/WalletService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint should be called by a cron job or scheduled task
  // Verify the request is authorized
  const authToken = req.headers.authorization;
  if (authToken !== `Bearer ${process.env.BILLING_CRON_TOKEN}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { action } = req.body;

    switch (action) {
      case 'process_invoices':
        await processAutomatedInvoices();
        break;
        
      case 'generate_usage_invoices':
        await generateUsageInvoices();
        break;
        
      case 'send_overdue_notifications':
        await sendOverdueNotifications();
        break;
        
      case 'cleanup_expired_data':
        await cleanupExpiredData();
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.status(200).json({ message: `${action} completed successfully` });

  } catch (error) {
    console.error('Automated billing error:', error);
    res.status(500).json({ 
      message: 'Automated billing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Process all pending invoices that should be auto-charged
 */
async function processAutomatedInvoices() {
  console.log('Processing automated invoices...');
  
  // Get all pending invoices that are due for auto-charging
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('status', 'pending')
    .eq('auto_charge', true)
    .lte('due_date', new Date().toISOString());

  if (error) {
    console.error('Error fetching invoices:', error);
    return;
  }

  let processedCount = 0;
  let failedCount = 0;

  for (const invoice of invoices || []) {
    try {
      await walletService.processInvoicePayment(invoice.id);
      processedCount++;
      
      console.log(`Processed invoice ${invoice.id} for ${invoice.amount} ${invoice.currency}`);
      
      // Add delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      failedCount++;
      console.error(`Failed to process invoice ${invoice.id}:`, error);
      
      // Create notification for failed payment
      await createPaymentFailureNotification(invoice, error as Error);
    }
  }

  console.log(`Invoice processing complete: ${processedCount} processed, ${failedCount} failed`);
}

/**
 * Generate usage-based invoices for all tenants
 */
async function generateUsageInvoices() {
  console.log('Generating usage invoices...');
  
  // Get all active tenants
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('id, name, billing_plan, admin_user_id')
    .eq('status', 'active')
    .neq('billing_plan', 'free'); // Skip free plans

  if (error) {
    console.error('Error fetching tenants:', error);
    return;
  }

  let generatedCount = 0;

  for (const tenant of tenants || []) {
    try {
      // Check if invoice already generated for this period
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('invoice_type', 'usage')
        .gte('created_at', `${currentMonth}-01`)
        .single();

      if (existingInvoice) {
        console.log(`Usage invoice already exists for tenant ${tenant.id}`);
        continue;
      }

      // Generate usage invoice
      const invoice = await walletService.generateUsageInvoice(tenant.id, 'monthly');
      generatedCount++;
      
      console.log(`Generated usage invoice for tenant ${tenant.name}: ${invoice.amount} ${invoice.currency}`);
      
    } catch (error) {
      console.error(`Failed to generate invoice for tenant ${tenant.id}:`, error);
    }
  }

  console.log(`Usage invoice generation complete: ${generatedCount} invoices generated`);
}

/**
 * Send notifications for overdue invoices
 */
async function sendOverdueNotifications() {
  console.log('Sending overdue notifications...');
  
  // Get overdue invoices without recent notifications
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: overdueInvoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      recipient:profiles(*),
      tenant:tenants(*)
    `)
    .eq('status', 'overdue')
    .lt('due_date', threeDaysAgo);

  if (error) {
    console.error('Error fetching overdue invoices:', error);
    return;
  }

  for (const invoice of overdueInvoices || []) {
    try {
      // Check if notification was sent recently
      const { data: recentNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', invoice.recipient_id)
        .eq('type', 'overdue_invoice')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (recentNotification) {
        continue; // Skip if notification sent in last 24 hours
      }

      // Create overdue notification
      await supabase
        .from('notifications')
        .insert({
          tenant_id: invoice.tenant_id,
          user_id: invoice.recipient_id,
          title: 'Overdue Invoice Reminder',
          message: `Your invoice of ${invoice.currency} ${invoice.amount} is overdue. Please pay to avoid service interruption.`,
          type: 'overdue_invoice',
          metadata: {
            invoice_id: invoice.id,
            amount: invoice.amount,
            currency: invoice.currency,
            days_overdue: Math.ceil((Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))
          }
        });

      console.log(`Sent overdue notification for invoice ${invoice.id}`);
      
    } catch (error) {
      console.error(`Failed to send notification for invoice ${invoice.id}:`, error);
    }
  }

  console.log('Overdue notifications complete');
}

/**
 * Cleanup expired data and old records
 */
async function cleanupExpiredData() {
  console.log('Starting data cleanup...');
  
  try {
    // Clean up old wallet transactions (keep 6 months)
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error: cleanupError } = await supabase
      .from('wallet_transactions')
      .delete()
      .eq('status', 'completed')
      .lt('created_at', sixMonthsAgo);

    if (cleanupError) {
      console.error('Error cleaning up wallet transactions:', cleanupError);
    } else {
      console.log('Cleaned up old wallet transactions');
    }

    // Clean up old notifications (keep 3 months)
    const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error: notificationCleanupError } = await supabase
      .from('notifications')
      .delete()
      .eq('read', true)
      .lt('created_at', threeMonthsAgo);

    if (notificationCleanupError) {
      console.error('Error cleaning up notifications:', notificationCleanupError);
    } else {
      console.log('Cleaned up old notifications');
    }

    // Archive old invoices (keep 2 years, but mark as archived)
    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error: archiveError } = await supabase
      .from('invoices')
      .update({ status: 'archived' })
      .in('status', ['paid', 'cancelled'])
      .lt('created_at', twoYearsAgo);

    if (archiveError) {
      console.error('Error archiving old invoices:', archiveError);
    } else {
      console.log('Archived old invoices');
    }

  } catch (error) {
    console.error('Data cleanup error:', error);
  }

  console.log('Data cleanup complete');
}

/**
 * Create notification for payment failure
 */
async function createPaymentFailureNotification(invoice: any, error: Error) {
  try {
    await supabase
      .from('notifications')
      .insert({
        tenant_id: invoice.tenant_id,
        user_id: invoice.recipient_id,
        title: 'Payment Failed',
        message: `Auto-payment failed for your invoice of ${invoice.currency} ${invoice.amount}. Please top up your wallet or pay manually.`,
        type: 'payment_failed',
        metadata: {
          invoice_id: invoice.id,
          amount: invoice.amount,
          currency: invoice.currency,
          error_message: error.message
        }
      });
  } catch (notificationError) {
    console.error('Failed to create payment failure notification:', notificationError);
  }
}