// AI Model Types for AgriNexus Intelligence Platform

export interface AIModelBase {
  id: string;
  version: string;
  accuracy: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'deprecated';
}

// Predictive Analytics Types
export interface YieldPredictionModel extends AIModelBase {
  fieldId: string;
  cropType: string;
  algorithm: 'neural_network' | 'random_forest' | 'gradient_boosting' | 'ensemble';
  features: {
    weather: WeatherFeature[];
    soil: SoilFeature[];
    historical: HistoricalYield[];
    satellite: SatelliteImagery[];
  };
  predictions: {
    expectedYield: number;
    confidence: number;
    yieldRange: { min: number; max: number };
    riskFactors: RiskFactor[];
    optimalHarvestDate: Date;
    qualityPrediction: CropQuality;
  };
}

export interface WeatherFeature {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  solarRadiation: number;
  growingDegreeDays: number;
}

export interface SoilFeature {
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  temperature: number;
}

export interface HistoricalYield {
  year: number;
  yield: number;
  quality: CropQuality;
  weatherConditions: WeatherSummary;
}

export interface SatelliteImagery {
  date: Date;
  ndvi: number;
  evi: number;
  gndvi: number;
  savi: number;
  cloudCover: number;
}

export interface RiskFactor {
  type: 'weather' | 'disease' | 'pest' | 'soil' | 'market';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: string;
  mitigation: string[];
}

export type CropQuality = 'premium' | 'standard' | 'low' | 'rejected';

export interface WeatherSummary {
  avgTemperature: number;
  totalRainfall: number;
  extremeEvents: string[];
}

// Computer Vision Types
export interface PlantHealthAI extends AIModelBase {
  diseaseDetection: {
    model: 'YOLOv8' | 'EfficientNet' | 'ResNet' | 'MobileNet';
    detectedDiseases: Disease[];
    confidence: number;
    treatmentRecommendations: Treatment[];
    severityAssessment: SeverityLevel;
  };
  pestIdentification: {
    species: string[];
    infestationLevel: 'none' | 'low' | 'medium' | 'high' | 'severe';
    biologicalControls: BiologicalControl[];
    chemicalOptions: ChemicalTreatment[];
    treatmentUrgency: 'low' | 'medium' | 'high' | 'immediate';
  };
  growthStageDetection: {
    currentStage: GrowthStage;
    stageConfidence: number;
    daysToNextStage: number;
    developmentRate: 'slow' | 'normal' | 'fast';
  };
}

export interface Disease {
  name: string;
  scientificName: string;
  confidence: number;
  affectedArea: number;
  symptoms: string[];
  causativeAgent: 'fungal' | 'bacterial' | 'viral' | 'nutritional' | 'environmental';
}

export interface Treatment {
  type: 'chemical' | 'biological' | 'cultural' | 'integrated';
  product: string;
  applicationRate: string;
  timing: string;
  frequency: string;
  cost: number;
  effectiveness: number;
}

export type SeverityLevel = 'trace' | 'light' | 'moderate' | 'severe' | 'devastating';

export interface BiologicalControl {
  organism: string;
  targetPest: string;
  releaseRate: string;
  effectiveness: number;
  cost: number;
}

export interface ChemicalTreatment {
  activeIngredient: string;
  tradeName: string;
  applicationMethod: string;
  dosage: string;
  reEntryInterval: number;
  preHarvestInterval: number;
}

export type GrowthStage = 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'senescence';

// Satellite & Remote Sensing Types
export interface VisionAnalytics extends AIModelBase {
  vegetationIndices: {
    ndvi: number;
    evi: number;
    gndvi: number;
    savi: number;
    msavi: number;
    ndre: number;
  };
  cropStageDetection: {
    growthStage: GrowthStage;
    stageConfidence: number;
    daysToNextStage: number;
    developmentRate: 'slow' | 'normal' | 'fast';
  };
  fieldBoundaryDetection: {
    boundaries: GeoPolygon[];
    area: number;
    confidence: number;
    changeDetection: FieldChange[];
  };
  anomalyDetection: {
    healthyAreas: GeoPolygon[];
    stressedAreas: GeoPolygon[];
    diseaseSpots: GeoPolygon[];
    droughtStress: GeoPolygon[];
    nutrientDeficiency: GeoPolygon[];
  };
  biomassEstimation: {
    totalBiomass: number;
    leafAreaIndex: number;
    canopyCover: number;
    plantHeight: number;
  };
}

