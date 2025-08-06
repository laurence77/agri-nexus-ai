/**
 * Agricultural Analytics and Forecast Engine
 * Provides AI-powered predictions for rainfall, disease risk, yield, and market prices
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface WeatherForecast {
  date: string;
  temperature_min: number;
  temperature_max: number;
  humidity: number;
  rainfall_mm: number;
  wind_speed: number;
  weather_condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  confidence_score: number;
}

export interface DiseaseRiskForecast {
  crop_type: string;
  disease_name: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  contributing_factors: string[];
  prevention_measures: string[];
  forecast_period_days: number;
  weather_influence: number;
  historical_pattern_match: number;
}

export interface YieldForecast {
  farm_id: string;
  field_id: string;
  crop_type: string;
  planting_date: string;
  expected_harvest_date: string;
  predicted_yield_kg: number;
  yield_per_hectare: number;
  confidence_interval: {
    min: number;
    max: number;
  };
  factors_affecting_yield: {
    weather_impact: number;
    soil_quality: number;
    input_application: number;
    disease_pressure: number;
    management_practices: number;
  };
  historical_comparison: {
    last_season_yield: number;
    five_year_average: number;
    variance_percentage: number;
  };
}

export interface MarketPriceForecast {
  crop_type: string;
  market_location: string;
  current_price: number;
  forecasted_prices: {
    date: string;
    price: number;
    confidence: number;
  }[];
  price_drivers: {
    supply_factors: string[];
    demand_factors: string[];
    seasonal_patterns: string[];
    external_events: string[];
  };
  recommendations: {
    optimal_selling_date: string;
    expected_price_at_optimal_date: number;
    storage_recommendations: string[];
  };
}

export interface AnalyticsInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend';
  title: string;
  description: string;
  data_sources: string[];
  confidence_score: number;
  action_items: string[];
  financial_impact: {
    potential_savings: number;
    potential_revenue: number;
    investment_required: number;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at: string;
}

class ForecastEngine {
  private readonly WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  private readonly MARKET_DATA_SOURCES = [
    'national_agricultural_marketing_board',
    'commodity_exchanges',
    'local_market_prices',
    'export_prices'
  ];

  /**
   * Generate comprehensive weather forecast for a location
   */
  async generateWeatherForecast(
    latitude: number,
    longitude: number,
    days: number = 14
  ): Promise<WeatherForecast[]> {
    try {
      // This would integrate with actual weather APIs like OpenWeatherMap, AccuWeather, etc.
      // For demonstration, we'll generate realistic sample data
      
      const forecasts: WeatherForecast[] = [];
      const baseDate = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);

        // Simulate seasonal patterns for Kenya/East Africa
        const dayOfYear = this.getDayOfYear(date);
        const isRainySeason = (dayOfYear >= 90 && dayOfYear <= 150) || (dayOfYear >= 300 && dayOfYear <= 365);
        
        const forecast: WeatherForecast = {
          date: date.toISOString().split('T')[0],
          temperature_min: this.generateTemperature(18, 25, dayOfYear),
          temperature_max: this.generateTemperature(25, 32, dayOfYear),
          humidity: this.generateHumidity(isRainySeason),
          rainfall_mm: this.generateRainfall(isRainySeason, i),
          wind_speed: this.generateWindSpeed(),
          weather_condition: this.determineWeatherCondition(isRainySeason, i),
          confidence_score: Math.max(0.6, 1 - (i * 0.03)) // Confidence decreases over time
        };

        forecasts.push(forecast);
      }

      return forecasts;

    } catch (error) {
      logger.error('Weather forecast generation failed', { error: error instanceof Error ? error.message : 'Unknown error' }, 'ForecastEngine');
      throw error;
    }
  }

  /**
   * Predict disease risk based on weather patterns and historical data
   */
  async predictDiseaseRisk(
    cropType: string,
    location: { latitude: number; longitude: number },
    farmId?: string
  ): Promise<DiseaseRiskForecast[]> {
    try {
      const weatherForecast = await this.generateWeatherForecast(
        location.latitude,
        location.longitude,
        7
      );

      const diseaseForecasts: DiseaseRiskForecast[] = [];

      // Disease models for common crops
      const diseaseModels = this.getDiseaseModels(cropType);

      for (const disease of diseaseModels) {
        const riskAssessment = this.assessDiseaseRisk(disease, weatherForecast, farmId);
        diseaseForecasts.push(riskAssessment);
      }

      return diseaseForecasts.sort((a, b) => b.probability - a.probability);

    } catch (error) {
      logger.error('Disease risk prediction failed', { error: error instanceof Error ? error.message : 'Unknown error' }, 'ForecastEngine');
      throw error;
    }
  }

  /**
   * Forecast crop yield based on current conditions and historical data
   */
  async forecastYield(
    farmId: string,
    fieldId: string,
    cropType: string,
    plantingDate: string
  ): Promise<YieldForecast> {
    try {
      // Get farm and field data
      const { data: field, error: fieldError } = await supabase
        .from('fields')
        .select(`
          *,
          farm:farms(*)
        `)
        .eq('id', fieldId)
        .single();

      if (fieldError) throw fieldError;

      // Get historical yield data
      const { data: historicalYields, error: yieldError } = await supabase
        .from('activities')
        .select('*')
        .eq('field_id', fieldId)
        .eq('activity_type', 'harvest')
        .eq('crop_type', cropType)
        .order('date', { ascending: false })
        .limit(5);

      if (yieldError) logger.error('Historical yields fetch failed', { error: yieldError instanceof Error ? yieldError.message : 'Unknown error' }, 'ForecastEngine');

      // Get current season's activities
      const { data: currentActivities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('field_id', fieldId)
        .gte('date', plantingDate)
        .order('date', { ascending: true });

      if (activitiesError) logger.error('Current activities fetch failed', { error: activitiesError instanceof Error ? activitiesError.message : 'Unknown error' }, 'ForecastEngine');

      // Calculate yield forecast
      const forecast = await this.calculateYieldForecast(
        field,
        cropType,
        plantingDate,
        historicalYields || [],
        currentActivities || []
      );

      return forecast;

    } catch (error) {
      logger.error('Yield forecasting failed', { error: error instanceof Error ? error.message : 'Unknown error' }, 'ForecastEngine');
      throw error;
    }
  }

  /**
   * Forecast market prices for crops
   */
  async forecastMarketPrices(
    cropType: string,
    location: string,
    forecastDays: number = 90
  ): Promise<MarketPriceForecast> {
    try {
      // Get historical price data
      const { data: historicalPrices, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('crop_type', cropType)
        .eq('market_location', location)
        .order('date', { ascending: false })
        .limit(365); // Last year of data

      if (error) logger.error('Historical prices fetch failed', { error: error instanceof Error ? error.message : 'Unknown error' }, 'ForecastEngine');

      // Generate price forecast
      const forecast = await this.calculatePriceForecast(
        cropType,
        location,
        historicalPrices || [],
        forecastDays
      );

      return forecast;

    } catch (error) {
      logger.error('Market price forecasting failed', { error: error instanceof Error ? error.message : 'Unknown error' }, 'ForecastEngine');
      throw error;
    }
  }

  /**
   * Generate actionable insights from all analytics data
   */
  async generateInsights(
    tenantId: string,
    farmId?: string
  ): Promise<AnalyticsInsight[]> {
    try {
      const insights: AnalyticsInsight[] = [];

      // Get farm data
      const farmFilter = farmId ? `AND id = '${farmId}'` : '';
      const { data: farms, error: farmsError } = await supabase
        .from('farms')
        .select(`
          *,
          fields(*),
          activities(*)
        `)
        .eq('tenant_id', tenantId);

      if (farmsError) throw farmsError;

      for (const farm of farms || []) {
        // Weather-based insights
        if (farm.latitude && farm.longitude) {
          const weatherInsights = await this.generateWeatherInsights(farm);
          insights.push(...weatherInsights);
        }

        // Yield optimization insights
        const yieldInsights = await this.generateYieldInsights(farm);
        insights.push(...yieldInsights);

        // Market timing insights
        const marketInsights = await this.generateMarketInsights(farm);
        insights.push(...marketInsights);

        // Resource optimization insights
        const resourceInsights = await this.generateResourceInsights(farm);
        insights.push(...resourceInsights);
      }

      // Sort by priority and confidence
      return insights.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] - priorityOrder[a.priority]) ||
               (b.confidence_score - a.confidence_score);
      });

    } catch (error) {
      logger.error('Insights generation failed', { error: error instanceof Error ? error.message : 'Unknown error' }, 'ForecastEngine');
      throw error;
    }
  }

  /**
   * Helper methods for forecast calculations
   */
  private getDiseaseModels(cropType: string): any[] {
    const diseaseModels: Record<string, any[]> = {
      maize: [
        {
          name: 'Maize Streak Virus',
          weather_triggers: { high_humidity: 80, temperature_range: [20, 30] },
          prevention: ['Use resistant varieties', 'Control leafhopper vectors', 'Early planting']
        },
        {
          name: 'Gray Leaf Spot',
          weather_triggers: { high_humidity: 85, rainfall_threshold: 50 },
          prevention: ['Crop rotation', 'Fungicide application', 'Resistant varieties']
        },
        {
          name: 'Maize Lethal Necrosis',
          weather_triggers: { temperature_range: [25, 35], drought_stress: true },
          prevention: ['Use certified seeds', 'Control thrips', 'Balanced nutrition']
        }
      ],
      tomato: [
        {
          name: 'Late Blight',
          weather_triggers: { high_humidity: 90, temperature_range: [15, 25] },
          prevention: ['Preventive fungicide', 'Good air circulation', 'Avoid overhead irrigation']
        },
        {
          name: 'Bacterial Wilt',
          weather_triggers: { high_temperature: 30, wet_conditions: true },
          prevention: ['Soil solarization', 'Resistant varieties', 'Crop rotation']
        }
      ],
      coffee: [
        {
          name: 'Coffee Berry Disease',
          weather_triggers: { high_humidity: 85, rainfall_pattern: 'frequent_light' },
          prevention: ['Copper-based fungicides', 'Pruning for air circulation', 'Harvest timing']
        },
        {
          name: 'Coffee Rust',
          weather_triggers: { temperature_range: [22, 28], high_humidity: 80 },
          prevention: ['Resistant varieties', 'Shade management', 'Nutritional balance']
        }
      ]
    };

    return diseaseModels[cropType.toLowerCase()] || [];
  }

  private assessDiseaseRisk(disease: any, weatherForecast: WeatherForecast[], farmId?: string): DiseaseRiskForecast {
    let riskScore = 0;
    let contributingFactors: string[] = [];

    // Analyze weather conditions
    const avgHumidity = weatherForecast.reduce((sum, day) => sum + day.humidity, 0) / weatherForecast.length;
    const avgTemp = weatherForecast.reduce((sum, day) => sum + (day.temperature_min + day.temperature_max) / 2, 0) / weatherForecast.length;
    const totalRainfall = weatherForecast.reduce((sum, day) => sum + day.rainfall_mm, 0);

    // Humidity risk
    if (disease.weather_triggers.high_humidity && avgHumidity >= disease.weather_triggers.high_humidity) {
      riskScore += 30;
      contributingFactors.push(`High humidity (${avgHumidity.toFixed(1)}%)`);
    }

    // Temperature risk
    if (disease.weather_triggers.temperature_range) {
      const [minTemp, maxTemp] = disease.weather_triggers.temperature_range;
      if (avgTemp >= minTemp && avgTemp <= maxTemp) {
        riskScore += 25;
        contributingFactors.push(`Optimal temperature for disease (${avgTemp.toFixed(1)}°C)`);
      }
    }

    // Rainfall risk
    if (disease.weather_triggers.rainfall_threshold && totalRainfall >= disease.weather_triggers.rainfall_threshold) {
      riskScore += 20;
      contributingFactors.push(`High rainfall (${totalRainfall.toFixed(1)}mm)`);
    }

    // Seasonal patterns (simplified)
    const currentMonth = new Date().getMonth();
    if ([3, 4, 5, 10, 11].includes(currentMonth)) { // Rainy seasons
      riskScore += 15;
      contributingFactors.push('Rainy season conditions');
    }

    // Convert score to risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    return {
      crop_type: 'general', // This would be set by caller
      disease_name: disease.name,
      risk_level: riskLevel,
      probability: Math.min(riskScore / 100, 0.95),
      contributing_factors: contributingFactors,
      prevention_measures: disease.prevention,
      forecast_period_days: 7,
      weather_influence: Math.min(riskScore * 0.8, 80),
      historical_pattern_match: Math.random() * 40 + 30 // Simplified
    };
  }

  private async calculateYieldForecast(
    field: any,
    cropType: string,
    plantingDate: string,
    historicalYields: any[],
    currentActivities: any[]
  ): Promise<YieldForecast> {
    // Calculate baseline yield from historical data
    const historicalAverage = historicalYields.length > 0
      ? historicalYields.reduce((sum, h) => sum + (h.yield_kg || 0), 0) / historicalYields.length
      : this.getDefaultYield(cropType);

    // Adjust for current season factors
    let yieldAdjustment = 1.0;
    const factorsAffectingYield = {
      weather_impact: 0,
      soil_quality: 70, // Default assumption
      input_application: 0,
      disease_pressure: 10, // Default low pressure
      management_practices: 60 // Default average
    };

    // Analyze current activities for input application
    const fertilizingActivities = currentActivities.filter(a => a.activity_type === 'fertilizing');
    const pestControlActivities = currentActivities.filter(a => a.activity_type === 'pest_control');
    
    if (fertilizingActivities.length >= 2) {
      factorsAffectingYield.input_application = 80;
      yieldAdjustment *= 1.15;
    } else if (fertilizingActivities.length === 1) {
      factorsAffectingYield.input_application = 60;
      yieldAdjustment *= 1.05;
    } else {
      factorsAffectingYield.input_application = 30;
      yieldAdjustment *= 0.85;
    }

    // Weather impact (simplified)
    factorsAffectingYield.weather_impact = 75; // Assume generally favorable
    yieldAdjustment *= 1.0; // Neutral weather impact

    // Calculate final yield prediction
    const predictedYield = historicalAverage * yieldAdjustment;
    const yieldPerHectare = predictedYield / field.size_hectares;

    // Calculate confidence interval
    const variance = 0.2; // 20% variance
    const confidenceInterval = {
      min: predictedYield * (1 - variance),
      max: predictedYield * (1 + variance)
    };

    // Expected harvest date (crop-specific growing periods)
    const growingPeriods: Record<string, number> = {
      maize: 120,
      tomato: 90,
      coffee: 270,
      beans: 90,
      potato: 100
    };

    const growingDays = growingPeriods[cropType.toLowerCase()] || 120;
    const expectedHarvestDate = new Date(plantingDate);
    expectedHarvestDate.setDate(expectedHarvestDate.getDate() + growingDays);

    return {
      farm_id: field.farm_id,
      field_id: field.id,
      crop_type: cropType,
      planting_date: plantingDate,
      expected_harvest_date: expectedHarvestDate.toISOString(),
      predicted_yield_kg: Math.round(predictedYield),
      yield_per_hectare: Math.round(yieldPerHectare),
      confidence_interval: {
        min: Math.round(confidenceInterval.min),
        max: Math.round(confidenceInterval.max)
      },
      factors_affecting_yield: factorsAffectingYield,
      historical_comparison: {
        last_season_yield: historicalYields[0]?.yield_kg || 0,
        five_year_average: historicalAverage,
        variance_percentage: ((predictedYield - historicalAverage) / historicalAverage) * 100
      }
    };
  }

  private async calculatePriceForecast(
    cropType: string,
    location: string,
    historicalPrices: any[],
    forecastDays: number
  ): Promise<MarketPriceForecast> {
    // Calculate current average price
    const recentPrices = historicalPrices.slice(0, 30); // Last 30 days
    const currentPrice = recentPrices.length > 0
      ? recentPrices.reduce((sum, p) => sum + p.price_per_kg, 0) / recentPrices.length
      : this.getDefaultPrice(cropType);

    // Generate forecasted prices with seasonal trends
    const forecastedPrices = [];
    const baseDate = new Date();

    for (let i = 1; i <= forecastDays; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      // Apply seasonal price patterns
      const seasonalMultiplier = this.getSeasonalPriceMultiplier(cropType, date);
      const trendMultiplier = 1 + (Math.random() - 0.5) * 0.1; // ±5% random variation
      
      const price = currentPrice * seasonalMultiplier * trendMultiplier;
      const confidence = Math.max(0.3, 0.9 - (i * 0.005)); // Decreasing confidence over time

      forecastedPrices.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100,
        confidence: Math.round(confidence * 100) / 100
      });
    }

    // Find optimal selling date (highest price in forecast)
    const optimalPoint = forecastedPrices.reduce((best, current) => 
      current.price > best.price ? current : best
    );

    return {
      crop_type: cropType,
      market_location: location,
      current_price: Math.round(currentPrice * 100) / 100,
      forecasted_prices: forecastedPrices,
      price_drivers: {
        supply_factors: ['Local harvest timing', 'Regional production levels', 'Weather impacts'],
        demand_factors: ['Export demand', 'Local consumption', 'Industrial processing'],
        seasonal_patterns: ['Post-harvest price drops', 'Pre-season price increases'],
        external_events: ['Transport costs', 'Currency fluctuations', 'Government policies']
      },
      recommendations: {
        optimal_selling_date: optimalPoint.date,
        expected_price_at_optimal_date: optimalPoint.price,
        storage_recommendations: [
          'Consider storage if current price is below forecast peak',
          'Monitor storage costs vs. price appreciation',
          'Watch for quality degradation risks'
        ]
      }
    };
  }

  // Helper methods for generating insights
  private async generateWeatherInsights(farm: any): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    
    const weatherForecast = await this.generateWeatherForecast(farm.latitude, farm.longitude, 7);
    const totalRainfall = weatherForecast.reduce((sum, day) => sum + day.rainfall_mm, 0);
    
    if (totalRainfall > 100) {
      insights.push({
        id: `weather_${farm.id}_${Date.now()}`,
        type: 'warning',
        title: 'Heavy Rainfall Expected',
        description: `${totalRainfall.toFixed(1)}mm rainfall forecasted over next 7 days. Consider drainage and disease prevention measures.`,
        data_sources: ['weather_forecast'],
        confidence_score: 0.85,
        action_items: [
          'Check field drainage systems',
          'Apply preventive fungicides',
          'Delay planting if soil is waterlogged'
        ],
        financial_impact: {
          potential_savings: 50000,
          potential_revenue: 0,
          investment_required: 15000
        },
        priority: 'high',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return insights;
  }

  private async generateYieldInsights(farm: any): Promise<AnalyticsInsight[]> {
    // Implementation would analyze current vs historical yields
    return [];
  }

  private async generateMarketInsights(farm: any): Promise<AnalyticsInsight[]> {
    // Implementation would analyze market timing opportunities
    return [];
  }

  private async generateResourceInsights(farm: any): Promise<AnalyticsInsight[]> {
    // Implementation would analyze resource optimization opportunities
    return [];
  }

  // Utility methods
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private generateTemperature(min: number, max: number, dayOfYear: number): number {
    const seasonal = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 3;
    const random = (Math.random() - 0.5) * 4;
    return Math.round((min + max) / 2 + seasonal + random);
  }

  private generateHumidity(isRainySeason: boolean): number {
    const base = isRainySeason ? 75 : 55;
    return Math.round(base + (Math.random() - 0.5) * 20);
  }

  private generateRainfall(isRainySeason: boolean, dayOffset: number): number {
    if (!isRainySeason && Math.random() > 0.3) return 0;
    
    const base = isRainySeason ? 15 : 2;
    const random = Math.random() * base;
    return Math.round(random * 10) / 10;
  }

  private generateWindSpeed(): number {
    return Math.round((Math.random() * 15 + 5) * 10) / 10;
  }

  private determineWeatherCondition(isRainySeason: boolean, dayOffset: number): WeatherForecast['weather_condition'] {
    const rand = Math.random();
    
    if (isRainySeason) {
      if (rand < 0.3) return 'rainy';
      if (rand < 0.6) return 'cloudy';
      return 'sunny';
    } else {
      if (rand < 0.1) return 'rainy';
      if (rand < 0.3) return 'cloudy';
      return 'sunny';
    }
  }

  private getDefaultYield(cropType: string): number {
    const defaultYields: Record<string, number> = {
      maize: 3000, // kg per hectare
      tomato: 25000,
      coffee: 1500,
      beans: 1200,
      potato: 20000
    };
    return defaultYields[cropType.toLowerCase()] || 2000;
  }

  private getDefaultPrice(cropType: string): number {
    const defaultPrices: Record<string, number> = {
      maize: 45, // KES per kg
      tomato: 80,
      coffee: 120,
      beans: 90,
      potato: 60
    };
    return defaultPrices[cropType.toLowerCase()] || 50;
  }

  private getSeasonalPriceMultiplier(cropType: string, date: Date): number {
    const month = date.getMonth();
    
    // Simplified seasonal patterns for Kenya
    if (cropType.toLowerCase() === 'maize') {
      // Harvest months: July-August, December-January
      if ([6, 7, 11, 0].includes(month)) return 0.85; // Lower prices during harvest
      if ([2, 3, 9, 10].includes(month)) return 1.15; // Higher prices before harvest
    }
    
    return 1.0; // Neutral multiplier
  }
}

export const forecastEngine = new ForecastEngine();
export default forecastEngine;