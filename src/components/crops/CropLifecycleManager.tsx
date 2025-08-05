import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Seedling,
  Sprout,
  TreePine,
  Wheat,
  DollarSign,
  Calendar,
  Thermometer,
  Droplets,
  Bug,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  BarChart3,
  MapPin,
  Package,
  Calculator,
  Truck
} from 'lucide-react';

interface CropInput {
  id: string;
  name: string;
  type: 'seed' | 'fertilizer' | 'pesticide' | 'herbicide' | 'growth_regulator';
  quantity: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  applicationDate?: Date;
  applicationRate?: number;
  applicationMethod?: string;
}

interface CropFinancials {
  seedCosts: number;
  fertilizerCosts: number;
  pesticideCosts: number;
  laborCosts: number;
  equipmentCosts: number;
  irrigationCosts: number;
  totalInputCosts: number;
  expectedRevenue: number;
  projectedProfit: number;
  profitMargin: number;
}

interface GrowthStage {
  stage: 'seeding' | 'germination' | 'vegetative' | 'flowering' | 'fruit_development' | 'maturity' | 'harvest';
  name: string;
  description: string;
  daysFromPlanting: number;
  keyActivities: string[];
  commonIssues: string[];
  criticalTemperature: { min: number; max: number };
  waterRequirement: number; // mm per week
}

interface Crop {
  id: string;
  fieldId: string;
  name: string;
  variety: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  area: number; // hectares
  currentStage: GrowthStage['stage'];
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  yieldTarget: number; // tons per hectare
  actualYield?: number;
  inputs: CropInput[];
  financials: CropFinancials;
  weatherData: {
    avgTemperature: number;
    totalRainfall: number;
    sunlightHours: number;
  };
  aiRecommendations: string[];
  alerts: {
    type: 'disease' | 'pest' | 'weather' | 'nutrition' | 'irrigation';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    date: Date;
  }[];
}

const growthStages: GrowthStage[] = [
  {
    stage: 'seeding',
    name: 'Seeding',
    description: 'Seeds are planted and soil preparation is complete',
    daysFromPlanting: 0,
    keyActivities: ['Soil preparation', 'Seed planting', 'Initial irrigation'],
    commonIssues: ['Poor germination', 'Soil compaction', 'Pest damage'],
    criticalTemperature: { min: 15, max: 25 },
    waterRequirement: 25
  },
  {
    stage: 'germination',
    name: 'Germination',
    description: 'Seeds are sprouting and first leaves appear',
    daysFromPlanting: 7,
    keyActivities: ['Monitor soil moisture', 'Weed control', 'Pest monitoring'],
    commonIssues: ['Damping off', 'Cutworm damage', 'Uneven emergence'],
    criticalTemperature: { min: 18, max: 28 },
    waterRequirement: 30
  },
  {
    stage: 'vegetative',
    name: 'Vegetative Growth',
    description: 'Rapid leaf and stem development',
    daysFromPlanting: 30,
    keyActivities: ['Fertilizer application', 'Irrigation scheduling', 'Pest control'],
    commonIssues: ['Nutrient deficiency', 'Aphid infestation', 'Water stress'],
    criticalTemperature: { min: 20, max: 30 },
    waterRequirement: 40
  },
  {
    stage: 'flowering',
    name: 'Flowering',
    description: 'Plants are blooming and pollination occurs',
    daysFromPlanting: 60,
    keyActivities: ['Pollination support', 'Disease prevention', 'Water management'],
    commonIssues: ['Poor pollination', 'Fungal diseases', 'Heat stress'],
    criticalTemperature: { min: 18, max: 28 },
    waterRequirement: 50
  },
  {
    stage: 'fruit_development',
    name: 'Fruit Development',
    description: 'Fruits/grains are forming and developing',
    daysFromPlanting: 90,
    keyActivities: ['Nutrient boost', 'Support systems', 'Pest monitoring'],
    commonIssues: ['Fruit drop', 'Insect damage', 'Calcium deficiency'],
    criticalTemperature: { min: 22, max: 32 },
    waterRequirement: 45
  },
  {
    stage: 'maturity',
    name: 'Maturity',
    description: 'Crops are approaching harvest readiness',
    daysFromPlanting: 120,
    keyActivities: ['Harvest preparation', 'Quality assessment', 'Storage planning'],
    commonIssues: ['Over-ripening', 'Weather damage', 'Market timing'],
    criticalTemperature: { min: 15, max: 30 },
    waterRequirement: 20
  },
  {
    stage: 'harvest',
    name: 'Harvest',
    description: 'Crops are being harvested',
    daysFromPlanting: 130,
    keyActivities: ['Harvesting', 'Post-harvest handling', 'Storage'],
    commonIssues: ['Storage losses', 'Quality deterioration', 'Market access'],
    criticalTemperature: { min: 10, max: 35 },
    waterRequirement: 10
  }
];

export function CropLifecycleManager() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddInput, setShowAddInput] = useState(false);
  const [newInput, setNewInput] = useState<Partial<CropInput>>({
    type: 'seed',
    quantity: 0,
    costPerUnit: 0
  });

  useEffect(() => {
    loadSampleCrops();
  }, []);

  const loadSampleCrops = () => {
    const sampleCrops: Crop[] = [
      {
        id: 'crop-001',
        fieldId: 'field-001',
        name: 'Maize',
        variety: 'Hybrid H614',
        plantingDate: new Date('2024-01-15'),
        expectedHarvestDate: new Date('2024-06-15'),
        area: 2.5,
        currentStage: 'vegetative',
        healthStatus: 'good',
        yieldTarget: 8.5,
        inputs: [
          {
            id: 'inp-001',
            name: 'Hybrid Maize Seeds',
            type: 'seed',
            quantity: 25,
            unit: 'kg',
            costPerUnit: 15.50,
            supplier: 'Kenya Seed Co.',
            applicationDate: new Date('2024-01-15')
          },
          {
            id: 'inp-002',
            name: 'DAP Fertilizer',
            type: 'fertilizer',
            quantity: 100,
            unit: 'kg',
            costPerUnit: 3.20,
            supplier: 'Yara Kenya',
            applicationDate: new Date('2024-01-20'),
            applicationRate: 40,
            applicationMethod: 'Broadcasting'
          }
        ],
        financials: {
          seedCosts: 387.50,
          fertilizerCosts: 960.00,
          pesticideCosts: 240.00,
          laborCosts: 800.00,
          equipmentCosts: 300.00,
          irrigationCosts: 150.00,
          totalInputCosts: 2837.50,
          expectedRevenue: 8500.00,
          projectedProfit: 5662.50,
          profitMargin: 66.6
        },
        weatherData: {
          avgTemperature: 24.5,
          totalRainfall: 145.2,
          sunlightHours: 8.2
        },
        aiRecommendations: [
          'Apply side-dress nitrogen fertilizer at 6 weeks',
          'Monitor for fall armyworm damage',
          'Consider irrigation if rainfall drops below 25mm/week'
        ],
        alerts: [
          {
            type: 'pest',
            message: 'Fall armyworm spotted in neighboring fields',
            severity: 'medium',
            date: new Date('2024-02-10')
          }
        ]
      },
      {
        id: 'crop-002',
        fieldId: 'field-002',
        name: 'Tomatoes',
        variety: 'Roma VF',
        plantingDate: new Date('2024-02-01'),
        expectedHarvestDate: new Date('2024-05-15'),
        area: 1.0,
        currentStage: 'flowering',
        healthStatus: 'excellent',
        yieldTarget: 35.0,
        inputs: [],
        financials: {
          seedCosts: 180.00,
          fertilizerCosts: 450.00,
          pesticideCosts: 320.00,
          laborCosts: 1200.00,
          equipmentCosts: 200.00,
          irrigationCosts: 400.00,
          totalInputCosts: 2750.00,
          expectedRevenue: 17500.00,
          projectedProfit: 14750.00,
          profitMargin: 84.3
        },
        weatherData: {
          avgTemperature: 26.8,
          totalRainfall: 89.3,
          sunlightHours: 9.1
        },
        aiRecommendations: [
          'Increase calcium application to prevent blossom end rot',
          'Maintain consistent soil moisture during fruit development',
          'Scout for whitefly and apply bio-control agents'
        ],
        alerts: []
      }
    ];
    setCrops(sampleCrops);
    setSelectedCrop(sampleCrops[0]);
  };

  const getCurrentStageInfo = (stage: GrowthStage['stage']) => {
    return growthStages.find(s => s.stage === stage) || growthStages[0];
  };

  const calculateGrowthProgress = (crop: Crop) => {
    const daysFromPlanting = Math.floor(
      (Date.now() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalGrowthDays = growthStages[growthStages.length - 1].daysFromPlanting;
    return Math.min((daysFromPlanting / totalGrowthDays) * 100, 100);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addInput = () => {
    if (selectedCrop && newInput.name && newInput.quantity && newInput.costPerUnit) {
      const input: CropInput = {
        id: `inp-${Date.now()}`,
        name: newInput.name!,
        type: newInput.type!,
        quantity: newInput.quantity!,
        unit: newInput.unit || 'kg',
        costPerUnit: newInput.costPerUnit!,
        supplier: newInput.supplier || '',
        applicationDate: new Date()
      };

      const updatedCrop = {
        ...selectedCrop,
        inputs: [...selectedCrop.inputs, input]
      };

      setCrops(prev => prev.map(c => c.id === selectedCrop.id ? updatedCrop : c));
      setSelectedCrop(updatedCrop);
      setShowAddInput(false);
      setNewInput({ type: 'seed', quantity: 0, costPerUnit: 0 });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Lifecycle Management</h1>
        <p className="text-gray-600">Complete crop management from seeding to harvest</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Crop Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Active Crops</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCrop?.id === crop.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{crop.name}</h3>
                    <Badge className={getHealthStatusColor(crop.healthStatus)}>
                      {crop.healthStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{crop.variety}</p>
                  <p className="text-xs text-gray-500">{crop.area} hectares</p>
                  <Progress value={calculateGrowthProgress(crop)} className="mt-2 h-1" />
                </div>
              ))}
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New Crop
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedCrop && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="ai">AI Insights</TabsTrigger>
                <TabsTrigger value="harvest">Harvest</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  {/* Crop Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">{selectedCrop.name} - {selectedCrop.variety}</CardTitle>
                          <p className="text-gray-600">Field {selectedCrop.fieldId} • {selectedCrop.area} hectares</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getHealthStatusColor(selectedCrop.healthStatus)} variant="outline">
                            {selectedCrop.healthStatus}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            Day {Math.floor((Date.now() - selectedCrop.plantingDate.getTime()) / (1000 * 60 * 60 * 24))} of growth
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Planted</span>
                          </div>
                          <p className="text-lg font-bold">{selectedCrop.plantingDate.toLocaleDateString()}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">Harvest Due</span>
                          </div>
                          <p className="text-lg font-bold">{selectedCrop.expectedHarvestDate.toLocaleDateString()}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Target Yield</span>
                          </div>
                          <p className="text-lg font-bold">{selectedCrop.yieldTarget} t/ha</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Projected Profit</span>
                          </div>
                          <p className="text-lg font-bold">${selectedCrop.financials.projectedProfit.toFixed(0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Weather & Alerts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Current Conditions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4" />
                              Temperature
                            </span>
                            <span className="font-bold">{selectedCrop.weatherData.avgTemperature}°C</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Droplets className="h-4 w-4" />
                              Rainfall
                            </span>
                            <span className="font-bold">{selectedCrop.weatherData.totalRainfall}mm</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Wheat className="h-4 w-4" />
                              Sunlight
                            </span>
                            <span className="font-bold">{selectedCrop.weatherData.sunlightHours}h/day</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Active Alerts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedCrop.alerts.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCrop.alerts.map((alert, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-medium">{alert.message}</p>
                                  <p className="text-sm text-gray-600">{alert.date.toLocaleDateString()}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {alert.severity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p>No active alerts</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="growth">
                <Card>
                  <CardHeader>
                    <CardTitle>Growth Stage Timeline</CardTitle>
                    <p className="text-gray-600">Track crop development through growth stages</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Overall Progress</span>
                        <span className="text-sm text-gray-600">{calculateGrowthProgress(selectedCrop).toFixed(0)}% Complete</span>
                      </div>
                      <Progress value={calculateGrowthProgress(selectedCrop)} className="h-3" />
                    </div>

                    <div className="space-y-4">
                      {growthStages.map((stage, index) => {
                        const isCurrentStage = stage.stage === selectedCrop.currentStage;
                        const isCompleted = growthStages.findIndex(s => s.stage === selectedCrop.currentStage) > index;
                        
                        return (
                          <div key={stage.stage} className={`p-4 border rounded-lg ${
                            isCurrentStage ? 'bg-blue-50 border-blue-200' : 
                            isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : isCurrentStage ? (
                                  <Clock className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                                )}
                                <h3 className="font-medium">{stage.name}</h3>
                              </div>
                              <Badge variant="outline">Day {stage.daysFromPlanting}+</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="font-medium mb-1">Key Activities:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                  {stage.keyActivities.map((activity, i) => (
                                    <li key={i}>{activity}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium mb-1">Common Issues:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                  {stage.commonIssues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium mb-1">Requirements:</p>
                                <div className="space-y-1 text-gray-600">
                                  <p>Temp: {stage.criticalTemperature.min}-{stage.criticalTemperature.max}°C</p>
                                  <p>Water: {stage.waterRequirement}mm/week</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inputs">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Input Management</CardTitle>
                        <p className="text-gray-600">Track seeds, fertilizers, pesticides, and other inputs</p>
                      </div>
                      <Button onClick={() => setShowAddInput(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Input
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedCrop.inputs.map((input) => (
                        <div key={input.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Package className="h-5 w-5 text-blue-600" />
                              <h3 className="font-medium">{input.name}</h3>
                              <Badge variant="outline">{input.type}</Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${(input.quantity * input.costPerUnit).toFixed(2)}</p>
                              <p className="text-sm text-gray-600">{input.quantity} {input.unit}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Supplier: {input.supplier}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Rate: ${input.costPerUnit}/{input.unit}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Applied: {input.applicationDate?.toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {showAddInput && (
                      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-medium mb-4">Add New Input</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Input Name</Label>
                            <Input
                              value={newInput.name || ''}
                              onChange={(e) => setNewInput({ ...newInput, name: e.target.value })}
                              placeholder="e.g., NPK Fertilizer"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              value={newInput.type}
                              onChange={(e) => setNewInput({ ...newInput, type: e.target.value as CropInput['type'] })}
                              aria-label="Select input type"
                              title="Select input type"
                            >
                              <option value="seed">Seed</option>
                              <option value="fertilizer">Fertilizer</option>
                              <option value="pesticide">Pesticide</option>
                              <option value="herbicide">Herbicide</option>
                              <option value="growth_regulator">Growth Regulator</option>
                            </select>
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={newInput.quantity}
                              onChange={(e) => setNewInput({ ...newInput, quantity: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label>Unit</Label>
                            <Input
                              value={newInput.unit || ''}
                              onChange={(e) => setNewInput({ ...newInput, unit: e.target.value })}
                              placeholder="kg, liters, bags"
                            />
                          </div>
                          <div>
                            <Label>Cost per Unit ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={newInput.costPerUnit}
                              onChange={(e) => setNewInput({ ...newInput, costPerUnit: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label>Supplier</Label>
                            <Input
                              value={newInput.supplier || ''}
                              onChange={(e) => setNewInput({ ...newInput, supplier: e.target.value })}
                              placeholder="Supplier name"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button onClick={addInput}>Add Input</Button>
                          <Button variant="outline" onClick={() => setShowAddInput(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Overview</CardTitle>
                      <p className="text-gray-600">Cost breakdown and profitability analysis</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span className="font-medium">Total Costs</span>
                          </div>
                          <p className="text-2xl font-bold text-red-600">
                            ${selectedCrop.financials.totalInputCosts.toFixed(0)}
                          </p>
                          <p className="text-sm text-gray-600">All inputs</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Expected Revenue</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            ${selectedCrop.financials.expectedRevenue.toFixed(0)}
                          </p>
                          <p className="text-sm text-gray-600">At target yield</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Projected Profit</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            ${selectedCrop.financials.projectedProfit.toFixed(0)}
                          </p>
                          <p className="text-sm text-gray-600">Net income</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calculator className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Profit Margin</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedCrop.financials.profitMargin.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">ROI</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span>Seeds</span>
                                <span className="font-bold">${selectedCrop.financials.seedCosts.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Fertilizers</span>
                                <span className="font-bold">${selectedCrop.financials.fertilizerCosts.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Pesticides</span>
                                <span className="font-bold">${selectedCrop.financials.pesticideCosts.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Labor</span>
                                <span className="font-bold">${selectedCrop.financials.laborCosts.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Equipment</span>
                                <span className="font-bold">${selectedCrop.financials.equipmentCosts.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Irrigation</span>
                                <span className="font-bold">${selectedCrop.financials.irrigationCosts.toFixed(0)}</span>
                              </div>
                              <div className="border-t pt-2">
                                <div className="flex justify-between items-center font-bold">
                                  <span>Total</span>
                                  <span>${selectedCrop.financials.totalInputCosts.toFixed(0)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Break-even Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Break-even Yield (tons/ha)</p>
                                <p className="text-2xl font-bold">
                                  {(selectedCrop.financials.totalInputCosts / (selectedCrop.financials.expectedRevenue / selectedCrop.yieldTarget)).toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Price per Ton Required</p>
                                <p className="text-2xl font-bold">
                                  ${(selectedCrop.financials.totalInputCosts / selectedCrop.yieldTarget).toFixed(0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Current Market Price</p>
                                <p className="text-2xl font-bold text-green-600">
                                  ${(selectedCrop.financials.expectedRevenue / selectedCrop.yieldTarget).toFixed(0)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights & Recommendations</CardTitle>
                    <p className="text-gray-600">Data-driven recommendations for optimal crop management</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 border rounded-lg text-center">
                        <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium mb-2">Disease Risk</h3>
                        <Badge className="bg-green-100 text-green-800">Low</Badge>
                        <p className="text-sm text-gray-600 mt-2">Current conditions favor healthy growth</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <Bug className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                        <h3 className="font-medium mb-2">Pest Pressure</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                        <p className="text-sm text-gray-600 mt-2">Monitor for fall armyworm</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-medium mb-2">Water Stress</h3>
                        <Badge className="bg-blue-100 text-blue-800">Optimal</Badge>
                        <p className="text-sm text-gray-600 mt-2">Adequate moisture levels</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Current Recommendations</h3>
                      {selectedCrop.aiRecommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 border rounded-lg bg-blue-50">
                          <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p>{recommendation}</p>
                          </div>
                          <Button size="sm" variant="outline">Apply</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="harvest">
                <Card>
                  <CardHeader>
                    <CardTitle>Harvest Planning</CardTitle>
                    <p className="text-gray-600">Prepare for harvest and post-harvest activities</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Harvest Readiness</h3>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span>Days to Harvest</span>
                            <span className="font-bold text-green-600">
                              {Math.max(0, Math.ceil((selectedCrop.expectedHarvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span>Maturity Level</span>
                            <span className="font-bold">85%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Quality Grade</span>
                            <Badge className="bg-green-100 text-green-800">Grade A</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Market Information</h3>
                        <div className="p-4 border rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Current Price</span>
                              <span className="font-bold text-green-600">$1,000/ton</span>
                            </div>
                            <div className="flex justify-between">
                              <span>7-day Average</span>
                              <span>$980/ton</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Market Trend</span>
                              <Badge className="bg-green-100 text-green-800">Rising</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
                      <h3 className="font-medium mb-2">Harvest Checklist</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Equipment ready and serviced</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Storage facilities prepared</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Buyers/markets confirmed</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Weather conditions suitable</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Labor force organized</span>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

export default CropLifecycleManager;