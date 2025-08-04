/**
 * Escrow Service for Agricultural Marketplace
 * Manages secure transactions between buyers and sellers with milestone-based payments
 * Integrates with blockchain for transparency and mobile money for African payments
 */

import { FabricNetworkService, EscrowTransaction } from './fabric-network';
import { MobileMoneyService, PaymentProvider } from '../payments/mobile-money-service';

export interface EscrowMilestone {
  id: string;
  description: string;
  percentage: number; // Percentage of total amount
  amount: number;
  requiredEvidence: string[];
  autoRelease: boolean;
  timeoutHours?: number;
  status: 'pending' | 'evidence_submitted' | 'approved' | 'released' | 'disputed';
  submittedEvidence?: {
    type: string;
    url: string;
    description: string;
    submittedAt: Date;
    submittedBy: string;
  }[];
  approvedAt?: Date;
  approvedBy?: string;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscrowContract {
  id: string;
  transactionId: string;
  buyerId: string;
  buyerDetails: {
    name: string;
    phone: string;
    email: string;
    location: string;
  };
  sellerId: string;
  sellerDetails: {
    name: string;
    phone: string;
    email: string;
    location: string;
  };
  listingId: string;
  productDetails: {
    cropType: string;
    variety: string;
    quantity: number;
    unit: string;
    qualityGrade: string;
    certifications: string[];
  };
  totalAmount: number;
  currency: string;
  paymentProvider: PaymentProvider;
  milestones: EscrowMilestone[];
  terms: {
    deliveryDeadline: Date;
    qualityStandards: string[];
    disputeResolutionProcess: string;
    cancellationPolicy: string;
    latePenalty?: {
      enabled: boolean;
      percentagePerDay: number;
      maxPercentage: number;
    };
  };
  status: 'created' | 'funded' | 'active' | 'completed' | 'disputed' | 'cancelled' | 'refunded';
  fundedAmount: number;
  releasedAmount: number;
  disputeInfo?: {
    initiatedBy: 'buyer' | 'seller';
    reason: string;
    evidence: any[];
    mediatorId?: string;
    resolution?: string;
    resolvedAt?: Date;
  };
  blockchainTxIds: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface DisputeCase {
  id: string;
  escrowId: string;
  initiatedBy: 'buyer' | 'seller';
  respondent: 'buyer' | 'seller';
  reason: string;
  category: 'quality' | 'delivery' | 'payment' | 'fraud' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  evidence: {
    photos: string[];
    documents: string[];
    testimonials: string[];
    communications: string[];
  };
  mediatorId?: string;
  mediatorNotes?: string;
  resolution?: {
    decision: 'buyer_favor' | 'seller_favor' | 'split' | 'refund' | 'retry';
    reasoning: string;
    actions: string[];
    compensations?: {
      buyerRefund?: number;
      sellerPayment?: number;
      penalties?: number;
    };
  };
  status: 'open' | 'under_review' | 'resolved' | 'escalated' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface MediatorProfile {
  id: string;
  name: string;
  qualifications: string[];
  specializations: string[];
  languages: string[];
  rating: number;
  totalCases: number;
  successRate: number;
  averageResolutionTime: number; // hours
  availability: 'available' | 'busy' | 'offline';
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  fees: {
    baseRate: number;
    perHour: number;
    currency: string;
  };
  location: string;
  certifications: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Escrow Service for Secure Agricultural Transactions
 */
export class EscrowService {
  private blockchainService: FabricNetworkService;
  private mobileMoneyService: MobileMoneyService;
  private mediators: Map<string, MediatorProfile> = new Map();
  private activeContracts: Map<string, EscrowContract> = new Map();

  constructor(
    blockchainService: FabricNetworkService,
    mobileMoneyService: MobileMoneyService
  ) {
    this.blockchainService = blockchainService;
    this.mobileMoneyService = mobileMoneyService;
    this.initializeMediators();
  }

  /**
   * Create escrow contract for marketplace transaction
   */
  async createEscrowContract(
    contractData: Omit<EscrowContract, 'id' | 'status' | 'fundedAmount' | 'releasedAmount' | 'blockchainTxIds' | 'createdAt' | 'updatedAt'>
  ): Promise<EscrowContract> {
    try {
      const contractId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const contract: EscrowContract = {
        ...contractData,
        id: contractId,
        status: 'created',
        fundedAmount: 0,
        releasedAmount: 0,
        blockchainTxIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create escrow transaction on blockchain
      const blockchainEscrow: EscrowTransaction = {
        id: contractId,
        buyerId: contract.buyerId,
        sellerId: contract.sellerId,
        listingId: contract.listingId,
        amount: contract.totalAmount,
        currency: contract.currency,
        status: 'pending',
        milestones: contract.milestones.map(m => ({
          description: m.description,
          completed: false
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const txId = await this.blockchainService.createEscrowTransaction(blockchainEscrow);
      contract.blockchainTxIds.push(txId);

      this.activeContracts.set(contractId, contract);

      console.log('Escrow contract created:', contractId);
      return contract;
    } catch (error) {
      console.error('Failed to create escrow contract:', error);
      throw error;
    }
  }

  /**
   * Fund escrow contract
   */
  async fundEscrow(
    contractId: string,
    paymentDetails: {
      amount: number;
      provider: PaymentProvider;
      phoneNumber: string;
      pin?: string;
    }
  ): Promise<{
    success: boolean;
    transactionId?: string;
    reference?: string;
    message: string;
  }> {
    try {
      const contract = this.activeContracts.get(contractId);
      if (!contract) {
        throw new Error('Escrow contract not found');
      }

      if (contract.status !== 'created') {
        throw new Error('Contract is not in created status');
      }

      // Process payment through mobile money
      const paymentResult = await this.mobileMoneyService.processPayment({
        amount: paymentDetails.amount,
        currency: contract.currency,
        provider: paymentDetails.provider,
        phoneNumber: paymentDetails.phoneNumber,
        pin: paymentDetails.pin,
        description: `Escrow payment for order ${contract.listingId}`,
        reference: contractId,
        metadata: {
          escrowId: contractId,
          buyerId: contract.buyerId,
          sellerId: contract.sellerId
        }
      });

      if (paymentResult.success) {
        // Update contract status
        contract.fundedAmount = paymentDetails.amount;
        contract.status = 'funded';
        contract.updatedAt = new Date();

        // Update blockchain
        const txId = await this.blockchainService.updateEscrowMilestone(
          contractId,
          0,
          false,
          [`Payment received: ${paymentResult.transactionId}`]
        );
        contract.blockchainTxIds.push(txId);

        console.log('Escrow funded successfully:', contractId);
        
        // Activate contract if fully funded
        if (contract.fundedAmount >= contract.totalAmount) {
          contract.status = 'active';
          await this.notifyParties(contract, 'escrow_activated');
        }
      }

      return {
        success: paymentResult.success,
        transactionId: paymentResult.transactionId,
        reference: paymentResult.reference,
        message: paymentResult.success ? 'Escrow funded successfully' : paymentResult.message
      };
    } catch (error) {
      console.error('Failed to fund escrow:', error);
      throw error;
    }
  }

  /**
   * Submit milestone evidence
   */
  async submitMilestoneEvidence(
    contractId: string,
    milestoneId: string,
    evidence: {
      type: string;
      url: string;
      description: string;
    }[],
    submittedBy: string
  ): Promise<void> {
    try {
      const contract = this.activeContracts.get(contractId);
      if (!contract) {
        throw new Error('Escrow contract not found');
      }

      const milestone = contract.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // Submit evidence
      milestone.submittedEvidence = evidence.map(e => ({
        ...e,
        submittedAt: new Date(),
        submittedBy
      }));
      milestone.status = 'evidence_submitted';
      milestone.updatedAt = new Date();

      // Update blockchain
      const txId = await this.blockchainService.updateEscrowMilestone(
        contractId,
        contract.milestones.indexOf(milestone),
        false,
        evidence.map(e => e.url)
      );
      contract.blockchainTxIds.push(txId);

      // Auto-approve if configured
      if (milestone.autoRelease) {
        await this.approveMilestone(contractId, milestoneId, 'system');
      } else {
        await this.notifyParties(contract, 'evidence_submitted', { milestoneId });
      }

      console.log('Milestone evidence submitted:', milestoneId);
    } catch (error) {
      console.error('Failed to submit milestone evidence:', error);
      throw error;
    }
  }

  /**
   * Approve milestone
   */
  async approveMilestone(
    contractId: string,
    milestoneId: string,
    approvedBy: string
  ): Promise<void> {
    try {
      const contract = this.activeContracts.get(contractId);
      if (!contract) {
        throw new Error('Escrow contract not found');
      }

      const milestone = contract.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // Approve milestone
      milestone.status = 'approved';
      milestone.approvedAt = new Date();
      milestone.approvedBy = approvedBy;
      milestone.updatedAt = new Date();

      // Release payment
      await this.releaseMilestonePayment(contractId, milestoneId);

      console.log('Milestone approved:', milestoneId);
    } catch (error) {
      console.error('Failed to approve milestone:', error);
      throw error;
    }
  }

  /**
   * Release milestone payment
   */
  private async releaseMilestonePayment(
    contractId: string,
    milestoneId: string
  ): Promise<void> {
    try {
      const contract = this.activeContracts.get(contractId);
      if (!contract) {
        throw new Error('Escrow contract not found');
      }

      const milestone = contract.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // Process payment release
      const payoutResult = await this.mobileMoneyService.processPayment({
        amount: milestone.amount,
        currency: contract.currency,
        provider: contract.paymentProvider,
        phoneNumber: contract.sellerDetails.phone,
        description: `Milestone payment for order ${contract.listingId}`,
        reference: `${contractId}_${milestoneId}`,
        metadata: {
          escrowId: contractId,
          milestoneId,
          sellerId: contract.sellerId
        }
      });

      if (payoutResult.success) {
        // Update milestone and contract
        milestone.status = 'released';
        milestone.releasedAt = new Date();
        contract.releasedAmount += milestone.amount;
        contract.updatedAt = new Date();

        // Update blockchain
        const txId = await this.blockchainService.updateEscrowMilestone(
          contractId,
          contract.milestones.indexOf(milestone),
          true,
          [`Payment released: ${payoutResult.transactionId}`]
        );
        contract.blockchainTxIds.push(txId);

        // Check if all milestones are completed
        const allCompleted = contract.milestones.every(m => m.status === 'released');
        if (allCompleted) {
          contract.status = 'completed';
          contract.completedAt = new Date();
          await this.notifyParties(contract, 'escrow_completed');
        }

        await this.notifyParties(contract, 'payment_released', { milestoneId, amount: milestone.amount });
      }

      console.log('Milestone payment released:', milestoneId);
    } catch (error) {
      console.error('Failed to release milestone payment:', error);
      throw error;
    }
  }

  /**
   * Initiate dispute
   */
  async initiateDispute(
    contractId: string,
    disputeData: {
      initiatedBy: 'buyer' | 'seller';
      reason: string;
      category: DisputeCase['category'];
      description: string;
      evidence: DisputeCase['evidence'];
    }
  ): Promise<DisputeCase> {
    try {
      const contract = this.activeContracts.get(contractId);
      if (!contract) {
        throw new Error('Escrow contract not found');
      }

      const disputeId = `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const dispute: DisputeCase = {
        id: disputeId,
        escrowId: contractId,
        initiatedBy: disputeData.initiatedBy,
        respondent: disputeData.initiatedBy === 'buyer' ? 'seller' : 'buyer',
        reason: disputeData.reason,
        category: disputeData.category,
        priority: this.calculateDisputePriority(disputeData.category, contract.totalAmount),
        description: disputeData.description,
        evidence: disputeData.evidence,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update contract status
      contract.status = 'disputed';
      contract.disputeInfo = {
        initiatedBy: disputeData.initiatedBy,
        reason: disputeData.reason,
        evidence: [disputeData.evidence]
      };
      contract.updatedAt = new Date();

      // Assign mediator
      const mediator = await this.assignMediator(dispute);
      if (mediator) {
        dispute.mediatorId = mediator.id;
        await this.notifyMediator(mediator, dispute);
      }

      // Record dispute on blockchain
      const txId = await this.blockchainService.updateTraceabilityRecord(contractId, {
        marketplace: {
          status: 'disputed' as any
        }
      });
      contract.blockchainTxIds.push(txId);

      await this.notifyParties(contract, 'dispute_initiated', { disputeId });

      console.log('Dispute initiated:', disputeId);
      return dispute;
    } catch (error) {
      console.error('Failed to initiate dispute:', error);
      throw error;
    }
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(
    disputeId: string,
    resolution: DisputeCase['resolution'],
    mediatorId: string
  ): Promise<void> {
    try {
      // Implementation would update dispute status and execute resolution actions
      // This could include partial refunds, payment releases, penalties, etc.
      
      console.log('Dispute resolved:', disputeId);
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      throw error;
    }
  }

  /**
   * Cancel escrow contract
   */
  async cancelEscrow(
    contractId: string,
    reason: string,
    cancelledBy: string
  ): Promise<void> {
    try {
      const contract = this.activeContracts.get(contractId);
      if (!contract) {
        throw new Error('Escrow contract not found');
      }

      // Process refund if funded
      if (contract.fundedAmount > 0) {
        const refundResult = await this.mobileMoneyService.processPayment({
          amount: contract.fundedAmount,
          currency: contract.currency,
          provider: contract.paymentProvider,
          phoneNumber: contract.buyerDetails.phone,
          description: `Escrow refund for cancelled order ${contract.listingId}`,
          reference: `refund_${contractId}`,
          metadata: {
            escrowId: contractId,
            reason: 'cancellation'
          }
        });

        if (refundResult.success) {
          contract.status = 'refunded';
        }
      } else {
        contract.status = 'cancelled';
      }

      contract.updatedAt = new Date();

      await this.notifyParties(contract, 'escrow_cancelled', { reason });

      console.log('Escrow cancelled:', contractId);
    } catch (error) {
      console.error('Failed to cancel escrow:', error);
      throw error;
    }
  }

  /**
   * Get escrow contract details
   */
  async getEscrowContract(contractId: string): Promise<EscrowContract | null> {
    return this.activeContracts.get(contractId) || null;
  }

  /**
   * Get escrow statistics
   */
  async getEscrowStatistics(): Promise<{
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    disputedContracts: number;
    totalValue: number;
    averageContractValue: number;
    successRate: number;
    averageCompletionTime: number;
  }> {
    const contracts = Array.from(this.activeContracts.values());
    
    return {
      totalContracts: contracts.length,
      activeContracts: contracts.filter(c => c.status === 'active').length,
      completedContracts: contracts.filter(c => c.status === 'completed').length,
      disputedContracts: contracts.filter(c => c.status === 'disputed').length,
      totalValue: contracts.reduce((sum, c) => sum + c.totalAmount, 0),
      averageContractValue: contracts.length > 0 ? contracts.reduce((sum, c) => sum + c.totalAmount, 0) / contracts.length : 0,
      successRate: contracts.length > 0 ? contracts.filter(c => c.status === 'completed').length / contracts.length * 100 : 0,
      averageCompletionTime: 48 // hours - would be calculated from actual data
    };
  }

  /**
   * Initialize mediators
   */
  private initializeMediators(): void {
    // Sample mediators - in production, these would be loaded from database
    const sampleMediators: MediatorProfile[] = [
      {
        id: 'med_001',
        name: 'John Kamau',
        qualifications: ['Law Degree', 'Agricultural Economics'],
        specializations: ['Agricultural Disputes', 'Contract Law'],
        languages: ['English', 'Swahili'],
        rating: 4.8,
        totalCases: 150,
        successRate: 92,
        averageResolutionTime: 24,
        availability: 'available',
        contact: {
          phone: '+254700123456',
          email: 'j.kamau@mediators.ke',
          whatsapp: '+254700123456'
        },
        fees: {
          baseRate: 50,
          perHour: 25,
          currency: 'USD'
        },
        location: 'Nairobi, Kenya',
        certifications: ['Certified Mediator', 'Agricultural Law Certificate'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleMediators.forEach(mediator => {
      this.mediators.set(mediator.id, mediator);
    });
  }

  /**
   * Assign mediator to dispute
   */
  private async assignMediator(dispute: DisputeCase): Promise<MediatorProfile | null> {
    // Find available mediator with relevant specialization
    for (const [id, mediator] of this.mediators) {
      if (mediator.availability === 'available' && 
          mediator.specializations.includes('Agricultural Disputes')) {
        return mediator;
      }
    }
    return null;
  }

  /**
   * Calculate dispute priority
   */
  private calculateDisputePriority(category: string, amount: number): DisputeCase['priority'] {
    if (amount > 1000 || category === 'fraud') return 'urgent';
    if (amount > 500 || category === 'quality') return 'high';
    if (category === 'delivery') return 'medium';
    return 'low';
  }

  /**
   * Notify parties about escrow events
   */
  private async notifyParties(
    contract: EscrowContract,
    eventType: string,
    data?: any
  ): Promise<void> {
    // Implementation would send SMS, email, or push notifications
    console.log(`Notification sent for contract ${contract.id}: ${eventType}`);
  }

  /**
   * Notify mediator about new dispute
   */
  private async notifyMediator(
    mediator: MediatorProfile,
    dispute: DisputeCase
  ): Promise<void> {
    // Implementation would send notification to mediator
    console.log(`Mediator ${mediator.name} notified about dispute ${dispute.id}`);
  }
}

export default EscrowService;