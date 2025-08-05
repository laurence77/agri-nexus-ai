import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Calendar, 
  Thermometer, 
  Stethoscope, 
  Truck, 
  DollarSign,
  TrendingUp,
  Alert,
  Beef,
  Milk,
  Egg,
  Activity,
  MapPin,
  Camera,
  Bot
} from 'lucide-react'

interface Animal {
  id: string
  farmId: string
  tagNumber: string
  name?: string
  species: 'cattle' | 'goat' | 'sheep' | 'chicken' | 'pig' | 'duck'
  breed: string
  gender: 'male' | 'female'
  dateOfBirth: Date
  weight: number
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'sick'
  location: string
  parentId?: string
  pregnancyStatus?: 'pregnant' | 'not_pregnant' | 'lactating'
  productionData: {
    milkProduction?: number
    eggProduction?: number
    weightGain?: number
  }
  healthRecords: HealthRecord[]
  vaccinations: Vaccination[]
  treatments: Treatment[]
  feedRecords: FeedRecord[]
  financialRecords: FinancialRecord[]
  breedingHistory: BreedingRecord[]
  aiVetConnected: boolean
  lastHealthCheck: Date
  nextHealthCheck: Date
  marketValue: number
  dailyFeedCost: number
  monthlyRevenue: number
  rfidTag?: string
  gpsLocation?: { lat: number; lng: number }
}

interface HealthRecord {
  id: string
  animalId: string
  date: Date
  temperature: number
  heartRate: number
  respiratoryRate: number
  bodyConditionScore: number
  symptoms: string[]
  diagnosis?: string
  veterinarianId?: string
  aiDiagnosis?: string
  confidence: number
  images?: string[]
  notes: string
}

interface Vaccination {
  id: string
  animalId: string
  vaccine: string
  date: Date
  nextDue: Date
  batchNumber: string
  veterinarianId: string
  sideEffects?: string[]
}

interface Treatment {
  id: string
  animalId: string
  condition: string
  medication: string
  dosage: string
  startDate: Date
  endDate?: Date
  frequency: string
  veterinarianId?: string
  aiRecommended: boolean
  response: 'excellent' | 'good' | 'moderate' | 'poor' | 'none'
  notes: string
}

interface FeedRecord {
  id: string
  animalId: string
  feedType: string
  quantity: number
  unit: string
  cost: number
  date: Date
  supplier?: string
  nutritionalContent: {
    protein: number
    energy: number
    fiber: number
  }
}

interface FinancialRecord {
  id: string
  animalId: string
  type: 'income' | 'expense'
  category: 'milk_sales' | 'egg_sales' | 'meat_sales' | 'vet_costs' | 'feed_costs' | 'medication' | 'equipment'
  amount: number
  currency: string
  date: Date
  description: string
  invoiceNumber?: string
}

interface BreedingRecord {
  id: string
  femaleId: string
  maleId?: string
  breedingDate: Date
  expectedDueDate: Date
  actualBirthDate?: Date
  numberOfOffspring?: number
  complications?: string
  success: boolean
}

interface LivestockStats {
  totalAnimals: number
  healthyAnimals: number
  sickAnimals: number
  pregnantAnimals: number
  totalValue: number
  dailyMilkProduction: number
  dailyEggProduction: number
  averageWeightGain: number
  monthlyFeedCosts: number
  monthlyRevenue: number
  profitMargin: number
}

