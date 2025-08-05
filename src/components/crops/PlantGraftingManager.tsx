import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Scissors,
  TreePine,
  Plus,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Camera,
  Clock,
  Thermometer,
  Droplets,
  Leaf,
  Target,
  Award,
  BookOpen,
  Brain
} from 'lucide-react';

interface GraftingTechnique {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  successRate: number;
  timeToTake: string;
  bestSeason: string[];
  tools: string[];
  steps: string[];
  compatiblePlants: string[];
}

interface GraftingRecord {
  id: string;
  rootstock: string;
  scion: string;
  technique: string;
  graftingDate: Date;
  expectedTakeDate: Date;
  actualTakeDate?: Date;
  status: 'grafted' | 'taking' | 'successful' | 'failed' | 'monitoring';
  location: string;
  environmental: {
    temperature: number;
    humidity: number;
    lightCondition: string;
  };
  notes: string;
  photos: string[];
  aiRecommendations: string[];
}

interface PlantCompatibility {
  rootstock: string;
  scions: string[];
  compatibility: 'excellent' | 'good' | 'moderate' | 'poor';
  benefits: string[];
  challenges: string[];
  successRate: number;
}

const graftingTechniques: GraftingTechnique[] = [
  {
    id: 'whip-tongue',
    name: 'Whip and Tongue Graft',
    description: 'Most common technique for fruit trees with same diameter rootstock and scion',
    difficulty: 'intermediate',
    successRate: 85,
    timeToTake: '4-6 weeks',
    bestSeason: ['Late Winter', 'Early Spring'],
    tools: ['Sharp grafting knife', 'Grafting tape', 'Grafting wax', 'Pruning shears'],
    steps: [
      'Select healthy rootstock and scion with similar diameters',
      'Make matching diagonal cuts on both rootstock and scion',
      'Create tongue cuts on both pieces',
      'Interlock the tongue cuts firmly',
      'Wrap securely with grafting tape',
      'Apply grafting wax to seal'
    ],
    compatiblePlants: ['Apple', 'Pear', 'Citrus', 'Stone fruits']
  },
  {
    id: 'cleft-graft',
    name: 'Cleft Graft',
    description: 'Used when rootstock is much larger than scion diameter',
    difficulty: 'beginner',
    successRate: 78,
    timeToTake: '3-5 weeks',
    bestSeason: ['Late Winter', 'Early Spring'],
    tools: ['Grafting knife', 'Splitting tool', 'Grafting tape', 'Grafting wax'],
    steps: [
      'Cut rootstock horizontally',
      'Split rootstock vertically 2-3 inches deep',
      'Prepare scion with wedge-shaped cut',
      'Insert scion into cleft matching cambium layers',
      'Secure with tape and seal with wax'
    ],
    compatiblePlants: ['Apple', 'Citrus', 'Mango', 'Avocado']
  },
  {
    id: 'bark-graft',
    name: 'Bark Graft',
    description: 'Best for spring when bark slips easily, used for top-working trees',
    difficulty: 'intermediate',
    successRate: 82,
    timeToTake: '3-4 weeks',
    bestSeason: ['Spring'],
    tools: ['Sharp knife', 'Bark lifter', 'Grafting tape', 'Grafting compound'],
    steps: [
      'Cut rootstock branch cleanly',
      'Make vertical cut through bark',
      'Lift bark flaps carefully',
      'Prepare scion with long slanted cut',
      'Insert scion under bark flap',
      'Secure and seal'
    ],
    compatiblePlants: ['Apple', 'Pear', 'Cherry', 'Plum']
  },
  {
    id: 'side-graft',
    name: 'Side Veneer Graft',
    description: 'Used for evergreens and when working with small scions',
    difficulty: 'advanced',
    successRate: 75,
    timeToTake: '6-8 weeks',
    bestSeason: ['Late Summer', 'Fall'],
    tools: ['Very sharp knife', 'Grafting tape', 'Humidity chamber'],
    steps: [
      'Make shallow slanting cut on rootstock side',
      'Prepare scion with matching cut',
      'Fit scion against rootstock cut',
      'Bind tightly with tape',
      'Maintain high humidity environment'
    ],
    compatiblePlants: ['Conifers', 'Evergreens', 'Ornamental trees']
  }
];

const plantCompatibilities: PlantCompatibility[] = [
  {
    rootstock: 'Citrus Rootstock',
    scions: ['Orange', 'Lemon', 'Lime', 'Grapefruit', 'Mandarin'],
    compatibility: 'excellent',
    benefits: ['Disease resistance', 'Cold tolerance', 'Dwarf sizing', 'Earlier fruiting'],
    challenges: ['Incompatibility with some varieties', 'Soil sensitivity'],
    successRate: 90
  },
  {
    rootstock: 'Apple Rootstock (M7)',
    scions: ['Fuji', 'Gala', 'Granny Smith', 'Red Delicious'],
    compatibility: 'excellent',
    benefits: ['Disease resistance', 'Size control', 'Early production', 'Uniform growth'],
    challenges: ['Requires support', 'Shallow roots'],
    successRate: 88
  },
  {
    rootstock: 'Mango Polyembryonic',
    scions: ['Kent', 'Tommy Atkins', 'Haden', 'Keitt'],
    compatibility: 'good',
    benefits: ['True to type', 'Disease resistance', 'Faster fruiting'],
    challenges: ['Temperature sensitivity', 'Graft union weakness'],
    successRate: 75
  }
];

