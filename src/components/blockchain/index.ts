// Blockchain Traceability and Marketplace Components
// Hyperledger Fabric integration for agricultural supply chain transparency

export { TraceabilityViewer } from './TraceabilityViewer';
export { MarketplaceBlockchain } from './MarketplaceBlockchain';

// Re-export blockchain service types for convenience
export type {
  TraceabilityRecord,
  MarketplaceListing,
  EscrowTransaction
} from '@/services/blockchain/fabric-network';

export type {
  QRCodeData,
  BatchQRCode,
  TraceabilityVerification
} from '@/services/blockchain/qr-code-service';

export type {
  LogisticsRoute,
  LogisticsCheckpoint,
  StorageFacility,
  TransportationProvider,
  DeliveryOrder
} from '@/services/blockchain/logistics-service';

export type {
  EscrowContract,
  EscrowMilestone,
  DisputeCase,
  MediatorProfile
} from '@/services/blockchain/escrow-service';

// Blockchain Component metadata
export const BLOCKCHAIN_COMPONENTS_METADATA = {
  traceabilityViewer: {
    title: 'Traceability Viewer',
    description: 'Complete crop journey visualization from farm to consumer with blockchain verification',
    features: [
      'Blockchain-verified supply chain tracking',
      'Interactive timeline with evidence',
      'Quality test results and certifications',
      'Sustainability metrics and carbon footprint',
      'QR code generation and verification',
      'Storage and transportation conditions'
    ],
    technologies: ['Hyperledger Fabric', 'QR Codes', 'Digital Signatures', 'Smart Contracts']
  },
  marketplaceBlockchain: {
    title: 'Blockchain Marketplace',
    description: 'Decentralized agricultural marketplace with escrow payments and full traceability',
    features: [
      'Verified product listings with traceability',
      'Smart contract-based escrow payments',
      'Multi-criteria search and filtering',
      'Quality grading and certifications',
      'Real-time availability and pricing',
      'Integrated logistics and delivery'
    ],
    technologies: ['Smart Contracts', 'Escrow Systems', 'Mobile Money', 'Dispute Resolution']
  }
} as const;

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  network: {
    enabled: true,
    type: 'hyperledger-fabric',
    channelName: 'agri-channel',
    chaincodeName: 'agri-traceability',
    organizationMSP: 'AgriNexusMSP'
  },
  traceability: {
    qrCodeExpiry: 365 * 24 * 60 * 60 * 1000, // 1 year
    verificationLevels: ['basic', 'enhanced', 'premium'],
    supportedCertifications: [
      'Organic',
      'Fair Trade',
      'GlobalGAP',
      'Rainforest Alliance',
      'USDA Organic',
      'EU Organic'
    ]
  },
  marketplace: {
    escrowRequired: true,
    minimumStake: 0.1, // 10% of transaction value
    disputeTimeoutDays: 7,
    mediationFeePercentage: 2.5,
    supportedCurrencies: ['KES', 'UGX', 'TZS', 'GHS', 'NGN', 'USD']
  },
  smartContracts: {
    autoExecute: true,
    gasLimit: 1000000,
    confirmationBlocks: 3,
    retryAttempts: 3
  }
} as const;

// Blockchain Integration Status
export const BLOCKCHAIN_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  ERROR: 'error',
  OFFLINE: 'offline'
} as const;

export type BlockchainStatus = typeof BLOCKCHAIN_STATUS[keyof typeof BLOCKCHAIN_STATUS];

// Blockchain utility functions
export const blockchainUtils = {
  /**
   * Validate blockchain transaction ID format
   */
  isValidTransactionId: (txId: string): boolean => {
    return /^tx_[a-f0-9]{16}$/.test(txId);
  },

  /**
   * Validate batch ID format
   */
  isValidBatchId: (batchId: string): boolean => {
    return /^batch_\d{4}_\d{3}$/.test(batchId);
  },

  /**
   * Generate batch ID
   */
  generateBatchId: (year?: number): string => {
    const currentYear = year || new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 999) + 1;
    return `batch_${currentYear}_${sequence.toString().padStart(3, '0')}`;
  },

  /**
   * Calculate transaction fee
   */
  calculateTransactionFee: (
    transactionType: 'create' | 'update' | 'transfer',
    dataSize: number
  ): number => {
    const baseFees = { create: 0.001, update: 0.0005, transfer: 0.0001 };
    const sizeFee = Math.ceil(dataSize / 1024) * 0.0001; // Per KB
    return baseFees[transactionType] + sizeFee;
  },

  /**
   * Format blockchain address
   */
  formatAddress: (address: string, length: number = 8): string => {
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  },

  /**
   * Validate escrow conditions
   */
  validateEscrowConditions: (contract: any): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (!contract.buyerId) errors.push('Buyer ID is required');
    if (!contract.sellerId) errors.push('Seller ID is required');
    if (!contract.amount || contract.amount <= 0) errors.push('Valid amount is required');
    if (!contract.currency) errors.push('Currency is required');
    if (!contract.milestones || contract.milestones.length === 0) {
      errors.push('At least one milestone is required');
    }

    // Validate milestone percentages sum to 100%
    if (contract.milestones) {
      const totalPercentage = contract.milestones.reduce(
        (sum: number, milestone: any) => sum + (milestone.percentage || 0),
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.push('Milestone percentages must sum to 100%');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Calculate supply chain carbon footprint
   */
  calculateCarbonFootprint: (activities: any[]): number => {
    const emissionFactors = {
      transport: 0.21, // kg CO2 per km
      storage: 0.05,   // kg CO2 per day
      processing: 0.3, // kg CO2 per kg
      packaging: 0.1   // kg CO2 per unit
    };

    return activities.reduce((total, activity) => {
      const factor = emissionFactors[activity.type as keyof typeof emissionFactors] || 0;
      return total + (factor * (activity.quantity || 1));
    }, 0);
  },

  /**
   * Generate sustainability score
   */
  generateSustainabilityScore: (data: {
    carbonFootprint: number;
    waterUsage: number;
    organicCertified: boolean;
    localSupply: boolean;
    wasteReduction: number;
  }): number => {
    let score = 100;

    // Carbon footprint penalty (0-30 points)
    score -= Math.min(data.carbonFootprint * 5, 30);

    // Water usage penalty (0-20 points)
    score -= Math.min(data.waterUsage / 100, 20);

    // Organic certification bonus
    if (data.organicCertified) score += 15;

    // Local supply bonus
    if (data.localSupply) score += 10;

    // Waste reduction bonus
    score += Math.min(data.wasteReduction * 0.1, 15);

    return Math.max(0, Math.min(100, Math.round(score)));
  }
};

// Default export for convenient imports
export default {
  TraceabilityViewer,
  MarketplaceBlockchain,
  BLOCKCHAIN_COMPONENTS_METADATA,
  BLOCKCHAIN_CONFIG,
  BLOCKCHAIN_STATUS,
  blockchainUtils
};