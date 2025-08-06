export interface TraceabilityBatch {
  batch_id: string;
  internal_batch_code: string;
  qr_code: string;
  
  // Basic Information
  user_id: string;
  tenant_id: string;
  farm_profile_id: string;
  field_id: string;
  
  // Crop Information
  crop_variety_id: string;
  crop_variety_name: string;
  crop_scientific_name: string;
  seed_variety: string;
  seed_lot_number?: string;
  organic_certified: boolean;
  
  // Production Cycle
  planting_date: string;
  harvest_date: string;
  production_season: string;
  growing_period_days: number;
  
  // Quantities
  planted_area_hectares: number;
  harvested_quantity_kg: number;
  yield_per_hectare: number;
  quality_grade: string;
  
  // Location Information
  field_location: {
    gps_coordinates: {
      latitude: number;
      longitude: number;
    };
    field_name: string;
    field_size_hectares: number;
    soil_type: string;
    elevation_meters: number;
    nearest_town: string;
    region: string;
    country: string;
  };
  
  // Certifications
  certifications: BatchCertification[];
  compliance_records: ComplianceRecord[];
  third_party_verifications: ThirdPartyVerification[];
  
  // Production Records
  production_activities: ProductionActivity[];
  input_applications: InputApplication[];
  monitoring_records: MonitoringRecord[];
  
  // Health and Safety
  food_safety_records: FoodSafetyRecord[];
  residue_test_results: ResidueTestResult[];
  contaminant_test_results: ContaminantTestResult[];
  
  // Processing and Handling
  post_harvest_handling: PostHarvestHandling[];
  processing_records: ProcessingRecord[];
  storage_records: StorageRecord[];
  
  // Transport and Distribution
  transport_records: TransportRecord[];
  distribution_chain: DistributionNode[];
  chain_of_custody: CustodyTransfer[];
  
  // Quality Control
  quality_inspections: QualityInspection[];
  laboratory_tests: LaboratoryTest[];
  defect_records: DefectRecord[];
  
  // Environmental Impact
  sustainability_metrics: SustainabilityMetrics;
  carbon_footprint: CarbonFootprintData;
  water_usage_records: WaterUsageRecord[];
  
  // Market and Export
  export_records: ExportRecord[];
  buyer_information: BuyerInformation[];
  price_information: PriceInformation;
  
  // Digital Documentation
  photos: BatchPhoto[];
  documents: BatchDocument[];
  blockchain_records: BlockchainRecord[];
  
  // Status and Lifecycle
  batch_status: 'active' | 'harvested' | 'processed' | 'shipped' | 'delivered' | 'recalled' | 'expired';
  lifecycle_stage: 'production' | 'post_harvest' | 'processing' | 'distribution' | 'retail' | 'consumed';
  
  // Traceability Links
  parent_batches: string[]; // For processed products
  child_batches: string[];  // If batch was split
  related_batches: string[]; // Mixed with other batches
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  last_modified_by: string;
  
  // Public Information Settings
  public_visibility: 'full' | 'limited' | 'basic' | 'private';
  consumer_facing_info: ConsumerInfo;
}

export interface BatchCertification {
  certification_id: string;
  certification_type: 'organic' | 'fair_trade' | 'global_gap' | 'rainforest_alliance' | 'kosher' | 'halal' | 'non_gmo' | 'other';
  certification_name: string;
  certifying_body: string;
  certificate_number: string;
  
  // Validity
  issue_date: string;
  expiry_date: string;
  renewal_date?: string;
  
  // Scope
  scope_description: string;
  certified_products: string[];
  certified_processes: string[];
  
  // Documentation
  certificate_document_url: string;
  audit_report_url?: string;
  annual_review_url?: string;
  
  // Verification
  verification_status: 'valid' | 'expired' | 'suspended' | 'revoked';
  last_verification_date: string;
  next_audit_date: string;
  
  // Standards Compliance
  standards_version: string;
  compliance_level: 'basic' | 'intermediate' | 'advanced';
  non_conformities: NonConformity[];
  
  created_at: string;
  updated_at: string;
}

export interface NonConformity {
  nc_id: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  corrective_action: string;
  correction_deadline: string;
  status: 'open' | 'in_progress' | 'closed' | 'verified';
  evidence_url?: string;
}

export interface ProductionActivity {
  activity_id: string;
  activity_type: 'land_preparation' | 'planting' | 'irrigation' | 'fertilization' | 'pest_control' | 'disease_control' | 'weeding' | 'harvesting' | 'other';
  activity_name: string;
  activity_date: string;
  
  // Execution Details
  operator_name: string;
  operator_id?: string;
  supervisor_name?: string;
  duration_hours: number;
  area_treated_hectares?: number;
  
  // Equipment and Tools
  equipment_used: EquipmentRecord[];
  tools_used: string[];
  
  // Materials and Inputs
  materials_used: MaterialUsage[];
  
  // Conditions
  weather_conditions: {
    temperature_celsius: number;
    humidity_percentage: number;
    wind_speed_kmh: number;
    precipitation_mm: number;
  };
  soil_conditions: string;
  
  // Results and Observations
  results_achieved: string;
  observations: string;
  issues_encountered: string[];
  corrective_actions: string[];
  
  // Quality Control
  quality_check_passed: boolean;
  quality_notes: string;
  
  // Documentation
  photos: string[];
  gps_coordinates: {
    start_lat: number;
    start_lng: number;
    end_lat?: number;
    end_lng?: number;
  };
  
  // Compliance
  sop_followed: boolean;
  sop_reference: string;
  safety_protocols_followed: boolean;
  
  created_at: string;
  created_by: string;
}

export interface InputApplication {
  application_id: string;
  input_type: 'fertilizer' | 'pesticide' | 'herbicide' | 'fungicide' | 'growth_regulator' | 'soil_amendment' | 'seed_treatment' | 'other';
  
  // Product Information
  product_name: string;
  active_ingredients: ActiveIngredient[];
  manufacturer: string;
  batch_lot_number: string;
  registration_number?: string;
  
  // Application Details
  application_date: string;
  application_time: string;
  application_method: 'spray' | 'broadcast' | 'band' | 'furrow' | 'foliar' | 'soil_injection' | 'seed_coating' | 'other';
  
  // Quantities
  quantity_applied: number;
  unit: string;
  concentration: number;
  application_rate_per_hectare: number;
  
  // Target Information
  target_pest_disease?: string;
  target_growth_stage: string;
  application_reason: string;
  
  // Environmental Conditions
  temperature_celsius: number;
  humidity_percentage: number;
  wind_speed_kmh: number;
  wind_direction: string;
  
  // Safety and Compliance
  pre_harvest_interval_days: number;
  re_entry_interval_hours: number;
  organic_approved: boolean;
  mrl_compliance: boolean;
  
  // Application Team
  applicator_name: string;
  applicator_license?: string;
  supervisor_name: string;
  
  // Equipment
  application_equipment: string;
  calibration_date: string;
  calibration_verified: boolean;
  
  // Documentation
  msds_reference: string;
  label_directions_followed: boolean;
  application_photos: string[];
  
  created_at: string;
  recorded_by: string;
}

export interface ActiveIngredient {
  ingredient_name: string;
  cas_number: string;
  concentration_percentage: number;
  function: string; // insecticide, fungicide, etc.
}

export interface MonitoringRecord {
  monitoring_id: string;
  monitoring_type: 'growth_stage' | 'pest_scouting' | 'disease_assessment' | 'soil_monitoring' | 'water_quality' | 'yield_estimation' | 'quality_check';
  monitoring_date: string;
  monitoring_time: string;
  
  // Location
  monitoring_area: string;
  gps_coordinates: {
    latitude: number;
    longitude: number;
  };
  sample_size: string;
  
  // Observations
  observations: MonitoringObservation[];
  measurements: MonitoringMeasurement[];
  
