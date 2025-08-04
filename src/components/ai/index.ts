// AI-Powered Agricultural Monitoring Components
// TensorFlow.js-based crop monitoring, disease detection, and predictive analytics

export { CropMonitoringDashboard } from './CropMonitoringDashboard';
export { SatelliteImageryAnalyzer } from './SatelliteImageryAnalyzer';
export { IoTSensorIntegration } from './IoTSensorIntegration';

// Re-export AI service types for convenience
export type {
  CropImage,
  DiseaseDetectionResult,
  SatelliteAnalysis,
  IoTSensorData,
  PredictiveAnalytics,
  TreatmentAction
} from '@/services/ai/crop-monitoring-service';

// AI Component metadata
export const AI_COMPONENTS_METADATA = {
  cropMonitoring: {
    title: 'AI Crop Monitoring Dashboard',
    description: 'Comprehensive crop health analysis using computer vision and machine learning',
    features: [
      'Disease detection from crop images',
      'Satellite imagery NDVI analysis',
      'IoT sensor data processing',
      'Predictive analytics engine',
      'Real-time monitoring and alerts'
    ],
    technologies: ['TensorFlow.js', 'Computer Vision', 'NDVI Analysis', 'IoT Integration']
  },
  satelliteAnalysis: {
    title: 'Satellite Imagery Analyzer',
    description: 'NDVI analysis and vegetation health monitoring from satellite data',
    features: [
      'NDVI score calculation',
      'Vegetation health assessment',
      'Growth stage detection',
      'Stress indicator analysis',
      'Yield prediction modeling'
    ],
    technologies: ['Satellite Imagery', 'NDVI', 'Remote Sensing', 'Vegetation Indices']
  },
  iotIntegration: {
    title: 'IoT Sensor Integration',
    description: 'Real-time agricultural sensor data processing and insights',
    features: [
      'Multi-sensor data aggregation',
      'Real-time monitoring dashboards',
      'Sensor correlation analysis',
      'Automated alert generation',
      'Predictive maintenance'
    ],
    technologies: ['IoT Sensors', 'Real-time Data', 'Sensor Fusion', 'Edge Computing']
  }
} as const;

// AI Model configurations
export const AI_MODEL_CONFIG = {
  diseaseDetection: {
    modelName: 'crop-disease-classifier-v1',
    inputShape: [224, 224, 3],
    outputClasses: 6, // healthy + 5 common diseases
    accuracy: 0.89,
    supportedCrops: ['maize', 'beans', 'tomatoes', 'onions', 'potatoes', 'cassava'],
    supportedDiseases: [
      'Gray Leaf Spot',
      'Maize Blight', 
      'Tomato Blight',
      'Bean Rust',
      'Cassava Mosaic Virus'
    ]
  },
  ndviAnalysis: {
    modelName: 'ndvi-health-classifier-v1',
    inputFeatures: 10,
    outputClasses: 5, // excellent, good, fair, poor, critical
    accuracy: 0.92,
    updateFrequency: 'weekly',
    satelliteProviders: ['Sentinel-2', 'Landsat-8', 'Planet']
  },
  yieldPrediction: {
    modelName: 'yield-forecaster-v1',
    inputFeatures: 15,
    outputType: 'regression',
    accuracy: 0.85,
    predictionHorizon: '90-days',
    factors: [
      'NDVI trends',
      'Weather patterns',
      'Soil conditions',
      'Crop variety',
      'Historical yields'
    ]
  }
} as const;

// Utility functions for AI components
export const aiUtils = {
  /**
   * Get appropriate AI component based on data type
   */
  getRecommendedComponent: (dataType: 'image' | 'satellite' | 'sensor' | 'historical') => {
    switch (dataType) {
      case 'image': return 'cropMonitoring';
      case 'satellite': return 'satelliteAnalysis';
      case 'sensor': return 'iotIntegration';
      case 'historical': return 'cropMonitoring';
      default: return 'cropMonitoring';
    }
  },

  /**
   * Calculate confidence score color
   */
  getConfidenceColor: (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  },

  /**
   * Format AI model predictions for display
   */
  formatPrediction: (value: number, type: 'percentage' | 'yield' | 'score') => {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'yield':
        return `${value.toLocaleString()} kg/ha`;
      case 'score':
        return value.toFixed(3);
      default:
        return value.toString();
    }
  },

  /**
   * Determine alert severity from AI predictions
   */
  getAlertSeverity: (prediction: number, thresholds: { low: number; high: number }) => {
    if (prediction >= thresholds.high) return 'critical';
    if (prediction >= thresholds.low) return 'warning';
    return 'normal';
  }
};

// AI processing status indicators
export const AI_STATUS = {
  INITIALIZING: 'initializing',
  READY: 'ready',
  PROCESSING: 'processing',
  ERROR: 'error',
  OFFLINE: 'offline'
} as const;

export type AIStatus = typeof AI_STATUS[keyof typeof AI_STATUS];

// Export default object for convenient imports
export default {
  CropMonitoringDashboard,
  SatelliteImageryAnalyzer,
  IoTSensorIntegration,
  AI_COMPONENTS_METADATA,
  AI_MODEL_CONFIG,
  aiUtils,
  AI_STATUS
};