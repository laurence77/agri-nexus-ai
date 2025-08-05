import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarIcon, Clock, Bell, CloudRain, Thermometer, Droplets } from 'lucide-react'

interface CropActivity {
  id: string
  farmId: string
  cropId: string
  cropName: string
  activityType: 'planting' | 'irrigation' | 'fertilization' | 'spraying' | 'weeding' | 'harvesting' | 'inspection'
  scheduledDate: Date
  actualDate?: Date
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'weather_delayed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  estimatedDuration: number
  weather_dependent: boolean
  automated: boolean
  aiRecommended: boolean
  remindersSent: number
  notes?: string
}

interface WeatherCondition {
  date: Date
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  conditions: string
  suitable_for_spraying: boolean
  suitable_for_planting: boolean
  suitable_for_harvesting: boolean
}

interface ReminderSettings {
  enabled: boolean
  methods: ('push' | 'sms' | 'email' | 'voice')[]
  advance_days: number[]
  quiet_hours: { start: string; end: string }
  language: string
}

const CropCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'season'>('month')
  const [activities, setActivities] = useState<CropActivity[]>([])
  const [weather, setWeather] = useState<WeatherCondition[]>([])
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    methods: ['push', 'sms'],
    advance_days: [1, 3, 7],
    quiet_hours: { start: '22:00', end: '06:00' },
    language: 'en'
  })

  const sampleActivities: CropActivity[] = [
    {
      id: 'act-001',
      farmId: 'farm-001',
      cropId: 'crop-001',
      cropName: 'Maize',
      activityType: 'planting',
      scheduledDate: new Date('2024-02-15'),
      status: 'scheduled',
      priority: 'high',
      description: 'Plant hybrid maize variety H614 in Field A',
      estimatedDuration: 480, // 8 hours in minutes
      weather_dependent: true,
      automated: false,
      aiRecommended: true,
      remindersSent: 0
    },
    {
      id: 'act-002',
      farmId: 'farm-001',
      cropId: 'crop-001',
      cropName: 'Maize',
      activityType: 'fertilization',
      scheduledDate: new Date('2024-03-01'),
      status: 'scheduled',
      priority: 'medium',
      description: 'Apply NPK fertilizer 17:17:17 at 50kg/acre',
      estimatedDuration: 240,
      weather_dependent: false,
      automated: true,
      aiRecommended: true,
      remindersSent: 0
    },
    {
      id: 'act-003',
      farmId: 'farm-001',
      cropId: 'crop-002',
      cropName: 'Tomatoes',
      activityType: 'spraying',
      scheduledDate: new Date('2024-02-10'),
      status: 'weather_delayed',
      priority: 'critical',
      description: 'Spray fungicide for early blight prevention',
      estimatedDuration: 120,
      weather_dependent: true,
      automated: false,
      aiRecommended: true,
      remindersSent: 2
    },
    {
      id: 'act-004',
      farmId: 'farm-001',
      cropId: 'crop-001',
      cropName: 'Maize',
      activityType: 'harvesting',
      scheduledDate: new Date('2024-06-15'),
      status: 'scheduled',
      priority: 'high',
      description: 'Harvest mature maize when moisture content is 18-20%',
      estimatedDuration: 720,
      weather_dependent: true,
      automated: false,
      aiRecommended: true,
      remindersSent: 0
    }
  ]

  const sampleWeather: WeatherCondition[] = [
    {
      date: new Date('2024-02-10'),
      temperature: 28,
      humidity: 75,
      rainfall: 15,
      windSpeed: 12,
      conditions: 'Partly Cloudy',
      suitable_for_spraying: false,
      suitable_for_planting: true,
      suitable_for_harvesting: false
    },
    {
      date: new Date('2024-02-11'),
      temperature: 26,
      humidity: 60,
      rainfall: 0,
      windSpeed: 8,
      conditions: 'Sunny',
      suitable_for_spraying: true,
      suitable_for_planting: true,
      suitable_for_harvesting: true
    }
  ]

  useEffect(() => {
    setActivities(sampleActivities)
    setWeather(sampleWeather)
  }, [])

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => 
      activity.scheduledDate.toDateString() === date.toDateString()
    )
  }

  const getActivityColor = (activity: CropActivity) => {
    switch (activity.status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'overdue': return 'bg-red-500'
      case 'weather_delayed': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const rescheduleActivity = (activityId: string, newDate: Date) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, scheduledDate: newDate, status: 'scheduled' }
        : activity
    ))
  }

  const markActivityComplete = (activityId: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, status: 'completed', actualDate: new Date() }
        : activity
    ))
  }

  const getWeatherAdvice = (activity: CropActivity) => {
    const todayWeather = weather.find(w => 
      w.date.toDateString() === activity.scheduledDate.toDateString()
    )
    
    if (!todayWeather || !activity.weather_dependent) return null

    const advice = []
    
    if (activity.activityType === 'spraying' && !todayWeather.suitable_for_spraying) {
      advice.push('Wind speed too high for spraying. Consider rescheduling.')
    }
    
    if (activity.activityType === 'planting' && !todayWeather.suitable_for_planting) {
      advice.push('Soil may be too wet for planting. Wait for better conditions.')
    }
    
    if (activity.activityType === 'harvesting' && todayWeather.rainfall > 5) {
      advice.push('Rain expected. Harvesting may need to be postponed.')
    }

    return advice.length > 0 ? advice : null
  }

  const renderCalendarGrid = () => {
    const today = new Date()
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayActivities = getActivitiesForDate(date)
      const isToday = date.toDateString() === today.toDateString()

      days.push(
        <div key={day} className={`h-32 border border-gray-200 p-2 ${isToday ? 'bg-blue-50' : ''}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayActivities.slice(0, 3).map(activity => (
              <div
                key={activity.id}
                className={`text-xs p-1 rounded text-white truncate ${getActivityColor(activity)}`}
                title={activity.description}
              >
                {activity.activityType} - {activity.cropName}
              </div>
            ))}
            {dayActivities.length > 3 && (
              <div className="text-xs text-gray-500">+{dayActivities.length - 3} more</div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Calendar</h1>
        <p className="text-gray-600">AI-powered crop scheduling with weather integration</p>
      </div>

      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="month">Month View</TabsTrigger>
            <TabsTrigger value="week">Week View</TabsTrigger>
            <TabsTrigger value="season">Season View</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Reminder Settings
            </Button>
            <Button variant="outline" size="sm">
              <CloudRain className="h-4 w-4 mr-2" />
              Weather Sync
            </Button>
          </div>
        </div>

        <TabsContent value="month">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-0 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center font-medium text-gray-600 border-b">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0">
                    {renderCalendarGrid()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getActivitiesForDate(new Date()).map(activity => (
                      <div key={activity.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{activity.cropName}</span>
                          <Badge className={getPriorityColor(activity.priority)}>
                            {activity.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Clock className="h-3 w-3" />
                          {Math.floor(activity.estimatedDuration / 60)}h {activity.estimatedDuration % 60}m
                        </div>
                        
                        {activity.aiRecommended && (
                          <Badge variant="outline" className="text-xs mb-2">
                            AI Recommended
                          </Badge>
                        )}
                        
                        {getWeatherAdvice(activity) && (
                          <div className="text-xs text-orange-600 mb-2">
                            ⚠️ {getWeatherAdvice(activity)![0]}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markActivityComplete(activity.id)}
                          >
                            Complete
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => rescheduleActivity(activity.id, new Date(Date.now() + 86400000))}
                          >
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weather Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weather Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weather.slice(0, 3).map((forecast, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{forecast.date.toLocaleDateString()}</p>
                          <p className="text-xs text-gray-600">{forecast.conditions}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            {forecast.temperature}°C
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            {forecast.rainfall}mm
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">Add Activity</Button>
                    <Button variant="outline" className="w-full" size="sm">Import Crop Template</Button>
                    <Button variant="outline" className="w-full" size="sm">Export Schedule</Button>
                    <Button variant="outline" className="w-full" size="sm">Setup AI Automation</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="week">
          <Card>
            <CardHeader>
              <CardTitle>Week View</CardTitle>
              <p className="text-gray-600">Detailed weekly schedule with hourly slots</p>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Week view implementation coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="season">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Planning</CardTitle>
              <p className="text-gray-600">Full crop cycle planning and seasonal templates</p>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Seasonal view implementation coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CropCalendar