import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar,
  Clock,
  Plus,
  Leaf,
  Sun,
  Cloud,
  Droplets,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Thermometer,
  Target,
  Brain,
  Bell,
  MapPin,
  Sprout,
  TreePine,
  Scissors,
  Package
} from 'lucide-react';

interface CropSchedule {
  id: string;
  cropName: string;
  variety: string;
  plantingDate: Date;
  transplantingDate?: Date;
  harvestDate: Date;
  fieldLocation: string;
  area: number; // hectares
  seedQuantity: number;
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'overdue';
  growthStages: {
    stage: string;
    startDate: Date;
    endDate: Date;
    activities: string[];
    completed: boolean;
  }[];
  weatherRequirements: {
    minTemp: number;
    maxTemp: number;
    rainfall: number;
    sunlight: number;
  };
  notes: string;
  aiRecommendations: string[];
}

interface SeasonalGuide {
  season: string;
  months: string[];
  recommendedCrops: {
    crop: string;
    variety: string[];
    plantingWindow: string;
    harvestWindow: string;
    advantages: string[];
    considerations: string[];
  }[];
  weatherPattern: {
    temperature: string;
    rainfall: string;
    conditions: string[];
  };
}

interface PlantingAlert {
  id: string;
  type: 'planting' | 'transplanting' | 'harvest' | 'maintenance' | 'weather';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  dueDate: Date;
  cropScheduleId?: string;
  actionRequired: string;
  dismissed: boolean;
}

const seasonalGuides: SeasonalGuide[] = [
  {
    season: 'Dry Season (December - March)',
    months: ['December', 'January', 'February', 'March'],
    recommendedCrops: [
      {
        crop: 'Tomatoes',
        variety: ['Determinate varieties', 'Heat-tolerant hybrids'],
        plantingWindow: 'December - January',
        harvestWindow: 'March - April',
        advantages: ['Lower pest pressure', 'Better fruit quality', 'Easier harvesting'],
        considerations: ['Requires irrigation', 'Mulching essential', 'Monitor soil moisture']
      },
      {
        crop: 'Onions',
        variety: ['Short-day varieties', 'Storage onions'],
        plantingWindow: 'December - February',
        harvestWindow: 'April - May',
        advantages: ['Cool season crop', 'Good storage quality', 'Market prices higher'],
        considerations: ['Need consistent moisture', 'Bulb formation sensitive to day length']
      },
      {
        crop: 'Irish Potatoes',
        variety: ['Early varieties', 'Disease-resistant'],
        plantingWindow: 'January - February',
        harvestWindow: 'April - May',
        advantages: ['Cool weather preferred', 'Lower disease pressure', 'Quick turnaround'],
        considerations: ['Avoid late planting', 'Ensure seed quality', 'Hill properly']
      }
    ],
    weatherPattern: {
      temperature: '18-28°C',
      rainfall: 'Low (0-50mm/month)',
      conditions: ['Clear skies', 'Low humidity', 'Minimal cloud cover']
    }
  },
  {
    season: 'Long Rains (March - June)',
    months: ['March', 'April', 'May', 'June'],
    recommendedCrops: [
      {
        crop: 'Maize',
        variety: ['Long-season varieties', 'High-yielding hybrids'],
        plantingWindow: 'March - April',
        harvestWindow: 'August - September',
        advantages: ['Adequate rainfall', 'Good growing conditions', 'Main season crop'],
        considerations: ['Plant early for best yields', 'Watch for pests', 'Proper spacing important']
      },
      {
        crop: 'Beans',
        variety: ['Climbing beans', 'Bush beans'],
        plantingWindow: 'March - May',
        harvestWindow: 'June - August',
        advantages: ['Nitrogen fixation', 'Intercropping possible', 'Good protein source'],
        considerations: ['Avoid waterlogged soils', 'Support climbing varieties', 'Harvest timely']
      },
      {
        crop: 'Sweet Potatoes',
        variety: ['Orange-fleshed', 'Traditional varieties'],
        plantingWindow: 'April - May',
        harvestWindow: 'September - October',
        advantages: ['Drought tolerant once established', 'Nutritious', 'Good storage'],
        considerations: ['Use clean planting material', 'Ridge planting preferred', 'Weed control crucial']
      }
    ],
    weatherPattern: {
      temperature: '20-30°C',
      rainfall: 'High (100-200mm/month)',
      conditions: ['Frequent showers', 'High humidity', 'Cloudy periods']
    }
  },
  {
    season: 'Dry Spell (July - September)',
    months: ['July', 'August', 'September'],
    recommendedCrops: [
      {
        crop: 'Kale (Sukuma Wiki)',
        variety: ['Hybrid varieties', 'Traditional varieties'],
        plantingWindow: 'July - August',
        harvestWindow: 'September - November',
        advantages: ['Quick growing', 'Continuous harvesting', 'High demand'],
        considerations: ['Requires irrigation', 'Pest management crucial', 'Succession planting']
      },
      {
        crop: 'Spinach',
        variety: ['Heat-tolerant varieties'],
        plantingWindow: 'August - September',
        harvestWindow: 'October - November',
        advantages: ['Fast growing', 'High nutrition', 'Good market prices'],
        considerations: ['Bolt in hot weather', 'Frequent watering needed', 'Shade beneficial']
      }
    ],
    weatherPattern: {
      temperature: '16-26°C',
      rainfall: 'Very low (0-30mm/month)',
      conditions: ['Dry and cool', 'Clear skies', 'Morning dew']
    }
  },
  {
    season: 'Short Rains (October - December)',
    months: ['October', 'November', 'December'],
    recommendedCrops: [
      {
        crop: 'Green Grams',
        variety: ['Early-maturing varieties'],
        plantingWindow: 'October - November',
        harvestWindow: 'December - January',
        advantages: ['Drought tolerant', 'Nitrogen fixation', 'Quick returns'],
        considerations: ['Plant early in season', 'Good for marginal areas', 'Market timing important']
      },
      {
        crop: 'Sorghum',
        variety: ['Dual-purpose varieties'],
        plantingWindow: 'October - November',
        harvestWindow: 'February - March',
        advantages: ['Drought tolerant', 'Multi-purpose crop', 'Good fodder'],
        considerations: ['Bird damage possible', 'Proper spacing needed', 'Timely weeding']
      }
    ],
    weatherPattern: {
      temperature: '20-32°C',
      rainfall: 'Moderate (50-150mm/month)',
      conditions: ['Intermittent rains', 'Variable humidity', 'Hot afternoons']
    }
  }
];

