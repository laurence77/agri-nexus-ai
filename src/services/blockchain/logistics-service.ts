/**
 * Logistics Management Service for Agricultural Supply Chain
 * Tracks crop movement from farm to consumer with blockchain integration
 * Manages transportation, storage, and delivery logistics
 */

import { FabricNetworkService, TraceabilityRecord } from './fabric-network';
import { QRCodeService } from './qr-code-service';

export interface LogisticsRoute {
  id: string;
  batchId: string;
  routeName: string;
  status: 'planned' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  priority: 'standard' | 'express' | 'urgent';
  checkpoints: LogisticsCheckpoint[];
  estimatedDuration: number; // hours
  actualDuration?: number; // hours
  totalDistance: number; // kilometers
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface LogisticsCheckpoint {
  id: string;
  routeId: string;
  sequence: number;
  type: 'pickup' | 'storage' | 'inspection' | 'transport' | 'delivery';
  location: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    region: string;
    country: string;
  };
  facility?: {
    id: string;
    name: string;
    type: 'farm' | 'warehouse' | 'processing_plant' | 'distribution_center' | 'retail' | 'consumer';
    certifications: string[];
    capacity: number;
    currentLoad: number;
    conditions: {
      temperature: { min: number; max: number; current?: number };
      humidity: { min: number; max: number; current?: number };
      controlled: boolean;
    };
  };
  vehicle?: {
    id: string;
    type: 'truck' | 'van' | 'motorcycle' | 'bicycle' | 'boat' | 'rail';
    licensePlate: string;
    driver: {
      id: string;
      name: string;
      license: string;
      rating: number;
    };
    capacity: number;
    refrigerated: boolean;
    gpsEnabled: boolean;
  };
  schedule: {
    estimatedArrival: Date;
    actualArrival?: Date;
    estimatedDeparture: Date;
    actualDeparture?: Date;
    duration: number; // minutes
  };
  conditions: {
    temperature?: number;
    humidity?: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    notes: string;
  };
  documentation: {
    photos: string[];
    certificates: string[];
    inspectionReports: string[];
    signatureRequired: boolean;
    signature?: string;
    signedBy?: string;
    signedAt?: Date;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface StorageFacility {
  id: string;
  name: string;
  type: 'cold_storage' | 'dry_storage' | 'controlled_atmosphere' | 'warehouse' | 'silo';
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    region: string;
    country: string;
  };
  capacity: {
    total: number;
    available: number;
    unit: 'tons' | 'cubic_meters' | 'pallets';
  };
  conditions: {
    temperatureRange: { min: number; max: number };
    humidityRange: { min: number; max: number };
    atmosphereControlled: boolean;
    pestControlled: boolean;
  };
  certifications: string[];
  operatingHours: {
    open: string;
    close: string;
    timezone: string;
  };
  contact: {
    manager: string;
    phone: string;
    email: string;
  };
  costs: {
    dailyRate: number;
    handlingFee: number;
    currency: string;
  };
  status: 'operational' | 'maintenance' | 'full' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface TransportationProvider {
  id: string;
  name: string;
  type: 'individual' | 'company' | 'cooperative';
  serviceArea: string[];
  vehicles: Array<{
    id: string;
    type: string;
    capacity: number;
    refrigerated: boolean;
    available: boolean;
  }>;
  specializations: string[];
  ratings: {
    overall: number;
    onTime: number;
    quality: number;
    communication: number;
    totalReviews: number;
  };
  pricing: {
    baseRate: number;
    perKilometer: number;
    perHour: number;
    refrigeratedSurcharge: number;
    currency: string;
  };
  contact: {
    primary: string;
    phone: string;
    email: string;
    whatsapp?: string;
  };
  certifications: string[];
  insurance: {
    provider: string;
    coverage: number;
    expiryDate: Date;
  };
  status: 'active' | 'busy' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryOrder {
  id: string;
  batchId: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  quantity: number;
  unit: string;
  deliveryAddress: {
    recipient: string;
    phone: string;
    address: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  };
  deliveryWindow: {
    earliest: Date;
    latest: Date;
    preferred?: Date;
  };
  specialInstructions: string;
  deliveryType: 'standard' | 'express' | 'scheduled' | 'pickup';
  paymentStatus: 'pending' | 'paid' | 'cod' | 'escrow';
  status: 'created' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  assignedProvider?: string;
  assignedVehicle?: string;
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  trackingNumber: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}

/**
 * Logistics Management Service
 */
export class LogisticsService {
  private blockchainService: FabricNetworkService;
  private qrCodeService: QRCodeService;
  private providers: Map<string, TransportationProvider> = new Map();
  private facilities: Map<string, StorageFacility> = new Map();

  constructor(
    blockchainService: FabricNetworkService,
    qrCodeService: QRCodeService
  ) {
    this.blockchainService = blockchainService;
    this.qrCodeService = qrCodeService;
  }

  /**
   * Create logistics route for batch transportation
   */
  async createLogisticsRoute(
    batchId: string,
    origin: { lat: number; lng: number; address: string },
    destination: { lat: number; lng: number; address: string },
    checkpoints: Omit<LogisticsCheckpoint, 'id' | 'routeId' | 'createdAt' | 'updatedAt'>[] = [],
    options: {
      priority?: 'standard' | 'express' | 'urgent';
      maxDuration?: number;
      temperatureControlled?: boolean;
      specialRequirements?: string[];
    } = {}
  ): Promise<LogisticsRoute> {
    try {
      const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate route distance and duration
      const { distance, duration } = await this.calculateRouteMetrics(origin, destination, checkpoints);
      
      // Create checkpoints with IDs
      const routeCheckpoints: LogisticsCheckpoint[] = checkpoints.map((checkpoint, index) => ({
        ...checkpoint,
        id: `checkpoint_${routeId}_${index}`,
        routeId,
        sequence: index + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const route: LogisticsRoute = {
        id: routeId,
        batchId,
        routeName: `${origin.address} → ${destination.address}`,
        status: 'planned',
        priority: options.priority || 'standard',
        checkpoints: routeCheckpoints,
        estimatedDuration: duration,
        totalDistance: distance,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Record route creation on blockchain
      await this.recordLogisticsEvent(batchId, {
        type: 'route_created',
        routeId,
        data: route,
        timestamp: new Date()
      });

      console.log('Logistics route created:', routeId);
      return route;
    } catch (error) {
      console.error('Failed to create logistics route:', error);
      throw error;
    }
  }

  /**
   * Update checkpoint status
   */
  async updateCheckpoint(
    routeId: string,
    checkpointId: string,
    updates: {
      status?: LogisticsCheckpoint['status'];
      actualArrival?: Date;
      actualDeparture?: Date;
      conditions?: Partial<LogisticsCheckpoint['conditions']>;
      documentation?: Partial<LogisticsCheckpoint['documentation']>;
    }
  ): Promise<void> {
    try {
      // Update checkpoint data
      // In a real implementation, this would update the database
      
      // Record checkpoint update on blockchain
      await this.recordLogisticsEvent(routeId, {
        type: 'checkpoint_updated',
        checkpointId,
        data: updates,
        timestamp: new Date()
      });

      console.log('Checkpoint updated:', checkpointId);
    } catch (error) {
      console.error('Failed to update checkpoint:', error);
      throw error;
    }
  }

  /**
   * Track batch location in real-time
   */
  async trackBatchLocation(batchId: string): Promise<{
    currentLocation: { lat: number; lng: number; address: string };
    currentCheckpoint?: LogisticsCheckpoint;
    nextCheckpoint?: LogisticsCheckpoint;
    estimatedArrival?: Date;
    status: string;
    lastUpdate: Date;
  }> {
    try {
      // In a real implementation, this would query GPS/IoT devices
      // For now, return mock tracking data
      const mockLocation = {
        currentLocation: {
          lat: -1.2921,
          lng: 36.8219,
          address: "Nairobi, Kenya"
        },
        status: 'in_transit',
        lastUpdate: new Date()
      };

      return mockLocation;
    } catch (error) {
      console.error('Failed to track batch location:', error);
      throw error;
    }
  }

  /**
   * Find optimal transportation provider
   */
  async findOptimalProvider(
    requirements: {
      origin: { lat: number; lng: number };
      destination: { lat: number; lng: number };
      quantity: number;
      unit: string;
      deliveryDate: Date;
      temperatureControlled?: boolean;
      specialRequirements?: string[];
    }
  ): Promise<{
    provider: TransportationProvider;
    estimatedCost: number;
    estimatedDuration: number;
    vehicle: any;
  }[]> {
    try {
      const availableProviders: {
        provider: TransportationProvider;
        estimatedCost: number;
        estimatedDuration: number;
        vehicle: any;
      }[] = [];

      // Mock provider matching logic
      for (const [id, provider] of this.providers) {
        if (provider.status !== 'active') continue;

        // Find suitable vehicle
        const suitableVehicle = provider.vehicles.find(vehicle => 
          vehicle.available && 
          vehicle.capacity >= requirements.quantity &&
          (!requirements.temperatureControlled || vehicle.refrigerated)
        );

        if (suitableVehicle) {
          const distance = await this.calculateDistance(requirements.origin, requirements.destination);
          const estimatedCost = this.calculateTransportCost(provider, distance, requirements.quantity);
          const estimatedDuration = this.calculateTravelTime(distance, suitableVehicle.type);

          availableProviders.push({
            provider,
            estimatedCost,
            estimatedDuration,
            vehicle: suitableVehicle
          });
        }
      }

      // Sort by cost and rating
      return availableProviders.sort((a, b) => 
        (a.estimatedCost / a.provider.ratings.overall) - (b.estimatedCost / b.provider.ratings.overall)
      );
    } catch (error) {
      console.error('Failed to find optimal provider:', error);
      throw error;
    }
  }

  /**
   * Create delivery order
   */
  async createDeliveryOrder(orderData: Omit<DeliveryOrder, 'id' | 'status' | 'trackingNumber' | 'createdAt' | 'updatedAt'>): Promise<DeliveryOrder> {
    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const trackingNumber = this.generateTrackingNumber();

      const order: DeliveryOrder = {
        ...orderData,
        id: orderId,
        status: 'created',
        trackingNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Record order creation on blockchain
      await this.recordLogisticsEvent(orderData.batchId, {
        type: 'delivery_order_created',
        orderId,
        data: order,
        timestamp: new Date()
      });

      console.log('Delivery order created:', orderId);
      return order;
    } catch (error) {
      console.error('Failed to create delivery order:', error);
      throw error;
    }
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    orderId: string,
    status: DeliveryOrder['status'],
    location?: { lat: number; lng: number; address: string },
    notes?: string
  ): Promise<void> {
    try {
      const updateData = {
        status,
        location,
        notes,
        timestamp: new Date()
      };

      // Record status update on blockchain
      await this.recordLogisticsEvent(orderId, {
        type: 'delivery_status_updated',
        orderId,
        data: updateData,
        timestamp: new Date()
      });

      console.log('Delivery status updated:', orderId, status);
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      throw error;
    }
  }

  /**
   * Register storage facility
   */
  async registerStorageFacility(facility: Omit<StorageFacility, 'id' | 'createdAt' | 'updatedAt'>): Promise<StorageFacility> {
    try {
      const facilityId = `facility_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newFacility: StorageFacility = {
        ...facility,
        id: facilityId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.facilities.set(facilityId, newFacility);

      console.log('Storage facility registered:', facilityId);
      return newFacility;
    } catch (error) {
      console.error('Failed to register storage facility:', error);
      throw error;
    }
  }

  /**
   * Register transportation provider
   */
  async registerTransportationProvider(provider: Omit<TransportationProvider, 'id' | 'createdAt' | 'updatedAt'>): Promise<TransportationProvider> {
    try {
      const providerId = `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newProvider: TransportationProvider = {
        ...provider,
        id: providerId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.providers.set(providerId, newProvider);

      console.log('Transportation provider registered:', providerId);
      return newProvider;
    } catch (error) {
      console.error('Failed to register transportation provider:', error);
      throw error;
    }
  }

  /**
   * Find available storage facilities
   */
  async findStorageFacilities(
    location: { lat: number; lng: number },
    requirements: {
      capacity: number;
      storageType: string;
      temperatureControlled?: boolean;
      maxDistance?: number; // km
    }
  ): Promise<StorageFacility[]> {
    try {
      const availableFacilities: StorageFacility[] = [];

      for (const [id, facility] of this.facilities) {
        if (facility.status !== 'operational') continue;
        if (facility.capacity.available < requirements.capacity) continue;

        // Check distance if specified
        if (requirements.maxDistance) {
          const distance = await this.calculateDistance(
            location,
            facility.location.coordinates
          );
          if (distance > requirements.maxDistance) continue;
        }

        // Check storage type compatibility
        if (requirements.storageType && facility.type !== requirements.storageType) {
          continue;
        }

        // Check temperature control requirements
        if (requirements.temperatureControlled && !facility.conditions.atmosphereControlled) {
          continue;
        }

        availableFacilities.push(facility);
      }

      // Sort by available capacity and distance
      return availableFacilities.sort((a, b) => b.capacity.available - a.capacity.available);
    } catch (error) {
      console.error('Failed to find storage facilities:', error);
      throw error;
    }
  }

  /**
   * Generate logistics report
   */
  async generateLogisticsReport(
    batchId: string
  ): Promise<{
    batchId: string;
    totalDistance: number;
    totalDuration: number;
    checkpoints: LogisticsCheckpoint[];
    costs: {
      transportation: number;
      storage: number;
      handling: number;
      total: number;
      currency: string;
    };
    sustainability: {
      carbonFootprint: number;
      fuelConsumption: number;
      efficiencyScore: number;
    };
    quality: {
      temperatureBreaches: number;
      qualityScore: number;
      incidents: any[];
    };
  }> {
    try {
      // Get logistics history from blockchain
      const history = await this.blockchainService.getTransactionHistory(batchId, 'traceability');
      
      // Calculate metrics
      const report = {
        batchId,
        totalDistance: 0,
        totalDuration: 0,
        checkpoints: [],
        costs: {
          transportation: 0,
          storage: 0,
          handling: 0,
          total: 0,
          currency: 'USD'
        },
        sustainability: {
          carbonFootprint: 0,
          fuelConsumption: 0,
          efficiencyScore: 85
        },
        quality: {
          temperatureBreaches: 0,
          qualityScore: 92,
          incidents: []
        }
      };

      // Process history and calculate metrics
      // This would be implemented based on actual data structure

      return report;
    } catch (error) {
      console.error('Failed to generate logistics report:', error);
      throw error;
    }
  }

  /**
   * Record logistics event on blockchain
   */
  private async recordLogisticsEvent(
    batchId: string,
    event: {
      type: string;
      data: any;
      timestamp: Date;
      [key: string]: any;
    }
  ): Promise<void> {
    try {
      // Update traceability record with logistics event
      await this.blockchainService.updateTraceabilityRecord(batchId, {
        transport: [{
          carrier: event.data.provider?.name || 'Unknown',
          vehicleId: event.data.vehicle?.id || 'Unknown',
          startLocation: event.data.origin?.address || 'Unknown',
          endLocation: event.data.destination?.address || 'Unknown',
          startDate: event.timestamp.toISOString(),
          conditions: 'Good'
        }]
      });
    } catch (error) {
      console.error('Failed to record logistics event:', error);
      // Don't throw, as this is supplementary
    }
  }

  /**
   * Calculate route metrics (distance and duration)
   */
  private async calculateRouteMetrics(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    checkpoints: any[]
  ): Promise<{ distance: number; duration: number }> {
    // Mock calculation - in production, use routing service
    const distance = await this.calculateDistance(origin, destination);
    const duration = this.calculateTravelTime(distance, 'truck');
    
    return { distance, duration };
  }

  /**
   * Calculate distance between two points
   */
  private async calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): Promise<number> {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate transportation cost
   */
  private calculateTransportCost(
    provider: TransportationProvider,
    distance: number,
    quantity: number
  ): number {
    const baseCost = provider.pricing.baseRate;
    const distanceCost = provider.pricing.perKilometer * distance;
    const quantityMultiplier = Math.ceil(quantity / 1000); // Per ton
    
    return (baseCost + distanceCost) * quantityMultiplier;
  }

  /**
   * Calculate travel time
   */
  private calculateTravelTime(distance: number, vehicleType: string): number {
    const speeds = {
      truck: 60, // km/h
      van: 70,
      motorcycle: 50,
      bicycle: 15,
      boat: 25,
      rail: 80
    };

    const speed = speeds[vehicleType as keyof typeof speeds] || 60;
    return distance / speed; // hours
  }

  /**
   * Generate tracking number
   */
  private generateTrackingNumber(): string {
    const prefix = 'AGN';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
}

export default LogisticsService;