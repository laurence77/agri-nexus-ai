import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client with service role key for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface KorapayWebhookPayload {
  event: 'charge.success' | 'charge.failed' | 'transfer.success' | 'transfer.failed';
  data: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    channel: string;
    channel_reference?: string;
    fee: number;
    customer: {
      name: string;
      email: string;
    };
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-korapay-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const webhookData: KorapayWebhookPayload = req.body;
    
    console.log('Korapay webhook received:', {
      event: webhookData.event,
      reference: webhookData.data.reference,
      status: webhookData.data.status
    });

    // Process the webhook based on event type
    switch (webhookData.event) {
      case 'charge.success':
        await handleSuccessfulPayment(webhookData.data);
        break;
        
      case 'charge.failed':
        await handleFailedPayment(webhookData.data);
        break;
        
      case 'transfer.success':
        await handleSuccessfulPayout(webhookData.data);
        break;
        
      case 'transfer.failed':
        await handleFailedPayout(webhookData.data);
        break;
        
      default:
        console.log('Unhandled webhook event:', webhookData.event);
    }

    // Acknowledge receipt
    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ 
      message: 'Webhook processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!signature || !process.env.KORAPAY_WEBHOOK_SECRET) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.KORAPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function handleSuccessfulPayment(data: KorapayWebhookPayload['data']) {
  try {
    // Update transaction status in database
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        provider_response: data,
        metadata: {
          ...data.metadata,
          channel_reference: data.channel_reference,
          fee: data.fee,
          processed_via: 'webhook'
        }
      })
      .eq('external_transaction_id', data.reference);

    if (updateError) {
      throw new Error(`Failed to update transaction: ${updateError.message}`);
    }

    // Get transaction details to determine next actions
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        payer:profiles!transactions_payer_id_fkey(*)
      `)
      .eq('external_transaction_id', data.reference)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch transaction: ${fetchError.message}`);
    }

    // Perform post-payment actions based on transaction type
    await performPostPaymentActions(transaction, data);

    console.log('Payment processed successfully:', data.reference);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    
    // Log the error but don't throw - we don't want to retry webhooks for processing errors
    await supabase
      .from('webhook_logs')
      .insert({
        event_type: 'charge.success',
        reference: data.reference,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        payload: data
      });
  }
}

async function handleFailedPayment(data: KorapayWebhookPayload['data']) {
  try {
    // Update transaction status
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'failed',
        provider_response: data,
        metadata: {
          ...data.metadata,
          failure_reason: data.status,
          processed_via: 'webhook'
        }
      })
      .eq('external_transaction_id', data.reference);

    if (error) {
      throw new Error(`Failed to update failed transaction: ${error.message}`);
    }

    // TODO: Send notification to user about failed payment
    // TODO: Trigger retry logic if applicable

    console.log('Failed payment processed:', data.reference);

  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handleSuccessfulPayout(data: KorapayWebhookPayload['data']) {
  try {
    // Update payout transaction status
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        provider_response: data
      })
      .eq('external_transaction_id', data.reference);

    if (error) {
      throw new Error(`Failed to update payout transaction: ${error.message}`);
    }

    // TODO: Send notification to recipient about successful payout
    console.log('Payout processed successfully:', data.reference);

  } catch (error) {
    console.error('Error handling successful payout:', error);
  }
}

async function handleFailedPayout(data: KorapayWebhookPayload['data']) {
  try {
    // Update payout transaction status
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'failed',
        provider_response: data
      })
      .eq('external_transaction_id', data.reference);

    if (error) {
      throw new Error(`Failed to update failed payout: ${error.message}`);
    }

    // TODO: Handle failed payout - notify admin, retry logic, etc.
    console.log('Failed payout processed:', data.reference);

  } catch (error) {
    console.error('Error handling failed payout:', error);
  }
}

async function performPostPaymentActions(
  transaction: any, 
  paymentData: KorapayWebhookPayload['data']
) {
  try {
    const transactionType = transaction.transaction_type;
    const metadata = transaction.metadata || {};

    switch (transactionType) {
      case 'input_purchase':
        await handleInputPurchasePayment(transaction, metadata);
        break;
        
      case 'equipment_rental':
        await handleEquipmentRentalPayment(transaction, metadata);
        break;
        
      case 'labor_payment':
        await handleLaborPayment(transaction, metadata);
        break;
        
      case 'loan_payment':
        await handleLoanPayment(transaction, metadata);
        break;
        
      case 'insurance_payment':
        await handleInsurancePayment(transaction, metadata);
        break;
        
      default:
        console.log('No specific post-payment action for:', transactionType);
    }

    // Send success notification to user
    await sendPaymentNotification(transaction, 'success');

  } catch (error) {
    console.error('Error in post-payment actions:', error);
  }
}

async function handleInputPurchasePayment(transaction: any, metadata: any) {
  // Create inventory reservation or order
  if (metadata.order_id) {
    await supabase
      .from('orders')
      .update({ payment_status: 'completed' })
      .eq('id', metadata.order_id);
  }
}

async function handleEquipmentRentalPayment(transaction: any, metadata: any) {
  // Update equipment rental booking
  if (metadata.rental_id) {
    await supabase
      .from('equipment_rentals')
      .update({ payment_status: 'completed' })
      .eq('id', metadata.rental_id);
  }
}

async function handleLaborPayment(transaction: any, metadata: any) {
  // Update worker payment status
  if (metadata.worker_id && metadata.period) {
    await supabase
      .from('worker_payments')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('worker_id', metadata.worker_id)
      .eq('period', metadata.period);
  }
}

async function handleLoanPayment(transaction: any, metadata: any) {
  // Update credit account balance
  if (metadata.credit_account_id) {
    const { data: account } = await supabase
      .from('credit_accounts')
      .select('current_balance')
      .eq('id', metadata.credit_account_id)
      .single();

    if (account) {
      const newBalance = account.current_balance - transaction.amount;
      
      await supabase
        .from('credit_accounts')
        .update({ current_balance: Math.max(0, newBalance) })
        .eq('id', metadata.credit_account_id);
    }
  }
}

async function handleInsurancePayment(transaction: any, metadata: any) {
  // Update insurance policy status
  if (metadata.policy_id) {
    await supabase
      .from('insurance_policies')
      .update({ 
        status: 'active',
        last_payment_date: new Date().toISOString()
      })
      .eq('id', metadata.policy_id);
  }
}

async function sendPaymentNotification(transaction: any, status: 'success' | 'failed') {
  try {
    // Create notification record
    await supabase
      .from('notifications')
      .insert({
        user_id: transaction.payer_id,
        title: status === 'success' ? 'Payment Successful' : 'Payment Failed',
        message: status === 'success' 
          ? `Your payment of ${transaction.currency} ${transaction.amount} was processed successfully.`
          : `Your payment of ${transaction.currency} ${transaction.amount} failed. Please try again.`,
        type: status === 'success' ? 'success' : 'error',
        metadata: {
          transaction_id: transaction.id,
          reference: transaction.external_transaction_id,
          amount: transaction.amount,
          currency: transaction.currency
        }
      });

    // TODO: Send SMS/email notification
    // TODO: Send push notification if user has mobile app

  } catch (error) {
    console.error('Error sending payment notification:', error);
  }
}