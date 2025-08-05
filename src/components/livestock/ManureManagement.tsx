import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Recycle,
  Leaf,
  Plus,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Clock,
  Thermometer,
  Droplets,
  Scale,
  Truck,
  Target,
  Award,
  Brain,
  FlaskConical,
  Zap,
  TreePine
} from 'lucide-react';

interface ManureRecord {
  id: string;
  animalType: string;
  animalCount: number;
  collectionDate: Date;
  freshWeight: number; // kg
  moistureContent: number; // percentage
  location: string;
  composingStartDate?: Date;
  composingMethod: 'static' | 'turned' | 'aerated' | 'windrow';
  status: 'fresh' | 'composting' | 'curing' | 'ready' | 'applied';
  expectedReadyDate?: Date;
  actualReadyDate?: Date;
  qualityMetrics: {
    temperature: number; // °C
    ph: number;
    carbonNitrogenRatio: number;
    moisture: number; // %
    organicMatter: number; // %
  };
  nutrientContent: {
    nitrogen: number; // %
    phosphorus: number; // %
    potassium: number; // %
  };
  notes: string;
}

interface FertilizerBatch {
  id: string;
  batchName: string;
  sourceManure: string[];
  productionDate: Date;
  finalWeight: number; // kg
  qualityGrade: 'premium' | 'standard' | 'basic';
  nutrientAnalysis: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    organicMatter: number;
    ph: number;
    ec: number; // electrical conductivity
  };
  applicationRate: number; // kg per hectare
  storageLocation: string;
  expiryDate: Date;
  cost: {
    production: number;
    storage: number;
    testing: number;
    total: number;
  };
  aiRecommendations: string[];
}

interface ApplicationRecord {
  id: string;
  fertilizerId: string;
  cropType: string;
  fieldLocation: string;
  applicationDate: Date;
  amountApplied: number; // kg
  applicationMethod: 'broadcast' | 'banded' | 'foliar' | 'injection';
  soilConditions: {
    moisture: string;
    temperature: number;
    ph: number;
  };
  expectedResults: {
    yieldIncrease: number; // %
    soilImprovement: string[];
  };
  actualResults?: {
    yieldIncrease: number;
    soilHealth: string;
    cropResponse: string;
  };
  cost: number;
  notes: string;
}

interface CompostingProcess {
  id: string;
  method: string;
  description: string;
  duration: string; // weeks
  temperatureRange: string;
  turningFrequency: string;
  advantages: string[];
  disadvantages: string[];
  suitableFor: string[];
}

const compostingMethods: CompostingProcess[] = [
  {
    id: 'static-pile',
    method: 'Static Pile Composting',
    description: 'Manure is piled and left to decompose with minimal turning',
    duration: '16-20 weeks',
    temperatureRange: '40-60°C',
    turningFrequency: 'Monthly',
    advantages: ['Low labor requirement', 'Simple setup', 'Cost-effective'],
    disadvantages: ['Longer processing time', 'Potential odor issues', 'Uneven decomposition'],
    suitableFor: ['Cattle manure', 'Horse manure', 'Mixed manure']
  },
  {
    id: 'turned-windrow',
    method: 'Turned Windrow Composting',
    description: 'Manure arranged in rows and turned regularly for aeration',
    duration: '8-12 weeks',
    temperatureRange: '55-70°C',
    turningFrequency: 'Weekly',
    advantages: ['Faster processing', 'Better temperature control', 'Higher quality output'],
    disadvantages: ['Higher labor costs', 'Equipment needed', 'Weather dependent'],
    suitableFor: ['All manure types', 'Large quantities', 'Commercial operations']
  },
  {
    id: 'aerated-static',
    method: 'Aerated Static Pile',
    description: 'Air is forced through the pile using blowers',
    duration: '6-10 weeks',
    temperatureRange: '55-65°C',
    turningFrequency: 'None required',
    advantages: ['Consistent aeration', 'Reduced labor', 'Better pathogen kill'],
    disadvantages: ['Higher setup cost', 'Energy consumption', 'Equipment maintenance'],
    suitableFor: ['Poultry manure', 'High-value applications', 'Year-round operation']
  },
  {
    id: 'in-vessel',
    method: 'In-Vessel Composting',
    description: 'Composting in enclosed containers with controlled environment',
    duration: '4-8 weeks',
    temperatureRange: '60-70°C',
    turningFrequency: 'Automated',
    advantages: ['Fastest processing', 'Weather independent', 'Precise control'],
    disadvantages: ['Highest cost', 'Complex operation', 'Limited capacity'],
    suitableFor: ['Premium products', 'Research facilities', 'Urban operations']
  }
];

export function ManureManagement() {
  const [manureRecords, setManureRecords] = useState<ManureRecord[]>([]);
  const [fertilizerBatches, setFertilizerBatches] = useState<FertilizerBatch[]>([]);
  const [applicationRecords, setApplicationRecords] = useState<ApplicationRecord[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<CompostingProcess | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<ManureRecord>>({
    status: 'fresh',
    composingMethod: 'static',
    qualityMetrics: { temperature: 25, ph: 7.0, carbonNitrogenRatio: 25, moisture: 65, organicMatter: 70 },
    nutrientContent: { nitrogen: 2.5, phosphorus: 1.5, potassium: 2.0 }
  });

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const sampleManureRecords: ManureRecord[] = [
      {
        id: 'manure-001',
        animalType: 'Dairy Cattle',
        animalCount: 50,
        collectionDate: new Date('2024-01-15'),
        freshWeight: 2500,
        moistureContent: 68,
        location: 'Barn A - Collection Point 1',
        composingStartDate: new Date('2024-01-16'),
        composingMethod: 'turned',
        status: 'composting',
        expectedReadyDate: new Date('2024-03-15'),
        qualityMetrics: {
          temperature: 58,
          ph: 7.2,
          carbonNitrogenRatio: 22,
          moisture: 55,
          organicMatter: 75
        },
        nutrientContent: {
          nitrogen: 2.8,
          phosphorus: 1.6,
          potassium: 2.2
        },
        notes: 'High quality manure from well-fed dairy herd. Good C:N ratio.'
      },
      {
        id: 'manure-002',
        animalType: 'Poultry',
        animalCount: 200,
        collectionDate: new Date('2024-02-01'),
        freshWeight: 1200,
        moistureContent: 45,
        location: 'Chicken Coop 1',
        composingStartDate: new Date('2024-02-02'),
        composingMethod: 'aerated',
        status: 'ready',
        expectedReadyDate: new Date('2024-03-20'),
        actualReadyDate: new Date('2024-03-18'),
        qualityMetrics: {
          temperature: 35,
          ph: 7.8,
          carbonNitrogenRatio: 18,
          moisture: 35,
          organicMatter: 82
        },
        nutrientContent: {
          nitrogen: 4.2,
          phosphorus: 3.1,
          potassium: 2.8
        },
        notes: 'Premium poultry manure with high nitrogen content. Ready for application.'
      }
    ];

    const sampleFertilizerBatches: FertilizerBatch[] = [
      {
        id: 'batch-001',
        batchName: 'Premium Dairy Compost - Batch 1',
        sourceManure: ['manure-001'],
        productionDate: new Date('2024-03-15'),
        finalWeight: 1800,
        qualityGrade: 'premium',
        nutrientAnalysis: {
          nitrogen: 2.5,
          phosphorus: 1.4,
          potassium: 2.0,
          organicMatter: 68,
          ph: 6.8,
          ec: 2.4
        },
        applicationRate: 500,
        storageLocation: 'Compost Storage Shed A',
        expiryDate: new Date('2025-03-15'),
        cost: {
          production: 450,
          storage: 120,
          testing: 80,
          total: 650
        },
        aiRecommendations: [
          'Ideal for vegetable crops requiring balanced nutrition',
          'Apply during soil preparation for best results',
          'Store in dry conditions to maintain quality'
        ]
      }
    ];

    const sampleApplicationRecords: ApplicationRecord[] = [
      {
        id: 'app-001',
        fertilizerId: 'batch-001',
        cropType: 'Tomatoes',
        fieldLocation: 'Field C - Block 2',
        applicationDate: new Date('2024-03-20'),
        amountApplied: 750,
        applicationMethod: 'broadcast',
        soilConditions: {
          moisture: 'optimal',
          temperature: 22,
          ph: 6.5
        },
        expectedResults: {
          yieldIncrease: 25,
          soilImprovement: ['Increased organic matter', 'Better water retention', 'Enhanced microbial activity']
        },
        cost: 180,
        notes: 'Applied before transplanting. Good weather conditions.'
      }
    ];

    setManureRecords(sampleManureRecords);
    setFertilizerBatches(sampleFertilizerBatches);
    setApplicationRecords(sampleApplicationRecords);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'composting': return 'bg-blue-100 text-blue-800';
      case 'curing': return 'bg-yellow-100 text-yellow-800';
      case 'applied': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'premium': return 'bg-gold-100 text-gold-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addManureRecord = () => {
    if (newRecord.animalType && newRecord.freshWeight && newRecord.location) {
      const record: ManureRecord = {
        id: `manure-${Date.now()}`,
        animalType: newRecord.animalType!,
        animalCount: newRecord.animalCount || 1,
        collectionDate: new Date(),
        freshWeight: newRecord.freshWeight!,
        moistureContent: newRecord.moistureContent || 65,
        location: newRecord.location!,
        composingMethod: newRecord.composingMethod || 'static',
        status: 'fresh',
        qualityMetrics: newRecord.qualityMetrics!,
        nutrientContent: newRecord.nutrientContent!,
        notes: newRecord.notes || ''
      };

      setManureRecords(prev => [...prev, record]);
      setShowAddRecord(false);
      setNewRecord({
        status: 'fresh',
        composingMethod: 'static',
        qualityMetrics: { temperature: 25, ph: 7.0, carbonNitrogenRatio: 25, moisture: 65, organicMatter: 70 },
        nutrientContent: { nitrogen: 2.5, phosphorus: 1.5, potassium: 2.0 }
      });
    }
  };

  const calculateCompostingProgress = (record: ManureRecord) => {
    if (!record.composingStartDate || !record.expectedReadyDate) return 0;
    
    const startTime = record.composingStartDate.getTime();
    const endTime = record.expectedReadyDate.getTime();
    const currentTime = Date.now();
    
    const progress = ((currentTime - startTime) / (endTime - startTime)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manure Management System</h1>
        <p className="text-gray-600">Transform waste into valuable organic fertilizer</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Recycle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Manure</p>
                <p className="text-2xl font-bold">{manureRecords.reduce((sum, r) => sum + r.freshWeight, 0)}kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold">
                  {manureRecords.filter(r => r.status === 'composting').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ready Fertilizer</p>
                <p className="text-2xl font-bold">
                  {fertilizerBatches.reduce((sum, b) => sum + b.finalWeight, 0)}kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg NPK</p>
                <p className="text-2xl font-bold">
                  {fertilizerBatches.length > 0 ? 
                    ((fertilizerBatches.reduce((sum, b) => sum + b.nutrientAnalysis.nitrogen + b.nutrientAnalysis.phosphorus + b.nutrientAnalysis.potassium, 0) / fertilizerBatches.length)).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collection">Collection</TabsTrigger>
          <TabsTrigger value="composting">Composting</TabsTrigger>
          <TabsTrigger value="fertilizer">Fertilizer</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Active Composting Processes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {manureRecords.filter(r => r.status === 'composting').map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{record.animalType} Manure</h3>
                            <p className="text-sm text-gray-600">{record.freshWeight}kg • {record.composingMethod}</p>
                          </div>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{Math.round(calculateCompostingProgress(record))}%</span>
                          </div>
                          <Progress value={calculateCompostingProgress(record)} className="h-2" />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            {record.qualityMetrics.temperature}°C
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            {record.qualityMetrics.moisture}%
                          </div>
                          <div className="flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            pH {record.qualityMetrics.ph}
                          </div>
                        </div>
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
                  <Button className="w-full" onClick={() => setShowAddRecord(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manure Collection
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FlaskConical className="h-4 w-4 mr-2" />
                    Start Composting
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Application
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Recommendations
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Production Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Manure to Fertilizer</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Quality Grade</span>
                        <span>Premium</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Processing Time</span>
                        <span>8 weeks avg</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collection">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manure Collection Records</CardTitle>
                  <p className="text-gray-600">Track raw manure collection and initial processing</p>
                </div>
                <Button onClick={() => setShowAddRecord(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Collection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {manureRecords.map((record) => (
                  <div key={record.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{record.animalType} - {record.animalCount} animals</h3>
                        <p className="text-sm text-gray-600">
                          Collected: {record.collectionDate.toLocaleDateString()} • {record.location}
                        </p>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Fresh Weight</p>
                        <p className="font-medium">{record.freshWeight}kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Moisture Content</p>
                        <p className="font-medium">{record.moistureContent}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">C:N Ratio</p>
                        <p className="font-medium">{record.qualityMetrics.carbonNitrogenRatio}:1</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Method</p>
                        <p className="font-medium">{record.composingMethod}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Nitrogen</p>
                        <p className="font-medium text-green-600">{record.nutrientContent.nitrogen}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phosphorus</p>
                        <p className="font-medium text-blue-600">{record.nutrientContent.phosphorus}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Potassium</p>
                        <p className="font-medium text-purple-600">{record.nutrientContent.potassium}%</p>
                      </div>
                    </div>

                    {record.notes && (
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composting">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Composting Methods Guide</CardTitle>
                <p className="text-gray-600">Choose the best composting method for your needs</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compostingMethods.map((method) => (
                    <Card key={method.id} className="border hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{method.method}</CardTitle>
                            <p className="text-gray-600 text-sm mt-1">{method.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Duration</p>
                              <p className="font-medium">{method.duration}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Temperature</p>
                              <p className="font-medium">{method.temperatureRange}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-600 text-sm mb-2">Advantages</p>
                            <div className="space-y-1">
                              {method.advantages.slice(0, 2).map((advantage, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                                  <CheckCircle className="h-3 w-3" />
                                  {advantage}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-600 text-sm mb-2">Suitable For</p>
                            <div className="flex flex-wrap gap-1">
                              {method.suitableFor.map((item) => (
                                <Badge key={item} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedMethod(method)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fertilizer">
          <Card>
            <CardHeader>
              <CardTitle>Fertilizer Batches</CardTitle>
              <p className="text-gray-600">Ready-to-use organic fertilizer inventory</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fertilizerBatches.map((batch) => (
                  <div key={batch.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{batch.batchName}</h3>
                        <p className="text-sm text-gray-600">
                          Produced: {batch.productionDate.toLocaleDateString()} • {batch.finalWeight}kg
                        </p>
                      </div>
                      <Badge className={getGradeColor(batch.qualityGrade)}>
                        {batch.qualityGrade}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Nitrogen (N)</p>
                        <p className="font-medium text-green-600">{batch.nutrientAnalysis.nitrogen}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phosphorus (P)</p>
                        <p className="font-medium text-blue-600">{batch.nutrientAnalysis.phosphorus}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Potassium (K)</p>
                        <p className="font-medium text-purple-600">{batch.nutrientAnalysis.potassium}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Organic Matter</p>
                        <p className="font-medium">{batch.nutrientAnalysis.organicMatter}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">pH Level</p>
                        <p className="font-medium">{batch.nutrientAnalysis.ph}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Application Rate</p>
                        <p className="font-medium">{batch.applicationRate} kg/ha</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Storage Location</p>
                        <p className="font-medium">{batch.storageLocation}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Cost</p>
                        <p className="font-medium">${batch.cost.total}</p>
                      </div>
                    </div>

                    {batch.aiRecommendations.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">AI Recommendations:</p>
                        <div className="space-y-1">
                          {batch.aiRecommendations.map((rec, i) => (
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
        </TabsContent>

        <TabsContent value="application">
          <Card>
            <CardHeader>
              <CardTitle>Application Records</CardTitle>
              <p className="text-gray-600">Track fertilizer applications and results</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicationRecords.map((app) => (
                  <div key={app.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{app.cropType} - {app.fieldLocation}</h3>
                        <p className="text-sm text-gray-600">
                          Applied: {app.applicationDate.toLocaleDateString()} • {app.amountApplied}kg
                        </p>
                      </div>
                      <Badge variant="outline">
                        {app.applicationMethod}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Soil Temperature</p>
                        <p className="font-medium">{app.soilConditions.temperature}°C</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Soil pH</p>
                        <p className="font-medium">{app.soilConditions.ph}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cost</p>
                        <p className="font-medium">${app.cost}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-2">Expected Results</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-green-600" />
                            <span>Yield increase: {app.expectedResults.yieldIncrease}%</span>
                          </div>
                          {app.expectedResults.soilImprovement.slice(0, 2).map((improvement, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <TreePine className="h-3 w-3 text-green-600" />
                              <span>{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {app.actualResults && (
                        <div>
                          <p className="text-gray-600 mb-2">Actual Results</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Award className="h-3 w-3 text-blue-600" />
                              <span>Yield increase: {app.actualResults.yieldIncrease}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Leaf className="h-3 w-3 text-blue-600" />
                              <span>{app.actualResults.cropResponse}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {app.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {app.notes}
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
                <CardTitle>Production Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Manure Collection Efficiency</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Composting Success Rate</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Premium Grade Production</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Application Effectiveness</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">$1,250</p>
                      <p className="text-sm text-green-700">Revenue Generated</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">$650</p>
                      <p className="text-sm text-blue-700">Production Costs</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded text-center">
                    <p className="text-2xl font-bold text-purple-600">$600</p>
                    <p className="text-sm text-purple-700">Net Profit</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>• Production cost per kg: $0.36</p>
                    <p>• Average selling price: $0.69/kg</p>
                    <p>• Profit margin: 48%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Record Dialog */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Add Manure Collection Record</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Animal Type</Label>
                <Input
                  value={newRecord.animalType || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, animalType: e.target.value })}
                  placeholder="e.g., Dairy Cattle"
                />
              </div>
              <div>
                <Label>Animal Count</Label>
                <Input
                  type="number"
                  value={newRecord.animalCount || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, animalCount: parseInt(e.target.value) })}
                  placeholder="Number of animals"
                />
              </div>
              <div>
                <Label>Fresh Weight (kg)</Label>
                <Input
                  type="number"
                  value={newRecord.freshWeight || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, freshWeight: parseInt(e.target.value) })}
                  placeholder="Weight in kg"
                />
              </div>
              <div>
                <Label>Moisture Content (%)</Label>
                <Input
                  type="number"
                  value={newRecord.moistureContent || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, moistureContent: parseInt(e.target.value) })}
                  placeholder="Moisture percentage"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Collection Location</Label>
                <Input
                  value={newRecord.location || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, location: e.target.value })}
                  placeholder="e.g., Barn A - Collection Point 1"
                />
              </div>
              <div>
                <Label>Composting Method</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newRecord.composingMethod || 'static'}
                  onChange={(e) => setNewRecord({ ...newRecord, composingMethod: e.target.value as any })}
                  aria-label="Select composting method"
                  title="Select composting method"
                >
                  <option value="static">Static Pile</option>
                  <option value="turned">Turned Windrow</option>
                  <option value="aerated">Aerated Static</option>
                  <option value="windrow">In-Vessel</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={newRecord.notes || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  placeholder="Additional notes about the manure quality, source, etc."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={addManureRecord}>Add Record</Button>
              <Button variant="outline" onClick={() => setShowAddRecord(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManureManagement;