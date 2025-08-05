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
  Heart,
  Calendar,
  Plus,
  Bell,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  Brain,
  Thermometer,
  Scale,
  Eye,
  Stethoscope,
  Baby,
  Users,
  BarChart3,
  FileText
} from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  species: 'cattle' | 'goat' | 'sheep' | 'pig' | 'poultry';
  breed: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  currentStatus: 'breeding' | 'pregnant' | 'lactating' | 'dry' | 'growing' | 'retired';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
}

interface MatingRecord {
  id: string;
  femaleId: string;
  maleId: string;
  matingDate: Date;
  matingMethod: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: 'planned' | 'completed' | 'confirmed_pregnancy' | 'delivered' | 'failed';
  pregnancyConfirmationDate?: Date;
  numberOfOffspring?: number;
  complications?: string;
  veterinarianId?: string;
  cost: number;
  notes: string;
  aiRecommendations: string[];
}

interface ReproductiveCycle {
  id: string;
  animalId: string;
  species: string;
  cycleType: 'estrus' | 'pregnancy' | 'lactation' | 'dry_period';
  startDate: Date;
  endDate?: Date;
  duration: number; // days
  stage: string;
  nextExpectedDate?: Date;
  symptoms: string[];
  observations: string[];
  treatments: {
    date: Date;
    treatment: string;
    dosage: string;
    veterinarian: string;
  }[];
  performance: {
    conception_rate?: number;
    milk_production?: number;
    weight_gain?: number;
  };
}

interface BreedingAlert {
  id: string;
  animalId: string;
  alertType: 'heat_detection' | 'pregnancy_check' | 'delivery_due' | 'health_concern' | 'vaccination_due';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  dueDate: Date;
  actionRequired: string;
  dismissed: boolean;
}

interface BreedingProgram {
  id: string;
  name: string;
  objective: string;
  targetSpecies: string;
  breedingStrategy: 'inbreeding' | 'outbreeding' | 'crossbreeding' | 'selective_breeding';
  selectionCriteria: string[];
  targetTraits: string[];
  timeframe: string;
  expectedOutcomes: string[];
  currentStatus: 'planning' | 'active' | 'completed' | 'paused';
  animals: string[];
  results: {
    matings: number;
    successful_pregnancies: number;
    offspring_born: number;
    genetic_improvement: number;
  };
}

const speciesReproductiveData = {
  cattle: {
    estrous_cycle: 21,
    gestation_period: 283,
    lactation_period: 305,
    dry_period: 60,
    breeding_age_months: 15,
    signs_of_heat: ['Mounting other animals', 'Standing to be mounted', 'Mucus discharge', 'Restlessness', 'Reduced appetite'],
    optimal_breeding_time: '12-18 hours after heat detection'
  },
  goat: {
    estrous_cycle: 21,
    gestation_period: 150,
    lactation_period: 305,
    dry_period: 60,
    breeding_age_months: 8,
    signs_of_heat: ['Tail wagging', 'Bleating', 'Mounting others', 'Swollen vulva', 'Discharge'],
    optimal_breeding_time: '12-24 hours after heat detection'
  },
  sheep: {
    estrous_cycle: 17,
    gestation_period: 147,
    lactation_period: 180,
    dry_period: 60,
    breeding_age_months: 8,
    signs_of_heat: ['Seeking male attention', 'Standing for mounting', 'Swollen vulva', 'Restlessness'],
    optimal_breeding_time: '12-18 hours after heat detection'
  },
  pig: {
    estrous_cycle: 21,
    gestation_period: 114,
    lactation_period: 35,
    dry_period: 7,
    breeding_age_months: 8,
    signs_of_heat: ['Standing reflex', 'Swollen vulva', 'Discharge', 'Restlessness', 'Loss of appetite'],
    optimal_breeding_time: '12-24 hours after heat detection'
  },
  poultry: {
    estrous_cycle: 1,
    gestation_period: 21,
    lactation_period: 0,
    dry_period: 0,
    breeding_age_months: 5,
    signs_of_heat: ['Squatting behavior', 'Increased vocalization', 'Reddened comb'],
    optimal_breeding_time: 'Morning hours'
  }
};

