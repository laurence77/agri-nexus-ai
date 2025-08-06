export interface DigitalFarmProfile {
  id: string;
  user_id: string;
  tenant_id: string;
  farm_name: string;
  owner_name: string;
  profile_type: 'individual' | 'cooperative' | 'commercial' | 'family_farm';
  
  // Basic Information
  description: string;
  established_year: number;
  total_area_hectares: number;
  farm_types: FarmType[];
  primary_crops: string[];
  livestock_types: string[];
  
  // Location & Contact
  location: FarmLocation;
  contact_information: ContactInformation;
  
  // Visual Identity
  avatar_url?: string;
  cover_image_url?: string;
  logo_url?: string;
  brand_colors?: {
    primary: string;
    secondary: string;
  };
  
  // Farm Details
  certifications: FarmCertification[];
  specialties: string[];
  farming_methods: FarmingMethod[];
  sustainability_practices: string[];
  
  // Products & Services
  products: FarmProduct[];
  services_offered: FarmService[];
  seasonal_calendar: SeasonalCalendar[];
  
  // Achievements & Recognition
  achievements: FarmAchievement[];
  awards: FarmAward[];
  testimonials: CustomerTestimonial[];
  
  // Farm Statistics & Analytics
  statistics: FarmStatistics;
  yield_history: YieldRecord[];
  financial_overview: FinancialOverview;
  
  // Media & Documentation
  gallery: FarmGalleryItem[];
  documents: FarmDocument[];
  virtual_tour_url?: string;
  
  // Social & Community
  social_media_links: SocialMediaLinks;
  community_involvement: CommunityInvolvement[];
  mentorship_status: 'seeking_mentor' | 'offering_mentorship' | 'both' | 'none';
  
  // Trust & Verification
  verification_status: VerificationStatus;
  trust_indicators: TrustIndicator[];
  compliance_records: ComplianceRecord[];
  
  // Profile Settings
  privacy_settings: ProfilePrivacySettings;
  visibility: 'public' | 'private' | 'community_only' | 'invite_only';
  profile_completion_percentage: number;
  
  // Engagement Metrics
  profile_views: number;
  followers_count: number;
  following_count: number;
  endorsements: ProfileEndorsement[];
  
  // System Fields
  created_at: string;
  updated_at: string;
  last_active: string;
  is_active: boolean;
  profile_url_slug: string;
  qr_code_url?: string;
}

export interface FarmLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  climate_zone: string;
  soil_type: string[];
  water_sources: string[];
  elevation_meters?: number;
}

export interface ContactInformation {
  primary_phone: string;
  secondary_phone?: string;
  email: string;
  website?: string;
  whatsapp?: string;
  business_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  preferred_contact_method: 'phone' | 'email' | 'whatsapp' | 'in_person';
  languages_spoken: string[];
}

export interface FarmCertification {
  id: string;
  name: string;
  certifying_body: string;
  certificate_number: string;
  issue_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'pending_renewal' | 'suspended';
  document_url?: string;
  verification_status: 'verified' | 'pending' | 'rejected';
  certification_type: 'organic' | 'fair_trade' | 'global_gap' | 'rainforest_alliance' | 'other';
  scope: string; // What products/processes this certification covers
}

export interface FarmProduct {
  id: string;
  name: string;
  category: string;
  sub_category?: string;
  description: string;
  images: string[];
  
  // Pricing
  price_range: {
    min_price: number;
    max_price: number;
    currency: string;
    unit: string;
    price_type: 'fixed' | 'negotiable' | 'market_based';
  };
  
  // Availability
  availability_status: 'available' | 'seasonal' | 'pre_order' | 'out_of_stock';
  harvest_seasons: string[];
  available_quantity?: number;
  minimum_order_quantity?: number;
  
  // Quality & Certifications
  quality_grade: 'premium' | 'standard' | 'economy';
  is_organic: boolean;
  certifications: string[];
  
  // Production Details
  production_method: string[];
  harvest_date?: string;
  storage_method?: string;
  shelf_life_days?: number;
  
