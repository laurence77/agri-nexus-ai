import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import PaystackService, { PaystackWebhookEvent } from '@/services/payment/PaystackService';

interface WebhookHandlerResult {
  success: boolean;
  message: string;
  data?: any;
}

export class PaystackWebhookHandler {
  private paystackService: PaystackService;
  private secretKey: string;

  constructor() {
    this.paystackService = new PaystackService();
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
  }

  /**
   * Verify webhook signature
   */
  private verifySignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload, 'utf-8')
      .digest('hex');
    
    return hash === signature;
  }

  /**
   * Main webhook handler
   */
  async handleWebhook(request: NextRequest): Promise<NextResponse> {
    try {
      const signature = request.headers.get('x-paystack-signature');
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing signature header' },
          { status: 400 }
        );
      }

      const payload = await request.text();
      
      // Verify signature
      if (!this.verifySignature(payload, signature)) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }

      const event: PaystackWebhookEvent = JSON.parse(payload);
      
      console.log(`Processing webhook event: ${event.event}`, {
        reference: event.data.reference,
        status: event.data.status
      });

      let result: WebhookHandlerResult;

      // Route to appropriate handler based on event type
      switch (event.event) {
        case 'charge.success':
          result = await this.handleChargeSuccess(event);
          break;
        case 'charge.failed':
          result = await this.handleChargeFailed(event);
          break;
        case 'transfer.success':
          result = await this.handleTransferSuccess(event);
          break;
        case 'transfer.failed':
          result = await this.handleTransferFailed(event);
          break;
        case 'subscription.create':
          result = await this.handleSubscriptionCreate(event);
          break;
        case 'subscription.disable':
          result = await this.handleSubscriptionDisable(event);
          break;
        case 'invoice.create':
          result = await this.handleInvoiceCreate(event);
          break;
        case 'invoice.update':
          result = await this.handleInvoiceUpdate(event);
          break;
        case 'invoice.payment_failed':
          result = await this.handleInvoicePaymentFailed(event);
          break;
        case 'customeridentification.success':
          result = await this.handleCustomerIdentificationSuccess(event);
          break;
        case 'customeridentification.failed':
          result = await this.handleCustomerIdentificationFailed(event);
          break;
        default:
          console.warn(`Unhandled webhook event: ${event.event}`);
          result = { success: true, message: 'Event acknowledged but not processed' };
      }

      // Log the result
      if (result.success) {
        console.log(`Successfully processed ${event.event}:`, result.message);
      } else {
        console.error(`Failed to process ${event.event}:`, result.message);
      }

      return NextResponse.json(result);

    } catch (error) {
      console.error('Webhook processing error:', error);
      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }

  /**
   * Handle successful charge
   */
  private async handleChargeSuccess(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      const { data } = event;
      
      // Update transaction record
      await this.updateTransactionStatus({
        reference: data.reference,
        status: 'success',
        paidAt: new Date(data.paid_at),
        amount: data.amount,
        fees: data.fees,
        gateway_response: data.gateway_response,
        channel: data.channel,
        authorization: data.authorization
      });

      // Handle subscription-related payments
      if (data.metadata?.planId) {
        await this.handleSubscriptionPayment({
          customerId: data.customer.customer_code,
          planId: data.metadata.planId,
          reference: data.reference,
          amount: data.amount,
          authorization: data.authorization
        });
      }

      // Send receipt email
      await this.sendReceiptEmail({
        customerEmail: data.customer.email,
        customerName: `${data.customer.first_name} ${data.customer.last_name}`,
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        date: new Date(data.paid_at)
      });

      return {
        success: true,
        message: `Payment successful for reference: ${data.reference}`,
        data: { reference: data.reference, amount: data.amount }
      };

    } catch (error) {
      console.error('Error handling charge success:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process successful charge'
      };
    }
  }

  /**
   * Handle failed charge
   */
  private async handleChargeFailed(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      const { data } = event;
      
      // Update transaction record
      await this.updateTransactionStatus({
        reference: data.reference,
        status: 'failed',
        failedAt: new Date(data.created_at),
        gateway_response: data.gateway_response,
        channel: data.channel
      });

      // Send failure notification email
      await this.sendFailureNotification({
        customerEmail: data.customer.email,
        customerName: `${data.customer.first_name} ${data.customer.last_name}`,
        reference: data.reference,
        amount: data.amount,
        reason: data.gateway_response
      });

      // If this was a subscription payment, handle accordingly
      if (data.metadata?.planId) {
        await this.handleFailedSubscriptionPayment({
          customerId: data.customer.customer_code,
          reference: data.reference,
          reason: data.gateway_response
        });
      }

      return {
        success: true,
        message: `Payment failure processed for reference: ${data.reference}`,
        data: { reference: data.reference, reason: data.gateway_response }
      };

    } catch (error) {
      console.error('Error handling charge failure:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process failed charge'
      };
    }
  }

  /**
   * Handle subscription creation
   */
  private async handleSubscriptionCreate(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      const { data } = event;
      
      // Create subscription record in database
      await this.createSubscriptionRecord({
        subscriptionCode: data.subscription_code,
        customerCode: data.customer.customer_code,
        planCode: data.plan.plan_code,
        status: data.status,
        nextPaymentDate: data.next_payment_date,
        authorization: data.authorization
      });

      // Send welcome email
      await this.sendSubscriptionWelcomeEmail({
        customerEmail: data.customer.email,
        customerName: `${data.customer.first_name} ${data.customer.last_name}`,
        planName: data.plan.name,
        amount: data.plan.amount
      });

      return {
        success: true,
        message: `Subscription created: ${data.subscription_code}`,
        data: { subscriptionCode: data.subscription_code }
      };

    } catch (error) {
      console.error('Error handling subscription creation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process subscription creation'
      };
    }
  }

  /**
   * Handle subscription disable
   */
  private async handleSubscriptionDisable(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      const { data } = event;
      
      // Update subscription status
      await this.updateSubscriptionStatus({
        subscriptionCode: data.subscription_code,
        status: 'cancelled',
        cancelledAt: new Date()
      });

      // Send cancellation confirmation email
      await this.sendCancellationEmail({
        customerEmail: data.customer.email,
        customerName: `${data.customer.first_name} ${data.customer.last_name}`,
        subscriptionCode: data.subscription_code
      });

      return {
        success: true,
        message: `Subscription cancelled: ${data.subscription_code}`,
        data: { subscriptionCode: data.subscription_code }
      };

    } catch (error) {
      console.error('Error handling subscription disable:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process subscription cancellation'
      };
    }
  }

  /**
   * Handle invoice creation
   */
  private async handleInvoiceCreate(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      // Process invoice creation logic here
      return {
        success: true,
        message: 'Invoice creation processed'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process invoice creation'
      };
    }
  }

  /**
   * Handle invoice update
   */
  private async handleInvoiceUpdate(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      // Process invoice update logic here
      return {
        success: true,
        message: 'Invoice update processed'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process invoice update'
      };
    }
  }

  /**
   * Handle invoice payment failure
   */
  private async handleInvoicePaymentFailed(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      // Process invoice payment failure logic here
      return {
        success: true,
        message: 'Invoice payment failure processed'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process invoice payment failure'
      };
    }
  }

  /**
   * Handle transfer success
   */
  private async handleTransferSuccess(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      // Process transfer success logic here
      return {
        success: true,
        message: 'Transfer success processed'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process transfer success'
      };
    }
  }

  /**
   * Handle transfer failure
   */
  private async handleTransferFailed(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      // Process transfer failure logic here
      return {
        success: true,
        message: 'Transfer failure processed'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process transfer failure'
      };
    }
  }

  /**
   * Handle customer identification success
   */
  private async handleCustomerIdentificationSuccess(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      // Process customer identification success logic here
      return {
        success: true,
        message: 'Customer identification success processed'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process customer identification success'
      };
    }
  }

  /**
   * Handle customer identification failure
   */
  private async handleCustomerIdentificationFailed(event: PaystackWebhookEvent): Promise<WebhookHandlerResult> {
    try {
      // Process customer identification failure logic here
      return {
        success: true,
        message: 'Customer identification failure processed'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process customer identification failure'
      };
    }
  }

  // Helper methods (would need to implement based on your database structure)

  private async updateTransactionStatus(data: any): Promise<void> {
    // Update transaction status in your database
    console.log('Updating transaction status:', data);
    // Implementation depends on your database schema
  }

  private async handleSubscriptionPayment(data: any): Promise<void> {
    // Handle subscription-related payment logic
    console.log('Handling subscription payment:', data);
    // Implementation depends on your subscription logic
  }

  private async createSubscriptionRecord(data: any): Promise<void> {
    // Create subscription record in database
    console.log('Creating subscription record:', data);
    // Implementation depends on your database schema
  }

  private async updateSubscriptionStatus(data: any): Promise<void> {
    // Update subscription status
    console.log('Updating subscription status:', data);
    // Implementation depends on your database schema
  }

  private async handleFailedSubscriptionPayment(data: any): Promise<void> {
    // Handle failed subscription payment
    console.log('Handling failed subscription payment:', data);
    // Implementation depends on your business logic
  }

  // Email notification helpers

  private async sendReceiptEmail(data: {
    customerEmail: string;
    customerName: string;
    reference: string;
    amount: number;
    currency: string;
    date: Date;
  }): Promise<void> {
    // Send receipt email
    console.log('Sending receipt email:', data);
    // Implement email sending logic
  }

  private async sendFailureNotification(data: {
    customerEmail: string;
    customerName: string;
    reference: string;
    amount: number;
    reason: string;
  }): Promise<void> {
    // Send failure notification email
    console.log('Sending failure notification:', data);
    // Implement email sending logic
  }

  private async sendSubscriptionWelcomeEmail(data: {
    customerEmail: string;
    customerName: string;
    planName: string;
    amount: number;
  }): Promise<void> {
    // Send subscription welcome email
    console.log('Sending subscription welcome email:', data);
    // Implement email sending logic
  }

  private async sendCancellationEmail(data: {
    customerEmail: string;
    customerName: string;
    subscriptionCode: string;
  }): Promise<void> {
    // Send cancellation email
    console.log('Sending cancellation email:', data);
    // Implement email sending logic
  }
}

export default PaystackWebhookHandler;