export function PlantingCalendar() {
  const [cropSchedules, setCropSchedules] = useState<CropSchedule[]>([]);
  const [plantingAlerts, setPlantingAlerts] = useState<PlantingAlert[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<CropSchedule>>({
    status: 'planned',
    weatherRequirements: { minTemp: 18, maxTemp: 30, rainfall: 100, sunlight: 8 },
    growthStages: []
  });

  useEffect(() => {
    loadSampleData();
    generateAlerts();
  }, []);

  const loadSampleData = () => {
    const sampleSchedules: CropSchedule[] = [
      {
        id: 'schedule-001',
        cropName: 'Maize',
        variety: 'H614 Hybrid',
        plantingDate: new Date('2024-03-15'),
        harvestDate: new Date('2024-08-20'),
        fieldLocation: 'Field A - Block 1',
        area: 2.5,
        seedQuantity: 25,
        status: 'growing',
        growthStages: [
          {
            stage: 'Germination',
            startDate: new Date('2024-03-15'),
            endDate: new Date('2024-03-25'),
            activities: ['Monitor soil moisture', 'Check emergence', 'Control cutworms'],
            completed: true
          },
          {
            stage: 'Vegetative Growth',
            startDate: new Date('2024-03-25'),
            endDate: new Date('2024-05-15'),
            activities: ['First top dressing', 'Weeding', 'Pest scouting'],
            completed: true
          },
          {
            stage: 'Flowering',
            startDate: new Date('2024-05-15'),
            endDate: new Date('2024-06-30'),
            activities: ['Second top dressing', 'Monitor for borers', 'Ensure adequate water'],
            completed: false
          }
        ],
        weatherRequirements: {
          minTemp: 18,
          maxTemp: 32,
          rainfall: 120,
          sunlight: 8
        },
        notes: 'Planted during optimal window. Good emergence achieved.',
        aiRecommendations: [
          'Monitor for fall armyworm during tasseling stage',
          'Apply second top dressing at knee-high stage',
          'Ensure adequate soil moisture during grain filling'
        ]
      },
      {
        id: 'schedule-002',
        cropName: 'Tomatoes',
        variety: 'Determinate Roma',
        plantingDate: new Date('2024-01-10'),
        transplantingDate: new Date('2024-02-05'),
        harvestDate: new Date('2024-04-15'),
        fieldLocation: 'Greenhouse Section B',
        area: 0.5,
        seedQuantity: 200,
        status: 'harvested',
        growthStages: [
          {
            stage: 'Seedling',
            startDate: new Date('2024-01-10'),
            endDate: new Date('2024-02-05'),
            activities: ['Seedbed preparation', 'Seedling care', 'Hardening off'],
            completed: true
          },
          {
            stage: 'Transplanting & Establishment',
            startDate: new Date('2024-02-05'),
            endDate: new Date('2024-02-20'),
            activities: ['Transplant seedlings', 'Staking', 'Mulching'],
            completed: true
          },
          {
            stage: 'Flowering & Fruiting',
            startDate: new Date('2024-02-20'),
            endDate: new Date('2024-04-15'),
            activities: ['Pruning', 'Disease control', 'Harvest management'],
            completed: true
          }
        ],
        weatherRequirements: {
          minTemp: 15,
          maxTemp: 28,
          rainfall: 80,
          sunlight: 6
        },
        notes: 'Excellent harvest achieved. High quality fruits.',
        aiRecommendations: []
      }
    ];

    setCropSchedules(sampleSchedules);
  };

  const generateAlerts = () => {
    const alerts: PlantingAlert[] = [
      {
        id: 'alert-001',
        type: 'planting',
        priority: 'high',
        title: 'Optimal Planting Window - Green Grams',
        description: 'Current weather conditions are ideal for planting green grams',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        actionRequired: 'Prepare field and plant green grams within the next week',
        dismissed: false
      },
      {
        id: 'alert-002',
        type: 'maintenance',
        priority: 'medium',
        title: 'Maize Top Dressing Due',
        description: 'Maize crop in Field A requires second fertilizer application',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        cropScheduleId: 'schedule-001',
        actionRequired: 'Apply NPK fertilizer at recommended rate',
        dismissed: false
      },
      {
        id: 'alert-003',
        type: 'weather',
        priority: 'urgent',
        title: 'Heavy Rains Forecast',
        description: 'Heavy rains expected in 2 days - prepare drainage',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        actionRequired: 'Clear drainage channels and protect young plants',
        dismissed: false
      }
    ];

    setPlantingAlerts(alerts);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'harvested': return 'bg-green-100 text-green-800';
      case 'growing': return 'bg-blue-100 text-blue-800';
      case 'planted': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addCropSchedule = () => {
    if (newSchedule.cropName && newSchedule.plantingDate && newSchedule.harvestDate) {
      const schedule: CropSchedule = {
        id: `schedule-${Date.now()}`,
        cropName: newSchedule.cropName!,
        variety: newSchedule.variety || '',
        plantingDate: newSchedule.plantingDate!,
        transplantingDate: newSchedule.transplantingDate,
        harvestDate: newSchedule.harvestDate!,
        fieldLocation: newSchedule.fieldLocation || '',
        area: newSchedule.area || 1,
        seedQuantity: newSchedule.seedQuantity || 0,
        status: 'planned',
        growthStages: newSchedule.growthStages || [],
        weatherRequirements: newSchedule.weatherRequirements!,
        notes: newSchedule.notes || '',
        aiRecommendations: []
      };

      setCropSchedules(prev => [...prev, schedule]);
      setShowAddSchedule(false);
      setNewSchedule({
        status: 'planned',
        weatherRequirements: { minTemp: 18, maxTemp: 30, rainfall: 100, sunlight: 8 },
        growthStages: []
      });
    }
  };

  const dismissAlert = (alertId: string) => {
    setPlantingAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 11 || month <= 2) return seasonalGuides[0]; // Dry Season
    if (month >= 2 && month <= 5) return seasonalGuides[1]; // Long Rains
    if (month >= 6 && month <= 8) return seasonalGuides[2]; // Dry Spell
    return seasonalGuides[3]; // Short Rains
  };

  const getMonthSchedules = (month: number, year: number) => {
    return cropSchedules.filter(schedule => {
      const plantingMonth = schedule.plantingDate.getMonth();
      const plantingYear = schedule.plantingDate.getFullYear();
      const harvestMonth = schedule.harvestDate.getMonth();
      const harvestYear = schedule.harvestDate.getFullYear();
      
      return (plantingMonth === month && plantingYear === year) ||
             (harvestMonth === month && harvestYear === year) ||
             (schedule.plantingDate <= new Date(year, month, 31) && 
              schedule.harvestDate >= new Date(year, month, 1));
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Planting Calendar System</h1>
        <p className="text-gray-600">Plan, track, and optimize your crop planting schedule</p>
      </div>

      {/* Active Alerts */}
      {plantingAlerts.filter(alert => !alert.dismissed).length > 0 && (
        <div className="mb-6 space-y-3">
          {plantingAlerts.filter(alert => !alert.dismissed).slice(0, 3).map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.priority === 'urgent' ? 'border-red-500 bg-red-50' :
              alert.priority === 'high' ? 'border-orange-500 bg-orange-50' :
              'border-yellow-500 bg-yellow-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className={`h-5 w-5 mt-1 ${
                    alert.priority === 'urgent' ? 'text-red-600' :
                    alert.priority === 'high' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                  <div>
                    <h3 className="font-medium">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <p className="text-sm font-medium mt-2">Action: {alert.actionRequired}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(alert.priority)}>
                    {alert.priority}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => dismissAlert(alert.id)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Crops</p>
                <p className="text-2xl font-bold">{cropSchedules.filter(s => s.status === 'growing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Planned</p>
                <p className="text-2xl font-bold">{cropSchedules.filter(s => s.status === 'planned').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Harvested</p>
                <p className="text-2xl font-bold">{cropSchedules.filter(s => s.status === 'harvested').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Area</p>
                <p className="text-2xl font-bold">{cropSchedules.reduce((sum, s) => sum + s.area, 0).toFixed(1)}ha</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Guide</TabsTrigger>
          <TabsTrigger value="schedules">My Schedules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
                      >
                        Previous
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getMonthSchedules(selectedMonth, selectedYear).map((schedule) => (
                      <div key={schedule.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{schedule.cropName} - {schedule.variety}</h3>
                            <p className="text-sm text-gray-600">{schedule.fieldLocation} • {schedule.area}ha</p>
                          </div>
                          <Badge className={getStatusColor(schedule.status)}>
                            {schedule.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-600">Planting Date</p>
                            <p className="font-medium">{schedule.plantingDate.toLocaleDateString()}</p>
                          </div>
                          {schedule.transplantingDate && (
                            <div>
                              <p className="text-gray-600">Transplanting</p>
                              <p className="font-medium">{schedule.transplantingDate.toLocaleDateString()}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-600">Harvest Date</p>
                            <p className="font-medium">{schedule.harvestDate.toLocaleDateString()}</p>
                          </div>
                        </div>

                        {schedule.growthStages.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-2">Growth Stages</p>
                            <div className="flex gap-2 flex-wrap">
                              {schedule.growthStages.map((stage, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline"
                                  className={stage.completed ? 'bg-green-50 text-green-700' : ''}
                                >
                                  {stage.completed && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {stage.stage}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {schedule.aiRecommendations.length > 0 && (
                          <div className="mt-3 p-2 bg-blue-50 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-1">AI Recommendations:</p>
                            <div className="space-y-1">
                              {schedule.aiRecommendations.slice(0, 2).map((rec, i) => (
                                <div key={i} className="text-sm text-blue-800 flex items-center gap-2">
                                  <Brain className="h-3 w-3" />
                                  {rec}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => setShowAddSchedule(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Crop Schedule
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Calendar
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Recommendations
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Bell className="h-4 w-4 mr-2" />
                    Set Reminders
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Season</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">{getCurrentSeason().season}</h3>
                      <p className="text-sm text-gray-600">{getCurrentSeason().weatherPattern.conditions.join(', ')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        {getCurrentSeason().weatherPattern.temperature}
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {getCurrentSeason().weatherPattern.rainfall}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Recommended Crops:</p>
                      <div className="space-y-1">
                        {getCurrentSeason().recommendedCrops.slice(0, 3).map((crop, i) => (
                          <div key={i} className="text-sm flex items-center gap-2">
                            <Leaf className="h-3 w-3 text-green-600" />
                            {crop.crop}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seasonal">
          <div className="space-y-6">
            {seasonalGuides.map((guide, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    {guide.season}
                  </CardTitle>
                  <p className="text-gray-600">Months: {guide.months.join(', ')}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Weather Pattern</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4" />
                          <span>{guide.weatherPattern.temperature}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4" />
                          <span>{guide.weatherPattern.rainfall}</span>
                        </div>
                        <div className="mt-2">
                          {guide.weatherPattern.conditions.map((condition, i) => (
                            <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-3">
                      <h3 className="font-medium mb-3">Recommended Crops</h3>
                      <div className="space-y-4">
                        {guide.recommendedCrops.map((crop, cropIndex) => (
                          <div key={cropIndex} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{crop.crop}</h4>
                              <div className="text-sm text-gray-600">
                                Plant: {crop.plantingWindow} • Harvest: {crop.harvestWindow}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-green-600 mb-1">Advantages</p>
                                {crop.advantages.map((advantage, i) => (
                                  <div key={i} className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="h-3 w-3" />
                                    {advantage}
                                  </div>
                                ))}
                              </div>
                              <div>
                                <p className="font-medium text-orange-600 mb-1">Considerations</p>
                                {crop.considerations.map((consideration, i) => (
                                  <div key={i} className="flex items-center gap-2 text-orange-700">
                                    <AlertTriangle className="h-3 w-3" />
                                    {consideration}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Varieties:</p>
                              <div className="flex flex-wrap gap-1">
                                {crop.variety.map((variety, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {variety}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Crop Schedules</CardTitle>
                  <p className="text-gray-600">Manage all your crop planting schedules</p>
                </div>
                <Button onClick={() => setShowAddSchedule(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cropSchedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{schedule.cropName} - {schedule.variety}</h3>
                        <p className="text-sm text-gray-600">
                          {schedule.fieldLocation} • {schedule.area} hectares • {schedule.seedQuantity}kg seeds
                        </p>
                      </div>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Planting Date</p>
                        <p className="font-medium">{schedule.plantingDate.toLocaleDateString()}</p>
                      </div>
                      {schedule.transplantingDate && (
                        <div>
                          <p className="text-gray-600">Transplanting</p>
                          <p className="font-medium">{schedule.transplantingDate.toLocaleDateString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Expected Harvest</p>
                        <p className="font-medium">{schedule.harvestDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-medium">
                          {Math.ceil((schedule.harvestDate.getTime() - schedule.plantingDate.getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Temperature Range</p>
                        <p className="font-medium">{schedule.weatherRequirements.minTemp}°C - {schedule.weatherRequirements.maxTemp}°C</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Rainfall Needed</p>
                        <p className="font-medium">{schedule.weatherRequirements.rainfall}mm</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Sunlight Hours</p>
                        <p className="font-medium">{schedule.weatherRequirements.sunlight}h/day</p>
                      </div>
                    </div>

                    {schedule.notes && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {schedule.notes}
                      </div>
                    )}

                    {schedule.growthStages.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">Growth Stages Progress</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {schedule.growthStages.map((stage, index) => (
                            <div key={index} className={`p-2 border rounded text-sm ${
                              stage.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                            }`}>
                              <div className="flex items-center gap-2">
                                {stage.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="font-medium">{stage.stage}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {stage.startDate.toLocaleDateString()} - {stage.endDate.toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Planting Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>On-Time Planting</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[92%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Harvest Success Rate</span>
                      <span>88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[88%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Schedule Adherence</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full w-[85%]"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">95%</p>
                      <p className="text-sm text-green-700">Long Rains Success</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">78%</p>
                      <p className="text-sm text-blue-700">Short Rains Success</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-yellow-50 rounded">
                      <p className="text-2xl font-bold text-yellow-600">82%</p>
                      <p className="text-sm text-yellow-700">Dry Season Success</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-2xl font-bold text-purple-600">12.5</p>
                      <p className="text-sm text-purple-700">Avg Yield (tons/ha)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Schedule Dialog */}
      {showAddSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Add Crop Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Crop Name</Label>
                <Input
                  value={newSchedule.cropName || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, cropName: e.target.value })}
                  placeholder="e.g., Maize"
                />
              </div>
              <div>
                <Label>Variety</Label>
                <Input
                  value={newSchedule.variety || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, variety: e.target.value })}
                  placeholder="e.g., H614 Hybrid"
                />
              </div>
              <div>
                <Label>Planting Date</Label>
                <Input
                  type="date"
                  value={newSchedule.plantingDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, plantingDate: new Date(e.target.value) })}
                />
              </div>
              <div>
                <Label>Harvest Date</Label>
                <Input
                  type="date"
                  value={newSchedule.harvestDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, harvestDate: new Date(e.target.value) })}
                />
              </div>
              <div>
                <Label>Field Location</Label>
                <Input
                  value={newSchedule.fieldLocation || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, fieldLocation: e.target.value })}
                  placeholder="e.g., Field A - Block 1"
                />
              </div>
              <div>
                <Label>Area (hectares)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newSchedule.area || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, area: parseFloat(e.target.value) })}
                  placeholder="Area in hectares"
                />
              </div>
              <div>
                <Label>Seed Quantity (kg)</Label>
                <Input
                  type="number"
                  value={newSchedule.seedQuantity || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, seedQuantity: parseInt(e.target.value) })}
                  placeholder="Seed quantity needed"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={newSchedule.notes || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                  placeholder="Additional notes about this planting schedule"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={addCropSchedule}>Add Schedule</Button>
              <Button variant="outline" onClick={() => setShowAddSchedule(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlantingCalendar;