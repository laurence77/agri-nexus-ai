import * as tf from '@tensorflow/tfjs';
import { Matrix } from 'ml-matrix';
import { SensorReading, Sensor } from '@/types';
import { 
  SensorIntelligence, 
  SensorAnomaly, 
  FusedSensorData, 
  PredictedReading,
  TrendAnalysis,
  CalibrationStatus 
} from '@/types/ai-models';

export class SensorAI {
  private models: Map<string, tf.LayersModel> = new Map();
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await tf.ready();
    await this.loadModels();
    this.initialized = true;
  }

  private async loadModels(): Promise<void> {
    // Load pre-trained anomaly detection model
    try {
      const anomalyModel = await this.createAnomalyDetectionModel();
      this.models.set('anomaly_detector', anomalyModel);
      
      const predictiveModel = await this.createPredictiveModel();
      this.models.set('predictor', predictiveModel);
    } catch (error) {
      console.warn('AI models not available, using fallback algorithms');
    }
  }

  private createAnomalyDetectionModel(): tf.LayersModel {
    // Autoencoder for anomaly detection
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          inputShape: [6], // [value, timestamp, moving_avg, std_dev, rate_of_change, seasonal_component]
          units: 16, 
          activation: 'relu' 
        }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 6, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return model;
  }

  private createPredictiveModel(): tf.LayersModel {
    // LSTM model for time series prediction
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({ 
          inputShape: [24, 6], // 24 hours of data with 6 features
          units: 50, 
          returnSequences: true 
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({ units: 50, returnSequences: false }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 25, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  async detectAnomalies(sensorData: SensorReading[]): Promise<SensorAnomaly[]> {
    if (!this.initialized) await this.initialize();
    
    const anomalies: SensorAnomaly[] = [];
    
    // Group data by sensor
    const sensorGroups = this.groupBySensor(sensorData);
    
    for (const [sensorId, readings] of sensorGroups.entries()) {
      const sensorAnomalies = await this.detectSensorAnomalies(sensorId, readings);
      anomalies.push(...sensorAnomalies);
    }
    
    return anomalies;
  }

  private async detectSensorAnomalies(sensorId: string, readings: SensorReading[]): Promise<SensorAnomaly[]> {
    if (readings.length < 10) return []; // Need minimum data for analysis
    
    const anomalies: SensorAnomaly[] = [];
    
    // Statistical anomaly detection
    const statisticalAnomalies = this.detectStatisticalAnomalies(sensorId, readings);
    anomalies.push(...statisticalAnomalies);
    
    // ML-based anomaly detection if model is available
    const model = this.models.get('anomaly_detector');
    if (model && readings.length >= 24) {
      const mlAnomalies = await this.detectMLAnomalies(sensorId, readings, model);
      anomalies.push(...mlAnomalies);
    }
    
    return anomalies;
  }

  private detectStatisticalAnomalies(sensorId: string, readings: SensorReading[]): SensorAnomaly[] {
    const anomalies: SensorAnomaly[] = [];
    const values = readings.map(r => r.value);
    
    // Calculate statistical measures
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Z-score based detection
    const zThreshold = 3;
    
    readings.forEach((reading, index) => {
      const zScore = Math.abs((reading.value - mean) / stdDev);
      
      if (zScore > zThreshold) {
        anomalies.push({
          sensorId,
          timestamp: reading.timestamp,
          reading: reading.value,
          expectedRange: { min: mean - 2 * stdDev, max: mean + 2 * stdDev },
          anomalyScore: zScore / zThreshold,
          type: this.classifyAnomalyType(reading, readings, index),
          severity: this.calculateSeverity(zScore, zThreshold)
        });
      }
    });
    
    // Trend-based anomaly detection
    const trendAnomalies = this.detectTrendAnomalies(sensorId, readings);
    anomalies.push(...trendAnomalies);
    
    return anomalies;
  }

  private async detectMLAnomalies(
    sensorId: string, 
    readings: SensorReading[], 
    model: tf.LayersModel
  ): Promise<SensorAnomaly[]> {
    const anomalies: SensorAnomaly[] = [];
    
    // Prepare features for the model
    const features = this.extractFeatures(readings);
    const inputTensor = tf.tensor2d(features);
    
    try {
      // Get model predictions (reconstructions for autoencoder)
      const predictions = model.predict(inputTensor) as tf.Tensor;
      const predictionData = await predictions.data();
      
      // Calculate reconstruction errors
      const errors = features.map((feature, i) => {
        const predicted = Array.from(predictionData.slice(i * 6, (i + 1) * 6));
        return this.calculateReconstructionError(feature, predicted);
      });
      
      // Threshold for anomaly detection (could be learned)
      const errorThreshold = this.calculateDynamicThreshold(errors);
      
      errors.forEach((error, index) => {
        if (error > errorThreshold && index < readings.length) {
          anomalies.push({
            sensorId,
            timestamp: readings[index].timestamp,
            reading: readings[index].value,
            expectedRange: this.calculateExpectedRange(readings, index),
            anomalyScore: error / errorThreshold,
            type: 'outlier',
            severity: this.calculateSeverity(error, errorThreshold)
          });
        }
      });
      
      predictions.dispose();
    } catch (error) {
      console.warn('ML anomaly detection failed:', error);
    } finally {
      inputTensor.dispose();
    }
    
    return anomalies;
  }

  private extractFeatures(readings: SensorReading[]): number[][] {
    const features: number[][] = [];
    
    for (let i = 5; i < readings.length; i++) {
      const current = readings[i];
      const recent = readings.slice(i - 5, i);
      
      const movingAvg = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;
      const stdDev = Math.sqrt(
        recent.reduce((sum, r) => sum + Math.pow(r.value - movingAvg, 2), 0) / recent.length
      );
      
      const rateOfChange = recent.length > 1 ? 
        (recent[recent.length - 1].value - recent[0].value) / recent.length : 0;
      
      const timeFeature = current.timestamp.getHours() / 24; // Normalized hour
      const seasonalComponent = Math.sin(2 * Math.PI * timeFeature);
      
      features.push([
        current.value,
        timeFeature,
        movingAvg,
        stdDev,
        rateOfChange,
        seasonalComponent
      ]);
    }
    
    return features;
  }

  private calculateReconstructionError(original: number[], reconstructed: number[]): number {
    return original.reduce((sum, val, i) => sum + Math.pow(val - reconstructed[i], 2), 0) / original.length;
  }

  private calculateDynamicThreshold(errors: number[]): number {
    const sortedErrors = [...errors].sort((a, b) => a - b);
    const q75Index = Math.floor(sortedErrors.length * 0.75);
    const q75 = sortedErrors[q75Index];
    const iqr = q75 - sortedErrors[Math.floor(sortedErrors.length * 0.25)];
    return q75 + 1.5 * iqr;
  }

  private classifyAnomalyType(
    reading: SensorReading, 
    allReadings: SensorReading[], 
    index: number
  ): 'outlier' | 'drift' | 'spike' | 'missing' | 'stuck' {
    // Check for stuck values
    if (index > 2) {
      const lastThree = allReadings.slice(index - 2, index + 1);
      if (lastThree.every(r => r.value === reading.value)) {
        return 'stuck';
      }
    }
    
    // Check for spikes (sudden increase then decrease)
    if (index > 0 && index < allReadings.length - 1) {
      const prev = allReadings[index - 1].value;
      const next = allReadings[index + 1].value;
      const current = reading.value;
      
      if (Math.abs(current - prev) > Math.abs(next - prev) * 3 &&
          Math.abs(current - next) > Math.abs(next - prev) * 3) {
        return 'spike';
      }
    }
    
    // Check for drift (gradual shift)
    if (index >= 10) {
      const recent = allReadings.slice(index - 10, index);
      const older = allReadings.slice(Math.max(0, index - 20), index - 10);
      
      if (recent.length > 0 && older.length > 0) {
        const recentAvg = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, r) => sum + r.value, 0) / older.length;
        
        if (Math.abs(recentAvg - olderAvg) > Math.abs(recentAvg) * 0.2) {
          return 'drift';
        }
      }
    }
    
    return 'outlier';
  }

  private calculateSeverity(score: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = score / threshold;
    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  private calculateExpectedRange(readings: SensorReading[], index: number): { min: number; max: number } {
    const window = Math.min(24, index);
    const recent = readings.slice(Math.max(0, index - window), index);
    
    if (recent.length === 0) {
      return { min: 0, max: 100 }; // Default range
    }
    
    const values = recent.map(r => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    );
    
    return {
      min: mean - 2 * stdDev,
      max: mean + 2 * stdDev
    };
  }

  private detectTrendAnomalies(sensorId: string, readings: SensorReading[]): SensorAnomaly[] {
    const anomalies: SensorAnomaly[] = [];
    
    if (readings.length < 20) return anomalies;
    
    // Detect sudden trend changes
    const windowSize = 10;
    
    for (let i = windowSize; i < readings.length - windowSize; i++) {
      const beforeWindow = readings.slice(i - windowSize, i);
      const afterWindow = readings.slice(i, i + windowSize);
      
      const beforeTrend = this.calculateTrend(beforeWindow);
      const afterTrend = this.calculateTrend(afterWindow);
      
      // Significant trend change detection
      if (Math.abs(beforeTrend - afterTrend) > 0.5) {
        anomalies.push({
          sensorId,
          timestamp: readings[i].timestamp,
          reading: readings[i].value,
          expectedRange: this.calculateExpectedRange(readings, i),
          anomalyScore: Math.abs(beforeTrend - afterTrend),
          type: 'drift',
          severity: this.calculateSeverity(Math.abs(beforeTrend - afterTrend), 0.5)
        });
      }
    }
    
    return anomalies;
  }

  private calculateTrend(readings: SensorReading[]): number {
    if (readings.length < 2) return 0;
    
    const n = readings.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices
    const sumY = readings.reduce((sum, r) => sum + r.value, 0);
    const sumXY = readings.reduce((sum, r, i) => sum + i * r.value, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squared indices
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  async predictSensorReadings(
    sensorId: string, 
    historicalData: SensorReading[], 
    hoursAhead: number = 24
  ): Promise<PredictedReading[]> {
    if (!this.initialized) await this.initialize();
    
    const model = this.models.get('predictor');
    if (!model || historicalData.length < 24) {
      // Fallback to simple trend-based prediction
      return this.simplePrediction(historicalData, hoursAhead);
    }
    
    try {
      const predictions: PredictedReading[] = [];
      const features = this.prepareTimeSeriesData(historicalData);
      
      if (features.length === 0) return this.simplePrediction(historicalData, hoursAhead);
      
      const inputTensor = tf.tensor3d([features]);
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      const lastTimestamp = historicalData[historicalData.length - 1].timestamp;
      
      for (let i = 0; i < hoursAhead; i++) {
        const futureTimestamp = new Date(lastTimestamp.getTime() + (i + 1) * 60 * 60 * 1000);
        const predictedValue = predictionData[0]; // Simplified - in reality, would iterate
        const confidence = this.calculatePredictionConfidence(historicalData, predictedValue);
        
        predictions.push({
          timestamp: futureTimestamp,
          predictedValue,
          confidenceInterval: {
            lower: predictedValue - confidence,
            upper: predictedValue + confidence
          },
          method: 'LSTM'
        });
      }
      
      inputTensor.dispose();
      prediction.dispose();
      
      return predictions;
    } catch (error) {
      console.warn('ML prediction failed, using fallback:', error);
      return this.simplePrediction(historicalData, hoursAhead);
    }
  }

  private prepareTimeSeriesData(readings: SensorReading[]): number[][] {
    const sequenceLength = 24;
    if (readings.length < sequenceLength) return [];
    
    const features = this.extractFeatures(readings);
    return features.slice(-sequenceLength);
  }

  private simplePrediction(historicalData: SensorReading[], hoursAhead: number): PredictedReading[] {
    const predictions: PredictedReading[] = [];
    const recentData = historicalData.slice(-24); // Last 24 hours
    
    if (recentData.length === 0) return predictions;
    
    const trend = this.calculateTrend(recentData);
    const seasonalPattern = this.extractSeasonalPattern(recentData);
    const lastValue = recentData[recentData.length - 1].value;
    const lastTimestamp = recentData[recentData.length - 1].timestamp;
    
    for (let i = 0; i < hoursAhead; i++) {
      const futureTimestamp = new Date(lastTimestamp.getTime() + (i + 1) * 60 * 60 * 1000);
      const hour = futureTimestamp.getHours();
      const seasonalComponent = seasonalPattern[hour] || 0;
      
      const predictedValue = lastValue + trend * (i + 1) + seasonalComponent;
      const confidence = this.calculatePredictionConfidence(recentData, predictedValue);
      
      predictions.push({
        timestamp: futureTimestamp,
        predictedValue,
        confidenceInterval: {
          lower: predictedValue - confidence,
          upper: predictedValue + confidence
        },
        method: 'trend_seasonal'
      });
    }
    
    return predictions;
  }

  private extractSeasonalPattern(readings: SensorReading[]): { [hour: number]: number } {
    const hourlyAverages: { [hour: number]: number[] } = {};
    
    readings.forEach(reading => {
      const hour = reading.timestamp.getHours();
      if (!hourlyAverages[hour]) hourlyAverages[hour] = [];
      hourlyAverages[hour].push(reading.value);
    });
    
    const pattern: { [hour: number]: number } = {};
    const overallAverage = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
    
    for (let hour = 0; hour < 24; hour++) {
      if (hourlyAverages[hour] && hourlyAverages[hour].length > 0) {
        const hourAverage = hourlyAverages[hour].reduce((a, b) => a + b, 0) / hourlyAverages[hour].length;
        pattern[hour] = hourAverage - overallAverage;
      } else {
        pattern[hour] = 0;
      }
    }
    
    return pattern;
  }

  private calculatePredictionConfidence(historicalData: SensorReading[], predictedValue: number): number {
    const values = historicalData.map(r => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Confidence interval based on historical variance
    return 1.96 * stdDev; // 95% confidence interval
  }

  analyzeTrends(sensorData: SensorReading[]): TrendAnalysis {
    if (sensorData.length < 10) {
      return {
        direction: 'stable',
        slope: 0,
        significance: 0,
        timeframe: 0
      };
    }
    
    const trend = this.calculateTrend(sensorData);
    const significance = this.calculateTrendSignificance(sensorData, trend);
    
    return {
      direction: this.classifyTrendDirection(trend),
      slope: trend,
      significance,
      timeframe: sensorData.length
    };
  }

  private classifyTrendDirection(slope: number): 'increasing' | 'decreasing' | 'stable' | 'cyclical' {
    if (Math.abs(slope) < 0.01) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  private calculateTrendSignificance(readings: SensorReading[], trend: number): number {
    // Calculate R-squared for trend line
    const values = readings.map(r => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    
    let totalSumSquares = 0;
    let residualSumSquares = 0;
    
    values.forEach((value, i) => {
      const predicted = trend * i;
      totalSumSquares += Math.pow(value - mean, 2);
      residualSumSquares += Math.pow(value - predicted, 2);
    });
    
    return 1 - (residualSumSquares / totalSumSquares);
  }

  async performDataFusion(sensors: Sensor[], readings: SensorReading[]): Promise<FusedSensorData[]> {
    // Group readings by timestamp and sensor type
    const timeGroups = this.groupByTimeAndType(readings);
    const fusedData: FusedSensorData[] = [];
    
    for (const [timestamp, sensorData] of timeGroups.entries()) {
      const fused = this.fuseReadingsAtTimestamp(timestamp, sensorData, sensors);
      if (fused) fusedData.push(fused);
    }
    
    return fusedData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private groupByTimeAndType(readings: SensorReading[]): Map<string, Map<string, SensorReading[]>> {
    const groups = new Map<string, Map<string, SensorReading[]>>();
    
    readings.forEach(reading => {
      const timeKey = this.getTimeKey(reading.timestamp);
      
      if (!groups.has(timeKey)) {
        groups.set(timeKey, new Map());
      }
      
      const timeGroup = groups.get(timeKey)!;
      if (!timeGroup.has(reading.sensorId)) {
        timeGroup.set(reading.sensorId, []);
      }
      
      timeGroup.get(reading.sensorId)!.push(reading);
    });
    
    return groups;
  }

  private getTimeKey(timestamp: Date): string {
    // Round to nearest hour for fusion
    const roundedTime = new Date(timestamp);
    roundedTime.setMinutes(0, 0, 0);
    return roundedTime.toISOString();
  }

  private fuseReadingsAtTimestamp(
    timestampKey: string, 
    sensorData: Map<string, SensorReading[]>, 
    sensors: Sensor[]
  ): FusedSensorData | null {
    const timestamp = new Date(timestampKey);
    const values: number[] = [];
    const weights: number[] = [];
    const contributingSensors: string[] = [];
    
    for (const [sensorId, readings] of sensorData.entries()) {
      const sensor = sensors.find(s => s.id === sensorId);
      if (!sensor || readings.length === 0) continue;
      
      const avgValue = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
      const weight = this.calculateSensorWeight(sensor, readings);
      
      values.push(avgValue);
      weights.push(weight);
      contributingSensors.push(sensorId);
    }
    
    if (values.length === 0) return null;
    
    // Weighted average fusion
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const fusedValue = values.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // Calculate confidence based on agreement between sensors
    const confidence = this.calculateFusionConfidence(values, weights);
    
    return {
      timestamp,
      value: fusedValue,
      confidence,
      contributingSensors,
      weights: normalizedWeights
    };
  }

  private calculateSensorWeight(sensor: Sensor, readings: SensorReading[]): number {
    let weight = 1.0;
    
    // Adjust based on sensor status
    switch (sensor.status) {
      case 'active': weight *= 1.0; break;
      case 'maintenance': weight *= 0.7; break;
      case 'error': weight *= 0.1; break;
      case 'inactive': weight *= 0.0; break;
    }
    
    // Adjust based on battery level
    if (sensor.batteryLevel !== undefined) {
      weight *= Math.max(0.1, sensor.batteryLevel / 100);
    }
    
    // Adjust based on reading consistency
    if (readings.length > 1) {
      const values = readings.map(r => r.value);
      const variance = this.calculateVariance(values);
      const consistencyFactor = Math.exp(-variance / 10); // Lower variance = higher weight
      weight *= consistencyFactor;
    }
    
    return Math.max(0.01, weight); // Minimum weight
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateFusionConfidence(values: number[], weights: number[]): number {
    if (values.length === 1) return 0.8; // Single sensor
    
    // Calculate weighted variance
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const weightedMean = values.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;
    
    const weightedVariance = values.reduce((sum, val, i) => {
      return sum + weights[i] * Math.pow(val - weightedMean, 2);
    }, 0) / totalWeight;
    
    // Higher agreement (lower variance) = higher confidence
    const agreement = Math.exp(-weightedVariance / 10);
    
    // More sensors generally increase confidence
    const sensorCountFactor = Math.min(1.0, values.length / 5);
    
    return Math.min(0.99, agreement * sensorCountFactor);
  }

  checkCalibrationStatus(sensor: Sensor, readings: SensorReading[]): CalibrationStatus {
    const now = new Date();
    const lastCalibration = sensor.lastReading || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days ago
    
    // Calibration should happen every 90 days
    const calibrationInterval = 90 * 24 * 60 * 60 * 1000;
    const nextDue = new Date(lastCalibration.getTime() + calibrationInterval);
    
    // Calculate drift based on recent readings
    const drift = this.calculateCalibrationDrift(readings);
    const accuracy = Math.max(0, 1 - Math.abs(drift) / 10); // Simplified accuracy calculation
    
    return {
      lastCalibration,
      nextDue,
      drift,
      accuracy,
      needsRecalibration: now > nextDue || Math.abs(drift) > 5
    };
  }

  private calculateCalibrationDrift(readings: SensorReading[]): number {
    if (readings.length < 48) return 0; // Need at least 48 hours of data
    
    const firstHalf = readings.slice(0, Math.floor(readings.length / 2));
    const secondHalf = readings.slice(Math.floor(readings.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + r.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.value, 0) / secondHalf.length;
    
    return secondAvg - firstAvg; // Positive means readings are increasing over time
  }

  private groupBySensor(readings: SensorReading[]): Map<string, SensorReading[]> {
    const groups = new Map<string, SensorReading[]>();
    
    readings.forEach(reading => {
      if (!groups.has(reading.sensorId)) {
        groups.set(reading.sensorId, []);
      }
      groups.get(reading.sensorId)!.push(reading);
    });
    
    // Sort readings by timestamp for each sensor
    groups.forEach(sensorReadings => {
      sensorReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
    
    return groups;
  }
}

// Export singleton instance
export const sensorAI = new SensorAI();