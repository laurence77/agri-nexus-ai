import * as tf from '@tensorflow/tfjs';
import { 
  WeatherData, 
  WeatherForecast,
  Coordinate 
} from '@/types';
import {
  WeatherAI,
  HyperLocalForecast,
  ExtremeEvent,
  MicroclimateData,
  AgricultureAdvisory,
  ClimateTrend,
  GeoPolygon
} from '@/types/ai-models';

export class WeatherIntelligence {
  private models: Map<string, tf.LayersModel> = new Map();
  private initialized: boolean = false;
  private weatherCache: Map<string, any> = new Map();

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await tf.ready();
    await this.loadModels();
    this.initialized = true;
  }

  private async loadModels(): Promise<void> {
    try {
      // Weather prediction model (LSTM-based)
      const weatherModel = await this.createWeatherPredictionModel();
      this.models.set('weather_predictor', weatherModel);
      
      // Extreme event detection model
      const extremeEventModel = await this.createExtremeEventModel();
      this.models.set('extreme_event_detector', extremeEventModel);
      
      // Microclimate analysis model
      const microclimateModel = await this.createMicroclimateModel();
      this.models.set('microclimate_analyzer', microclimateModel);
      
    } catch (error) {
      console.warn('Weather AI models not available, using statistical methods');
    }
  }

  private createWeatherPredictionModel(): tf.LayersModel {
    // LSTM model for weather forecasting
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          inputShape: [72, 8], // 72 hours of data with 8 weather features
          units: 128,
          returnSequences: true,
          dropout: 0.2
        }),
        tf.layers.lstm({
          units: 64,
          returnSequences: true,
          dropout: 0.2
        }),
        tf.layers.lstm({
          units: 32,
          returnSequences: false,
          dropout: 0.2
        }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'linear' }) // Output: temp, humidity, pressure, etc.
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  private createExtremeEventModel(): tf.LayersModel {
    // CNN + LSTM for extreme weather event prediction
    const model = tf.sequential({
      layers: [
        tf.layers.conv1d({
          inputShape: [168, 12], // 7 days of hourly data with extended features
          filters: 64,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling1d({ poolSize: 2 }),
        tf.layers.conv1d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.globalMaxPooling1d(),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 6, activation: 'sigmoid' }) // 6 types of extreme events
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private createMicroclimateModel(): tf.LayersModel {
    // Model for microclimate zone classification
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [15], // Features: elevation, slope, aspect, vegetation, etc.
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'softmax' }) // 5 microclimate zones
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async generateHyperLocalForecast(
    location: Coordinate,
    timeHorizon: number = 168 // 7 days in hours
  ): Promise<HyperLocalForecast[]> {
    if (!this.initialized) await this.initialize();

    const cacheKey = `forecast_${location.lat}_${location.lng}_${timeHorizon}`;
    const cached = this.weatherCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < 3600000) { // 1 hour cache
      return cached.data;
    }

    try {
      // Get base weather data (would normally call external API)
      const baseWeatherData = await this.getBaseWeatherData(location);
      
      // Apply AI enhancement
      const enhancedForecast = await this.enhanceWeatherForecast(
        baseWeatherData, 
        location, 
        timeHorizon
      );

      this.weatherCache.set(cacheKey, {
        data: enhancedForecast,
        timestamp: Date.now()
      });

      return enhancedForecast;
    } catch (error) {
      console.warn('AI weather forecasting failed, using fallback:', error);
      return this.generateFallbackForecast(location, timeHorizon);
    }
  }

  private async getBaseWeatherData(location: Coordinate): Promise<WeatherData[]> {
    // Simulated weather data - in production, would call actual weather API
    const data: WeatherData[] = [];
    const now = new Date();

    for (let i = 0; i < 168; i++) { // 7 days
      const timestamp = new Date(now.getTime() + i * 3600000);
      const hour = timestamp.getHours();
      
      // Simulate realistic weather patterns
      const baseTemp = 20 + 10 * Math.sin((hour - 6) * Math.PI / 12); // Daily temperature cycle
      const seasonalFactor = Math.sin((timestamp.getMonth() - 3) * Math.PI / 6);
      
      data.push({
        timestamp,
        temperature: baseTemp + seasonalFactor * 15 + (Math.random() - 0.5) * 5,
        humidity: 60 + Math.random() * 30,
        rainfall: Math.random() < 0.1 ? Math.random() * 10 : 0,
        windSpeed: 5 + Math.random() * 15,
        windDirection: Math.random() * 360,
        pressure: 1013 + (Math.random() - 0.5) * 30,
        uvIndex: Math.max(0, 8 * Math.sin((hour - 6) * Math.PI / 12) + Math.random() * 2),
        conditions: this.generateWeatherCondition(baseTemp, Math.random() < 0.1)
      });
    }

    return data;
  }

  private generateWeatherCondition(temperature: number, hasRain: boolean): string {
    if (hasRain) return 'rainy';
    if (temperature > 30) return 'sunny';
    if (temperature < 10) return 'cold';
    return Math.random() < 0.7 ? 'clear' : 'cloudy';
  }

  private async enhanceWeatherForecast(
    baseData: WeatherData[],
    location: Coordinate,
    timeHorizon: number
  ): Promise<HyperLocalForecast[]> {
    const model = this.models.get('weather_predictor');
    const forecasts: HyperLocalForecast[] = [];

    if (model && baseData.length >= 72) {
      try {
        // Prepare input features
        const features = this.prepareWeatherFeatures(baseData.slice(0, 72));
        const inputTensor = tf.tensor3d([features]);

        // Get AI predictions
        const predictions = model.predict(inputTensor) as tf.Tensor;
        const predictionData = await predictions.data();

        // Generate enhanced forecasts
        for (let i = 0; i < Math.min(timeHorizon, 168); i++) {
          const forecastTime = new Date(baseData[0].timestamp.getTime() + (i + 72) * 3600000);
          const baseIndex = Math.min(i + 72, baseData.length - 1);
          const baseForecast = baseData[baseIndex];

          // Apply AI corrections
          const aiCorrection = this.extractAIPrediction(predictionData, i);
          const confidence = this.calculateForecastConfidence(i, timeHorizon);

          forecasts.push({
            location,
            timeHorizon: i + 1,
            temperature: {
              min: baseForecast.temperature + aiCorrection.tempMin,
              max: baseForecast.temperature + aiCorrection.tempMax,
              avg: baseForecast.temperature + aiCorrection.tempAvg
            },
            precipitation: {
              probability: Math.min(1, Math.max(0, aiCorrection.precipProb)),
              amount: Math.max(0, baseForecast.rainfall + aiCorrection.precipAmount)
            },
            humidity: Math.min(100, Math.max(0, baseForecast.humidity + aiCorrection.humidity)),
            windSpeed: Math.max(0, baseForecast.windSpeed + aiCorrection.windSpeed),
            solarRadiation: this.calculateSolarRadiation(forecastTime, location),
            confidence
          });
        }

        inputTensor.dispose();
        predictions.dispose();
      } catch (error) {
        console.warn('AI enhancement failed, using base data:', error);
        return this.convertToHyperLocal(baseData, location);
      }
    } else {
      return this.convertToHyperLocal(baseData, location);
    }

    return forecasts;
  }

  private prepareWeatherFeatures(weatherData: WeatherData[]): number[][] {
    return weatherData.map(data => [
      data.temperature,
      data.humidity / 100,
      data.pressure / 1013,
      data.windSpeed / 20,
      data.rainfall / 10,
      data.uvIndex / 10,
      Math.sin(2 * Math.PI * data.timestamp.getHours() / 24), // Time of day
      Math.sin(2 * Math.PI * data.timestamp.getMonth() / 12)  // Season
    ]);
  }

  private extractAIPrediction(predictionData: Float32Array, index: number): any {
    // Extract and interpret AI model outputs
    const baseIndex = index * 8;
    return {
      tempMin: (predictionData[baseIndex] - 0.5) * 10,
      tempMax: (predictionData[baseIndex + 1] - 0.5) * 10,
      tempAvg: (predictionData[baseIndex + 2] - 0.5) * 10,
      humidity: (predictionData[baseIndex + 3] - 0.5) * 40,
      precipProb: predictionData[baseIndex + 4],
      precipAmount: predictionData[baseIndex + 5] * 20,
      windSpeed: (predictionData[baseIndex + 6] - 0.5) * 20,
      pressure: (predictionData[baseIndex + 7] - 0.5) * 50
    };
  }

  private calculateForecastConfidence(hourAhead: number, maxHorizon: number): number {
    // Confidence decreases exponentially with time
    const timeDecay = Math.exp(-hourAhead / 48); // Half confidence every 48 hours
    const baseConfidence = 0.95;
    return Math.max(0.4, baseConfidence * timeDecay);
  }

  private calculateSolarRadiation(timestamp: Date, location: Coordinate): number {
    const hour = timestamp.getHours();
    const dayOfYear = this.getDayOfYear(timestamp);
    
    // Simplified solar radiation calculation
    const solarDeclination = 23.45 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365);
    const hourAngle = 15 * (hour - 12);
    
    const elevation = Math.asin(
      Math.sin(location.lat * Math.PI / 180) * Math.sin(solarDeclination * Math.PI / 180) +
      Math.cos(location.lat * Math.PI / 180) * Math.cos(solarDeclination * Math.PI / 180) * 
      Math.cos(hourAngle * Math.PI / 180)
    );
    
    return Math.max(0, 1000 * Math.sin(elevation)); // Watts per square meter
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private convertToHyperLocal(baseData: WeatherData[], location: Coordinate): HyperLocalForecast[] {
    return baseData.map((data, index) => ({
      location,
      timeHorizon: index + 1,
      temperature: {
        min: data.temperature - 2,
        max: data.temperature + 2,
        avg: data.temperature
      },
      precipitation: {
        probability: data.rainfall > 0 ? 0.8 : 0.2,
        amount: data.rainfall
      },
      humidity: data.humidity,
      windSpeed: data.windSpeed,
      solarRadiation: this.calculateSolarRadiation(data.timestamp, location),
      confidence: this.calculateForecastConfidence(index, baseData.length)
    }));
  }

  private generateFallbackForecast(location: Coordinate, timeHorizon: number): HyperLocalForecast[] {
    const forecasts: HyperLocalForecast[] = [];
    const now = new Date();

    for (let i = 0; i < timeHorizon; i++) {
      const timestamp = new Date(now.getTime() + i * 3600000);
      const hour = timestamp.getHours();
      
      // Simple sinusoidal model for temperature
      const baseTemp = 20 + 10 * Math.sin((hour - 6) * Math.PI / 12);
      
      forecasts.push({
        location,
        timeHorizon: i + 1,
        temperature: {
          min: baseTemp - 3,
          max: baseTemp + 3,
          avg: baseTemp
        },
        precipitation: {
          probability: 0.2,
          amount: 0
        },
        humidity: 65,
        windSpeed: 8,
        solarRadiation: this.calculateSolarRadiation(timestamp, location),
        confidence: 0.6
      });
    }

    return forecasts;
  }

  async detectExtremeEvents(
    weatherHistory: WeatherData[],
    forecastData: HyperLocalForecast[],
    location: Coordinate
  ): Promise<ExtremeEvent[]> {
    if (!this.initialized) await this.initialize();

    const model = this.models.get('extreme_event_detector');
    const events: ExtremeEvent[] = [];

    if (model && weatherHistory.length >= 168) {
      try {
        // Prepare extended features for extreme event detection
        const features = this.prepareExtremeEventFeatures(weatherHistory, forecastData);
        const inputTensor = tf.tensor3d([features]);

        const predictions = model.predict(inputTensor) as tf.Tensor;
        const probabilities = await predictions.data();

        // Interpret probabilities for different event types
        const eventTypes: Array<ExtremeEvent['type']> = [
          'drought', 'flood', 'hail', 'frost', 'heat_wave', 'storm'
        ];

        eventTypes.forEach((type, index) => {
          const probability = probabilities[index];
          
          if (probability > 0.3) { // Threshold for alert
            const event = this.createExtremeEvent(
              type, 
              probability, 
              forecastData, 
              location
            );
            if (event) events.push(event);
          }
        });

        inputTensor.dispose();
        predictions.dispose();
      } catch (error) {
        console.warn('AI extreme event detection failed:', error);
      }
    }

    // Statistical backup detection
    const statisticalEvents = this.detectExtremeEventsStatistical(weatherHistory, forecastData, location);
    events.push(...statisticalEvents);

    return events.sort((a, b) => b.probability - a.probability);
  }

  private prepareExtremeEventFeatures(
    history: WeatherData[], 
    forecast: HyperLocalForecast[]
  ): number[][] {
    const features: number[][] = [];
    
    // Combine historical and forecast data
    const allData = [
      ...history.slice(-168), // Last 7 days
      ...forecast.slice(0, 72)  // Next 3 days
    ];

    allData.forEach(data => {
      const isHistorical = 'temperature' in data;
      const temp = isHistorical ? data.temperature : data.temperature.avg;
      const humidity = isHistorical ? data.humidity : data.humidity;
      const windSpeed = isHistorical ? data.windSpeed : data.windSpeed;
      const pressure = isHistorical ? data.pressure : 1013; // Default for forecast
      const rainfall = isHistorical ? data.rainfall : data.precipitation.amount;

      features.push([
        temp / 50, // Normalized temperature
        humidity / 100,
        pressure / 1100,
        windSpeed / 50,
        rainfall / 20,
        Math.sin(2 * Math.PI * new Date().getHours() / 24),
        Math.sin(2 * Math.PI * new Date().getMonth() / 12),
        // Derived features
        Math.max(0, temp - 35) / 10, // Heat stress indicator
        Math.max(0, 5 - temp) / 10,  // Cold stress indicator
        Math.min(1, rainfall / 25),   // Heavy rain indicator
        Math.min(1, windSpeed / 30),  // High wind indicator
        Math.max(0, 1050 - pressure) / 50 // Low pressure indicator
      ]);
    });

    return features;
  }

  private createExtremeEvent(
    type: ExtremeEvent['type'],
    probability: number,
    forecast: HyperLocalForecast[],
    location: Coordinate
  ): ExtremeEvent | null {
    const now = new Date();
    let timing = new Date(now.getTime() + 24 * 3600000); // Default to 24 hours
    let severity = probability;
    let duration = 6; // Default 6 hours

    // Customize based on event type
    switch (type) {
      case 'drought':
        timing = new Date(now.getTime() + 7 * 24 * 3600000); // 7 days
        duration = 168; // 7 days
        break;
      case 'flood':
        duration = 12; // 12 hours
        break;
      case 'hail':
        duration = 2; // 2 hours
        break;
      case 'frost':
        timing = this.findFrostTiming(forecast);
        duration = 8; // 8 hours
        break;
      case 'heat_wave':
        timing = this.findHeatWaveTiming(forecast);
        duration = 72; // 3 days
        break;
      case 'storm':
        duration = 6; // 6 hours
        break;
    }

    // Calculate affected area (simplified)
    const radius = severity * 50; // km
    const impactArea: GeoPolygon[] = [{
      coordinates: this.generateCirclePolygon(location, radius),
      area: Math.PI * radius * radius,
      centroid: [location.lat, location.lng]
    }];

    return {
      type,
      probability,
      timing,
      severity,
      duration,
      impactArea,
      preparationTime: Math.max(1, (timing.getTime() - now.getTime()) / 3600000)
    };
  }

  private findFrostTiming(forecast: HyperLocalForecast[]): Date {
    const frostForecast = forecast.find(f => f.temperature.min < 0);
    return frostForecast ? 
      new Date(Date.now() + frostForecast.timeHorizon * 3600000) :
      new Date(Date.now() + 24 * 3600000);
  }

  private findHeatWaveTiming(forecast: HyperLocalForecast[]): Date {
    const heatForecast = forecast.find(f => f.temperature.max > 35);
    return heatForecast ?
      new Date(Date.now() + heatForecast.timeHorizon * 3600000) :
      new Date(Date.now() + 48 * 3600000);
  }

  private generateCirclePolygon(center: Coordinate, radiusKm: number): Array<[number, number]> {
    const points: Array<[number, number]> = [];
    const earthRadius = 6371; // km
    
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * 2 * Math.PI;
      const lat = center.lat + (radiusKm / earthRadius) * (180 / Math.PI) * Math.cos(angle);
      const lng = center.lng + (radiusKm / earthRadius) * (180 / Math.PI) * Math.sin(angle) / Math.cos(center.lat * Math.PI / 180);
      points.push([lat, lng]);
    }
    
    return points;
  }

  private detectExtremeEventsStatistical(
    history: WeatherData[],
    forecast: HyperLocalForecast[],
    location: Coordinate
  ): ExtremeEvent[] {
    const events: ExtremeEvent[] = [];
    
    // Statistical thresholds
    const tempStats = this.calculateTemperatureStats(history);
    const precipStats = this.calculatePrecipitationStats(history);
    
    forecast.forEach(f => {
      // Heat wave detection
      if (f.temperature.max > tempStats.p95) {
        events.push({
          type: 'heat_wave',
          probability: Math.min(0.9, (f.temperature.max - tempStats.p95) / 10),
          timing: new Date(Date.now() + f.timeHorizon * 3600000),
          severity: (f.temperature.max - tempStats.mean) / tempStats.std,
          duration: 24,
          impactArea: [{
            coordinates: this.generateCirclePolygon(location, 25),
            area: Math.PI * 25 * 25,
            centroid: [location.lat, location.lng]
          }],
          preparationTime: f.timeHorizon
        });
      }
      
      // Frost detection
      if (f.temperature.min < 0) {
        events.push({
          type: 'frost',
          probability: Math.min(0.9, Math.abs(f.temperature.min) / 5),
          timing: new Date(Date.now() + f.timeHorizon * 3600000),
          severity: Math.abs(f.temperature.min) / 10,
          duration: 8,
          impactArea: [{
            coordinates: this.generateCirclePolygon(location, 15),
            area: Math.PI * 15 * 15,
            centroid: [location.lat, location.lng]
          }],
          preparationTime: f.timeHorizon
        });
      }
      
      // Heavy rain/flood detection
      if (f.precipitation.amount > precipStats.p90) {
        events.push({
          type: 'flood',
          probability: Math.min(0.8, f.precipitation.amount / 50),
          timing: new Date(Date.now() + f.timeHorizon * 3600000),
          severity: f.precipitation.amount / precipStats.mean,
          duration: 12,
          impactArea: [{
            coordinates: this.generateCirclePolygon(location, 20),
            area: Math.PI * 20 * 20,
            centroid: [location.lat, location.lng]
          }],
          preparationTime: f.timeHorizon
        });
      }
    });
    
    return events;
  }

  private calculateTemperatureStats(history: WeatherData[]): any {
    const temps = history.map(h => h.temperature).sort((a, b) => a - b);
    const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
    const variance = temps.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / temps.length;
    
    return {
      mean,
      std: Math.sqrt(variance),
      p5: temps[Math.floor(temps.length * 0.05)],
      p95: temps[Math.floor(temps.length * 0.95)]
    };
  }

  private calculatePrecipitationStats(history: WeatherData[]): any {
    const rainfall = history.map(h => h.rainfall).sort((a, b) => a - b);
    const mean = rainfall.reduce((a, b) => a + b, 0) / rainfall.length;
    
    return {
      mean,
      p90: rainfall[Math.floor(rainfall.length * 0.90)],
      p99: rainfall[Math.floor(rainfall.length * 0.99)]
    };
  }

  async generateAgricultureAdvisories(
    forecast: HyperLocalForecast[],
    extremeEvents: ExtremeEvent[],
    cropStage: string = 'vegetative'
  ): Promise<AgricultureAdvisory[]> {
    const advisories: AgricultureAdvisory[] = [];
    
    // Irrigation advisories
    const irrigationAdvisory = this.generateIrrigationAdvisory(forecast, extremeEvents);
    if (irrigationAdvisory) advisories.push(irrigationAdvisory);
    
    // Planting advisories
    const plantingAdvisory = this.generatePlantingAdvisory(forecast, extremeEvents);
    if (plantingAdvisory) advisories.push(plantingAdvisory);
    
    // Protection advisories
    extremeEvents.forEach(event => {
      const protectionAdvisory = this.generateProtectionAdvisory(event, cropStage);
      if (protectionAdvisory) advisories.push(protectionAdvisory);
    });
    
    // Spraying advisories
    const sprayingAdvisory = this.generateSprayingAdvisory(forecast);
    if (sprayingAdvisory) advisories.push(sprayingAdvisory);
    
    return advisories.sort((a, b) => b.confidence - a.confidence);
  }

  private generateIrrigationAdvisory(
    forecast: HyperLocalForecast[],
    extremeEvents: ExtremeEvent[]
  ): AgricultureAdvisory | null {
    const nextRain = forecast.find(f => f.precipitation.amount > 5);
    const hasFloodRisk = extremeEvents.some(e => e.type === 'flood' && e.probability > 0.4);
    
    if (hasFloodRisk) return null; // Don't irrigate if flood risk
    
    const dryDays = forecast.slice(0, 72).filter(f => f.precipitation.amount < 1).length;
    
    if (dryDays > 48 || !nextRain) { // More than 2 days without rain
      return {
        type: 'irrigation',
        recommendation: 'Schedule irrigation within next 24 hours. No significant rainfall expected.',
        timing: {
          start: new Date(Date.now() + 6 * 3600000), // 6 hours from now
          end: new Date(Date.now() + 30 * 3600000)   // 30 hours from now
        },
        confidence: 0.8,
        reasoning: [
          `${dryDays} dry hours forecasted`,
          nextRain ? `Next rain in ${nextRain.timeHorizon} hours` : 'No rain in forecast',
          'Soil moisture likely to become critical'
        ]
      };
    }
    
    return null;
  }

  private generatePlantingAdvisory(
    forecast: HyperLocalForecast[],
    extremeEvents: ExtremeEvent[]
  ): AgricultureAdvisory | null {
    const hasExtremeWeather = extremeEvents.some(e => 
      ['frost', 'heat_wave', 'storm'].includes(e.type) && e.probability > 0.5
    );
    
    if (hasExtremeWeather) {
      return {
        type: 'planting',
        recommendation: 'Delay planting due to extreme weather forecast.',
        timing: {
          start: new Date(Date.now() + 168 * 3600000), // After the forecast period
          end: new Date(Date.now() + 336 * 3600000)    // Next week
        },
        confidence: 0.7,
        reasoning: [
          'Extreme weather events predicted',
          'Risk of seedling damage',
          'Better conditions expected after current weather system'
        ]
      };
    }
    
    // Check for optimal planting conditions
    const optimalDays = forecast.slice(0, 72).filter(f => 
      f.temperature.avg > 10 && 
      f.temperature.avg < 25 && 
      f.windSpeed < 15 &&
      f.precipitation.amount < 10
    ).length;
    
    if (optimalDays > 48) {
      return {
        type: 'planting',
        recommendation: 'Excellent planting conditions expected. Proceed with scheduled planting.',
        timing: {
          start: new Date(Date.now() + 12 * 3600000),
          end: new Date(Date.now() + 60 * 3600000)
        },
        confidence: 0.9,
        reasoning: [
          'Optimal temperature range (10-25°C)',
          'Low wind speeds',
          'Minimal rainfall risk',
          'Favorable conditions for 48+ hours'
        ]
      };
    }
    
    return null;
  }

  private generateProtectionAdvisory(
    event: ExtremeEvent,
    cropStage: string
  ): AgricultureAdvisory | null {
    const protectionMeasures: { [key: string]: string } = {
      frost: 'Activate frost protection systems. Cover sensitive plants.',
      heat_wave: 'Increase irrigation frequency. Provide shade for vulnerable crops.',
      hail: 'Deploy hail nets. Move portable crops to shelter.',
      storm: 'Secure equipment and structures. Harvest ready crops if possible.',
      flood: 'Ensure drainage systems are clear. Move livestock to higher ground.',
      drought: 'Implement water conservation measures. Prioritize critical crops.'
    };
    
    return {
      type: 'protection',
      recommendation: protectionMeasures[event.type] || 'Monitor conditions closely.',
      timing: {
        start: new Date(Date.now()),
        end: new Date(event.timing.getTime() + event.duration * 3600000)
      },
      confidence: event.probability,
      reasoning: [
        `${event.type} predicted with ${Math.round(event.probability * 100)}% probability`,
        `Expected at ${event.timing.toLocaleString()}`,
        `Duration: ${event.duration} hours`,
        `Crop stage: ${cropStage}`
      ]
    };
  }

  private generateSprayingAdvisory(forecast: HyperLocalForecast[]): AgricultureAdvisory | null {
    const next24Hours = forecast.slice(0, 24);
    const goodSprayingConditions = next24Hours.filter(f =>
      f.windSpeed < 10 &&           // Low wind
      f.precipitation.amount < 0.5 && // No rain
      f.temperature.avg > 5 &&      // Not too cold
      f.temperature.avg < 30        // Not too hot
    );
    
    if (goodSprayingConditions.length > 6) { // At least 6 good hours
      const bestWindow = goodSprayingConditions.slice(0, 6);
      
      return {
        type: 'spraying',
        recommendation: 'Optimal conditions for pesticide/herbicide application.',
        timing: {
          start: new Date(Date.now() + bestWindow[0].timeHorizon * 3600000),
          end: new Date(Date.now() + bestWindow[bestWindow.length - 1].timeHorizon * 3600000)
        },
        confidence: 0.8,
        reasoning: [
          'Low wind speeds (<10 km/h)',
          'No precipitation expected',
          'Optimal temperature range',
          `${goodSprayingConditions.length} hours of good conditions`
        ]
      };
    }
    
    return null;
  }

  async analyzeMicroclimate(
    locations: Coordinate[],
    terrain: any, // Terrain data
    vegetation: any // Vegetation data
  ): Promise<MicroclimateData> {
    if (!this.initialized) await this.initialize();
    
    // Simplified microclimate analysis
    const zones = locations.map((location, index) => ({
      id: `zone_${index}`,
      area: {
        coordinates: this.generateCirclePolygon(location, 1), // 1km radius
        area: Math.PI,
        centroid: [location.lat, location.lng]
      },
      characteristics: {
        temperature: 20 + (Math.random() - 0.5) * 10,
        humidity: 60 + (Math.random() - 0.5) * 20,
        windExposure: Math.random(),
        soilType: ['clay', 'sand', 'loam'][Math.floor(Math.random() * 3)],
        drainage: ['poor', 'moderate', 'good'][Math.floor(Math.random() * 3)]
      },
      suitableCrops: ['wheat', 'corn', 'soybeans', 'tomatoes'].filter(() => Math.random() > 0.5)
    }));
    
    return {
      zones,
      variability: Math.random() * 0.5,
      factors: ['elevation', 'slope', 'aspect', 'vegetation', 'water_bodies']
    };
  }
}

// Export singleton instance
export const weatherIntelligence = new WeatherIntelligence();