// Payment Service Types and Interfaces
// Comprehensive payment system for African agricultural markets

export interface WalletAccount {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  availableBalance: number;
  reservedBalance: number;
  status: 'active' | 'suspended' | 'closed';
  lastUpdated: Date;
  linkedAccounts: {
    type: string;
    number: string;
    verified: boolean;
  }[];
}

export interface PaymentTransaction {
  id: string;
  walletId: string;
  type: 'payment' | 'topup' | 'withdrawal' | 'salary' | 'invoice' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired';
  description: string;
  recipient?: string;
  sender?: string;
  paymentMethod: string;
  reference: string;
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  fees: {
    platformFee: number;
    providerFee: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

export interface MobileMoneyProvider {
  id: string;
  name: string;
  countries: string[];
  currencies: string[];
  maxAmount: number;
  minAmount: number;
  processingTime: string;
  isActive: boolean;
  apiEndpoint?: string;
  credentials?: {
    consumerKey?: string;
    consumerSecret?: string;
    passkey?: string;
    shortcode?: string;
  };
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'mobile_money' | 'bank_account' | 'credit_card';
  provider: string;
  accountNumber: string;
  accountName?: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paymentTerms: number; // days
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  payrollPeriodId: string;
  baseSalary: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  currency: string;
  paymentMethod: string;
  phoneNumber: string;
  bankAccount?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payDate: Date;
  paidAt?: Date;
  reference?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    attendanceDays?: number;
    overtimeHours?: number;
    performanceRating?: number;
    department?: string;
  };
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxFarms?: number;
    maxFields?: number;
    maxWorkers?: number;
    maxStorage?: number; // GB
    maxApiCalls?: number;
  };
  isActive: boolean;
  isPopular?: boolean;
  trialDays?: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentWebhook {
  id: string;
  event: string;
  provider: string;
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  reference: string;
  phoneNumber?: string;
  timestamp: Date;
  rawData: any;
  processed: boolean;
  processedAt?: Date;
}

export interface CurrencyRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  lastUpdated: Date;
  source: string;
}

export interface PaymentAnalytics {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageTransactionSize: number;
  topPaymentMethods: {
    method: string;
    count: number;
    volume: number;
  }[];
  monthlyTrends: {
    month: string;
    transactions: number;
    volume: number;
  }[];
  failuresByReason: {
    reason: string;
    count: number;
  }[];
}

// Payment Service Class
export class PaymentService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Wallet Management
  async getWalletBalance(userId: string, currency: string): Promise<WalletAccount> {
    const response = await fetch(`${this.baseUrl}/wallets/${userId}/${currency}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get wallet balance: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createWallet(userId: string, currency: string): Promise<WalletAccount> {
    const response = await fetch(`${this.baseUrl}/wallets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, currency })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create wallet: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Payment Processing
  async initiatePayment(payment: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payment)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to initiate payment: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentTransaction> {
    const response = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get payment status: ${response.statusText}`);
    }
    
    return response.json();
  }

  async cancelPayment(transactionId: string): Promise<PaymentTransaction> {
    const response = await fetch(`${this.baseUrl}/payments/${transactionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to cancel payment: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Mobile Money Integration
  async sendSTKPush(phoneNumber: string, amount: number, reference: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/mobile-money/stk-push`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        amount,
        reference,
        callbackUrl: `${this.baseUrl}/webhooks/stk-callback`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send STK push: ${response.statusText}`);
    }
    
    return response.json();
  }

  async queryTransactionStatus(checkoutRequestId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/mobile-money/query/${checkoutRequestId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to query transaction: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Invoice Management
  async createInvoice(invoice: Partial<InvoiceData>): Promise<InvoiceData> {
    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoice)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create invoice: ${response.statusText}`);
    }
    
    return response.json();
  }

  async sendInvoice(invoiceId: string): Promise<InvoiceData> {
    const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send invoice: ${response.statusText}`);
    }
    
    return response.json();
  }

  async markInvoicePaid(invoiceId: string, paymentData: any): Promise<InvoiceData> {
    const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}/paid`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to mark invoice as paid: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Salary Payments
  async processSalaryPayments(payments: SalaryPayment[]): Promise<SalaryPayment[]> {
    const response = await fetch(`${this.baseUrl}/payroll/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payments })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to process salary payments: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getSalaryPaymentHistory(employeeId?: string, startDate?: Date, endDate?: Date): Promise<SalaryPayment[]> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await fetch(`${this.baseUrl}/payroll/history?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get salary payment history: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Currency Conversion
  async getCurrencyRates(): Promise<CurrencyRate[]> {
    const response = await fetch(`${this.baseUrl}/currency/rates`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get currency rates: ${response.statusText}`);
    }
    
    return response.json();
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/currency/convert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, fromCurrency, toCurrency })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to convert currency: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.convertedAmount;
  }

  // Analytics
  async getPaymentAnalytics(startDate: Date, endDate: Date): Promise<PaymentAnalytics> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const response = await fetch(`${this.baseUrl}/analytics/payments?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get payment analytics: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Webhook Processing
  async processWebhook(webhook: PaymentWebhook): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/webhooks/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhook)
    });
    
    return response.ok;
  }
}

// Default export for convenient imports
export default PaymentService;