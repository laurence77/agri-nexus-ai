/**
 * QR Code Service for Agricultural Traceability
 * Generates and manages QR codes for crop batches, marketplace listings, and traceability records
 * Integrates with blockchain for tamper-proof verification
 */

import QRCode from 'qrcode';
import jsQR from 'jsqr';
import crypto from 'crypto';

export interface QRCodeData {
  type: 'traceability' | 'marketplace' | 'batch' | 'product' | 'certificate';
  id: string;
  batchId?: string;
  farmerId: string;
  farmerName: string;
  cropType: string;
  variety?: string;
  harvestDate?: string;
  location: {
    region: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  certifications: string[];
  blockchainTxId?: string;
  verificationUrl: string;
  generatedAt: string;
  expiresAt?: string;
  signature: string;
}

export interface QRCodeOptions {
  size: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  format: 'png' | 'svg' | 'pdf';
  logo?: {
    src: string;
    width: number;
    height: number;
  };
}

export interface BatchQRCode {
  batchId: string;
  qrCodeUrl: string;
  qrCodeData: QRCodeData;
  printableUrl: string;
  verificationUrl: string;
  generatedAt: Date;
  expiresAt?: Date;
}

export interface TraceabilityVerification {
  isValid: boolean;
  qrData: QRCodeData;
  blockchainVerified: boolean;
  traceabilityRecord?: any;
  verificationTimestamp: Date;
  errors: string[];
}

/**
 * QR Code Service for Agricultural Supply Chain
 */
export class QRCodeService {
  private secretKey: string;
  private baseUrl: string;
  private defaultOptions: QRCodeOptions;

  constructor(secretKey: string, baseUrl: string) {
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      size: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M',
      format: 'png'
    };
  }

