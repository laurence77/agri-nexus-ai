import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Wheat,
  Package,
  TrendingUp,
  Calculator,
  Clock,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Zap,
  Leaf,
  FlaskConical,
  Target,
  Truck,
  Factory,
  Scale,
  Brain
} from 'lucide-react';

interface FeedIngredient {
  id: string;
  name: string;
  type: 'grain' | 'protein' | 'roughage' | 'mineral' | 'vitamin' | 'additive';
  nutritionalValue: {
    protein: number; // %
    energy: number; // MJ/kg
    fiber: number; // %
    calcium: number; // %
    phosphorus: number; // %
    moisture: number; // %
  };
  costPerKg: number;
  availability: 'high' | 'medium' | 'low';
  seasonality: string[];
  storageLife: number; // days
  description: string;
}

interface FeedFormula {
  id: string;
  name: string;
  targetAnimal: 'cattle' | 'goats' | 'sheep' | 'chickens' | 'pigs' | 'ducks';
  lifeStage: 'starter' | 'grower' | 'finisher' | 'layer' | 'breeder' | 'lactating' | 'dry';
  ingredients: {
    ingredientId: string;
    percentage: number;
    quantity: number; // kg per batch
  }[];
  nutritionalProfile: {
    crudeProtein: number;
    metabolizableEnergy: number;
    crudeFilber: number;
    calcium: number;
    phosphorus: number;
  };
  costPerKg: number;
  batchSize: number; // kg
  notes: string;
}

interface ProductionBatch {
  id: string;
  formulaId: string;
  formulaName: string;
  batchSize: number;
  productionDate: Date;
  status: 'planned' | 'mixing' | 'completed' | 'quality_check' | 'stored' | 'distributed';
  ingredients: {
    ingredientId: string;
    ingredientName: string;
    plannedQuantity: number;
    actualQuantity: number;
  }[];
  qualityCheck: {
    moistureContent: number;
    proteinAnalysis: number;
    contamination: 'none' | 'low' | 'high';
    pelletQuality: 'excellent' | 'good' | 'fair' | 'poor';
  } | null;
  totalCost: number;
  storageLocation: string;
  expiryDate: Date;
  distributedTo: string[];
}

interface NutritionalRequirement {
  animal: string;
  lifeStage: string;
  bodyWeight: number; // kg
  dailyGain: number; // kg/day
  requirements: {
    crudeProtein: { min: number; max: number };
    metabolizableEnergy: { min: number; max: number };
    crudeFilber: { min: number; max: number };
    calcium: { min: number; max: number };
    phosphorus: { min: number; max: number };
  };
}

const feedIngredients: FeedIngredient[] = [
  {
    id: 'maize',
    name: 'Maize (Corn)',
    type: 'grain',
    nutritionalValue: {
      protein: 8.5,
      energy: 13.8,
      fiber: 2.2,
      calcium: 0.03,
      phosphorus: 0.28,
      moisture: 14.0
    },
    costPerKg: 0.45,
    availability: 'high',
    seasonality: ['March-July', 'September-December'],
    storageLife: 365,
    description: 'Primary energy source, good palatability'
  },
  {
    id: 'soybean-meal',
    name: 'Soybean Meal',
    type: 'protein',
    nutritionalValue: {
      protein: 44.0,
      energy: 9.2,
      fiber: 7.0,
      calcium: 0.29,
      phosphorus: 0.65,
      moisture: 12.0
    },
    costPerKg: 0.85,
    availability: 'medium',
    seasonality: ['Year-round'],
    storageLife: 180,
    description: 'High quality protein source with balanced amino acids'
  },
  {
    id: 'wheat-bran',
    name: 'Wheat Bran',
    type: 'roughage',
    nutritionalValue: {
      protein: 15.5,
      energy: 9.8,
      fiber: 11.2,
      calcium: 0.13,
      phosphorus: 1.15,
      moisture: 12.5
    },
    costPerKg: 0.35,
    availability: 'high',
    seasonality: ['Year-round'],
    storageLife: 120,
    description: 'Good source of fiber and phosphorus'
  },
  {
    id: 'fish-meal',
    name: 'Fish Meal',
    type: 'protein',
    nutritionalValue: {
      protein: 60.0,
      energy: 11.5,
      fiber: 1.0,
      calcium: 5.50,
      phosphorus: 3.20,
      moisture: 10.0
    },
    costPerKg: 1.25,
    availability: 'low',
    seasonality: ['Year-round'],
    storageLife: 90,
    description: 'High protein with excellent amino acid profile'
  },
  {
    id: 'limestone',
    name: 'Limestone',
    type: 'mineral',
    nutritionalValue: {
      protein: 0,
      energy: 0,
      fiber: 0,
      calcium: 38.0,
      phosphorus: 0.05,
      moisture: 2.0
    },
    costPerKg: 0.12,
    availability: 'high',
    seasonality: ['Year-round'],
    storageLife: 1825, // 5 years
    description: 'Primary calcium source for strong bones and eggshells'
  },
  {
    id: 'dicalcium-phosphate',
    name: 'Dicalcium Phosphate',
    type: 'mineral',
    nutritionalValue: {
      protein: 0,
      energy: 0,
      fiber: 0,
      calcium: 22.0,
      phosphorus: 18.5,
      moisture: 5.0
    },
    costPerKg: 0.95,
    availability: 'medium',
    seasonality: ['Year-round'],
    storageLife: 1825,
    description: 'Balanced calcium and phosphorus supplement'
  }
];

const nutritionalRequirements: NutritionalRequirement[] = [
  {
    animal: 'cattle',
    lifeStage: 'growing',
    bodyWeight: 300,
    dailyGain: 0.8,
    requirements: {
      crudeProtein: { min: 12, max: 16 },
      metabolizableEnergy: { min: 10.5, max: 12.5 },
      crudeFilber: { min: 15, max: 25 },
      calcium: { min: 0.4, max: 0.8 },
      phosphorus: { min: 0.25, max: 0.45 }
    }
  },
  {
    animal: 'cattle',
    lifeStage: 'lactating',
    bodyWeight: 500,
    dailyGain: 0,
    requirements: {
      crudeProtein: { min: 16, max: 20 },
      metabolizableEnergy: { min: 11.5, max: 13.5 },
      crudeFilber: { min: 18, max: 28 },
      calcium: { min: 0.6, max: 1.0 },
      phosphorus: { min: 0.35, max: 0.55 }
    }
  },
  {
    animal: 'chickens',
    lifeStage: 'layer',
    bodyWeight: 2.0,
    dailyGain: 0,
    requirements: {
      crudeProtein: { min: 16, max: 18 },
      metabolizableEnergy: { min: 11.0, max: 12.5 },
      crudeFilber: { min: 3, max: 6 },
      calcium: { min: 3.5, max: 4.2 },
      phosphorus: { min: 0.32, max: 0.45 }
    }
  }
];

export function FeedProductionManager() {
  const [feedFormulas, setFeedFormulas] = useState<FeedFormula[]>([]);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFormula, setSelectedFormula] = useState<FeedFormula | null>(null);
  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);
  const [newFormula, setNewFormula] = useState<Partial<FeedFormula>>({
    targetAnimal: 'cattle',
    lifeStage: 'growing',
    ingredients: [],
    batchSize: 1000
  });

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const sampleFormulas: FeedFormula[] = [
      {
        id: 'formula-001',
        name: 'Dairy Cow Lactation Feed',
        targetAnimal: 'cattle',
        lifeStage: 'lactating',
        ingredients: [
          { ingredientId: 'maize', percentage: 35, quantity: 350 },
          { ingredientId: 'soybean-meal', percentage: 20, quantity: 200 },
          { ingredientId: 'wheat-bran', percentage: 25, quantity: 250 },
          { ingredientId: 'fish-meal', percentage: 5, quantity: 50 },
          { ingredientId: 'limestone', percentage: 1.5, quantity: 15 },
          { ingredientId: 'dicalcium-phosphate', percentage: 1, quantity: 10 }
        ],
        nutritionalProfile: {
          crudeProtein: 18.2,
          metabolizableEnergy: 12.1,
          crudeFilber: 16.8,
          calcium: 0.75,
          phosphorus: 0.42
        },
        costPerKg: 0.68,
        batchSize: 1000,
        notes: 'High-energy lactation ration for peak milk production'
      },
      {
        id: 'formula-002',
        name: 'Layer Feed Premium',
        targetAnimal: 'chickens',
        lifeStage: 'layer',
        ingredients: [
          { ingredientId: 'maize', percentage: 55, quantity: 550 },
          { ingredientId: 'soybean-meal', percentage: 25, quantity: 250 },
          { ingredientId: 'wheat-bran', percentage: 8, quantity: 80 },
          { ingredientId: 'fish-meal', percentage: 3, quantity: 30 },
          { ingredientId: 'limestone', percentage: 8, quantity: 80 },
          { ingredientId: 'dicalcium-phosphate', percentage: 1, quantity: 10 }
        ],
        nutritionalProfile: {
          crudeProtein: 17.5,
          metabolizableEnergy: 11.8,
          crudeFilber: 4.2,
          calcium: 3.8,
          phosphorus: 0.38
        },
        costPerKg: 0.72,
        batchSize: 500,
        notes: 'Balanced nutrition for sustained egg production'
      }
    ];

    const sampleBatches: ProductionBatch[] = [
      {
        id: 'batch-001',
        formulaId: 'formula-001',
        formulaName: 'Dairy Cow Lactation Feed',
        batchSize: 1000,
        productionDate: new Date('2024-02-01'),
        status: 'completed',
        ingredients: [
          { ingredientId: 'maize', ingredientName: 'Maize (Corn)', plannedQuantity: 350, actualQuantity: 348 },
          { ingredientId: 'soybean-meal', ingredientName: 'Soybean Meal', plannedQuantity: 200, actualQuantity: 202 }
        ],
        qualityCheck: {
          moistureContent: 13.5,
          proteinAnalysis: 18.0,
          contamination: 'none',
          pelletQuality: 'good'
        },
        totalCost: 680,
        storageLocation: 'Feed Mill - Bin A',
        expiryDate: new Date('2024-05-01'),
        distributedTo: ['Dairy Unit 1', 'Dairy Unit 2']
      }
    ];

    setFeedFormulas(sampleFormulas);
    setProductionBatches(sampleBatches);
  };

  const calculateNutritionalProfile = (ingredients: FeedFormula['ingredients']) => {
    let totalProtein = 0;
    let totalEnergy = 0;
    let totalFiber = 0;
    let totalCalcium = 0;
    let totalPhosphorus = 0;

    ingredients.forEach(ing => {
      const ingredient = feedIngredients.find(fi => fi.id === ing.ingredientId);
      if (ingredient) {
        const ratio = ing.percentage / 100;
        totalProtein += ingredient.nutritionalValue.protein * ratio;
        totalEnergy += ingredient.nutritionalValue.energy * ratio;
        totalFiber += ingredient.nutritionalValue.fiber * ratio;
        totalCalcium += ingredient.nutritionalValue.calcium * ratio;
        totalPhosphorus += ingredient.nutritionalValue.phosphorus * ratio;
      }
    });

    return {
      crudeProtein: Math.round(totalProtein * 10) / 10,
      metabolizableEnergy: Math.round(totalEnergy * 10) / 10,
      crudeFilber: Math.round(totalFiber * 10) / 10,
      calcium: Math.round(totalCalcium * 100) / 100,
      phosphorus: Math.round(totalPhosphorus * 100) / 100
    };
  };

  const calculateFormulaCost = (ingredients: FeedFormula['ingredients']) => {
    let totalCost = 0;
    ingredients.forEach(ing => {
      const ingredient = feedIngredients.find(fi => fi.id === ing.ingredientId);
      if (ingredient) {
        totalCost += (ing.percentage / 100) * ingredient.costPerKg;
      }
    });
    return Math.round(totalCost * 100) / 100;
  };

  const addIngredientToFormula = (ingredientId: string) => {
    if (newFormula.ingredients) {
      const exists = newFormula.ingredients.find(ing => ing.ingredientId === ingredientId);
      if (!exists) {
        const newIngredients = [...newFormula.ingredients, {
          ingredientId,
          percentage: 5,
          quantity: (newFormula.batchSize || 1000) * 0.05
        }];
        setNewFormula({ ...newFormula, ingredients: newIngredients });
      }
    }
  };

  const updateIngredientPercentage = (ingredientId: string, percentage: number) => {
    if (newFormula.ingredients && newFormula.batchSize) {
      const updatedIngredients = newFormula.ingredients.map(ing =>
        ing.ingredientId === ingredientId
          ? { ...ing, percentage, quantity: newFormula.batchSize * (percentage / 100) }
          : ing
      );
      setNewFormula({ ...newFormula, ingredients: updatedIngredients });
    }
  };

  const removeIngredientFromFormula = (ingredientId: string) => {
    if (newFormula.ingredients) {
      const filteredIngredients = newFormula.ingredients.filter(ing => ing.ingredientId !== ingredientId);
      setNewFormula({ ...newFormula, ingredients: filteredIngredients });
    }
  };

  const getTotalPercentage = () => {
    return (newFormula.ingredients || []).reduce((sum, ing) => sum + ing.percentage, 0);
  };

  const saveFormula = () => {
    if (newFormula.name && newFormula.ingredients && newFormula.ingredients.length > 0) {
      const nutritionalProfile = calculateNutritionalProfile(newFormula.ingredients);
      const costPerKg = calculateFormulaCost(newFormula.ingredients);
      
      const formula: FeedFormula = {
        id: `formula-${Date.now()}`,
        name: newFormula.name,
        targetAnimal: newFormula.targetAnimal!,
        lifeStage: newFormula.lifeStage!,
        ingredients: newFormula.ingredients,
        nutritionalProfile,
        costPerKg,
        batchSize: newFormula.batchSize || 1000,
        notes: newFormula.notes || ''
      };

      setFeedFormulas(prev => [...prev, formula]);
      setShowFormulaBuilder(false);
      setNewFormula({
        targetAnimal: 'cattle',
        lifeStage: 'growing',
        ingredients: [],
        batchSize: 1000
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feed Production Management</h1>
        <p className="text-gray-600">Design, produce, and manage livestock feed formulations</p>
      </div>

      {/* Production Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Formulas</p>
                <p className="text-2xl font-bold">{feedFormulas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Batches Produced</p>
                <p className="text-2xl font-bold">{productionBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Production</p>
                <p className="text-2xl font-bold">
                  {productionBatches.reduce((sum, batch) => sum + batch.batchSize, 0).toLocaleString()}kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Cost/kg</p>
                <p className="text-2xl font-bold">
                  ${(feedFormulas.reduce((sum, formula) => sum + formula.costPerKg, 0) / Math.max(1, feedFormulas.length)).toFixed(2)}
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
                <p className="text-sm text-gray-600">Quality Score</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="formulas">Feed Formulas</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Production Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productionBatches.slice(0, 5).map((batch) => (
                      <div key={batch.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium">{batch.formulaName}</h3>
                            <p className="text-sm text-gray-600">{batch.batchSize}kg batch</p>
                          </div>
                          <Badge className={
                            batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                            batch.status === 'mixing' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {batch.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>Produced: {batch.productionDate.toLocaleDateString()}</div>
                          <div>Cost: ${batch.totalCost}</div>
                        </div>
                        {batch.qualityCheck && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                            Quality: Protein {batch.qualityCheck.proteinAnalysis}%, 
                            Moisture {batch.qualityCheck.moistureContent}%
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
                  <Button className="w-full" onClick={() => setShowFormulaBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Formula
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Factory className="h-4 w-4 mr-2" />
                    Start Production
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FlaskConical className="h-4 w-4 mr-2" />
                    Quality Check
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Today's Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-blue-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">AI Insight</p>
                          <p className="text-xs text-blue-800">
                            Maize prices have dropped 8%. Consider adjusting formulas to increase maize content.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Inventory Alert</p>
                          <p className="text-xs text-yellow-800">
                            Soybean meal stock running low. Reorder required for next week's production.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="formulas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Feed Formulas</CardTitle>
                  <p className="text-gray-600">Manage your feed formulations</p>
                </div>
                <Button onClick={() => setShowFormulaBuilder(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Formula
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedFormulas.map((formula) => (
                  <Card key={formula.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{formula.name}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {formula.targetAnimal} • {formula.lifeStage}
                          </p>
                        </div>
                        <Badge variant="outline">${formula.costPerKg}/kg</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Protein</p>
                            <p className="font-bold">{formula.nutritionalProfile.crudeProtein}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Energy</p>
                            <p className="font-bold">{formula.nutritionalProfile.metabolizableEnergy} MJ/kg</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fiber</p>
                            <p className="font-bold">{formula.nutritionalProfile.crudeFilber}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Batch Size</p>
                            <p className="font-bold">{formula.batchSize}kg</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-600 text-sm mb-2">Main Ingredients</p>
                          <div className="space-y-1">
                            {formula.ingredients.slice(0, 3).map((ing) => {
                              const ingredient = feedIngredients.find(fi => fi.id === ing.ingredientId);
                              return (
                                <div key={ing.ingredientId} className="flex justify-between text-xs">
                                  <span>{ingredient?.name}</span>
                                  <span>{ing.percentage}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Edit Formula
                          </Button>
                          <Button size="sm" className="flex-1">
                            Produce Batch
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients">
          <Card>
            <CardHeader>
              <CardTitle>Feed Ingredients Database</CardTitle>
              <p className="text-gray-600">Nutritional values and costs of available ingredients</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedIngredients.map((ingredient) => (
                  <div key={ingredient.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded">
                          {ingredient.type === 'grain' && <Wheat className="h-5 w-5" />}
                          {ingredient.type === 'protein' && <Zap className="h-5 w-5" />}
                          {ingredient.type === 'roughage' && <Leaf className="h-5 w-5" />}
                          {ingredient.type === 'mineral' && <FlaskConical className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{ingredient.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {ingredient.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${ingredient.costPerKg}/kg</p>
                        <Badge className={
                          ingredient.availability === 'high' ? 'bg-green-100 text-green-800' :
                          ingredient.availability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {ingredient.availability}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Protein</p>
                        <p className="font-medium">{ingredient.nutritionalValue.protein}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Energy</p>
                        <p className="font-medium">{ingredient.nutritionalValue.energy} MJ/kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fiber</p>
                        <p className="font-medium">{ingredient.nutritionalValue.fiber}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Calcium</p>
                        <p className="font-medium">{ingredient.nutritionalValue.calcium}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phosphorus</p>
                        <p className="font-medium">{ingredient.nutritionalValue.phosphorus}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Storage Life</p>
                        <p className="font-medium">{ingredient.storageLife} days</p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mt-3">{ingredient.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Requirements Guide</CardTitle>
              <p className="text-gray-600">Species-specific nutritional needs by life stage</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {nutritionalRequirements.map((req, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium capitalize">{req.animal} - {req.lifeStage}</h3>
                        <p className="text-sm text-gray-600">
                          Body Weight: {req.bodyWeight}kg • Daily Gain: {req.dailyGain}kg
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Use in Formula
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-600 font-medium">Crude Protein</p>
                        <p className="text-lg font-bold text-blue-900">
                          {req.requirements.crudeProtein.min}-{req.requirements.crudeProtein.max}%
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <p className="text-sm text-green-600 font-medium">Energy</p>
                        <p className="text-lg font-bold text-green-900">
                          {req.requirements.metabolizableEnergy.min}-{req.requirements.metabolizableEnergy.max} MJ/kg
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded">
                        <p className="text-sm text-yellow-600 font-medium">Crude Fiber</p>
                        <p className="text-lg font-bold text-yellow-900">
                          {req.requirements.crudeFilber.min}-{req.requirements.crudeFilber.max}%
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded">
                        <p className="text-sm text-purple-600 font-medium">Calcium</p>
                        <p className="text-lg font-bold text-purple-900">
                          {req.requirements.calcium.min}-{req.requirements.calcium.max}%
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded">
                        <p className="text-sm text-orange-600 font-medium">Phosphorus</p>
                        <p className="text-lg font-bold text-orange-900">
                          {req.requirements.phosphorus.min}-{req.requirements.phosphorus.max}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Formula Builder Modal */}
      {showFormulaBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-medium mb-6">Feed Formula Builder</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4 mb-6">
                  <div>
                    <Label>Formula Name</Label>
                    <Input
                      value={newFormula.name || ''}
                      onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
                      placeholder="e.g., High Protein Layer Feed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target Animal</Label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newFormula.targetAnimal}
                        onChange={(e) => setNewFormula({ ...newFormula, targetAnimal: e.target.value as any })}
                        aria-label="Select target animal"
                        title="Select target animal"
                      >
                        <option value="cattle">Cattle</option>
                        <option value="goats">Goats</option>
                        <option value="sheep">Sheep</option>
                        <option value="chickens">Chickens</option>
                        <option value="pigs">Pigs</option>
                        <option value="ducks">Ducks</option>
                      </select>
                    </div>
                    <div>
                      <Label>Life Stage</Label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newFormula.lifeStage}
                        onChange={(e) => setNewFormula({ ...newFormula, lifeStage: e.target.value as any })}
                        aria-label="Select life stage"
                        title="Select life stage"
                      >
                        <option value="starter">Starter</option>
                        <option value="grower">Grower</option>
                        <option value="finisher">Finisher</option>
                        <option value="layer">Layer</option>
                        <option value="breeder">Breeder</option>
                        <option value="lactating">Lactating</option>
                        <option value="dry">Dry</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Batch Size (kg)</Label>
                    <Input
                      type="number"
                      value={newFormula.batchSize}
                      onChange={(e) => setNewFormula({ ...newFormula, batchSize: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Available Ingredients</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {feedIngredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{ingredient.name}</span>
                          <span className="text-sm text-gray-600 ml-2">${ingredient.costPerKg}/kg</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addIngredientToFormula(ingredient.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Formula Composition</h4>
                    <span className={`text-sm ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                      Total: {getTotalPercentage().toFixed(1)}%
                    </span>
                  </div>
                  
                  {(newFormula.ingredients || []).map((ing) => {
                    const ingredient = feedIngredients.find(fi => fi.id === ing.ingredientId);
                    return (
                      <div key={ing.ingredientId} className="flex items-center gap-2 mb-2">
                        <span className="text-sm flex-1">{ingredient?.name}</span>
                        <Input
                          type="number"
                          value={ing.percentage}
                          onChange={(e) => updateIngredientPercentage(ing.ingredientId, parseFloat(e.target.value) || 0)}
                          className="w-20"
                          step="0.1"
                        />
                        <span className="text-sm">%</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeIngredientFromFormula(ing.ingredientId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {newFormula.ingredients && newFormula.ingredients.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Nutritional Profile</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Crude Protein</p>
                        <p className="font-bold">{calculateNutritionalProfile(newFormula.ingredients).crudeProtein}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Energy</p>
                        <p className="font-bold">{calculateNutritionalProfile(newFormula.ingredients).metabolizableEnergy} MJ/kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Crude Fiber</p>
                        <p className="font-bold">{calculateNutritionalProfile(newFormula.ingredients).crudeFilber}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cost per kg</p>
                        <p className="font-bold">${calculateFormulaCost(newFormula.ingredients)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                onClick={saveFormula}
                disabled={!newFormula.name || getTotalPercentage() !== 100}
              >
                Save Formula
              </Button>
              <Button variant="outline" onClick={() => setShowFormulaBuilder(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedProductionManager;