import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Heart,
  Zap,
  Shield,
  Thermometer,
  Droplets,
  Calendar,
  Weight,
  Milk,
  Egg,
  Beef,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  MapPin,
  Award,
  BookOpen
} from 'lucide-react';

interface LivestockBreed {
  id: string;
  name: string;
  species: 'cattle' | 'goats' | 'sheep' | 'chickens' | 'pigs' | 'ducks';
  origin: string;
  category: 'dairy' | 'beef' | 'dual_purpose' | 'layers' | 'broilers' | 'ornamental';
  image: string;
  description: string;
  
  characteristics: {
    size: 'small' | 'medium' | 'large';
    weight: { male: number; female: number }; // kg
    height: { male: number; female: number }; // cm
    lifespan: number; // years
    maturityAge: number; // months
    temperament: 'docile' | 'moderate' | 'aggressive';
    climateAdaptation: 'tropical' | 'temperate' | 'cold' | 'all';
  };
  
  production: {
    milkYield?: { daily: number; lactationPeriod: number }; // liters/day, days
    eggProduction?: { daily: number; yearlyTotal: number }; // eggs/day, eggs/year
    meatYield?: { dressedWeight: number; feedConversion: number }; // kg, feed:gain ratio
    breeding: {
      breedingAge: number; // months
      gestationPeriod?: number; // days
      incubationPeriod?: number; // days
      litterSize: number;
      breedingCycle: number; // per year
    };
  };
  
  advantages: string[];
  disadvantages: string[];
  
  management: {
    feedRequirements: string[];
    housingNeeds: string[];
    healthConcerns: string[];
    specialCare: string[];
  };
  
  economics: {
    initialCost: { min: number; max: number };
    maintenanceCost: number; // per month
    potentialRevenue: number; // per month
    paybackPeriod: number; // months
    profitability: 'low' | 'medium' | 'high';
  };
  
  suitability: {
    beginnerFriendly: boolean;
    climateZones: string[];
    farmSize: 'small' | 'medium' | 'large' | 'all';
    marketDemand: 'low' | 'medium' | 'high';
  };
  
  rating: number; // 1-5 stars
  popularity: number; // 1-100
}

