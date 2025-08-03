// Africa-Focused Agriculture Types
// Tailored for African smallholder farmers, cooperatives, and agribusinesses

export interface User {
  id: string;
  phone: string; // Primary identifier in Africa
  email?: string;
  name: string;
  role: 'admin' | 'field_officer' | 'farmer' | 'buyer' | 'cooperative_manager' | 'extension_agent';
  language: 'en' | 'sw' | 'ha' | 'yo' | 'am' | 'fr' | 'ar'; // Swahili, Hausa, Yoruba, Amharic, French, Arabic
  location: {
    country: string;
    region: string;
    district: string;
    village?: string;
    coordinates?: { lat: number; lng: number };
  };
  farmerId?: string; // Link to farmer profile
  cooperativeId?: string;
  lastSeen: Date;
  isOnline: boolean;
  dataConnectivity: 'high' | 'medium' | 'low' | 'offline';
  deviceType: 'smartphone' | 'feature_phone' | 'ussd_only';
  literacyLevel: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

export interface Farmer {
  id: string;
  userId: string;
  nationalId?: string;
  cooperativeId?: string;
  farmSize: number; // in hectares
  landOwnership: 'owned' | 'rented' | 'communal' | 'lease' | 'sharecropping';
  primaryCrops: string[];
  livestockCount: number;
  householdSize: number;
  educationLevel: 'none' | 'primary' | 'secondary' | 'tertiary';
  yearsOfExperience: number;
  bankAccount?: string;
  mobileMoneyAccount?: string; // M-Pesa, Airtel Money, etc.
  subsidyRecipient: boolean;
  certifications: string[]; // Organic, GAP, etc.
  avgAnnualIncome: number;
  mainMarkets: string[];
  transportAccess: boolean;
  irrigationAccess: boolean;
  creditScore?: number;
  riskProfile: 'low' | 'medium' | 'high';
  preferredPaymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'barter';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  location: {
    country: string;
    region: string;
    district: string;
    village: string;
    coordinates: { lat: number; lng: number };
    elevation?: number;
    nearestTown: string;
    distanceToMarket: number; // km
  };
  totalArea: number; // hectares
  cultivatedArea: number;
  soilTypes: string[];
  waterSources: ('rain' | 'borehole' | 'river' | 'irrigation' | 'pond')[];
  slopeType: 'flat' | 'gentle' | 'steep' | 'terraced';
  accessRoad: 'paved' | 'gravel' | 'dirt' | 'footpath' | 'none';
  electricityAccess: boolean;
  lastSoilTest?: Date;
  organicStatus: 'conventional' | 'transitioning' | 'certified_organic';
  currentSeason: string;
  registeredWithGov: boolean;
  landTitleNumber?: string;
  insurance?: {
    provider: string;
    type: 'crop' | 'weather' | 'comprehensive';
    coverage: number;
    premium: number;
    expiryDate: Date;
  };
  weatherStationDistance: number; // km to nearest weather station
  marketAccess: {
    nearestMarket: string;
    distance: number;
    transportCost: number;
    roadCondition: 'good' | 'fair' | 'poor';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Field {
  id: string;
  farmId: string;
  name: string;
  area: number; // hectares
  soilType: string;
  soilHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'degraded';
  ph?: number;
  organicMatter?: number;
  lastPlowed?: Date;
  currentCrop?: string;
  previousCrop?: string;
  cropRotationPlan: string[];
  plantingDate?: Date;
  expectedHarvestDate?: Date;
  irrigationType: 'none' | 'furrow' | 'sprinkler' | 'drip' | 'flood';
  waterSource?: string;
  slope: number; // percentage
  erosionRisk: 'low' | 'medium' | 'high' | 'severe';
  coordinates: Array<{ lat: number; lng: number }>;
  boundaries: 'surveyed' | 'gps_marked' | 'traditional' | 'disputed';
  intercropping: boolean;
  companionCrops?: string[];
  fieldHistory: FieldHistoryRecord[];
  notes: string;
  photos?: string[];
  status: 'active' | 'fallow' | 'degraded' | 'disputed' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldHistoryRecord {
  id: string;
  fieldId: string;
  season: string;
  year: number;
  crop: string;
  variety: string;
  plantingDate: Date;
  harvestDate: Date;
  yield: number; // kg/ha
  quality: 'grade_a' | 'grade_b' | 'grade_c' | 'rejected';
  marketPrice: number; // per kg
  totalRevenue: number;
  inputs: {
    seeds: number;
    fertilizer: number;
    pesticides: number;
    labor: number;
    other: number;
  };
  weather: {
    totalRainfall: number;
    averageTemp: number;
    extremeEvents: string[];
  };
  challenges: string[];
  lessons: string;
  profitability: number;
  createdAt: Date;
}

export interface Crop {
  id: string;
  name: string;
  localName: string;
  scientificName: string;
  category: 'cereals' | 'legumes' | 'roots_tubers' | 'vegetables' | 'fruits' | 'cash_crops' | 'spices';
  varieties: CropVariety[];
  seasonality: {
    plantingMonths: number[];
    harvestMonths: number[];
    drySeasonCrop: boolean;
    wetSeasonCrop: boolean;
  };
  climaticRequirements: {
    minRainfall: number; // mm
    maxRainfall: number;
    minTemp: number; // Celsius
    maxTemp: number;
    altitudeRange: { min: number; max: number };
    soilTypes: string[];
  };
  marketInfo: {
    averagePrice: number; // per kg
    priceRange: { min: number; max: number };
    demandLevel: 'high' | 'medium' | 'low';
    storageLife: number; // days
    processingOptions: string[];
    exportPotential: boolean;
  };
  nutritionalValue: {
    protein: number;
    carbs: number;
    fiber: number;
    vitamins: string[];
    minerals: string[];
  };
  culturalSignificance: string;
  commonDiseases: string[];
  commonPests: string[];
  companion: string[]; // Companion crops
  incompatible: string[]; // Crops not to plant together
  subsidyEligible: boolean;
  seedCertificationRequired: boolean;
  organicCertifiable: boolean;
  gmoStatus: 'conventional' | 'hybrid' | 'gmo' | 'heirloom';
  createdAt: Date;
  updatedAt: Date;
}

export interface CropVariety {
  id: string;
  name: string;
  localName: string;
  maturityDays: number;
  yieldPotential: number; // kg/ha
  droughtTolerance: 'low' | 'medium' | 'high';
  diseaseResistance: string[];
  seedSource: string;
  seedCost: number; // per kg
  recommended: boolean;
  newVariety: boolean;
  government approved: boolean;
}

export interface CropCycle {
  id: string;
  fieldId: string;
  farmerId: string;
  cropId: string;
  varietyId: string;
  season: string;
  year: number;
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  areaPlanted: number; // hectares
  seedUsed: number; // kg
  seedSource: string;
  plantingMethod: 'broadcasting' | 'drilling' | 'transplanting' | 'direct_seeding';
  spacing: string;
  populationDensity: number; // plants per hectare
  currentStage: 'land_prep' | 'planting' | 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'harvesting' | 'post_harvest';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  diseaseIncidence: string[];
  pestIncidence: string[];
  weedPressure: 'low' | 'medium' | 'high' | 'severe';
  irrigationSchedule?: Date[];
  fertilizationSchedule?: Date[];
  sprayingSchedule?: Date[];
  expectedYield: number; // kg
  actualYield?: number;
  qualityGrade?: 'grade_a' | 'grade_b' | 'grade_c' | 'rejected';
  lossesDueTo: string[];
  lossPercentage?: number;
  marketDestination?: string;
  sellingPrice?: number; // per kg
  totalRevenue?: number;
  profitMargin?: number;
  notes: string;
  photos: string[];
  status: 'planned' | 'active' | 'completed' | 'failed' | 'abandoned';
  subsidyReceived?: number;
  loanTaken?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LivestockRecord {
  id: string;
  farmerId: string;
  type: 'cattle' | 'goats' | 'sheep' | 'pigs' | 'poultry' | 'fish' | 'bees' | 'other';
  breed: string;
  count: number;
  purpose: 'meat' | 'dairy' | 'eggs' | 'breeding' | 'draft' | 'honey' | 'mixed';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'sick';
  vaccinationRecord: VaccinationRecord[];
  feedingCost: number; // monthly
  currentValue: number; // total herd value
  insurance?: {
    provider: string;
    coverage: number;
    premium: number;
  };
  productionRecords: ProductionRecord[];
  mortalityRate: number; // percentage per year
  reproductionRate: number; // percentage per year
  marketWeight?: number; // average per animal
  lastHealthCheck?: Date;
  veterinarianContact?: string;
  housingType: 'free_range' | 'zero_grazing' | 'semi_intensive' | 'intensive';
  feedType: 'natural_grazing' | 'cut_carry' | 'concentrate' | 'mixed';
  waterSource: 'natural' | 'borehole' | 'piped' | 'rainwater';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaccinationRecord {
  id: string;
  livestockId: string;
  vaccine: string;
  dateAdministered: Date;
  nextDue?: Date;
  batchNumber?: string;
  veterinarian?: string;
  cost: number;
  reaction?: string;
  notes: string;
}

export interface ProductionRecord {
  id: string;
  livestockId: string;
  date: Date;
  type: 'milk' | 'eggs' | 'meat' | 'honey' | 'manure';
  quantity: number;
  unit: 'liters' | 'pieces' | 'kg' | 'tons';
  quality: 'grade_a' | 'grade_b' | 'grade_c' | 'rejected';
  marketPrice?: number;
  sold: boolean;
  buyer?: string;
  revenue?: number;
  notes: string;
}

export interface Inventory {
  id: string;
  farmerId: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'herbicides' | 'tools' | 'equipment' | 'feed' | 'veterinary' | 'packaging';
  itemName: string;
  brand?: string;
  quantity: number;
  unit: 'kg' | 'liters' | 'pieces' | 'bags' | 'bottles';
  unitCost: number;
  totalValue: number;
  supplier: string;
  supplierContact?: string;
  purchaseDate: Date;
  expiryDate?: Date;
  batchNumber?: string;
  location: string; // Storage location
  minStockLevel: number;
  maxStockLevel: number;
  usage: InventoryUsage[];
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' | 'damaged';
  qualityStatus: 'good' | 'fair' | 'poor' | 'expired';
  subsidized: boolean;
  subsidyAmount?: number;
  certificationLevel?: string; // Organic, certified, etc.
  countryOfOrigin: string;
  recommendations: string;
  safetyInstructions: string;
  photos?: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryUsage {
  id: string;
  inventoryId: string;
  date: Date;
  quantityUsed: number;
  purpose: string;
  fieldId?: string;
  cropCycleId?: string;
  livestockId?: string;
  applicator: string; // Who applied it
  applicationMethod?: string;
  weatherConditions?: string;
  effectiveness?: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

export interface Equipment {
  id: string;
  farmerId: string;
  name: string;
  type: 'tractor' | 'plough' | 'harrow' | 'planter' | 'harvester' | 'sprayer' | 'irrigation' | 'generator' | 'mill' | 'other';
  brand: string;
  model: string;
  yearPurchased: number;
  purchasePrice: number;
  currentValue: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  ownership: 'owned' | 'leased' | 'shared' | 'borrowed';
  sharedWith?: string[]; // Other farmers sharing equipment
  location: string;
  operatingHours?: number;
  lastService?: Date;
  nextServiceDue?: Date;
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'manual';
  fuelConsumption?: number; // per hour
  capacityPerHour?: number; // hectares or kg per hour
  maintenanceHistory: MaintenanceRecord[];
  usageLog: EquipmentUsage[];
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
    coverage: number;
    premium: number;
    expiryDate: Date;
  };
  financingDetails?: {
    loanProvider: string;
    outstandingAmount: number;
    monthlyPayment: number;
    maturityDate: Date;
  };
  availability: 'available' | 'in_use' | 'maintenance' | 'reserved';
  bookingCalendar?: EquipmentBooking[];
  photos?: string[];
  manualUrl?: string;
  warrantyExpiry?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  date: Date;
  type: 'routine' | 'repair' | 'emergency' | 'overhaul';
  description: string;
  technician?: string;
  partsReplaced: string[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  duration: number; // hours
  nextMaintenanceDue?: Date;
  invoiceNumber?: string;
  warrantyWork: boolean;
  notes: string;
}

export interface EquipmentUsage {
  id: string;
  equipmentId: string;
  date: Date;
  operator: string;
  fieldId?: string;
  activity: string;
  hoursUsed: number;
  areaCovered?: number; // hectares
  fuelUsed?: number; // liters
  efficiency: number; // percentage
  problems?: string;
  notes: string;
}

export interface EquipmentBooking {
  id: string;
  equipmentId: string;
  bookerId: string; // farmer ID
  startDate: Date;
  endDate: Date;
  purpose: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  cost?: number;
  notes: string;
}

export interface SalesOrder {
  id: string;
  farmerId: string;
  buyerId?: string;
  buyerName: string;
  buyerContact: string;
  buyerLocation: string;
  items: SalesOrderItem[];
  totalQuantity: number;
  totalValue: number;
  currency: 'KES' | 'UGX' | 'TZS' | 'ETB' | 'NGN' | 'GHS' | 'XOF' | 'XAF' | 'ZAR' | 'USD';
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'check' | 'barter' | 'credit';
  paymentTerms: 'immediate' | '30_days' | '60_days' | '90_days' | 'on_delivery' | 'after_harvest';
  orderDate: Date;
  deliveryDate?: Date;
  actualDeliveryDate?: Date;
  status: 'pending' | 'confirmed' | 'partially_delivered' | 'delivered' | 'paid' | 'cancelled' | 'disputed';
  transportMode: 'pickup' | 'delivery' | 'market' | 'cooperative';
  transportCost?: number;
  transportProvider?: string;
  qualityGrade: 'grade_a' | 'grade_b' | 'grade_c' | 'mixed';
  packagingType: string;
  marketLocation?: string;
  priceNegotiated: boolean;
  discountGiven?: number;
  commissionPaid?: number; // to agent or cooperative
  advancePayment?: number;
  balancePayment?: number;
  invoiceNumber?: string;
  receiptNumber?: string;
  contractNumber?: string;
  notes: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesOrderItem {
  id: string;
  orderId: string;
  cropCycleId?: string;
  productName: string;
  variety?: string;
  quantity: number;
  unit: 'kg' | 'tons' | 'bags' | 'pieces' | 'liters';
  unitPrice: number;
  totalPrice: number;
  qualityGrade: 'grade_a' | 'grade_b' | 'grade_c';
  moisture?: number; // percentage
  purity?: number; // percentage
  damaged?: number; // percentage
  foreignMatter?: number; // percentage
  notes: string;
}

export interface Buyer {
  id: string;
  name: string;
  type: 'individual' | 'cooperative' | 'processor' | 'exporter' | 'retailer' | 'wholesaler' | 'government';
  contact: {
    phone: string;
    email?: string;
    address: string;
    location: { lat: number; lng: number };
  };
  productsOfInterest: string[];
  preferredQuantities: { [product: string]: number };
  qualityRequirements: { [product: string]: string };
  paymentTerms: string[];
  transportCapability: boolean;
  licenseNumber?: string;
  rating: number; // 1-5 stars
  reviewCount: number;
  transactionHistory: string[]; // Order IDs
  creditLimit?: number;
  paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
  preferredSeason: string[];
  contractFarming: boolean;
  advancePaymentOffered: boolean;
  technicalSupport: boolean;
  certificationRequired: string[];
  notes: string;
  status: 'active' | 'inactive' | 'blacklisted';
  createdAt: Date;
  updatedAt: Date;
}

export interface Cooperative {
  id: string;
  name: string;
  registrationNumber: string;
  type: 'primary' | 'secondary' | 'union' | 'federation';
  location: {
    country: string;
    region: string;
    district: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  memberCount: number;
  memberCapacity: number;
  leadership: CooperativeLeadership[];
  services: CooperativeService[];
  financialSummary: {
    totalAssets: number;
    totalLiabilities: number;
    annualTurnover: number;
    memberEquity: number;
    reserves: number;
  };
  facilities: {
    storageCapacity: number; // tons
    processingCapacity?: number;
    transportVehicles: number;
    officeSpace: boolean;
    warehouse: boolean;
    coolingFacility: boolean;
    dryingFloor: boolean;
    weighingScale: boolean;
    qualityTestingLab: boolean;
  };
  crops: string[];
  markets: string[];
  certifications: string[];
  partnerships: string[];
  projects: CooperativeProject[];
  shareCapital: number;
  shareValue: number;
  dividendRate?: number;
  loanInterestRate?: number;
  defaultRate?: number;
  creditRating?: string;
  bankPartner?: string;
  digitalLiteracy: 'high' | 'medium' | 'low';
  technologyAdoption: string[];
  trainingPrograms: string[];
  meetingFrequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  lastAGM?: Date;
  nextAGM?: Date;
  auditStatus: 'compliant' | 'pending' | 'non_compliant';
  licenses: string[];
  status: 'active' | 'dormant' | 'liquidating' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface CooperativeLeadership {
  position: 'chairperson' | 'vice_chair' | 'secretary' | 'treasurer' | 'committee_member' | 'manager';
  name: string;
  phone: string;
  email?: string;
  termStart: Date;
  termEnd: Date;
  isActive: boolean;
}

export interface CooperativeService {
  service: 'input_supply' | 'produce_marketing' | 'credit' | 'insurance' | 'training' | 'transport' | 'storage' | 'processing';
  description: string;
  cost: number;
  memberDiscount: number;
  availability: 'always' | 'seasonal' | 'on_demand';
  qualityRating: number; // 1-5
}

export interface CooperativeProject {
  id: string;
  name: string;
  donor: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'suspended';
  beneficiaries: number;
  description: string;
}

export interface CooperativeMembership {
  id: string;
  cooperativeId: string;
  farmerId: string;
  membershipNumber: string;
  joinDate: Date;
  exitDate?: Date;
  sharesPurchased: number;
  currentShareValue: number;
  position?: string;
  contributions: MemberContribution[];
  benefits: MemberBenefit[];
  loanHistory: CooperativeLoan[];
  attendanceRate: number; // percentage
  participationLevel: 'active' | 'moderate' | 'passive' | 'inactive';
  commitmentScore: number; // 1-100
  defaultHistory: number; // number of defaults
  status: 'active' | 'suspended' | 'exited' | 'deceased';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberContribution {
  id: string;
  membershipId: string;
  type: 'share_capital' | 'entrance_fee' | 'monthly_dues' | 'special_levy' | 'project_contribution';
  amount: number;
  date: Date;
  receiptNumber: string;
  notes: string;
}

export interface MemberBenefit {
  id: string;
  membershipId: string;
  type: 'dividend' | 'rebate' | 'loan' | 'input_supply' | 'training' | 'market_access';
  description: string;
  value: number;
  date: Date;
  notes: string;
}

export interface CooperativeLoan {
  id: string;
  membershipId: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  purpose: string;
  collateral?: string;
  approvalDate: Date;
  disbursementDate?: Date;
  maturityDate: Date;
  repaymentSchedule: LoanRepayment[];
  outstandingAmount: number;
  defaultDays: number;
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'defaulted' | 'completed' | 'written_off';
  guarantors?: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidDate?: Date;
  amountPaid?: number;
  paymentMethod?: string;
  receiptNumber?: string;
  lateDays?: number;
  penalty?: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  notes: string;
}

export interface FinancialRecord {
  id: string;
  farmerId: string;
  cooperativeId?: string;
  type: 'income' | 'expense' | 'investment' | 'loan' | 'subsidy' | 'insurance_claim';
  category: 'seeds' | 'fertilizer' | 'pesticides' | 'labor' | 'transport' | 'equipment' | 'land_rent' | 'storage' | 'processing' | 'marketing' | 'fuel' | 'utilities' | 'crop_sales' | 'livestock_sales' | 'other';
  subcategory?: string;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  season?: string;
  cropCycleId?: string;
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'check' | 'credit' | 'barter';
  recipient?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  taxAmount?: number;
  subsidyAmount?: number;
  location?: string;
  exchange rate?: number; // if paid in different currency
  budgetCategory?: string;
  profitCenter?: string; // crop, livestock, etc.
  recurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'seasonally' | 'annually';
  photos?: string[];
  supportingDocuments?: string[];
  approved: boolean;
  approvedBy?: string;
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  farmerId: string;
  assignedTo?: string; // Can be assigned to worker or family member
  cooperativeId?: string;
  title: string;
  description: string;
  category: 'land_preparation' | 'planting' | 'weeding' | 'fertilizing' | 'pest_control' | 'irrigation' | 'harvesting' | 'post_harvest' | 'livestock_care' | 'equipment_maintenance' | 'marketing' | 'administrative' | 'training';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  fieldId?: string;
  cropCycleId?: string;
  livestockId?: string;
  equipmentId?: string;
  scheduledDate: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedDuration: number; // hours
  actualDuration?: number;
  estimatedCost?: number;
  actualCost?: number;
  dependencies?: string[]; // Other task IDs that must be completed first
  weather dependent: boolean;
  requiredSkills: string[];
  requiredTools: string[];
  requiredInputs: string[];
  laborRequired: number; // number of people
  qualityChecklist?: string[];
  qualityScore?: number; // 1-10
  instructions: string;
  safetyInstructions?: string;
  photos?: string[];
  gpsLocation?: { lat: number; lng: number };
  reminderSent: boolean;
  feedback?: string;
  learnings?: string;
  nextAction?: string;
  tags: string[];
  recurringTask: boolean;
  recurringPattern?: string;
  language: string;
  communicationMethod: 'app' | 'sms' | 'ussd' | 'voice_call' | 'whatsapp';
  confirmationRequired: boolean;
  confirmed: boolean;
  reportRequired: boolean;
  reportSubmitted: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseNote {
  id: string;
  farmerId: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit';
  vendor?: string;
  location?: string;
  receipt?: string; // photo of receipt
  urgent: boolean;
  recurring: boolean;
  approved: boolean;
  reimbursable: boolean;
  taxDeductible: boolean;
  tags: string[];
  linkedTask?: string; // Task ID if related to a task
  linkedCrop?: string; // Crop cycle ID if related to specific crop
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkforceRecord {
  id: string;
  farmerId: string;
  workerName: string;
  workerPhone?: string;
  workerType: 'family' | 'permanent' | 'casual' | 'seasonal' | 'cooperative_member' | 'contract';
  skills: string[];
  hourlyRate?: number;
  dailyRate?: number;
  monthlyRate?: number;
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'in_kind';
  workAssignments: WorkAssignment[];
  attendanceRecord: AttendanceRecord[];
  performanceRating: number; // 1-10
  trainingRecord: string[];
  certifications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  nationalId?: string;
  address?: string;
  nextOfKin?: string;
  bankAccount?: string;
  mobileMoneyAccount?: string;
  hireDate: Date;
  terminationDate?: Date;
  terminationReason?: string;
  rehireable: boolean;
  backgroundChecked: boolean;
  healthStatus: 'fit' | 'restricted' | 'unfit';
  insuranceCovered: boolean;
  contractType?: 'verbal' | 'written' | 'formal';
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkAssignment {
  id: string;
  workerId: string;
  taskId: string;
  assignedDate: Date;
  startDate?: Date;
  endDate?: Date;
  estimatedHours: number;
  actualHours?: number;
  hoursRate: number;
  totalPay: number;
  qualityRating?: number; // 1-10
  efficiency?: number; // percentage
  supervision Required: boolean;
  supervisor?: string;
  completed: boolean;
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'overdue';
  feedback: string;
  notes: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  hoursWorked: number;
  overtime: number;
  late: boolean;
  earlyLeave: boolean;
  absent: boolean;
  absentReason?: string;
  approved: boolean;
  approvedBy?: string;
  payable: boolean;
  notes: string;
}

export interface PriceInformation {
  id: string;
  commodity: string;
  variety?: string;
  market: string;
  location: {
    country: string;
    region: string;
    marketName: string;
    coordinates?: { lat: number; lng: number };
  };
  price: number;
  currency: string;
  unit: 'kg' | 'bag' | 'ton' | '90kg_bag' | '50kg_bag';
  grade: 'grade_a' | 'grade_b' | 'grade_c' | 'mixed';
  priceType: 'farm_gate' | 'wholesale' | 'retail' | 'export' | 'import';
  date: Date;
  source: 'manual' | 'api' | 'sms' | 'radio' | 'newspaper' | 'government';
  reliability: 'high' | 'medium' | 'low';
  volume: number; // quantity available at this price
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: 'peak' | 'off_season' | 'normal';
  demandLevel: 'high' | 'medium' | 'low';
  qualityFactors: string[];
  transportCost?: number;
  marketingCost?: number;
  notes: string;
  verified: boolean;
  verifiedBy?: string;
  broadcastSent: boolean;
  relevantFarmers: string[]; // Farmer IDs who grow this commodity
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketOpportunity {
  id: string;
  buyerId: string;
  commodity: string;
  variety?: string;
  quantity: number;
  unit: string;
  priceOffered: number;
  qualityRequirements: string[];
  deliveryLocation: string;
  deliveryDate: Date;
  paymentTerms: string;
  contract: boolean;
  advancePayment: boolean;
  transportProvided: boolean;
  status: 'open' | 'partially_filled' | 'filled' | 'expired' | 'cancelled';
  farmers contacted: string[];
  farmersInterested: string[];
  contractsSigned: string[];
  totalMatched: number;
  expiryDate: Date;
  contactPerson: string;
  contactPhone: string;
  certificationRequired: string[];
  description: string;
  minimumQuantity: number;
  maximumQuantity: number;
  preferredRegions: string[];
  exclusiveOffer: boolean;
  seasonalRequirement: boolean;
  processingRequired: boolean;
  packagingRequirements: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherData {
  id: string;
  location: {
    coordinates: { lat: number; lng: number };
    region: string;
    district: string;
    stationName?: string;
  };
  date: Date;
  temperature: {
    min: number;
    max: number;
    average: number;
  };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex?: number;
  solarRadiation?: number;
  evapotranspiration?: number;
  soilTemperature?: number;
  dewPoint?: number;
  conditions: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'windy';
  forecast?: WeatherForecast[];
  source: 'weather_station' | 'satellite' | 'api' | 'manual';
  accuracy: 'high' | 'medium' | 'low';
  agriculturalImpact: {
    plantingConditions: 'excellent' | 'good' | 'fair' | 'poor';
    sprayingConditions: 'excellent' | 'good' | 'fair' | 'poor';
    harvestingConditions: 'excellent' | 'good' | 'fair' | 'poor';
    diseaseRisk: 'low' | 'medium' | 'high';
    pestRisk: 'low' | 'medium' | 'high';
  };
  alerts: WeatherAlert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherForecast {
  date: Date;
  temperatureHigh: number;
  temperatureLow: number;
  humidity: number;
  precipitationChance: number;
  precipitationAmount: number;
  windSpeed: number;
  conditions: string;
  confidence: number;
}

export interface WeatherAlert {
  id: string;
  type: 'drought' | 'flood' | 'frost' | 'hail' | 'strong_winds' | 'extreme_heat' | 'heavy_rain';
  severity: 'watch' | 'warning' | 'alert' | 'emergency';
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  affectedAreas: string[];
  actionRequired: string[];
  farmersNotified: string[];
  channels Used: string[]; // sms, radio, etc.
  isActive: boolean;
  createdAt: Date;
}

export interface Extension Service {
  id: string;
  officerId: string;
  officerName: string;
  organization: string; // Government, NGO, Company
  serviceType: 'technical_advice' | 'training' | 'demonstration' | 'input_supply' | 'market_linkage' | 'credit_facilitation';
  topic: string;
  description: string;
  targetCrop?: string;
  targetPractice?: string;
  location: string;
  date: Date;
  duration: number; // hours
  farmersAttended: string[];
  attendanceCount: number;
  materials Used: string[];
  feedback: ExtensionFeedback[];
  followUpRequired: boolean;
  followUpDate?: Date;
  cost: number;
  funding Source: string;
  effectiveness: 'excellent' | 'good' | 'fair' | 'poor';
  impact Assessment: string;
  photosVideos: string[];
  reportSubmitted: boolean;
  reportUrl?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtensionFeedback {
  farmerId: string;
  rating: number; // 1-5
  comments: string;
  implemented: boolean;
  challenges: string;
  suggestions: string;
  submittedAt: Date;
}

export interface SubsidyProgram {
  id: string;
  name: string;
  provider: 'government' | 'ngo' | 'company' | 'donor';
  type: 'input_subsidy' | 'credit_subsidy' | 'equipment_subsidy' | 'training_subsidy' | 'marketing_subsidy';
  commodity: string;
  beneficiaryCount: number;
  totalBudget: number;
  subsidyRate: number; // percentage
  startDate: Date;
  endDate: Date;
  eligibility criteria: string[];
  applicationProcess: string;
  targetRegions: string[];
  targetFarmerType: string[];
  distributionMethod: 'voucher' | 'direct' | 'cooperative' | 'agro_dealer';
  status: 'planning' | 'active' | 'completed' | 'suspended' | 'cancelled';
  successMetrics: string[];
  challenges: string[];
  impact Assessment: string;
  renewal Planned: boolean;
  contact Information: {
    name: string;
    phone: string;
    email?: string;
    office: string;
  };
  documents Required: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubsidyRecipient {
  id: string;
  programId: string;
  farmerId: string;
  applicationDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  subsidyAmount: number;
  itemsReceived: SubsidyItem[];
  utilizationReport?: string;
  impactReport?: string;
  status: 'applied' | 'approved' | 'disbursed' | 'utilized' | 'reported' | 'rejected';
  rejectionReason?: string;
  voucherNumber?: string;
  distributionPoint?: string;
  feedback: string;
  follow UpDate?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubsidyItem {
  id: string;
  recipientId: string;
  itemType: 'seeds' | 'fertilizer' | 'pesticide' | 'equipment' | 'credit' | 'training';
  itemName: string;
  quantity: number;
  unit: string;
  marketValue: number;
  subsidizedValue: number;
  supplier: string;
  receivedDate: Date;
  qualityStatus: 'good' | 'fair' | 'poor';
  utilized: boolean;
  utilizationDate?: Date;
  effectiveness: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

export interface OfflineLog {
  id: string;
  farmerId: string;
  actionType: 'create' | 'update' | 'delete';
  entityType: 'task' | 'expense' | 'inventory' | 'attendance' | 'yield' | 'sale';
  entityData: any; // JSON data of the action
  timestamp: Date;
  synced: boolean;
  syncDate?: Date;
  syncError?: string;
  deviceId: string;
  appVersion: string;
  priority: 'low' | 'medium' | 'high';
  retryCount: number;
  checksum: string; // For data integrity
  notes: string;
}

export interface USSDSession {
  id: string;
  farmerId: string;
  sessionId: string;
  phoneNumber: string;
  language: string;
  startTime: Date;
  endTime?: Date;
  menuPath: string[];
  actions: USSDAction[];
  status: 'active' | 'completed' | 'timeout' | 'error';
  errorMessage?: string;
  dataEntered: any; // JSON of all data entered
  responseTime: number; // milliseconds
  userSatisfaction?: number; // 1-5 rating
  notes: string;
}

export interface USSDAction {
  id: string;
  sessionId: string;
  action: 'menu_selection' | 'data_entry' | 'query' | 'transaction';
  input: string;
  response: string;
  timestamp: Date;
  processingTime: number; // milliseconds
  success: boolean;
  errorCode?: string;
  notes: string;
}

export interface SMSCommunication {
  id: string;
  farmerId: string;
  phoneNumber: string;
  type: 'alert' | 'reminder' | 'price_update' | 'weather' | 'training' | 'marketing' | 'survey';
  message: string;
  language: string;
  sent: boolean;
  sentDate?: Date;
  delivered: boolean;
  deliveryDate?: Date;
  read: boolean;
  readDate?: Date;
  response?: string;
  responseDate?: Date;
  cost: number;
  provider: string;
  messageId: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'responded';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled: boolean;
  scheduledDate?: Date;
  retryCount: number;
  campaign?: string;
  template Used: string;
  personalized: boolean;
  segmentation: string[];
  conversion Tracked: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  type: 'technical' | 'financial' | 'digital' | 'business' | 'safety' | 'certification';
  category: 'crop_production' | 'livestock' | 'pest_management' | 'soil_health' | 'post_harvest' | 'marketing' | 'cooperatives' | 'climate_smart';
  provider: string;
  trainerId: string;
  trainerName: string;
  format: 'in_person' | 'online' | 'hybrid' | 'demonstration' | 'video' | 'audio' | 'text';
  language: string;
  duration: number; // hours
  schedule: TrainingSchedule[];
  capacity: number;
  enrolled: number;
  completed: number;
  location?: string;
  venue?: string;
  cost: number;
  subsidized: boolean;
  certificateProvided: boolean;
  materials: TrainingMaterial[];
  prerequisite: string[];
  targetAudience: string[];
  learningObjectives: string[];
  curriculum: string[];
  assessment Method: string;
  passingGrade: number;
  status: 'planning' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';
  feedback: TrainingFeedback[];
  averageRating: number;
  effectivenessScore: number;
  followUpRequired: boolean;
  followUpDate?: Date;
  photos Videos: string[];
  reportUrl?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingSchedule {
  id: string;
  trainingId: string;
  sessionNumber: number;
  date: Date;
  startTime: string;
  endTime: string;
  topic: string;
  activities: string[];
  attendance: TrainingAttendance[];
  completed: boolean;
  notes: string;
}

export interface TrainingAttendance {
  farmerId: string;
  present: boolean;
  punctual: boolean;
  participation: 'active' | 'moderate' | 'passive';
  notes: string;
}

export interface TrainingMaterial {
  id: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'image' | 'presentation' | 'quiz';
  url: string;
  language: string;
  downloadable: boolean;
  size: number; // MB
  duration?: number; // minutes for video/audio
  description: string;
}

export interface TrainingFeedback {
  farmerId: string;
  rating: number; // 1-5
  contentQuality: number; // 1-5
  deliveryQuality: number; // 1-5
  relevance: number; // 1-5
  clarity: number; // 1-5
  implementation intention: 'definitely' | 'probably' | 'maybe' | 'probably_not' | 'definitely_not';
  recommendations: string;
  suggestions: string;
  wouldRecommend: boolean;
  submittedAt: Date;
}

export interface Alert {
  id: string;
  farmerId?: string;
  cooperativeId?: string;
  type: 'weather' | 'pest' | 'disease' | 'market' | 'task' | 'financial' | 'equipment' | 'regulatory' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  description?: string;
  actionRequired: string;
  deadline?: Date;
  location?: string;
  affectedCrops?: string[];
  affectedLivestock?: string[];
  source: 'system' | 'manual' | 'ai' | 'weather_service' | 'government' | 'expert';
  channels: ('app' | 'sms' | 'email' | 'ussd' | 'radio' | 'public_address')[];
  sent: boolean;
  sentDate?: Date;
  acknowledged: boolean;
  acknowledgedDate?: Date;
  resolved: boolean;
  resolvedDate?: Date;
  resolution: string;
  impact: 'minimal' | 'low' | 'medium' | 'high' | 'severe';
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  recurrence: 'one_time' | 'daily' | 'weekly' | 'seasonal' | 'annual';
  expiryDate?: Date;
  relatedAlerts: string[];
  attachments: string[];
  tags: string[];
  readBy: string[];
  sharedWith: string[];
  feedback: AlertFeedback[];
  effectiveness: number; // 1-5
  costOfDelay?: number;
  preventive Measure: string[];
  lessons Learned: string;
  followUpDate?: Date;
  reportGenerated: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertFeedback {
  farmerId: string;
  helpful: boolean;
  timely: boolean;
  clear: boolean;
  actionTaken: string;
  outcome: string;
  suggestions: string;
  rating: number; // 1-5
  submittedAt: Date;
}

export interface CommunicationLog {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string; // For cooperative or group communications
  channel: 'app' | 'sms' | 'email' | 'ussd' | 'whatsapp' | 'voice_call' | 'radio';
  type: 'notification' | 'alert' | 'reminder' | 'information' | 'query' | 'response' | 'broadcast';
  subject?: string;
  message: string;
  language: string;
  urgent: boolean;
  scheduled: boolean;
  scheduledTime?: Date;
  sent: boolean;
  sentTime?: Date;
  delivered: boolean;
  deliveryTime?: Date;
  read: boolean;
  readTime?: Date;
  responded: boolean;
  responseTime?: Date;
  response?: string;
  cost: number;
  provider?: string;
  messageId?: string;
  failureReason?: string;
  retryCount: number;
  campaignId?: string;
  template?: string;
  personalization: any; // JSON of personalized data
  trackingEnabled: boolean;
  analytics: {
    opened: boolean;
    clicked: boolean;
    forwarded: boolean;
    conversionEvent?: string;
  };
  attachments: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiryDate?: Date;
  feedback?: {
    rating: number;
    helpful: boolean;
    comments: string;
  };
  status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'failed' | 'expired';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database utility types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardMetrics {
  farmerCount: number;
  cooperativeCount: number;
  totalFarmland: number; // hectares
  activeCrops: number;
  seasonRevenue: number;
  avgYield: number; // kg/ha
  weatherAlerts: number;
  marketOpportunities: number;
  trainingPrograms: number;
  loanRepaymentRate: number; // percentage
  subsidyUtilization: number; // percentage
  priceVolatility: number;
  cropDiversification: number;
  technologyAdoption: number; // percentage
  lastUpdated: Date;
}

export interface SearchFilters {
  location?: {
    country?: string;
    region?: string;
    district?: string;
  };
  crops?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  status?: string;
  category?: string;
  priority?: string;
  language?: string;
  cooperativeId?: string;
  farmSize?: {
    min: number;
    max: number;
  };
}

export interface NotificationPreferences {
  farmerId: string;
  channels: {
    app: boolean;
    sms: boolean;
    email: boolean;
    ussd: boolean;
    whatsapp: boolean;
    voice: boolean;
  };
  types: {
    weather: boolean;
    market: boolean;
    tasks: boolean;
    financial: boolean;
    training: boolean;
    alerts: boolean;
    social: boolean;
  };
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  language: string;
  priority Threshold: 'low' | 'medium' | 'high' | 'critical';
  dataLimits: {
    respectDataLimits: boolean;
    maxDailyNotifications: number;
    wifiOnly: boolean;
  };
  locationBased: boolean;
  cropSpecific: boolean;
  seasonalAdjustment: boolean;
  notes: string;
  updatedAt: Date;
}

// Integration types for external systems
export interface N8NWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'webhook' | 'schedule' | 'database' | 'manual';
  farmerId?: string;
  cooperativeId?: string;
  active: boolean;
  lastExecution?: Date;
  executionCount: number;
  successRate: number;
  avgExecutionTime: number; // milliseconds
  parameters: any; // JSON configuration
  outputSchema: any; // Expected output format
  errorHandling: string;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // milliseconds
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    recipients: string[];
  };
  costPerExecution: number;
  monthlyBudget: number;
  currentMonthCost: number;
  tags: string[];
  version: string;
  deployedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIIntegration {
  id: string;
  name: string;
  provider: 'weather_api' | 'price_api' | 'payment_gateway' | 'sms_provider' | 'mapping_service' | 'satellite_imagery';
  endpoint: string;
  apiKey: string; // Encrypted
  enabled: boolean;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    monthlyQuota: number;
  };
  usage: {
    currentMonth: number;
    lastMonth: number;
    averageResponseTime: number;
    successRate: number;
    lastError?: string;
    lastSuccessfulCall?: Date;
  };
  configuration: any; // JSON settings
  webhookUrl?: string;
  authentication: 'api_key' | 'oauth' | 'basic' | 'bearer_token';
  dataMapping: any; // How to map API response to internal structure
  cachingEnabled: boolean;
  cacheExpiry: number; // minutes
  alertsEnabled: boolean;
  alertThresholds: {
    failureRate: number; // percentage
    responseTime: number; // milliseconds
    quotaUsage: number; // percentage
  };
  costPerRequest: number;
  monthlyBudget: number;
  documentation: string;
  supportContact: string;
  lastUpdated: Date;
  createdAt: Date;
}