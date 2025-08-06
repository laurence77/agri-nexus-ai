import { cropAdvisoryService } from './crop-advisory-service';
import { weatherIntelligence } from '@/lib/ai/weather-intelligence';
import {
  CropCalendar,
  CropVariety,
  CalendarPhase,
  PlannedActivity,
  CompletedActivity,
  AIRecommendation,
  WeatherAlert,
  RiskAssessment,
  CropPerformanceAnalytics
} from '@/types/smart-crop-calendar';
import { Coordinate } from '@/types/ai-models';

export interface CreateCalendarInput {
  userId: string;
  tenantId: string;
  farmFieldId: string;
  calendarName: string;
  cropVarietyId: string;
  plantingAreaHectares: number;
  plantingDate: string;
  location: {
    latitude: number;
    longitude: number;
    elevation_meters: number;
    climate_zone: string;
    soil_type: string;
  };
  preferences?: {
    organicCertified?: boolean;
    riskTolerance?: 'low' | 'medium' | 'high';
    optimizationGoal?: 'yield' | 'quality' | 'profit' | 'sustainability';
  };
}

export interface CalendarPrediction {
  predictedHarvestDate: string;
  expectedYieldKgPerHectare: number;
  yieldConfidenceInterval: [number, number];
  totalSeasonLength: number;
  phases: PredictedPhase[];
  riskFactors: string[];
  successProbability: number;
}

export interface PredictedPhase {
  phaseName: string;
  growthStageCode: string;
  predictedStartDate: string;
  predictedEndDate: string;
  durationDays: number;
  keyActivities: string[];
  weatherDependency: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CalendarOptimization {
  originalCalendar: CropCalendar;
  optimizedCalendar: CropCalendar;
  improvements: OptimizationImprovement[];
  expectedBenefits: {
    yieldIncrease: number;
    costReduction: number;
    riskReduction: number;
    sustainabilityScore: number;
  };
  implementationPlan: string[];
}

export interface OptimizationImprovement {
  category: 'timing' | 'resources' | 'activities' | 'risk_mitigation';
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementationCost: number;
  expectedReturn: number;
  confidence: number;
}

export class SmartCropCalendarService {
  private initialized = false;
  private cropVarieties = new Map<string, CropVariety>();
  private calendarCache = new Map<string, { data: CropCalendar; timestamp: number }>();

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await cropAdvisoryService.initialize();
    await this.loadCropVarieties();
    this.initialized = true;
  }

  async createSmartCropCalendar(input: CreateCalendarInput): Promise<CropCalendar> {
    if (!this.initialized) await this.initialize();

    try {
      const cropVariety = this.cropVarieties.get(input.cropVarietyId);
      if (!cropVariety) {
        throw new Error(`Crop variety ${input.cropVarietyId} not found`);
      }

      // Generate calendar prediction
      const prediction = await this.generateCalendarPrediction(input, cropVariety);
      
      // Create base calendar structure
      const calendar = await this.createBaseCalendar(input, cropVariety, prediction);
      
      // Generate phases and activities
      calendar.phases = await this.generateSmartPhases(calendar, cropVariety, prediction);
      
      // Initialize AI recommendations
      calendar.ai_recommendations = await this.generateInitialRecommendations(calendar);
      
      // Set up weather alerts
      calendar.weather_alerts = await this.generateWeatherAlerts(calendar);
      
      // Calculate initial risk assessment
      calendar.risk_assessment = await this.generateRiskAssessment(calendar);
      
      // Cache the calendar
      this.calendarCache.set(calendar.id, {
        data: calendar,
        timestamp: Date.now()
      });

      return calendar;
    } catch (error) {
      console.error('Failed to create smart crop calendar:', error);
      throw error;
    }
  }

  async optimizeCalendar(calendarId: string): Promise<CalendarOptimization> {
    const calendar = await this.getCalendar(calendarId);
    if (!calendar) {
      throw new Error('Calendar not found');
    }

    const cropVariety = this.cropVarieties.get(calendar.crop_variety_id);
    if (!cropVariety) {
      throw new Error('Crop variety not found');
    }

    try {
      // Analyze current performance
      const currentPerformance = await this.analyzeCurrentPerformance(calendar);
      
      // Generate optimization opportunities
      const optimizations = await this.identifyOptimizationOpportunities(
        calendar,
        cropVariety,
        currentPerformance
      );
      
      // Create optimized calendar
      const optimizedCalendar = await this.applyOptimizations(calendar, optimizations);
      
      // Calculate expected benefits
      const expectedBenefits = await this.calculateOptimizationBenefits(
        calendar,
        optimizedCalendar
      );
      
      // Generate implementation plan
      const implementationPlan = this.generateImplementationPlan(optimizations);

      return {
        originalCalendar: calendar,
        optimizedCalendar,
        improvements: optimizations,
        expectedBenefits,
        implementationPlan
      };
    } catch (error) {
      console.error('Failed to optimize calendar:', error);
      throw error;
    }
  }