const LivestockManagement: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [stats, setStats] = useState<LivestockStats>({
    totalAnimals: 0,
    healthyAnimals: 0,
    sickAnimals: 0,
    pregnantAnimals: 0,
    totalValue: 0,
    dailyMilkProduction: 0,
    dailyEggProduction: 0,
    averageWeightGain: 0,
    monthlyFeedCosts: 0,
    monthlyRevenue: 0,
    profitMargin: 0
  })
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecies, setFilterSpecies] = useState<string>('all')
  const [showAIVet, setShowAIVet] = useState(false)
  const [showFeedDialog, setShowFeedDialog] = useState(false)
  const [showFinancialDialog, setShowFinancialDialog] = useState(false)
  const [feedData, setFeedData] = useState({ animalId: '', feedType: '', quantity: 0, cost: 0 })
  const [financialData, setFinancialData] = useState({ animalId: '', type: 'income', category: 'milk_sales', amount: 0, description: '' })

  const sampleAnimals: Animal[] = [
    {
      id: 'animal-001',
      farmId: 'farm-001',
      tagNumber: 'COW-001',
      name: 'Bessie',
      species: 'cattle',
      breed: 'Holstein Friesian',
      gender: 'female',
      dateOfBirth: new Date('2020-03-15'),
      weight: 580,
      healthStatus: 'good',
      location: 'Pasture A',
      pregnancyStatus: 'lactating',
      productionData: {
        milkProduction: 25
      },
      healthRecords: [
        {
          id: 'health-001',
          animalId: 'animal-001',
          date: new Date('2024-01-15'),
          temperature: 38.5,
          heartRate: 72,
          respiratoryRate: 24,
          bodyConditionScore: 3.5,
          symptoms: [],
          confidence: 0.95,
          notes: 'Routine health check - all normal'
        }
      ],
      vaccinations: [
        {
          id: 'vacc-001',
          animalId: 'animal-001',
          vaccine: 'FMD Vaccine',
          date: new Date('2024-01-01'),
          nextDue: new Date('2024-07-01'),
          batchNumber: 'FMD-2024-001',
          veterinarianId: 'vet-001'
        }
      ],
      treatments: [],
      feedRecords: [],
      financialRecords: [],
      breedingHistory: [],
      aiVetConnected: true,
      lastHealthCheck: new Date('2024-01-15'),
      nextHealthCheck: new Date('2024-02-15'),
      marketValue: 120000,
      dailyFeedCost: 450,
      monthlyRevenue: 18750,
      rfidTag: 'RFID-COW-001',
      gpsLocation: { lat: -1.2921, lng: 36.8219 }
    },
    {
      id: 'animal-002',
      farmId: 'farm-001',
      tagNumber: 'GOAT-001',
      name: 'Billy',
      species: 'goat',
      breed: 'Boer',
      gender: 'male',
      dateOfBirth: new Date('2022-06-10'),
      weight: 45,
      healthStatus: 'excellent',
      location: 'Pen B',
      productionData: {
        weightGain: 2.5
      },
      healthRecords: [],
      vaccinations: [],
      treatments: [],
      feedRecords: [],
      financialRecords: [],
      breedingHistory: [],
      aiVetConnected: false,
      lastHealthCheck: new Date('2024-01-10'),
      nextHealthCheck: new Date('2024-02-10'),
      marketValue: 15000,
      dailyFeedCost: 85,
      monthlyRevenue: 0,
      rfidTag: 'RFID-GOAT-001'
    },
    {
      id: 'animal-003',
      farmId: 'farm-001',
      tagNumber: 'CHICK-001',
      species: 'chicken',
      breed: 'Rhode Island Red',
      gender: 'female',
      dateOfBirth: new Date('2023-08-20'),
      weight: 2.2,
      healthStatus: 'good',
      location: 'Coop 1',
      productionData: {
        eggProduction: 0.8
      },
      healthRecords: [],
      vaccinations: [],
      treatments: [],
      feedRecords: [],
      financialRecords: [],
      breedingHistory: [],
      aiVetConnected: true,
      lastHealthCheck: new Date('2024-01-12'),
      nextHealthCheck: new Date('2024-02-12'),
      marketValue: 800,
      dailyFeedCost: 12,
      monthlyRevenue: 120,
      rfidTag: 'RFID-CHICK-001'
    }
  ]

  useEffect(() => {
    setAnimals(sampleAnimals)
    calculateStats(sampleAnimals)
  }, [])

  const calculateStats = (animalList: Animal[]) => {
    const newStats: LivestockStats = {
      totalAnimals: animalList.length,
      healthyAnimals: animalList.filter(a => ['excellent', 'good'].includes(a.healthStatus)).length,
      sickAnimals: animalList.filter(a => ['poor', 'sick'].includes(a.healthStatus)).length,
      pregnantAnimals: animalList.filter(a => a.pregnancyStatus === 'pregnant').length,
      totalValue: animalList.reduce((sum, animal) => sum + animal.marketValue, 0),
      dailyMilkProduction: animalList.reduce((sum, animal) => sum + (animal.productionData.milkProduction || 0), 0),
      dailyEggProduction: animalList.reduce((sum, animal) => sum + (animal.productionData.eggProduction || 0), 0),
      averageWeightGain: animalList.reduce((sum, animal) => sum + (animal.productionData.weightGain || 0), 0) / animalList.length
    }
    setStats(newStats)
  }

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (animal.name && animal.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecies = filterSpecies === 'all' || animal.species === filterSpecies
    return matchesSearch && matchesSpecies
  })

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-orange-100 text-orange-800'
      case 'sick': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'cattle': return <Beef className="h-4 w-4" />
      case 'goat': return <Beef className="h-4 w-4" />
      case 'sheep': return <Beef className="h-4 w-4" />
      case 'chicken': return <Egg className="h-4 w-4" />
      case 'pig': return <Beef className="h-4 w-4" />
      case 'duck': return <Egg className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const connectAIVet = (animalId: string) => {
    setAnimals(prev => prev.map(animal => 
      animal.id === animalId 
        ? { ...animal, aiVetConnected: true }
        : animal
    ))
  }

  const performHealthCheck = (animal: Animal) => {
    const newHealthRecord: HealthRecord = {
      id: `health-${Date.now()}`,
      animalId: animal.id,
      date: new Date(),
      temperature: 38.0 + Math.random() * 2,
      heartRate: 60 + Math.random() * 40,
      respiratoryRate: 20 + Math.random() * 20,
      bodyConditionScore: 2.5 + Math.random() * 2,
      symptoms: [],
      aiDiagnosis: 'Normal health parameters detected',
      confidence: 0.92,
      notes: 'AI-assisted health check completed'
    }

    setAnimals(prev => prev.map(a => 
      a.id === animal.id 
        ? {
            ...a,
            healthRecords: [...a.healthRecords, newHealthRecord],
            lastHealthCheck: new Date(),
            nextHealthCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        : a
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Livestock Management</h1>
        <p className="text-gray-600">AI-powered livestock health monitoring and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Animals</p>
                <p className="text-2xl font-bold">{stats.totalAnimals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Healthy</p>
                <p className="text-2xl font-bold">{stats.healthyAnimals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Milk className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Daily Milk</p>
                <p className="text-2xl font-bold">{stats.dailyMilkProduction}L</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${(stats.totalValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="animals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="breeding">Breeding</TabsTrigger>
          <TabsTrigger value="ai-vet">AI Vet</TabsTrigger>
        </TabsList>

        <TabsContent value="animals">
          <div className="space-y-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Animal Inventory</CardTitle>
                  <Button>Add New Animal</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Search by tag, name, or breed..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={filterSpecies}
                    onChange={(e) => setFilterSpecies(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                    aria-label="Filter by species"
                    title="Filter by species"
                  >
                    <option value="all">All Species</option>
                    <option value="cattle">Cattle</option>
                    <option value="goat">Goats</option>
                    <option value="sheep">Sheep</option>
                    <option value="chicken">Chickens</option>
                    <option value="pig">Pigs</option>
                    <option value="duck">Ducks</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Animals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnimals.map((animal) => (
                <Card 
                  key={animal.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedAnimal(animal)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSpeciesIcon(animal.species)}
                        <div>
                          <CardTitle className="text-lg">{animal.tagNumber}</CardTitle>
                          {animal.name && <p className="text-sm text-gray-600">{animal.name}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge className={getHealthStatusColor(animal.healthStatus)}>
                          {animal.healthStatus}
                        </Badge>
                        {animal.aiVetConnected && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Bot className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Breed</p>
                          <p className="font-medium">{animal.breed}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Weight</p>
                          <p className="font-medium">{animal.weight}kg</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Location</p>
                          <p className="font-medium">{animal.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Age</p>
                          <p className="font-medium">
                            {Math.floor((Date.now() - animal.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                          </p>
                        </div>
                      </div>

                      {/* Production Data */}
                      {(animal.productionData.milkProduction || animal.productionData.eggProduction) && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-600 mb-1">Daily Production</p>
                          {animal.productionData.milkProduction && (
                            <div className="flex items-center gap-1 text-sm">
                              <Milk className="h-3 w-3" />
                              {animal.productionData.milkProduction}L milk
                            </div>
                          )}
                          {animal.productionData.eggProduction && (
                            <div className="flex items-center gap-1 text-sm">
                              <Egg className="h-3 w-3" />
                              {animal.productionData.eggProduction} eggs
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            performHealthCheck(animal)
                          }}
                        >
                          <Stethoscope className="h-3 w-3 mr-1" />
                          Health Check
                        </Button>
                        {!animal.aiVetConnected && (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation()
                              connectAIVet(animal.id)
                            }}
                            className="flex-1"
                          >
                            <Bot className="h-3 w-3 mr-1" />
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

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Health Monitoring Dashboard</CardTitle>
              <p className="text-gray-600">AI-powered health analytics and alerts</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Healthy Animals</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.healthyAnimals}</p>
                  <p className="text-sm text-gray-600">{((stats.healthyAnimals / stats.totalAnimals) * 100).toFixed(1)}% of total</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Alert className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Need Attention</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{stats.sickAnimals}</p>
                  <p className="text-sm text-gray-600">Require immediate care</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Due for Check</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">5</p>
                  <p className="text-sm text-gray-600">Health checks overdue</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">AI Connected</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {animals.filter(a => a.aiVetConnected).length}
                  </p>
                  <p className="text-sm text-gray-600">Animals with AI monitoring</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Recent Health Alerts</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Alert className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Temperature Alert - COW-003</span>
                    <Badge variant="outline">2 hours ago</Badge>
                  </div>
                  <p className="text-sm text-gray-600">AI detected elevated temperature (39.5°C). Recommended immediate veterinary consultation.</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm">Contact Vet</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Vaccination Due - GOAT-002</span>
                    <Badge variant="outline">Tomorrow</Badge>
                  </div>
                  <p className="text-sm text-gray-600">PPR vaccination due for Billy (GOAT-002) on February 16, 2024.</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">Schedule</Button>
                    <Button size="sm">Mark Complete</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Production Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Daily Milk Production</span>
                    <span className="font-bold text-blue-600">{stats.dailyMilkProduction}L</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Daily Egg Production</span>
                    <span className="font-bold text-orange-600">{stats.dailyEggProduction.toFixed(1)} eggs</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Average Weight Gain</span>
                    <span className="font-bold text-green-600">{stats.averageWeightGain.toFixed(1)}kg/month</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  Production trend charts coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feed">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Feed Management</CardTitle>
                    <p className="text-gray-600">Track feed consumption, costs, and nutritional requirements</p>
                  </div>
                  <Button onClick={() => setShowFeedDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feed Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Daily Feed Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${animals.reduce((sum, animal) => sum + animal.dailyFeedCost, 0).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">Across all animals</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Monthly Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${(animals.reduce((sum, animal) => sum + animal.dailyFeedCost, 0) * 30).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">Estimated monthly</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">Feed Efficiency</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">2.8</p>
                    <p className="text-sm text-gray-600">FCR (Feed Conversion Ratio)</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Low Stock</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">3</p>
                    <p className="text-sm text-gray-600">Feed types low</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Recent Feed Records</h3>
                  <div className="border rounded-lg">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Dairy Concentrate - COW-001</p>
                          <p className="text-sm text-gray-600">25kg @ $2.50/kg - Today, 6:00 AM</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">$62.50</p>
                          <Badge variant="outline" className="text-xs">Protein: 18%</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Layer Mash - CHICK-001</p>
                          <p className="text-sm text-gray-600">2kg @ $1.20/kg - Yesterday, 6:30 AM</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">$2.40</p>
                          <Badge variant="outline" className="text-xs">Protein: 16%</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Goat Pellets - GOAT-001</p>
                          <p className="text-sm text-gray-600">5kg @ $1.80/kg - 2 days ago, 7:00 AM</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">$9.00</p>
                          <Badge variant="outline" className="text-xs">Protein: 14%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Financial Management</CardTitle>
                    <p className="text-gray-600">Track income, expenses, and profitability per animal</p>
                  </div>
                  <Button onClick={() => setShowFinancialDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Monthly Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${animals.reduce((sum, animal) => sum + animal.monthlyRevenue, 0).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">From all animals</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Monthly Costs</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      ${(animals.reduce((sum, animal) => sum + animal.dailyFeedCost, 0) * 30 + 2500).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">Feed + vet + misc</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Net Profit</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${(animals.reduce((sum, animal) => sum + animal.monthlyRevenue, 0) - (animals.reduce((sum, animal) => sum + animal.dailyFeedCost, 0) * 30 + 2500)).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">ROI</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">24%</p>
                    <p className="text-sm text-gray-600">Return on investment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Income Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Milk className="h-4 w-4" />
                            Milk Sales
                          </span>
                          <span className="font-bold text-green-600">$15,750</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Egg className="h-4 w-4" />
                            Egg Sales
                          </span>
                          <span className="font-bold text-green-600">$960</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Beef className="h-4 w-4" />
                            Meat Sales
                          </span>
                          <span className="font-bold text-green-600">$2,160</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center font-bold">
                            <span>Total Income</span>
                            <span className="text-green-600">$18,870</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Feed Costs</span>
                          <span className="font-bold text-red-600">$16,245</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Veterinary</span>
                          <span className="font-bold text-red-600">$1,200</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Labor</span>
                          <span className="font-bold text-red-600">$800</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Utilities</span>
                          <span className="font-bold text-red-600">$320</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center font-bold">
                            <span>Total Expenses</span>
                            <span className="text-red-600">$18,565</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breeding">
          <Card>
            <CardHeader>
              <CardTitle>Breeding Management</CardTitle>
              <p className="text-gray-600">Track breeding cycles and reproductive health</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Pregnant Animals</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.pregnantAnimals}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Due This Month</h3>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Breeding Success Rate</h3>
                  <p className="text-2xl font-bold text-green-600">85%</p>
                </div>
              </div>
              
              <div className="text-center text-gray-500 py-8">
                Breeding management features coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-vet">
          <Card>
            <CardHeader>
              <CardTitle>AI Veterinarian Assistant</CardTitle>
              <p className="text-gray-600">24/7 AI-powered veterinary support and diagnostics</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border rounded-lg text-center">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium mb-2">AI Diagnostics</h3>
                  <p className="text-sm text-gray-600">Instant health analysis and recommendations</p>
                  <Button size="sm" className="w-full mt-2">Configure</Button>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium mb-2">Image Analysis</h3>
                  <p className="text-sm text-gray-600">AI-powered visual health assessment</p>
                  <Button size="sm" className="w-full mt-2">Setup</Button>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <Stethoscope className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-medium mb-2">Health Monitoring</h3>
                  <p className="text-sm text-gray-600">Continuous AI health tracking</p>
                  <Button size="sm" className="w-full mt-2">Enable</Button>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <Alert className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <h3 className="font-medium mb-2">Early Warning</h3>
                  <p className="text-sm text-gray-600">Predictive health alerts</p>
                  <Button size="sm" className="w-full mt-2">Activate</Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">AI Vet Integration Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Connected Animals:</span>
                    <span className="font-medium">{animals.filter(a => a.aiVetConnected).length}/{animals.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Confidence Level:</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diagnostic Accuracy:</span>
                    <span className="font-medium">96%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LivestockManagement