  /**
   * Generate QR code for crop batch traceability
   */
  async generateBatchQRCode(
    batchId: string,
    farmerId: string,
    farmerName: string,
    cropData: {
      cropType: string;
      variety?: string;
      harvestDate?: string;
      location: {
        region: string;
        country: string;
        coordinates?: { lat: number; lng: number };
      };
      certifications: string[];
    },
    options?: Partial<QRCodeOptions>
  ): Promise<BatchQRCode> {
    try {
      const qrOptions = { ...this.defaultOptions, ...options };
      
      // Create QR code data
      const qrData: QRCodeData = {
        type: 'batch',
        id: `batch_${batchId}`,
        batchId,
        farmerId,
        farmerName,
        cropType: cropData.cropType,
        variety: cropData.variety,
        harvestDate: cropData.harvestDate,
        location: cropData.location,
        certifications: cropData.certifications,
        verificationUrl: `${this.baseUrl}/verify/${batchId}`,
        generatedAt: new Date().toISOString(),
        signature: this.generateSignature(batchId, farmerId, cropData.cropType)
      };

      // Generate QR code image
      const qrCodeUrl = await this.generateQRCodeImage(qrData, qrOptions);

      // Generate printable version with additional info
      const printableUrl = await this.generatePrintableQRCode(qrData, qrOptions);

      return {
        batchId,
        qrCodeUrl,
        qrCodeData: qrData,
        printableUrl,
        verificationUrl: qrData.verificationUrl,
        generatedAt: new Date(),
        expiresAt: options?.format === 'certificate' ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : // 1 year for certificates
          undefined
      };
    } catch (error) {
      console.error('Failed to generate batch QR code:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for marketplace listing
   */
  async generateMarketplaceQRCode(
    listingId: string,
    sellerId: string,
    sellerName: string,
    listingData: {
      cropType: string;
      variety?: string;
      quantity: number;
      pricePerUnit: number;
      currency: string;
      qualityGrade: string;
      certifications: string[];
      location: {
        region: string;
        country: string;
      };
    },
    options?: Partial<QRCodeOptions>
  ): Promise<string> {
    try {
      const qrOptions = { ...this.defaultOptions, ...options };
      
      const qrData: QRCodeData = {
        type: 'marketplace',
        id: `listing_${listingId}`,
        farmerId: sellerId,
        farmerName: sellerName,
        cropType: listingData.cropType,
        variety: listingData.variety,
        location: listingData.location,
        certifications: listingData.certifications,
        verificationUrl: `${this.baseUrl}/marketplace/${listingId}`,
        generatedAt: new Date().toISOString(),
        signature: this.generateSignature(listingId, sellerId, listingData.cropType)
      };

      return await this.generateQRCodeImage(qrData, qrOptions);
    } catch (error) {
      console.error('Failed to generate marketplace QR code:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for certification
   */
  async generateCertificationQRCode(
    certificateId: string,
    farmerId: string,
    farmerName: string,
    certificationData: {
      certificationBody: string;
      certificationType: string;
      certificationNumber: string;
      issuedDate: string;
      expiryDate: string;
      scope: string;
      location: {
        region: string;
        country: string;
      };
    },
    options?: Partial<QRCodeOptions>
  ): Promise<string> {
    try {
      const qrOptions = { ...this.defaultOptions, ...options };
      
      const qrData: QRCodeData = {
        type: 'certificate',
        id: `cert_${certificateId}`,
        farmerId,
        farmerName,
        cropType: certificationData.scope,
        location: certificationData.location,
        certifications: [certificationData.certificationType],
        verificationUrl: `${this.baseUrl}/certificate/${certificateId}`,
        generatedAt: new Date().toISOString(),
        expiresAt: certificationData.expiryDate,
        signature: this.generateSignature(certificateId, farmerId, certificationData.certificationType)
      };

      return await this.generateQRCodeImage(qrData, qrOptions);
    } catch (error) {
      console.error('Failed to generate certification QR code:', error);
      throw error;
    }
  }

  /**
   * Generate QR code image from data
   */
  private async generateQRCodeImage(
    data: QRCodeData,
    options: QRCodeOptions
  ): Promise<string> {
    try {
      const qrString = JSON.stringify(data);
      
      const qrCodeOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel,
        type: options.format === 'png' ? 'image/png' as const : 'image/svg+xml' as const,
        quality: 0.92,
        margin: options.margin,
        color: {
          dark: options.color.dark,
          light: options.color.light,
        },
        width: options.size,
      };

      // Generate base QR code
      const qrCodeDataURL = await QRCode.toDataURL(qrString, qrCodeOptions);

      // Add logo if specified
      if (options.logo) {
        return await this.addLogoToQRCode(qrCodeDataURL, options.logo);
      }

      return qrCodeDataURL;
    } catch (error) {
      console.error('Failed to generate QR code image:', error);
      throw error;
    }
  }

  /**
   * Generate printable QR code with additional information
   */
  private async generatePrintableQRCode(
    data: QRCodeData,
    options: QRCodeOptions
  ): Promise<string> {
    try {
      // This would generate a PDF or HTML template with QR code and details
      // For now, return the same QR code URL
      return await this.generateQRCodeImage(data, options);
    } catch (error) {
      console.error('Failed to generate printable QR code:', error);
      throw error;
    }
  }

  /**
   * Add logo to QR code
   */
  private async addLogoToQRCode(
    qrCodeDataURL: string,
    logo: { src: string; width: number; height: number }
  ): Promise<string> {
    try {
      // This would use canvas or image manipulation library
      // to overlay logo on QR code center
      // For now, return original QR code
      return qrCodeDataURL;
    } catch (error) {
      console.error('Failed to add logo to QR code:', error);
      return qrCodeDataURL;
    }
  }

  /**
   * Decode QR code from image data
   */
  async decodeQRCode(imageData: Uint8ClampedArray, width: number, height: number): Promise<QRCodeData | null> {
    try {
      const code = jsQR(imageData, width, height);
      
      if (!code) {
        return null;
      }

      const qrData = JSON.parse(code.data) as QRCodeData;
      
      // Verify signature
      if (!this.verifySignature(qrData)) {
        throw new Error('Invalid QR code signature');
      }

      return qrData;
    } catch (error) {
      console.error('Failed to decode QR code:', error);
      throw error;
    }
  }

  /**
   * Verify QR code authenticity and get traceability data
   */
  async verifyQRCode(
    qrData: QRCodeData,
    blockchainService?: any
  ): Promise<TraceabilityVerification> {
    try {
      const verification: TraceabilityVerification = {
        isValid: false,
        qrData,
        blockchainVerified: false,
        verificationTimestamp: new Date(),
        errors: []
      };

      // 1. Verify signature
      if (!this.verifySignature(qrData)) {
        verification.errors.push('Invalid signature');
        return verification;
      }

      // 2. Check expiry
      if (qrData.expiresAt && new Date(qrData.expiresAt) < new Date()) {
        verification.errors.push('QR code has expired');
        return verification;
      }

      // 3. Verify with blockchain if service provided
      if (blockchainService && qrData.blockchainTxId) {
        try {
          const blockchainRecord = await blockchainService.getTraceabilityRecord(qrData.id);
          if (blockchainRecord) {
            verification.blockchainVerified = true;
            verification.traceabilityRecord = blockchainRecord;
          }
        } catch (error) {
          verification.errors.push('Blockchain verification failed');
        }
      }

      // 4. Additional validations
      if (!qrData.farmerId || !qrData.cropType) {
        verification.errors.push('Missing required data fields');
        return verification;
      }

      // If no errors, mark as valid
      if (verification.errors.length === 0) {
        verification.isValid = true;
      }

      return verification;
    } catch (error) {
      console.error('Failed to verify QR code:', error);
      return {
        isValid: false,
        qrData,
        blockchainVerified: false,
        verificationTimestamp: new Date(),
        errors: [`Verification error: ${error.message}`]
      };
    }
  }

  /**
   * Generate digital signature for QR code data
   */
  private generateSignature(id: string, farmerId: string, cropType: string): string {
    const data = `${id}:${farmerId}:${cropType}:${new Date().toISOString().split('T')[0]}`;
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }

  /**
   * Verify digital signature
   */
  private verifySignature(qrData: QRCodeData): boolean {
    try {
      const data = `${qrData.id}:${qrData.farmerId}:${qrData.cropType}:${qrData.generatedAt.split('T')[0]}`;
      const expectedSignature = crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
      return expectedSignature === qrData.signature;
    } catch (error) {
      console.error('Failed to verify signature:', error);
      return false;
    }
  }

  /**
   * Generate batch QR codes for multiple products
   */
  async generateBatchQRCodes(
    batches: Array<{
      batchId: string;
      farmerId: string;
      farmerName: string;
      cropData: {
        cropType: string;
        variety?: string;
        harvestDate?: string;
        location: {
          region: string;
          country: string;
          coordinates?: { lat: number; lng: number };
        };
        certifications: string[];
      };
    }>,
    options?: Partial<QRCodeOptions>
  ): Promise<BatchQRCode[]> {
    try {
      const qrCodes = await Promise.all(
        batches.map(batch => 
          this.generateBatchQRCode(
            batch.batchId,
            batch.farmerId,
            batch.farmerName,
            batch.cropData,
            options
          )
        )
      );

      return qrCodes;
    } catch (error) {
      console.error('Failed to generate batch QR codes:', error);
      throw error;
    }
  }

  /**
   * Update QR code with blockchain transaction ID
   */
  async updateQRCodeWithBlockchainTx(
    qrData: QRCodeData,
    transactionId: string
  ): Promise<QRCodeData> {
    const updatedData = {
      ...qrData,
      blockchainTxId: transactionId,
      signature: this.generateSignature(qrData.id, qrData.farmerId, qrData.cropType)
    };

    return updatedData;
  }

  /**
   * Generate QR code analytics
   */
  getQRCodeAnalytics(qrCodes: BatchQRCode[]): {
    totalGenerated: number;
    byType: Record<string, number>;
    byCrop: Record<string, number>;
    byRegion: Record<string, number>;
    expiringCodes: BatchQRCode[];
  } {
    const analytics = {
      totalGenerated: qrCodes.length,
      byType: {} as Record<string, number>,
      byCrop: {} as Record<string, number>,
      byRegion: {} as Record<string, number>,
      expiringCodes: [] as BatchQRCode[]
    };

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    qrCodes.forEach(qr => {
      // By type
      analytics.byType[qr.qrCodeData.type] = (analytics.byType[qr.qrCodeData.type] || 0) + 1;
      
      // By crop
      analytics.byCrop[qr.qrCodeData.cropType] = (analytics.byCrop[qr.qrCodeData.cropType] || 0) + 1;
      
      // By region
      analytics.byRegion[qr.qrCodeData.location.region] = (analytics.byRegion[qr.qrCodeData.location.region] || 0) + 1;
      
      // Expiring codes
      if (qr.expiresAt && qr.expiresAt <= thirtyDaysFromNow) {
        analytics.expiringCodes.push(qr);
      }
    });

    return analytics;
  }

  /**
   * Validate QR code format
   */
  validateQRCodeFormat(qrData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!qrData.type || !['traceability', 'marketplace', 'batch', 'product', 'certificate'].includes(qrData.type)) {
      errors.push('Invalid or missing QR code type');
    }

    if (!qrData.id) {
      errors.push('Missing QR code ID');
    }

    if (!qrData.farmerId) {
      errors.push('Missing farmer ID');
    }

    if (!qrData.farmerName) {
      errors.push('Missing farmer name');
    }

    if (!qrData.cropType) {
      errors.push('Missing crop type');
    }

    if (!qrData.location || !qrData.location.region || !qrData.location.country) {
      errors.push('Invalid or missing location data');
    }

    if (!qrData.verificationUrl) {
      errors.push('Missing verification URL');
    }

    if (!qrData.generatedAt) {
      errors.push('Missing generation timestamp');
    }

    if (!qrData.signature) {
      errors.push('Missing digital signature');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default QRCodeService;