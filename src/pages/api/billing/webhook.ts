import { NextApiRequest, NextApiResponse } from 'next';
import { walletService } from '@/services/billing/WalletService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    console.log('Billing webhook received:', { type, reference: data?.reference });

    switch (type) {
      case 'payment.completed':
        await handlePaymentCompleted(data);
        break;
        
      case 'wallet.topup':
        await handleWalletTopUp(data);
        break;
        
      case 'invoice.due':
        await handleInvoiceDue(data);
        break;
        
      case 'credit.application':
        await handleCreditApplication(data);
        break;
        
      default:
        console.log('Unhandled billing webhook type:', type);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Billing webhook processing error:', error);
    res.status(500).json({ 
      message: 'Webhook processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handlePaymentCompleted(data: any) {
  try {
    const { transactionId, reference, metadata } = data;

    // Check if this is a wallet top-up
    if (metadata?.transactionType === 'wallet_topup' && metadata?.walletId) {
      // Find the wallet transaction by reference
      const { data: walletTx, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('reference', reference)
        .eq('status', 'pending')
        .single();

      if (walletTx && !error) {
        await walletService.completeWalletTransaction(walletTx.id);
      }
    }

    // Handle other payment types
    if (metadata?.transactionType === 'input_purchase') {
      // Input purchase completed - handled by main payment webhook
      console.log('Input purchase payment completed:', reference);
    }

    if (metadata?.transactionType === 'equipment_rental') {
      // Equipment rental payment completed
      await supabase
        .from('equipment_rentals')
        .update({ payment_status: 'completed' })
        .eq('payment_reference', reference);
    }

  } catch (error) {
    console.error('Error handling payment completion:', error);
    throw error;
  }
}

async function handleWalletTopUp(data: any) {
  try {
    const { walletId, amount, currency, reference } = data;

    // Create wallet transaction record
    await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        transaction_type: 'deposit',
        amount,
        currency,
        description: 'Wallet top-up via mobile money',
        reference,
        status: 'completed',
        processed_at: new Date().toISOString(),
        metadata: {
          processed_via: 'webhook',
          source: 'mobile_money'
        }
      });

    // Update wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', walletId)
      .single();

    if (walletError) throw walletError;

    await supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', walletId);

    console.log('Wallet top-up processed:', { walletId, amount });

  } catch (error) {
    console.error('Error handling wallet top-up:', error);
    throw error;
  }
}

async function handleInvoiceDue(data: any) {
  try {
    const { invoiceId } = data;

    // Process automated invoice payment
    await walletService.processInvoicePayment(invoiceId);

    console.log('Invoice payment processed:', invoiceId);

  } catch (error) {
    console.error('Error processing invoice payment:', error);
    
    // Mark invoice as overdue if payment failed
    await supabase
      .from('invoices')
      .update({ 
        status: 'overdue',
        metadata: {
          auto_payment_failed: true,
          failure_reason: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      .eq('id', data.invoiceId);
  }
}

async function handleCreditApplication(data: any) {
  try {
    const { applicationId, action, approvedAmount } = data;

    if (action === 'approve' && approvedAmount) {
      await walletService.disburseCreditApplication(applicationId, approvedAmount);
      console.log('Credit application disbursed:', { applicationId, approvedAmount });
    }

    if (action === 'reject') {
      await supabase
        .from('credit_applications')
        .update({ 
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      console.log('Credit application rejected:', applicationId);
    }

  } catch (error) {
    console.error('Error handling credit application:', error);
    throw error;
  }
}