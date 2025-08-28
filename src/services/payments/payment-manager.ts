/**
 * Multi-Provider Payment Manager
 * Handles M-Pesa, MTN MoMo, Airtel Money, and other African payment providers
 */

import { MtpesaService } from './mpesa';
import { MtnMomoService, MTN_MARKETS } from './mtn-momo';

// Supported payment providers
export type PaymentProvider = 'mpesa' | 'mtn_momo' | 'airtel_money' | 'orange_money' | 'vodacom_mpesa';

// Currency support
export type SupportedCurrency = 'KES' | 'UGX' | 'GHS' | 'NGN' | 'RWF' | 'TZS' | 'XAF' | 'USD';

// Payment status
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'expired';

// Payment request interface
export interface PaymentRequest {
  amount: number;
  currency: SupportedCurrency;
  phoneNumber: string;
  description: string;
  externalId: string;
  metadata?: Record<string, any>;
  provider?: PaymentProvider; // Auto-detect if not provided
}

// Payment response interface
export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  message: string;
  amount: number;
  currency: SupportedCurrency;
  phoneNumber: string;
  externalId: string;
  providerTransactionId?: string;
  providerReference?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

// Payment configuration
export interface PaymentConfig {
  mpesa?: {
    environment: 'sandbox' | 'production';
    consumerKey: string;
    consumerSecret: string;
    businessShortCode: string;
    passkey: string;
    callbackUrl: string;
  };
  mtnMomo?: {
    environment: 'sandbox' | 'production';
    primaryKey: string;
    secondaryKey?: string;
    userId: string;
    apiKey: string;
    markets: {
      [key in keyof typeof MTN_MARKETS]?: boolean;
    };
  };
  // Add other providers as needed
}

// Phone number patterns for provider detection
const PROVIDER_PATTERNS: Record<PaymentProvider, RegExp[]> = {
  mpesa: [
    /^254(7[0-9]{8}|1[0-9]{8})$/, // Kenya M-Pesa
    /^255(7[0-9]{8}|6[0-9]{8})$/, // Tanzania M-Pesa
    /^258(8[0-9]{8})$/ // Mozambique M-Pesa
  ],
  mtn_momo: [
    /^256(7[7-8][0-9]{7}|3[0-9]{8})$/, // Uganda MTN
    /^233(5[4-6][0-9]{7}|2[4-6][0-9]{7})$/, // Ghana MTN
    /^250(7[8][0-9]{7})$/, // Rwanda MTN
    /^237(6[0-9]{8})$/ // Cameroon MTN
  ],
  airtel_money: [
    /^256(7[0-5][0-9]{7})$/, // Uganda Airtel
    /^254(7[3][0-9]{7}|1[0][0-9]{7})$/, // Kenya Airtel
    /^233(5[7][0-9]{7})$/ // Ghana Airtel
  ],
  orange_money: [
    /^225(0[7-9][0-9]{7})$/, // Ivory Coast Orange
    /^221(7[0-9]{8})$/ // Senegal Orange
  ],
  vodacom_mpesa: [
    /^258(8[4-5][0-9]{7})$/ // Mozambique Vodacom
  ]
};

// Currency to provider mapping
const CURRENCY_PROVIDERS: Record<SupportedCurrency, PaymentProvider[]> = {
  KES: ['mpesa', 'airtel_money'],
  UGX: ['mtn_momo', 'airtel_money'],
  GHS: ['mtn_momo', 'airtel_money'],
  NGN: ['mtn_momo'], // Future support
  RWF: ['mtn_momo', 'airtel_money'],
  TZS: ['mpesa', 'airtel_money'],
  XAF: ['mtn_momo', 'orange_money'],
  USD: ['mpesa', 'mtn_momo'] // For international transfers
};

export class PaymentManager {
  private config: PaymentConfig;
  private mpesaService?: MpesaService;
  private mtnMomoServices: Map<string, MtnMomoService> = new Map();

  constructor(config: PaymentConfig) {
    this.config = config;
    this.initializeServices();
  }

  private initializeServices(): void {
    // Initialize M-Pesa
    if (this.config.mpesa) {
      this.mpesaService = new MpesaService(this.config.mpesa);
    }

    // Initialize MTN MoMo for enabled markets
    if (this.config.mtnMomo) {
      Object.entries(this.config.mtnMomo.markets || {}).forEach(([market, enabled]) => {
        if (enabled) {
          const marketConfig = MTN_MARKETS[market as keyof typeof MTN_MARKETS];
          if (marketConfig) {
            const service = new MtnMomoService({
              ...this.config.mtnMomo!,
              targetEnvironment: marketConfig.targetEnvironment,
              currency: marketConfig.currency,
              callbackUrl: `${import.meta.env.VITE_APP_URL || ''}/api/payments/mtn-momo/callback`
            });
            this.mtnMomoServices.set(market, service);
          }
        }
      });
    }
  }

  /**
   * Auto-detect payment provider from phone number
   */
  detectProvider(phoneNumber: string, currency?: SupportedCurrency): PaymentProvider | null {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // First try pattern matching
    for (const [provider, patterns] of Object.entries(PROVIDER_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(cleanPhone)) {
          // Verify provider supports the currency
          if (currency && !CURRENCY_PROVIDERS[currency].includes(provider as PaymentProvider)) {
            continue;
          }
          return provider as PaymentProvider;
        }
      }
    }

    // Fallback to currency-based detection
    if (currency) {
      const providers = CURRENCY_PROVIDERS[currency];
      if (providers.length > 0) {
        return providers[0]; // Return the first available provider
      }
    }

    return null;
  }

  /**
   * Get available providers for a currency
   */
  getAvailableProviders(currency: SupportedCurrency): PaymentProvider[] {
    return CURRENCY_PROVIDERS[currency] || [];
  }

  /**
   * Format phone number based on provider
   */
  private formatPhoneNumber(phoneNumber: string, provider: PaymentProvider): string {
    const digits = phoneNumber.replace(/\D/g, '');

    switch (provider) {
      case 'mpesa':
        // Kenya/Tanzania format
        if (digits.startsWith('254') || digits.startsWith('255') || digits.startsWith('258')) {
          return digits;
        }
        if (digits.startsWith('0')) {
          return '254' + digits.slice(1); // Default to Kenya
        }
        if (digits.length === 9) {
          return '254' + digits; // Default to Kenya
        }
        break;

      case 'mtn_momo':
        // Handle different MTN markets
        if (digits.startsWith('256') || digits.startsWith('233') || 
            digits.startsWith('250') || digits.startsWith('237')) {
          return digits;
        }
        // Default formatting based on length
        if (digits.startsWith('0')) {
          return '256' + digits.slice(1); // Default to Uganda
        }
        break;

      default:
        return digits;
    }

    return digits;
  }

  /**
   * Process payment request
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const startTime = Date.now();
    
    try {
      // Auto-detect provider if not specified
      const provider = request.provider || this.detectProvider(request.phoneNumber, request.currency);
      
      if (!provider) {
        throw new Error(`Unable to determine payment provider for ${request.phoneNumber} (${request.currency})`);
      }

      // Validate provider supports currency
      if (!CURRENCY_PROVIDERS[request.currency].includes(provider)) {
        throw new Error(`Provider ${provider} does not support currency ${request.currency}`);
      }

      const formattedPhone = this.formatPhoneNumber(request.phoneNumber, provider);
      
      console.log('Processing payment:', {
        provider,
        currency: request.currency,
        amount: request.amount,
        externalId: request.externalId
      });

      let result: any;

      switch (provider) {
        case 'mpesa':
          if (!this.mpesaService) {
            throw new Error('M-Pesa service not configured');
          }
          result = await this.mpesaService.stkPush({
            phoneNumber: formattedPhone,
            amount: request.amount,
            accountReference: request.externalId,
            transactionDesc: request.description
          });
          break;

        case 'mtn_momo':
          const mtnService = this.getMtnMomoService(request.currency);
          if (!mtnService) {
            throw new Error('MTN MoMo service not configured for this market');
          }
          result = await mtnService.requestPayment({
            amount: request.amount,
            phoneNumber: formattedPhone,
            externalId: request.externalId,
            payerMessage: request.description,
            payeeNote: `Payment from ${request.phoneNumber}`,
            metadata: request.metadata
          });
          break;

        default:
          throw new Error(`Provider ${provider} not yet implemented`);
      }

      // Create standardized response
      const response: PaymentResponse = {
        success: true,
        transactionId: this.generateTransactionId(),
        provider,
        status: 'pending',
        message: 'Payment initiated successfully',
        amount: request.amount,
        currency: request.currency,
        phoneNumber: formattedPhone,
        externalId: request.externalId,
        providerTransactionId: result.checkoutRequestId || result.referenceId,
        providerReference: result.merchantRequestId,
        metadata: {
          ...request.metadata,
          processingTime: Date.now() - startTime,
          provider
        },
        createdAt: new Date()
      };

      console.log('Payment processed successfully:', {
        transactionId: response.transactionId,
        provider: response.provider,
        providerTransactionId: response.providerTransactionId
      });

      return response;
    } catch (error) {
      console.error('Payment processing error:', error);
      
      return {
        success: false,
        transactionId: this.generateTransactionId(),
        provider: request.provider || 'unknown',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Payment failed',
        amount: request.amount,
        currency: request.currency,
        phoneNumber: request.phoneNumber,
        externalId: request.externalId,
        metadata: {
          ...request.metadata,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: Date.now() - startTime
        },
        createdAt: new Date()
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string, provider: PaymentProvider, providerTransactionId: string): Promise<Partial<PaymentResponse>> {
    try {
      let result: any;

      switch (provider) {
        case 'mpesa':
          if (!this.mpesaService) {
            throw new Error('M-Pesa service not configured');
          }
          result = await this.mpesaService.queryTransactionStatus(providerTransactionId);
          return {
            status: this.mapMpesaStatus(result.resultCode),
            message: this.mpesaService.getResultMessage(parseInt(result.resultCode), result.resultDesc),
            providerReference: result.mpesaReceiptNumber,
            updatedAt: new Date()
          };

        case 'mtn_momo':
          // Need to determine which MTN service to use
          const mtnService = Array.from(this.mtnMomoServices.values())[0]; // Simplified
          if (!mtnService) {
            throw new Error('MTN MoMo service not configured');
          }
          result = await mtnService.getTransactionStatus(providerTransactionId);
          return {
            status: mtnService.getStandardStatus(result.status),
            message: mtnService.getStatusMessage(result.status, result.reason),
            updatedAt: new Date()
          };

        default:
          throw new Error(`Status check not implemented for provider: ${provider}`);
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      return {
        status: 'failed',
        message: error instanceof Error ? error.message : 'Status check failed',
        updatedAt: new Date()
      };
    }
  }

  /**
   * Process payment callback/webhook
   */
  processCallback(provider: PaymentProvider, callbackData: any): {
    success: boolean;
    transactionId?: string;
    status: PaymentStatus;
    message: string;
    metadata?: Record<string, any>;
  } {
    try {
      switch (provider) {
        case 'mpesa':
          if (!this.mpesaService) {
            throw new Error('M-Pesa service not configured');
          }
          const mpesaResult = this.mpesaService.processCallback(callbackData);
          return {
            success: mpesaResult.success,
            transactionId: mpesaResult.transactionId,
            status: mpesaResult.success ? 'success' : 'failed',
            message: this.mpesaService.getResultMessage(mpesaResult.resultCode, mpesaResult.resultDescription),
            metadata: {
              merchantRequestId: mpesaResult.merchantRequestId,
              checkoutRequestId: mpesaResult.checkoutRequestId,
              amount: mpesaResult.amount,
              phoneNumber: mpesaResult.phoneNumber,
              transactionDate: mpesaResult.transactionDate
            }
          };

        case 'mtn_momo':
          const mtnService = Array.from(this.mtnMomoServices.values())[0]; // Simplified
          if (!mtnService) {
            throw new Error('MTN MoMo service not configured');
          }
          const mtnResult = mtnService.processCallback(callbackData);
          return {
            success: mtnResult.success,
            transactionId: mtnResult.externalId,
            status: mtnService.getStandardStatus(mtnResult.status),
            message: mtnService.getStatusMessage(mtnResult.status, mtnResult.reason),
            metadata: {
              referenceId: mtnResult.referenceId,
              amount: mtnResult.amount,
              currency: mtnResult.currency
            }
          };

        default:
          throw new Error(`Callback processing not implemented for provider: ${provider}`);
      }
    } catch (error) {
      console.error('Callback processing error:', error);
      return {
        success: false,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Callback processing failed'
      };
    }
  }

  /**
   * Currency conversion (placeholder for future implementation)
   */
  async convertCurrency(amount: number, fromCurrency: SupportedCurrency, toCurrency: SupportedCurrency): Promise<number> {
    // Placeholder - implement with real exchange rate API
    const exchangeRates: Record<string, number> = {
      'KES-UGX': 32.5,
      'KES-GHS': 0.35,
      'UGX-KES': 0.031,
      'GHS-KES': 2.85,
      // Add more exchange rates
    };

    const rateKey = `${fromCurrency}-${toCurrency}`;
    const rate = exchangeRates[rateKey];
    
    if (!rate) {
      throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
    }

    return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
  }

  // Helper methods
  private generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapMpesaStatus(resultCode: string): PaymentStatus {
    switch (resultCode) {
      case '0': return 'success';
      case '1032': return 'cancelled';
      default: return 'failed';
    }
  }

  private getMtnMomoService(currency: SupportedCurrency): MtnMomoService | null {
    // Map currency to MTN market
    const currencyToMarket: Record<SupportedCurrency, string> = {
      UGX: 'UGANDA',
      GHS: 'GHANA',
      RWF: 'RWANDA',
      XAF: 'CAMEROON',
      KES: '', NGN: '', TZS: '', USD: ''
    };

    const market = currencyToMarket[currency];
    return market ? this.mtnMomoServices.get(market) || null : null;
  }
}

// Export configuration helper
export function createPaymentConfig(): PaymentConfig {
  return {
    mpesa: {
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '',
      passkey: process.env.MPESA_PASSKEY || '',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/callback`
    },
    mtnMomo: {
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
      primaryKey: process.env.MTN_MOMO_PRIMARY_KEY || '',
      secondaryKey: process.env.MTN_MOMO_SECONDARY_KEY || '',
      userId: process.env.MTN_MOMO_USER_ID || '',
      apiKey: process.env.MTN_MOMO_API_KEY || '',
      markets: {
        UGANDA: !!process.env.MTN_MOMO_UGANDA_ENABLED,
        GHANA: !!process.env.MTN_MOMO_GHANA_ENABLED,
        RWANDA: !!process.env.MTN_MOMO_RWANDA_ENABLED,
        CAMEROON: !!process.env.MTN_MOMO_CAMEROON_ENABLED
      }
    }
  };
}

export default PaymentManager;
