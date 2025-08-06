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
  QrCode,
  Scan,
  Package,
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Share2,
  Eye,
  Camera,
  Upload,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Shield,
  Leaf,
  Award,
  Users,
  Globe,
  Smartphone,
  Printer,
  FileText,
  Database,
  Link,
  ArrowRight,
  ArrowLeft,
  Route,
  Factory,
  Store,
  Home,
  Utensils,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Bug,
  Zap,
  Recycle,
  Heart,
  Star,
  MessageSquare,
  ExternalLink,
  Copy,
  RefreshCw,
  X,
  Plus,
  Settings,
  Bell
} from 'lucide-react';

interface TraceabilityRecord {
  id: string;
  productId: string;
  batchId: string;
  qrCode: string;
  product: ProductInfo;
  farmer: FarmerInfo;
  journey: TraceabilityStep[];
  certifications: CertificationRecord[];
  qualityChecks: QualityCheck[];
  sustainability: SustainabilityMetrics;
  consumer: ConsumerInfo;
  status: 'active' | 'completed' | 'recalled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

interface ProductInfo {
  name: string;
  variety: string;
  category: string;
  harvestDate: Date;
  expiryDate?: Date;
  weight: number;
  unit: string;
  packagingType: string;
  storageConditions: string;
  nutritionalInfo: Record<string, string>;
  images: string[];
}

interface FarmerInfo {
  id: string;
  name: string;
  farmName: string;
  avatar: string;
  location: string;
  coordinates: [number, number];
  verified: boolean;
  rating: number;
  certifications: string[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
}

interface TraceabilityStep {
  id: string;
  stage: 'production' | 'harvest' | 'processing' | 'packaging' | 'storage' | 'transport' | 'retail' | 'consumer';
  title: string;
  description: string;
  location: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  timestamp: Date;
  actor: {
    name: string;
    role: string;
    id: string;
  };
  data: Record<string, any>;
  images: string[];
  documents: DocumentRecord[];
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  temperature?: number;
  humidity?: number;
  conditions?: string[];
}

interface CertificationRecord {
  id: string;
  name: string;
  issuer: string;
  certificateNumber: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationUrl?: string;
  logo?: string;
  verified: boolean;
}

interface QualityCheck {
  id: string;
  stage: string;
  inspector: string;
  inspectionDate: Date;
  parameters: QualityParameter[];
  overallScore: number;
  passed: boolean;
  notes: string;
  images: string[];
  certificateUrl?: string;
}

interface QualityParameter {
  name: string;
  value: string | number;
  unit?: string;
  standard: string;
  passed: boolean;
}

interface SustainabilityMetrics {
  carbonFootprint: number; // kg CO2
  waterUsage: number; // liters
  pesticidesUsed: boolean;
  organicCompliant: boolean;
  locallySourced: boolean;
  renewableEnergy: number; // percentage
  wasteReduction: number; // percentage
  score: number; // out of 100
}

interface ConsumerInfo {
  scanCount: number;
  lastScanned?: Date;
  ratings: ConsumerRating[];
  feedback: ConsumerFeedback[];
}

interface ConsumerRating {
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
}

interface ConsumerFeedback {
  id: string;
  type: 'quality' | 'freshness' | 'packaging' | 'taste' | 'other';
  message: string;
  date: Date;
  helpful: number;
}

interface DocumentRecord {
  id: string;
  name: string;
  type: 'certificate' | 'invoice' | 'test_report' | 'permit' | 'other';
  url: string;
  uploadDate: Date;
  verified: boolean;
}

const mockTraceabilityRecord: TraceabilityRecord = {
  id: 'trace-001',
  productId: 'prod-001',
  batchId: 'BATCH-2024-001',
  qrCode: 'https://agrinexus.com/trace/trace-001',
  product: {
    name: 'Organic Roma Tomatoes',
    variety: 'Roma VF',
    category: 'Vegetables',
    harvestDate: new Date('2024-01-15'),
    expiryDate: new Date('2024-01-25'),
    weight: 500,
    unit: 'grams',
    packagingType: 'Biodegradable crate',
    storageConditions: 'Cool, dry place (15-18°C)',
    nutritionalInfo: {
      'Calories': '18 per 100g',
      'Vitamin C': '28mg',
      'Lycopene': '2573μg',
      'Potassium': '237mg',
      'Fiber': '1.2g'
    },
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300']
  },
  farmer: {
    id: 'farmer-001',
    name: 'Amina Hassan',
    farmName: 'Hassan Organic Farm',
    avatar: '/api/placeholder/64/64',
    location: 'Kano State, Nigeria',
    coordinates: [8.5200, 8.3200],
    verified: true,
    rating: 4.8,
    certifications: ['Organic Certified', 'Fair Trade', 'Global GAP'],
    contactInfo: {
      phone: '+234-803-123-4567',
      email: 'amina@hassanfarm.com',
      website: 'https://hassanfarm.com'
    }
  },
  journey: [
    {
      id: 'step-1',
      stage: 'production',
      title: 'Seed Planting',
      description: 'Organic Roma tomato seeds planted in greenhouse',
      location: {
        name: 'Hassan Organic Farm - Greenhouse A',
        coordinates: [8.5200, 8.3200],
        address: 'Farm Plot 15, Kano State'
      },
      timestamp: new Date('2023-11-01T08:00:00Z'),
      actor: {
        name: 'Amina Hassan',
        role: 'Farm Owner',
        id: 'farmer-001'
      },
      data: {
        seedVariety: 'Roma VF Organic',
        seedSource: 'Heritage Seeds Ltd',
        plantingMethod: 'Greenhouse cultivation',
        soilType: 'Organic loam',
        seedCount: 150
      },
      images: ['/api/placeholder/300/200'],
      documents: [
        {
          id: 'doc-1',
          name: 'Seed Certificate',
          type: 'certificate',
          url: '/docs/seed-cert-001.pdf',
          uploadDate: new Date('2023-11-01'),
          verified: true
        }
      ],
      status: 'completed',
      temperature: 24,
      humidity: 65,
      conditions: ['Controlled environment', 'Organic soil preparation']
    },
    {
      id: 'step-2',
      stage: 'production',
      title: 'Growth & Care',
      description: 'Regular monitoring, organic fertilization, and pest management',
      location: {
        name: 'Hassan Organic Farm - Field B',
        coordinates: [8.5201, 8.3201],
        address: 'Farm Plot 15, Kano State'
      },
      timestamp: new Date('2023-12-15T10:30:00Z'),
      actor: {
        name: 'Ibrahim Sani',
        role: 'Farm Manager',
        id: 'manager-001'
      },
      data: {
        fertilizer: 'Organic compost',
        irrigationMethod: 'Drip irrigation',
        pestControl: 'Biological pest control',
        growthStage: 'Flowering'
      },
      images: ['/api/placeholder/300/200'],
      documents: [],
      status: 'completed',
      temperature: 22,
      humidity: 70,
      conditions: ['Regular watering', 'Organic fertilization', 'Beneficial insects released']
    },
    {
      id: 'step-3',
      stage: 'harvest',
      title: 'Harvest',
      description: 'Hand-picked at optimal ripeness',
      location: {
        name: 'Hassan Organic Farm - Field B',
        coordinates: [8.5201, 8.3201],
        address: 'Farm Plot 15, Kano State'
      },
      timestamp: new Date('2024-01-15T06:00:00Z'),
      actor: {
        name: 'Harvest Team',
        role: 'Farm Workers',
        id: 'team-001'
      },
      data: {
        harvestMethod: 'Hand-picked',
        quantity: '50kg',
        quality: 'Premium',
        brixLevel: '4.5°',
        moistureContent: '94%'
      },
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
      documents: [],
      status: 'completed',
      temperature: 18,
      humidity: 55,
      conditions: ['Early morning harvest', 'Optimal ripeness', 'Cool weather']
    },
    {
      id: 'step-4',
      stage: 'processing',
      title: 'Sorting & Grading',
      description: 'Quality inspection and grading by size and quality',
      location: {
        name: 'Hassan Farm Processing Center',
        coordinates: [8.5195, 8.3205],
        address: 'Processing Center, Kano State'
      },
      timestamp: new Date('2024-01-15T10:00:00Z'),
      actor: {
        name: 'Quality Team',
        role: 'Quality Inspectors',
        id: 'quality-001'
      },
      data: {
        gradingStandard: 'Premium Grade A',
        rejectPercentage: '5%',
        averageWeight: '85g',
        colorGrade: 'Deep Red',
        defectRate: '2%'
      },
      images: ['/api/placeholder/300/200'],
      documents: [
        {
          id: 'doc-2',
          name: 'Quality Inspection Report',
          type: 'test_report',
          url: '/docs/quality-report-001.pdf',
          uploadDate: new Date('2024-01-15'),
          verified: true
        }
      ],
      status: 'completed',
      temperature: 16,
      humidity: 60,
      conditions: ['Climate controlled', 'Sanitized environment']
    },
    {
      id: 'step-5',
      stage: 'packaging',
      title: 'Packaging',
      description: 'Packed in biodegradable crates with traceability labels',
      location: {
        name: 'Hassan Farm Processing Center',
        coordinates: [8.5195, 8.3205],
        address: 'Processing Center, Kano State'
      },
      timestamp: new Date('2024-01-15T14:00:00Z'),
      actor: {
        name: 'Packaging Team',
        role: 'Packaging Specialists',
        id: 'pack-001'
      },
      data: {
        packagingType: 'Biodegradable crate',
        packageWeight: '500g',
        labelInfo: 'QR code, batch number, harvest date',
        packagingMaterial: 'Recycled cardboard'
      },
      images: ['/api/placeholder/300/200'],
      documents: [],
      status: 'completed',
      temperature: 15,
      humidity: 65,
      conditions: ['Hygienic packaging', 'Temperature controlled']
    },
    {
      id: 'step-6',
      stage: 'storage',
      title: 'Cold Storage',
      description: 'Stored in temperature-controlled facility',
      location: {
        name: 'AgriCold Storage Facility',
        coordinates: [8.5180, 8.3220],
        address: 'Industrial Area, Kano'
      },
      timestamp: new Date('2024-01-15T16:00:00Z'),
      actor: {
        name: 'Storage Manager',
        role: 'Facility Manager',
        id: 'storage-001'
      },
      data: {
        storageTemperature: '4°C',
        humidity: '85-90%',
        duration: '2 days',
        facilityType: 'Cold storage'
      },
      images: ['/api/placeholder/300/200'],
      documents: [],
      status: 'completed',
      temperature: 4,
      humidity: 88,
      conditions: ['Optimal storage conditions', 'Regular monitoring']
    },
    {
      id: 'step-7',
      stage: 'transport',
      title: 'Transportation',
      description: 'Transported in refrigerated truck to retail outlet',
      location: {
        name: 'Lagos Fresh Market',
        coordinates: [6.5244, 3.3792],
        address: 'Victoria Island, Lagos'
      },
      timestamp: new Date('2024-01-17T08:00:00Z'),
      actor: {
        name: 'FreshLogistics Ltd',
        role: 'Transport Company',
        id: 'transport-001'
      },
      data: {
        vehicleType: 'Refrigerated truck',
        transportTemp: '6°C',
        distance: '750km',
        duration: '12 hours',
        driverName: 'Musa Abdullahi'
      },
      images: ['/api/placeholder/300/200'],
      documents: [
        {
          id: 'doc-3',
          name: 'Transport Certificate',
          type: 'permit',
          url: '/docs/transport-001.pdf',
          uploadDate: new Date('2024-01-17'),
          verified: true
        }
      ],
      status: 'completed',
      temperature: 6,
      humidity: 85,
      conditions: ['Refrigerated transport', 'GPS tracked']
    },
    {
      id: 'step-8',
      stage: 'retail',
      title: 'Retail Display',
      description: 'Available for purchase at premium organic section',
      location: {
        name: 'FreshMart Organic Section',
        coordinates: [6.5244, 3.3792],
        address: 'Victoria Island, Lagos'
      },
      timestamp: new Date('2024-01-17T14:00:00Z'),
      actor: {
        name: 'FreshMart',
        role: 'Retail Store',
        id: 'retail-001'
      },
      data: {
        displayArea: 'Organic produce section',
        price: '₦450/500g',
        stockQuantity: '100 units',
        shelfLife: '8 days remaining'
      },
      images: ['/api/placeholder/300/200'],
      documents: [],
      status: 'completed',
      temperature: 8,
      humidity: 75,
      conditions: ['Refrigerated display', 'First-in-first-out rotation']
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'USDA Organic',
      issuer: 'Nigeria Organic Agriculture Network',
      certificateNumber: 'NOAN-ORG-2023-1547',
      issueDate: new Date('2023-03-15'),
      expiryDate: new Date('2025-03-15'),
      verificationUrl: 'https://verify.noan.org/cert/1547',
      logo: '/api/placeholder/40/40',
      verified: true
    },
    {
      id: 'cert-2',
      name: 'Global GAP',
      issuer: 'Global GAP International',
      certificateNumber: 'GG-2023-NG-4489',
      issueDate: new Date('2023-06-20'),
      expiryDate: new Date('2024-06-20'),
      verificationUrl: 'https://database.globalgap.org/cert/4489',
      logo: '/api/placeholder/40/40',
      verified: true
    }
  ],
  qualityChecks: [
    {
      id: 'qc-1',
      stage: 'Harvest',
      inspector: 'Dr. Kemi Adeyemi',
      inspectionDate: new Date('2024-01-15'),
      parameters: [
        { name: 'Size', value: '85mm', unit: 'mm', standard: '75-90mm', passed: true },
        { name: 'Color', value: 'Deep Red', standard: 'Red/Deep Red', passed: true },
        { name: 'Firmness', value: 'Good', standard: 'Good/Excellent', passed: true },
        { name: 'Brix Level', value: 4.5, unit: '°Bx', standard: '4.0-5.5°Bx', passed: true },
        { name: 'pH Level', value: 4.2, standard: '4.0-4.5', passed: true }
      ],
      overallScore: 95,
      passed: true,
      notes: 'Excellent quality tomatoes meeting all premium grade standards',
      images: ['/api/placeholder/300/200'],
      certificateUrl: '/docs/quality-cert-001.pdf'
    }
  ],
  sustainability: {
    carbonFootprint: 0.8,
    waterUsage: 120,
    pesticidesUsed: false,
    organicCompliant: true,
    locallySourced: true,
    renewableEnergy: 60,
    wasteReduction: 75,
    score: 92
  },
  consumer: {
    scanCount: 45,
    lastScanned: new Date('2024-01-20T10:30:00Z'),
    ratings: [
      {
        rating: 5,
        comment: 'Amazing quality, very fresh!',
        date: new Date('2024-01-18'),
        verified: true
      },
      {
        rating: 4,
        comment: 'Great taste, love knowing where it came from',
        date: new Date('2024-01-19'),
        verified: true
      }
    ],
    feedback: [
      {
        id: 'fb-1',
        type: 'quality',
        message: 'Best tomatoes I\'ve bought in months!',
        date: new Date('2024-01-18'),
        helpful: 5
      }
    ]
  },
  status: 'active',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20')
};

export function QRTraceabilitySystem() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [scannedCode, setScannedCode] = useState<string>('');
  const [traceabilityRecord, setTraceabilityRecord] = useState<TraceabilityRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState<TraceabilityStep | null>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [consumerRating, setConsumerRating] = useState(0);
  const [consumerFeedback, setConsumerFeedback] = useState('');

  const handleScanCode = async (code: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTraceabilityRecord(mockTraceabilityRecord);
      setLoading(false);
    }, 1500);
  };

  const handleManualEntry = () => {
    if (scannedCode.trim()) {
      handleScanCode(scannedCode);
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'production': return <Leaf className="w-5 h-5" />;
      case 'harvest': return <Sun className="w-5 h-5" />;
      case 'processing': return <Factory className="w-5 h-5" />;
      case 'packaging': return <Package className="w-5 h-5" />;
      case 'storage': return <Database className="w-5 h-5" />;
      case 'transport': return <Truck className="w-5 h-5" />;
      case 'retail': return <Store className="w-5 h-5" />;
      case 'consumer': return <Home className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'production': return 'bg-green-100 text-green-800';
      case 'harvest': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'packaging': return 'bg-purple-100 text-purple-800';
      case 'storage': return 'bg-gray-100 text-gray-800';
      case 'transport': return 'bg-orange-100 text-orange-800';
      case 'retail': return 'bg-pink-100 text-pink-800';
      case 'consumer': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-orange-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const submitConsumerFeedback = () => {
    // Handle consumer feedback submission
    console.log('Feedback submitted:', { rating: consumerRating, feedback: consumerFeedback });
    setConsumerRating(0);
    setConsumerFeedback('');
  };

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onChange && onChange(i + 1)}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Traceability System</h1>
        <p className="text-gray-600">Track your food from farm to table with complete transparency</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="journey">Product Journey</TabsTrigger>
          <TabsTrigger value="certificates">Certifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <QrCode className="w-6 h-6" />
                  Scan Product QR Code
                </CardTitle>
                <p className="text-gray-600">
                  Scan the QR code on your product packaging to view its complete journey
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {loading ? (
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Scanning...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Scan className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Position QR code here</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Or enter code manually:</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter QR code or batch number"
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                    />
                    <Button onClick={handleManualEntry} disabled={loading}>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Use Camera
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>

                {/* Demo Button */}
                <div className="pt-4 border-t">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => handleScanCode('demo')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Demo Product Journey
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey">
          {!traceabilityRecord ? (
            <Card>
              <CardContent className="p-12 text-center">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Scanned</h3>
                <p className="text-gray-600 mb-4">
                  Please scan a QR code or enter a product code to view its journey.
                </p>
                <Button onClick={() => setActiveTab('scanner')}>
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Product Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <img
                        src={traceabilityRecord.product.images[0]}
                        alt={traceabilityRecord.product.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold">{traceabilityRecord.product.name}</h2>
                        <p className="text-gray-600">{traceabilityRecord.product.variety} • {traceabilityRecord.product.category}</p>
                        <Badge className="mt-2" variant="secondary">
                          Batch: {traceabilityRecord.batchId}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Harvest Date</p>
                          <p className="font-medium">{traceabilityRecord.product.harvestDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Weight</p>
                          <p className="font-medium">{traceabilityRecord.product.weight}{traceabilityRecord.product.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Packaging</p>
                          <p className="font-medium">{traceabilityRecord.product.packagingType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Storage</p>
                          <p className="font-medium">{traceabilityRecord.product.storageConditions}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={traceabilityRecord.farmer.avatar} />
                            <AvatarFallback>{traceabilityRecord.farmer.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{traceabilityRecord.farmer.name}</p>
                              {traceabilityRecord.farmer.verified && (
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{traceabilityRecord.farmer.farmName}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {renderStars(traceabilityRecord.farmer.rating)}
                          <span className="ml-1 text-sm text-gray-600">{traceabilityRecord.farmer.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Journey Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5" />
                    Product Journey
                  </CardTitle>
                  <p className="text-gray-600">Complete traceability from farm to your table</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {traceabilityRecord.journey.map((step, index) => (
                      <div key={step.id} className="relative">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${getStageColor(step.stage)}`}>
                            {getStageIcon(step.stage)}
                          </div>
                          
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{step.title}</h3>
                              <Badge className={getStageColor(step.stage)}>
                                {step.stage.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-2">{step.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{step.timestamp.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span>{step.location.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span>{step.actor.name} ({step.actor.role})</span>
                              </div>
                            </div>

                            {step.temperature && (
                              <div className="mt-2 flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Thermometer className="w-4 h-4 text-blue-500" />
                                  <span>{step.temperature}°C</span>
                                </div>
                                {step.humidity && (
                                  <div className="flex items-center gap-1">
                                    <Droplets className="w-4 h-4 text-blue-500" />
                                    <span>{step.humidity}%</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {step.conditions && step.conditions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {step.conditions.map((condition, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {condition}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {(step.images.length > 0 || step.documents.length > 0) && (
                              <div className="mt-3 flex gap-2">
                                {step.images.length > 0 && (
                                  <Button size="sm" variant="outline">
                                    <Camera className="w-3 h-3 mr-1" />
                                    View Photos ({step.images.length})
                                  </Button>
                                )}
                                {step.documents.length > 0 && (
                                  <Button size="sm" variant="outline">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Documents ({step.documents.length})
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className={`text-sm ${getStatusColor(step.status)}`}>
                            {step.status === 'completed' && <CheckCircle className="w-5 h-5" />}
                            {step.status === 'in_progress' && <Clock className="w-5 h-5" />}
                            {step.status === 'failed' && <AlertTriangle className="w-5 h-5" />}
                          </div>
                        </div>

                        {index < traceabilityRecord.journey.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sustainability Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Sustainability Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {traceabilityRecord.sustainability.score}
                      </div>
                      <p className="text-sm text-gray-600">Sustainability Score</p>
                      <Progress value={traceabilityRecord.sustainability.score} className="mt-2" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Carbon Footprint</span>
                        <span className="font-medium">{traceabilityRecord.sustainability.carbonFootprint} kg CO₂</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Water Usage</span>
                        <span className="font-medium">{traceabilityRecord.sustainability.waterUsage}L</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Renewable Energy</span>
                        <span className="font-medium">{traceabilityRecord.sustainability.renewableEnergy}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {traceabilityRecord.sustainability.organicCompliant ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">Organic Compliant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!traceabilityRecord.sustainability.pesticidesUsed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">Pesticide Free</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {traceabilityRecord.sustainability.locallySourced ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">Locally Sourced</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consumer Interaction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Share Your Experience
                  </CardTitle>
                  <p className="text-gray-600">Help other consumers with your feedback</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rate this product:</label>
                    <div className="flex items-center gap-2">
                      {renderStars(consumerRating, true, setConsumerRating)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Your feedback:</label>
                    <Textarea
                      placeholder="Share your thoughts about the quality, freshness, or overall experience..."
                      value={consumerFeedback}
                      onChange={(e) => setConsumerFeedback(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button onClick={submitConsumerFeedback}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>

                  {traceabilityRecord.consumer.ratings.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Recent Reviews</h4>
                      <div className="space-y-3">
                        {traceabilityRecord.consumer.ratings.map((rating, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex items-center gap-2 mb-1">
                              {renderStars(rating.rating)}
                              {rating.verified && (
                                <Badge variant="outline" className="text-xs">Verified</Badge>
                              )}
                              <span className="text-xs text-gray-500">{rating.date.toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-700">{rating.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share Journey
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact Farmer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificates">
          {!traceabilityRecord ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Selected</h3>
                <p className="text-gray-600 mb-4">
                  Scan a product to view its certifications and quality reports.
                </p>
                <Button onClick={() => setActiveTab('scanner')}>
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Product Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {traceabilityRecord.certifications.map((cert) => (
                      <div key={cert.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {cert.logo && (
                            <img src={cert.logo} alt={cert.name} className="w-12 h-12 object-contain" />
                          )}
                          <div>
                            <h3 className="font-medium">{cert.name}</h3>
                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                          </div>
                          {cert.verified && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Certificate #</span>
                            <span className="font-medium">{cert.certificateNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Issue Date</span>
                            <span>{cert.issueDate.toLocaleDateString()}</span>
                          </div>
                          {cert.expiryDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expiry Date</span>
                              <span className={cert.expiryDate < new Date() ? 'text-red-600' : ''}>
                                {cert.expiryDate.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {cert.verificationUrl && (
                          <Button size="sm" variant="outline" className="mt-3 w-full">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Verify Certificate
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quality Checks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Quality Inspection Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {traceabilityRecord.qualityChecks.map((check) => (
                      <div key={check.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium">{check.stage} Inspection</h3>
                            <p className="text-sm text-gray-600">
                              Inspector: {check.inspector} • {check.inspectionDate.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{check.overallScore}%</div>
                            <Badge className={check.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {check.passed ? 'PASSED' : 'FAILED'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {check.parameters.map((param, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{param.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {param.value}{param.unit && ` ${param.unit}`}
                                </span>
                                {param.passed ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-sm text-gray-700 mb-3">{check.notes}</p>

                        <div className="flex gap-2">
                          {check.certificateUrl && (
                            <Button size="sm" variant="outline">
                              <FileText className="w-3 h-3 mr-1" />
                              View Certificate
                            </Button>
                          )}
                          {check.images.length > 0 && (
                            <Button size="sm" variant="outline">
                              <Camera className="w-3 h-3 mr-1" />
                              View Photos ({check.images.length})
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {!traceabilityRecord ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600 mb-4">
                  Scan a product to view analytics and insights.
                </p>
                <Button onClick={() => setActiveTab('scanner')}>
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{traceabilityRecord.consumer.scanCount}</div>
                  <p className="text-sm text-gray-600">Total Scans</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {traceabilityRecord.consumer.ratings.length > 0 
                      ? (traceabilityRecord.consumer.ratings.reduce((a, r) => a + r.rating, 0) / traceabilityRecord.consumer.ratings.length).toFixed(1)
                      : 'N/A'
                    }
                  </div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{traceabilityRecord.consumer.feedback.length}</div>
                  <p className="text-sm text-gray-600">Feedback Count</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{traceabilityRecord.sustainability.score}%</div>
                  <p className="text-sm text-gray-600">Sustainability</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default QRTraceabilitySystem;