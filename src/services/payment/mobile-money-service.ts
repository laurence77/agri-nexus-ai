// Mobile Money Integration Service
// African mobile money providers (M-Pesa, MTN MoMo, Airtel Money, Vodafone Cash)

export interface MoMoSTKPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';
  Amount: number;
  PartyA: string; // Customer phone number
  PartyB: string; // Business shortcode
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

export interface MoMoCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface MoMoTransactionStatus {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: Date;
}

export interface MobileMoneyConfig {
  provider: string;
  environment: 'sandbox' | 'production';
  credentials: {
    consumerKey: string;
    consumerSecret: string;
    passkey?: string;
    shortcode?: string;
    initiatorName?: string;
    securityCredential?: string;
  };
  endpoints: {
    accessToken: string;
    stkPush: string;
    stkQuery: string;
    b2c: string;
    b2b: string;
    balance: string;
  };
}

// M-Pesa Integration Service
export class MpesaService {
  private config: MobileMoneyConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: MobileMoneyConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.config.credentials.consumerKey}:${this.config.credentials.consumerSecret}`).toString('base64');
    
    const response = await fetch(this.config.endpoints.accessToken, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
    
    return this.accessToken;
  }

  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, '');
    const password = Buffer.from(
      `${this.config.credentials.shortcode}${this.config.credentials.passkey}${timestamp}`
    ).toString('base64');
    
    return { password, timestamp };
  }

  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    reference: string,
    description: string,
    callbackUrl: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();

    // Format phone number (ensure it starts with 254 for Kenya)
    const formattedPhone = phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.substring(1)}`;

    const requestBody: MoMoSTKPushRequest = {
      BusinessShortCode: this.config.credentials.shortcode!,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: this.config.credentials.shortcode!,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: reference,
      TransactionDesc: description
    };

    const response = await fetch(this.config.endpoints.stkPush, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`STK Push failed: ${response.statusText}`);
    }

    return response.json();
  }

  async querySTKStatus(checkoutRequestId: string): Promise<MoMoTransactionStatus> {
    const accessToken = await this.getAccessToken();
    const { password, timestamp } = this.generatePassword();

    const requestBody = {
      BusinessShortCode: this.config.credentials.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await fetch(this.config.endpoints.stkQuery, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`STK Query failed: ${response.statusText}`);
    }

    return response.json();
  }

  async processCallback(callbackData: MoMoCallback): Promise<{
    success: boolean;
    transactionId?: string;
    amount?: number;
    phoneNumber?: string;
    receiptNumber?: string;
  }> {
    const callback = callbackData.Body.stkCallback;
    
    if (callback.ResultCode === 0) {
      // Transaction successful
      const metadata = callback.CallbackMetadata?.Item || [];
      const transactionId = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value as string;
      const amount = metadata.find(item => item.Name === 'Amount')?.Value as number;
      const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value as string;
      
      return {
        success: true,
        transactionId,
        amount,
        phoneNumber,
        receiptNumber: transactionId
      };
    } else {
      // Transaction failed
      return {
        success: false
      };
    }
  }

  async initiateB2C(
    phoneNumber: string,
    amount: number,
    occasion: string,
    remarks: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();

    const requestBody = {
      InitiatorName: this.config.credentials.initiatorName,
      SecurityCredential: this.config.credentials.securityCredential,
      CommandID: 'BusinessPayment',
      Amount: amount,
      PartyA: this.config.credentials.shortcode,
      PartyB: phoneNumber,
      Remarks: remarks,
      QueueTimeOutURL: `${this.config.endpoints.b2c}/timeout`,
      ResultURL: `${this.config.endpoints.b2c}/result`,
      Occasion: occasion
    };

    const response = await fetch(this.config.endpoints.b2c, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`B2C transaction failed: ${response.statusText}`);
    }

    return response.json();
  }

  async checkBalance(): Promise<any> {
    const accessToken = await this.getAccessToken();

    const requestBody = {
      InitiatorName: this.config.credentials.initiatorName,
      SecurityCredential: this.config.credentials.securityCredential,
      CommandID: 'AccountBalance',
      PartyA: this.config.credentials.shortcode,
      IdentifierType: '4',
      Remarks: 'Balance inquiry',
      QueueTimeOutURL: `${this.config.endpoints.balance}/timeout`,
      ResultURL: `${this.config.endpoints.balance}/result`
    };

    const response = await fetch(this.config.endpoints.balance, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Balance inquiry failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// MTN Mobile Money Service
export class MTNMobileMoneyService {
  private config: MobileMoneyConfig;
  private accessToken: string | null = null;
  private apiUserId: string | null = null;
  private apiKey: string | null = null;

  constructor(config: MobileMoneyConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    // First, create API user if not exists
    await this.createApiUser();
    
    // Get API key
    await this.getApiKey();

    // Get access token
    const auth = Buffer.from(`${this.apiUserId}:${this.apiKey}`).toString('base64');
    
    const response = await fetch(`${this.config.endpoints.accessToken}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.config.credentials.consumerKey
      },
      body: JSON.stringify({
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get MTN access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    
    return this.accessToken;
  }

  private async createApiUser(): Promise<void> {
    const response = await fetch(`${this.config.endpoints.accessToken}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.config.credentials.consumerKey,
        'X-Reference-Id': this.generateUUID()
      },
      body: JSON.stringify({
        providerCallbackHost: 'your-callback-host.com'
      })
    });

    if (!response.ok && response.status !== 409) { // 409 means user already exists
      throw new Error(`Failed to create MTN API user: ${response.statusText}`);
    }
  }

  private async getApiKey(): Promise<void> {
    const response = await fetch(`${this.config.endpoints.accessToken}/user/${this.apiUserId}/apikey`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.credentials.consumerKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get MTN API key: ${response.statusText}`);
    }

    const data = await response.json();
    this.apiKey = data.apiKey;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async requestToPay(
    phoneNumber: string,
    amount: number,
    currency: string,
    externalId: string,
    payerMessage: string,
    payeeNote: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const referenceId = this.generateUUID();

    const requestBody = {
      amount: amount.toString(),
      currency,
      externalId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber
      },
      payerMessage,
      payeeNote
    };

    const response = await fetch(`${this.config.endpoints.stkPush}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Reference-Id': referenceId,
        'X-Target-Environment': this.config.environment,
        'Ocp-Apim-Subscription-Key': this.config.credentials.consumerKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`MTN request to pay failed: ${response.statusText}`);
    }

    return { referenceId, status: 'PENDING' };
  }

  async getTransactionStatus(referenceId: string): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.config.endpoints.stkQuery}/${referenceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': this.config.environment,
        'Ocp-Apim-Subscription-Key': this.config.credentials.consumerKey
      }
    });

    if (!response.ok) {
      throw new Error(`MTN transaction status query failed: ${response.statusText}`);
    }

    return response.json();
  }

  async transfer(
    phoneNumber: string,
    amount: number,
    currency: string,
    externalId: string,
    payerMessage: string,
    payeeNote: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const referenceId = this.generateUUID();

    const requestBody = {
      amount: amount.toString(),
      currency,
      externalId,
      payee: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber
      },
      payerMessage,
      payeeNote
    };

    const response = await fetch(`${this.config.endpoints.b2c}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Reference-Id': referenceId,
        'X-Target-Environment': this.config.environment,
        'Ocp-Apim-Subscription-Key': this.config.credentials.consumerKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`MTN transfer failed: ${response.statusText}`);
    }

    return { referenceId, status: 'PENDING' };
  }

  async getBalance(): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.config.endpoints.balance}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': this.config.environment,
        'Ocp-Apim-Subscription-Key': this.config.credentials.consumerKey
      }
    });

    if (!response.ok) {
      throw new Error(`MTN balance inquiry failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Multi-Provider Mobile Money Manager
export class MobileMoneyManager {
  private providers: Map<string, MpesaService | MTNMobileMoneyService> = new Map();

  constructor(configs: MobileMoneyConfig[]) {
    configs.forEach(config => {
      if (config.provider === 'mpesa') {
        this.providers.set('mpesa', new MpesaService(config));
      } else if (config.provider === 'mtn_momo') {
        this.providers.set('mtn_momo', new MTNMobileMoneyService(config));
      }
      // Add other providers as needed
    });
  }

  async initiatePayment(
    provider: string,
    phoneNumber: string,
    amount: number,
    currency: string,
    reference: string,
    description: string,
    callbackUrl?: string
  ): Promise<any> {
    const service = this.providers.get(provider);
    if (!service) {
      throw new Error(`Provider ${provider} not configured`);
    }

    if (provider === 'mpesa' && service instanceof MpesaService) {
      return service.initiateSTKPush(phoneNumber, amount, reference, description, callbackUrl!);
    } else if (provider === 'mtn_momo' && service instanceof MTNMobileMoneyService) {
      return service.requestToPay(phoneNumber, amount, currency, reference, description, description);
    }

    throw new Error(`Payment initiation not implemented for provider: ${provider}`);
  }

  async checkTransactionStatus(provider: string, transactionId: string): Promise<any> {
    const service = this.providers.get(provider);
    if (!service) {
      throw new Error(`Provider ${provider} not configured`);
    }

    if (provider === 'mpesa' && service instanceof MpesaService) {
      return service.querySTKStatus(transactionId);
    } else if (provider === 'mtn_momo' && service instanceof MTNMobileMoneyService) {
      return service.getTransactionStatus(transactionId);
    }

    throw new Error(`Status check not implemented for provider: ${provider}`);
  }

  async processWebhook(provider: string, webhookData: any): Promise<any> {
    const service = this.providers.get(provider);
    if (!service) {
      throw new Error(`Provider ${provider} not configured`);
    }

    if (provider === 'mpesa' && service instanceof MpesaService) {
      return service.processCallback(webhookData);
    }

    throw new Error(`Webhook processing not implemented for provider: ${provider}`);
  }

  async sendMoney(
    provider: string,
    phoneNumber: string,
    amount: number,
    currency: string,
    reference: string,
    message: string
  ): Promise<any> {
    const service = this.providers.get(provider);
    if (!service) {
      throw new Error(`Provider ${provider} not configured`);
    }

    if (provider === 'mpesa' && service instanceof MpesaService) {
      return service.initiateB2C(phoneNumber, amount, reference, message);
    } else if (provider === 'mtn_momo' && service instanceof MTNMobileMoneyService) {
      return service.transfer(phoneNumber, amount, currency, reference, message, message);
    }

    throw new Error(`Money transfer not implemented for provider: ${provider}`);
  }

  getSupportedProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  isProviderSupported(provider: string): boolean {
    return this.providers.has(provider);
  }
}

// Currency Conversion Service
export class CurrencyService {
  private rates: Map<string, number> = new Map();
  private lastUpdated: Date | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async updateRates(): Promise<void> {
    try {
      // Example using ExchangeRate-API or similar service
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      const data = await response.json();
      
      Object.entries(data.rates).forEach(([currency, rate]) => {
        this.rates.set(currency, rate as number);
      });
      
      this.lastUpdated = new Date();
    } catch (error) {
      console.error('Failed to update currency rates:', error);
      throw error;
    }
  }

  async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<CurrencyConversion> {
    if (!this.lastUpdated || Date.now() - this.lastUpdated.getTime() > 3600000) { // 1 hour
      await this.updateRates();
    }

    if (fromCurrency === toCurrency) {
      return {
        fromCurrency,
        toCurrency,
        amount,
        convertedAmount: amount,
        rate: 1,
        timestamp: new Date()
      };
    }

    const fromRate = this.rates.get(fromCurrency) || 1;
    const toRate = this.rates.get(toCurrency) || 1;
    const rate = toRate / fromRate;
    const convertedAmount = Math.round(amount * rate * 100) / 100;

    return {
      fromCurrency,
      toCurrency,
      amount,
      convertedAmount,
      rate,
      timestamp: new Date()
    };
  }

  getRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return 1;
    
    const fromRate = this.rates.get(fromCurrency) || 1;
    const toRate = this.rates.get(toCurrency) || 1;
    return toRate / fromRate;
  }

  getSupportedCurrencies(): string[] {
    return Array.from(this.rates.keys());
  }
}

// Default exports
export default {
  MpesaService,
  MTNMobileMoneyService,
  MobileMoneyManager,
  CurrencyService
};