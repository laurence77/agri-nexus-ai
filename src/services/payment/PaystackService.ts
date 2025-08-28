interface PaystackConfig {
  publicKey: string;
  apiBase: string; // our server base, e.g., http://localhost:3001
}

interface PaystackCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  metadata?: Record<string, any>;
}

interface PaystackTransaction {
  email: string;
  amount: number; // Amount in kobo (multiply by 100)
  currency?: string;
  reference?: string;
  callback_url?: string;
  plan?: string;
  invoice_limit?: number;
  metadata?: Record<string, any>;
  channels?: string[];
  split_code?: string;
  subaccount?: string;
  transaction_charge?: number;
  bearer?: 'account' | 'subaccount';
}

interface PaystackPlan {
  name: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'biannually' | 'annually';
  amount: number; // Amount in kobo
  description?: string;
  send_invoices?: boolean;
  send_sms?: boolean;
  currency?: string;
  invoice_limit?: number;
}

interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: Record<string, any>;
      risk_action: string;
      international_format_phone: string | null;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

export class PaystackService {
  private config: PaystackConfig;

  constructor() {
    this.config = {
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
      apiBase: import.meta.env.VITE_API_BASE_URL || '/api'
    };
    if (!this.config.publicKey) {
      console.warn('VITE_PAYSTACK_PUBLIC_KEY is not set. Paystack popup may fail to initialize.');
    }
  }

  /**
   * Initialize Paystack payment
   */
  async initializeTransaction(transaction: PaystackTransaction): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiBase}/payments/paystack/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transaction,
          reference: transaction.reference || this.generateReference(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize transaction');
      }

      return data;
    } catch (error) {
      console.error('Error initializing Paystack transaction:', error);
      throw error;
    }
  }

  /**
   * Verify transaction
   */
  async verifyTransaction(reference: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiBase}/payments/paystack/verify/${reference}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify transaction');
      }

      return data;
    } catch (error) {
      console.error('Error verifying Paystack transaction:', error);
      throw error;
    }
  }

  /**
   * Create customer
   */
  async createCustomer(customer: PaystackCustomer): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiBase}/payments/paystack/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create customer');
      }

      return data;
    } catch (error) {
      console.error('Error creating Paystack customer:', error);
      throw error;
    }
  }

  /**
   * Get customer by email or code
   */
  async getCustomer(emailOrCode: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiBase}/payments/paystack/customer/${emailOrCode}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get customer');
      }

      return data;
    } catch (error) {
      console.error('Error getting Paystack customer:', error);
      throw error;
    }
  }

  /**
   * Create subscription plan
   */
  async createPlan(plan: PaystackPlan): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiBase}/payments/paystack/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create plan');
      }

      return data;
    } catch (error) {
      console.error('Error creating Paystack plan:', error);
      throw error;
    }
  }

  /**
   * Get all plans
   */
  async getPlans(): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiBase}/payments/paystack/plan`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get plans');
      }

      return data;
    } catch (error) {
      console.error('Error getting Paystack plans:', error);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(customerCode: string, planCode: string, authorization?: string): Promise<any> {
    try {
      const subscriptionData: any = {
        customer: customerCode,
        plan: planCode,
      };

      if (authorization) {
        subscriptionData.authorization = authorization;
      }

      const response = await fetch(`${this.config.apiBase}/payments/paystack/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      return data;
    } catch (error) {
      console.error('Error creating Paystack subscription:', error);
      throw error;
    }
  }

  /**
   * Get customer subscriptions
   */
  async getCustomerSubscriptions(customerCode: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiBase}/payments/paystack/subscription?customer=${customerCode}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get subscriptions');
      }

      return data;
    } catch (error) {
      console.error('Error getting customer subscriptions:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionCode: string, token: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/subscription/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: subscriptionCode,
          token: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      return data;
    } catch (error) {
      console.error('Error canceling Paystack subscription:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(params?: {
    page?: number;
    perPage?: number;
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
      if (params?.customer) queryParams.append('customer', params.customer);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.from) queryParams.append('from', params.from);
      if (params?.to) queryParams.append('to', params.to);

      const response = await fetch(`${this.config.baseUrl}/transaction?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get transactions');
      }

      return data;
    } catch (error) {
      console.error('Error getting Paystack transactions:', error);
      throw error;
    }
  }

  /**
   * Refund transaction
   */
  async refundTransaction(transactionId: string, amount?: number): Promise<any> {
    try {
      const refundData: any = {
        transaction: transactionId,
      };

      if (amount) {
        refundData.amount = amount;
      }

      const response = await fetch(`${this.config.baseUrl}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process refund');
      }

      return data;
    } catch (error) {
      console.error('Error processing Paystack refund:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    console.warn('verifyWebhookSignature should be handled server-side.');
    return false;
  }

  /**
   * Generate unique reference
   */
  private generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `agri_${timestamp}_${random}`;
  }

  /**
   * Convert amount to kobo (Paystack uses kobo for NGN)
   */
  static toKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert amount from kobo to naira
   */
  static fromKobo(amount: number): number {
    return amount / 100;
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'NGN'): string {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(amount);
  }

  /**
   * Get payment status color for UI
   */
  static getPaymentStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Initialize Paystack popup for frontend
   */
  static initializePaystackPopup(config: {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    callback: (response: any) => void;
    onClose?: () => void;
    metadata?: Record<string, any>;
    channels?: string[];
  }): void {
    // This would be used in the frontend with Paystack's JavaScript SDK
    if (typeof window !== 'undefined' && (window as any).PaystackPop) {
      const handler = (window as any).PaystackPop.setup({
        key: config.key,
        email: config.email,
        amount: config.amount,
        currency: config.currency || 'NGN',
        ref: config.ref || new Date().getTime().toString(),
        metadata: config.metadata || {},
        channels: config.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        callback: config.callback,
        onClose: config.onClose || (() => {
          alert('Transaction was not completed, window closed.');
        }),
      });
      handler.openIframe();
    } else {
      console.error('Paystack JavaScript SDK not loaded');
    }
  }
}

export default PaystackService;
export type { PaystackTransaction, PaystackCustomer, PaystackPlan, PaystackWebhookEvent };