export function PlantGraftingManager() {
  const [graftingRecords, setGraftingRecords] = useState<GraftingRecord[]>([]);
  const [selectedTechnique, setSelectedTechnique] = useState<GraftingTechnique | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<GraftingRecord>>({
    status: 'grafted',
    environmental: { temperature: 20, humidity: 70, lightCondition: 'partial shade' }
  });

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const sampleRecords: GraftingRecord[] = [
      {
        id: 'graft-001',
        rootstock: 'Citrus Rough Lemon',
        scion: 'Valencia Orange',
        technique: 'whip-tongue',
        graftingDate: new Date('2024-01-15'),
        expectedTakeDate: new Date('2024-02-20'),
        actualTakeDate: new Date('2024-02-18'),
        status: 'successful',
        location: 'Greenhouse Section A',
        environmental: {
          temperature: 24,
          humidity: 75,
          lightCondition: 'partial shade'
        },
        notes: 'Perfect cambium alignment, strong union forming',
        photos: [],
        aiRecommendations: [
          'Maintain consistent moisture levels',
          'Protect from direct sunlight for 2 more weeks',
          'Remove binding tape gradually'
        ]
      },
      {
        id: 'graft-002',
        rootstock: 'Apple M7 Dwarf',
        scion: 'Fuji Apple',
        technique: 'cleft-graft',
        graftingDate: new Date('2024-02-01'),
        expectedTakeDate: new Date('2024-03-05'),
        status: 'taking',
        location: 'Nursery Bed 3',
        environmental: {
          temperature: 18,
          humidity: 65,
          lightCondition: 'filtered light'
        },
        notes: 'Good callus formation observed, scion buds swelling',
        photos: [],
        aiRecommendations: [
          'Increase humidity to 70-75%',
          'Watch for pest activity on new growth',
          'Prepare to remove rootstock suckers'
        ]
      }
    ];
    setGraftingRecords(sampleRecords);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful': return 'bg-green-100 text-green-800';
      case 'taking': return 'bg-blue-100 text-blue-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addGraftingRecord = () => {
    if (newRecord.rootstock && newRecord.scion && newRecord.technique) {
      const record: GraftingRecord = {
        id: `graft-${Date.now()}`,
        rootstock: newRecord.rootstock!,
        scion: newRecord.scion!,
        technique: newRecord.technique!,
        graftingDate: new Date(),
        expectedTakeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'grafted',
        location: newRecord.location || '',
        environmental: newRecord.environmental!,
        notes: newRecord.notes || '',
        photos: [],
        aiRecommendations: []
      };

      setGraftingRecords(prev => [...prev, record]);
      setShowAddRecord(false);
      setNewRecord({
        status: 'grafted',
        environmental: { temperature: 20, humidity: 70, lightCondition: 'partial shade' }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Grafting Management</h1>
        <p className="text-gray-600">Master the art of plant grafting with AI-powered guidance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Grafts</p>
                <p className="text-2xl font-bold">{graftingRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((graftingRecords.filter(r => r.status === 'successful').length / Math.max(1, graftingRecords.length)) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {graftingRecords.filter(r => r.status === 'taking' || r.status === 'monitoring').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">AI Guided</p>
                <p className="text-2xl font-bold">
                  {graftingRecords.filter(r => r.aiRecommendations.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="techniques">Techniques</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
          <TabsTrigger value="records">My Grafts</TabsTrigger>
          <TabsTrigger value="ai-guide">AI Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Grafting Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {graftingRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium">{record.scion} on {record.rootstock}</h3>
                            <p className="text-sm text-gray-600">{record.technique}</p>
                          </div>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>Grafted: {record.graftingDate.toLocaleDateString()}</div>
                          <div>Location: {record.location}</div>
                        </div>
                        {record.aiRecommendations.length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>AI Tip:</strong> {record.aiRecommendations[0]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => setShowAddRecord(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record New Graft
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Photo Progress
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Grafting
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Recommendations
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Environmental Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Temperature
                      </span>
                      <span className="font-bold">22°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Humidity
                      </span>
                      <span className="font-bold">68%</span>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-sm">
                      ✅ Optimal conditions for grafting
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="techniques">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {graftingTechniques.map((technique) => (
              <Card key={technique.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{technique.name}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">{technique.description}</p>
                    </div>
                    <Badge className={getDifficultyColor(technique.difficulty)}>
                      {technique.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Success Rate</p>
                        <div className="flex items-center gap-2">
                          <Progress value={technique.successRate} className="flex-1 h-2" />
                          <span className="font-bold">{technique.successRate}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Time to Take</p>
                        <p className="font-medium">{technique.timeToTake}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-2">Best Season</p>
                      <div className="flex gap-1">
                        {technique.bestSeason.map((season) => (
                          <Badge key={season} variant="outline" className="text-xs">
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-2">Required Tools</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {technique.tools.map((tool, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {tool}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedTechnique(technique)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compatibility">
          <Card>
            <CardHeader>
              <CardTitle>Plant Compatibility Guide</CardTitle>
              <p className="text-gray-600">Understanding rootstock and scion compatibility</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {plantCompatibilities.map((comp, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-lg">{comp.rootstock}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          comp.compatibility === 'excellent' ? 'bg-green-100 text-green-800' :
                          comp.compatibility === 'good' ? 'bg-blue-100 text-blue-800' :
                          comp.compatibility === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {comp.compatibility}
                        </Badge>
                        <span className="font-bold text-green-600">{comp.successRate}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium mb-2">Compatible Scions</p>
                        <div className="space-y-1">
                          {comp.scions.map((scion) => (
                            <div key={scion} className="flex items-center gap-2 text-sm">
                              <TreePine className="h-3 w-3 text-green-600" />
                              {scion}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-medium mb-2 text-green-600">Benefits</p>
                        <div className="space-y-1">
                          {comp.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-medium mb-2 text-orange-600">Challenges</p>
                        <div className="space-y-1">
                          {comp.challenges.map((challenge, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-orange-700">
                              <AlertTriangle className="h-3 w-3" />
                              {challenge}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Grafting Records</CardTitle>
                  <p className="text-gray-600">Track all your grafting projects</p>
                </div>
                <Button onClick={() => setShowAddRecord(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {graftingRecords.map((record) => (
                  <div key={record.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{record.scion} grafted onto {record.rootstock}</h3>
                        <p className="text-sm text-gray-600">
                          Technique: {record.technique} • Location: {record.location}
                        </p>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Grafting Date</p>
                        <p className="font-medium">{record.graftingDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expected Take</p>
                        <p className="font-medium">{record.expectedTakeDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Environmental</p>
                        <p className="font-medium">{record.environmental.temperature}°C, {record.environmental.humidity}%</p>
                      </div>
                    </div>

                    {record.notes && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {record.notes}
                      </div>
                    )}

                    {record.aiRecommendations.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-600">AI Recommendations:</p>
                        {record.aiRecommendations.map((rec, i) => (
                          <div key={i} className="text-sm text-blue-700 flex items-center gap-2">
                            <Brain className="h-3 w-3" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-guide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Grafting Assistant</CardTitle>
                <p className="text-gray-600">Get personalized grafting recommendations</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-blue-900">Today's Recommendation</p>
                        <p className="text-blue-800 text-sm mt-1">
                          Current weather conditions are ideal for cleft grafting citrus. 
                          Temperature and humidity levels are within optimal range.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-green-900">Success Tip</p>
                        <p className="text-green-800 text-sm mt-1">
                          Ensure your grafting knife is extremely sharp. A clean cut is crucial 
                          for proper cambium alignment and successful union formation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
                      <div>
                        <p className="font-medium text-yellow-900">Seasonal Alert</p>
                        <p className="text-yellow-800 text-sm mt-1">
                          Late winter is approaching - perfect time to prepare for dormant season 
                          grafting. Start collecting scion wood now.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grafting Calendar</CardTitle>
                <p className="text-gray-600">Optimal timing for different techniques</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Whip & Tongue</span>
                      <Badge variant="outline">Feb - Mar</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Best for dormant deciduous trees</p>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bark Grafting</span>
                      <Badge variant="outline">Apr - May</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">When bark slips easily in spring</p>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Side Grafting</span>
                      <Badge variant="outline">Aug - Sep</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Ideal for evergreens and conifers</p>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Budding</span>
                      <Badge variant="outline">Jul - Aug</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">T-budding during active growth</p>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Record New Graft</h3>
            <div className="space-y-4">
              <div>
                <Label>Rootstock</Label>
                <Input
                  value={newRecord.rootstock || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, rootstock: e.target.value })}
                  placeholder="e.g., Citrus Rough Lemon"
                />
              </div>
              <div>
                <Label>Scion</Label>
                <Input
                  value={newRecord.scion || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, scion: e.target.value })}
                  placeholder="e.g., Valencia Orange"
                />
              </div>
              <div>
                <Label>Technique</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newRecord.technique || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, technique: e.target.value })}
                  aria-label="Select grafting technique"
                  title="Select grafting technique"
                >
                  <option value="">Select technique</option>
                  {graftingTechniques.map((tech) => (
                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={newRecord.location || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, location: e.target.value })}
                  placeholder="e.g., Greenhouse Section A"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={newRecord.notes || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={addGraftingRecord}>Add Record</Button>
              <Button variant="outline" onClick={() => setShowAddRecord(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlantGraftingManager;