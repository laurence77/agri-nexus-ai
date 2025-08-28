import React, { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Truck, 
  BarChart3,
  Download,
  Upload,
  Phone,
  MessageSquare,
  Alert,
  CheckCircle
} from 'lucide-react'

interface SmallholderFarm {
  id: string
  farmerName: string
  location: string
  cropTypes: string[]
  totalAcres: number
  estimatedYield: number
  contractValue: number
  status: 'active' | 'pending' | 'inactive'
  lastContact: Date
  healthScore: number
  aiAssistantConnected: boolean
  coordinates: [number, number]
}

interface AggregatorStats {
  totalFarms: number
  activeFarmers: number
  totalAcreage: number
  projectedRevenue: number
  averageYield: number
  contractsExpiring: number
}

interface BulkOperation {
  id: string
  type: 'input_distribution' | 'training' | 'payment' | 'data_collection'
  title: string
  targetFarms: string[]
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed'
  scheduledDate: Date
  progress: number
}

const AggregatorDashboard: React.FC = () => {
  const [farms, setFarms] = useState<SmallholderFarm[]>([])
  const [stats, setStats] = useState<AggregatorStats>({
    totalFarms: 0,
    activeFarmers: 0,
    totalAcreage: 0,
    projectedRevenue: 0,
    averageYield: 0,
    contractsExpiring: 0
  })
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([])
  const [selectedFarms, setSelectedFarms] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const sampleFarms: SmallholderFarm[] = useMemo(() => ([
    {
      id: 'farm-001',
      farmerName: 'John Mwangi',
      location: 'Kiambu County, Kenya',
      cropTypes: ['Maize', 'Beans'],
      totalAcres: 2.5,
      estimatedYield: 3200,
      contractValue: 15000,
      status: 'active',
      lastContact: new Date('2024-01-15'),
      healthScore: 85,
      aiAssistantConnected: true,
      coordinates: [-1.1741, 36.8216]
    },
    {
      id: 'farm-002',
      farmerName: 'Mary Achieng',
      location: 'Kisumu County, Kenya',
      cropTypes: ['Rice', 'Sugarcane'],
      totalAcres: 1.8,
      estimatedYield: 2800,
      contractValue: 12000,
      status: 'active',
      lastContact: new Date('2024-01-10'),
      healthScore: 92,
      aiAssistantConnected: false,
      coordinates: [-0.0917, 34.7680]
    },
    {
      id: 'farm-003',
      farmerName: 'Ahmed Hassan',
      location: 'Meru County, Kenya',
      cropTypes: ['Coffee', 'Bananas'],
      totalAcres: 3.2,
      estimatedYield: 4100,
      contractValue: 25000,
      status: 'pending',
      lastContact: new Date('2024-01-05'),
      healthScore: 78,
      aiAssistantConnected: true,
      coordinates: [0.0472, 37.6507]
    }
  ]), [] )

  useEffect(() => {
    setFarms(sampleFarms)
    setStats({
      totalFarms: sampleFarms.length,
      activeFarmers: sampleFarms.filter(f => f.status === 'active').length,
      totalAcreage: sampleFarms.reduce((sum, farm) => sum + farm.totalAcres, 0),
      projectedRevenue: sampleFarms.reduce((sum, farm) => sum + farm.contractValue, 0),
      averageYield: sampleFarms.reduce((sum, farm) => sum + farm.estimatedYield, 0) / sampleFarms.length,
      contractsExpiring: 2
    })
  }, [sampleFarms])

  const filteredFarms = farms.filter(farm =>
    farm.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.cropTypes.some(crop => crop.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const initiateBulkOperation = (type: BulkOperation['type']) => {
    if (selectedFarms.length === 0) {
      alert('Please select farms first')
      return
    }
    
    const newOperation: BulkOperation = {
      id: `bulk-${Date.now()}`,
      type,
      title: `${type.replace('_', ' ').toUpperCase()} - ${selectedFarms.length} farms`,
      targetFarms: [...selectedFarms],
      status: 'scheduled',
      scheduledDate: new Date(),
      progress: 0
    }
    
    setBulkOperations(prev => [newOperation, ...prev])
    setSelectedFarms([])
  }

  const connectAIAssistant = (farmId: string) => {
    setFarms(prev => prev.map(farm => 
      farm.id === farmId 
        ? { ...farm, aiAssistantConnected: true }
        : farm
    ))
  }

  const handleFarmSelection = (farmId: string) => {
    setSelectedFarms(prev => 
      prev.includes(farmId)
        ? prev.filter(id => id !== farmId)
        : [...prev, farmId]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Aggregator Dashboard</h1>
        <p className="text-gray-600">Manage your network of {stats.totalFarms} smallholder farms</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Farms</p>
                <p className="text-2xl font-bold">{stats.totalFarms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.activeFarmers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Acres</p>
                <p className="text-2xl font-bold">{stats.totalAcreage.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${(stats.projectedRevenue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Yield</p>
                <p className="text-2xl font-bold">{(stats.averageYield / 1000).toFixed(1)}T</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Alert className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Expiring</p>
                <p className="text-2xl font-bold">{stats.contractsExpiring}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="farms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="farms">Farm Network</TabsTrigger>
          <TabsTrigger value="operations">Bulk Operations</TabsTrigger>
          <TabsTrigger value="analytics">Portfolio Analytics</TabsTrigger>
          <TabsTrigger value="ai-management">AI Management</TabsTrigger>
        </TabsList>

        <TabsContent value="farms">
          <div className="space-y-6">
            {/* Farm Management Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Farm Network Management</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => initiateBulkOperation('input_distribution')}
                      disabled={selectedFarms.length === 0}
                      variant="outline"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Distribute Inputs
                    </Button>
                    <Button 
                      onClick={() => initiateBulkOperation('training')}
                      disabled={selectedFarms.length === 0}
                      variant="outline"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Schedule Training
                    </Button>
                    <Button 
                      onClick={() => initiateBulkOperation('payment')}
                      disabled={selectedFarms.length === 0}
                      variant="outline"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Payments
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Search farms by name, location, or crop..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Badge variant="secondary">
                    {selectedFarms.length} selected
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Farms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFarms.map((farm) => (
                <Card 
                  key={farm.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedFarms.includes(farm.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleFarmSelection(farm.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{farm.farmerName}</CardTitle>
                        <p className="text-sm text-gray-600">{farm.location}</p>
                      </div>
                      <div className="flex gap-1">
                        <Badge 
                          variant={farm.status === 'active' ? 'default' : 'secondary'}
                        >
                          {farm.status}
                        </Badge>
                        {farm.aiAssistantConnected && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Health Score</span>
                        <span className="font-medium">{farm.healthScore}%</span>
                      </div>
                      <Progress value={farm.healthScore} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Acres</p>
                          <p className="font-medium">{farm.totalAcres}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Est. Yield</p>
                          <p className="font-medium">{(farm.estimatedYield / 1000).toFixed(1)}T</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {farm.cropTypes.map(crop => (
                          <Badge key={crop} variant="outline" className="text-xs">
                            {crop}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          SMS
                        </Button>
                        {!farm.aiAssistantConnected && (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation()
                              connectAIAssistant(farm.id)
                            }}
                            className="flex-1"
                          >
                            Connect AI
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <p className="text-gray-600">Manage large-scale operations across multiple farms</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bulkOperations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No bulk operations scheduled. Select farms and create operations from the Farm Network tab.
                  </p>
                ) : (
                  bulkOperations.map((operation) => (
                    <div key={operation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{operation.title}</h3>
                        <Badge 
                          variant={
                            operation.status === 'completed' ? 'default' :
                            operation.status === 'in_progress' ? 'secondary' :
                            operation.status === 'failed' ? 'destructive' : 'outline'
                          }
                        >
                          {operation.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{operation.targetFarms.length} farms</span>
                        <span>Scheduled: {operation.scheduledDate.toLocaleDateString()}</span>
                      </div>
                      {operation.status === 'in_progress' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{operation.progress}%</span>
                          </div>
                          <Progress value={operation.progress} className="h-2" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        {operation.status === 'scheduled' && (
                          <Button size="sm" variant="outline">Start Now</Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Farm Health</span>
                    <span className="font-bold text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Yield Efficiency</span>
                    <span className="font-bold text-blue-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Contract Compliance</span>
                    <span className="font-bold text-purple-600">96%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>AI Adoption Rate</span>
                    <span className="font-bold text-orange-600">67%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Weather Risk</span>
                    <Badge variant="secondary">Low</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Market Risk</span>
                    <Badge variant="destructive">High</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Disease Risk</span>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Financial Risk</span>
                    <Badge variant="outline">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-management">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Management</CardTitle>
              <p className="text-gray-600">Deploy and manage AI assistants across your farm network</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Farm Manager AI</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Connected to {farms.filter(f => f.aiAssistantConnected).length} farms
                  </p>
                  <Button size="sm" className="w-full">Deploy to All</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Sales AI Agent</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Market analysis for {farms.length} farms
                  </p>
                  <Button size="sm" className="w-full">Configure</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Data Analyst AI</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Portfolio analytics and insights
                  </p>
                  <Button size="sm" className="w-full">Enable</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Compliance AI</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Automated compliance monitoring
                  </p>
                  <Button size="sm" className="w-full">Setup</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AggregatorDashboard
