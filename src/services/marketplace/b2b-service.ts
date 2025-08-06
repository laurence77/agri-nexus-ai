// B2B Service for Buyer–Farmer Marketplace
// Handles aggregators, offtakers, input providers, RFQ, offers, escrow

// In-memory demo storage (replace with DB in production)
const aggregators = [
  { id: 'agg-1', name: 'Agri Aggregator Ltd.' },
  { id: 'agg-2', name: 'Farmers United PLC' }
];
const offtakers = [
  { id: 'off-1', name: 'Offtaker Group' },
  { id: 'off-2', name: 'BulkBuyers Africa' }
];
const inputProviders = [
  { id: 'input-1', name: 'Input Provider Inc.' },
  { id: 'input-2', name: 'Seeds & Fertilizer Co.' }
];
interface B2BEntity {
  id: string;
  tenantId: string;
  // Extend with specific fields in subtypes
}


const rfqs: B2BEntity[] = [];
const offers: B2BEntity[] = [];
const escrows: B2BEntity[] = [];

interface RFQ extends B2BEntity {
  product: string;
  quantity: number;
  buyerId: string;
  // add other RFQ fields as needed
}

interface Offer extends B2BEntity {
  rfqId: string;
  price: number;
  sellerId: string;
  // add other Offer fields as needed
}

interface Escrow extends B2BEntity {
  offerId: string;
  amount: number;
  status: string;
  // add other Escrow fields as needed
}

export class B2BService {
  async getAggregators() {
    // TODO: Replace with DB call, add tenantId filter if needed
    return aggregators;
  }
  async getOffTakers() {
    // TODO: Replace with DB call, add tenantId filter if needed
    return offtakers;
  }
  async getInputProviders() {
    // TODO: Replace with DB call, add tenantId filter if needed
    return inputProviders;
  }
  async createRFQ(data: RFQ, tenantId: string) {
    // TODO: Store RFQ in DB, notify parties
    const rfq = { ...data, id: `rfq-${rfqs.length + 1}`, tenantId, createdAt: new Date() };
    rfqs.push(rfq);
    return { status: 'RFQ created', rfq };
  }
  async createInstantOffer(data: Offer, tenantId: string) {
    // TODO: Store offer in DB, notify parties
    const offer = { ...data, id: `offer-${offers.length + 1}`, tenantId, createdAt: new Date() };
    offers.push(offer);
    return { status: 'Offer created', offer };
  }
  async createEscrow(data: Escrow, tenantId: string) {
    // TODO: Integrate with payment/escrow provider and DB
    const escrow = { ...data, id: `escrow-${escrows.length + 1}`, tenantId, createdAt: new Date() };
    escrows.push(escrow);
    return { status: 'Escrow initiated', escrow };
  }
  // Demo endpoints for listing RFQs/offers/escrows
  async listRFQs(tenantId: string) { return rfqs.filter(r => r.tenantId === tenantId); }
  async listOffers(tenantId: string) { return offers.filter(o => o.tenantId === tenantId); }
  async listEscrows(tenantId: string) { return escrows.filter(e => e.tenantId === tenantId); }
}


export default new B2BService();
