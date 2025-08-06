import { QRCodeService, QRCodeData, BatchQRCode } from '../blockchain/qr-code-service';
import { TraceabilityBatch } from '@/types/traceability-system';
import { CropCalendar } from '@/types/smart-crop-calendar';

export interface SmartQRCodeData extends QRCodeData {
  // Enhanced data for smart crop calendar integration
  calendar_id?: string;
  growth_stage?: string;
  harvest_prediction?: {
    expected_date: string;
    expected_yield: number;
    quality_score: number;
  };
  sustainability_metrics?: {
    carbon_footprint: number;
    water_usage: number;
    organic_certified: boolean;
  };
  real_time_data?: {
    last_updated: string;
    current_growth_stage: string;
    health_score: number;
  };
}

export interface QRTrackingEvent {
  event_id: string;
  qr_code_id: string;
  batch_id: string;
  event_type: 'scan' | 'generate' | 'verify' | 'update' | 'expire';
  event_timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    country: string;
  };
  scanner_info?: {
    device_type: string;
    app_version: string;
    user_type: 'consumer' | 'retailer' | 'inspector' | 'farmer';
    user_id?: string;
  };
  additional_data?: any;
}

export interface QRAnalytics {
  total_qr_codes_generated: number;
  total_scans: number;
  unique_scanners: number;
  scan_by_location: { [country: string]: number };
  scan_by_user_type: { [type: string]: number };
  engagement_metrics: {
    average_scans_per_code: number;
    peak_scanning_times: string[];
    most_scanned_products: string[];
  };
  verification_metrics: {
    successful_verifications: number;
    failed_verifications: number;
    fraud_attempts: number;
  };
  consumer_insights: {
    top_information_accessed: string[];
    average_engagement_time: number;
    conversion_to_purchase: number;
  };
}

export class EnhancedQRService {
  private baseQRService: QRCodeService;
  private trackingEvents: QRTrackingEvent[] = [];
  private qrCodeRegistry = new Map<string, SmartQRCodeData>();

  constructor() {
    this.baseQRService = new QRCodeService(
      process.env.QR_SECRET_KEY || 'default-secret-key',
      process.env.BASE_URL || 'https://agrinexus.app'
    );
  }

  async generateSmartQRCode(
    batch: TraceabilityBatch,
    cropCalendar?: CropCalendar,
    options?: any
  ): Promise<BatchQRCode> {
    try {
      // Create enhanced QR data
      const smartQRData: SmartQRCodeData = {
        type: 'traceability',
        id: `smart_batch_${batch.batch_id}`,
        batchId: batch.batch_id,
        farmerId: batch.user_id,
        farmerName: `Farmer ${batch.user_id}`, // Would get actual name from user data
        cropType: batch.crop_variety_name,
        variety: batch.seed_variety,
        harvestDate: batch.harvest_date,
        location: {
          region: batch.field_location.region,
          country: batch.field_location.country,
          coordinates: {
            lat: batch.field_location.gps_coordinates.latitude,
            lng: batch.field_location.gps_coordinates.longitude
          }
        },
        certifications: batch.certifications.map(cert => cert.certification_name),
        verificationUrl: `${this.baseQRService['baseUrl']}/verify-batch/${batch.batch_id}`,
        generatedAt: new Date().toISOString(),
        signature: this.generateEnhancedSignature(batch),
        
        // Enhanced smart features
        calendar_id: cropCalendar?.id,
        growth_stage: batch.lifecycle_stage,
        harvest_prediction: cropCalendar ? {
          expected_date: cropCalendar.expected_harvest_date,
          expected_yield: cropCalendar.yield_target_kg_per_hectare,
          quality_score: cropCalendar.crop_health_score
        } : undefined,
        sustainability_metrics: {
          carbon_footprint: batch.carbon_footprint?.net_carbon_footprint_kg_co2_eq || 0,
          water_usage: batch.water_usage_records.reduce((sum, record) => sum + record.quantity_used_liters, 0),
          organic_certified: batch.organic_certified
        },
        real_time_data: {
          last_updated: new Date().toISOString(),
          current_growth_stage: batch.lifecycle_stage,
          health_score: cropCalendar?.crop_health_score || 85
        }
      };

      // Generate QR code using base service
      const batchQRCode = await this.baseQRService.generateBatchQRCode(
        batch.batch_id,
        batch.user_id,
        `Farmer ${batch.user_id}`,
        {
          cropType: batch.crop_variety_name,
          variety: batch.seed_variety,
          harvestDate: batch.harvest_date,
          location: {
            region: batch.field_location.region,
            country: batch.field_location.country,
            coordinates: {
              lat: batch.field_location.gps_coordinates.latitude,
              lng: batch.field_location.gps_coordinates.longitude
            }
          },
          certifications: batch.certifications.map(cert => cert.certification_name)
        },
        options
      );

      // Register the smart QR code
      this.qrCodeRegistry.set(smartQRData.id, smartQRData);

      // Track generation event
      await this.trackEvent({
        event_id: `gen_${Date.now()}`,
        qr_code_id: smartQRData.id,
        batch_id: batch.batch_id,
        event_type: 'generate',
        event_timestamp: new Date().toISOString()
      });

      // Update the batch QR code with smart data
      batchQRCode.qrCodeData = smartQRData;

      return batchQRCode;
    } catch (error) {
      console.error('Failed to generate smart QR code:', error);
      throw error;
    }
  }

