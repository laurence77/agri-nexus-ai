import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CropMonitoringDashboard.css';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  Camera, 
  Satellite,
  Thermometer,
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Eye,
  Upload,
  Loader2,
  Brain,
  Zap,
  Leaf,
  Bug,
  Target,
  Calendar,
  MapPin,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import CropMonitoringService, { 
  CropImage, 
  DiseaseDetectionResult, 
  SatelliteAnalysis,
  IoTSensorData,
  PredictiveAnalytics
} from '@/services/ai/crop-monitoring-service';

interface CropMonitoringDashboardProps {
  className?: string;
  fieldId?: string;
}

interface MonitoringData {
  diseaseDetections: DiseaseDetectionResult[];
  satelliteAnalysis: SatelliteAnalysis | null;
  sensorData: IoTSensorData[];
  predictions: PredictiveAnalytics[];
  isLoading: boolean;
  lastUpdated: Date | null;
}

/**
 * AI Crop Monitoring Dashboard
 * Provides comprehensive crop health monitoring using AI, satellite imagery, and IoT sensors
 */
export function CropMonitoringDashboard({ className, fieldId }: CropMonitoringDashboardProps) {
  const { user, tenantId } = useAuth();
  const [monitoringService] = useState(() => new CropMonitoringService());
  const [selectedField, setSelectedField] = useState(fieldId || '');
  const [data, setData] = useState<MonitoringData>({
    diseaseDetections: [],
    satelliteAnalysis: null,
    sensorData: [],
    predictions: [],
    isLoading: false,
    lastUpdated: null
  });
  const [selectedTab, setSelectedTab] = useState<'overview' | 'diseases' | 'satellite' | 'sensors' | 'predictions'>('overview');
  const [imageCapture, setImageCapture] = useState<{
    isCapturing: boolean;
    previewUrl: string | null;
    analyzing: boolean;
  }>({
    isCapturing: false,
    previewUrl: null,
    analyzing: false
  });
  const [fields, setFields] = useState<Array<{ id: string; field_name: string }>>([]);
  const [modelStatus, setModelStatus] = useState<{
    diseaseModel: boolean;
    ndviModel: boolean;
    yieldModel: boolean;
    totalModels: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initializeMonitoring = useCallback(async () => {
    try {
      // Check if AI models are loaded
      const status = await monitoringService.getModelInfo();
      setModelStatus(status);
      
      // AI models initialization logic would go here
      console.log('AI models initialized');
    } catch (error) {
      console.error('Error initializing monitoring:', error);
    }
  }, [monitoringService]);

  const loadFields = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      // Load fields from database
      const response = await fetch(`/api/fields?tenant_id=${tenantId}`);
      if (response.ok) {
        const fieldsData = await response.json();
        setFields(fieldsData as Array<{ id: string; field_name: string }>);
        if (fieldsData.length > 0 && !selectedField) {
          setSelectedField(fieldsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  }, [tenantId, selectedField]);

  useEffect(() => {
    initializeMonitoring();
    loadFields();
  }, [initializeMonitoring, loadFields]);

  const loadMonitoringData = React.useCallback(async () => {
    if (!selectedField) return;

    setData(prev => ({ ...prev, isLoading: true }));

    try {
      // Load all monitoring data in parallel
      const [diseaseDetections, satelliteAnalysis, sensorData, predictions] = await Promise.all([
        loadDiseaseDetections(),
        loadSatelliteAnalysis(),
        loadSensorData(),
        loadPredictions()
      ]);

      setData({
        diseaseDetections,
        satelliteAnalysis,
        sensorData,
        predictions,
        isLoading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [selectedField]);

  useEffect(() => {
    if (selectedField) {
      loadMonitoringData();
    }
  }, [selectedField, loadMonitoringData]);

  // removed duplicate loadMonitoringData declaration (useCallback above is the source of truth)

  const loadDiseaseDetections = async (): Promise<DiseaseDetectionResult[]> => {
    // In production, this would fetch from database
    // For now, return mock data
    return [
      {
        diseaseId: 'maize_gray_leaf_spot',
        diseaseName: 'Gray Leaf Spot',
        confidence: 0.85,
        severity: 'medium',
        affectedArea: 15,
        symptoms: ['Gray rectangular lesions on leaves', 'Yellowing of leaves'],
        recommendations: ['Apply fungicide within 48 hours', 'Improve air circulation'],
        treatmentActions: [{
          type: 'spray',
          urgency: 'within_24h',
          description: 'Apply Propiconazole fungicide',
          estimatedCost: 120,
          requiredInputs: ['Propiconazole', 'Sprayer']
        }]
      }
    ];
  };

  const loadSatelliteAnalysis = async (): Promise<SatelliteAnalysis | null> => {
    if (!selectedField) return null;
    
    try {
      return await monitoringService.analyzeSatelliteImagery(selectedField);
    } catch (error) {
      console.error('Error loading satellite analysis:', error);
      return null;
    }
  };

  const loadSensorData = async (): Promise<IoTSensorData[]> => {
    // Mock sensor data - in production, fetch from IoT platform
    return [
      {
        sensorId: 'sensor_001',
        fieldId: selectedField,
        timestamp: new Date(),
        sensorType: 'soil_moisture',
        value: 65,
        unit: '%',
        status: 'normal'
      },
      {
        sensorId: 'sensor_002',
        fieldId: selectedField,
        timestamp: new Date(),
        sensorType: 'temperature',
        value: 28,
        unit: '°C',
        status: 'normal'
      },
      {
        sensorId: 'sensor_003',
        fieldId: selectedField,
        timestamp: new Date(),
        sensorType: 'humidity',
        value: 45,
        unit: '%',
        status: 'warning'
      }
    ];
  };

  const loadPredictions = async (): Promise<PredictiveAnalytics[]> => {
    if (!selectedField) return [];
    
    try {
      const diseaseRisk = await monitoringService.generatePredictiveAnalytics(selectedField, 'disease_risk');
      const yieldForecast = await monitoringService.generatePredictiveAnalytics(selectedField, 'yield_forecast');
      
      return [diseaseRisk, yieldForecast];
    } catch (error) {
      console.error('Error loading predictions:', error);
      return [];
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedField) return;

    setImageCapture(prev => ({ ...prev, analyzing: true }));

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setImageCapture(prev => ({ ...prev, previewUrl: imageData }));

        const cropImage: CropImage = {
          id: `img_${Date.now()}`,
          imageData,
          timestamp: new Date(),
          fieldId: selectedField,
          cropType: 'maize', // Should be determined from field data
          metadata: {
            source: 'upload',
            fileSize: file.size,
            fileName: file.name
          }
        };

        const results = await monitoringService.detectDiseases(cropImage);
        
        setData(prev => ({
          ...prev,
          diseaseDetections: results,
          lastUpdated: new Date()
        }));

        setImageCapture(prev => ({ ...prev, analyzing: false }));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setImageCapture(prev => ({ ...prev, analyzing: false }));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setImageCapture(prev => ({ ...prev, isCapturing: true }));
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setImageCapture(prev => ({ 
        ...prev, 
        previewUrl: imageData,
        isCapturing: false 
      }));

      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const refreshSatelliteData = async () => {
    if (!selectedField) return;
    
    setData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const analysis = await monitoringService.analyzeSatelliteImagery(selectedField);
      setData(prev => ({
        ...prev,
        satelliteAnalysis: analysis,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error refreshing satellite data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const processSensorData = async () => {
    if (data.sensorData.length === 0) return;

    try {
      const insights = await monitoringService.processIoTSensorData(data.sensorData);
      console.log('Sensor insights:', insights);
      // Update UI with insights
    } catch (error) {
      console.error('Error processing sensor data:', error);
    }
  };

  const getSeverityColor = (severity: DiseaseDetectionResult['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getHealthColor = (health: SatelliteAnalysis['vegetationHealth']) => {
    switch (health) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-green-300';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSensorStatusColor = (status: IoTSensorData['status']) => {
    switch (status) {
      case 'normal': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'critical': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className={cn('crop-monitoring-dashboard space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Brain className="h-8 w-8 text-green-400" />
            <span>AI Crop Monitoring</span>
          </h2>
          <p className="text-gray-300 mt-1">
            Advanced crop health analysis using AI, satellite imagery, and IoT sensors
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <label htmlFor="field-select" className="sr-only">Select field</label>
          <select
            id="field-select"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            title="Select field"
            aria-label="Select field"
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="">Select Field</option>
            {fields.map(field => (
              <option key={field.id} value={field.id} className="bg-gray-800">
                {field.field_name}
              </option>
            ))}
          </select>
          <GlassButton
            variant="ghost"
            onClick={loadMonitoringData}
            disabled={data.isLoading || !selectedField}
          >
            {data.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
          </GlassButton>
        </div>
      </div>

      {/* Model Status */}
      {modelStatus && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">AI Models Status</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className={cn(
                'flex items-center space-x-1',
                modelStatus.diseaseModel ? 'text-green-400' : 'text-red-400'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  modelStatus.diseaseModel ? 'bg-green-400' : 'bg-red-400'
                )} />
                <span>Disease Detection</span>
              </div>
              <div className={cn(
                'flex items-center space-x-1',
                modelStatus.ndviModel ? 'text-green-400' : 'text-red-400'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  modelStatus.ndviModel ? 'bg-green-400' : 'bg-red-400'
                )} />
                <span>NDVI Analysis</span>
              </div>
              <div className={cn(
                'flex items-center space-x-1',
                modelStatus.yieldModel ? 'text-green-400' : 'text-red-400'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  modelStatus.yieldModel ? 'bg-green-400' : 'bg-red-400'
                )} />
                <span>Yield Prediction</span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'diseases', label: 'Disease Detection', icon: Bug },
          { key: 'satellite', label: 'Satellite Analysis', icon: Satellite },
          { key: 'sensors', label: 'IoT Sensors', icon: Thermometer },
          { key: 'predictions', label: 'AI Predictions', icon: Target }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as 'overview' | 'diseases' | 'satellite' | 'sensors' | 'predictions')}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedTab === key 
                ? 'bg-white/10 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {data.satelliteAnalysis?.ndviScore.toFixed(2) || 'N/A'}
              </div>
              <div className="text-xs text-gray-300">NDVI Score</div>
            </GlassCard>
            
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {data.diseaseDetections.length}
              </div>
              <div className="text-xs text-gray-300">Detections</div>
            </GlassCard>
            
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {data.sensorData.length}
              </div>
              <div className="text-xs text-gray-300">Active Sensors</div>
            </GlassCard>
            
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {data.predictions.length}
              </div>
              <div className="text-xs text-gray-300">AI Predictions</div>
            </GlassCard>
          </div>

          {/* Satellite Health Overview */}
          {data.satelliteAnalysis && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Satellite className="h-5 w-5 text-blue-400" />
                <span>Field Health</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Vegetation Health</span>
                  <span className={cn('font-medium capitalize', getHealthColor(data.satelliteAnalysis.vegetationHealth))}>
                    {data.satelliteAnalysis.vegetationHealth}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Growth Stage</span>
                  <span className="text-white font-medium capitalize">
                    {data.satelliteAnalysis.growthStage.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Crop Density</span>
                  <span className="text-white font-medium">
                    {(data.satelliteAnalysis.cropDensity * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Predicted Yield</span>
                    <span className="text-green-400 font-bold">
                      {data.satelliteAnalysis.yieldPrediction.estimatedYield.toLocaleString()} {data.satelliteAnalysis.yieldPrediction.unit}
                    </span>
                  </div>
                  <progress
                    className="progress progress--green"
                    max={100}
                    value={data.satelliteAnalysis.yieldPrediction.confidence * 100}
                    aria-label="Predicted yield confidence"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Confidence: {(data.satelliteAnalysis.yieldPrediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Recent Disease Detections */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Bug className="h-5 w-5 text-red-400" />
              <span>Recent Detections</span>
            </h3>
            
            {data.diseaseDetections.length > 0 ? (
              <div className="space-y-3">
                {data.diseaseDetections.slice(0, 3).map((detection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium">{detection.diseaseName}</p>
                      <p className="text-gray-400 text-sm">{detection.affectedArea}% affected area</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn('text-xs px-2 py-1 rounded-full', getSeverityColor(detection.severity))}>
                        {detection.severity}
                      </span>
                      <span className="text-gray-300 text-sm">
                        {(detection.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No diseases detected</p>
              </div>
            )}
          </GlassCard>

          {/* Sensor Status */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-purple-400" />
              <span>Sensor Status</span>
            </h3>
            
            <div className="space-y-3">
              {data.sensorData.map((sensor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {sensor.sensorType === 'soil_moisture' && <Droplets className="h-4 w-4 text-blue-400" />}
                    {sensor.sensorType === 'temperature' && <Thermometer className="h-4 w-4 text-red-400" />}
                    {sensor.sensorType === 'humidity' && <Activity className="h-4 w-4 text-green-400" />}
                    <span className="text-gray-300 capitalize text-sm">
                      {sensor.sensorType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      {sensor.value}{sensor.unit}
                    </span>
                    <span className={cn('text-xs px-2 py-1 rounded-full', getSensorStatusColor(sensor.status))}>
                      {sensor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Disease Detection Tab */}
      {selectedTab === 'diseases' && (
        <div className="space-y-6">
          {/* Image Capture Section */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Disease Detection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload/Camera Controls */}
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <label htmlFor="disease-upload" className="sr-only">Upload crop image</label>
                  <input
                    id="disease-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <GlassButton
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageCapture.analyzing}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </GlassButton>
                  
                  <GlassButton
                    variant="ghost"
                    onClick={imageCapture.isCapturing ? captureImage : startCamera}
                    disabled={imageCapture.analyzing}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {imageCapture.isCapturing ? 'Capture' : 'Camera'}
                  </GlassButton>
                </div>

                {/* Camera/Preview */}
                <div className="relative bg-black/20 rounded-lg overflow-hidden aspect-4-3">
                  {imageCapture.isCapturing ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : imageCapture.previewUrl ? (
                    <img
                      src={imageCapture.previewUrl}
                      alt="Crop preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No image selected</p>
                      </div>
                    </div>
                  )}
                  
                  {imageCapture.analyzing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                        <p>Analyzing image...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Detection Results */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Detection Results</h4>
                
                {data.diseaseDetections.length > 0 ? (
                  <div className="space-y-3">
                    {data.diseaseDetections.map((detection, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="text-white font-medium">{detection.diseaseName}</h5>
                            <p className="text-gray-400 text-sm">
                              Confidence: {(detection.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <span className={cn('text-xs px-2 py-1 rounded-full', getSeverityColor(detection.severity))}>
                            {detection.severity}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-gray-300 text-sm font-medium">Symptoms:</p>
                            <ul className="text-gray-400 text-sm list-disc list-inside">
                              {detection.symptoms.map((symptom, i) => (
                                <li key={i}>{symptom}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <p className="text-gray-300 text-sm font-medium">Recommendations:</p>
                            <ul className="text-gray-400 text-sm list-disc list-inside">
                              {detection.recommendations.slice(0, 2).map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Bug className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Upload or capture an image to detect diseases</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Satellite Analysis Tab */}
      {selectedTab === 'satellite' && data.satelliteAnalysis && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Satellite Analysis</h3>
              <GlassButton
                variant="ghost"
                onClick={refreshSatelliteData}
                disabled={data.isLoading}
              >
                {data.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
              </GlassButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* NDVI Score */}
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {data.satelliteAnalysis.ndviScore.toFixed(3)}
                </div>
                <div className="text-gray-300 text-sm">NDVI Score</div>
                <progress
                  className="progress progress--green mt-3"
                  max={100}
                  value={(data.satelliteAnalysis.ndviScore + 1) * 50}
                  aria-label="NDVI score"
                />
              </div>

              {/* Vegetation Health */}
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className={cn('text-2xl font-bold mb-2 capitalize', getHealthColor(data.satelliteAnalysis.vegetationHealth))}>
                  {data.satelliteAnalysis.vegetationHealth}
                </div>
                <div className="text-gray-300 text-sm">Vegetation Health</div>
                <div className="flex justify-center mt-3">
                  <Leaf className={cn('h-8 w-8', getHealthColor(data.satelliteAnalysis.vegetationHealth))} />
                </div>
              </div>

              {/* Yield Prediction */}
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {data.satelliteAnalysis.yieldPrediction.estimatedYield.toLocaleString()}
                </div>
                <div className="text-gray-300 text-sm">
                  Predicted Yield ({data.satelliteAnalysis.yieldPrediction.unit})
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {(data.satelliteAnalysis.yieldPrediction.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
            </div>

            {/* Stress Indicators */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-4">Stress Indicators</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Water Stress</span>
                    <span className="text-blue-400 font-medium">
                      {(data.satelliteAnalysis.stressIndicators.waterStress * 100).toFixed(0)}%
                    </span>
                  </div>
                  <progress
                    className="progress progress--blue mt-2"
                    max={100}
                    value={data.satelliteAnalysis.stressIndicators.waterStress * 100}
                    aria-label="Water stress"
                  />
                </div>

                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Nutrient Deficiency</span>
                    <span className="text-yellow-400 font-medium">
                      {(data.satelliteAnalysis.stressIndicators.nutrientDeficiency * 100).toFixed(0)}%
                    </span>
                  </div>
                  <progress
                    className="progress progress--yellow mt-2"
                    max={100}
                    value={data.satelliteAnalysis.stressIndicators.nutrientDeficiency * 100}
                    aria-label="Nutrient deficiency"
                  />
                </div>

                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Disease Risk</span>
                    <span className="text-red-400 font-medium">
                      {(data.satelliteAnalysis.stressIndicators.diseaseRisk * 100).toFixed(0)}%
                    </span>
                  </div>
                  <progress
                    className="progress progress--red mt-2"
                    max={100}
                    value={data.satelliteAnalysis.stressIndicators.diseaseRisk * 100}
                    aria-label="Disease risk"
                  />
                </div>
              </div>
            </div>

            {/* Change from Previous */}
            {data.satelliteAnalysis.changeFromPrevious && (
              <div className="mt-6 bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Trend Analysis</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">
                    Change from {data.satelliteAnalysis.changeFromPrevious.daysCompared} days ago
                  </span>
                  <div className="flex items-center space-x-2">
                    {data.satelliteAnalysis.changeFromPrevious.healthTrend === 'improving' ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : data.satelliteAnalysis.changeFromPrevious.healthTrend === 'declining' ? (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    ) : (
                      <Activity className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={cn(
                      'font-medium',
                      data.satelliteAnalysis.changeFromPrevious.healthTrend === 'improving' ? 'text-green-400' :
                      data.satelliteAnalysis.changeFromPrevious.healthTrend === 'declining' ? 'text-red-400' :
                      'text-gray-400'
                    )}>
                      {data.satelliteAnalysis.changeFromPrevious.healthTrend}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* IoT Sensors Tab */}
      {selectedTab === 'sensors' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">IoT Sensor Data</h3>
              <GlassButton
                variant="ghost"
                onClick={processSensorData}
                disabled={data.sensorData.length === 0}
              >
                <Brain className="h-4 w-4 mr-2" />
                Analyze Data
              </GlassButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.sensorData.map((sensor, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {sensor.sensorType === 'soil_moisture' && <Droplets className="h-5 w-5 text-blue-400" />}
                      {sensor.sensorType === 'temperature' && <Thermometer className="h-5 w-5 text-red-400" />}
                      {sensor.sensorType === 'humidity' && <Activity className="h-5 w-5 text-green-400" />}
                      <span className="text-white font-medium capitalize">
                        {sensor.sensorType.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={cn('text-xs px-2 py-1 rounded-full', getSensorStatusColor(sensor.status))}>
                      {sensor.status}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {sensor.value}{sensor.unit}
                    </div>
                    <div className="text-xs text-gray-400">
                      Updated: {sensor.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-xs text-gray-400 mb-1">Sensor ID: {sensor.sensorId}</div>
                    {sensor.calibrationDate && (
                      <div className="text-xs text-gray-400">
                        Last calibrated: {sensor.calibrationDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {data.sensorData.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Thermometer className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No IoT sensors connected</p>
                <p className="text-sm mt-2">Connect sensors to monitor field conditions in real-time</p>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* AI Predictions Tab */}
      {selectedTab === 'predictions' && (
        <div className="space-y-6">
          {data.predictions.map((prediction, index) => (
            <GlassCard key={index} className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-400" />
                <span className="capitalize">{prediction.predictionType.replace('_', ' ')}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Predictions Timeline */}
                <div>
                  <h4 className="text-white font-medium mb-3">Predictions</h4>
                  <div className="space-y-3">
                    {prediction.predictions.slice(0, 5).map((pred, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div>
                          <div className="text-white font-medium">
                            {pred.date.toLocaleDateString()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Confidence: {(pred.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-400 font-bold">
                            {prediction.predictionType === 'yield_forecast' 
                              ? `${pred.value.toLocaleString()} kg`
                              : `${(pred.value * 100).toFixed(0)}%`
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-white font-medium mb-3">AI Recommendations</h4>
                  <div className="space-y-2">
                    {prediction.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start space-x-2 p-3 bg-black/20 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                    <div className="text-purple-400 text-sm font-medium">Model Accuracy</div>
                    <div className="text-white font-bold">
                      {(prediction.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}

          {data.predictions.length === 0 && (
            <GlassCard className="p-12 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-lg text-gray-300">No predictions available</p>
              <p className="text-sm text-gray-400 mt-2">
                AI predictions will appear here once sufficient data is collected
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Last Updated */}
      {data.lastUpdated && (
        <div className="text-center text-gray-400 text-sm">
          Last updated: {data.lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default CropMonitoringDashboard;
