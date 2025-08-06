import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Leaf,
  TrendingUp,
  TrendingDown,
  Award,
  Calculator,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Recycle,
  TreePine,
  Wind,
  Sun,
  Droplets,
  CloudRain,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Upload,
  Share2,
  Eye,
  Search,
  Filter,
  Settings,
  Bell,
  Globe,
  Users,
  DollarSign,
  FileText,
  Camera,
  Smartphone,
  Database,
  Shield,
  Star,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ExternalLink,
  Copy,
  X,
  Check,
  Package,
  Truck,
  Factory,
  Home,
  Lightbulb,
  Flame,
  Cpu
} from 'lucide-react';

interface CarbonProject {
  id: string;
  farmId: string;
  farmer: FarmerInfo;
  projectType: 'reforestation' | 'soil_carbon' | 'renewable_energy' | 'methane_reduction' | 'water_conservation' | 'waste_reduction';
  title: string;
  description: string;
  status: 'planning' | 'implementation' | 'monitoring' | 'verification' | 'certified' | 'trading';
  startDate: Date;
  endDate?: Date;
  projectArea: number; // hectares
  location: {
    coordinates: [number, number];
    address: string;
    region: string;
  };
  methodology: string;
  certificationStandard: string;
  estimatedCredits: number;
  actualCredits: number;
  creditsIssued: number;
  creditsSold: number;
  pricePerCredit: number;
  totalRevenue: number;
  activities: CarbonActivity[];
  measurements: CarbonMeasurement[];
  verifications: Verification[];
  documents: ProjectDocument[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FarmerInfo {
  id: string;
  name: string;
  farmName: string;
  avatar: string;
  location: string;
  verified: boolean;
  rating: number;
}

interface CarbonActivity {
  id: string;
  projectId: string;
  type: 'planting' | 'composting' | 'solar_installation' | 'biogas_setup' | 'water_conservation' | 'waste_reduction';
  title: string;
  description: string;
  date: Date;
  area?: number;
  quantity?: number;
  unit?: string;
  carbonImpact: number; // tCO2e
  cost: number;
  status: 'planned' | 'in_progress' | 'completed' | 'verified';
  evidence: ActivityEvidence[];
  location: {
    coordinates: [number, number];
    address: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
  notes: string;
}

interface ActivityEvidence {
  id: string;
  type: 'photo' | 'video' | 'document' | 'measurement';
  url: string;
  thumbnail?: string;
  caption: string;
  timestamp: Date;
  gpsCoordinates?: [number, number];
  verified: boolean;
}

interface CarbonMeasurement {
  id: string;
  projectId: string;
  measurementType: 'biomass' | 'soil_carbon' | 'methane' | 'energy_production' | 'water_saved';
  date: Date;
  value: number;
  unit: string;
  methodology: string;
  equipment: string;
  operator: string;
  location: {
    coordinates: [number, number];
    plotId: string;
  };
  quality: 'high' | 'medium' | 'low';
  verified: boolean;
  notes: string;
  images: string[];
}

interface Verification {
  id: string;
  projectId: string;
  verifier: {
    name: string;
    organization: string;
    certification: string;
  };
  verificationDate: Date;
  reportUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'requires_revision';
  creditsVerified: number;
  findings: string[];
  recommendations: string[];
  nextVerificationDue?: Date;
}

interface ProjectDocument {
  id: string;
  name: string;
  type: 'project_design' | 'monitoring_plan' | 'verification_report' | 'certificate' | 'other';
  url: string;
  uploadDate: Date;
  version: string;
  status: 'draft' | 'final' | 'approved';
  size: number;
}

interface CarbonMarket {
  id: string;
  name: string;
  description: string;
  currentPrice: number;
  priceChange: number;
  currency: string;
  volume24h: number;
  marketCap: number;
  standards: string[];
  requirements: string[];
}

interface CreditListing {
  id: string;
  projectId: string;
  project: CarbonProject;
  creditsAvailable: number;
  pricePerCredit: number;
  currency: string;
  vintage: number; // year
  certification: string;
  methodology: string;
  cobenefits: string[];
  isVerified: boolean;
  seller: {
    name: string;
    rating: number;
    verified: boolean;
  };
  listedDate: Date;
  expiryDate: Date;
  status: 'active' | 'sold' | 'expired' | 'suspended';
}

const mockFarmer: FarmerInfo = {
  id: 'farmer-001',
  name: 'Amina Hassan',
  farmName: 'Hassan Organic Farm',
  avatar: '/api/placeholder/64/64',
  location: 'Kano State, Nigeria',
  verified: true,
  rating: 4.8
};

const mockCarbonProject: CarbonProject = {
  id: 'carbon-001',
  farmId: 'farm-001',
  farmer: mockFarmer,
  projectType: 'reforestation',
  title: 'Community Reforestation & Soil Carbon Project',
  description: 'Large-scale tree planting and soil carbon sequestration project covering 50 hectares of degraded farmland with native species restoration.',
  status: 'implementation',
  startDate: new Date('2023-03-01'),
  endDate: new Date('2030-03-01'),
  projectArea: 50,
  location: {
    coordinates: [8.5200, 8.3200],
    address: 'Hassan Organic Farm, Kano State',
    region: 'Northern Nigeria'
  },
  methodology: 'VM0007 REDD+ Methodology Framework (REDD-MF)',
  certificationStandard: 'Verified Carbon Standard (VCS)',
  estimatedCredits: 12500,
  actualCredits: 3200,
  creditsIssued: 2800,
  creditsSold: 1500,
  pricePerCredit: 15.50,
  totalRevenue: 23250,
  activities: [
    {
      id: 'activity-001',
      projectId: 'carbon-001',
      type: 'planting',
      title: 'Tree Planting Phase 1',
      description: 'Planted 5,000 indigenous trees including Baobab, Neem, and Acacia species',
      date: new Date('2023-06-15'),
      area: 10,
      quantity: 5000,
      unit: 'trees',
      carbonImpact: 125.5,
      cost: 150000,
      status: 'completed',
      evidence: [
        {
          id: 'evidence-001',
          type: 'photo',
          url: '/api/placeholder/400/300',
          caption: 'Newly planted seedlings in Section A',
          timestamp: new Date('2023-06-15T10:00:00Z'),
          gpsCoordinates: [8.5205, 8.3205],
          verified: true
        }
      ],
      location: {
        coordinates: [8.5205, 8.3205],
        address: 'Section A, Hassan Organic Farm'
      },
      weather: {
        temperature: 28,
        humidity: 65,
        rainfall: 5.2
      },
      notes: 'Excellent survival rate of 95% after 6 months'
    },
    {
      id: 'activity-002',
      projectId: 'carbon-001',
      type: 'composting',
      title: 'Organic Composting Initiative',
      description: 'Set up large-scale composting facility for crop residues and organic waste',
      date: new Date('2023-08-20'),
      quantity: 50,
      unit: 'tons',
      carbonImpact: 75.2,
      cost: 80000,
      status: 'completed',
      evidence: [
        {
          id: 'evidence-002',
          type: 'photo',
          url: '/api/placeholder/400/300',
          caption: 'Composting facility construction',
          timestamp: new Date('2023-08-20T14:00:00Z'),
          verified: true
        }
      ],
      location: {
        coordinates: [8.5195, 8.3210],
        address: 'Composting Area, Hassan Organic Farm'
      },
      weather: {
        temperature: 32,
        humidity: 58,
        rainfall: 0
      },
      notes: 'Compost quality meets organic certification standards'
    }
  ],
  measurements: [
    {
      id: 'measure-001',
      projectId: 'carbon-001',
      measurementType: 'biomass',
      date: new Date('2024-01-15'),
      value: 125.5,
      unit: 'tCO2e',
      methodology: 'Allometric equations for tropical species',
      equipment: 'DBH tape, clinometer, GPS',
      operator: 'Dr. Ibrahim Forestry Consultant',
      location: {
        coordinates: [8.5205, 8.3205],
        plotId: 'PLOT-A1'
      },
      quality: 'high',
      verified: true,
      notes: 'Trees showing excellent growth with average height increase of 2.5m/year',
      images: ['/api/placeholder/300/200']
    },
    {
      id: 'measure-002',
      projectId: 'carbon-001',
      measurementType: 'soil_carbon',
      date: new Date('2024-01-10'),
      value: 45.8,
      unit: 'tCO2e',
      methodology: 'Walkley-Black method',
      equipment: 'Soil auger, laboratory analysis',
      operator: 'Soil Science Laboratory',
      location: {
        coordinates: [8.5200, 8.3200],
        plotId: 'SOIL-B2'
      },
      quality: 'high',
      verified: true,
      notes: 'Soil organic carbon increased by 15% from baseline',
      images: ['/api/placeholder/300/200']
    }
  ],
  verifications: [
    {
      id: 'verify-001',
      projectId: 'carbon-001',
      verifier: {
        name: 'Green Verify International',
        organization: 'Carbon Verification Ltd',
        certification: 'VCS Approved'
      },
      verificationDate: new Date('2024-01-30'),
      reportUrl: '/docs/verification-report-001.pdf',
      status: 'approved',
      creditsVerified: 2800,
      findings: [
        'Project activities implemented according to plan',
        'Monitoring methodology correctly applied',
        'Baseline measurements accurate'
      ],
      recommendations: [
        'Continue current monitoring schedule',
        'Consider expanding to adjacent areas',
        'Improve data collection digitization'
      ],
      nextVerificationDue: new Date('2024-07-30')
    }
  ],
  documents: [
    {
      id: 'doc-001',
      name: 'Project Design Document',
      type: 'project_design',
      url: '/docs/pdd-carbon-001.pdf',
      uploadDate: new Date('2023-02-15'),
      version: '1.2',
      status: 'approved',
      size: 2048000
    },
    {
      id: 'doc-002',
      name: 'Monitoring Plan',
      type: 'monitoring_plan',
      url: '/docs/monitoring-plan-001.pdf',
      uploadDate: new Date('2023-02-20'),
      version: '1.0',
      status: 'approved',
      size: 1024000
    }
  ],
  images: ['/api/placeholder/600/400', '/api/placeholder/600/400', '/api/placeholder/600/400'],
  isActive: true,
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2024-01-20')
};

const mockCarbonMarkets: CarbonMarket[] = [
  {
    id: 'market-001',
    name: 'Voluntary Carbon Market',
    description: 'Global marketplace for verified carbon credits',
    currentPrice: 15.50,
    priceChange: 2.3,
    currency: 'USD',
    volume24h: 125000,
    marketCap: 2500000000,
    standards: ['VCS', 'Gold Standard', 'CAR', 'ACR'],
    requirements: ['Third-party verification', 'Permanent sequestration', 'Additionality proof']
  },
  {
    id: 'market-002',
    name: 'African Carbon Exchange',
    description: 'Regional carbon market for African projects',
    currentPrice: 12.80,
    priceChange: -1.2,
    currency: 'USD',
    volume24h: 45000,
    marketCap: 850000000,
    standards: ['VCS', 'Gold Standard'],
    requirements: ['Local community involvement', 'Sustainable development goals', 'Biodiversity co-benefits']
  }
];

const mockCreditListings: CreditListing[] = [
  {
    id: 'listing-001',
    projectId: 'carbon-001',
    project: mockCarbonProject,
    creditsAvailable: 1300,
    pricePerCredit: 15.50,
    currency: 'USD',
    vintage: 2023,
    certification: 'VCS',
    methodology: 'VM0007',
    cobenefits: ['Biodiversity', 'Community Development', 'Soil Health'],
    isVerified: true,
    seller: {
      name: 'Hassan Organic Farm',
      rating: 4.8,
      verified: true
    },
    listedDate: new Date('2024-01-15'),
    expiryDate: new Date('2024-04-15'),
    status: 'active'
  }
];

export function CarbonCreditSystem() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<CarbonProject[]>([mockCarbonProject]);
  const [selectedProject, setSelectedProject] = useState<CarbonProject>(mockCarbonProject);
  const [markets] = useState<CarbonMarket[]>(mockCarbonMarkets);
  const [listings] = useState<CreditListing[]>(mockCreditListings);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'planting',
    title: '',
    description: '',
    quantity: '',
    unit: 'trees',
    cost: ''
  });

  const projectTypeIcons = {
    reforestation: TreePine,
    soil_carbon: Leaf,
    renewable_energy: Sun,
    methane_reduction: Wind,
    water_conservation: Droplets,
    waste_reduction: Recycle
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'reforestation': return 'bg-green-100 text-green-800';
      case 'soil_carbon': return 'bg-amber-100 text-amber-800';
      case 'renewable_energy': return 'bg-yellow-100 text-yellow-800';
      case 'methane_reduction': return 'bg-blue-100 text-blue-800';
      case 'water_conservation': return 'bg-cyan-100 text-cyan-800';
      case 'waste_reduction': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'certified': return 'bg-green-100 text-green-800';
      case 'verification': return 'bg-blue-100 text-blue-800';
      case 'implementation': return 'bg-orange-100 text-orange-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'trading': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateCarbonImpact = (activity: typeof newActivity) => {
    // Simplified calculation - in reality this would be much more complex
    const baseImpact = {
      planting: 0.025, // tCO2e per tree
      composting: 1.5, // tCO2e per ton
      solar_installation: 2.0, // tCO2e per kW
      biogas_setup: 3.0, // tCO2e per unit
      water_conservation: 0.8, // tCO2e per unit
      waste_reduction: 1.2 // tCO2e per ton
    };

    const quantity = parseFloat(activity.quantity) || 0;
    return (baseImpact[activity.type as keyof typeof baseImpact] || 0) * quantity;
  };

  const addActivity = () => {
    if (!newActivity.title || !newActivity.quantity) return;

    const activity: CarbonActivity = {
      id: `activity-${Date.now()}`,
      projectId: selectedProject.id,
      type: newActivity.type as any,
      title: newActivity.title,
      description: newActivity.description,
      date: new Date(),
      quantity: parseFloat(newActivity.quantity),
      unit: newActivity.unit,
      carbonImpact: calculateCarbonImpact(newActivity),
      cost: parseFloat(newActivity.cost) || 0,
      status: 'planned',
      evidence: [],
      location: {
        coordinates: selectedProject.location.coordinates,
        address: selectedProject.location.address
      },
      weather: {
        temperature: 25,
        humidity: 60,
        rainfall: 0
      },
      notes: ''
    };

    const updatedProject = {
      ...selectedProject,
      activities: [...selectedProject.activities, activity],
      estimatedCredits: selectedProject.estimatedCredits + Math.round(activity.carbonImpact)
    };

    setSelectedProject(updatedProject);
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    setNewActivity({
      type: 'planting',
      title: '',
      description: '',
      quantity: '',
      unit: 'trees',
      cost: ''
    });
    setShowActivityForm(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const ProjectIcon = projectTypeIcons[selectedProject.projectType];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Carbon Credit Management</h1>
        <p className="text-gray-600">Track, verify, and trade your carbon sequestration projects</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Credits Earned</p>
                        <p className="text-2xl font-bold text-green-600">{selectedProject.actualCredits.toLocaleString()}</p>
                      </div>
                      <Award className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      +{Math.round((selectedProject.actualCredits / selectedProject.estimatedCredits) * 100)}% of target
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Revenue Generated</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedProject.totalRevenue)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      {formatCurrency(selectedProject.pricePerCredit)}/credit avg
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Project Area</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedProject.projectArea}</p>
                      </div>
                      <MapPin className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-xs text-purple-600 mt-2">hectares covered</p>
                  </CardContent>
                </Card>
              </div>

              {/* Current Project */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getProjectTypeColor(selectedProject.projectType)}`}>
                        <ProjectIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{selectedProject.title}</CardTitle>
                        <p className="text-sm text-gray-600">{selectedProject.location.region}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{selectedProject.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Methodology</p>
                      <p className="font-medium">{selectedProject.methodology}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Certification</p>
                      <p className="font-medium">{selectedProject.certificationStandard}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{selectedProject.startDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Project Duration</p>
                      <p className="font-medium">
                        {selectedProject.endDate ? 
                          Math.round((selectedProject.endDate.getTime() - selectedProject.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365))
                          : 'Ongoing'} years
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Credits Progress</span>
                      <span>{selectedProject.actualCredits} / {selectedProject.estimatedCredits}</span>
                    </div>
                    <Progress 
                      value={(selectedProject.actualCredits / selectedProject.estimatedCredits) * 100} 
                      className="h-2" 
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => setActiveTab('activities')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Activity
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('measurements')}>
                      <Calculator className="w-4 h-4 mr-2" />
                      Record Measurement
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Activities</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('activities')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedProject.activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className={`p-2 rounded-full bg-green-100`}>
                          {activity.type === 'planting' && <TreePine className="w-4 h-4 text-green-600" />}
                          {activity.type === 'composting' && <Recycle className="w-4 h-4 text-green-600" />}
                          {activity.type === 'solar_installation' && <Sun className="w-4 h-4 text-green-600" />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{activity.title}</h3>
                          <p className="text-xs text-gray-600">
                            {activity.date.toLocaleDateString()} • {activity.quantity} {activity.unit}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{activity.carbonImpact.toFixed(1)} tCO₂e</p>
                          <Badge className={getStatusColor(activity.status)} variant="secondary">
                            {activity.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Farmer Profile */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedProject.farmer.avatar} />
                      <AvatarFallback>{selectedProject.farmer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{selectedProject.farmer.name}</h3>
                        {selectedProject.farmer.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-sm text-gray-600">{selectedProject.farmer.farmName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(selectedProject.farmer.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{selectedProject.farmer.rating}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{selectedProject.farmer.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Prices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Carbon Market Prices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {markets.map((market) => (
                      <div key={market.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">{market.name}</h4>
                          <div className="flex items-center gap-1">
                            {market.priceChange >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={`text-xs ${market.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {market.priceChange >= 0 ? '+' : ''}{market.priceChange}%
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(market.currentPrice)}</p>
                        <p className="text-xs text-gray-600">Volume: {market.volume24h.toLocaleString()} credits</p>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('marketplace')}>
                    <Globe className="w-4 h-4 mr-2" />
                    View Marketplace
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowActivityForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log New Activity
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowMeasurementForm(true)}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Add Measurement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Evidence
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const ProjectTypeIcon = projectTypeIcons[project.projectType];
              return (
                <Card key={project.id} className="overflow-hidden">
                  <div className="relative h-48 bg-cover bg-center" style={{backgroundImage: `url(${project.images[0]})`}}>
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className={getProjectTypeColor(project.projectType)}>
                        <ProjectTypeIcon className="w-3 h-3 mr-1" />
                        {project.projectType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                        <p className="text-sm text-gray-600">{project.location.region} • {project.projectArea} hectares</p>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-2">{project.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Credits Earned</p>
                          <p className="font-semibold text-green-600">{project.actualCredits.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-semibold text-blue-600">{formatCurrency(project.totalRevenue)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{Math.round((project.actualCredits / project.estimatedCredits) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(project.actualCredits / project.estimatedCredits) * 100} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedProject(project);
                            setActiveTab('dashboard');
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Add New Project Card */}
            <Card className="border-2 border-dashed border-gray-300 flex items-center justify-center h-64">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Start New Project
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Project Activities</h2>
              <Button onClick={() => setShowActivityForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedProject.activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg bg-green-100`}>
                          {activity.type === 'planting' && <TreePine className="w-5 h-5 text-green-600" />}
                          {activity.type === 'composting' && <Recycle className="w-5 h-5 text-green-600" />}
                          {activity.type === 'solar_installation' && <Sun className="w-5 h-5 text-green-600" />}
                        </div>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Quantity</p>
                          <p className="font-medium">{activity.quantity} {activity.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Carbon Impact</p>
                          <p className="font-medium text-green-600">{activity.carbonImpact.toFixed(1)} tCO₂e</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-medium">{activity.date.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cost</p>
                          <p className="font-medium">₦{activity.cost.toLocaleString()}</p>
                        </div>
                      </div>

                      {activity.evidence.length > 0 && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Camera className="w-3 h-3 mr-1" />
                            Photos ({activity.evidence.length})
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="measurements">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Carbon Measurements</h2>
              <Button onClick={() => setShowMeasurementForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Measurement
              </Button>
            </div>

            <div className="space-y-4">
              {selectedProject.measurements.map((measurement) => (
                <Card key={measurement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calculator className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">
                              {measurement.measurementType.replace('_', ' ')} Measurement
                            </h3>
                            <p className="text-sm text-gray-600">
                              {measurement.date.toLocaleDateString()} by {measurement.operator}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Value</p>
                            <p className="text-lg font-bold text-green-600">
                              {measurement.value} {measurement.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Methodology</p>
                            <p className="font-medium">{measurement.methodology}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Quality</p>
                            <Badge className={measurement.quality === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {measurement.quality}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700">{measurement.notes}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {measurement.verified && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marketplace">
          <div className="space-y-6">
            {/* Market Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {markets.map((market) => (
                <Card key={market.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{market.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {market.priceChange >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-semibold ${market.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {market.priceChange >= 0 ? '+' : ''}{market.priceChange}%
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{market.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-3xl font-bold">{formatCurrency(market.currentPrice)}</p>
                        <p className="text-sm text-gray-600">per carbon credit</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">24h Volume</p>
                          <p className="font-semibold">{market.volume24h.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Market Cap</p>
                          <p className="font-semibold">{formatCurrency(market.marketCap / 1000000)}M</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Standards Accepted</p>
                        <div className="flex flex-wrap gap-1">
                          {market.standards.map((standard) => (
                            <Badge key={standard} variant="outline" className="text-xs">
                              {standard}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Available Credits */}
            <Card>
              <CardHeader>
                <CardTitle>Your Available Credits</CardTitle>
                <p className="text-gray-600">Credits ready for trading</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getProjectTypeColor(listing.project.projectType)}>
                            {listing.project.projectType.replace('_', ' ')}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            {listing.certification}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-semibold truncate">{listing.project.title}</h3>
                          <p className="text-sm text-gray-600">Vintage {listing.vintage}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Available</p>
                            <p className="font-semibold">{listing.creditsAvailable.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Price</p>
                            <p className="font-semibold">{formatCurrency(listing.pricePerCredit)}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium">Co-benefits</p>
                          <div className="flex flex-wrap gap-1">
                            {listing.cobenefits.map((benefit) => (
                              <Badge key={benefit} variant="outline" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button className="w-full" size="sm">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Sell Credits
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Carbon Impact Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mb-4" />
                  <p>Carbon sequestration chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <PieChart className="w-12 h-12 mb-4" />
                  <p>Revenue breakdown chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round((selectedProject.actualCredits / selectedProject.estimatedCredits) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Target Achievement</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedProject.totalRevenue / selectedProject.actualCredits)}
                    </p>
                    <p className="text-sm text-gray-600">Avg Price per Credit</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedProject.activities.length}
                    </p>
                    <p className="text-sm text-gray-600">Activities Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedProject.measurements.length}
                    </p>
                    <p className="text-sm text-gray-600">Measurements Taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Activity Modal */}
      {showActivityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Log New Activity</h3>
              <Button variant="ghost" onClick={() => setShowActivityForm(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Activity Type</label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="planting">Tree Planting</option>
                  <option value="composting">Composting</option>
                  <option value="solar_installation">Solar Installation</option>
                  <option value="biogas_setup">Biogas Setup</option>
                  <option value="water_conservation">Water Conservation</option>
                  <option value="waste_reduction">Waste Reduction</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="Activity title"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe the activity"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newActivity.quantity}
                    onChange={(e) => setNewActivity({...newActivity, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Unit</label>
                  <select
                    value={newActivity.unit}
                    onChange={(e) => setNewActivity({...newActivity, unit: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="trees">Trees</option>
                    <option value="tons">Tons</option>
                    <option value="kW">kW</option>
                    <option value="units">Units</option>
                    <option value="liters">Liters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cost (₦)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newActivity.cost}
                  onChange={(e) => setNewActivity({...newActivity, cost: e.target.value})}
                />
              </div>

              {newActivity.quantity && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    Estimated Carbon Impact: <strong>{calculateCarbonImpact(newActivity).toFixed(2)} tCO₂e</strong>
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={addActivity}>
                  Add Activity
                </Button>
                <Button variant="outline" onClick={() => setShowActivityForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarbonCreditSystem;