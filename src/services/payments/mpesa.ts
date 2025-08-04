/**
 * M-Pesa Payment Integration Service
 * Supports Kenya, Tanzania, Mozambique, and other Safaricom markets
 */

interface MpesaConfig {
  environment: 'sandbox' | 'production';
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  callbackUrl: string;
  resultUrl: string;
  timeoutUrl: string;
}

interface StkPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  metadata?: Record<string, any>;
}

interface StkPushResponse {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

interface TransactionStatusRequest {
  businessShortCode: string;
  password: string;
  timestamp: string;
  checkoutRequestId: string;
}

interface TransactionStatusResponse {
  responseCode: string;
  responseDescription: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: string;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  balance?: string;
  transactionDate?: string;
  phoneNumber?: string;
}

interface CallbackResponse {
  body: {
    stkCallback: {
      merchantRequestId: string;
      checkoutRequestId: string;
      resultCode: number;
      resultDesc: string;
      callbackMetadata?: {
        item: Array<{
          name: string;
          value: string | number;
        }>;
      };
    };
  };
}

export class MpesaService {
  private config: MpesaConfig;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: MpesaConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig(): void {
    const required = ['consumerKey', 'consumerSecret', 'businessShortCode', 'passkey'];
    for (const field of required) {
      if (!this.config[field as keyof MpesaConfig]) {
        throw new Error(`M-Pesa configuration missing: ${field}`);
      }
    }
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Generate OAuth access token
   */
  private async generateAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    
    try {
      const response = await fetch(`${this.getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OAuth failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token received from M-Pesa');
      }

      this.accessToken = data.access_token;
      // Token expires in 1 hour, refresh 5 minutes early
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('M-Pesa OAuth error:', error);
      throw new Error(`Failed to generate M-Pesa access token: ${error}`);
    }
  }

  /**
   * Generate password for STK Push
   */
  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${this.config.businessShortCode}${this.config.passkey}${timestamp}`).toString('base64');
    
    return { password, timestamp };
  }

  /**
   * Format phone number for M-Pesa (254XXXXXXXXX)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.startsWith('254')) {
      return digits;
    } else if (digits.startsWith('0')) {
      return '254' + digits.slice(1);
    } else if (digits.length === 9) {
      return '254' + digits;
    } else {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }
  }

  /**
   * Initiate STK Push payment
   */
  async stkPush(request: StkPushRequest): Promise<StkPushResponse> {
    try {
      const accessToken = await this.generateAccessToken();
      const { password, timestamp } = this.generatePassword();
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber);

      // Validate amount (M-Pesa minimum is 1 KES)
      if (request.amount < 1) {
        throw new Error('Amount must be at least 1 KES');
      }

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(request.amount), // Ensure integer
        PartyA: formattedPhone,
        PartyB: this.config.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.config.callbackUrl,
        AccountReference: request.accountReference.substring(0, 12), // Max 12 chars
        TransactionDesc: request.transactionDesc.substring(0, 13) // Max 13 chars
      };

      console.log('M-Pesa STK Push request:', {
        ...payload,
        Password: '[REDACTED]'
      });

      const response = await fetch(`${this.getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('M-Pesa STK Push error:', responseData);
        throw new Error(`STK Push failed: ${responseData.errorMessage || response.statusText}`);
      }

      // Log successful response (without sensitive data)
      console.log('M-Pesa STK Push response:', {
        ResponseCode: responseData.ResponseCode,
        ResponseDescription: responseData.ResponseDescription,
        MerchantRequestID: responseData.MerchantRequestID,
        CheckoutRequestID: responseData.CheckoutRequestID
      });

      return {
        merchantRequestId: responseData.MerchantRequestID,
        checkoutRequestId: responseData.CheckoutRequestID,
        responseCode: responseData.ResponseCode,
        responseDescription: responseData.ResponseDescription,
        customerMessage: responseData.CustomerMessage
      };
    } catch (error) {
      console.error('STK Push error:', error);
      throw error;
    }
  }

  /**
   * Query STK Push transaction status
   */
  async queryTransactionStatus(checkoutRequestId: string): Promise<TransactionStatusResponse> {
    try {
      const accessToken = await this.generateAccessToken();
      const { password, timestamp } = this.generatePassword();

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await fetch(`${this.getBaseUrl()}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('M-Pesa transaction status error:', responseData);
        throw new Error(`Transaction status query failed: ${responseData.errorMessage || response.statusText}`);
      }

      return {
        responseCode: responseData.ResponseCode,
        responseDescription: responseData.ResponseDescription,
        merchantRequestId: responseData.MerchantRequestID,
        checkoutRequestId: responseData.CheckoutRequestID,
        resultCode: responseData.ResultCode,
        resultDesc: responseData.ResultDesc,
        amount: responseData.Amount,
        mpesaReceiptNumber: responseData.MpesaReceiptNumber,
        balance: responseData.Balance,
        transactionDate: responseData.TransactionDate,
        phoneNumber: responseData.PhoneNumber
      };
    } catch (error) {
      console.error('Transaction status query error:', error);
      throw error;
    }
  }

  /**
   * Process M-Pesa callback
   */
  processCallback(callbackData: CallbackResponse): {
    success: boolean;
    transactionId?: string;
    amount?: number;
    phoneNumber?: string;
    transactionDate?: string;
    merchantRequestId: string;
    checkoutRequestId: string;
    resultCode: number;
    resultDescription: string;
  } {
    const callback = callbackData.body.stkCallback;
    
    const result = {
      success: callback.resultCode === 0,
      merchantRequestId: callback.merchantRequestId,
      checkoutRequestId: callback.checkoutRequestId,
      resultCode: callback.resultCode,
      resultDescription: callback.resultDesc
    };

    // Extract transaction details if successful
    if (callback.resultCode === 0 && callback.callbackMetadata) {
      const metadata = callback.callbackMetadata.item;
      
      for (const item of metadata) {
        switch (item.name) {
          case 'Amount':
            (result as any).amount = Number(item.value);
            break;
          case 'MpesaReceiptNumber':
            (result as any).transactionId = String(item.value);
            break;
          case 'PhoneNumber':
            (result as any).phoneNumber = String(item.value);
            break;
          case 'TransactionDate':
            (result as any).transactionDate = String(item.value);
            break;
        }
      }
    }

    console.log('M-Pesa callback processed:', result);
    return result;
  }

  /**
   * Validate callback authenticity
   */
  validateCallback(callbackData: any, signature?: string): boolean {
    // Implement signature validation if M-Pesa provides it
    // For now, basic validation of required fields
    return !!(
      callbackData?.body?.stkCallback?.merchantRequestId &&
      callbackData?.body?.stkCallback?.checkoutRequestId &&
      typeof callbackData?.body?.stkCallback?.resultCode === 'number'
    );
  }

  /**
   * Get transaction result message for users
   */
  getResultMessage(resultCode: number, resultDesc: string): string {
    switch (resultCode) {
      case 0:
        return 'Payment completed successfully';
      case 1032:
        return 'Payment cancelled by user';
      case 1037:
        return 'Payment timeout - please try again';
      case 1001:
        return 'Unable to lock subscriber - SIM toolkit busy';
      case 9999:
        return 'Request failed - please try again';
      case 1019:
        return 'Transaction failed - please check your M-Pesa balance';
      case 1025:
        return 'Unable to complete transaction - please try again';
      default:
        return resultDesc || 'Payment failed - please try again';
    }
  }

  /**
   * Get human-readable transaction status
   */
  getTransactionStatus(resultCode: string): 'success' | 'failed' | 'pending' | 'cancelled' {
    switch (resultCode) {
      case '0':
        return 'success';
      case '1032':
        return 'cancelled';
      case '1037':
      case '1025':
      case '1001':
        return 'failed';
      default:
        return 'failed';
    }
  }
}

// Export configuration helper
export function createMpesaConfig(env: 'sandbox' | 'production'): Partial<MpesaConfig> {
  return {
    environment: env,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/callback`,
    resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/result`,
    timeoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/timeout`
  };
}

export default MpesaService;