  async trackQRScan(
    qrCodeId: string,
    scannerInfo: {
      location?: { lat: number; lng: number; address?: string; country?: string };
      device_type: string;
      app_version?: string;
      user_type: 'consumer' | 'retailer' | 'inspector' | 'farmer';
      user_id?: string;
    }
  ): Promise<void> {
    const qrData = this.qrCodeRegistry.get(qrCodeId);
    if (!qrData) {
      throw new Error('QR code not found');
    }

    await this.trackEvent({
      event_id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      qr_code_id: qrCodeId,
      batch_id: qrData.batchId || '',
      event_type: 'scan',
      event_timestamp: new Date().toISOString(),
      location: scannerInfo.location,
      scanner_info: {
        device_type: scannerInfo.device_type,
        app_version: scannerInfo.app_version || '1.0.0',
        user_type: scannerInfo.user_type,
        user_id: scannerInfo.user_id
      }
    });

    // Update scan count in QR data
    if (qrData.real_time_data) {
      qrData.real_time_data.last_updated = new Date().toISOString();
    }
  }

  async verifySmartQRCode(qrCodeId: string): Promise<{
    isValid: boolean;
    qrData: SmartQRCodeData;
    batchData?: TraceabilityBatch;
    calendarData?: CropCalendar;
    verificationDetails: {
      signature_valid: boolean;
      expiry_valid: boolean;
      blockchain_verified: boolean;
      real_time_data_fresh: boolean;
    };
    consumer_info: any;
  }> {
    const qrData = this.qrCodeRegistry.get(qrCodeId);
    if (!qrData) {
      throw new Error('QR code not found');
    }

    // Track verification attempt
    await this.trackEvent({
      event_id: `verify_${Date.now()}`,
      qr_code_id: qrCodeId,
      batch_id: qrData.batchId || '',
      event_type: 'verify',
      event_timestamp: new Date().toISOString()
    });

    // Perform verification checks
    const verificationDetails = {
      signature_valid: this.verifyEnhancedSignature(qrData),
      expiry_valid: !qrData.expiresAt || new Date(qrData.expiresAt) > new Date(),
      blockchain_verified: await this.verifyBlockchainRecord(qrData),
      real_time_data_fresh: this.isRealTimeDataFresh(qrData)
    };

    const isValid = Object.values(verificationDetails).every(Boolean);

    // Get additional data for consumer view
    const consumerInfo = await this.generateConsumerInfo(qrData);

    return {
      isValid,
      qrData,
      verificationDetails,
      consumer_info: consumerInfo
    };
  }

  async updateQRCodeWithRealTimeData(
    qrCodeId: string,
    realTimeData: {
      current_growth_stage?: string;
      health_score?: number;
      weather_conditions?: any;
      recent_activities?: any[];
      quality_updates?: any;
    }
  ): Promise<void> {
    const qrData = this.qrCodeRegistry.get(qrCodeId);
    if (!qrData) {
      throw new Error('QR code not found');
    }

    // Update real-time data
    qrData.real_time_data = {
      ...qrData.real_time_data,
      last_updated: new Date().toISOString(),
      current_growth_stage: realTimeData.current_growth_stage || qrData.real_time_data?.current_growth_stage || '',
      health_score: realTimeData.health_score || qrData.real_time_data?.health_score || 85
    };

    // Track update event
    await this.trackEvent({
      event_id: `update_${Date.now()}`,
      qr_code_id: qrCodeId,
      batch_id: qrData.batchId || '',
      event_type: 'update',
      event_timestamp: new Date().toISOString(),
      additional_data: realTimeData
    });
  }

  async generateQRAnalytics(
    filters?: {
      date_range?: { start: string; end: string };
      batch_ids?: string[];
      user_types?: string[];
      locations?: string[];
    }
  ): Promise<QRAnalytics> {
    let events = this.trackingEvents;

    // Apply filters
    if (filters) {
      if (filters.date_range) {
        events = events.filter(event => 
          event.event_timestamp >= filters.date_range!.start &&
          event.event_timestamp <= filters.date_range!.end
        );
      }
      
      if (filters.batch_ids) {
        events = events.filter(event => 
          filters.batch_ids!.includes(event.batch_id)
        );
      }
      
      if (filters.user_types) {
        events = events.filter(event => 
          event.scanner_info && filters.user_types!.includes(event.scanner_info.user_type)
        );
      }
    }

    const scanEvents = events.filter(e => e.event_type === 'scan');
    const generateEvents = events.filter(e => e.event_type === 'generate');
    const verifyEvents = events.filter(e => e.event_type === 'verify');

    // Calculate metrics
    const uniqueScanners = new Set(
      scanEvents
        .filter(e => e.scanner_info?.user_id)
        .map(e => e.scanner_info!.user_id!)
    ).size;

    const scansByLocation = scanEvents.reduce((acc, event) => {
      const country = event.location?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as { [country: string]: number });

    const scansByUserType = scanEvents.reduce((acc, event) => {
      const userType = event.scanner_info?.user_type || 'unknown';
      acc[userType] = (acc[userType] || 0) + 1;
      return acc;
    }, {} as { [type: string]: number });

    const qrCodeScanCounts = scanEvents.reduce((acc, event) => {
      acc[event.qr_code_id] = (acc[event.qr_code_id] || 0) + 1;
      return acc;
    }, {} as { [qrId: string]: number });

    const averageScansPerCode = Object.values(qrCodeScanCounts).length > 0
      ? Object.values(qrCodeScanCounts).reduce((sum, count) => sum + count, 0) / Object.values(qrCodeScanCounts).length
      : 0;

    const analytics: QRAnalytics = {
      total_qr_codes_generated: generateEvents.length,
      total_scans: scanEvents.length,
      unique_scanners: uniqueScanners,
      scan_by_location: scansByLocation,
      scan_by_user_type: scansByUserType,
      engagement_metrics: {
        average_scans_per_code: Math.round(averageScansPerCode * 100) / 100,
        peak_scanning_times: this.calculatePeakScanTimes(scanEvents),
        most_scanned_products: this.getMostScannedProducts(scanEvents)
      },
      verification_metrics: {
        successful_verifications: verifyEvents.length,
        failed_verifications: 0, // Would track from actual verification failures
        fraud_attempts: 0 // Would track from security violations
      },
      consumer_insights: {
        top_information_accessed: ['Origin information', 'Sustainability metrics', 'Farmer story'],
        average_engagement_time: 45, // seconds - would track actual engagement time
        conversion_to_purchase: 0.15 // 15% conversion rate - would track from actual data
      }
    };

    return analytics;
  }

  async generateQRBatch(
    batches: TraceabilityBatch[],
    calendars: Map<string, CropCalendar>,
    options?: any
  ): Promise<BatchQRCode[]> {
    const qrCodes: BatchQRCode[] = [];

    for (const batch of batches) {
      const calendar = calendars.get(batch.batch_id);
      const qrCode = await this.generateSmartQRCode(batch, calendar, options);
      qrCodes.push(qrCode);
    }

    return qrCodes;
  }

  async getQRTrackingHistory(
    qrCodeId: string
  ): Promise<QRTrackingEvent[]> {
    return this.trackingEvents.filter(event => event.qr_code_id === qrCodeId)
      .sort((a, b) => new Date(b.event_timestamp).getTime() - new Date(a.event_timestamp).getTime());
  }

  async generateConsumerQRCode(
    batchId: string,
    consumerFriendlyData: {
      product_name: string;
      farmer_story: string;
      sustainability_highlights: string[];
      quality_certifications: string[];
      recipe_suggestions: string[];
    }
  ): Promise<string> {
    const qrData = Array.from(this.qrCodeRegistry.values())
      .find(qr => qr.batchId === batchId);
    
    if (!qrData) {
      throw new Error('Batch QR code not found');
    }

    const consumerQRData = {
      ...qrData,
      consumer_data: consumerFriendlyData,
      verificationUrl: `${this.baseQRService['baseUrl']}/consumer-view/${batchId}`
    };

    // Generate consumer-friendly QR code (simplified data)
    const consumerQRString = JSON.stringify({
      batch_id: batchId,
      product: consumerFriendlyData.product_name,
      farmer: qrData.farmerName,
      origin: qrData.location.region,
      certifications: qrData.certifications.slice(0, 3), // Limit for QR size
      url: consumerQRData.verificationUrl
    });

    return btoa(consumerQRString); // Base64 encoded for simplicity
  }

  // Private helper methods
  private async trackEvent(event: QRTrackingEvent): Promise<void> {
    this.trackingEvents.push(event);
    
    // In a real implementation, this would persist to a database
    // For now, we'll keep it in memory with a size limit
    if (this.trackingEvents.length > 10000) {
      this.trackingEvents = this.trackingEvents.slice(-5000); // Keep last 5000 events
    }
  }

  private generateEnhancedSignature(batch: TraceabilityBatch): string {
    // Enhanced signature including batch-specific data
    const data = `${batch.batch_id}:${batch.user_id}:${batch.crop_variety_name}:${batch.harvest_date}:${batch.organic_certified}`;
    return btoa(data); // Simplified signature - would use proper cryptographic signing in production
  }

  private verifyEnhancedSignature(qrData: SmartQRCodeData): boolean {
    // Verify signature integrity
    return qrData.signature && qrData.signature.length > 10; // Simplified verification
  }

  private async verifyBlockchainRecord(qrData: SmartQRCodeData): Promise<boolean> {
    // In a real implementation, would verify against blockchain
    return qrData.blockchainTxId ? true : false;
  }

  private isRealTimeDataFresh(qrData: SmartQRCodeData): boolean {
    if (!qrData.real_time_data?.last_updated) return false;
    
    const lastUpdate = new Date(qrData.real_time_data.last_updated);
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceUpdate < 24; // Consider fresh if updated within 24 hours
  }

  private async generateConsumerInfo(qrData: SmartQRCodeData): Promise<any> {
    return {
      product_name: `${qrData.cropType} ${qrData.variety || ''}`.trim(),
      farm_location: `${qrData.location.region}, ${qrData.location.country}`,
      farmer_name: qrData.farmerName,
      harvest_date: qrData.harvestDate,
      certifications: qrData.certifications,
      sustainability_score: this.calculateSustainabilityScore(qrData),
      freshness_indicator: this.calculateFreshnessScore(qrData),
      story: this.generateFarmerStory(qrData),
      nutritional_highlights: this.getNutritionalHighlights(qrData.cropType),
      storage_tips: this.getStorageTips(qrData.cropType),
      recipe_suggestions: this.getRecipeSuggestions(qrData.cropType)
    };
  }

  private calculateSustainabilityScore(qrData: SmartQRCodeData): number {
    let score = 70; // Base score
    
    if (qrData.sustainability_metrics) {
      if (qrData.sustainability_metrics.organic_certified) score += 15;
      if (qrData.sustainability_metrics.carbon_footprint < 200) score += 10;
      if (qrData.sustainability_metrics.water_usage < 1000) score += 5;
    }
    
    return Math.min(100, score);
  }

  private calculateFreshnessScore(qrData: SmartQRCodeData): number {
    if (!qrData.harvestDate) return 50;
    
    const harvestDate = new Date(qrData.harvestDate);
    const daysSinceHarvest = (Date.now() - harvestDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceHarvest < 1) return 100;
    if (daysSinceHarvest < 3) return 90;
    if (daysSinceHarvest < 7) return 80;
    if (daysSinceHarvest < 14) return 70;
    return 60;
  }

  private generateFarmerStory(qrData: SmartQRCodeData): string {
    return `This ${qrData.cropType} was grown by ${qrData.farmerName} in ${qrData.location.region}, ${qrData.location.country}. ` +
           `Our farm has been committed to ${qrData.sustainability_metrics?.organic_certified ? 'organic' : 'sustainable'} ` +
           `farming practices, ensuring high-quality produce while caring for the environment.`;
  }

  private getNutritionalHighlights(cropType: string): string[] {
    const highlights: { [key: string]: string[] } = {
      'Maize': ['High in fiber', 'Good source of vitamin C', 'Contains antioxidants'],
      'Tomatoes': ['Rich in lycopene', 'High vitamin C content', 'Low in calories'],
      'Rice': ['Good source of energy', 'Gluten-free', 'Contains B vitamins'],
      'default': ['Natural and fresh', 'Farm-grown quality', 'Nutrient-rich']
    };
    
    return highlights[cropType] || highlights['default'];
  }

  private getStorageTips(cropType: string): string {
    const tips: { [key: string]: string } = {
      'Maize': 'Store in a cool, dry place. Can be refrigerated for up to one week.',
      'Tomatoes': 'Store at room temperature until ripe, then refrigerate for up to one week.',
      'Rice': 'Store in an airtight container in a cool, dry place for up to 2 years.',
      'default': 'Store in a cool, dry place away from direct sunlight.'
    };
    
    return tips[cropType] || tips['default'];
  }

  private getRecipeSuggestions(cropType: string): string[] {
    const recipes: { [key: string]: string[] } = {
      'Maize': ['Grilled corn on the cob', 'Corn salad', 'Corn bread'],
      'Tomatoes': ['Caprese salad', 'Tomato soup', 'Bruschetta'],
      'Rice': ['Fried rice', 'Rice pilaf', 'Rice pudding'],
      'default': ['Stir-fry', 'Salad', 'Soup']
    };
    
    return recipes[cropType] || recipes['default'];
  }

  private calculatePeakScanTimes(events: QRTrackingEvent[]): string[] {
    const hourCounts: { [hour: string]: number } = {};
    
    events.forEach(event => {
      const hour = new Date(event.event_timestamp).getHours();
      const hourKey = `${hour}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => hour);
  }

  private getMostScannedProducts(events: QRTrackingEvent[]): string[] {
    const productCounts: { [batchId: string]: number } = {};
    
    events.forEach(event => {
      productCounts[event.batch_id] = (productCounts[event.batch_id] || 0) + 1;
    });
    
    return Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([batchId]) => {
        const qrData = Array.from(this.qrCodeRegistry.values())
          .find(qr => qr.batchId === batchId);
        return qrData?.cropType || batchId;
      });
  }
}

export const enhancedQRService = new EnhancedQRService();