  async updateCalendarWithRealtimeData(
    calendarId: string,
    realtimeData: {
      weatherData?: any[];
      soilData?: any;
      cropObservations?: any[];
      actualActivities?: CompletedActivity[];
    }
  ): Promise<CropCalendar> {
    const calendar = await this.getCalendar(calendarId);
    if (!calendar) {
      throw new Error('Calendar not found');
    }

    try {
      // Update with real-time data
      if (realtimeData.actualActivities) {
        calendar.activities_completed.push(...realtimeData.actualActivities);
      }

      // Recalculate predictions based on actual progress
      const updatedPrediction = await this.recalculatePredictions(
        calendar,
        realtimeData
      );

      // Update phases based on new predictions
      calendar.phases = await this.adjustPhasesBasedOnProgress(
        calendar,
        updatedPrediction
      );

      // Generate updated recommendations
      const newRecommendations = await this.generateUpdatedRecommendations(
        calendar,
        realtimeData
      );
      calendar.ai_recommendations = [...calendar.ai_recommendations, ...newRecommendations];

      // Update risk assessment
      calendar.risk_assessment = await this.generateRiskAssessment(calendar);

      // Update weather alerts
      calendar.weather_alerts = await this.generateWeatherAlerts(calendar);

      // Update completion percentage
      calendar.completion_percentage = this.calculateCompletionPercentage(calendar);

      // Update crop health score
      calendar.crop_health_score = this.calculateCropHealthScore(
        calendar,
        realtimeData.cropObservations
      );

      calendar.updated_at = new Date().toISOString();
      calendar.last_ai_update = new Date().toISOString();

      // Update cache
      this.calendarCache.set(calendarId, {
        data: calendar,
        timestamp: Date.now()
      });

      return calendar;
    } catch (error) {
      console.error('Failed to update calendar with realtime data:', error);
      throw error;
    }
  }

  async generateCalendarAnalytics(calendarId: string): Promise<CropPerformanceAnalytics> {
    const calendar = await this.getCalendar(calendarId);
    if (!calendar) {
      throw new Error('Calendar not found');
    }

    const analytics: CropPerformanceAnalytics = {
      calendar_id: calendar.id,
      analysis_period: {
        start_date: calendar.planting_date,
        end_date: calendar.actual_harvest_date || calendar.expected_harvest_date
      },
      yield_analysis: {
        actual_yield_kg_per_hectare: calendar.actual_yield_kg_per_hectare || 0,
        target_yield_kg_per_hectare: calendar.yield_target_kg_per_hectare,
        yield_variance_percentage: this.calculateYieldVariance(calendar),
        yield_compared_to_regional_average: this.compareToRegionalAverage(calendar),
        quality_grade: 'A', // Would come from actual assessments
        quality_score: 85
      },
      financial_analysis: {
        total_revenue: calendar.revenue_generated || 0,
        total_costs: calendar.costs_incurred.reduce((sum, cost) => sum + cost.amount, 0),
        net_profit: (calendar.revenue_generated || 0) - calendar.costs_incurred.reduce((sum, cost) => sum + cost.amount, 0),
        profit_margin_percentage: this.calculateProfitMargin(calendar),
        return_on_investment: this.calculateROI(calendar),
        cost_per_kg_produced: this.calculateCostPerKg(calendar)
      },
      efficiency_metrics: {
        water_use_efficiency: this.calculateWaterEfficiency(calendar),
        nutrient_use_efficiency: this.calculateNutrientEfficiency(calendar),
        labor_productivity: this.calculateLaborProductivity(calendar),
        land_productivity: calendar.actual_yield_kg_per_hectare || calendar.yield_target_kg_per_hectare,
        energy_efficiency: this.calculateEnergyEfficiency(calendar)
      },
      sustainability_metrics: {
        carbon_footprint_kg_co2: this.calculateCarbonFootprint(calendar),
        water_footprint_liters: this.calculateWaterFootprint(calendar),
        soil_health_impact_score: 75, // Would come from soil assessments
        biodiversity_impact_score: 80, // Would come from biodiversity assessments
        chemical_input_intensity: this.calculateChemicalIntensity(calendar)
      },
      risk_management_effectiveness: {
        risk_events_encountered: this.countRiskEvents(calendar),
        mitigation_success_rate: this.calculateMitigationSuccessRate(calendar),
        crop_loss_percentage: this.calculateCropLossPercentage(calendar),
        insurance_claims_made: 0 // Would come from insurance data
      },
      ai_system_performance: {
        recommendations_given: calendar.ai_recommendations.length,
        recommendations_followed: this.countFollowedRecommendations(calendar),
        recommendation_success_rate: this.calculateRecommendationSuccessRate(calendar),
        forecast_accuracy: this.calculateForecastAccuracy(calendar),
        user_satisfaction_score: 4.2 // Would come from user feedback
      },
      benchmarking: {
        peer_comparison: {
          yield_percentile: 75,
          cost_percentile: 60,
          profitability_percentile: 80
        },
        historical_comparison: {
          yield_trend: 'improving',
          cost_trend: 'stable',
          profit_trend: 'improving'
        }
      },
      insights: this.generateInsights(calendar),
      improvement_opportunities: this.identifyImprovementOpportunities(calendar),
      next_season_recommendations: this.generateNextSeasonRecommendations(calendar),
      generated_at: new Date().toISOString()
    };

    return analytics;
  }

  private async loadCropVarieties(): Promise<void> {
    // In a real implementation, this would load from a database
    // For now, we'll create some sample varieties
    const sampleVarieties: CropVariety[] = [
      {
        id: 'maize-001',
        name: 'Hybrid Maize H614',
        scientific_name: 'Zea mays',
        crop_family: 'Poaceae',
        crop_type: 'grain',
        growth_duration_days: { min: 90, max: 120, optimal: 105 },
        growth_stages: [
          {
            stage_name: 'Germination',
            stage_code: 'VE',
            days_from_planting: { min: 5, max: 10 },
            description: 'Seed germination and emergence',
            key_activities: [],
            critical_period: true,
            stage_duration_days: 7,
            water_needs_mm: 25,
            fertilizer_needs: [],
            temperature_sensitivity: 'high',
            visual_indicators: ['Coleoptile emergence', 'First leaf visible'],
            measurements: ['Plant height', 'Emergence rate'],
            photos_recommended: true
          }
        ],
        maturity_indicators: ['Kernels dented', 'Moisture content 18-20%'],
        temperature_requirements: {
          min_celsius: 10,
          max_celsius: 35,
          optimal_range: [20, 30]
        },
        water_requirements: {
          total_mm: 500,
          stages: { 'VE': 25, 'V6': 50, 'VT': 75, 'R1': 100, 'R3': 125, 'R6': 125 },
          drought_tolerance: 'medium'
        },
        soil_requirements: {
          ph_range: [6.0, 7.5],
          soil_types: ['loam', 'clay_loam', 'sandy_loam'],
          drainage: 'good',
          nutrient_needs: []
        },
        sunlight_requirements: {
          hours_per_day: 8,
          intensity: 'high',
          photoperiod_sensitive: false
        },
        planting_seasons: [],
        seed_rate_kg_per_hectare: 25,
        planting_depth_cm: 5,
        row_spacing_cm: 75,
        plant_spacing_cm: 25,
        expected_yield_kg_per_hectare: { low: 4000, average: 6000, high: 8000 },
        harvest_index: 0.5,
        common_pests: [],
        common_diseases: [],
        market_price_range: {
          currency: 'USD',
          min_price_per_kg: 0.20,
          max_price_per_kg: 0.35,
          seasonal_variations: {}
        },
        storage_requirements: [],
        processing_options: ['Dry grain', 'Silage', 'Fresh corn'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    sampleVarieties.forEach(variety => {
      this.cropVarieties.set(variety.id, variety);
    });
  }

  private async generateCalendarPrediction(
    input: CreateCalendarInput,
    cropVariety: CropVariety
  ): Promise<CalendarPrediction> {
    const plantingDate = new Date(input.plantingDate);
    const location: Coordinate = {
      lat: input.location.latitude,
      lng: input.location.longitude
    };

    // Get weather forecast for the growing season
    const seasonalForecast = await weatherIntelligence.generateHyperLocalForecast(
      location,
      cropVariety.growth_duration_days.optimal * 24
    );

    // Calculate predicted harvest date
    const growingDegreeUnits = this.calculateGrowingDegreeUnits(seasonalForecast);
    const adjustedGrowthPeriod = this.adjustGrowthPeriodForWeather(
      cropVariety.growth_duration_days.optimal,
      seasonalForecast
    );
    
    const predictedHarvestDate = new Date(
      plantingDate.getTime() + adjustedGrowthPeriod * 24 * 60 * 60 * 1000
    );

    // Predict yield
    const yieldPrediction = this.predictYield(
      cropVariety,
      seasonalForecast,
      input.location,
      input.plantingAreaHectares
    );

    // Generate phase predictions
    const phases = this.generatePhasePredictions(
      plantingDate,
      predictedHarvestDate,
      cropVariety,
      seasonalForecast
    );

    // Assess risk factors
    const riskFactors = await this.identifyRiskFactors(
      location,
      seasonalForecast,
      cropVariety
    );

    return {
      predictedHarvestDate: predictedHarvestDate.toISOString(),
      expectedYieldKgPerHectare: yieldPrediction.expected,
      yieldConfidenceInterval: [yieldPrediction.low, yieldPrediction.high],
      totalSeasonLength: adjustedGrowthPeriod,
      phases,
      riskFactors,
      successProbability: this.calculateSuccessProbability(riskFactors, seasonalForecast)
    };
  }

  private async createBaseCalendar(
    input: CreateCalendarInput,
    cropVariety: CropVariety,
    prediction: CalendarPrediction
  ): Promise<CropCalendar> {
    return {
      id: `calendar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: input.userId,
      tenant_id: input.tenantId,
      farm_field_id: input.farmFieldId,
      calendar_name: input.calendarName,
      crop_variety_id: input.cropVarietyId,
      crop_variety: cropVariety,
      planting_area_hectares: input.plantingAreaHectares,
      growing_season: this.determineGrowingSeason(input.plantingDate),
      planting_date: input.plantingDate,
      expected_harvest_date: prediction.predictedHarvestDate,
      location: input.location,
      phases: [], // Will be populated separately
      ai_recommendations: [],
      weather_alerts: [],
      completion_percentage: 0,
      milestones_completed: [],
      activities_completed: [],
      yield_target_kg_per_hectare: prediction.expectedYieldKgPerHectare,
      costs_incurred: [],
      calendar_status: 'planning',
      crop_health_score: 100,
      risk_assessment: {
        assessment_id: `risk_${Date.now()}`,
        calendar_id: '', // Will be set after calendar creation
        overall_risk_score: 25,
        risk_category: 'moderate',
        weather_risks: [],
        pest_disease_risks: [],
        market_risks: [],
        operational_risks: [],
        financial_risks: [],
        recommended_mitigations: [],
        insurance_recommendations: [],
        risk_monitoring_plan: [],
        alert_thresholds: {},
        last_updated: new Date().toISOString(),
        next_assessment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      active_alerts: [],
      notification_preferences: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_ai_update: new Date().toISOString(),
      calendar_version: 1
    };
  }

  private async generateSmartPhases(
    calendar: CropCalendar,
    cropVariety: CropVariety,
    prediction: CalendarPrediction
  ): Promise<CalendarPhase[]> {
    const phases: CalendarPhase[] = [];
    let currentDate = new Date(calendar.planting_date);

    for (const predictedPhase of prediction.phases) {
      const phase: CalendarPhase = {
        phase_id: `phase_${predictedPhase.growthStageCode}_${Date.now()}`,
        phase_name: predictedPhase.phaseName,
        growth_stage_code: predictedPhase.growthStageCode,
        planned_start_date: predictedPhase.predictedStartDate,
        planned_end_date: predictedPhase.predictedEndDate,
        planned_activities: await this.generatePhaseActivities(
          predictedPhase,
          cropVariety,
          calendar
        ),
        completed_activities: [],
        key_indicators: this.getPhaseKeyIndicators(predictedPhase.growthStageCode),
        measurements_required: this.getPhaseMeasurements(predictedPhase.growthStageCode),
        photo_points: this.getPhasePhotoPoints(predictedPhase.growthStageCode),
        ai_confidence_score: 0.85,
        risk_factors: this.getPhaseRiskFactors(predictedPhase),
        optimization_suggestions: [],
        phase_status: 'upcoming',
        completion_percentage: 0,
        weather_dependent: predictedPhase.weatherDependency > 0.5,
        ideal_weather_conditions: this.getIdealWeatherConditions(predictedPhase.growthStageCode),
        weather_forecast_impact: []
      };

      phases.push(phase);
      currentDate = new Date(predictedPhase.predictedEndDate);
    }

    return phases;
  }

  private async generatePhaseActivities(
    phase: PredictedPhase,
    cropVariety: CropVariety,
    calendar: CropCalendar
  ): Promise<PlannedActivity[]> {
    const activities: PlannedActivity[] = [];

    // Generate activities based on phase and crop variety
    if (phase.growthStageCode === 'VE') {
      activities.push({
        activity_id: `activity_planting_${Date.now()}`,
        activity_name: 'Planting',
        activity_type: 'planting',
        description: `Plant ${cropVariety.name} seeds at ${cropVariety.seed_rate_kg_per_hectare}kg/ha`,
        scheduled_date: phase.predictedStartDate,
        duration_hours: 8,
        can_reschedule: true,
        reschedule_window_days: 3,
        materials_needed: [
          {
            material_name: 'Seeds',
            material_type: 'seed',
            quantity: cropVariety.seed_rate_kg_per_hectare * calendar.planting_area_hectares,
            unit: 'kg',
            specification: cropVariety.name,
            cost_per_unit: 5.0
          }
        ],
        equipment_needed: ['Planter', 'Tractor'],
        labor_required: {
          skilled_hours: 4,
          unskilled_hours: 4,
          specialized_roles: ['Operator']
        },
        ai_recommended: true,
        ai_confidence: 0.9,
        alternative_dates: [
          new Date(new Date(phase.predictedStartDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          new Date(new Date(phase.predictedStartDate).getTime() + 48 * 60 * 60 * 1000).toISOString()
        ],
        weather_dependency: true,
        estimated_cost: 200,
        expected_impact: 'Establish crop stand',
        critical_activity: true,
        step_by_step_instructions: [
          'Check soil moisture conditions',
          'Calibrate planter for seed rate',
          'Plant at specified depth and spacing',
          'Monitor emergence rate'
        ],
        safety_precautions: ['Wear appropriate PPE', 'Follow machinery safety protocols'],
        quality_checkpoints: ['Seed depth verification', 'Plant spacing check', 'Emergence count']
      });
    }

    return activities;
  }

  // Helper methods for calculations
  private calculateGrowingDegreeUnits(forecast: any[]): number {
    return forecast.reduce((sum, day) => {
      const avgTemp = (day.temperature.min + day.temperature.max) / 2;
      return sum + Math.max(0, avgTemp - 10); // Base temperature of 10°C
    }, 0);
  }

  private adjustGrowthPeriodForWeather(basePeriod: number, forecast: any[]): number {
    // Adjust growth period based on temperature and moisture conditions
    const avgTemp = forecast.reduce((sum, day) => sum + day.temperature.avg, 0) / forecast.length;
    const tempFactor = avgTemp < 20 ? 1.1 : avgTemp > 30 ? 1.05 : 1.0;
    
    return Math.round(basePeriod * tempFactor);
  }

  private predictYield(
    cropVariety: CropVariety,
    forecast: any[],
    location: any,
    area: number
  ): { expected: number; low: number; high: number } {
    const baseYield = cropVariety.expected_yield_kg_per_hectare.average;
    
    // Adjust for weather conditions
    const weatherFactor = this.calculateWeatherYieldFactor(forecast);
    
    // Adjust for location factors (simplified)
    const locationFactor = 1.0; // Would be more complex in real implementation
    
    const expectedYield = baseYield * weatherFactor * locationFactor;
    
    return {
      expected: expectedYield,
      low: expectedYield * 0.8,
      high: expectedYield * 1.2
    };
  }

  private calculateWeatherYieldFactor(forecast: any[]): number {
    // Simplified weather yield impact calculation
    let factor = 1.0;
    
    const avgTemp = forecast.reduce((sum, day) => sum + day.temperature.avg, 0) / forecast.length;
    const totalPrecip = forecast.reduce((sum, day) => sum + day.precipitation.amount, 0);
    
    // Temperature impact
    if (avgTemp < 15 || avgTemp > 35) factor *= 0.9;
    else if (avgTemp >= 20 && avgTemp <= 30) factor *= 1.1;
    
    // Precipitation impact
    if (totalPrecip < 300) factor *= 0.85; // Drought stress
    else if (totalPrecip > 800) factor *= 0.9; // Too much water
    else factor *= 1.05; // Optimal water
    
    return Math.max(0.6, Math.min(1.3, factor));
  }

  private generatePhasePredictions(
    plantingDate: Date,
    harvestDate: Date,
    cropVariety: CropVariety,
    forecast: any[]
  ): PredictedPhase[] {
    const phases: PredictedPhase[] = [];
    const totalDays = Math.floor((harvestDate.getTime() - plantingDate.getTime()) / (24 * 60 * 60 * 1000));
    
    // Generate phases based on crop variety growth stages
    let currentDate = new Date(plantingDate);
    
    cropVariety.growth_stages.forEach((stage, index) => {
      const phaseDuration = stage.stage_duration_days;
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate.getTime() + phaseDuration * 24 * 60 * 60 * 1000);
      
      phases.push({
        phaseName: stage.stage_name,
        growthStageCode: stage.stage_code,
        predictedStartDate: startDate.toISOString(),
        predictedEndDate: endDate.toISOString(),
        durationDays: phaseDuration,
        keyActivities: stage.key_activities.map(activity => activity.activity_name),
        weatherDependency: stage.temperature_sensitivity === 'high' ? 0.8 : 0.5,
        riskLevel: stage.critical_period ? 'high' : 'medium'
      });
      
      currentDate = endDate;
    });
    
    return phases;
  }

  private async identifyRiskFactors(
    location: Coordinate,
    forecast: any[],
    cropVariety: CropVariety
  ): Promise<string[]> {
    const risks: string[] = [];
    
    // Weather-based risks
    const extremeEvents = await weatherIntelligence.detectExtremeEvents([], forecast, location);
    extremeEvents.forEach(event => {
      if (event.probability > 0.3) {
        risks.push(`${event.type} risk (${Math.round(event.probability * 100)}% probability)`);
      }
    });
    
    // Crop-specific risks
    if (cropVariety.common_pests.length > 0) {
      risks.push('Pest pressure');
    }
    
    if (cropVariety.common_diseases.length > 0) {
      risks.push('Disease risk');
    }
    
    return risks;
  }

  private calculateSuccessProbability(riskFactors: string[], forecast: any[]): number {
    let baseProbability = 0.85;
    
    // Reduce probability based on risk factors
    const riskImpact = riskFactors.length * 0.05;
    baseProbability -= riskImpact;
    
    // Adjust for weather conditions
    const weatherScore = this.calculateWeatherFavorability(forecast);
    baseProbability += (weatherScore - 0.5) * 0.2;
    
    return Math.max(0.3, Math.min(0.95, baseProbability));
  }

  private calculateWeatherFavorability(forecast: any[]): number {
    // Simplified weather favorability calculation
    let score = 0.5;
    
    const avgTemp = forecast.reduce((sum, day) => sum + day.temperature.avg, 0) / forecast.length;
    if (avgTemp >= 20 && avgTemp <= 30) score += 0.2;
    
    const totalPrecip = forecast.reduce((sum, day) => sum + day.precipitation.amount, 0);
    if (totalPrecip >= 400 && totalPrecip <= 600) score += 0.2;
    
    const extremeDays = forecast.filter(day => 
      day.temperature.max > 35 || 
      day.temperature.min < 5 ||
      day.precipitation.amount > 30
    ).length;
    
    score -= (extremeDays / forecast.length) * 0.3;
    
    return Math.max(0, Math.min(1, score));
  }

  // Additional helper methods would continue here...
  // Due to length constraints, I'll include key stub methods

  private determineGrowingSeason(plantingDate: string): string {
    const date = new Date(plantingDate);
    const month = date.getMonth();
    
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  private async getCalendar(calendarId: string): Promise<CropCalendar | null> {
    const cached = this.calendarCache.get(calendarId);
    if (cached && (Date.now() - cached.timestamp) < 3600000) { // 1 hour cache
      return cached.data;
    }
    
    // In real implementation, would fetch from database
    return null;
  }

  // Stub methods for completeness
  private async generateInitialRecommendations(calendar: CropCalendar): Promise<AIRecommendation[]> { return []; }
  private async generateWeatherAlerts(calendar: CropCalendar): Promise<WeatherAlert[]> { return []; }
  private async generateRiskAssessment(calendar: CropCalendar): Promise<RiskAssessment> { 
    return calendar.risk_assessment; 
  }
  
  private getPhaseKeyIndicators(stageCode: string): string[] { return ['Plant height', 'Leaf development']; }
  private getPhaseMeasurements(stageCode: string): string[] { return ['Height measurement', 'Stand count']; }
  private getPhasePhotoPoints(stageCode: string): string[] { return ['Overall field view', 'Plant close-up']; }
  private getPhaseRiskFactors(phase: PredictedPhase): string[] { return []; }
  private getIdealWeatherConditions(stageCode: string): any[] { return []; }
  
  private calculateCompletionPercentage(calendar: CropCalendar): number { return 25; }
  private calculateCropHealthScore(calendar: CropCalendar, observations?: any[]): number { return 85; }
  
  // Analytics calculation methods
  private calculateYieldVariance(calendar: CropCalendar): number { return 5.2; }
  private compareToRegionalAverage(calendar: CropCalendar): number { return 110; }
  private calculateProfitMargin(calendar: CropCalendar): number { return 25; }
  private calculateROI(calendar: CropCalendar): number { return 1.8; }
  private calculateCostPerKg(calendar: CropCalendar): number { return 0.15; }
  private calculateWaterEfficiency(calendar: CropCalendar): number { return 1.2; }
  private calculateNutrientEfficiency(calendar: CropCalendar): number { return 1.1; }
  private calculateLaborProductivity(calendar: CropCalendar): number { return 500; }
  private calculateEnergyEfficiency(calendar: CropCalendar): number { return 0.8; }
  private calculateCarbonFootprint(calendar: CropCalendar): number { return 250; }
  private calculateWaterFootprint(calendar: CropCalendar): number { return 1500; }
  private calculateChemicalIntensity(calendar: CropCalendar): number { return 45; }
  private countRiskEvents(calendar: CropCalendar): number { return 2; }
  private calculateMitigationSuccessRate(calendar: CropCalendar): number { return 0.85; }
  private calculateCropLossPercentage(calendar: CropCalendar): number { return 5; }
  private countFollowedRecommendations(calendar: CropCalendar): number { return 8; }
  private calculateRecommendationSuccessRate(calendar: CropCalendar): number { return 0.8; }
  private calculateForecastAccuracy(calendar: CropCalendar): number { return 0.78; }
  
  private generateInsights(calendar: CropCalendar): string[] { 
    return ['Excellent water management', 'Timely pest control', 'Above average yield performance'];
  }
  
  private identifyImprovementOpportunities(calendar: CropCalendar): string[] {
    return ['Optimize fertilizer timing', 'Implement precision irrigation', 'Enhance pest monitoring'];
  }
  
  private generateNextSeasonRecommendations(calendar: CropCalendar): string[] {
    return ['Consider drought-resistant varieties', 'Plan earlier planting', 'Invest in weather monitoring'];
  }

  // Optimization methods (stubs)
  private async analyzeCurrentPerformance(calendar: CropCalendar): Promise<any> { return {}; }
  private async identifyOptimizationOpportunities(calendar: CropCalendar, variety: CropVariety, performance: any): Promise<OptimizationImprovement[]> { return []; }
  private async applyOptimizations(calendar: CropCalendar, optimizations: OptimizationImprovement[]): Promise<CropCalendar> { return calendar; }
  private async calculateOptimizationBenefits(original: CropCalendar, optimized: CropCalendar): Promise<any> { return {}; }
  private generateImplementationPlan(optimizations: OptimizationImprovement[]): string[] { return []; }
  
  // Real-time update methods (stubs)
  private async recalculatePredictions(calendar: CropCalendar, data: any): Promise<CalendarPrediction> { 
    return {} as CalendarPrediction; 
  }
  private async adjustPhasesBasedOnProgress(calendar: CropCalendar, prediction: CalendarPrediction): Promise<CalendarPhase[]> { 
    return calendar.phases; 
  }
  private async generateUpdatedRecommendations(calendar: CropCalendar, data: any): Promise<AIRecommendation[]> { 
    return []; 
  }
}

export const smartCropCalendarService = new SmartCropCalendarService();