export interface GeoPolygon {
  coordinates: Array<[number, number]>;
  area: number;
  centroid: [number, number];
}

export interface FieldChange {
  type: 'expansion' | 'reduction' | 'fragmentation' | 'consolidation';
  area: number;
  date: Date;
  confidence: number;
}

// Smart Irrigation & Automation Types
export interface SmartIrrigationAI extends AIModelBase {
  soilMoistureML: {
    currentMoisture: number;
    predictedMoisture: number[];
    irrigationTiming: Date[];
    waterRequirement: number;
    efficiency: number;
    rootZoneDepth: number;
  };
  weatherIntegration: {
    rainfallPrediction: number[];
    evapotranspirationRate: number;
    temperatureStress: boolean;
    windStress: boolean;
    humidityDeficit: number;
  };
  automationRules: {
    triggers: IrrigationTrigger[];
    actions: IrrigationAction[];
    overrides: ManualOverride[];
    scheduledEvents: ScheduledIrrigation[];
  };
  waterOptimization: {
    savedWater: number;
    efficiencyGain: number;
    costSavings: number;
    environmentalImpact: number;
  };
}

export interface IrrigationTrigger {
  type: 'soil_moisture' | 'weather' | 'crop_stage' | 'time' | 'sensor_fusion';
  threshold: number;
  condition: 'below' | 'above' | 'equals';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface IrrigationAction {
  type: 'start' | 'stop' | 'adjust_flow' | 'change_pattern';
  duration: number;
  flowRate: number;
  zoneId: string;
  estimatedWater: number;
}

export interface ManualOverride {
  userId: string;
  reason: string;
  duration: number;
  timestamp: Date;
}

export interface ScheduledIrrigation {
  startTime: Date;
  duration: number;
  zones: string[];
  waterAmount: number;
  purpose: string;
}

// Equipment AI & Predictive Maintenance
export interface EquipmentAI extends AIModelBase {
  maintenancePrediction: {
    component: string;
    wearLevel: number;
    remainingUsefulLife: number;
    predictedFailureDate: Date;
    maintenanceRecommendation: MaintenanceAction;
    costAvoidance: number;
  };
  operationalEfficiency: {
    fuelOptimization: FuelOptimization;
    pathOptimization: PathPlanning;
    speedRecommendations: SpeedProfile[];
    workQuality: QualityMetrics;
  };
  autonomousCapabilities: {
    navigationAccuracy: number;
    obstacleDetection: boolean;
    emergencyStop: boolean;
    weatherAdaptation: boolean;
  };
}

export interface MaintenanceAction {
  type: 'inspection' | 'repair' | 'replacement' | 'calibration';
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  estimatedCost: number;
  estimatedTime: number;
  requiredParts: string[];
  skillLevel: 'basic' | 'intermediate' | 'advanced' | 'specialist';
}

export interface FuelOptimization {
  currentConsumption: number;
  optimizedConsumption: number;
  savings: number;
  recommendations: string[];
}

export interface PathPlanning {
  algorithm: 'A*' | 'RRT' | 'Dubins' | 'genetic_algorithm';
  waypoints: Coordinate[];
  obstacles: Obstacle[];
  efficiency: number;
  totalDistance: number;
  estimatedTime: number;
}

export interface SpeedProfile {
  fieldSection: string;
  recommendedSpeed: number;
  reason: string;
  fuelImpact: number;
  qualityImpact: number;
}

export interface QualityMetrics {
  seedingAccuracy: number;
  applicationUniformity: number;
  coverageCompleteness: number;
  overlappingReduction: number;
}

export interface Coordinate {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface Obstacle {
  type: 'tree' | 'rock' | 'structure' | 'water' | 'slope';
  coordinates: Coordinate[];
  height: number;
  severity: 'minor' | 'major' | 'blocking';
}

// Financial AI & Market Intelligence
export interface FinancialAI extends AIModelBase {
  priceForecasting: {
    cropPrices: PriceForecast[];
    marketTrends: MarketTrend[];
    volatilityIndex: number;
    seasonalPatterns: SeasonalPattern[];
  };
  riskAssessment: {
    weatherRisk: number;
    marketRisk: number;
    operationalRisk: number;
    financialRisk: number;
    insuranceRecommendations: InsuranceProduct[];
  };
  optimizationRecommendations: {
    cropMix: CropMixOptimization;
    timingRecommendations: PlantingTiming[];
    resourceAllocation: ResourceOptimization;
    investmentPriorities: InvestmentPriority[];
  };
}

export interface PriceForecast {
  commodity: string;
  currentPrice: number;
  forecastedPrice: number;
  timeHorizon: number;
  confidence: number;
  priceDrivers: string[];
}

export interface MarketTrend {
  commodity: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  duration: number;
  factors: string[];
}

export interface SeasonalPattern {
  commodity: string;
  peakMonth: number;
  lowMonth: number;
  averageVariation: number;
  reliability: number;
}

export interface InsuranceProduct {
  type: 'crop' | 'revenue' | 'weather' | 'equipment';
  coverage: number;
  premium: number;
  deductible: number;
  probability: number;
}

export interface CropMixOptimization {
  recommendedCrops: CropRecommendation[];
  expectedRevenue: number;
  riskScore: number;
  diversificationBenefit: number;
}

export interface CropRecommendation {
  crop: string;
  acreage: number;
  expectedYield: number;
  expectedPrice: number;
  profitability: number;
  riskLevel: number;
}

export interface PlantingTiming {
  crop: string;
  optimalPlantingDate: Date;
  plantingWindow: { start: Date; end: Date };
  yieldImpact: number;
  riskFactors: string[];
}

export interface ResourceOptimization {
  fertilizer: ResourceRecommendation;
  water: ResourceRecommendation;
  labor: ResourceRecommendation;
  machinery: ResourceRecommendation;
}

export interface ResourceRecommendation {
  currentUsage: number;
  optimizedUsage: number;
  costSavings: number;
  efficiencyGain: number;
  implementation: string[];
}

export interface InvestmentPriority {
  category: 'equipment' | 'technology' | 'infrastructure' | 'inputs';
  investment: string;
  cost: number;
  roi: number;
  paybackPeriod: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Sensor Intelligence & IoT Types
export interface SensorIntelligence extends AIModelBase {
  anomalyDetection: {
    method: 'isolation_forest' | 'one_class_svm' | 'autoencoder' | 'statistical';
    anomalies: SensorAnomaly[];
    alertThreshold: number;
    falsePositiveRate: number;
  };
  dataFusion: {
    algorithm: 'kalman_filter' | 'particle_filter' | 'extended_kalman' | 'weighted_average';
    fusedReadings: FusedSensorData[];
    uncertainty: number;
    reliability: number;
  };
  predictiveAnalytics: {
    futureReadings: PredictedReading[];
    trendAnalysis: TrendAnalysis;
    seasonalDecomposition: SeasonalDecomposition;
  };
  qualityAssurance: {
    dataQuality: number;
    calibrationStatus: CalibrationStatus;
    maintenanceNeeds: SensorMaintenance[];
  };
}

export interface SensorAnomaly {
  sensorId: string;
  timestamp: Date;
  reading: number;
  expectedRange: { min: number; max: number };
  anomalyScore: number;
  type: 'outlier' | 'drift' | 'spike' | 'missing' | 'stuck';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FusedSensorData {
  timestamp: Date;
  value: number;
  confidence: number;
  contributingSensors: string[];
  weights: number[];
}

export interface PredictedReading {
  timestamp: Date;
  predictedValue: number;
  confidenceInterval: { lower: number; upper: number };
  method: string;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
  slope: number;
  significance: number;
  timeframe: number;
}

export interface SeasonalDecomposition {
  trend: number[];
  seasonal: number[];
  residual: number[];
  strength: number;
}

export interface CalibrationStatus {
  lastCalibration: Date;
  nextDue: Date;
  drift: number;
  accuracy: number;
  needsRecalibration: boolean;
}

export interface SensorMaintenance {
  sensorId: string;
  maintenanceType: 'cleaning' | 'calibration' | 'replacement' | 'repair';
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  estimatedCost: number;
  impact: string;
}

// Weather AI & Climate Intelligence
export interface WeatherAI extends AIModelBase {
  forecasting: {
    hyperLocalWeather: HyperLocalForecast[];
    extremeEventPrediction: ExtremeEvent[];
    microclimateAnalysis: MicroclimateData;
    agriculturalAdvisories: AgricultureAdvisory[];
  };
  climateAnalysis: {
    longTermTrends: ClimateTrend[];
    adaptationRecommendations: AdaptationStrategy[];
    resilientCropVarieties: CropVariety[];
  };
}

export interface HyperLocalForecast {
  location: Coordinate;
  timeHorizon: number;
  temperature: { min: number; max: number; avg: number };
  precipitation: { probability: number; amount: number };
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
  confidence: number;
}

export interface ExtremeEvent {
  type: 'drought' | 'flood' | 'hail' | 'frost' | 'heat_wave' | 'storm';
  probability: number;
  timing: Date;
  severity: number;
  duration: number;
  impactArea: GeoPolygon[];
  preparationTime: number;
}

export interface MicroclimateData {
  zones: MicroclimateZone[];
  variability: number;
  factors: string[];
}

export interface MicroclimateZone {
  id: string;
  area: GeoPolygon;
  characteristics: {
    temperature: number;
    humidity: number;
    windExposure: number;
    soilType: string;
    drainage: string;
  };
  suitableCrops: string[];
}

export interface AgricultureAdvisory {
  type: 'planting' | 'spraying' | 'harvesting' | 'irrigation' | 'protection';
  recommendation: string;
  timing: { start: Date; end: Date };
  confidence: number;
  reasoning: string[];
}

export interface ClimateTrend {
  parameter: 'temperature' | 'precipitation' | 'humidity' | 'extreme_events';
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number;
  significance: number;
  timeframe: number;
}

export interface AdaptationStrategy {
  strategy: string;
  implementation: string[];
  cost: number;
  effectiveness: number;
  timeframe: number;
}

export interface CropVariety {
  name: string;
  characteristics: string[];
  climateResilience: number;
  yieldPotential: number;
  adaptationScore: number;
}

// AI Processing Pipeline Types
export interface AIProcessingPipeline {
  stages: ProcessingStage[];
  dataFlow: DataFlow[];
  performance: PipelinePerformance;
  monitoring: PipelineMonitoring;
}

export interface ProcessingStage {
  id: string;
  name: string;
  type: 'preprocessing' | 'feature_extraction' | 'model_inference' | 'postprocessing';
  inputFormat: string;
  outputFormat: string;
  processingTime: number;
  resourceUsage: ResourceUsage;
}

export interface DataFlow {
  from: string;
  to: string;
  dataType: string;
  frequency: number;
  latency: number;
}

export interface PipelinePerformance {
  throughput: number;
  latency: number;
  accuracy: number;
  resourceEfficiency: number;
}

export interface PipelineMonitoring {
  status: 'healthy' | 'degraded' | 'failed';
  bottlenecks: string[];
  errors: string[];
  alerts: string[];
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  gpu?: number;
  storage: number;
}

// Edge AI & Real-time Processing
export interface EdgeAICapabilities {
  deviceSpecs: EdgeDeviceSpecs;
  models: EdgeModel[];
  communication: EdgeCommunication;
  synchronization: EdgeSync;
}

export interface EdgeDeviceSpecs {
  processingPower: number;
  memoryCapacity: number;
  storageCapacity: number;
  connectivity: string[];
  powerConsumption: number;
  environmentalRating: string;
}

export interface EdgeModel {
  modelId: string;
  modelType: string;
  size: number;
  inferenceTime: number;
  accuracy: number;
  lastUpdate: Date;
}

export interface EdgeCommunication {
  protocol: 'mqtt' | 'coap' | 'http' | 'websocket';
  bandwidth: number;
  latency: number;
  reliability: number;
}

export interface EdgeSync {
  lastSync: Date;
  syncFrequency: number;
  dataTransferred: number;
  conflicts: SyncConflict[];
}

export interface SyncConflict {
  type: 'data' | 'model' | 'configuration';
  timestamp: Date;
  resolution: string;
  impact: string;
}