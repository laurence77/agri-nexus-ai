import { weatherIntelligence } from '@/lib/ai/weather-intelligence';
import { 
  CropCalendar, 
  AIRecommendation, 
  WeatherAlert, 
  CalendarPhase,
  WeatherDataPoint 
} from '@/types/smart-crop-calendar';
import { 
  HyperLocalForecast, 
  ExtremeEvent, 
  AgricultureAdvisory,
  Coordinate 
} from '@/types/ai-models';

export interface CropAdvisoryInput {
  cropCalendar: CropCalendar;
  currentWeatherData: WeatherDataPoint[];
  soilData?: {
    moisture: number;
    temperature: number;
    ph: number;
    nutrients: { [key: string]: number };
  };
  farmLocation: Coordinate;
}

export interface AdvisoryResponse {
  recommendations: AIRecommendation[];
  weatherAlerts: WeatherAlert[];
  phaseAdjustments: PhaseAdjustment[];
  riskAssessment: RiskLevel;
  confidence: number;
  nextUpdateTime: Date;
}

export interface PhaseAdjustment {
  phaseId: string;
  originalDate: string;
  recommendedDate: string;
  reason: string;
  impact: 'minor' | 'moderate' | 'significant';
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export class CropAdvisoryService {
  private initialized = false;
  private advisoryCache = new Map<string, { data: AdvisoryResponse; timestamp: number }>();

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await weatherIntelligence.initialize();
    this.initialized = true;
  }

  async generateCropAdvisory(input: CropAdvisoryInput): Promise<AdvisoryResponse> {
    if (!this.initialized) await this.initialize();

    const cacheKey = `${input.cropCalendar.id}_${Date.now().toString().slice(0, -6)}`;
    const cached = this.advisoryCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < 1800000) { // 30 minutes cache
      return cached.data;
    }

    try {
      const [
        weatherForecast,
        extremeEvents,
        agriculturalAdvisories
      ] = await Promise.all([
        this.getWeatherForecast(input.farmLocation),
        this.getExtremeWeatherEvents(input.currentWeatherData, input.farmLocation),
        this.getAgricultureAdvisories(input.farmLocation, input.cropCalendar)
      ]);

      const recommendations = await this.generateRecommendations(
        input,
        weatherForecast,
        extremeEvents,
        agriculturalAdvisories
      );

      const weatherAlerts = this.convertExtremeEventsToAlerts(
        extremeEvents,
        input.cropCalendar
      );

      const phaseAdjustments = this.calculatePhaseAdjustments(
        input.cropCalendar,
        weatherForecast,
        extremeEvents
      );

      const riskAssessment = this.assessOverallRisk(
        extremeEvents,
        weatherForecast,
        input.cropCalendar
      );

      const response: AdvisoryResponse = {
        recommendations,
        weatherAlerts,
        phaseAdjustments,
        riskAssessment,
        confidence: this.calculateConfidence(weatherForecast, extremeEvents),
        nextUpdateTime: new Date(Date.now() + 6 * 3600000) // 6 hours
      };

      this.advisoryCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response;
    } catch (error) {
      console.error('Failed to generate crop advisory:', error);
      throw error;
    }
  }

  private async getWeatherForecast(location: Coordinate): Promise<HyperLocalForecast[]> {
    return await weatherIntelligence.generateHyperLocalForecast(location, 168); // 7 days
  }

  private async getExtremeWeatherEvents(
    weatherHistory: WeatherDataPoint[],
    location: Coordinate
  ): Promise<ExtremeEvent[]> {
    const forecast = await this.getWeatherForecast(location);
    const historyFormatted = weatherHistory.map(point => ({
      timestamp: new Date(point.date),
      temperature: point.temperature_avg,
      humidity: point.humidity_percentage,
      rainfall: 0, // Derived from other data
      windSpeed: 0, // Would be available in full weather data
      windDirection: 0,
      pressure: point.pressure_mb,
      uvIndex: 0,
      conditions: 'clear'
    }));

    return await weatherIntelligence.detectExtremeEvents(
      historyFormatted,
      forecast,
      location
    );
  }

  private async getAgricultureAdvisories(
    location: Coordinate,
    cropCalendar: CropCalendar
  ): Promise<AgricultureAdvisory[]> {
    const forecast = await this.getWeatherForecast(location);
    const extremeEvents = await weatherIntelligence.detectExtremeEvents([], forecast, location);
    
    return await weatherIntelligence.generateAgricultureAdvisories(
      forecast,
      extremeEvents,
      cropCalendar.current_phase?.phase_name || 'vegetative'
    );
  }

  private async generateRecommendations(
    input: CropAdvisoryInput,
    forecast: HyperLocalForecast[],
    extremeEvents: ExtremeEvent[],
    agriculturalAdvisories: AgricultureAdvisory[]
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Convert agricultural advisories to AI recommendations
    agriculturalAdvisories.forEach(advisory => {
      const recommendation: AIRecommendation = {
        recommendation_id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        calendar_id: input.cropCalendar.id,
        recommendation_type: advisory.type as any,
        priority: this.mapAdvisoryPriorityToRecommendationPriority(advisory.confidence),
        confidence_score: advisory.confidence * 100,
        title: `${advisory.type.charAt(0).toUpperCase() + advisory.type.slice(1)} Advisory`,
        description: advisory.recommendation,
        detailed_instructions: advisory.reasoning,
        recommended_date: advisory.timing.start.toISOString(),
        time_window: {
          earliest_date: advisory.timing.start.toISOString(),
          latest_date: advisory.timing.end.toISOString()
        },
        based_on_factors: advisory.reasoning,
        weather_data_used: this.convertForecastToWeatherData(forecast.slice(0, 24)),
        historical_data_used: ['weather_patterns', 'crop_phenology'],
        crop_model_version: '2.1',
        expected_benefits: [
          'Optimized crop performance',
          'Risk mitigation',
          'Resource efficiency'
        ],
        potential_yield_impact: this.estimateYieldImpact(advisory.type, advisory.confidence),
        cost_benefit_analysis: {
          estimated_cost: this.estimateImplementationCost(advisory.type),
          expected_return: this.estimateExpectedReturn(advisory.type),
          break_even_point: 'Within current growing season'
        },
        status: 'pending',
        follow_up_required: true,
        follow_up_date: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        success_metrics: this.defineSuccessMetrics(advisory.type),
        created_at: new Date().toISOString()
      };

      recommendations.push(recommendation);
    });

    // Generate crop-specific recommendations
    const cropSpecificRecommendations = this.generateCropSpecificRecommendations(
      input,
      forecast,
      extremeEvents
    );
    recommendations.push(...cropSpecificRecommendations);

    // Generate timing-based recommendations
    const timingRecommendations = this.generateTimingRecommendations(
      input.cropCalendar,
      forecast
    );
    recommendations.push(...timingRecommendations);

    return recommendations.sort((a, b) => 
      this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority)
    );
  }

  private generateCropSpecificRecommendations(
    input: CropAdvisoryInput,
    forecast: HyperLocalForecast[],
    extremeEvents: ExtremeEvent[]
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const currentPhase = input.cropCalendar.current_phase;

    if (!currentPhase) return recommendations;

    // Water management recommendations
    if (this.shouldRecommendIrrigation(forecast, input.soilData)) {
      recommendations.push({
        recommendation_id: `irrigation_${Date.now()}`,
        calendar_id: input.cropCalendar.id,
        recommendation_type: 'irrigation',
        priority: 'high',
        confidence_score: 85,
        title: 'Irrigation Required',
        description: 'Schedule irrigation based on weather forecast and soil conditions',
        detailed_instructions: [
          'Check soil moisture at 15-20cm depth',
          'Apply 25-30mm of water if soil moisture < 60%',
          'Schedule for early morning (5-7 AM) for optimal efficiency',
          'Monitor weather forecast for potential rain in next 48 hours'
        ],
        recommended_date: new Date(Date.now() + 12 * 3600000).toISOString(),
        time_window: {
          earliest_date: new Date(Date.now() + 6 * 3600000).toISOString(),
          latest_date: new Date(Date.now() + 36 * 3600000).toISOString()
        },
        based_on_factors: [
          'Soil moisture levels',
          'Weather forecast',
          'Crop growth stage',
          'Evapotranspiration rates'
        ],
        weather_data_used: this.convertForecastToWeatherData(forecast.slice(0, 72)),
        historical_data_used: ['irrigation_efficiency', 'water_use_patterns'],
        crop_model_version: '2.1',
        expected_benefits: [
          'Maintain optimal soil moisture',
          'Prevent water stress',
          'Optimize nutrient uptake',
          'Maintain crop quality'
        ],
        potential_yield_impact: 8.5,
        cost_benefit_analysis: {
          estimated_cost: 150,
          expected_return: 450,
          break_even_point: 'Within 2 weeks'
        },
        status: 'pending',
        follow_up_required: true,
        follow_up_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
        success_metrics: [
          'Soil moisture maintained above 60%',
          'No visible water stress symptoms',
          'Continued vegetative growth'
        ],
        created_at: new Date().toISOString()
      });
    }

    // Pest management recommendations based on weather
    if (this.shouldRecommendPestMonitoring(forecast, currentPhase)) {
      recommendations.push({
        recommendation_id: `pest_monitoring_${Date.now()}`,
        calendar_id: input.cropCalendar.id,
        recommendation_type: 'pest_control',
        priority: 'medium',
        confidence_score: 75,
        title: 'Enhanced Pest Monitoring Required',
        description: 'Weather conditions favor pest activity. Increase monitoring frequency.',
        detailed_instructions: [
          'Inspect plants daily for pest activity',
          'Focus on leaf undersides and growing tips',
          'Set up pheromone traps if not already deployed',
          'Document pest counts and locations',
          'Consider prophylactic treatment if threshold exceeded'
        ],
        recommended_date: new Date(Date.now() + 24 * 3600000).toISOString(),
        time_window: {
          earliest_date: new Date().toISOString(),
          latest_date: new Date(Date.now() + 48 * 3600000).toISOString()
        },
        based_on_factors: [
          'Temperature and humidity levels',
          'Crop growth stage vulnerability',
          'Historical pest pressure patterns',
          'Weather forecast trends'
        ],
        weather_data_used: this.convertForecastToWeatherData(forecast.slice(0, 48)),
        historical_data_used: ['pest_emergence_models', 'treatment_efficacy'],
        crop_model_version: '2.1',
        expected_benefits: [
          'Early pest detection',
          'Reduced crop damage',
          'Lower pesticide usage',
          'Better yield protection'
        ],
        potential_yield_impact: 5.2,
        cost_benefit_analysis: {
          estimated_cost: 75,
          expected_return: 300,
          break_even_point: 'Within 1 week'
        },
        status: 'pending',
        follow_up_required: true,
        follow_up_date: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        success_metrics: [
          'Pest levels below economic threshold',
          'No significant crop damage observed',
          'Timely intervention if needed'
        ],
        created_at: new Date().toISOString()
      });
    }

    return recommendations;
  }

  private generateTimingRecommendations(
    cropCalendar: CropCalendar,
    forecast: HyperLocalForecast[]
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const upcomingPhases = cropCalendar.phases.filter(phase => 
      new Date(phase.planned_start_date) > new Date() &&
      new Date(phase.planned_start_date) < new Date(Date.now() + 14 * 24 * 3600000)
    );

    upcomingPhases.forEach(phase => {
      const weatherDuringPhase = this.getWeatherForTimeframe(
        forecast,
        new Date(phase.planned_start_date),
        new Date(phase.planned_end_date)
      );

      if (this.isWeatherUnfavorableForPhase(weatherDuringPhase, phase)) {
        recommendations.push({
          recommendation_id: `timing_${phase.phase_id}`,
          calendar_id: cropCalendar.id,
          recommendation_type: 'general',
          priority: 'high',
          confidence_score: 80,
          title: `Reschedule ${phase.phase_name} Phase`,
          description: `Weather conditions may not be optimal for ${phase.phase_name}. Consider adjusting timing.`,
          detailed_instructions: [
            `Review weather forecast for ${phase.phase_name} phase`,
            'Consider delaying by 3-5 days if conditions improve',
            'Monitor soil conditions if ground activities are involved',
            'Prepare alternative scheduling options'
          ],
          recommended_date: new Date(new Date(phase.planned_start_date).getTime() + 3 * 24 * 3600000).toISOString(),
          time_window: {
            earliest_date: phase.planned_start_date,
            latest_date: new Date(new Date(phase.planned_start_date).getTime() + 7 * 24 * 3600000).toISOString()
          },
          based_on_factors: [
            'Weather forecast',
            'Phase requirements',
            'Crop development stage',
            'Operational constraints'
          ],
          weather_data_used: this.convertForecastToWeatherData(weatherDuringPhase),
          historical_data_used: ['phase_success_rates', 'weather_correlations'],
          crop_model_version: '2.1',
          expected_benefits: [
            'Improved phase outcomes',
            'Reduced weather-related risks',
            'Better resource utilization',
            'Enhanced crop development'
          ],
          potential_yield_impact: 3.5,
          cost_benefit_analysis: {
            estimated_cost: 25,
            expected_return: 200,
            break_even_point: 'Immediate'
          },
          status: 'pending',
          follow_up_required: true,
          follow_up_date: new Date(new Date(phase.planned_start_date).getTime() - 24 * 3600000).toISOString(),
          success_metrics: [
            'Phase completed within optimal weather window',
            'No weather-related delays or issues',
            'Achievement of phase objectives'
          ],
          created_at: new Date().toISOString()
        });
      }
    });

    return recommendations;
  }

  private convertExtremeEventsToAlerts(
    extremeEvents: ExtremeEvent[],
    cropCalendar: CropCalendar
  ): WeatherAlert[] {
    return extremeEvents
      .filter(event => event.probability > 0.3)
      .map(event => ({
        alert_id: `weather_${event.type}_${Date.now()}`,
        calendar_id: cropCalendar.id,
        alert_type: this.mapExtremeEventToAlertType(event.type),
        severity: this.mapProbabilityToSeverity(event.probability),
        alert_start_date: event.timing.toISOString(),
        alert_end_date: new Date(event.timing.getTime() + event.duration * 3600000).toISOString(),
        lead_time_hours: event.preparationTime,
        affected_growth_stages: this.getAffectedGrowthStages(event, cropCalendar),
        potential_damage: this.getPotentialDamage(event.type),
        risk_level: this.mapSeverityToRiskLevel(event.severity),
        immediate_actions: this.getImmediateActions(event.type),
        preventive_measures: this.getPreventiveMeasures(event.type),
        monitoring_required: this.getMonitoringRequirements(event.type),
        weather_source: 'AI Weather Intelligence',
        model_confidence: event.probability,
        historical_precedent: true,
        acknowledged: false,
        actions_taken: [],
        created_at: new Date().toISOString()
      }));
  }

  private calculatePhaseAdjustments(
    cropCalendar: CropCalendar,
    forecast: HyperLocalForecast[],
    extremeEvents: ExtremeEvent[]
  ): PhaseAdjustment[] {
    const adjustments: PhaseAdjustment[] = [];
    
    cropCalendar.phases.forEach(phase => {
      if (phase.weather_dependent && new Date(phase.planned_start_date) > new Date()) {
        const phaseWeather = this.getWeatherForTimeframe(
          forecast,
          new Date(phase.planned_start_date),
          new Date(phase.planned_end_date)
        );

        const relevantEvents = extremeEvents.filter(event =>
          event.timing >= new Date(phase.planned_start_date) &&
          event.timing <= new Date(phase.planned_end_date)
        );

        if (relevantEvents.length > 0 || this.isWeatherUnfavorableForPhase(phaseWeather, phase)) {
          const adjustment = this.calculateOptimalPhaseAdjustment(phase, phaseWeather, relevantEvents);
          if (adjustment) {
            adjustments.push(adjustment);
          }
        }
      }
    });

    return adjustments;
  }

  private assessOverallRisk(
    extremeEvents: ExtremeEvent[],
    forecast: HyperLocalForecast[],
    cropCalendar: CropCalendar
  ): RiskLevel {
    let riskScore = 0;

    // Risk from extreme events
    extremeEvents.forEach(event => {
      riskScore += event.probability * event.severity * 10;
    });

    // Risk from unfavorable weather
    const unfavorableWeatherDays = forecast.filter(f => 
      f.temperature.max > 35 || 
      f.temperature.min < 5 ||
      f.precipitation.amount > 50 ||
      f.windSpeed > 25
    ).length;

    riskScore += (unfavorableWeatherDays / forecast.length) * 20;

    // Risk from current crop stage
    const currentPhase = cropCalendar.current_phase;
    if (currentPhase && currentPhase.weather_dependent) {
      riskScore += 10;
    }

    if (riskScore >= 40) return 'critical';
    if (riskScore >= 25) return 'high';
    if (riskScore >= 10) return 'moderate';
    return 'low';
  }

  // Helper methods
  private mapAdvisoryPriorityToRecommendationPriority(confidence: number): 'low' | 'medium' | 'high' | 'urgent' {
    if (confidence >= 0.9) return 'urgent';
    if (confidence >= 0.75) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  private convertForecastToWeatherData(forecast: HyperLocalForecast[]): WeatherDataPoint[] {
    return forecast.map(f => ({
      date: new Date(Date.now() + f.timeHorizon * 3600000).toISOString(),
      temperature_min: f.temperature.min,
      temperature_max: f.temperature.max,
      temperature_avg: f.temperature.avg,
      humidity_percentage: f.humidity,
      rainfall_mm: f.precipitation.amount,
      wind_speed_kmh: f.windSpeed,
      sunshine_hours: 8,
      pressure_mb: 1013,
      growing_degree_days: Math.max(0, (f.temperature.avg - 10)),
      heat_stress_index: Math.max(0, f.temperature.max - 30),
      evapotranspiration_mm: this.calculateEvapotranspiration(f),
      data_source: 'AI Weather Intelligence',
      data_quality: 'forecast',
      confidence_score: f.confidence
    }));
  }

  private calculateEvapotranspiration(forecast: HyperLocalForecast): number {
    // Simplified ET calculation
    const tempFactor = (forecast.temperature.avg - 5) / 30;
    const humidityFactor = (100 - forecast.humidity) / 100;
    const windFactor = Math.min(forecast.windSpeed / 10, 1);
    
    return Math.max(0, 5 * tempFactor * humidityFactor * (1 + windFactor * 0.2));
  }

  private estimateYieldImpact(advisoryType: string, confidence: number): number {
    const baseImpacts = {
      irrigation: 8,
      planting: 12,
      protection: 15,
      spraying: 6,
      general: 3
    };
    
    return (baseImpacts[advisoryType] || 5) * confidence;
  }

  private estimateImplementationCost(advisoryType: string): number {
    const baseCosts = {
      irrigation: 200,
      planting: 150,
      protection: 300,
      spraying: 100,
      general: 50
    };
    
    return baseCosts[advisoryType] || 75;
  }

  private estimateExpectedReturn(advisoryType: string): number {
    return this.estimateImplementationCost(advisoryType) * 2.5;
  }

  private defineSuccessMetrics(advisoryType: string): string[] {
    const metrics = {
      irrigation: ['Optimal soil moisture maintained', 'No water stress symptoms'],
      planting: ['Successful germination rate >85%', 'Uniform crop establishment'],
      protection: ['Minimal crop damage', 'Successful weather event management'],
      spraying: ['Target pest/disease control', 'No application issues'],
      general: ['Recommendation implemented successfully', 'Expected outcomes achieved']
    };
    
    return metrics[advisoryType] || ['Successful implementation', 'Positive crop response'];
  }

  private shouldRecommendIrrigation(forecast: HyperLocalForecast[], soilData?: any): boolean {
    const dryDays = forecast.slice(0, 48).filter(f => f.precipitation.amount < 2).length;
    const soilMoisture = soilData?.moisture || 70;
    
    return dryDays > 30 || soilMoisture < 60;
  }

  private shouldRecommendPestMonitoring(forecast: HyperLocalForecast[], phase?: CalendarPhase): boolean {
    const avgTemp = forecast.slice(0, 24).reduce((sum, f) => sum + f.temperature.avg, 0) / 24;
    const avgHumidity = forecast.slice(0, 24).reduce((sum, f) => sum + f.humidity, 0) / 24;
    
    return avgTemp > 20 && avgTemp < 30 && avgHumidity > 70;
  }

  private getWeatherForTimeframe(
    forecast: HyperLocalForecast[],
    startDate: Date,
    endDate: Date
  ): HyperLocalForecast[] {
    const now = new Date();
    return forecast.filter(f => {
      const forecastDate = new Date(now.getTime() + f.timeHorizon * 3600000);
      return forecastDate >= startDate && forecastDate <= endDate;
    });
  }

  private isWeatherUnfavorableForPhase(weather: HyperLocalForecast[], phase: CalendarPhase): boolean {
    return weather.some(w => 
      w.temperature.min < 5 ||
      w.temperature.max > 40 ||
      w.precipitation.amount > 30 ||
      w.windSpeed > 30
    );
  }

  private calculateOptimalPhaseAdjustment(
    phase: CalendarPhase,
    weather: HyperLocalForecast[],
    events: ExtremeEvent[]
  ): PhaseAdjustment | null {
    if (events.length > 0) {
      const latestEvent = events.reduce((latest, event) => 
        event.timing > latest.timing ? event : latest
      );
      
      const adjustedDate = new Date(latestEvent.timing.getTime() + latestEvent.duration * 3600000 + 24 * 3600000);
      
      return {
        phaseId: phase.phase_id,
        originalDate: phase.planned_start_date,
        recommendedDate: adjustedDate.toISOString(),
        reason: `Avoid ${events.map(e => e.type).join(', ')} weather events`,
        impact: events.some(e => e.severity > 0.7) ? 'significant' : 'moderate'
      };
    }

    return null;
  }

  private getPriorityScore(priority: string): number {
    const scores = { urgent: 4, high: 3, medium: 2, low: 1 };
    return scores[priority] || 1;
  }

  private calculateConfidence(forecast: HyperLocalForecast[], events: ExtremeEvent[]): number {
    const forecastConfidence = forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length;
    const eventConfidence = events.length > 0 
      ? events.reduce((sum, e) => sum + e.probability, 0) / events.length
      : 0.8;
    
    return Math.round((forecastConfidence * 0.7 + eventConfidence * 0.3) * 100);
  }

  private mapExtremeEventToAlertType(eventType: string): any {
    const mapping = {
      drought: 'drought',
      flood: 'flood',
      hail: 'hail',
      frost: 'frost',
      heat_wave: 'extreme_temperature',
      storm: 'strong_wind'
    };
    return mapping[eventType] || 'weather_warning';
  }

  private mapProbabilityToSeverity(probability: number): any {
    if (probability >= 0.8) return 'emergency';
    if (probability >= 0.6) return 'warning';
    if (probability >= 0.4) return 'advisory';
    return 'watch';
  }

  private getAffectedGrowthStages(event: ExtremeEvent, calendar: CropCalendar): string[] {
    return calendar.phases
      .filter(phase => {
        const phaseStart = new Date(phase.planned_start_date);
        const phaseEnd = new Date(phase.planned_end_date);
        return event.timing >= phaseStart && event.timing <= phaseEnd;
      })
      .map(phase => phase.growth_stage_code);
  }

  private getPotentialDamage(eventType: string): string[] {
    const damages = {
      drought: ['Reduced yield', 'Plant stress', 'Quality deterioration'],
      flood: ['Root damage', 'Disease pressure', 'Harvest delays'],
      hail: ['Physical crop damage', 'Quality reduction', 'Yield loss'],
      frost: ['Tissue damage', 'Growth disruption', 'Potential crop loss'],
      heat_wave: ['Heat stress', 'Reduced photosynthesis', 'Quality issues'],
      storm: ['Physical damage', 'Lodging', 'Harvest difficulties']
    };
    return damages[eventType] || ['Potential crop impact'];
  }

  private mapSeverityToRiskLevel(severity: number): any {
    if (severity >= 0.8) return 'critical';
    if (severity >= 0.6) return 'high';
    if (severity >= 0.4) return 'medium';
    return 'low';
  }

  private getImmediateActions(eventType: string): string[] {
    const actions = {
      drought: ['Activate irrigation systems', 'Apply mulch', 'Reduce plant stress'],
      flood: ['Improve drainage', 'Protect root systems', 'Monitor for diseases'],
      hail: ['Deploy protection nets', 'Secure loose items', 'Prepare for damage assessment'],
      frost: ['Activate frost protection', 'Cover sensitive plants', 'Monitor temperatures'],
      heat_wave: ['Increase irrigation', 'Provide shade', 'Monitor plant stress'],
      storm: ['Secure structures', 'Protect crops', 'Safety preparations']
    };
    return actions[eventType] || ['Monitor conditions closely'];
  }

  private getPreventiveMeasures(eventType: string): string[] {
    const measures = {
      drought: ['Install efficient irrigation', 'Use drought-resistant varieties', 'Improve soil water retention'],
      flood: ['Install drainage systems', 'Create raised beds', 'Use flood-resistant varieties'],
      hail: ['Install hail nets', 'Choose protected locations', 'Diversify planting dates'],
      frost: ['Install frost protection systems', 'Choose frost-resistant varieties', 'Site selection'],
      heat_wave: ['Install shade structures', 'Use heat-resistant varieties', 'Optimize planting timing'],
      storm: ['Install windbreaks', 'Strengthen structures', 'Use lodging-resistant varieties']
    };
    return measures[eventType] || ['Implement risk mitigation strategies'];
  }

  private getMonitoringRequirements(eventType: string): string[] {
    const requirements = {
      drought: ['Soil moisture levels', 'Plant water stress indicators', 'Weather conditions'],
      flood: ['Water levels', 'Drainage effectiveness', 'Plant health'],
      hail: ['Weather radar', 'Crop damage assessment', 'Recovery progress'],
      frost: ['Temperature monitoring', 'Plant tissue damage', 'Recovery assessment'],
      heat_wave: ['Temperature stress', 'Plant health indicators', 'Irrigation effectiveness'],
      storm: ['Wind speeds', 'Structural integrity', 'Crop lodging assessment']
    };
    return requirements[eventType] || ['General weather monitoring'];
  }
}

export const cropAdvisoryService = new CropAdvisoryService();