/**
 * Hyperledger Fabric Network Service
 * Manages blockchain connectivity, smart contract invocation, and network operations
 * Designed for agricultural supply chain traceability and marketplace transactions
 */

import { Gateway, Wallets, Contract, Network, Transaction } from 'fabric-network';
import { FabricCAServices, IdentityService } from 'fabric-ca-client';
import * as fs from 'fs';
import * as path from 'path';

export interface BlockchainConfig {
  networkName: string;
  channelName: string;
  chaincodeName: string;
  connectionProfile: string;
  walletPath: string;
  caUrl: string;
  mspId: string;
  adminUserId: string;
  adminUserPasswd: string;
}

export interface TraceabilityRecord {
  id: string;
  batchId: string;
  farmerId: string;
  farmerName: string;
  cropType: string;
  variety: string;
  plantingDate: string;
  harvestDate?: string;
  location: {
    latitude: number;
    longitude: number;
    region: string;
    country: string;
  };
  certifications: string[];
  treatments: Array<{
    type: 'fertilizer' | 'pesticide' | 'organic_treatment' | 'irrigation';
    name: string;
    date: string;
    quantity: string;
    operator: string;
  }>;
  qualityTests: Array<{
    testType: string;
    result: string;
    date: string;
    lab: string;
    certificate: string;
  }>;
  storage: Array<{
    facility: string;
    temperature: number;
    humidity: number;
    date: string;
    conditions: string;
  }>;
  transport: Array<{
    carrier: string;
    vehicleId: string;
    startLocation: string;
    endLocation: string;
    startDate: string;
    endDate?: string;
    temperature?: number;
    conditions: string;
  }>;
  marketplace: {
    listingId?: string;
    price?: number;
    currency: string;
    status: 'available' | 'reserved' | 'sold' | 'expired';
    listedDate?: string;
    soldDate?: string;
    buyerId?: string;
  };
  sustainability: {
    carbonFootprint: number;
    waterUsage: number;
    energyConsumption: number;
    organicCertified: boolean;
    fairTradeCertified: boolean;
  };
  timestamps: {
    created: string;
    updated: string;
    blockNumber?: number;
    transactionId?: string;
  };
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  batchId: string;
  cropType: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  totalValue: number;
  qualityGrade: string;
  certifications: string[];
  availableFrom: string;
  expiryDate: string;
  location: {
    region: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  images: string[];
  description: string;
  minOrderQuantity: number;
  deliveryOptions: Array<{
    type: 'pickup' | 'delivery' | 'shipping';
    cost: number;
    estimatedDays: number;
  }>;
  paymentTerms: {
    acceptedMethods: string[];
    advancePercentage: number;
    escrowRequired: boolean;
  };
  status: 'active' | 'reserved' | 'sold' | 'expired' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

export interface EscrowTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released' | 'disputed' | 'refunded';
  milestones: Array<{
    description: string;
    completed: boolean;
    completedAt?: string;
    evidence?: string[];
  }>;
  disputeReason?: string;
  mediatorId?: string;
  createdAt: string;
  updatedAt: string;
  releasedAt?: string;
}

/**
 * Hyperledger Fabric Network Service
 */
export class FabricNetworkService {
  private gateway: Gateway;
  private network: Network;
  private contract: Contract;
  private config: BlockchainConfig;
  private isConnected: boolean = false;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.gateway = new Gateway();
  }

  /**
   * Initialize and connect to Hyperledger Fabric network
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Hyperledger Fabric connection...');

      // Load connection profile
      const connectionProfile = JSON.parse(
        fs.readFileSync(this.config.connectionProfile, 'utf8')
      );

      // Load wallet
      const wallet = await Wallets.newFileSystemWallet(this.config.walletPath);

      // Check if admin user exists in wallet
      const adminIdentity = await wallet.get(this.config.adminUserId);
      if (!adminIdentity) {
        await this.enrollAdmin(wallet);
      }

      // Connect to gateway
      await this.gateway.connect(connectionProfile, {
        wallet,
        identity: this.config.adminUserId,
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get network and contract
      this.network = await this.gateway.getNetwork(this.config.channelName);
      this.contract = this.network.getContract(this.config.chaincodeName);

      this.isConnected = true;
      console.log('Connected to Hyperledger Fabric network successfully');

      // Initialize event listeners
      await this.setupEventListeners();

    } catch (error) {
      console.error('Failed to initialize Fabric network:', error);
      throw error;
    }
  }

  /**
   * Enroll admin user with Certificate Authority
   */
  private async enrollAdmin(wallet: any): Promise<void> {
    try {
      // Create CA client
      const ca = new FabricCAServices(this.config.caUrl);

      // Enroll admin
      const enrollment = await ca.enroll({
        enrollmentID: this.config.adminUserId,
        enrollmentSecret: this.config.adminUserPasswd
      });

      // Create identity object
      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: this.config.mspId,
        type: 'X.509',
      };

      // Put identity in wallet
      await wallet.put(this.config.adminUserId, x509Identity);
      console.log('Admin user enrolled and imported to wallet');

    } catch (error) {
      console.error('Failed to enroll admin user:', error);
      throw error;
    }
  }

  /**
   * Setup blockchain event listeners
   */
  private async setupEventListeners(): Promise<void> {
    try {
      // Listen for traceability record events
      await this.contract.addContractListener(
        'TraceabilityRecordCreated',
        'traceability-events',
        (event) => {
          console.log('Traceability record created:', event);
          this.handleTraceabilityEvent(event);
        }
      );

      // Listen for marketplace events
      await this.contract.addContractListener(
        'MarketplaceListingCreated',
        'marketplace-events',
        (event) => {
          console.log('Marketplace listing created:', event);
          this.handleMarketplaceEvent(event);
        }
      );

      // Listen for escrow events
      await this.contract.addContractListener(
        'EscrowTransactionUpdated',
        'escrow-events',
        (event) => {
          console.log('Escrow transaction updated:', event);
          this.handleEscrowEvent(event);
        }
      );

    } catch (error) {
      console.error('Failed to setup event listeners:', error);
    }
  }

  /**
   * Create traceability record on blockchain
   */
  async createTraceabilityRecord(record: TraceabilityRecord): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const transaction = this.contract.createTransaction('CreateTraceabilityRecord');
      
      const result = await transaction.submit(
        record.id,
        JSON.stringify(record)
      );

      const transactionId = transaction.getTransactionId();
      console.log('Traceability record created:', transactionId);

      return transactionId;
    } catch (error) {
      console.error('Failed to create traceability record:', error);
      throw error;
    }
  }

  /**
   * Update traceability record
   */
  async updateTraceabilityRecord(
    recordId: string, 
    updates: Partial<TraceabilityRecord>
  ): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const transaction = this.contract.createTransaction('UpdateTraceabilityRecord');
      
      const result = await transaction.submit(
        recordId,
        JSON.stringify(updates)
      );

      const transactionId = transaction.getTransactionId();
      console.log('Traceability record updated:', transactionId);

      return transactionId;
    } catch (error) {
      console.error('Failed to update traceability record:', error);
      throw error;
    }
  }

  /**
   * Get traceability record by ID
   */
  async getTraceabilityRecord(recordId: string): Promise<TraceabilityRecord> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'GetTraceabilityRecord',
        recordId
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to get traceability record:', error);
      throw error;
    }
  }

  /**
   * Get full traceability history for a batch
   */
  async getTraceabilityHistory(batchId: string): Promise<TraceabilityRecord[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'GetTraceabilityHistory',
        batchId
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to get traceability history:', error);
      throw error;
    }
  }

  /**
   * Create marketplace listing
   */
  async createMarketplaceListing(listing: MarketplaceListing): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const transaction = this.contract.createTransaction('CreateMarketplaceListing');
      
      const result = await transaction.submit(
        listing.id,
        JSON.stringify(listing)
      );

      const transactionId = transaction.getTransactionId();
      console.log('Marketplace listing created:', transactionId);

      return transactionId;
    } catch (error) {
      console.error('Failed to create marketplace listing:', error);
      throw error;
    }
  }

  /**
   * Update marketplace listing
   */
  async updateMarketplaceListing(
    listingId: string, 
    updates: Partial<MarketplaceListing>
  ): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const transaction = this.contract.createTransaction('UpdateMarketplaceListing');
      
      const result = await transaction.submit(
        listingId,
        JSON.stringify(updates)
      );

      const transactionId = transaction.getTransactionId();
      console.log('Marketplace listing updated:', transactionId);

      return transactionId;
    } catch (error) {
      console.error('Failed to update marketplace listing:', error);
      throw error;
    }
  }

  /**
   * Search marketplace listings
   */
  async searchMarketplaceListings(criteria: {
    cropType?: string;
    region?: string;
    maxPrice?: number;
    currency?: string;
    certifications?: string[];
    minQuantity?: number;
  }): Promise<MarketplaceListing[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'SearchMarketplaceListings',
        JSON.stringify(criteria)
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to search marketplace listings:', error);
      throw error;
    }
  }

  /**
   * Create escrow transaction
   */
  async createEscrowTransaction(escrow: EscrowTransaction): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const transaction = this.contract.createTransaction('CreateEscrowTransaction');
      
      const result = await transaction.submit(
        escrow.id,
        JSON.stringify(escrow)
      );

      const transactionId = transaction.getTransactionId();
      console.log('Escrow transaction created:', transactionId);

      return transactionId;
    } catch (error) {
      console.error('Failed to create escrow transaction:', error);
      throw error;
    }
  }

  /**
   * Update escrow milestone
   */
  async updateEscrowMilestone(
    escrowId: string,
    milestoneIndex: number,
    completed: boolean,
    evidence?: string[]
  ): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const transaction = this.contract.createTransaction('UpdateEscrowMilestone');
      
      const result = await transaction.submit(
        escrowId,
        milestoneIndex.toString(),
        completed.toString(),
        JSON.stringify(evidence || [])
      );

      const transactionId = transaction.getTransactionId();
      console.log('Escrow milestone updated:', transactionId);

      return transactionId;
    } catch (error) {
      console.error('Failed to update escrow milestone:', error);
      throw error;
    }
  }

  /**
   * Release escrow funds
   */
  async releaseEscrowFunds(escrowId: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const transaction = this.contract.createTransaction('ReleaseEscrowFunds');
      
      const result = await transaction.submit(escrowId);

      const transactionId = transaction.getTransactionId();
      console.log('Escrow funds released:', transactionId);

      return transactionId;
    } catch (error) {
      console.error('Failed to release escrow funds:', error);
      throw error;
    }
  }

  /**
   * Get escrow transaction details
   */
  async getEscrowTransaction(escrowId: string): Promise<EscrowTransaction> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'GetEscrowTransaction',
        escrowId
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to get escrow transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for audit trail
   */
  async getTransactionHistory(
    recordId: string,
    recordType: 'traceability' | 'marketplace' | 'escrow'
  ): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'GetTransactionHistory',
        recordId,
        recordType
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  /**
   * Verify record integrity using blockchain
   */
  async verifyRecordIntegrity(
    recordId: string,
    recordType: 'traceability' | 'marketplace' | 'escrow'
  ): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction(
        'VerifyRecordIntegrity',
        recordId,
        recordType
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to verify record integrity:', error);
      throw error;
    }
  }

  /**
   * Handle traceability events
   */
  private handleTraceabilityEvent(event: any): void {
    // Process traceability events
    // Could trigger notifications, update UI, etc.
    console.log('Processing traceability event:', event.eventName);
  }

  /**
   * Handle marketplace events
   */
  private handleMarketplaceEvent(event: any): void {
    // Process marketplace events
    console.log('Processing marketplace event:', event.eventName);
  }

  /**
   * Handle escrow events
   */
  private handleEscrowEvent(event: any): void {
    // Process escrow events
    console.log('Processing escrow event:', event.eventName);
  }

  /**
   * Disconnect from network
   */
  async disconnect(): Promise<void> {
    if (this.gateway) {
      await this.gateway.disconnect();
      this.isConnected = false;
      console.log('Disconnected from Hyperledger Fabric network');
    }
  }

  /**
   * Get network status
   */
  getNetworkStatus(): {
    connected: boolean;
    networkName: string;
    channelName: string;
    chaincodeName: string;
  } {
    return {
      connected: this.isConnected,
      networkName: this.config.networkName,
      channelName: this.config.channelName,
      chaincodeName: this.config.chaincodeName
    };
  }

  /**
   * Get network statistics
   */
  async getNetworkStatistics(): Promise<{
    totalTraceabilityRecords: number;
    totalMarketplaceListings: number;
    totalEscrowTransactions: number;
    activeListings: number;
    completedTransactions: number;
  }> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetNetworkStatistics');
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to get network statistics:', error);
      throw error;
    }
  }
}

export default FabricNetworkService;