/**
 * MTN Mobile Money Payment Integration Service
 * Supports Uganda, Ghana, Rwanda, Cameroon, and other MTN markets
 */

interface MtnMomoConfig {
  environment: 'sandbox' | 'production';
  primaryKey: string;
  secondaryKey: string;
  userId: string;
  apiKey: string;
  targetEnvironment: string; // sandbox, mtnuganda, mtnghana, etc.
  callbackUrl: string;
  currency: string; // UGX, GHS, RWF, etc.
  baseUrl?: string;
}

interface CollectionRequest {
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: 'MSISDN';
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
  metadata?: Record<string, string>;
}

interface CollectionResponse {
  referenceId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reason?: string;
}

interface TransactionStatus {
  amount: string;
  currency: string;
  financialTransactionId: string;
  externalId: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reason?: string;
  payerMessage: string;
  payeeNote: string;
}

interface AccountBalance {
  availableBalance: string;
  currency: string;
}

interface AccountInfo {
  accountHolderIdType: string;
  accountHolderId: string;
  accountHolderName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export class MtnMomoService {
  private config: MtnMomoConfig;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: MtnMomoConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || this.getBaseUrl(config.environment, config.targetEnvironment)
    };
    this.validateConfig();
  }

  private validateConfig(): void {
    const required = ['primaryKey', 'userId', 'targetEnvironment', 'currency'];
    for (const field of required) {
      if (!this.config[field as keyof MtnMomoConfig]) {
        throw new Error(`MTN MoMo configuration missing: ${field}`);
      }
    }
  }

  private getBaseUrl(environment: string, targetEnvironment: string): string {
    if (environment === 'sandbox') {
      return 'https://sandbox.momodeveloper.mtn.com';
    }
    
    // Production URLs for different markets
    const productionUrls: Record<string, string> = {
      'mtnuganda': 'https://momodeveloper.mtn.com',
      'mtnghana': 'https://momodeveloper.mtn.com',
      'mtnrwanda': 'https://momodeveloper.mtn.com',
      'mtncameroon': 'https://momodeveloper.mtn.com',
      'mtnivorycoast': 'https://momodeveloper.mtn.com'
    };

    return productionUrls[targetEnvironment] || 'https://momodeveloper.mtn.com';
  }

  /**
   * Generate access token for API calls
   */
  private async generateAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.config.userId}:${this.config.apiKey}`).toString('base64');
      
      const response = await fetch(`${this.config.baseUrl}/collection/token/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': this.config.primaryKey,
          'X-Target-Environment': this.config.targetEnvironment,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token generation failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token received from MTN MoMo');
      }

      this.accessToken = data.access_token;
      // Token expires in 1 hour, refresh 5 minutes early
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);
      
      console.log('MTN MoMo access token generated successfully');
      return this.accessToken;
    } catch (error) {
      console.error('MTN MoMo token generation error:', error);
      throw new Error(`Failed to generate MTN MoMo access token: ${error}`);
    }
  }

  /**
   * Format phone number for MTN MoMo
   * Different markets have different formats
   */
  private formatPhoneNumber(phoneNumber: string, market: string): string {
    const digits = phoneNumber.replace(/\D/g, '');
    
    switch (market) {
      case 'mtnuganda':
        // Uganda: 256XXXXXXXXX
        if (digits.startsWith('256')) return digits;
        if (digits.startsWith('0')) return '256' + digits.slice(1);
        if (digits.length === 9) return '256' + digits;
        break;
        
      case 'mtnghana':
        // Ghana: 233XXXXXXXXX
        if (digits.startsWith('233')) return digits;
        if (digits.startsWith('0')) return '233' + digits.slice(1);
        if (digits.length === 9) return '233' + digits;
        break;
        
      case 'mtnrwanda':
        // Rwanda: 250XXXXXXXXX
        if (digits.startsWith('250')) return digits;
        if (digits.startsWith('0')) return '250' + digits.slice(1);
        if (digits.length === 9) return '250' + digits;
        break;
        
      case 'mtncameroon':
        // Cameroon: 237XXXXXXXXX
        if (digits.startsWith('237')) return digits;
        if (digits.startsWith('0')) return '237' + digits.slice(1);
        if (digits.length === 9) return '237' + digits;
        break;
        
      default:
        // Default handling
        if (digits.length >= 10) return digits;
    }
    
    throw new Error(`Invalid phone number format for ${market}: ${phoneNumber}`);
  }

  /**
   * Generate UUID for request tracking
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Request payment from customer (Collections API)
   */
  async requestPayment(request: {
    amount: number;
    phoneNumber: string;
    externalId: string;
    payerMessage: string;
    payeeNote: string;
    metadata?: Record<string, string>;
  }): Promise<CollectionResponse> {
    try {
      const accessToken = await this.generateAccessToken();
      const referenceId = this.generateUUID();
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber, this.config.targetEnvironment);

      // Validate amount
      if (request.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const payload: CollectionRequest = {
        amount: request.amount.toString(),
        currency: this.config.currency,
        externalId: request.externalId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: formattedPhone
        },
        payerMessage: request.payerMessage.substring(0, 160), // Max 160 chars
        payeeNote: request.payeeNote.substring(0, 160), // Max 160 chars
        metadata: request.metadata
      };

      console.log('MTN MoMo collection request:', {
        ...payload,
        payer: { ...payload.payer, partyId: formattedPhone.substring(0, 6) + '...' }
      });

      const response = await fetch(`${this.config.baseUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': this.config.targetEnvironment,
          'Ocp-Apim-Subscription-Key': this.config.primaryKey,
          'Content-Type': 'application/json',
          'X-Callback-Url': this.config.callbackUrl
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MTN MoMo collection error:', errorText);
        throw new Error(`Payment request failed: ${response.status} ${errorText}`);
      }

      console.log('MTN MoMo collection initiated successfully:', referenceId);

      return {
        referenceId,
        status: 'PENDING'
      };
    } catch (error) {
      console.error('MTN MoMo payment request error:', error);
      throw error;
    }
  }

  /**
   * Check transaction status
   */
  async getTransactionStatus(referenceId: string): Promise<TransactionStatus> {
    try {
      const accessToken = await this.generateAccessToken();

      const response = await fetch(`${this.config.baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': this.config.targetEnvironment,
          'Ocp-Apim-Subscription-Key': this.config.primaryKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MTN MoMo status check error:', errorText);
        throw new Error(`Transaction status check failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      console.log('MTN MoMo transaction status:', {
        referenceId,
        status: data.status,
        amount: data.amount
      });

      return data;
    } catch (error) {
      console.error('MTN MoMo transaction status error:', error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<AccountBalance> {
    try {
      const accessToken = await this.generateAccessToken();

      const response = await fetch(`${this.config.baseUrl}/collection/v1_0/account/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': this.config.targetEnvironment,
          'Ocp-Apim-Subscription-Key': this.config.primaryKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Balance check failed: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MTN MoMo balance check error:', error);
      throw error;
    }
  }

  /**
   * Validate account holder (KYC check)
   */
  async validateAccountHolder(phoneNumber: string): Promise<AccountInfo> {
    try {
      const accessToken = await this.generateAccessToken();
      const formattedPhone = this.formatPhoneNumber(phoneNumber, this.config.targetEnvironment);

      const response = await fetch(`${this.config.baseUrl}/collection/v1_0/accountholder/msisdn/${formattedPhone}/active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': this.config.targetEnvironment,
          'Ocp-Apim-Subscription-Key': this.config.primaryKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Account validation failed: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MTN MoMo account validation error:', error);
      throw error;
    }
  }

  /**
   * Send money to customer (Disbursements API)
   */
  async sendMoney(request: {
    amount: number;
    phoneNumber: string;
    externalId: string;
    payerMessage: string;
    payeeNote: string;
    metadata?: Record<string, string>;
  }): Promise<{ referenceId: string; status: string }> {
    try {
      const accessToken = await this.generateAccessToken();
      const referenceId = this.generateUUID();
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber, this.config.targetEnvironment);

      const payload = {
        amount: request.amount.toString(),
        currency: this.config.currency,
        externalId: request.externalId,
        payee: {
          partyIdType: 'MSISDN',
          partyId: formattedPhone
        },
        payerMessage: request.payerMessage.substring(0, 160),
        payeeNote: request.payeeNote.substring(0, 160),
        metadata: request.metadata
      };

      // Note: This uses disbursement endpoint, requires separate subscription
      const response = await fetch(`${this.config.baseUrl}/disbursement/v1_0/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': this.config.targetEnvironment,
          'Ocp-Apim-Subscription-Key': this.config.secondaryKey || this.config.primaryKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Money transfer failed: ${response.status} ${errorText}`);
      }

      return {
        referenceId,
        status: 'PENDING'
      };
    } catch (error) {
      console.error('MTN MoMo money transfer error:', error);
      throw error;
    }
  }

  /**
   * Process webhook callback
   */
  processCallback(callbackData: any): {
    success: boolean;
    referenceId: string;
    status: string;
    amount?: string;
    currency?: string;
    externalId?: string;
    reason?: string;
  } {
    console.log('MTN MoMo callback received:', callbackData);

    return {
      success: callbackData.status === 'SUCCESSFUL',
      referenceId: callbackData.referenceId || '',
      status: callbackData.status || 'UNKNOWN',
      amount: callbackData.amount,
      currency: callbackData.currency,
      externalId: callbackData.externalId,
      reason: callbackData.reason
    };
  }

  /**
   * Get user-friendly status message
   */
  getStatusMessage(status: string, reason?: string): string {
    switch (status) {
      case 'SUCCESSFUL':
        return 'Payment completed successfully';
      case 'FAILED':
        return reason || 'Payment failed - please try again';
      case 'PENDING':
        return 'Payment is being processed';
      case 'REJECTED':
        return 'Payment was rejected - please check your account';
      case 'TIMEOUT':
        return 'Payment timed out - please try again';
      default:
        return 'Payment status unknown';
    }
  }

  /**
   * Map status to standard format
   */
  getStandardStatus(status: string): 'success' | 'failed' | 'pending' | 'cancelled' {
    switch (status.toLowerCase()) {
      case 'successful':
        return 'success';
      case 'failed':
      case 'rejected':
        return 'failed';
      case 'pending':
        return 'pending';
      case 'timeout':
        return 'cancelled';
      default:
        return 'failed';
    }
  }
}

// Export configuration helpers for different markets
export const MTN_MARKETS = {
  UGANDA: {
    targetEnvironment: 'mtnuganda',
    currency: 'UGX',
    countryCode: '256'
  },
  GHANA: {
    targetEnvironment: 'mtnghana',
    currency: 'GHS',
    countryCode: '233'
  },
  RWANDA: {
    targetEnvironment: 'mtnrwanda',
    currency: 'RWF',
    countryCode: '250'
  },
  CAMEROON: {
    targetEnvironment: 'mtncameroon',
    currency: 'XAF',
    countryCode: '237'
  }
} as const;

export function createMtnMomoConfig(
  market: keyof typeof MTN_MARKETS,
  environment: 'sandbox' | 'production'
): Partial<MtnMomoConfig> {
  const marketConfig = MTN_MARKETS[market];
  
  return {
    environment,
    targetEnvironment: marketConfig.targetEnvironment,
    currency: marketConfig.currency,
    callbackUrl: `${import.meta.env.VITE_APP_URL || ''}/api/payments/mtn-momo/callback`
  };
}

export default MtnMomoService;