  // Assessment Results
  overall_assessment: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  action_required: boolean;
  recommended_actions: string[];
  
  // Personnel
  monitored_by: string;
  verified_by?: string;
  
  // Documentation
  photos: string[];
  lab_samples_taken: boolean;
  lab_sample_ids: string[];
  
  created_at: string;
}

export interface MonitoringObservation {
  parameter: string;
  value: string;
  unit?: string;
  threshold_status: 'below' | 'within' | 'above';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export interface MonitoringMeasurement {
  measurement_type: string;
  value: number;
  unit: string;
  method: string;
  accuracy: string;
  reference_standard?: string;
}

export interface PostHarvestHandling {
  handling_id: string;
  handling_stage: 'field_collection' | 'cleaning' | 'sorting' | 'grading' | 'packaging' | 'cooling' | 'drying' | 'curing';
  handling_date: string;
  
  // Process Details
  process_description: string;
  equipment_used: string[];
  facility_location: string;
  
  // Conditions
  ambient_temperature: number;
  relative_humidity: number;
  processing_time_hours: number;
  
  // Quality Control
  quality_parameters: QualityParameter[];
  rejected_quantity_kg: number;
  rejection_reasons: string[];
  
  // Personnel
  operator_name: string;
  quality_inspector: string;
  
  // Hygiene and Safety
  hygiene_protocols_followed: boolean;
  haccp_compliance: boolean;
  cleaning_log_reference: string;
  
  created_at: string;
  recorded_by: string;
}

export interface QualityParameter {
  parameter_name: string;
  measured_value: number;
  unit: string;
  specification_range: [number, number];
  meets_specification: boolean;
  test_method: string;
}

export interface StorageRecord {
  storage_id: string;
  storage_type: 'warehouse' | 'silo' | 'cold_storage' | 'controlled_atmosphere' | 'field_storage' | 'processing_plant';
  
  // Location
  facility_name: string;
  facility_address: string;
  storage_unit_id: string;
  
  // Timing
  storage_start_date: string;
  storage_end_date?: string;
  storage_duration_days?: number;
  
  // Conditions
  temperature_celsius: number;
  humidity_percentage: number;
  atmosphere_composition?: {
    oxygen_percentage: number;
    co2_percentage: number;
    nitrogen_percentage: number;
  };
  
  // Inventory
  quantity_stored_kg: number;
  packaging_type: string;
  storage_layout: string;
  
  // Quality Monitoring
  quality_checks: StorageQualityCheck[];
  pest_monitoring: PestMonitoringRecord[];
  
  // Treatments Applied
  treatments_applied: StorageTreatment[];
  
  // Personnel
  facility_manager: string;
  quality_supervisor: string;
  
  // Compliance
  food_safety_compliance: boolean;
  organic_integrity_maintained: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface StorageQualityCheck {
  check_date: string;
  moisture_percentage: number;
  temperature_core: number;
  pest_activity: 'none' | 'low' | 'medium' | 'high';
  mold_presence: boolean;
  overall_condition: 'excellent' | 'good' | 'fair' | 'poor';
  corrective_actions: string[];
}

export interface PestMonitoringRecord {
  monitoring_date: string;
  pest_type: string;
  trap_count: number;
  infestation_level: 'none' | 'light' | 'moderate' | 'severe';
  action_threshold_exceeded: boolean;
  treatments_applied: string[];
}

export interface StorageTreatment {
  treatment_date: string;
  treatment_type: 'fumigation' | 'cooling' | 'heating' | 'aeration' | 'drying' | 'ozone' | 'other';
  product_used?: string;
  dosage?: string;
  duration_hours: number;
  operator: string;
  effectiveness: string;
  residue_testing_required: boolean;
}

export interface TransportRecord {
  transport_id: string;
  transport_type: 'truck' | 'rail' | 'ship' | 'air' | 'pipeline';
  
  // Vehicle Information
  vehicle_id: string;
  vehicle_type: string;
  license_plate: string;
  driver_name: string;
  driver_license: string;
  
  // Route Information
  origin: TransportLocation;
  destination: TransportLocation;
  route_taken: string;
  distance_km: number;
  
  // Timing
  departure_date_time: string;
  arrival_date_time: string;
  transport_duration_hours: number;
  
  // Cargo Information
  quantity_transported_kg: number;
  packaging_type: string;
  loading_temperature: number;
  unloading_temperature: number;
  
  // Conditions Monitoring
  temperature_log: TemperatureLogEntry[];
  humidity_log: HumidityLogEntry[];
  gps_tracking_log: GPSLogEntry[];
  
  // Quality Control
  pre_transport_inspection: InspectionRecord;
  post_transport_inspection: InspectionRecord;
  integrity_maintained: boolean;
  
  // Documentation
  bill_of_lading: string;
  transport_permits: string[];
  insurance_coverage: string;
  
  // Compliance
  food_safety_compliance: boolean;
  organic_chain_custody: boolean;
  export_documentation: string[];
  
  created_at: string;
  recorded_by: string;
}

export interface TransportLocation {
  name: string;
  address: string;
  gps_coordinates: {
    latitude: number;
    longitude: number;
  };
  contact_person: string;
  contact_phone: string;
}

export interface TemperatureLogEntry {
  timestamp: string;
  temperature_celsius: number;
  location: 'front' | 'middle' | 'rear';
  alarm_triggered: boolean;
}

export interface HumidityLogEntry {
  timestamp: string;
  humidity_percentage: number;
  location: string;
}

export interface GPSLogEntry {
  timestamp: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading: number;
}

export interface InspectionRecord {
  inspection_date: string;
  inspector_name: string;
  inspection_type: 'visual' | 'sampling' | 'temperature' | 'documentation' | 'comprehensive';
  findings: InspectionFinding[];
  overall_result: 'pass' | 'conditional_pass' | 'fail';
  corrective_actions: string[];
  re_inspection_required: boolean;
}

export interface InspectionFinding {
  category: string;
  observation: string;
  severity: 'minor' | 'major' | 'critical';
  action_required: string;
  deadline?: string;
}

export interface DistributionNode {
  node_id: string;
  node_type: 'wholesaler' | 'distributor' | 'processor' | 'retailer' | 'export_agent' | 'consumer';
  
  // Organization Information
  company_name: string;
  contact_person: string;
  address: string;
  phone: string;
  email: string;
  
  // Timing
  received_date: string;
  dispatched_date?: string;
  quantity_received_kg: number;
  quantity_dispatched_kg?: number;
  
  // Processing/Value Addition
  processing_activities: string[];
  value_added_activities: string[];
  
  // Quality Status
  quality_at_receipt: string;
  quality_at_dispatch?: string;
  
  // Certifications
  node_certifications: string[];
  chain_custody_maintained: boolean;
  
  // Documentation
  receipt_documentation: string[];
  dispatch_documentation: string[];
  
  created_at: string;
}

export interface CustodyTransfer {
  transfer_id: string;
  transfer_date: string;
  
  // Parties
  transferring_party: {
    name: string;
    organization: string;
    signature: string;
    date_signed: string;
  };
  receiving_party: {
    name: string;
    organization: string;
    signature: string;
    date_signed: string;
  };
  
  // Transfer Details
  quantity_transferred_kg: number;
  packaging_details: string;
  condition_at_transfer: string;
  
  // Documentation
  transfer_documentation: string[];
  photos: string[];
  
  // Integrity Seals
  seals_applied: SealRecord[];
  seals_verified: boolean;
  
  created_at: string;
}

export interface SealRecord {
  seal_id: string;
  seal_type: 'tamper_evident' | 'security' | 'quality' | 'organic';
  applied_by: string;
  application_date: string;
  verification_status: 'intact' | 'broken' | 'missing';
  verified_by?: string;
  verification_date?: string;
}

// Quality Control and Testing
export interface LaboratoryTest {
  test_id: string;
  test_type: 'residue_analysis' | 'nutritional_analysis' | 'contaminant_screening' | 'authenticity' | 'quality_parameters' | 'microbiological';
  
  // Sample Information
  sample_id: string;
  sample_date: string;
  sample_location: string;
  sample_size: string;
  sampling_method: string;
  
  // Laboratory Information
  laboratory_name: string;
  laboratory_accreditation: string;
  test_method: string;
  test_standard: string;
  
  // Results
  test_results: TestResult[];
  overall_result: 'pass' | 'fail' | 'inconclusive';
  interpretation: string;
  recommendations: string[];
  
  // Timing
  test_start_date: string;
  test_completion_date: string;
  report_date: string;
  
  // Documentation
  test_report_url: string;
  certificates_of_analysis: string[];
  
  // Compliance
  regulatory_compliance: boolean;
  certification_compliance: boolean;
  client_specification_compliance: boolean;
  
  created_at: string;
}

export interface TestResult {
  parameter_name: string;
  measured_value: number;
  unit: string;
  detection_limit: number;
  specification_limit?: number;
  regulatory_limit?: number;
  meets_specification: boolean;
  meets_regulation: boolean;
  uncertainty: number;
  method_used: string;
}

export interface ResidueTestResult {
  test_id: string;
  testing_date: string;
  laboratory: string;
  
  // Compounds Tested
  compounds_tested: ResidueCompound[];
  
  // Summary
  total_compounds_detected: number;
  compounds_above_mrl: number;
  overall_compliance: boolean;
  food_safety_status: 'safe' | 'conditional' | 'unsafe';
  
  // Certification Impact
  organic_compliance: boolean;
  export_compliance: boolean;
  
  test_report_url: string;
  created_at: string;
}

export interface ResidueCompound {
  compound_name: string;
  cas_number: string;
  detected_level: number;
  unit: string;
  mrl_limit: number;
  detection_limit: number;
  compliant: boolean;
  source_application?: string;
  application_date?: string;
}

// Sustainability and Environmental
export interface SustainabilityMetrics {
  metrics_id: string;
  calculation_date: string;
  
  // Carbon Footprint
  carbon_footprint_kg_co2_eq: number;
  carbon_intensity_per_kg: number;
  carbon_sequestration_kg_co2: number;
  
  // Water Footprint
  total_water_usage_liters: number;
  water_intensity_per_kg: number;
  irrigation_efficiency: number;
  rainwater_harvested_liters: number;
  
  // Energy Usage
  total_energy_consumption_kwh: number;
  renewable_energy_percentage: number;
  energy_intensity_per_kg: number;
  
  // Soil Health
  soil_organic_matter_percentage: number;
  soil_erosion_rate: string;
  biodiversity_index: number;
  cover_crop_usage_percentage: number;
  
  // Chemical Usage
  synthetic_fertilizer_kg_per_hectare: number;
  pesticide_usage_kg_per_hectare: number;
  organic_input_percentage: number;
  
  // Waste Management
  waste_generated_kg: number;
  waste_recycled_percentage: number;
  packaging_recyclable_percentage: number;
  
  // Social Impact
  fair_wage_compliance: boolean;
  worker_safety_score: number;
  community_investment_amount: number;
  
  calculated_by: string;
  calculation_method: string;
  data_quality_score: number;
}

export interface CarbonFootprintData {
  assessment_id: string;
  assessment_scope: 'cradle_to_farm_gate' | 'cradle_to_consumer' | 'full_lifecycle';
  
  // Emission Sources
  emission_sources: CarbonEmissionSource[];
  total_emissions_kg_co2_eq: number;
  
  // Sequestration
  carbon_sequestration: CarbonSequestration[];
  total_sequestration_kg_co2: number;
  
  // Net Impact
  net_carbon_footprint_kg_co2_eq: number;
  carbon_intensity_per_kg_product: number;
  
  // Methodology
  calculation_methodology: string;
  emission_factors_source: string;
  assessment_boundary: string;
  
  // Verification
  verified_by_third_party: boolean;
  verification_standard: string;
  verifier_name?: string;
  
  assessment_date: string;
  valid_until: string;
}

export interface CarbonEmissionSource {
  source_category: 'fuel_combustion' | 'electricity' | 'fertilizer_production' | 'transportation' | 'processing' | 'packaging' | 'other';
  source_description: string;
  activity_data: number;
  unit: string;
  emission_factor: number;
  emissions_kg_co2_eq: number;
  data_quality: 'measured' | 'calculated' | 'estimated' | 'proxy';
}

export interface CarbonSequestration {
  sequestration_type: 'soil_carbon' | 'biomass' | 'root_systems' | 'other';
  sequestration_method: string;
  area_hectares: number;
  sequestration_rate_kg_co2_per_hectare: number;
  total_sequestration_kg_co2: number;
  measurement_method: string;
  measurement_date: string;
}

// Consumer-Facing Information
export interface ConsumerInfo {
  display_name: string;
  story: string;
  farm_description: string;
  
  // Farmer Information
  farmer_name: string;
  farmer_photo?: string;
  farmer_message?: string;
  generations_farming: number;
  
  // Product Journey
  harvest_date: string;
  harvest_story: string;
  processing_methods: string[];
  time_to_market_days: number;
  
  // Sustainability Highlights
  sustainable_practices: string[];
  environmental_benefits: string[];
  social_impact: string[];
  
  // Certifications (Consumer-Friendly)
  certification_logos: string[];
  certification_descriptions: string[];
  
  // Nutritional Information
  nutritional_highlights: string[];
  health_benefits: string[];
  
  // Usage Suggestions
  recipe_suggestions: string[];
  storage_instructions: string;
  best_before_guidance: string;
  
  // Contact Information
  farm_website?: string;
  social_media_links: string[];
  farmer_contact_preference: 'website' | 'social' | 'none';
  
  // Media
  farm_photos: string[];
  product_photos: string[];
  harvest_videos?: string[];
  
  last_updated: string;
}

// Export and Trade
export interface ExportRecord {
  export_id: string;
  export_date: string;
  destination_country: string;
  destination_port: string;
  
  // Regulatory Compliance
  export_permits: ExportPermit[];
  phytosanitary_certificate: string;
  health_certificates: string[];
  origin_certificates: string[];
  
  // Shipment Details
  shipment_method: 'sea' | 'air' | 'land' | 'multimodal';
  container_numbers: string[];
  bill_of_lading: string;
  commercial_invoice: string;
  
  // Quality Requirements
  buyer_specifications: BuyerSpecification[];
  quality_attestations: string[];
  inspection_certificates: string[];
  
  // Traceability Requirements
  traceability_level_required: 'basic' | 'intermediate' | 'comprehensive';
  blockchain_verification: boolean;
  
  // Buyer Information
  buyer_name: string;
  buyer_country: string;
  buyer_requirements: string[];
  
  created_at: string;
  export_agent: string;
}

export interface ExportPermit {
  permit_type: string;
  permit_number: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  conditions: string[];
  valid_for_products: string[];
}

export interface BuyerSpecification {
  specification_type: 'quality' | 'residue' | 'packaging' | 'labeling' | 'traceability' | 'sustainability';
  parameter: string;
  requirement: string;
  tolerance: string;
  test_method: string;
  compliance_verified: boolean;
}

// QR Code System
export interface QRCodeData {
  batch_id: string;
  qr_code_version: string;
  generation_date: string;
  
  // Access Levels
  public_data: QRPublicData;
  authenticated_data?: QRAuthenticatedData;
  private_data?: QRPrivateData;
  
  // QR Code Configuration
  qr_size: 'small' | 'medium' | 'large';
  error_correction_level: 'L' | 'M' | 'Q' | 'H';
  data_capacity_bytes: number;
  
  // Security
  encryption_enabled: boolean;
  digital_signature: string;
  anti_tampering_features: boolean;
  
  // Analytics
  scan_count: number;
  last_scanned: string;
  scan_locations: ScanLocation[];
  
  created_at: string;
  expires_at?: string;
}

export interface QRPublicData {
  product_name: string;
  harvest_date: string;
  farm_name: string;
  farm_location: string;
  certifications: string[];
  sustainability_score: number;
  consumer_message: string;
  website_link: string;
}

export interface QRAuthenticatedData {
  detailed_batch_info: string;
  production_records_summary: string;
  quality_test_results: string;
  transport_history: string;
  chain_of_custody: string;
}

export interface QRPrivateData {
  internal_batch_codes: string;
  supplier_information: string;
  cost_information: string;
  profit_margins: string;
  internal_quality_notes: string;
}

export interface ScanLocation {
  scan_timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  scanner_type: 'consumer' | 'retailer' | 'inspector' | 'buyer' | 'other';
  device_info: string;
}

// Compliance and Regulatory
export interface ComplianceRecord {
  compliance_id: string;
  regulation_type: 'food_safety' | 'organic' | 'export' | 'labor' | 'environmental' | 'tax' | 'other';
  regulation_name: string;
  regulatory_body: string;
  
  // Compliance Status
  compliance_status: 'compliant' | 'non_compliant' | 'pending_verification' | 'conditional';
  compliance_level: 'basic' | 'enhanced' | 'premium';
  
  // Assessment Details
  last_assessment_date: string;
  next_assessment_due: string;
  assessment_method: 'self_declaration' | 'internal_audit' | 'third_party_audit' | 'government_inspection';
  
  // Documentation
  compliance_documents: string[];
  audit_reports: string[];
  corrective_action_plans: string[];
  
  // Issues and Corrections
  non_compliances: NonComplianceIssue[];
  corrective_actions: CorrectiveAction[];
  
  // Validity
  valid_from: string;
  valid_until: string;
  renewal_required: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface NonComplianceIssue {
  issue_id: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  regulation_clause: string;
  identified_date: string;
  identified_by: string;
  root_cause: string;
  risk_assessment: string;
}

export interface CorrectiveAction {
  action_id: string;
  issue_id: string;
  action_description: string;
  responsible_person: string;
  target_completion_date: string;
  actual_completion_date?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  effectiveness_verified: boolean;
  verification_date?: string;
  evidence_of_completion: string[];
}

export interface ThirdPartyVerification {
  verification_id: string;
  verifying_organization: string;
  verifier_accreditation: string;
  
  // Verification Scope
  verification_scope: string;
  standards_verified: string[];
  verification_level: 'desk_review' | 'remote_audit' | 'on_site_audit' | 'comprehensive_assessment';
  
  // Results
  verification_result: 'verified' | 'verified_with_conditions' | 'not_verified' | 'suspended';
  verification_score?: number;
  confidence_level: 'high' | 'medium' | 'low';
  
  // Documentation
  verification_report: string;
  certificate_issued: string;
  public_summary: string;
  
  // Validity
  verification_date: string;
  valid_until: string;
  next_verification_due: string;
  
  created_at: string;
}

// Search and Analytics
export interface TraceabilitySearchFilters {
  date_range?: {
    start: string;
    end: string;
  };
  crop_varieties?: string[];
  certifications?: string[];
  farms?: string[];
  regions?: string[];
  batch_status?: string[];
  quality_grades?: string[];
  export_destinations?: string[];
  buyer_names?: string[];
  compliance_status?: string[];
}

export interface TraceabilityAnalytics {
  total_batches: number;
  total_volume_kg: number;
  average_yield_per_hectare: number;
  certification_distribution: { [certification: string]: number };
  quality_grade_distribution: { [grade: string]: number };
  export_destinations: { [country: string]: number };
  compliance_rate: number;
  traceability_completeness_score: number;
  consumer_engagement_metrics: {
    qr_scans: number;
    unique_scanners: number;
    engagement_rate: number;
  };
  sustainability_metrics_summary: {
    average_carbon_footprint: number;
    average_water_usage: number;
    organic_percentage: number;
  };
  generated_at: string;
}