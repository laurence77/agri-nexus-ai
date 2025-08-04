/**
 * African Mobile Money Payment Service
 * Supports M-Pesa, MTN Mobile Money, Airtel Money across multiple countries
 */

export interface MobileMoneyProvider {
  id: 'mpesa' | 'mtn_momo' | 'airtel_money' | 'orange_money' | 'vodacom';
  name: string;
  countries: string[];
  currencies: string[];
  prefixes: string[];
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  country: string;
  description: string;
  reference: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  providerReference?: string;
  message?: string;
  amount: number;
  currency: string;
  fees?: number;
  timestamp: string;
}

export interface PayoutRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  country: string;
  description: string;
  reference: string;
  recipientName?: string;
}

export class MobileMoneyService {
  private readonly providers: MobileMoneyProvider[] = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      countries: ['KE', 'TZ', 'UG', 'RW', 'DRC', 'GH', 'ET', 'MZ', 'EG', 'MA'],
      currencies: ['KES', 'TZS', 'UGX', 'RWF', 'CDF', 'GHS', 'ETB', 'MZN', 'EGP', 'MAD'],
      prefixes: ['254', '255', '256', '250', '243', '233', '251', '258', '20', '212']
    },
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      countries: ['UG', 'GH', 'CI', 'CM', 'BJ', 'RW', 'ZM', 'SS'],
      currencies: ['UGX', 'GHS', 'XOF', 'XAF', 'XOF', 'RWF', 'ZMW', 'SSP'],
      prefixes: ['256', '233', '225', '237', '229', '250', '260', '211']
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      countries: ['KE', 'UG', 'TZ', 'ZM', 'MW', 'MG', 'BF', 'TD', 'NE', 'GA'],
      currencies: ['KES', 'UGX', 'TZS', 'ZMW', 'MWK', 'MGA', 'XOF', 'XAF', 'XOF', 'XAF'],
      prefixes: ['254', '256', '255', '260', '265', '261', '226', '235', '227', '241']
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      countries: ['CI', 'SN', 'ML', 'BF', 'NE', 'CM', 'MG', 'BJ', 'CD'],
      currencies: ['XOF', 'XOF', 'XOF', 'XOF', 'XOF', 'XAF', 'MGA', 'XOF', 'CDF'],
      prefixes: ['225', '221', '223', '226', '227', '237', '261', '229', '243']
    }
  ];

  private readonly apiConfig = {
    korapay: {
      baseUrl: 'https://api.korapay.com/merchant/api/v1',
      secretKey: process.env.KORAPAY_SECRET_KEY!,
    },
    flutterwave: {
      baseUrl: 'https://api.flutterwave.com/v3',
      secretKey: process.env.FLW_SECRET_KEY!,
    },
    paystack: {
      baseUrl: 'https://api.paystack.co',
      secretKey: process.env.PAYSTACK_SECRET_KEY!,
    }
  };

  /**
   * Detect mobile money provider based on phone number and country
   */
  detectProvider(phoneNumber: string, country: string): MobileMoneyProvider | null {
    const normalizedPhone = phoneNumber.replace(/^\+?/, '').replace(/\s+/g, '');
    
    // Get country code from phone number
    const countryCode = this.extractCountryCode(normalizedPhone);
    
    // Find providers available in the country
    const availableProviders = this.providers.filter(provider => 
      provider.countries.includes(country) && 
      provider.prefixes.some(prefix => normalizedPhone.startsWith(prefix))
    );

    // Apply country-specific logic
    switch (country) {
      case 'KE': // Kenya
        if (normalizedPhone.startsWith('254') || normalizedPhone.startsWith('7')) {
          const kenyaPrefix = normalizedPhone.substring(3, 6);
          if (['070', '071', '072', '074', '075', '076', '077', '078', '079'].includes(kenyaPrefix)) {
            return this.providers.find(p => p.id === 'mpesa') || null;
          }
          if (['073', '070'].includes(kenyaPrefix)) {
            return this.providers.find(p => p.id === 'airtel_money') || null;
          }
        }
        break;

      case 'UG': // Uganda
        if (normalizedPhone.startsWith('256')) {
          const ugandaPrefix = normalizedPhone.substring(3, 6);
          if (['077', '078', '076'].includes(ugandaPrefix)) {
            return this.providers.find(p => p.id === 'mtn_momo') || null;
          }
          if (['070', '074', '075'].includes(ugandaPrefix)) {
            return this.providers.find(p => p.id === 'airtel_money') || null;
          }
        }
        break;

      case 'GH': // Ghana
        if (normalizedPhone.startsWith('233')) {
          const ghanaPrefix = normalizedPhone.substring(3, 6);
          if (['024', '054', '055', '059'].includes(ghanaPrefix)) {
            return this.providers.find(p => p.id === 'mtn_momo') || null;
          }
          if (['026', '056'].includes(ghanaPrefix)) {
            return this.providers.find(p => p.id === 'airtel_money') || null;
          }
          if (['050', '020'].includes(ghanaPrefix)) {
            return this.providers.find(p => p.id === 'vodacom') || null;
          }
        }
        break;

      case 'TZ': // Tanzania
        if (normalizedPhone.startsWith('255')) {
          const tanzaniaPrefix = normalizedPhone.substring(3, 6);
          if (['068', '069', '067', '065'].includes(tanzaniaPrefix)) {
            return this.providers.find(p => p.id === 'mpesa') || null;
          }
          if (['078', '075', '076'].includes(tanzaniaPrefix)) {
            return this.providers.find(p => p.id === 'airtel_money') || null;
          }
        }
        break;

      default:
        // Return first available provider for the country
        return availableProviders[0] || null;
    }

    return availableProviders[0] || null;
  }

  /**
   * Initiate mobile money payment collection
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const provider = this.detectProvider(request.phoneNumber, request.country);
    
    if (!provider) {
      throw new Error(`No mobile money provider found for ${request.country} and phone ${request.phoneNumber}`);
    }

    // Use Korapay as primary aggregator (supports most African countries)
    return this.initiateKorapayPayment(request, provider);
  }

  /**
   * Process payout to farmer/worker
   */
  async initiatePayout(request: PayoutRequest): Promise<PaymentResponse> {
    const provider = this.detectProvider(request.phoneNumber, request.country);
    
    if (!provider) {
      throw new Error(`No mobile money provider found for ${request.country} and phone ${request.phoneNumber}`);
    }

    return this.initiateKorapayPayout(request, provider);
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(
        `${this.apiConfig.korapay.baseUrl}/charges/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiConfig.korapay.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Payment status check failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        transactionId: data.data.reference,
        status: this.mapKorapayStatus(data.data.status),
        providerReference: data.data.channel_reference,
        message: data.data.narration,
        amount: data.data.amount,
        currency: data.data.currency,
        fees: data.data.fee,
        timestamp: data.data.created_at
      };

    } catch (error) {
      throw new Error(`Failed to check payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(
    phoneNumber: string, 
    limit: number = 50,
    offset: number = 0
  ): Promise<PaymentResponse[]> {
    // This would typically query your database
    // For now, return mock data structure
    return [];
  }

  /**
   * Validate phone number format for mobile money
   */
  validatePhoneNumber(phoneNumber: string, country: string): boolean {
    const normalizedPhone = phoneNumber.replace(/^\+?/, '').replace(/\s+/g, '');
    const provider = this.detectProvider(normalizedPhone, country);
    
    if (!provider) return false;

    // Basic length validation
    if (normalizedPhone.length < 9 || normalizedPhone.length > 15) {
      return false;
    }

    // Country-specific validation
    switch (country) {
      case 'KE':
        return normalizedPhone.length === 12 && normalizedPhone.startsWith('254');
      case 'UG':
        return normalizedPhone.length === 12 && normalizedPhone.startsWith('256');
      case 'GH':
        return normalizedPhone.length === 12 && normalizedPhone.startsWith('233');
      case 'TZ':
        return normalizedPhone.length === 12 && normalizedPhone.startsWith('255');
      default:
        return true; // Basic validation for other countries
    }
  }

  /**
   * Get supported countries and providers
   */
  getSupportedCountries(): Array<{
    country: string;
    providers: MobileMoneyProvider[];
    currencies: string[];
  }> {
    const countryMap = new Map<string, {
      providers: MobileMoneyProvider[];
      currencies: Set<string>;
    }>();

    this.providers.forEach(provider => {
      provider.countries.forEach((country, index) => {
        if (!countryMap.has(country)) {
          countryMap.set(country, { providers: [], currencies: new Set() });
        }
        
        const countryData = countryMap.get(country)!;
        countryData.providers.push(provider);
        countryData.currencies.add(provider.currencies[index]);
      });
    });

    return Array.from(countryMap.entries()).map(([country, data]) => ({
      country,
      providers: data.providers,
      currencies: Array.from(data.currencies)
    }));
  }

  // Private helper methods

  private async initiateKorapayPayment(
    request: PaymentRequest, 
    provider: MobileMoneyProvider
  ): Promise<PaymentResponse> {
    const payload = {
      amount: request.amount,
      currency: request.currency,
      reference: `AGRI_${request.reference}_${Date.now()}`,
      narration: request.description,
      channels: ['mobile_money'],
      default_channel: 'mobile_money',
      mobile_money: {
        number: request.phoneNumber,
        provider: provider.id
      },
      customer: {
        name: request.metadata?.customerName || 'Agricultural Platform User',
        email: request.metadata?.customerEmail || 'user@agriplatform.com'
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/korapay`,
      metadata: {
        farm_id: request.metadata?.farmId,
        tenant_id: request.metadata?.tenantId,
        user_id: request.metadata?.userId,
        payment_type: request.metadata?.paymentType || 'general'
      }
    };

    try {
      const response = await fetch(`${this.apiConfig.korapay.baseUrl}/charges/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiConfig.korapay.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Korapay payment failed: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        transactionId: data.data.reference,
        status: 'pending',
        providerReference: data.data.checkout_url || data.data.reference,
        message: data.message || 'Payment initiated successfully',
        amount: request.amount,
        currency: request.currency,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async initiateKorapayPayout(
    request: PayoutRequest, 
    provider: MobileMoneyProvider
  ): Promise<PaymentResponse> {
    const payload = {
      reference: `PAYOUT_${request.reference}_${Date.now()}`,
      destination: {
        type: 'mobile_money',
        amount: request.amount,
        currency: request.currency,
        narration: request.description,
        mobile_money: {
          number: request.phoneNumber,
          provider: provider.id,
          name: request.recipientName || 'Farmer'
        }
      }
    };

    try {
      const response = await fetch(`${this.apiConfig.korapay.baseUrl}/disbursements/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiConfig.korapay.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Korapay payout failed: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        transactionId: data.data.reference,
        status: this.mapKorapayStatus(data.data.status),
        providerReference: data.data.channel_reference,
        message: data.message || 'Payout initiated successfully',
        amount: request.amount,
        currency: request.currency,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Failed to initiate payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractCountryCode(phoneNumber: string): string {
    // Extract country code from international phone number
    if (phoneNumber.startsWith('254')) return 'KE';
    if (phoneNumber.startsWith('256')) return 'UG';
    if (phoneNumber.startsWith('233')) return 'GH';
    if (phoneNumber.startsWith('255')) return 'TZ';
    if (phoneNumber.startsWith('250')) return 'RW';
    if (phoneNumber.startsWith('260')) return 'ZM';
    if (phoneNumber.startsWith('265')) return 'MW';
    if (phoneNumber.startsWith('237')) return 'CM';
    if (phoneNumber.startsWith('225')) return 'CI';
    if (phoneNumber.startsWith('221')) return 'SN';
    
    return 'KE'; // Default to Kenya
  }

  private mapKorapayStatus(status: string): 'pending' | 'completed' | 'failed' | 'cancelled' {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'successful':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      case 'cancelled':
      case 'canceled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}

// Singleton instance
export const mobileMoneyService = new MobileMoneyService();
export default mobileMoneyService;