const livestockBreeds: LivestockBreed[] = [
  {
    id: 'holstein-friesian',
    name: 'Holstein Friesian',
    species: 'cattle',
    origin: 'Netherlands',
    category: 'dairy',
    image: '/breeds/holstein-friesian.jpg',
    description: 'World\'s highest milk-producing dairy breed, known for distinctive black and white markings and excellent milk production.',
    
    characteristics: {
      size: 'large',
      weight: { male: 900, female: 650 },
      height: { male: 165, female: 145 },
      lifespan: 12,
      maturityAge: 24,
      temperament: 'docile',
      climateAdaptation: 'temperate'
    },
    
    production: {
      milkYield: { daily: 30, lactationPeriod: 305 },
      breeding: {
        breedingAge: 18,
        gestationPeriod: 283,
        litterSize: 1,
        breedingCycle: 1
      }
    },
    
    advantages: [
      'Highest milk production potential',
      'Excellent feed conversion efficiency',
      'Well-established genetics',
      'Strong market demand',
      'Docile temperament',
      'Good reproductive performance'
    ],
    
    disadvantages: [
      'High feed requirements',
      'Sensitive to heat stress',
      'Requires intensive management',
      'Higher veterinary costs',
      'Not suitable for extensive systems',
      'Lower butterfat content'
    ],
    
    management: {
      feedRequirements: [
        'High-quality forages (60-70% of diet)',
        'Concentrate feed (16-18% protein)',
        'Fresh water (100-150L/day)',
        'Mineral supplements'
      ],
      housingNeeds: [
        'Well-ventilated barns',
        'Comfortable bedding',
        'Adequate shade',
        'Milking parlor access'
      ],
      healthConcerns: [
        'Mastitis susceptibility',
        'Ketosis in early lactation',
        'Heat stress issues',
        'Lameness problems'
      ],
      specialCare: [
        'Regular hoof trimming',
        'Mastitis prevention protocols',
        'Heat stress mitigation',
        'Nutritional monitoring'
      ]
    },
    
    economics: {
      initialCost: { min: 80000, max: 150000 },
      maintenanceCost: 15000,
      potentialRevenue: 25000,
      paybackPeriod: 18,
      profitability: 'high'
    },
    
    suitability: {
      beginnerFriendly: false,
      climateZones: ['Temperate highlands', 'Cool humid regions'],
      farmSize: 'medium',
      marketDemand: 'high'
    },
    
    rating: 4.5,
    popularity: 95
  },
  
  {
    id: 'zebu-cattle',
    name: 'East African Zebu',
    species: 'cattle',
    origin: 'East Africa',
    category: 'dual_purpose',
    image: '/breeds/zebu-cattle.jpg',
    description: 'Hardy indigenous cattle breed adapted to tropical conditions, excellent for milk and beef in harsh environments.',
    
    characteristics: {
      size: 'medium',
      weight: { male: 450, female: 350 },
      height: { male: 135, female: 125 },
      lifespan: 15,
      maturityAge: 30,
      temperament: 'moderate',
      climateAdaptation: 'tropical'
    },
    
    production: {
      milkYield: { daily: 8, lactationPeriod: 280 },
      meatYield: { dressedWeight: 250, feedConversion: 8.5 },
      breeding: {
        breedingAge: 24,
        gestationPeriod: 285,
        litterSize: 1,
        breedingCycle: 1
      }
    },
    
    advantages: [
      'Excellent heat tolerance',
      'Disease resistance',
      'Low maintenance requirements',
      'Adaptable to poor pastures',
      'Long productive life',
      'Strong mothering ability'
    ],
    
    disadvantages: [
      'Lower milk production',
      'Slower growth rates',
      'Late maturity',
      'Smaller body size',
      'Limited genetic improvement',
      'Variable milk quality'
    ],
    
    management: {
      feedRequirements: [
        'Natural pastures and browse',
        'Crop residues',
        'Mineral supplements',
        'Water (40-60L/day)'
      ],
      housingNeeds: [
        'Simple shade structures',
        'Open grazing areas',
        'Basic windbreaks',
        'Watering points'
      ],
      healthConcerns: [
        'East Coast Fever',
        'Trypanosomiasis',
        'Internal parasites',
        'Tick-borne diseases'
      ],
      specialCare: [
        'Regular tick control',
        'Vaccination programs',
        'Pasture management',
        'Drought feeding strategies'
      ]
    },
    
    economics: {
      initialCost: { min: 25000, max: 50000 },
      maintenanceCost: 5000,
      potentialRevenue: 8000,
      paybackPeriod: 24,
      profitability: 'medium'
    },
    
    suitability: {
      beginnerFriendly: true,
      climateZones: ['Tropical', 'Semi-arid', 'Humid regions'],
      farmSize: 'all',
      marketDemand: 'medium'
    },
    
    rating: 4.0,
    popularity: 85
  },
  
  {
    id: 'rhode-island-red',
    name: 'Rhode Island Red',
    species: 'chickens',
    origin: 'United States',
    category: 'dual_purpose',
    image: '/breeds/rhode-island-red.jpg',
    description: 'Hardy dual-purpose chicken breed excellent for both egg and meat production, ideal for small-scale farmers.',
    
    characteristics: {
      size: 'medium',
      weight: { male: 3.9, female: 2.9 },
      height: { male: 60, female: 55 },
      lifespan: 8,
      maturityAge: 6,
      temperament: 'moderate',
      climateAdaptation: 'all'
    },
    
    production: {
      eggProduction: { daily: 0.8, yearlyTotal: 280 },
      meatYield: { dressedWeight: 2.2, feedConversion: 2.8 },
      breeding: {
        breedingAge: 6,
        incubationPeriod: 21,
        litterSize: 12,
        breedingCycle: 3
      }
    },
    
    advantages: [
      'Excellent egg production',
      'Good meat quality',
      'Hardy and disease resistant',
      'Adaptable to various climates',
      'Good foraging ability',
      'Broody and good mothers'
    ],
    
    disadvantages: [
      'Can be aggressive',
      'Moderate feed efficiency',
      'Slow feathering',
      'Noisy birds',
      'May go broody frequently',
      'Average growth rate'
    ],
    
    management: {
      feedRequirements: [
        'Layer feed (16-18% protein)',
        'Grit for digestion',
        'Fresh water daily',
        'Kitchen scraps and greens'
      ],
      housingNeeds: [
        'Secure chicken coop',
        'Nesting boxes (1 per 4 hens)',
        'Roosting bars',
        'Run area for exercise'
      ],
      healthConcerns: [
        'Newcastle disease',
        'Infectious bronchitis',
        'Coccidiosis',
        'External parasites'
      ],
      specialCare: [
        'Regular vaccination',
        'Predator protection',
        'Proper ventilation',
        'Egg collection routine'
      ]
    },
    
    economics: {
      initialCost: { min: 500, max: 1000 },
      maintenanceCost: 200,
      potentialRevenue: 400,
      paybackPeriod: 6,
      profitability: 'high'
    },
    
    suitability: {
      beginnerFriendly: true,
      climateZones: ['All climate zones'],
      farmSize: 'all',
      marketDemand: 'high'
    },
    
    rating: 4.7,
    popularity: 90
  },
  
  {
    id: 'boer-goat',
    name: 'Boer Goat',
    species: 'goats',
    origin: 'South Africa',
    category: 'beef',
    image: '/breeds/boer-goat.jpg',
    description: 'Premium meat goat breed known for rapid growth, excellent meat quality, and adaptability to various environments.',
    
    characteristics: {
      size: 'large',
      weight: { male: 110, female: 90 },
      height: { male: 90, female: 75 },
      lifespan: 12,
      maturityAge: 8,
      temperament: 'docile',
      climateAdaptation: 'all'
    },
    
    production: {
      meatYield: { dressedWeight: 55, feedConversion: 4.5 },
      breeding: {
        breedingAge: 8,
        gestationPeriod: 150,
        litterSize: 2,
        breedingCycle: 2
      }
    },
    
    advantages: [
      'Rapid growth rate',
      'Excellent meat quality',
      'High feed conversion efficiency',
      'Good mothering ability',
      'Disease resistant',
      'Adaptable to various climates'
    ],
    
    disadvantages: [
      'Higher initial cost',
      'Requires good fencing',
      'Susceptible to internal parasites',
      'Need quality breeding stock',
      'Market price fluctuations',
      'Seasonal breeding patterns'
    ],
    
    management: {
      feedRequirements: [
        'Quality pasture or browse',
        'Grain supplement (14-16% protein)',
        'Mineral supplements',
        'Fresh water (3-5L/day)'
      ],
      housingNeeds: [
        'Three-sided shelter',
        'Good ventilation',
        'Separate kidding pens',
        'Secure fencing (1.2m high)'
      ],
      healthConcerns: [
        'Internal parasites (worms)',
        'Pneumonia',
        'Pregnancy toxemia',
        'Foot rot'
      ],
      specialCare: [
        'Regular deworming',
        'Hoof trimming',
        'Vaccination schedule',
        'Breeding management'
      ]
    },
    
    economics: {
      initialCost: { min: 8000, max: 25000 },
      maintenanceCost: 1500,
      potentialRevenue: 4000,
      paybackPeriod: 12,
      profitability: 'high'
    },
    
    suitability: {
      beginnerFriendly: true,
      climateZones: ['Semi-arid', 'Temperate', 'Subtropical'],
      farmSize: 'small',
      marketDemand: 'high'
    },
    
    rating: 4.6,
    popularity: 88
  }
];

export function BreedInformationDatabase() {
  const [breeds, setBreeds] = useState<LivestockBreed[]>(livestockBreeds);
  const [filteredBreeds, setFilteredBreeds] = useState<LivestockBreed[]>(livestockBreeds);
  const [selectedBreed, setSelectedBreed] = useState<LivestockBreed | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    filterBreeds();
  }, [searchTerm, speciesFilter, categoryFilter]);

  const filterBreeds = () => {
    let filtered = breeds;

    if (searchTerm) {
      filtered = filtered.filter(breed =>
        breed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        breed.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        breed.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (speciesFilter !== 'all') {
      filtered = filtered.filter(breed => breed.species === speciesFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(breed => breed.category === categoryFilter);
    }

    setFilteredBreeds(filtered);
  };

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'cattle': return <Beef className="h-5 w-5" />;
      case 'goats': return <Beef className="h-5 w-5" />;
      case 'sheep': return <Beef className="h-5 w-5" />;
      case 'chickens': return <Egg className="h-5 w-5" />;
      case 'pigs': return <Beef className="h-5 w-5" />;
      case 'ducks': return <Egg className="h-5 w-5" />;
      default: return <Heart className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Livestock Breed Database</h1>
        <p className="text-gray-600">Comprehensive guide to livestock breeds with detailed information and recommendations</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search breeds, origin, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            aria-label="Filter by species"
            title="Filter by species"
          >
            <option value="all">All Species</option>
            <option value="cattle">Cattle</option>
            <option value="goats">Goats</option>
            <option value="sheep">Sheep</option>
            <option value="chickens">Chickens</option>
            <option value="pigs">Pigs</option>
            <option value="ducks">Ducks</option>
          </select>
        </div>
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            aria-label="Filter by category"
            title="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="dairy">Dairy</option>
            <option value="beef">Beef/Meat</option>
            <option value="dual_purpose">Dual Purpose</option>
            <option value="layers">Egg Layers</option>
            <option value="broilers">Broilers</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breed List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Available Breeds ({filteredBreeds.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-3">
                {filteredBreeds.map((breed) => (
                  <div
                    key={breed.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBreed?.id === breed.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedBreed(breed)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSpeciesIcon(breed.species)}
                        <h3 className="font-medium">{breed.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{breed.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{breed.origin}</span>
                      <Badge className={getProfitabilityColor(breed.economics.profitability)}>
                        {breed.economics.profitability}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {breed.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breed Details */}
        <div className="lg:col-span-2">
          {selectedBreed ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="production">Production</TabsTrigger>
                <TabsTrigger value="management">Management</TabsTrigger>
                <TabsTrigger value="economics">Economics</TabsTrigger>
                <TabsTrigger value="suitability">Suitability</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedBreed.name}</CardTitle>
                        <p className="text-gray-600">{selectedBreed.origin} • {selectedBreed.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <span className="font-bold">{selectedBreed.rating}</span>
                        </div>
                        <Badge variant="outline">Popularity: {selectedBreed.popularity}%</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-gray-700">{selectedBreed.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Advantages
                          </h4>
                          <ul className="space-y-2">
                            {selectedBreed.advantages.map((advantage, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                                {advantage}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-orange-600 mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Disadvantages
                          </h4>
                          <ul className="space-y-2">
                            {selectedBreed.disadvantages.map((disadvantage, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <XCircle className="h-3 w-3 text-orange-600 mt-1 flex-shrink-0" />
                                {disadvantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Weight className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Size & Weight</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p>Male: {selectedBreed.characteristics.weight.male}kg</p>
                            <p>Female: {selectedBreed.characteristics.weight.female}kg</p>
                            <p>Size: {selectedBreed.characteristics.size}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Lifespan</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p>Average: {selectedBreed.characteristics.lifespan} years</p>
                            <p>Maturity: {selectedBreed.characteristics.maturityAge} months</p>
                            <p>Temperament: {selectedBreed.characteristics.temperament}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Thermometer className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Climate</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p>Adaptation: {selectedBreed.characteristics.climateAdaptation}</p>
                            <p>Zones: {selectedBreed.suitability.climateZones.length} supported</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="production">
                <Card>
                  <CardHeader>
                    <CardTitle>Production Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedBreed.production.milkYield && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Milk className="h-5 w-5 text-blue-600" />
                            <h4 className="font-medium">Milk Production</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Daily Yield</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {selectedBreed.production.milkYield.daily}L
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Lactation Period</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {selectedBreed.production.milkYield.lactationPeriod} days
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBreed.production.eggProduction && (
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Egg className="h-5 w-5 text-yellow-600" />
                            <h4 className="font-medium">Egg Production</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Daily Average</p>
                              <p className="text-2xl font-bold text-yellow-600">
                                {selectedBreed.production.eggProduction.daily} eggs
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Yearly Total</p>
                              <p className="text-2xl font-bold text-yellow-600">
                                {selectedBreed.production.eggProduction.yearlyTotal} eggs
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBreed.production.meatYield && (
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Beef className="h-5 w-5 text-red-600" />
                            <h4 className="font-medium">Meat Production</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Dressed Weight</p>
                              <p className="text-2xl font-bold text-red-600">
                                {selectedBreed.production.meatYield.dressedWeight}kg
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Feed Conversion</p>
                              <p className="text-2xl font-bold text-red-600">
                                {selectedBreed.production.meatYield.feedConversion}:1
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium mb-3">Breeding Information</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Breeding Age</p>
                            <p className="font-bold">{selectedBreed.production.breeding.breedingAge} months</p>
                          </div>
                          {selectedBreed.production.breeding.gestationPeriod && (
                            <div>
                              <p className="text-gray-600">Gestation</p>
                              <p className="font-bold">{selectedBreed.production.breeding.gestationPeriod} days</p>
                            </div>
                          )}
                          {selectedBreed.production.breeding.incubationPeriod && (
                            <div>
                              <p className="text-gray-600">Incubation</p>
                              <p className="font-bold">{selectedBreed.production.breeding.incubationPeriod} days</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-600">Litter Size</p>
                            <p className="font-bold">{selectedBreed.production.breeding.litterSize}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Cycles/Year</p>
                            <p className="font-bold">{selectedBreed.production.breeding.breedingCycle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="management">
                <Card>
                  <CardHeader>
                    <CardTitle>Management Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-600" />
                          Feed Requirements
                        </h4>
                        <ul className="space-y-2">
                          {selectedBreed.management.feedRequirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          Housing Needs
                        </h4>
                        <ul className="space-y-2">
                          {selectedBreed.management.housingNeeds.map((need, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          Health Concerns
                        </h4>
                        <ul className="space-y-2">
                          {selectedBreed.management.healthConcerns.map((concern, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Heart className="h-4 w-4 text-purple-600" />
                          Special Care
                        </h4>
                        <ul className="space-y-2">
                          {selectedBreed.management.specialCare.map((care, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Heart className="h-3 w-3 text-purple-600 mt-1 flex-shrink-0" />
                              {care}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="economics">
                <Card>
                  <CardHeader>
                    <CardTitle>Economic Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Initial Investment</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            ${selectedBreed.economics.initialCost.min.toLocaleString()} - ${selectedBreed.economics.initialCost.max.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Per animal</p>
                        </div>

                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span className="font-medium">Monthly Maintenance</span>
                          </div>
                          <p className="text-2xl font-bold text-red-600">
                            ${selectedBreed.economics.maintenanceCost.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Per animal per month</p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Potential Revenue</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            ${selectedBreed.economics.potentialRevenue.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Per animal per month</p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Payback Period</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedBreed.economics.paybackPeriod}
                          </p>
                          <p className="text-sm text-gray-600">Months</p>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Profitability Assessment</h4>
                          <Badge className={getProfitabilityColor(selectedBreed.economics.profitability)}>
                            {selectedBreed.economics.profitability} profitability
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Monthly Revenue:</span>
                            <span className="font-bold text-green-600">
                              +${selectedBreed.economics.potentialRevenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Costs:</span>
                            <span className="font-bold text-red-600">
                              -${selectedBreed.economics.maintenanceCost.toLocaleString()}
                            </span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Net Monthly Profit:</span>
                              <span className="text-blue-600">
                                ${(selectedBreed.economics.potentialRevenue - selectedBreed.economics.maintenanceCost).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suitability">
                <Card>
                  <CardHeader>
                    <CardTitle>Suitability Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Beginner Friendly</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedBreed.suitability.beginnerFriendly ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-green-600 font-medium">Yes - Good for beginners</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="text-red-600 font-medium">No - Requires experience</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Farm Size</span>
                          </div>
                          <p className="font-medium capitalize">
                            {selectedBreed.suitability.farmSize === 'all' ? 'All farm sizes' : `${selectedBreed.suitability.farmSize} farms`}
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Market Demand</span>
                          </div>
                          <Badge className={
                            selectedBreed.suitability.marketDemand === 'high' ? 'bg-green-100 text-green-800' :
                            selectedBreed.suitability.marketDemand === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {selectedBreed.suitability.marketDemand} demand
                          </Badge>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">Overall Rating</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= selectedBreed.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="font-bold">{selectedBreed.rating}/5</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-blue-600" />
                          Suitable Climate Zones
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedBreed.suitability.climateZones.map((zone, index) => (
                            <Badge key={index} variant="outline">
                              {zone}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          Recommendation Summary
                        </h4>
                        <p className="text-sm text-blue-800">
                          This breed is {selectedBreed.suitability.beginnerFriendly ? 'suitable for beginners' : 'recommended for experienced farmers'} 
                          {' '}and works well on {selectedBreed.suitability.farmSize === 'all' ? 'farms of any size' : `${selectedBreed.suitability.farmSize} farms`}. 
                          Market demand is {selectedBreed.suitability.marketDemand} with {selectedBreed.economics.profitability} profitability potential.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Breed</h3>
                  <p className="text-gray-500">Choose a breed from the list to view detailed information</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default BreedInformationDatabase;