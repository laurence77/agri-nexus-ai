// Payment & Billing Module Components
// African mobile money integration with wallet system for agricultural transactions

export { WalletDashboard } from './WalletDashboard';
export { PaymentProcessor } from './PaymentProcessor';
export { InvoiceManager } from './InvoiceManager';
export { SalaryPayments } from './SalaryPayments';
export { PaymentHistory } from './PaymentHistory';
export { BillingSettings } from './BillingSettings';

// Re-export payment service types for convenience
export type {
  WalletAccount,
  PaymentTransaction,
  MobileMoneyProvider,
  PaymentMethod,
  InvoiceData,
  SalaryPayment,
  BillingPlan
} from '@/services/payment/payment-service';

export type {
  MoMoSTKPushRequest,
  MoMoCallback,
  MoMoTransactionStatus,
  CurrencyConversion
} from '@/services/payment/mobile-money-service';

// Payment Component metadata
export const PAYMENT_COMPONENTS_METADATA = {
  walletDashboard: {
    title: 'Wallet Dashboard',
    description: 'Comprehensive wallet management with multi-currency support and transaction history',
    features: [
      'Multi-currency wallet balances (KES, UGX, GHS, NGN, TZS)',
      'Real-time transaction history and filtering',
      'Mobile money integration status',
      'Automated currency conversion',
      'Security alerts and fraud detection',
      'Spending analytics and budgeting tools'
    ],
    technologies: ['Mobile Money APIs', 'Multi-Currency', 'Real-time Updates', 'Security']
  },
  paymentProcessor: {
    title: 'Payment Processor',
    description: 'Unified payment processing with mobile money and traditional payment methods',
    features: [
      'STK Push integration for M-Pesa, MTN MoMo, Airtel Money',
      'Automated payment callbacks and confirmations',
      'Multi-provider redundancy and failover',
      'Transaction fee optimization',
      'Batch payment processing',
      'Payment scheduling and recurring payments'
    ],
    technologies: ['STK Push', 'Payment Gateways', 'Webhooks', 'API Integration']
  },
  invoiceManager: {
    title: 'Invoice Manager',
    description: 'Automated invoice generation and management for agricultural services',
    features: [
      'Template-based invoice generation',
      'Multi-language invoice support',
      'Automated recurring billing',
      'Payment tracking and reminders',
      'Tax calculation and compliance',
      'Export to PDF and accounting systems'
    ],
    technologies: ['PDF Generation', 'Templates', 'Automation', 'Integration']
  },
  salaryPayments: {
    title: 'Salary Payments',
    description: 'Automated salary and wage payments for farm workers and staff',
    features: [
      'Bulk salary processing with mobile money',
      'Attendance-based wage calculation',
      'Performance bonuses and deductions',
      'Payment approval workflows',
      'Tax and statutory deductions',
      'Payment confirmation and receipts'
    ],
    technologies: ['Bulk Payments', 'Payroll Integration', 'Approval Workflows', 'Reporting']
  }
} as const;

// Payment Configuration
export const PAYMENT_CONFIG = {
  supportedCurrencies: [
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
    { code: 'USD', name: 'US Dollar', symbol: '$' }
  ],
  mobileMoneyProviders: [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      countries: ['KE', 'TZ'],
      currencies: ['KES', 'TZS'],
      maxAmount: 150000, // KES
      minAmount: 1,
      processingTime: '1-3 minutes'
    },
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      countries: ['UG', 'GH'],
      currencies: ['UGX', 'GHS'],
      maxAmount: 5000000, // UGX
      minAmount: 100,
      processingTime: '1-5 minutes'
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      countries: ['KE', 'UG', 'TZ', 'GH'],
      currencies: ['KES', 'UGX', 'TZS', 'GHS'],
      maxAmount: 100000, // KES equivalent
      minAmount: 10,
      processingTime: '1-3 minutes'
    },
    {
      id: 'vodafone_cash',
      name: 'Vodafone Cash',
      countries: ['GH'],
      currencies: ['GHS'],
      maxAmount: 10000, // GHS
      minAmount: 1,
      processingTime: '1-2 minutes'
    }
  ],
  fees: {
    // Transaction fees as percentages
    mobileMoneyFee: 0.015, // 1.5%
    currencyConversionFee: 0.02, // 2%
    withdrawalFee: 0.01, // 1%
    platformFee: 0.025, // 2.5%
    // Fixed fees
    stkPushFee: 1.00, // USD equivalent
    invoiceProcessingFee: 0.50,
    salaryProcessingFee: 2.00
  },
  limits: {
    dailyLimit: 500000, // KES equivalent
    monthlyLimit: 5000000, // KES equivalent
    transactionLimit: 150000, // KES equivalent
    walletLimit: 1000000 // KES equivalent
  }
} as const;

// Payment Status Constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  EXPIRED: 'expired'
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Invoice Status Constants
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
} as const;

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];

// Payment utility functions
export const paymentUtils = {
  /**
   * Format currency amount with symbol
   */
  formatCurrency: (amount: number, currency: string): string => {
    const currencyConfig = PAYMENT_CONFIG.supportedCurrencies.find(c => c.code === currency);
    const symbol = currencyConfig?.symbol || currency;
    
    return `${symbol}${amount.toLocaleString('en', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  /**
   * Calculate transaction fee
   */
  calculateFee: (amount: number, feeType: 'mobileMoneyFee' | 'currencyConversionFee' | 'withdrawalFee' | 'platformFee'): number => {
    const feeRate = PAYMENT_CONFIG.fees[feeType];
    return Math.round(amount * feeRate * 100) / 100;
  },

  /**
   * Validate mobile money phone number
   */
  validateMoMoNumber: (phoneNumber: string, provider: string): boolean => {
    const patterns: Record<string, RegExp> = {
      mpesa: /^254[17]\d{8}$/, // Kenya M-Pesa
      mtn_momo: /^256[37]\d{8}$|^233[25]\d{8}$/, // Uganda/Ghana MTN
      airtel_money: /^254[17]\d{8}$|^256[37]\d{8}$/, // Kenya/Uganda Airtel
      vodafone_cash: /^233[25]\d{8}$/ // Ghana Vodafone
    };

    return patterns[provider]?.test(phoneNumber) || false;
  },

  /**
   * Generate payment reference
   */
  generatePaymentRef: (type: 'PAY' | 'INV' | 'SAL' | 'WTH'): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}_${timestamp}_${random}`.toUpperCase();
  },

  /**
   * Convert currency amount
   */
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    return Math.round((amount / fromRate) * toRate * 100) / 100;
  },

  /**
   * Validate payment amount limits
   */
  validateAmount: (amount: number, currency: string, provider?: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    // Convert to KES equivalent for limit checking
    const kesAmount = currency === 'KES' ? amount : amount * 1; // Simplified conversion
    
    if (amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (kesAmount > PAYMENT_CONFIG.limits.transactionLimit) {
      errors.push(`Amount exceeds transaction limit of ${paymentUtils.formatCurrency(PAYMENT_CONFIG.limits.transactionLimit, 'KES')}`);
    }
    
    if (provider) {
      const providerConfig = PAYMENT_CONFIG.mobileMoneyProviders.find(p => p.id === provider);
      if (providerConfig) {
        if (amount < providerConfig.minAmount) {
          errors.push(`Amount below minimum for ${providerConfig.name}: ${paymentUtils.formatCurrency(providerConfig.minAmount, currency)}`);
        }
        if (amount > providerConfig.maxAmount) {
          errors.push(`Amount exceeds maximum for ${providerConfig.name}: ${paymentUtils.formatCurrency(providerConfig.maxAmount, currency)}`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get supported providers for currency
   */
  getSupportedProviders: (currency: string): string[] => {
    return PAYMENT_CONFIG.mobileMoneyProviders
      .filter(provider => provider.currencies.includes(currency))
      .map(provider => provider.id);
  },

  /**
   * Calculate total payment with fees
   */
  calculateTotal: (amount: number, includePlatformFee: boolean = true): {
    amount: number;
    platformFee: number;
    total: number;
  } => {
    const platformFee = includePlatformFee ? paymentUtils.calculateFee(amount, 'platformFee') : 0;
    
    return {
      amount,
      platformFee,
      total: amount + platformFee
    };
  },

  /**
   * Format payment status with color
   */
  getStatusColor: (status: PaymentStatus): string => {
    switch (status) {
      case PAYMENT_STATUS.COMPLETED:
        return 'text-green-400 bg-green-400/20';
      case PAYMENT_STATUS.PROCESSING:
        return 'text-blue-400 bg-blue-400/20';
      case PAYMENT_STATUS.PENDING:
        return 'text-yellow-400 bg-yellow-400/20';
      case PAYMENT_STATUS.FAILED:
      case PAYMENT_STATUS.CANCELLED:
        return 'text-red-400 bg-red-400/20';
      case PAYMENT_STATUS.REFUNDED:
        return 'text-purple-400 bg-purple-400/20';
      case PAYMENT_STATUS.EXPIRED:
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  },

  /**
   * Generate invoice number
   */
  generateInvoiceNumber: (prefix: string = 'INV'): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 9999) + 1;
    
    return `${prefix}-${year}${month}-${sequence.toString().padStart(4, '0')}`;
  },

  /**
   * Calculate invoice due date
   */
  calculateDueDate: (issueDate: Date, paymentTerms: number): Date => {
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + paymentTerms);
    return dueDate;
  },

  /**
   * Check if invoice is overdue
   */
  isInvoiceOverdue: (dueDate: Date): boolean => {
    return new Date() > dueDate;
  }
};

// Default export for convenient imports
export default {
  WalletDashboard,
  PaymentProcessor,
  InvoiceManager,
  SalaryPayments,
  PaymentHistory,
  BillingSettings,
  PAYMENT_COMPONENTS_METADATA,
  PAYMENT_CONFIG,
  PAYMENT_STATUS,
  INVOICE_STATUS,
  paymentUtils
};