import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Droplets, 
  Thermometer,
  Camera,
  BarChart3,
  Zap,
  CloudRain,
  Leaf,
  Bug,
  Target
} from 'lucide-react';
import { sensorAI } from '@/lib/ai/sensor-intelligence';
import { weatherIntelligence } from '@/lib/ai/weather-intelligence';
import { plantVisionAI } from '@/lib/ai/plant-vision';
import { SensorReading, Sensor } from '@/types';
import { 
  SensorAnomaly, 
  HyperLocalForecast, 
  PlantHealthAI, 
  ExtremeEvent,
  AgricultureAdvisory 
} from '@/types/ai-models';

interface AIInsightsDashboardProps {
  sensors?: Sensor[];
  sensorReadings?: SensorReading[];
  fieldLocation?: { lat: number; lng: number };
}

export default function AIInsightsDashboard({ 
  sensors = [], 
  sensorReadings = [],
  fieldLocation = { lat: -1.2921, lng: 36.8219 } // Nairobi default
}: AIInsightsDashboardProps) {
  const [anomalies, setAnomalies] = useState<SensorAnomaly[]>([]);
  const [weatherForecast, setWeatherForecast] = useState<HyperLocalForecast[]>([]);
  const [extremeEvents, setExtremeEvents] = useState<ExtremeEvent[]>([]);
  const [advisories, setAdvisories] = useState<AgricultureAdvisory[]>([]);
  const [plantHealth, setPlantHealth] = useState<PlantHealthAI | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    initializeAI();
  }, [sensorReadings, fieldLocation]);

  const initializeAI = async () => {
    setAiLoading(true);
    try {
      // Initialize AI systems
      await Promise.all([
        sensorAI.initialize(),
        weatherIntelligence.initialize(),
        plantVisionAI.initialize()
      ]);

      // Run AI analyses
      if (sensorReadings.length > 0) {
        const detectedAnomalies = await sensorAI.detectAnomalies(sensorReadings);
        setAnomalies(detectedAnomalies);
      }

      const forecast = await weatherIntelligence.generateHyperLocalForecast(fieldLocation, 72);
      setWeatherForecast(forecast);

      const events = await weatherIntelligence.detectExtremeEvents([], forecast, fieldLocation);
      setExtremeEvents(events);

      const farmingAdvisories = await weatherIntelligence.generateAgricultureAdvisories(
        forecast, 
        events,
        'vegetative'
      );
      setAdvisories(farmingAdvisories);

    } catch (error) {
      console.error('AI initialization failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    try {
      const image = await plantVisionAI.loadImageFromFile(file);
      const analysis = await plantVisionAI.analyzeImage(image);
      setPlantHealth(analysis);
    } catch (error) {
      console.error('Plant vision analysis failed:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (aiLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 animate-pulse" />
            <span>AI Systems Initializing...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={33} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Loading TensorFlow.js models and analyzing data...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{anomalies.length}</p>
                <p className="text-sm text-muted-foreground">Sensor Anomalies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CloudRain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{extremeEvents.length}</p>
                <p className="text-sm text-muted-foreground">Weather Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{advisories.length}</p>
                <p className="text-sm text-muted-foreground">AI Recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {plantHealth ? Math.round(plantHealth.diseaseDetection.confidence * 100) : '--'}%
                </p>
                <p className="text-sm text-muted-foreground">Plant Health Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Tabs */}
      <Tabs defaultValue="anomalies" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="anomalies">Sensor Intelligence</TabsTrigger>
          <TabsTrigger value="weather">Weather AI</TabsTrigger>
          <TabsTrigger value="plant-health">Plant Vision</TabsTrigger>
          <TabsTrigger value="advisories">Smart Advisories</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Sensor Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Sensor Intelligence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies.length === 0 ? (
                <p className="text-muted-foreground">No anomalies detected. All sensors operating normally.</p>
              ) : (
                <div className="space-y-3">
                  {anomalies.map((anomaly, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Sensor {anomaly.sensorId}</p>
                            <p className="text-sm">
                              Reading: {anomaly.reading} (Expected: {anomaly.expectedRange.min.toFixed(1)} - {anomaly.expectedRange.max.toFixed(1)})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {anomaly.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                            <Badge variant="outline">
                              {anomaly.type}
                            </Badge>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weather AI Tab */}
        <TabsContent value="weather" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CloudRain className="h-5 w-5" />
                  <span>3-Day Hyper-Local Forecast</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weatherForecast.slice(0, 72).filter((_, i) => i % 24 === 0).map((forecast, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">Day {index + 1}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Thermometer className="h-3 w-3" />
                            <span>{forecast.temperature.min}°-{forecast.temperature.max}°C</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Droplets className="h-3 w-3" />
                            <span>{Math.round(forecast.precipitation.probability * 100)}%</span>
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={getConfidenceColor(forecast.confidence)}>
                        {Math.round(forecast.confidence * 100)}% confident
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Extreme Weather Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {extremeEvents.length === 0 ? (
                  <p className="text-muted-foreground">No extreme weather events predicted.</p>
                ) : (
                  <div className="space-y-3">
                    {extremeEvents.map((event, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium capitalize">{event.type.replace('_', ' ')}</p>
                              <p className="text-sm">Expected: {event.timing.toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground">
                                Duration: {event.duration} hours | Prep time: {Math.round(event.preparationTime)}h
                              </p>
                            </div>
                            <Badge variant={event.probability > 0.7 ? 'destructive' : 'warning'}>
                              {Math.round(event.probability * 100)}%
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plant Vision Tab */}
        <TabsContent value="plant-health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Plant Health Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                </div>

                {plantHealth && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Disease Detection</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {plantHealth.diseaseDetection.detectedDiseases.length === 0 ? (
                            <p className="text-green-600">No diseases detected</p>
                          ) : (
                            <div className="space-y-2">
                              {plantHealth.diseaseDetection.detectedDiseases.map((disease, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{disease.name}</p>
                                    <p className="text-sm text-muted-foreground">{disease.scientificName}</p>
                                  </div>
                                  <Badge variant={disease.confidence > 0.7 ? 'destructive' : 'warning'}>
                                    {Math.round(disease.confidence * 100)}%
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Growth Stage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="font-medium">Current Stage</p>
                              <Badge variant="outline">
                                {plantHealth.growthStageDetection.currentStage}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-muted-foreground">Days to next stage</p>
                              <span className="text-sm">{plantHealth.growthStageDetection.daysToNextStage}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-muted-foreground">Development rate</p>
                              <Badge variant="secondary">
                                {plantHealth.growthStageDetection.developmentRate}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {plantHealth.diseaseDetection.treatmentRecommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Treatment Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {plantHealth.diseaseDetection.treatmentRecommendations.map((treatment, index) => (
                              <div key={index} className="p-3 border rounded">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{treatment.product}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Type: {treatment.type} | Rate: {treatment.applicationRate}
                                    </p>
                                    <p className="text-sm">
                                      Timing: {treatment.timing} | Frequency: {treatment.frequency}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">${treatment.cost}</p>
                                    <p className="text-xs text-green-600">{treatment.effectiveness}% effective</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advisories Tab */}
        <TabsContent value="advisories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Smart Agricultural Advisories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {advisories.length === 0 ? (
                <p className="text-muted-foreground">No specific advisories at this time. Continue regular farm operations.</p>
              ) : (
                <div className="space-y-4">
                  {advisories.map((advisory, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="capitalize">
                                {advisory.type}
                              </Badge>
                              <Badge variant="secondary" className={getConfidenceColor(advisory.confidence)}>
                                {Math.round(advisory.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <p className="font-medium">{advisory.recommendation}</p>
                            <p className="text-sm text-muted-foreground">
                              Timing: {advisory.timing.start.toLocaleDateString()} - {advisory.timing.end.toLocaleDateString()}
                            </p>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="font-medium">Reasoning:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {advisory.reasoning.map((reason, reasonIndex) => (
                                  <li key={reasonIndex}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Apply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Yield Predictions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">2.4 tons/ha</p>
                    <p className="text-sm text-muted-foreground">Expected yield (85% confidence)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Weather factors</span>
                      <span className="text-sm text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Soil conditions</span>
                      <span className="text-sm text-green-600">+8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Plant health</span>
                      <span className="text-sm text-yellow-600">-3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Market Intelligence</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">$485/ton</p>
                    <p className="text-sm text-muted-foreground">Predicted price at harvest</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current price</span>
                      <span className="text-sm">$420/ton</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Seasonal trend</span>
                      <span className="text-sm text-green-600">+15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Best sell window</span>
                      <span className="text-sm">Week 2-3 post-harvest</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}