  // Marketing
  unique_selling_points: string[];
  nutritional_info?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

export interface FarmService {
  id: string;
  name: string;
  description: string;
  category: 'consultation' | 'equipment_rental' | 'processing' | 'training' | 'labor' | 'transport' | 'other';
  price_structure: {
    type: 'hourly' | 'daily' | 'project' | 'per_unit';
    base_price: number;
    currency: string;
    unit?: string;
  };
  availability: 'year_round' | 'seasonal' | 'on_request';
  service_area_radius_km?: number;
  requirements: string[];
  created_at: string;
}

export interface FarmStatistics {
  total_area_cultivated: number;
  current_season_yield_tons: number;
  yield_per_hectare_avg: number;
  yield_improvement_percentage: number;
  
  // Efficiency Metrics
  water_usage_efficiency: number;
  fertilizer_efficiency: number;
  labor_productivity: number;
  
  // Sustainability Metrics
  carbon_footprint_tons: number;
  biodiversity_index: number;
  soil_health_score: number;
  sustainability_rating: number; // 0-100
  
  // Financial Metrics
  revenue_growth_percentage: number;
  profit_margin_percentage: number;
  cost_per_hectare: number;
  
  // Customer & Market
  customer_satisfaction_rating: number;
  repeat_customer_percentage: number;
  market_reach_km: number;
  
  // Operational
  mechanization_level: number; // 0-100
  technology_adoption_score: number; // 0-100
  crop_diversity_index: number;
  
  calculated_at: string;
}

export interface YieldRecord {
  id: string;
  crop_name: string;
  season: string;
  year: number;
  area_harvested_hectares: number;
  total_yield_tons: number;
  yield_per_hectare: number;
  quality_grade: string;
  weather_conditions: string;
  challenges_faced: string[];
  interventions_used: string[];
  recorded_at: string;
}

export interface FarmGalleryItem {
  id: string;
  type: 'image' | 'video' | '360_photo' | 'drone_footage';
  url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  category: 'crops' | 'livestock' | 'equipment' | 'facilities' | 'team' | 'processes' | 'products' | 'landscape';
  tags: string[];
  location?: {
    latitude: number;
    longitude: number;
    description: string;
  };
  captured_date: string;
  uploaded_at: string;
  is_featured: boolean;
  privacy_level: 'public' | 'followers_only' | 'private';
  views_count: number;
  likes_count: number;
}

export interface FarmDocument {
  id: string;
  name: string;
  document_type: 'certificate' | 'permit' | 'insurance' | 'contract' | 'report' | 'manual' | 'other';
  category: string;
  file_url: string;
  file_size_bytes: number;
  file_format: string;
  description?: string;
  issue_date?: string;
  expiry_date?: string;
  is_public: boolean;
  requires_verification: boolean;
  verification_status?: 'verified' | 'pending' | 'rejected';
  uploaded_at: string;
  updated_at: string;
}

export interface VerificationStatus {
  is_verified: boolean;
  verification_level: 'basic' | 'standard' | 'premium' | 'expert';
  verified_by: 'system' | 'community' | 'expert' | 'organization';
  verification_date?: string;
  verification_expiry?: string;
  verification_badges: VerificationBadge[];
}

export interface VerificationBadge {
  badge_type: 'identity' | 'location' | 'certification' | 'yield' | 'quality' | 'sustainability' | 'community';
  badge_name: string;
  badge_description: string;
  icon_url: string;
  earned_date: string;
  verification_method: string;
}

export interface TrustIndicator {
  indicator_type: 'reviews' | 'transactions' | 'certifications' | 'community_standing' | 'expert_endorsement';
  score: number;
  max_score: number;
  description: string;
  supporting_evidence: string[];
  last_updated: string;
}

export interface ProfilePrivacySettings {
  show_contact_info: 'public' | 'followers_only' | 'private';
  show_financial_data: 'public' | 'followers_only' | 'private';
  show_yield_data: 'public' | 'followers_only' | 'private';
  show_location: 'exact' | 'approximate' | 'city_only' | 'hidden';
  allow_direct_messages: boolean;
  allow_product_inquiries: boolean;
  allow_collaboration_requests: boolean;
  show_online_status: boolean;
  searchable_in_directory: boolean;
}

export interface ProfileEndorsement {
  id: string;
  endorser_id: string;
  endorser_name: string;
  endorser_title?: string;
  endorsement_type: 'skill' | 'character' | 'quality' | 'service' | 'knowledge';
  skill_or_attribute: string;
  message?: string;
  rating?: number;
  is_featured: boolean;
  created_at: string;
}

export interface FarmingMethod {
  method_name: string;
  description: string;
  percentage_of_farm: number;
  started_date: string;
  certifications?: string[];
}

export interface SeasonalCalendar {
  month: number;
  activities: SeasonalActivity[];
  crops_in_season: string[];
  expected_weather: string;
  key_tasks: string[];
}

export interface SeasonalActivity {
  activity_type: 'planting' | 'harvesting' | 'maintenance' | 'processing' | 'marketing';
  crop_or_activity: string;
  start_date: string;
  end_date?: string;
  description: string;
  resources_needed: string[];
}

export interface CustomerTestimonial {
  id: string;
  customer_name: string;
  customer_title?: string;
  customer_organization?: string;
  testimonial_text: string;
  rating: number;
  product_or_service: string;
  date_given: string;
  is_verified: boolean;
  permission_to_display: boolean;
}

export interface FarmAchievement {
  id: string;
  title: string;
  description: string;
  category: 'production' | 'sustainability' | 'innovation' | 'community' | 'quality' | 'safety';
  achievement_date: string;
  issuing_organization?: string;
  evidence_url?: string;
  impact_description: string;
}

export interface FarmAward {
  id: string;
  award_name: string;
  awarding_organization: string;
  category: string;
  description: string;
  award_date: string;
  level: 'local' | 'regional' | 'national' | 'international';
  certificate_url?: string;
  media_coverage?: string[];
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
  telegram?: string;
  website?: string;
  blog?: string;
}

export interface CommunityInvolvement {
  organization_name: string;
  role: string;
  involvement_type: 'member' | 'volunteer' | 'leader' | 'founder' | 'advisor';
  description: string;
  start_date: string;
  end_date?: string;
  is_ongoing: boolean;
}

export interface ComplianceRecord {
  regulation_type: 'environmental' | 'food_safety' | 'labor' | 'tax' | 'zoning' | 'animal_welfare';
  regulation_name: string;
  compliance_status: 'compliant' | 'non_compliant' | 'pending' | 'exempt';
  last_inspection_date?: string;
  next_inspection_due?: string;
  inspector_organization?: string;
  notes?: string;
  document_url?: string;
}

export interface FinancialOverview {
  revenue_categories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  cost_breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  profitability_trends: {
    year: number;
    revenue: number;
    costs: number;
    profit: number;
    profit_margin: number;
  }[];
  investment_areas: {
    area: string;
    amount_invested: number;
    expected_roi: number;
    timeline_months: number;
  }[];
  financial_goals: {
    goal: string;
    target_amount: number;
    deadline: string;
    progress_percentage: number;
  }[];
  is_public: boolean;
  last_updated: string;
}

export type FarmType = 'crop' | 'livestock' | 'mixed' | 'aquaculture' | 'poultry' | 'dairy' | 'orchard' | 'greenhouse' | 'organic' | 'commercial' | 'subsistence';

// Profile sharing and collaboration types
export interface ProfileShare {
  id: string;
  profile_id: string;
  shared_by_user_id: string;
  share_type: 'link' | 'qr_code' | 'direct_message' | 'social_media';
  access_level: 'view_only' | 'contact_enabled' | 'collaboration_enabled';
  expiry_date?: string;
  password_protected: boolean;
  view_count: number;
  created_at: string;
}

export interface CollaborationRequest {
  id: string;
  requester_profile_id: string;
  target_profile_id: string;
  collaboration_type: 'knowledge_exchange' | 'resource_sharing' | 'joint_venture' | 'mentorship' | 'supply_chain';
  title: string;
  description: string;
  proposed_terms?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  response_message?: string;
  created_at: string;
  responded_at?: string;
}

// Search and discovery
export interface FarmProfileSearchFilters {
  location_radius_km?: number;
  farm_types?: FarmType[];
  crops?: string[];
  certifications?: string[];
  services_offered?: string[];
  min_area_hectares?: number;
  max_area_hectares?: number;
  sustainability_min_score?: number;
  verification_level?: string;
  availability_status?: string;
  established_year_range?: [number, number];
}

export interface FarmProfileSearchResult {
  profile: DigitalFarmProfile;
  match_score: number;
  distance_km?: number;
  matching_criteria: string[];
  relevance_factors: {
    location: number;
    products: number;
    services: number;
    reputation: number;
    compatibility: number;
  };
}