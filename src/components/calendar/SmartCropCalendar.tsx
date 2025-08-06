import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  CloudRain, 
  Thermometer, 
  Droplets,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  Activity,
  Target,
  MapPin,
  Sprout
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  CropCalendar, 
  AIRecommendation, 
  WeatherAlert, 
  CalendarPhase,
  PlannedActivity 
} from '@/types/smart-crop-calendar';
import { smartCropCalendarService } from '@/services/ai/smart-crop-calendar-service';
import { cropAdvisoryService } from '@/services/ai/crop-advisory-service';

interface SmartCropCalendarProps {
  calendarId?: string;
  initialCalendar?: CropCalendar;
  onCalendarUpdate?: (calendar: CropCalendar) => void;
}

const SmartCropCalendar: React.FC<SmartCropCalendarProps> = ({
  calendarId,
  initialCalendar,
  onCalendarUpdate
}) => {
  const [calendar, setCalendar] = useState<CropCalendar | null>(initialCalendar || null);
  const [selectedView, setSelectedView] = useState<'overview' | 'phases' | 'recommendations' | 'weather' | 'analytics'>('overview');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);

  useEffect(() => {
    if (calendarId && !initialCalendar) {
      loadCalendar();
    }
    if (calendar) {
      loadAIRecommendations();
    }
  }, [calendarId, calendar?.id]);

  const loadCalendar = async () => {
    setLoading(true);
    try {
      // In a real implementation, would fetch from service
      // For now, we'll simulate loading
      console.log('Loading calendar:', calendarId);
    } catch (error) {
      console.error('Failed to load calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    if (!calendar) return;

    try {
      const advisory = await cropAdvisoryService.generateCropAdvisory({
        cropCalendar: calendar,
        currentWeatherData: [], // Would provide actual weather data
        farmLocation: {
          lat: calendar.location.latitude,
          lng: calendar.location.longitude
        }
      });

      setRecommendations(advisory.recommendations);
      setWeatherAlerts(advisory.weatherAlerts);
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
    }
  };

  const handleRecommendationAction = async (recommendationId: string, action: 'accept' | 'reject' | 'modify') => {
    try {
      const updatedRecommendations = recommendations.map(rec => 
        rec.recommendation_id === recommendationId 
          ? { ...rec, status: action === 'accept' ? 'accepted' : 'rejected' }
          : rec
      );
      setRecommendations(updatedRecommendations);

      if (calendar) {
        calendar.ai_recommendations = updatedRecommendations;
        onCalendarUpdate?.(calendar);
      }
    } catch (error) {
      console.error('Failed to update recommendation:', error);
    }
  };

  const handlePhaseUpdate = async (phaseId: string, updates: Partial<CalendarPhase>) => {
    if (!calendar) return;

    const updatedPhases = calendar.phases.map(phase =>
      phase.phase_id === phaseId ? { ...phase, ...updates } : phase
    );

    const updatedCalendar = { ...calendar, phases: updatedPhases };
    setCalendar(updatedCalendar);
    onCalendarUpdate?.(updatedCalendar);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      case 'upcoming': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Overview */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              {calendar?.calendar_name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {calendar?.location.climate_zone}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {calendar?.planting_area_hectares} hectares
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{calendar?.completion_percentage}%</div>
                <div className="text-sm text-gray-500">Complete</div>
                <Progress value={calendar?.completion_percentage} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{calendar?.crop_health_score}/100</div>
                <div className="text-sm text-gray-500">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{recommendations.length}</div>
                <div className="text-sm text-gray-500">AI Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{weatherAlerts.length}</div>
                <div className="text-sm text-gray-500">Weather Alerts</div>
              </div>
            </div>

            {/* Current Phase */}
            {calendar?.current_phase && (
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Current Phase: {calendar.current_phase.phase_name}</h3>
                  <Badge className={getPhaseStatusColor(calendar.current_phase.phase_status)}>
                    {calendar.current_phase.phase_status}
                  </Badge>
                </div>
                <Progress value={calendar.current_phase.completion_percentage} className="mb-2" />
                <div className="text-sm text-gray-600">
                  Growth Stage: {calendar.current_phase.growth_stage_code}
                </div>
                <div className="text-sm text-gray-600">
                  Expected End: {new Date(calendar.current_phase.planned_end_date).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Phase Timeline */}
            <div className="space-y-2">
              <h4 className="font-medium">Phase Timeline</h4>
              {calendar?.phases.map((phase, index) => (
                <div key={phase.phase_id} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getPhaseStatusColor(phase.phase_status)}`}></div>
                  <div className="flex-1">
                    <div className="font-medium">{phase.phase_name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(phase.planned_start_date).toLocaleDateString()} - 
                      {new Date(phase.planned_end_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm">
                    {phase.completion_percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weather Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-blue-600" />
              Weather Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <Thermometer className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <div className="font-semibold">25°C</div>
                <div className="text-sm text-gray-500">Temperature</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Droplets className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <div className="font-semibold">65%</div>
                <div className="text-sm text-gray-500">Humidity</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <CloudRain className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <div className="font-semibold">2mm</div>
                <div className="text-sm text-gray-500">Rain Today</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Activity className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <div className="font-semibold">Good</div>
                <div className="text-sm text-gray-500">Conditions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.recommendation_id} className={`p-3 border rounded-lg ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {rec.confidence_score}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{rec.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleRecommendationAction(rec.recommendation_id, 'accept')}
                      className="h-6 text-xs"
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRecommendationAction(rec.recommendation_id, 'reject')}
                      className="h-6 text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No current recommendations
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weather Alerts */}
        {weatherAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Weather Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weatherAlerts.map((alert) => (
                  <Alert key={alert.alert_id} className="p-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">{alert.alert_type}</div>
                      <div className="text-sm text-gray-600">
                        Risk Level: {alert.risk_level}
                      </div>
                      <div className="text-sm text-gray-600">
                        Expected: {new Date(alert.alert_start_date).toLocaleDateString()}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Optimize Calendar
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Record Activity
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Setup Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPhases = () => (
    <div className="space-y-6">
      {calendar?.phases.map((phase) => (
        <Card key={phase.phase_id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getPhaseStatusColor(phase.phase_status)}`}></div>
                {phase.phase_name}
              </CardTitle>
              <Badge variant="outline">{phase.growth_stage_code}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div>Start: {new Date(phase.planned_start_date).toLocaleDateString()}</div>
                  <div>End: {new Date(phase.planned_end_date).toLocaleDateString()}</div>
                  <div>Duration: {Math.ceil((new Date(phase.planned_end_date).getTime() - new Date(phase.planned_start_date).getTime()) / (1000 * 60 * 60 * 24))} days</div>
                </div>
                <Progress value={phase.completion_percentage} className="mt-2" />
              </div>
              <div>
                <h4 className="font-medium mb-2">Key Indicators</h4>
                <div className="space-y-1 text-sm">
                  {phase.key_indicators.map((indicator, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {indicator}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Planned Activities */}
            {phase.planned_activities.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Planned Activities</h4>
                <div className="space-y-3">
                  {phase.planned_activities.map((activity) => (
                    <div key={activity.activity_id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{activity.activity_name}</h5>
                        <div className="flex items-center gap-2">
                          {activity.ai_recommended && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          {activity.critical_activity && (
                            <Badge variant="destructive" className="text-xs">Critical</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📅 {new Date(activity.scheduled_date).toLocaleDateString()}</span>
                        <span>⏱️ {activity.duration_hours}h</span>
                        <span>💰 ${activity.estimated_cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{recommendations.length}</div>
            <div className="text-sm text-gray-500">Total Recommendations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {recommendations.filter(r => r.status === 'accepted').length}
            </div>
            <div className="text-sm text-gray-500">Accepted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {recommendations.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(recommendations.reduce((sum, r) => sum + r.confidence_score, 0) / recommendations.length || 0)}%
            </div>
            <div className="text-sm text-gray-500">Avg Confidence</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.recommendation_id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  {recommendation.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(recommendation.priority)}>
                    {recommendation.priority}
                  </Badge>
                  <Badge variant="outline">
                    {recommendation.confidence_score}% confidence
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{recommendation.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h5 className="font-medium mb-2">Implementation Window</h5>
                  <div className="text-sm text-gray-600">
                    <div>Earliest: {new Date(recommendation.time_window.earliest_date).toLocaleDateString()}</div>
                    <div>Latest: {new Date(recommendation.time_window.latest_date).toLocaleDateString()}</div>
                    <div>Recommended: {new Date(recommendation.recommended_date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Expected Impact</h5>
                  <div className="text-sm text-gray-600">
                    <div>Yield Impact: +{recommendation.potential_yield_impact}%</div>
                    <div>Cost: ${recommendation.cost_benefit_analysis.estimated_cost}</div>
                    <div>Expected Return: ${recommendation.cost_benefit_analysis.expected_return}</div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium mb-2">Detailed Instructions</h5>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {recommendation.detailed_instructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h5 className="font-medium mb-2">Based On</h5>
                <div className="flex flex-wrap gap-2">
                  {recommendation.based_on_factors.map((factor, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => handleRecommendationAction(recommendation.recommendation_id, 'accept')}
                  className="flex-1"
                >
                  Accept Recommendation
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleRecommendationAction(recommendation.recommendation_id, 'modify')}
                >
                  Modify
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleRecommendationAction(recommendation.recommendation_id, 'reject')}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div>Loading smart crop calendar...</div>
        </div>
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No calendar data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Crop Calendar</h1>
        <p className="text-gray-600">AI-powered crop management with real-time weather integration</p>
      </div>

      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="phases">
          {renderPhases()}
        </TabsContent>

        <TabsContent value="recommendations">
          {renderRecommendations()}
        </TabsContent>

        <TabsContent value="weather">
          <Card>
            <CardHeader>
              <CardTitle>Weather Integration & Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Advanced weather integration interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Detailed analytics and reporting interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartCropCalendar;