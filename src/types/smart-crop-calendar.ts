export interface CropVariety {
  id: string;
  name: string;
  scientific_name: string;
  crop_family: string;
  crop_type: 'grain' | 'vegetable' | 'fruit' | 'legume' | 'tuber' | 'fiber' | 'oil_seed' | 'sugar' | 'spice' | 'medicinal';
  
  // Growth Characteristics
  growth_duration_days: {
    min: number;
    max: number;
    optimal: number;
  };
  growth_stages: GrowthStage[];
  maturity_indicators: string[];
  
  // Environmental Requirements
  temperature_requirements: {
    min_celsius: number;
    max_celsius: number;
    optimal_range: [number, number];
  };
  water_requirements: {
    total_mm: number;
    stages: { [stage: string]: number };
    drought_tolerance: 'low' | 'medium' | 'high';
  };
  soil_requirements: {
    ph_range: [number, number];
    soil_types: string[];
    drainage: 'poor' | 'moderate' | 'good' | 'excellent';
    nutrient_needs: NutrientRequirement[];
  };
  sunlight_requirements: {
    hours_per_day: number;
    intensity: 'low' | 'medium' | 'high';
    photoperiod_sensitive: boolean;
  };
  
  // Planting Information
  planting_seasons: PlantingSeason[];
  seed_rate_kg_per_hectare: number;
  planting_depth_cm: number;
  row_spacing_cm: number;
  plant_spacing_cm: number;
  
  // Yield Information
  expected_yield_kg_per_hectare: {
    low: number;
    average: number;
    high: number;
  };
  harvest_index: number; // Ratio of harvested part to total biomass
  
  // Pest and Disease Information
  common_pests: PestInfo[];
  common_diseases: DiseaseInfo[];
  
  // Market Information
  market_price_range: {
    currency: string;
    min_price_per_kg: number;
    max_price_per_kg: number;
    seasonal_variations: { [month: string]: number };
  };
  
  storage_requirements: StorageRequirement[];
  processing_options: string[];
  
  created_at: string;
  updated_at: string;
}

export interface GrowthStage {
  stage_name: string;
  stage_code: string; // e.g., "V1", "V2", "R1", "R2" for corn
  days_from_planting: {
    min: number;
    max: number;
  };
  description: string;
  key_activities: StageActivity[];
  critical_period: boolean;
  stage_duration_days: number;
  
  // Stage-specific requirements
  water_needs_mm: number;
  fertilizer_needs: NutrientRequirement[];
  temperature_sensitivity: 'low' | 'medium' | 'high';
  
  // Monitoring points
  visual_indicators: string[];
  measurements: string[];
  photos_recommended: boolean;
}

export interface StageActivity {
  activity_type: 'irrigation' | 'fertilization' | 'pest_control' | 'disease_management' | 'pruning' | 'weeding' | 'monitoring' | 'harvesting';
  activity_name: string;
  description: string;
  timing: 'early' | 'mid' | 'late';
  is_critical: boolean;
  frequency: string;
  materials_needed: string[];
  labor_hours_per_hectare: number;
}

export interface PlantingSeason {
  season_name: string;
  start_month: number;
  end_month: number;
  best_planting_window: {
    start_day: number;
    end_day: number;
  };
  climate_zones: string[];
  rainfall_dependent: boolean;
  irrigation_required: boolean;
  yield_potential: 'low' | 'medium' | 'high';
  risk_factors: string[];
}

export interface NutrientRequirement {
  nutrient: string; // N, P, K, Ca, Mg, S, etc.
  amount_kg_per_hectare: number;
  application_timing: string[];
  form: string; // Urea, DAP, NPK, etc.
  application_method: string;
}

export interface PestInfo {
  pest_name: string;
  scientific_name: string;
  pest_type: 'insect' | 'mite' | 'nematode' | 'rodent' | 'bird' | 'weed';
  damage_description: string;
  symptoms: string[];
  vulnerable_stages: string[];
  favorable_conditions: string[];
  management_strategies: ManagementStrategy[];
  economic_threshold: string;
}

export interface DiseaseInfo {
  disease_name: string;
  pathogen_type: 'fungal' | 'bacterial' | 'viral' | 'physiological';
  pathogen_name: string;
  symptoms: string[];
  affected_parts: string[];
  favorable_conditions: WeatherCondition[];
  management_strategies: ManagementStrategy[];
  resistant_varieties: string[];
}

export interface ManagementStrategy {
  strategy_type: 'cultural' | 'biological' | 'chemical' | 'mechanical' | 'integrated';
  method: string;
  timing: string;
  effectiveness: 'low' | 'medium' | 'high';
  cost_per_hectare: number;
  environmental_impact: 'low' | 'medium' | 'high';
  organic_approved: boolean;
}

export interface WeatherCondition {
  parameter: 'temperature' | 'humidity' | 'rainfall' | 'wind_speed' | 'sunshine_hours';
  condition: 'low' | 'medium' | 'high' | 'very_high';
  range?: [number, number];
  duration: string;
}

export interface StorageRequirement {
  storage_type: string;
  temperature_celsius: number;
  humidity_percentage: number;
  storage_duration_months: number;
  quality_loss_percentage: number;
  required_treatments: string[];
}

// Smart Crop Calendar System
export interface CropCalendar {
  id: string;
  user_id: string;
  tenant_id: string;
  farm_field_id: string;
  
  // Basic Information
  calendar_name: string;
  crop_variety_id: string;
  crop_variety: CropVariety;
  planting_area_hectares: number;
  
  // Seasonal Information
  growing_season: string;
  planting_date: string;
  expected_harvest_date: string;
  actual_harvest_date?: string;
  
  // Location and Environmental Context
  location: {
    latitude: number;
    longitude: number;
    elevation_meters: number;
    climate_zone: string;
    soil_type: string;
  };
  
  // Calendar Phases
  phases: CalendarPhase[];
  current_phase?: CalendarPhase;
  
  // AI Recommendations
  ai_recommendations: AIRecommendation[];
  weather_alerts: WeatherAlert[];
  
  // Progress Tracking
  completion_percentage: number;
  milestones_completed: string[];
  activities_completed: CompletedActivity[];
  
  // Performance Data
  yield_target_kg_per_hectare: number;
  actual_yield_kg_per_hectare?: number;
  costs_incurred: CostRecord[];
  revenue_generated?: number;
  profit_margin?: number;
  
  // Status and Health
  calendar_status: 'planning' | 'active' | 'completed' | 'abandoned' | 'problematic';
  crop_health_score: number; // 0-100
  risk_assessment: RiskAssessment;
  
  // Notifications and Alerts
  active_alerts: Alert[];
  notification_preferences: NotificationPreference[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  last_ai_update: string;
  calendar_version: number;
}

export interface CalendarPhase {
  phase_id: string;
  phase_name: string;
  growth_stage_code: string;
  
  // Timing
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  
  // Activities
  planned_activities: PlannedActivity[];
  completed_activities: CompletedActivity[];
  
  // Monitoring and Measurements
  key_indicators: string[];
  measurements_required: string[];
  photo_points: string[];
  
  // AI Insights
  ai_confidence_score: number;
  risk_factors: string[];
  optimization_suggestions: string[];
  
  // Status
  phase_status: 'upcoming' | 'active' | 'completed' | 'delayed' | 'skipped';
  completion_percentage: number;
  
  // Weather Dependency
  weather_dependent: boolean;
  ideal_weather_conditions: WeatherCondition[];
  weather_forecast_impact: WeatherForecastImpact[];
}

export interface PlannedActivity {
  activity_id: string;
  activity_name: string;
  activity_type: string;
  description: string;
  
  // Scheduling
  scheduled_date: string;
  duration_hours: number;
  can_reschedule: boolean;
  reschedule_window_days: number;
  
  // Resources
  materials_needed: MaterialRequirement[];
  equipment_needed: string[];
  labor_required: {
    skilled_hours: number;
    unskilled_hours: number;
    specialized_roles: string[];
  };
  
  // AI Optimization
  ai_recommended: boolean;
  ai_confidence: number;
  alternative_dates: string[];
  weather_dependency: boolean;
  
  // Cost and Impact
  estimated_cost: number;
  expected_impact: string;
  critical_activity: boolean;
  
  // Instructions
  step_by_step_instructions: string[];
  safety_precautions: string[];
  quality_checkpoints: string[];
}

export interface CompletedActivity {
  activity_id: string;
  planned_activity_id: string;
  
  // Execution Details
  completed_date: string;
  actual_duration_hours: number;
  completed_by: string;
  
  // Materials and Resources Used
  actual_materials_used: MaterialUsed[];
  actual_labor_hours: number;
  actual_cost: number;
  
  // Quality and Results
  quality_score: number; // 0-100
  notes: string;
  photos: string[];
  measurements: { [parameter: string]: number };
  
  // Issues and Deviations
  issues_encountered: string[];
  deviations_from_plan: string[];
  corrective_actions_taken: string[];
  
  // Performance Assessment
  effectiveness_rating: number; // 1-5
  would_repeat: boolean;
  improvement_suggestions: string[];
}

export interface MaterialRequirement {
  material_name: string;
  material_type: string;
  quantity: number;
  unit: string;
  specification: string;
  supplier_preference?: string;
  cost_per_unit: number;
  organic_certified?: boolean;
}

export interface MaterialUsed {
  material_name: string;
  quantity_used: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  supplier: string;
  batch_number?: string;
  quality_rating: number;
}

// AI Advisory System
export interface AIRecommendation {
  recommendation_id: string;
  calendar_id: string;
  
  // Recommendation Details
  recommendation_type: 'planting' | 'irrigation' | 'fertilization' | 'pest_control' | 'disease_management' | 'harvest' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence_score: number; // 0-100
  
  // Content
  title: string;
  description: string;
  detailed_instructions: string[];
  
  // Timing
  recommended_date: string;
  time_window: {
    earliest_date: string;
    latest_date: string;
  };
  
  // Data Sources
  based_on_factors: string[];
  weather_data_used: WeatherDataPoint[];
  historical_data_used: string[];
  crop_model_version: string;
  
  // Expected Outcomes
  expected_benefits: string[];
  potential_yield_impact: number; // percentage
  cost_benefit_analysis: {
    estimated_cost: number;
    expected_return: number;
    break_even_point: string;
  };
  
  // User Interaction
  status: 'pending' | 'accepted' | 'rejected' | 'modified' | 'completed';
  user_feedback?: string;
  alternative_actions?: string[];
  
  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: string;
  success_metrics: string[];
  
  created_at: string;
  expires_at?: string;
}

export interface WeatherAlert {
  alert_id: string;
  calendar_id: string;
  
  // Alert Details
  alert_type: 'frost' | 'drought' | 'flood' | 'hail' | 'strong_wind' | 'extreme_temperature' | 'disease_risk' | 'pest_outbreak';
  severity: 'watch' | 'advisory' | 'warning' | 'emergency';
  
  // Timing
  alert_start_date: string;
  alert_end_date: string;
  lead_time_hours: number;
  
  // Impact Assessment
  affected_growth_stages: string[];
  potential_damage: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  
  // Recommended Actions
  immediate_actions: string[];
  preventive_measures: string[];
  monitoring_required: string[];
  
  // Data Sources
  weather_source: string;
  model_confidence: number;
  historical_precedent: boolean;
  
  // User Response
  acknowledged: boolean;
  actions_taken: string[];
  outcome_reported?: string;
  
  created_at: string;
  resolved_at?: string;
}

export interface WeatherDataPoint {
  date: string;
  temperature_min: number;
  temperature_max: number;
  temperature_avg: number;
  humidity_percentage: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  sunshine_hours: number;
  pressure_mb: number;
  
  // Derived Metrics
  growing_degree_days: number;
  heat_stress_index: number;
  chill_hours?: number;
  evapotranspiration_mm: number;
  
  // Quality and Source
  data_source: string;
  data_quality: 'measured' | 'interpolated' | 'forecast' | 'satellite';
  confidence_score: number;
}

export interface WeatherForecastImpact {
  forecast_date: string;
  parameter: string;
  forecasted_value: number;
  impact_on_activity: string;
  recommendation: string;
  confidence_level: number;
}

// Risk Assessment and Management
export interface RiskAssessment {
  assessment_id: string;
  calendar_id: string;
  
  // Overall Risk Score
  overall_risk_score: number; // 0-100 (higher = more risk)
  risk_category: 'low' | 'moderate' | 'high' | 'extreme';
  
  // Risk Categories
  weather_risks: RiskFactor[];
  pest_disease_risks: RiskFactor[];
  market_risks: RiskFactor[];
  operational_risks: RiskFactor[];
  financial_risks: RiskFactor[];
  
  // Mitigation Strategies
  recommended_mitigations: MitigationStrategy[];
  insurance_recommendations: string[];
  
  // Monitoring Plan
  risk_monitoring_plan: string[];
  alert_thresholds: { [risk_type: string]: number };
  
  last_updated: string;
  next_assessment_date: string;
}

export interface RiskFactor {
  risk_name: string;
  risk_type: string;
  probability: number; // 0-100
  impact_severity: number; // 1-5
  risk_score: number; // probability * impact
  
  // Details
  description: string;
  indicators: string[];
  historical_occurrence: number;
  seasonal_pattern?: string;
  
  // Current Status
  current_risk_level: 'low' | 'medium' | 'high' | 'critical';
  trend: 'decreasing' | 'stable' | 'increasing';
  
  // Management
  prevention_measures: string[];
  contingency_plans: string[];
  early_warning_signs: string[];
}

export interface MitigationStrategy {
  strategy_name: string;
  target_risks: string[];
  implementation_cost: number;
  effectiveness_rating: number; // 1-5
  implementation_timeline: string;
  resource_requirements: string[];
  success_metrics: string[];
}

// Cost and Financial Tracking
export interface CostRecord {
  record_id: string;
  calendar_id: string;
  activity_id?: string;
  
  // Cost Details
  cost_category: 'seeds' | 'fertilizer' | 'pesticides' | 'labor' | 'fuel' | 'equipment' | 'irrigation' | 'transport' | 'storage' | 'other';
  cost_subcategory: string;
  amount: number;
  currency: string;
  
  // Transaction Details
  expense_date: string;
  description: string;
  supplier?: string;
  invoice_number?: string;
  
  // Allocation
  allocated_area_hectares: number;
  cost_per_hectare: number;
  
  // Approval and Verification
  approved_by?: string;
  approved_at?: string;
  receipt_url?: string;
  
  created_at: string;
}

// Alerts and Notifications
export interface Alert {
  alert_id: string;
  calendar_id: string;
  
  // Alert Content
  alert_type: 'reminder' | 'warning' | 'urgent_action' | 'opportunity' | 'milestone';
  title: string;
  message: string;
  action_required: string[];
  
  // Timing
  created_at: string;
  due_date?: string;
  auto_resolve_date?: string;
  
  // Priority and Status
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'expired';
  
  // User Interaction
  viewed_at?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  user_notes?: string;
  
  // Delivery Channels
  delivery_methods: ('push' | 'email' | 'sms' | 'whatsapp')[];
  delivered_at?: string;
  
  // Related Data
  related_activity_id?: string;
  related_recommendation_id?: string;
  related_weather_alert_id?: string;
}

export interface NotificationPreference {
  user_id: string;
  calendar_id: string;
  
  // Notification Types
  reminders_enabled: boolean;
  weather_alerts_enabled: boolean;
  ai_recommendations_enabled: boolean;
  milestone_notifications_enabled: boolean;
  
  // Timing Preferences
  lead_time_days: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
  weekend_notifications: boolean;
  
  // Delivery Preferences
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  
  // Content Preferences
  include_weather_details: boolean;
  include_cost_estimates: boolean;
  include_alternative_options: boolean;
  notification_language: string;
}

// Performance Analytics
export interface CropPerformanceAnalytics {
  calendar_id: string;
  analysis_period: {
    start_date: string;
    end_date: string;
  };
  
  // Yield Performance
  yield_analysis: {
    actual_yield_kg_per_hectare: number;
    target_yield_kg_per_hectare: number;
    yield_variance_percentage: number;
    yield_compared_to_regional_average: number;
    quality_grade: string;
    quality_score: number;
  };
  
  // Financial Performance
  financial_analysis: {
    total_revenue: number;
    total_costs: number;
    net_profit: number;
    profit_margin_percentage: number;
    return_on_investment: number;
    cost_per_kg_produced: number;
  };
  
  // Efficiency Metrics
  efficiency_metrics: {
    water_use_efficiency: number;
    nutrient_use_efficiency: number;
    labor_productivity: number;
    land_productivity: number;
    energy_efficiency: number;
  };
  
  // Sustainability Indicators
  sustainability_metrics: {
    carbon_footprint_kg_co2: number;
    water_footprint_liters: number;
    soil_health_impact_score: number;
    biodiversity_impact_score: number;
    chemical_input_intensity: number;
  };
  
  // Risk and Management
  risk_management_effectiveness: {
    risk_events_encountered: number;
    mitigation_success_rate: number;
    crop_loss_percentage: number;
    insurance_claims_made: number;
  };
  
  // AI System Performance
  ai_system_performance: {
    recommendations_given: number;
    recommendations_followed: number;
    recommendation_success_rate: number;
    forecast_accuracy: number;
    user_satisfaction_score: number;
  };
  
  // Comparative Analysis
  benchmarking: {
    peer_comparison: {
      yield_percentile: number;
      cost_percentile: number;
      profitability_percentile: number;
    };
    historical_comparison: {
      yield_trend: 'improving' | 'stable' | 'declining';
      cost_trend: 'improving' | 'stable' | 'worsening';
      profit_trend: 'improving' | 'stable' | 'declining';
    };
  };
  
  // Key Insights and Recommendations
  insights: string[];
  improvement_opportunities: string[];
  next_season_recommendations: string[];
  
  generated_at: string;
}

// Search and Filtering
export interface CropCalendarFilters {
  crop_varieties?: string[];
  growing_seasons?: string[];
  calendar_status?: string[];
  risk_levels?: string[];
  location_radius_km?: number;
  date_range?: {
    start: string;
    end: string;
  };
  yield_performance?: 'below_target' | 'meeting_target' | 'exceeding_target';
  profitability?: 'loss' | 'break_even' | 'profitable' | 'highly_profitable';
}