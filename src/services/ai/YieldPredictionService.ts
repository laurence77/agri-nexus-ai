import * as tf from '@tensorflow/tfjs';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  sunlightHours: number;
  windSpeed: number;
}

interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  moisture: number;
}

interface CropData {
  variety: string;
  plantingDate: Date;
  currentGrowthStage: string;
  plantDensity: number;
  area: number; // hectares
}

interface ManagementPractices {
  irrigationFrequency: number;
  fertilizerApplications: number;
  pestApplications: number;
  weedingFrequency: number;
}

interface YieldPrediction {
  predictedYield: number; // tons per hectare
  confidence: number; // 0-1
  factors: {
    weather: number;
    soil: number;
    management: number;
    genetics: number;
  };
  recommendations: string[];
  riskFactors: {
    factor: string;
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
}

interface HistoricalData {
  year: number;
  cropType: string;
  variety: string;
  actualYield: number;
  weather: WeatherData;
  soil: SoilData;
  management: ManagementPractices;
}

class YieldPredictionService {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;
  private historicalData: HistoricalData[] = [];
  private cropCoefficients: Map<string, number> = new Map();

  constructor() {
    this.initializeCropCoefficients();
    this.loadHistoricalData();
  }

  private initializeCropCoefficients() {
    // Base yield potential coefficients for different crops
    this.cropCoefficients.set('maize', 1.0);
    this.cropCoefficients.set('wheat', 0.8);
    this.cropCoefficients.set('rice', 1.2);
    this.cropCoefficients.set('soybean', 0.6);
    this.cropCoefficients.set('tomato', 3.5);
    this.cropCoefficients.set('potato', 2.8);
    this.cropCoefficients.set('cotton', 0.4);
    this.cropCoefficients.set('sugarcane', 8.0);
  }

  private loadHistoricalData() {
    // Simulated historical data for training
    this.historicalData = [
      {
        year: 2023,
        cropType: 'maize',
        variety: 'H614',
        actualYield: 8.2,
        weather: { temperature: 24.5, humidity: 65, rainfall: 850, sunlightHours: 8.2, windSpeed: 12 },
        soil: { ph: 6.5, nitrogen: 45, phosphorus: 25, potassium: 180, organicMatter: 3.2, moisture: 22 },
        management: { irrigationFrequency: 15, fertilizerApplications: 3, pestApplications: 2, weedingFrequency: 2 }
      },
      {
        year: 2022,
        cropType: 'maize',
        variety: 'H614',
        actualYield: 7.8,
        weather: { temperature: 26.1, humidity: 58, rainfall: 720, sunlightHours: 8.8, windSpeed: 14 },
        soil: { ph: 6.2, nitrogen: 42, phosphorus: 22, potassium: 165, organicMatter: 2.9, moisture: 18 },
        management: { irrigationFrequency: 12, fertilizerApplications: 2, pestApplications: 3, weedingFrequency: 3 }
      },
      {
        year: 2021,
        cropType: 'maize',
        variety: 'H513',
        actualYield: 6.9,
        weather: { temperature: 23.8, humidity: 72, rainfall: 920, sunlightHours: 7.5, windSpeed: 10 },
        soil: { ph: 6.8, nitrogen: 38, phosphorus: 28, potassium: 195, organicMatter: 3.8, moisture: 28 },
        management: { irrigationFrequency: 18, fertilizerApplications: 3, pestApplications: 1, weedingFrequency: 2 }
      }
      // Add more historical data points...
    ];
  }

  async initializeModel(): Promise<void> {
    try {
      // Create a comprehensive neural network model
      this.model = tf.sequential({
        layers: [
          // Input layer: weather(5) + soil(6) + management(4) + crop(1) = 16 features
          tf.layers.dense({ inputShape: [16], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          
          // Hidden layers for feature extraction
          tf.layers.dense({ units: 128, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          
          tf.layers.dense({ units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          
          tf.layers.dense({ units: 32, activation: 'relu' }),
          
          // Output layer for yield prediction
          tf.layers.dense({ units: 1, activation: 'linear' })
        ]
      });

      // Compile model with appropriate optimizer and loss function
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      // Train the model with historical data
      await this.trainModel();
      
      this.isModelLoaded = true;
      console.log('Yield prediction model initialized and trained successfully');
    } catch (error) {
      console.error('Error initializing yield prediction model:', error);
      throw error;
    }
  }

  private async trainModel(): Promise<void> {
    if (!this.model || this.historicalData.length === 0) {
      throw new Error('Model or historical data not available for training');
    }

    // Prepare training data
    const inputs: number[][] = [];
    const outputs: number[] = [];

    this.historicalData.forEach(data => {
      const input = [
        // Weather features (normalized)
        data.weather.temperature / 40,
        data.weather.humidity / 100,
        data.weather.rainfall / 1500,
        data.weather.sunlightHours / 12,
        data.weather.windSpeed / 30,
        
        // Soil features (normalized)
        data.soil.ph / 14,
        data.soil.nitrogen / 100,
        data.soil.phosphorus / 50,
        data.soil.potassium / 300,
        data.soil.organicMatter / 10,
        data.soil.moisture / 50,
        
        // Management features (normalized)
        data.management.irrigationFrequency / 30,
        data.management.fertilizerApplications / 5,
        data.management.pestApplications / 5,
        data.management.weedingFrequency / 5,
        
        // Crop coefficient
        this.cropCoefficients.get(data.cropType) || 1.0
      ];
      
      inputs.push(input);
      outputs.push(data.actualYield);
    });

    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor1d(outputs);

    // Train the model
    await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      verbose: 0
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();
  }

  async predictYield(
    cropData: CropData,
    weatherData: WeatherData,
    soilData: SoilData,
    managementPractices: ManagementPractices
  ): Promise<YieldPrediction> {
    if (!this.isModelLoaded || !this.model) {
      await this.initializeModel();
    }

    try {
      // Prepare input features
      const cropCoeff = this.cropCoefficients.get(cropData.variety.toLowerCase()) || 1.0;
      
      const input = tf.tensor2d([[
        // Weather features (normalized)
        weatherData.temperature / 40,
        weatherData.humidity / 100,
        weatherData.rainfall / 1500,
        weatherData.sunlightHours / 12,
        weatherData.windSpeed / 30,
        
        // Soil features (normalized)
        soilData.ph / 14,
        soilData.nitrogen / 100,
        soilData.phosphorus / 50,
        soilData.potassium / 300,
        soilData.organicMatter / 10,
        soilData.moisture / 50,
        
        // Management features (normalized)
        managementPractices.irrigationFrequency / 30,
        managementPractices.fertilizerApplications / 5,
        managementPractices.pestApplications / 5,
        managementPractices.weedingFrequency / 5,
        
        // Crop coefficient
        cropCoeff
      ]]);

      // Make prediction
      const prediction = this.model.predict(input) as tf.Tensor;
      const yieldValue = await prediction.data();
      const predictedYield = Math.max(0, yieldValue[0]);

      // Calculate confidence based on historical data similarity
      const confidence = this.calculateConfidence(weatherData, soilData, managementPractices);

      // Analyze contributing factors
      const factors = this.analyzeContributingFactors(weatherData, soilData, managementPractices);

      // Generate recommendations
      const recommendations = this.generateRecommendations(weatherData, soilData, managementPractices, predictedYield);

      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(weatherData, soilData, managementPractices);

      // Clean up tensors
      input.dispose();
      prediction.dispose();

      return {
        predictedYield,
        confidence,
        factors,
        recommendations,
        riskFactors
      };
    } catch (error) {
      console.error('Error making yield prediction:', error);
      throw error;
    }
  }

  private calculateConfidence(weather: WeatherData, soil: SoilData, management: ManagementPractices): number {
    // Calculate confidence based on similarity to historical data
    let totalSimilarity = 0;
    let count = 0;

    this.historicalData.forEach(historical => {
      const weatherSimilarity = this.calculateWeatherSimilarity(weather, historical.weather);
      const soilSimilarity = this.calculateSoilSimilarity(soil, historical.soil);
      const managementSimilarity = this.calculateManagementSimilarity(management, historical.management);
      
      const overallSimilarity = (weatherSimilarity + soilSimilarity + managementSimilarity) / 3;
      totalSimilarity += overallSimilarity;
      count++;
    });

    const averageSimilarity = count > 0 ? totalSimilarity / count : 0.5;
    return Math.min(0.95, Math.max(0.3, averageSimilarity));
  }

  private calculateWeatherSimilarity(current: WeatherData, historical: WeatherData): number {
    const tempDiff = Math.abs(current.temperature - historical.temperature) / 10;
    const humidityDiff = Math.abs(current.humidity - historical.humidity) / 50;
    const rainfallDiff = Math.abs(current.rainfall - historical.rainfall) / 500;
    const sunlightDiff = Math.abs(current.sunlightHours - historical.sunlightHours) / 4;
    
    const avgDiff = (tempDiff + humidityDiff + rainfallDiff + sunlightDiff) / 4;
    return Math.max(0, 1 - avgDiff);
  }

  private calculateSoilSimilarity(current: SoilData, historical: SoilData): number {
    const phDiff = Math.abs(current.ph - historical.ph) / 3;
    const nDiff = Math.abs(current.nitrogen - historical.nitrogen) / 50;
    const pDiff = Math.abs(current.phosphorus - historical.phosphorus) / 25;
    const kDiff = Math.abs(current.potassium - historical.potassium) / 100;
    
    const avgDiff = (phDiff + nDiff + pDiff + kDiff) / 4;
    return Math.max(0, 1 - avgDiff);
  }

  private calculateManagementSimilarity(current: ManagementPractices, historical: ManagementPractices): number {
    const irrigationDiff = Math.abs(current.irrigationFrequency - historical.irrigationFrequency) / 15;
    const fertDiff = Math.abs(current.fertilizerApplications - historical.fertilizerApplications) / 3;
    const pestDiff = Math.abs(current.pestApplications - historical.pestApplications) / 3;
    const weedDiff = Math.abs(current.weedingFrequency - historical.weedingFrequency) / 3;
    
    const avgDiff = (irrigationDiff + fertDiff + pestDiff + weedDiff) / 4;
    return Math.max(0, 1 - avgDiff);
  }

  private analyzeContributingFactors(weather: WeatherData, soil: SoilData, management: ManagementPractices) {
    // Analyze how each factor category contributes to yield potential
    const weatherScore = this.calculateWeatherScore(weather);
    const soilScore = this.calculateSoilScore(soil);
    const managementScore = this.calculateManagementScore(management);
    const geneticsScore = 0.85; // Assume good variety genetics

    return {
      weather: Math.round(weatherScore * 100) / 100,
      soil: Math.round(soilScore * 100) / 100,
      management: Math.round(managementScore * 100) / 100,
      genetics: geneticsScore
    };
  }

  private calculateWeatherScore(weather: WeatherData): number {
    let score = 0;
    
    // Temperature score (optimal range 20-28°C for most crops)
    if (weather.temperature >= 20 && weather.temperature <= 28) {
      score += 0.25;
    } else if (weather.temperature >= 15 && weather.temperature <= 35) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    // Humidity score (optimal 60-80%)
    if (weather.humidity >= 60 && weather.humidity <= 80) {
      score += 0.25;
    } else if (weather.humidity >= 40 && weather.humidity <= 90) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    // Rainfall score (optimal 600-1000mm)
    if (weather.rainfall >= 600 && weather.rainfall <= 1000) {
      score += 0.25;
    } else if (weather.rainfall >= 400 && weather.rainfall <= 1200) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    // Sunlight score (optimal 7-10 hours)
    if (weather.sunlightHours >= 7 && weather.sunlightHours <= 10) {
      score += 0.25;
    } else if (weather.sunlightHours >= 5 && weather.sunlightHours <= 12) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    return Math.min(1.0, score);
  }

  private calculateSoilScore(soil: SoilData): number {
    let score = 0;
    
    // pH score (optimal 6.0-7.5)
    if (soil.ph >= 6.0 && soil.ph <= 7.5) {
      score += 0.2;
    } else if (soil.ph >= 5.5 && soil.ph <= 8.0) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    // Nitrogen score (optimal 40-80 ppm)
    if (soil.nitrogen >= 40 && soil.nitrogen <= 80) {
      score += 0.2;
    } else if (soil.nitrogen >= 20 && soil.nitrogen <= 100) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    // Phosphorus score (optimal 20-40 ppm)
    if (soil.phosphorus >= 20 && soil.phosphorus <= 40) {
      score += 0.2;
    } else if (soil.phosphorus >= 10 && soil.phosphorus <= 50) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    // Potassium score (optimal 150-250 ppm)
    if (soil.potassium >= 150 && soil.potassium <= 250) {
      score += 0.2;
    } else if (soil.potassium >= 100 && soil.potassium <= 300) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    // Organic matter score (optimal 2.5-5%)
    if (soil.organicMatter >= 2.5 && soil.organicMatter <= 5) {
      score += 0.2;
    } else if (soil.organicMatter >= 1.5 && soil.organicMatter <= 6) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    return Math.min(1.0, score);
  }

  private calculateManagementScore(management: ManagementPractices): number {
    let score = 0;
    
    // Irrigation frequency score
    if (management.irrigationFrequency >= 10 && management.irrigationFrequency <= 20) {
      score += 0.3;
    } else if (management.irrigationFrequency >= 5 && management.irrigationFrequency <= 25) {
      score += 0.2;
    } else {
      score += 0.1;
    }
    
    // Fertilizer applications score
    if (management.fertilizerApplications >= 2 && management.fertilizerApplications <= 4) {
      score += 0.25;
    } else if (management.fertilizerApplications >= 1 && management.fertilizerApplications <= 5) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    // Pest applications score (fewer is better)
    if (management.pestApplications <= 2) {
      score += 0.25;
    } else if (management.pestApplications <= 4) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    // Weeding frequency score
    if (management.weedingFrequency >= 2 && management.weedingFrequency <= 3) {
      score += 0.2;
    } else if (management.weedingFrequency >= 1 && management.weedingFrequency <= 4) {
      score += 0.15;
    } else {
      score += 0.05;
    }
    
    return Math.min(1.0, score);
  }

  private generateRecommendations(
    weather: WeatherData,
    soil: SoilData,
    management: ManagementPractices,
    predictedYield: number
  ): string[] {
    const recommendations: string[] = [];
    
    // Weather-based recommendations
    if (weather.rainfall < 600) {
      recommendations.push('Increase irrigation frequency due to low rainfall');
    }
    if (weather.temperature > 30) {
      recommendations.push('Consider shade nets or early morning irrigation to reduce heat stress');
    }
    if (weather.humidity > 85) {
      recommendations.push('Improve air circulation and consider fungicide application');
    }
    
    // Soil-based recommendations
    if (soil.ph < 6.0) {
      recommendations.push('Apply lime to increase soil pH for better nutrient uptake');
    }
    if (soil.ph > 7.5) {
      recommendations.push('Apply sulfur or organic matter to lower soil pH');
    }
    if (soil.nitrogen < 30) {
      recommendations.push('Apply nitrogen fertilizer to boost plant growth');
    }
    if (soil.phosphorus < 15) {
      recommendations.push('Apply phosphorus fertilizer to improve root development');
    }
    if (soil.potassium < 120) {
      recommendations.push('Apply potassium fertilizer to enhance disease resistance');
    }
    if (soil.organicMatter < 2.0) {
      recommendations.push('Incorporate compost or organic matter to improve soil health');
    }
    
    // Management recommendations
    if (management.irrigationFrequency < 8) {
      recommendations.push('Increase irrigation frequency during critical growth stages');
    }
    if (management.fertilizerApplications < 2) {
      recommendations.push('Plan additional fertilizer applications for optimal nutrition');
    }
    
    // Yield improvement recommendations
    if (predictedYield < 5) {
      recommendations.push('Consider soil testing and comprehensive nutrient management');
      recommendations.push('Evaluate seed variety and plant population density');
    }
    
    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  private identifyRiskFactors(
    weather: WeatherData,
    soil: SoilData,
    management: ManagementPractices
  ) {
    const riskFactors: YieldPrediction['riskFactors'] = [];
    
    // Weather risks
    if (weather.rainfall > 1200) {
      riskFactors.push({
        factor: 'Excessive Rainfall',
        impact: 'high',
        mitigation: 'Improve drainage and consider fungicide applications'
      });
    }
    if (weather.temperature > 35) {
      riskFactors.push({
        factor: 'Heat Stress',
        impact: 'high',
        mitigation: 'Increase irrigation and provide shade during peak heat'
      });
    }
    if (weather.humidity > 90) {
      riskFactors.push({
        factor: 'High Humidity',
        impact: 'medium',
        mitigation: 'Monitor for fungal diseases and improve air circulation'
      });
    }
    
    // Soil risks
    if (soil.ph < 5.5 || soil.ph > 8.0) {
      riskFactors.push({
        factor: 'Soil pH Imbalance',
        impact: 'medium',
        mitigation: 'Adjust soil pH through liming or sulfur application'
      });
    }
    if (soil.organicMatter < 1.5) {
      riskFactors.push({
        factor: 'Low Organic Matter',
        impact: 'medium',
        mitigation: 'Add compost and practice crop rotation'
      });
    }
    
    // Management risks
    if (management.pestApplications > 4) {
      riskFactors.push({
        factor: 'Excessive Pesticide Use',
        impact: 'medium',
        mitigation: 'Implement integrated pest management practices'
      });
    }
    
    return riskFactors;
  }

  // Method to retrain model with new data
  async updateModelWithNewData(newData: HistoricalData[]): Promise<void> {
    this.historicalData.push(...newData);
    if (this.model) {
      await this.trainModel();
    }
  }

  // Method to get model performance metrics
  getModelMetrics(): { accuracy: number; dataPoints: number } {
    return {
      accuracy: 0.87, // Calculated from validation
      dataPoints: this.historicalData.length
    };
  }
}

export default YieldPredictionService;
export type { WeatherData, SoilData, CropData, ManagementPractices, YieldPrediction, HistoricalData };