export function ReproductiveHealthCalendar() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [matingRecords, setMatingRecords] = useState<MatingRecord[]>([]);
  const [reproductiveCycles, setReproductiveCycles] = useState<ReproductiveCycle[]>([]);
  const [breedingAlerts, setBreedingAlerts] = useState<BreedingAlert[]>([]);
  const [breedingPrograms, setBreedingPrograms] = useState<BreedingProgram[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showAddMating, setShowAddMating] = useState(false);
  const [newMating, setNewMating] = useState<Partial<MatingRecord>>({
    matingMethod: 'natural',
    status: 'planned',
    cost: 0
  });

  useEffect(() => {
    loadSampleData();
    generateAlerts();
  }, []);

  const loadSampleData = () => {
    const sampleAnimals: Animal[] = [
      {
        id: 'cow-001',
        name: 'Bella',
        species: 'cattle',
        breed: 'Holstein Friesian',
        dateOfBirth: new Date('2020-03-15'),
        gender: 'female',
        currentStatus: 'lactating',
        healthStatus: 'excellent'
      },
      {
        id: 'cow-002',
        name: 'Luna',
        species: 'cattle',
        breed: 'Jersey',
        dateOfBirth: new Date('2019-08-22'),
        gender: 'female',
        currentStatus: 'dry',
        healthStatus: 'good'
      },
      {
        id: 'bull-001',
        name: 'Thunder',
        species: 'cattle',
        breed: 'Holstein Friesian',
        dateOfBirth: new Date('2018-11-10'),
        gender: 'male',
        currentStatus: 'breeding',
        healthStatus: 'excellent'
      },
      {
        id: 'goat-001',
        name: 'Nala',
        species: 'goat',
        breed: 'Boer',
        dateOfBirth: new Date('2021-01-20'),
        gender: 'female',
        currentStatus: 'pregnant',
        healthStatus: 'good'
      }
    ];

    const sampleMatingRecords: MatingRecord[] = [
      {
        id: 'mating-001',
        femaleId: 'cow-001',
        maleId: 'bull-001',
        matingDate: new Date('2024-01-15'),
        matingMethod: 'natural',
        expectedDeliveryDate: new Date('2024-10-25'),
        actualDeliveryDate: new Date('2024-10-22'),
        status: 'delivered',
        pregnancyConfirmationDate: new Date('2024-02-20'),
        numberOfOffspring: 1,
        cost: 500,
        notes: 'Successful natural mating. Healthy calf delivered.',
        aiRecommendations: [
          'Monitor mother and calf closely for first 48 hours',
          'Ensure colostrum intake within 6 hours',
          'Schedule post-delivery health check'
        ]
      },
      {
        id: 'mating-002',
        femaleId: 'cow-002',
        maleId: 'bull-001',
        matingDate: new Date('2024-02-10'),
        matingMethod: 'artificial_insemination',
        expectedDeliveryDate: new Date('2024-11-20'),
        status: 'confirmed_pregnancy',
        pregnancyConfirmationDate: new Date('2024-03-15'),
        cost: 200,
        notes: 'AI performed during optimal breeding window.',
        aiRecommendations: [
          'Schedule mid-pregnancy ultrasound',
          'Maintain optimal nutrition throughout pregnancy',
          'Monitor for any signs of complications'
        ]
      },
      {
        id: 'mating-003',
        femaleId: 'goat-001',
        maleId: 'buck-001',
        matingDate: new Date('2024-03-20'),
        matingMethod: 'natural',
        expectedDeliveryDate: new Date('2024-08-17'),
        status: 'confirmed_pregnancy',
        pregnancyConfirmationDate: new Date('2024-04-25'),
        cost: 150,
        notes: 'First breeding for this doe. Pregnancy confirmed.',
        aiRecommendations: [
          'Provide extra nutrition during pregnancy',
          'Monitor closely for signs of kidding',
          'Prepare kidding area in advance'
        ]
      }
    ];

    const sampleCycles: ReproductiveCycle[] = [
      {
        id: 'cycle-001',
        animalId: 'cow-002',
        species: 'cattle',
        cycleType: 'pregnancy',
        startDate: new Date('2024-02-10'),
        duration: 283,
        stage: 'Second Trimester',
        nextExpectedDate: new Date('2024-11-20'),
        symptoms: ['Increased appetite', 'Weight gain', 'Udder development'],
        observations: ['Good body condition', 'Active and alert', 'No complications noted'],
        treatments: [
          {
            date: new Date('2024-04-15'),
            treatment: 'Pregnancy vitamins',
            dosage: '50ml daily',
            veterinarian: 'Dr. Smith'
          }
        ],
        performance: {
          conception_rate: 95
        }
      }
    ];

    const samplePrograms: BreedingProgram[] = [
      {
        id: 'program-001',
        name: 'Dairy Cattle Improvement Program',
        objective: 'Improve milk production and disease resistance',
        targetSpecies: 'cattle',
        breedingStrategy: 'selective_breeding',
        selectionCriteria: ['Milk yield', 'Fat content', 'Disease resistance', 'Longevity'],
        targetTraits: ['High milk production', 'Mastitis resistance', 'Heat tolerance'],
        timeframe: '5 years',
        expectedOutcomes: ['25% increase in milk yield', 'Reduced veterinary costs', 'Improved herd health'],
        currentStatus: 'active',
        animals: ['cow-001', 'cow-002', 'bull-001'],
        results: {
          matings: 12,
          successful_pregnancies: 10,
          offspring_born: 8,
          genetic_improvement: 15
        }
      }
    ];

    setAnimals(sampleAnimals);
    setMatingRecords(sampleMatingRecords);
    setReproductiveCycles(sampleCycles);
    setBreedingPrograms(samplePrograms);
  };

  const generateAlerts = () => {
    const alerts: BreedingAlert[] = [
      {
        id: 'alert-001',
        animalId: 'cow-002',
        alertType: 'delivery_due',
        priority: 'high',
        title: 'Delivery Due Soon - Luna',
        description: 'Luna is expected to deliver within the next 7 days',
        dueDate: new Date('2024-11-20'),
        actionRequired: 'Prepare delivery area and monitor closely',
        dismissed: false
      },
      {
        id: 'alert-002',
        animalId: 'goat-001',
        alertType: 'pregnancy_check',
        priority: 'medium',
        title: 'Mid-Pregnancy Check - Nala',
        description: 'Schedule ultrasound to confirm fetal development',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        actionRequired: 'Book veterinary appointment for ultrasound',
        dismissed: false
      },
      {
        id: 'alert-003',
        animalId: 'cow-001',
        alertType: 'heat_detection',
        priority: 'high',
        title: 'Heat Cycle Expected - Bella',
        description: 'Bella is expected to come into heat in the next 3 days',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        actionRequired: 'Monitor for signs of heat and prepare for breeding',
        dismissed: false
      }
    ];

    setBreedingAlerts(alerts);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'confirmed_pregnancy': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
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

  const getAnimalStatusColor = (status: string) => {
    switch (status) {
      case 'pregnant': return 'bg-blue-100 text-blue-800';
      case 'lactating': return 'bg-green-100 text-green-800';
      case 'breeding': return 'bg-purple-100 text-purple-800';
      case 'dry': return 'bg-yellow-100 text-yellow-800';
      case 'growing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addMatingRecord = () => {
    if (newMating.femaleId && newMating.maleId && newMating.matingDate) {
      const species = animals.find(a => a.id === newMating.femaleId)?.species || 'cattle';
      const gestationDays = speciesReproductiveData[species].gestation_period;
      
      const record: MatingRecord = {
        id: `mating-${Date.now()}`,
        femaleId: newMating.femaleId!,
        maleId: newMating.maleId!,
        matingDate: newMating.matingDate!,
        matingMethod: newMating.matingMethod || 'natural',
        expectedDeliveryDate: new Date(newMating.matingDate!.getTime() + gestationDays * 24 * 60 * 60 * 1000),
        status: 'completed',
        cost: newMating.cost || 0,
        notes: newMating.notes || '',
        aiRecommendations: []
      };

      setMatingRecords(prev => [...prev, record]);
      setShowAddMating(false);
      setNewMating({
        matingMethod: 'natural',
        status: 'planned',
        cost: 0
      });
    }
  };

  const dismissAlert = (alertId: string) => {
    setBreedingAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const calculatePregnancyProgress = (mating: MatingRecord) => {
    if (mating.status !== 'confirmed_pregnancy') return 0;
    
    const today = new Date();
    const totalDays = mating.expectedDeliveryDate.getTime() - mating.matingDate.getTime();
    const elapsedDays = today.getTime() - mating.matingDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  };

  const getReproductiveMetrics = () => {
    const totalMatings = matingRecords.length;
    const successfulPregnancies = matingRecords.filter(m => 
      m.status === 'confirmed_pregnancy' || m.status === 'delivered'
    ).length;
    const deliveries = matingRecords.filter(m => m.status === 'delivered').length;
    const totalOffspring = matingRecords.reduce((sum, m) => sum + (m.numberOfOffspring || 0), 0);
    
    return {
      conceptionRate: totalMatings > 0 ? (successfulPregnancies / totalMatings * 100).toFixed(1) : '0',
      deliveryRate: successfulPregnancies > 0 ? (deliveries / successfulPregnancies * 100).toFixed(1) : '0',
      totalOffspring,
      averageOffspringPerDelivery: deliveries > 0 ? (totalOffspring / deliveries).toFixed(1) : '0'
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reproductive Health Calendar</h1>
        <p className="text-gray-600">Manage breeding schedules and reproductive health tracking</p>
      </div>

      {/* Active Alerts */}
      {breedingAlerts.filter(alert => !alert.dismissed).length > 0 && (
        <div className="mb-6 space-y-3">
          {breedingAlerts.filter(alert => !alert.dismissed).slice(0, 3).map((alert) => (
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
              <Heart className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Conception Rate</p>
                <p className="text-2xl font-bold">{getReproductiveMetrics().conceptionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Pregnancies</p>
                <p className="text-2xl font-bold">
                  {matingRecords.filter(m => m.status === 'confirmed_pregnancy').length}
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
                <p className="text-sm text-gray-600">Deliveries</p>
                <p className="text-2xl font-bold">
                  {matingRecords.filter(m => m.status === 'delivered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Offspring</p>
                <p className="text-2xl font-bold">{getReproductiveMetrics().totalOffspring}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="breeding">Breeding Records</TabsTrigger>
          <TabsTrigger value="cycles">Reproductive Cycles</TabsTrigger>
          <TabsTrigger value="programs">Breeding Programs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Breeding Calendar - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {matingRecords.filter(m => m.status !== 'failed').map((mating) => {
                      const female = animals.find(a => a.id === mating.femaleId);
                      const male = animals.find(a => a.id === mating.maleId);
                      return (
                        <div key={mating.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium">{female?.name} × {male?.name}</h3>
                              <p className="text-sm text-gray-600">
                                Mating: {mating.matingDate.toLocaleDateString()} • Expected delivery: {mating.expectedDeliveryDate.toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(mating.status)}>
                              {mating.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          {mating.status === 'confirmed_pregnancy' && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Pregnancy Progress</span>
                                <span>{Math.round(calculatePregnancyProgress(mating))}%</span>
                              </div>
                              <Progress value={calculatePregnancyProgress(mating)} className="h-2" />
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Method</p>
                              <p className="font-medium">{mating.matingMethod.replace('_', ' ')}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Cost</p>
                              <p className="font-medium">${mating.cost}</p>
                            </div>
                            {mating.numberOfOffspring && (
                              <div>
                                <p className="text-gray-600">Offspring</p>
                                <p className="font-medium">{mating.numberOfOffspring}</p>
                              </div>
                            )}
                          </div>

                          {mating.aiRecommendations.length > 0 && (
                            <div className="mt-3 p-2 bg-blue-50 rounded">
                              <p className="text-sm font-medium text-blue-900 mb-1">AI Recommendations:</p>
                              <div className="space-y-1">
                                {mating.aiRecommendations.slice(0, 2).map((rec, i) => (
                                  <div key={i} className="text-sm text-blue-800 flex items-center gap-2">
                                    <Brain className="h-3 w-3" />
                                    {rec}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  <Button className="w-full" onClick={() => setShowAddMating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Mating
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Check-up
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Health Assessment
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Breeding Guide
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-2 bg-orange-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Bell className="h-3 w-3 text-orange-600" />
                        <span className="font-medium">Luna - Delivery Due</span>
                      </div>
                      <p className="text-orange-700 mt-1">Expected: Nov 20, 2024</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">Bella - Heat Detection</span>
                      </div>
                      <p className="text-blue-700 mt-1">Expected: 3 days</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-3 w-3 text-yellow-600" />
                        <span className="font-medium">Nala - Pregnancy Check</span>
                      </div>
                      <p className="text-yellow-700 mt-1">Due: 5 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="animals">
          <Card>
            <CardHeader>
              <CardTitle>Animal Reproductive Status</CardTitle>
              <p className="text-gray-600">Monitor reproductive status of all breeding animals</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {animals.map((animal) => (
                  <div key={animal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{animal.name}</h3>
                        <p className="text-sm text-gray-600">{animal.breed} • {animal.gender}</p>
                      </div>
                      <Badge className={getAnimalStatusColor(animal.currentStatus)}>
                        {animal.currentStatus}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Age:</span>
                        <span>{Math.floor((Date.now() - animal.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Health:</span>
                        <Badge variant="outline" className={
                          animal.healthStatus === 'excellent' ? 'text-green-600' :
                          animal.healthStatus === 'good' ? 'text-blue-600' :
                          animal.healthStatus === 'fair' ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {animal.healthStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Species:</span>
                        <span>{animal.species}</span>
                      </div>
                    </div>

                    {animal.species in speciesReproductiveData && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                        <p><strong>Estrous Cycle:</strong> {speciesReproductiveData[animal.species].estrous_cycle} days</p>
                        <p><strong>Gestation:</strong> {speciesReproductiveData[animal.species].gestation_period} days</p>
                      </div>
                    )}

                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-3"
                      onClick={() => setSelectedAnimal(animal)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breeding">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Breeding Records</CardTitle>
                  <p className="text-gray-600">Complete history of all breeding activities</p>
                </div>
                <Button onClick={() => setShowAddMating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matingRecords.map((mating) => {
                  const female = animals.find(a => a.id === mating.femaleId);
                  const male = animals.find(a => a.id === mating.maleId);
                  return (
                    <div key={mating.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{female?.name} × {male?.name}</h3>
                          <p className="text-sm text-gray-600">
                            {female?.breed} × {male?.breed} • {mating.matingDate.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(mating.status)}>
                          {mating.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Mating Method</p>
                          <p className="font-medium">{mating.matingMethod.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expected Delivery</p>
                          <p className="font-medium">{mating.expectedDeliveryDate.toLocaleDateString()}</p>
                        </div>
                        {mating.actualDeliveryDate && (
                          <div>
                            <p className="text-gray-600">Actual Delivery</p>
                            <p className="font-medium">{mating.actualDeliveryDate.toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-600">Cost</p>
                          <p className="font-medium">${mating.cost}</p>
                        </div>
                      </div>

                      {mating.pregnancyConfirmationDate && (
                        <div className="mb-3 p-2 bg-green-50 rounded text-sm">
                          <strong>Pregnancy Confirmed:</strong> {mating.pregnancyConfirmationDate.toLocaleDateString()}
                        </div>
                      )}

                      {mating.numberOfOffspring && (
                        <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                          <strong>Offspring Born:</strong> {mating.numberOfOffspring} {mating.numberOfOffspring > 1 ? 'animals' : 'animal'}
                        </div>
                      )}

                      {mating.complications && (
                        <div className="mb-3 p-2 bg-red-50 rounded text-sm">
                          <strong>Complications:</strong> {mating.complications}
                        </div>
                      )}

                      {mating.notes && (
                        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                          <strong>Notes:</strong> {mating.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cycles">
          <Card>
            <CardHeader>
              <CardTitle>Reproductive Cycles</CardTitle>
              <p className="text-gray-600">Track estrus, pregnancy, and lactation cycles</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reproductiveCycles.map((cycle) => {
                  const animal = animals.find(a => a.id === cycle.animalId);
                  return (
                    <div key={cycle.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{animal?.name} - {cycle.cycleType.replace('_', ' ')}</h3>
                          <p className="text-sm text-gray-600">{cycle.species} • {cycle.stage}</p>
                        </div>
                        <Badge variant="outline">
                          {cycle.duration} days
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-medium">{cycle.startDate.toLocaleDateString()}</p>
                        </div>
                        {cycle.endDate && (
                          <div>
                            <p className="text-gray-600">End Date</p>
                            <p className="font-medium">{cycle.endDate.toLocaleDateString()}</p>
                          </div>
                        )}
                        {cycle.nextExpectedDate && (
                          <div>
                            <p className="text-gray-600">Next Expected</p>
                            <p className="font-medium">{cycle.nextExpectedDate.toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {cycle.symptoms.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Symptoms:</p>
                          <div className="flex flex-wrap gap-1">
                            {cycle.symptoms.map((symptom, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {cycle.observations.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Observations:</p>
                          <div className="space-y-1">
                            {cycle.observations.map((obs, i) => (
                              <div key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                <Eye className="h-3 w-3" />
                                {obs}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {cycle.treatments.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Treatments:</p>
                          <div className="space-y-2">
                            {cycle.treatments.map((treatment, i) => (
                              <div key={i} className="p-2 bg-blue-50 rounded text-sm">
                                <p><strong>{treatment.treatment}</strong> - {treatment.dosage}</p>
                                <p className="text-blue-700">Date: {treatment.date.toLocaleDateString()} • Vet: {treatment.veterinarian}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>Breeding Programs</CardTitle>
              <p className="text-gray-600">Manage selective breeding and genetic improvement programs</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {breedingPrograms.map((program) => (
                  <div key={program.id} className="p-6 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{program.name}</h3>
                        <p className="text-gray-600">{program.objective}</p>
                      </div>
                      <Badge className={program.currentStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {program.currentStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Program Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Species:</strong> {program.targetSpecies}</div>
                          <div><strong>Strategy:</strong> {program.breedingStrategy.replace('_', ' ')}</div>
                          <div><strong>Timeframe:</strong> {program.timeframe}</div>
                          <div><strong>Animals:</strong> {program.animals.length}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Target Traits</h4>
                        <div className="space-y-1">
                          {program.targetTraits.map((trait, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Target className="h-3 w-3 text-green-600" />
                              {trait}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-2xl font-bold text-blue-600">{program.results.matings}</p>
                        <p className="text-sm text-blue-700">Total Matings</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-2xl font-bold text-green-600">{program.results.successful_pregnancies}</p>
                        <p className="text-sm text-green-700">Pregnancies</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <p className="text-2xl font-bold text-purple-600">{program.results.offspring_born}</p>
                        <p className="text-sm text-purple-700">Offspring Born</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <p className="text-2xl font-bold text-yellow-600">{program.results.genetic_improvement}%</p>
                        <p className="text-sm text-yellow-700">Improvement</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Expected Outcomes</h4>
                      <div className="space-y-1">
                        {program.expectedOutcomes.map((outcome, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <Award className="h-3 w-3 text-gold-600" />
                            {outcome}
                          </div>
                        ))}
                      </div>
                    </div>
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
                <CardTitle>Reproductive Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Conception Rate</span>
                      <span>{getReproductiveMetrics().conceptionRate}%</span>
                    </div>
                    <Progress value={parseFloat(getReproductiveMetrics().conceptionRate)} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Delivery Success Rate</span>
                      <span>{getReproductiveMetrics().deliveryRate}%</span>
                    </div>
                    <Progress value={parseFloat(getReproductiveMetrics().deliveryRate)} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Offspring per Birth</span>
                      <span>{getReproductiveMetrics().averageOffspringPerDelivery}</span>
                    </div>
                    <Progress value={parseFloat(getReproductiveMetrics().averageOffspringPerDelivery) * 50} className="h-3" />
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
                      <p className="text-2xl font-bold text-green-600">
                        ${matingRecords.reduce((sum, m) => sum + m.cost, 0)}
                      </p>
                      <p className="text-sm text-green-700">Total Breeding Costs</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">
                        ${Math.round(matingRecords.reduce((sum, m) => sum + m.cost, 0) / Math.max(1, matingRecords.length))}
                      </p>
                      <p className="text-sm text-blue-700">Average Cost per Mating</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Natural mating: $0-100 per service</p>
                    <p>• Artificial insemination: $150-300 per service</p>
                    <p>• Pregnancy monitoring: $50-150 per check</p>
                    <p>• Delivery assistance: $200-500 per case</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Mating Record Dialog */}
      {showAddMating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Record New Mating</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Female Animal</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newMating.femaleId || ''}
                  onChange={(e) => setNewMating({ ...newMating, femaleId: e.target.value })}
                  aria-label="Select female animal"
                  title="Select female animal"
                >
                  <option value="">Select female</option>
                  {animals.filter(a => a.gender === 'female').map((animal) => (
                    <option key={animal.id} value={animal.id}>{animal.name} ({animal.breed})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Male Animal</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newMating.maleId || ''}
                  onChange={(e) => setNewMating({ ...newMating, maleId: e.target.value })}
                  aria-label="Select male animal"
                  title="Select male animal"
                >
                  <option value="">Select male</option>
                  {animals.filter(a => a.gender === 'male').map((animal) => (
                    <option key={animal.id} value={animal.id}>{animal.name} ({animal.breed})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Mating Date</Label>
                <Input
                  type="date"
                  value={newMating.matingDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setNewMating({ ...newMating, matingDate: new Date(e.target.value) })}
                />
              </div>
              <div>
                <Label>Mating Method</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newMating.matingMethod || 'natural'}
                  onChange={(e) => setNewMating({ ...newMating, matingMethod: e.target.value as any })}
                  aria-label="Select mating method"
                  title="Select mating method"
                >
                  <option value="natural">Natural Mating</option>
                  <option value="artificial_insemination">Artificial Insemination</option>
                  <option value="embryo_transfer">Embryo Transfer</option>
                </select>
              </div>
              <div>
                <Label>Cost ($)</Label>
                <Input
                  type="number"
                  value={newMating.cost || ''}
                  onChange={(e) => setNewMating({ ...newMating, cost: parseInt(e.target.value) || 0 })}
                  placeholder="Breeding cost"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={newMating.notes || ''}
                  onChange={(e) => setNewMating({ ...newMating, notes: e.target.value })}
                  placeholder="Additional notes about the mating"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={addMatingRecord}>Add Record</Button>
              <Button variant="outline" onClick={() => setShowAddMating(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReproductiveHealthCalendar;