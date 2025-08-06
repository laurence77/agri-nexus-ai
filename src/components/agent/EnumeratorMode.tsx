import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Users,
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  Upload,
  Download,
  User,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  FileText,
  Phone,
  Mail,
  Sprout,
  Target,
  Clipboard,
  Sync,
  Database,
  Globe,
  Award,
  TrendingUp
} from 'lucide-react';

interface EnumeratorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  zone: string;
  territory: string[];
  experience: number; // years
  specialization: string[];
  languages: string[];
  performance: {
    farmsVisited: number;
    dataPointsCollected: number;
    accuracy: number;
    completionRate: number;
  };
  currentStatus: 'active' | 'inactive' | 'on_field' | 'syncing';
  lastSync: Date;
  assignedFarmers: string[];
}

interface FarmerRegistration {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    dateOfBirth?: Date;
    gender: 'male' | 'female' | 'other';
    nationalId?: string;
    education: string;
    householdSize: number;
  };
  farmInfo: {
    farmName: string;
    location: {
      coordinates: { lat: number; lng: number };
      address: string;
      ward: string;
      district: string;
      region: string;
    };
    farmSize: number; // hectares
    ownershipType: 'owned' | 'leased' | 'communal' | 'cooperative';
    soilType: string;
    waterSource: string[];
    mainCrops: string[];
    livestock: string[];
  };
  economicInfo: {
    primaryIncome: string;
    annualIncome: number;
    bankAccount: boolean;
    mobileMoneyAccount: boolean;
    accessToCredit: boolean;
    cooperativeMember: boolean;
  };
  dataCollection: {
    enumeratorId: string;
    visitDate: Date;
    photos: string[];
    gpsCoordinates: { lat: number; lng: number };
    notes: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  syncStatus: 'offline' | 'syncing' | 'synced' | 'failed';
}

interface DataCollection {
  id: string;
  farmerId: string;
  enumeratorId: string;
  collectionType: 'yield' | 'pest_assessment' | 'soil_test' | 'crop_monitoring' | 'general_visit';
  visitDate: Date;
  data: {
    cropType?: string;
    yieldData?: {
      quantity: number;
      unit: string;
      quality: 'poor' | 'fair' | 'good' | 'excellent';
      harvestDate: Date;
    };
    pestAssessment?: {
      pestType: string;
      severityLevel: 'low' | 'medium' | 'high' | 'critical';
      affectedArea: number; // percentage
      recommendedAction: string;
    };
    soilData?: {
      ph: number;
      organicMatter: number;
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      recommendations: string[];
    };
    generalObservations: string;
  };
  photos: string[];
  gpsLocation: { lat: number; lng: number };
  syncStatus: 'offline' | 'syncing' | 'synced' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Territory {
  id: string;
  name: string;
  region: string;
  district: string;
  totalFarmers: number;
  coveredFarmers: number;
  assignedEnumerators: string[];
  coordinates: { lat: number; lng: number }[];
}

export function EnumeratorMode() {
  const [enumeratorProfile, setEnumeratorProfile] = useState<EnumeratorProfile | null>(null);
  const [farmerRegistrations, setFarmerRegistrations] = useState<FarmerRegistration[]>([]);
  const [dataCollections, setDataCollections] = useState<DataCollection[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [showDataCollection, setShowDataCollection] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerRegistration | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const [newFarmer, setNewFarmer] = useState<Partial<FarmerRegistration>>({
    personalInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      gender: 'male',
      education: '',
      householdSize: 1
    },
    farmInfo: {
      farmName: '',
      location: {
        coordinates: { lat: 0, lng: 0 },
        address: '',
        ward: '',
        district: '',
        region: ''
      },
      farmSize: 0,
      ownershipType: 'owned',
      soilType: '',
      waterSource: [],
      mainCrops: [],
      livestock: []
    },
    economicInfo: {
      primaryIncome: '',
      annualIncome: 0,
      bankAccount: false,
      mobileMoneyAccount: false,
      accessToCredit: false,
      cooperativeMember: false
    },
    syncStatus: 'offline'
  });

  const [newDataCollection, setNewDataCollection] = useState<Partial<DataCollection>>({
    collectionType: 'general_visit',
    data: {
      generalObservations: ''
    },
    photos: [],
    priority: 'medium',
    syncStatus: 'offline'
  });

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
      );
    }

    loadSampleData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSampleData = () => {
    // Sample enumerator profile
    const sampleEnumerator: EnumeratorProfile = {
      id: 'enum_001',
      name: 'Jane Wanjiku',
      email: 'jane.wanjiku@agrinexus.co.ke',
      phone: '+254712345678',
      employeeId: 'AGR-001',
      zone: 'Central Kenya',
      territory: ['Kiambu', 'Murang\'a', 'Nyeri'],
      experience: 3,
      specialization: ['Crop Assessment', 'Farmer Registration', 'Data Collection'],
      languages: ['English', 'Swahili', 'Kikuyu'],
      performance: {
        farmsVisited: 245,
        dataPointsCollected: 1850,
        accuracy: 94.5,
        completionRate: 89.2
      },
      currentStatus: 'on_field',
      lastSync: new Date('2024-01-15T08:30:00'),
      assignedFarmers: ['farmer_001', 'farmer_002', 'farmer_003']
    };

    // Sample territories
    const sampleTerritories: Territory[] = [
      {
        id: 'territory_001',
        name: 'Kiambu Rural',
        region: 'Central',
        district: 'Kiambu',
        totalFarmers: 1250,
        coveredFarmers: 845,
        assignedEnumerators: ['enum_001'],
        coordinates: [
          { lat: -1.0340, lng: 36.9356 },
          { lat: -1.1540, lng: 37.0856 }
        ]
      }
    ];

    // Sample farmer registrations
    const sampleFarmers: FarmerRegistration[] = [
      {
        id: 'farmer_001',
        personalInfo: {
          firstName: 'Peter',
          lastName: 'Kamau',
          phone: '+254723456789',
          email: 'peter.kamau@gmail.com',
          gender: 'male',
          education: 'Primary',
          householdSize: 6
        },
        farmInfo: {
          farmName: 'Kamau Family Farm',
          location: {
            coordinates: { lat: -1.0456, lng: 36.9567 },
            address: 'Gatundu South, Kiambu',
            ward: 'Gatundu South',
            district: 'Kiambu',
            region: 'Central'
          },
          farmSize: 2.5,
          ownershipType: 'owned',
          soilType: 'Clay loam',
          waterSource: ['Borehole', 'Rainwater'],
          mainCrops: ['Maize', 'Beans', 'Potatoes'],
          livestock: ['Dairy Cattle', 'Chickens']
        },
        economicInfo: {
          primaryIncome: 'Farming',
          annualIncome: 350000,
          bankAccount: true,
          mobileMoneyAccount: true,
          accessToCredit: false,
          cooperativeMember: true
        },
        dataCollection: {
          enumeratorId: 'enum_001',
          visitDate: new Date('2024-01-10'),
          photos: ['farm_001_1.jpg', 'farm_001_2.jpg'],
          gpsCoordinates: { lat: -1.0456, lng: 36.9567 },
          notes: 'Well-maintained farm with good crop rotation practices',
          verificationStatus: 'verified'
        },
        syncStatus: 'synced'
      }
    ];

    setEnumeratorProfile(sampleEnumerator);
    setTerritories(sampleTerritories);
    setFarmerRegistrations(sampleFarmers);
  };

  const registerFarmer = () => {
    if (newFarmer.personalInfo?.firstName && newFarmer.personalInfo?.lastName && newFarmer.personalInfo?.phone) {
      const farmer: FarmerRegistration = {
        id: `farmer_${Date.now()}`,
        personalInfo: newFarmer.personalInfo as any,
        farmInfo: {
          ...newFarmer.farmInfo!,
          location: {
            ...newFarmer.farmInfo!.location!,
            coordinates: currentLocation || { lat: 0, lng: 0 }
          }
        },
        economicInfo: newFarmer.economicInfo as any,
        dataCollection: {
          enumeratorId: enumeratorProfile?.id || '',
          visitDate: new Date(),
          photos: [],
          gpsCoordinates: currentLocation || { lat: 0, lng: 0 },
          notes: '',
          verificationStatus: 'pending'
        },
        syncStatus: 'offline'
      };

      setFarmerRegistrations(prev => [...prev, farmer]);
      setShowAddFarmer(false);
      setNewFarmer({
        personalInfo: {
          firstName: '',
          lastName: '',
          phone: '',
          gender: 'male',
          education: '',
          householdSize: 1
        },
        farmInfo: {
          farmName: '',
          location: {
            coordinates: { lat: 0, lng: 0 },
            address: '',
            ward: '',
            district: '',
            region: ''
          },
          farmSize: 0,
          ownershipType: 'owned',
          soilType: '',
          waterSource: [],
          mainCrops: [],
          livestock: []
        },
        economicInfo: {
          primaryIncome: '',
          annualIncome: 0,
          bankAccount: false,
          mobileMoneyAccount: false,
          accessToCredit: false,
          cooperativeMember: false
        },
        syncStatus: 'offline'
      });
    }
  };

  const addDataCollection = () => {
    if (selectedFarmer && newDataCollection.collectionType) {
      const collection: DataCollection = {
        id: `data_${Date.now()}`,
        farmerId: selectedFarmer.id,
        enumeratorId: enumeratorProfile?.id || '',
        collectionType: newDataCollection.collectionType!,
        visitDate: new Date(),
        data: newDataCollection.data!,
        photos: newDataCollection.photos || [],
        gpsLocation: currentLocation || { lat: 0, lng: 0 },
        syncStatus: 'offline',
        priority: newDataCollection.priority || 'medium'
      };

      setDataCollections(prev => [...prev, collection]);
      setShowDataCollection(false);
      setNewDataCollection({
        collectionType: 'general_visit',
        data: {
          generalObservations: ''
        },
        photos: [],
        priority: 'medium',
        syncStatus: 'offline'
      });
    }
  };

  const syncData = async () => {
    if (!isOnline) {
      alert('No internet connection. Data will sync when connection is restored.');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Simulate sync process
      const unsyncedFarmers = farmerRegistrations.filter(f => f.syncStatus === 'offline');
      const unsyncedData = dataCollections.filter(d => d.syncStatus === 'offline');
      
      const totalItems = unsyncedFarmers.length + unsyncedData.length;
      let syncedItems = 0;

      // Sync farmers
      for (const farmer of unsyncedFarmers) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        farmer.syncStatus = 'synced';
        syncedItems++;
        setSyncProgress((syncedItems / totalItems) * 100);
      }

      // Sync data collections
      for (const data of unsyncedData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        data.syncStatus = 'synced';
        syncedItems++;
        setSyncProgress((syncedItems / totalItems) * 100);
      }

      // Update enumerator last sync
      if (enumeratorProfile) {
        setEnumeratorProfile({
          ...enumeratorProfile,
          lastSync: new Date()
        });
      }

      alert('Data synchronized successfully!');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_field': return 'bg-blue-100 text-blue-800';
      case 'syncing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unsyncedCount = farmerRegistrations.filter(f => f.syncStatus === 'offline').length + 
                      dataCollections.filter(d => d.syncStatus === 'offline').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="font-bold text-lg">Enumerator Mode</h1>
                <p className="text-sm text-gray-600">{enumeratorProfile?.name} • {enumeratorProfile?.zone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Offline</span>
                </div>
              )}
              {unsyncedCount > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {unsyncedCount} unsynced
                </Badge>
              )}
              <Button
                size="sm"
                onClick={syncData}
                disabled={!isOnline || isSyncing}
              >
                {isSyncing ? (
                  <Sync className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Sync Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Progress */}
      {isSyncing && (
        <div className="bg-blue-50 border-b p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Syncing data...</span>
            <span className="text-sm text-blue-700">{Math.round(syncProgress)}%</span>
          </div>
          <Progress value={syncProgress} className="h-2" />
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="data">Data Collection</TabsTrigger>
            <TabsTrigger value="territory">Territory</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Farmers Registered</p>
                      <p className="text-2xl font-bold">{farmerRegistrations.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Data Points</p>
                      <p className="text-2xl font-bold">{dataCollections.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Territories</p>
                      <p className="text-2xl font-bold">{territories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold">{enumeratorProfile?.performance.accuracy}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...farmerRegistrations, ...dataCollections]
                        .sort((a, b) => {
                          const dateA = 'dataCollection' in a ? a.dataCollection.visitDate : a.visitDate;
                          const dateB = 'dataCollection' in b ? b.dataCollection.visitDate : b.visitDate;
                          return new Date(dateB).getTime() - new Date(dateA).getTime();
                        })
                        .slice(0, 5)
                        .map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {'personalInfo' in item ? (
                                <User className="h-4 w-4 text-blue-600" />
                              ) : (
                                <FileText className="h-4 w-4 text-green-600" />
                              )}
                              <div>
                                <p className="font-medium">
                                  {'personalInfo' in item 
                                    ? `Registered: ${item.personalInfo.firstName} ${item.personalInfo.lastName}`
                                    : `Data Collection: ${item.collectionType}`
                                  }
                                </p>
                                <p className="text-sm text-gray-600">
                                  {'personalInfo' in item 
                                    ? item.dataCollection.visitDate.toLocaleString()
                                    : item.visitDate.toLocaleString()
                                  }
                                </p>
                              </div>
                            </div>
                            <Badge className={getSyncStatusColor(item.syncStatus)}>
                              {item.syncStatus}
                            </Badge>
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
                    <Button className="w-full" onClick={() => setShowAddFarmer(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Register Farmer
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setShowDataCollection(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Collect Data
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photos
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MapPin className="h-4 w-4 mr-2" />
                      Mark Location
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {enumeratorProfile && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion Rate</span>
                            <span>{enumeratorProfile.performance.completionRate}%</span>
                          </div>
                          <Progress value={enumeratorProfile.performance.completionRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Data Accuracy</span>
                            <span>{enumeratorProfile.performance.accuracy}%</span>
                          </div>
                          <Progress value={enumeratorProfile.performance.accuracy} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{enumeratorProfile.performance.farmsVisited}</p>
                            <p className="text-xs text-gray-600">Farms Visited</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{enumeratorProfile.performance.dataPointsCollected}</p>
                            <p className="text-xs text-gray-600">Data Points</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="farmers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Farmers</CardTitle>
                    <p className="text-gray-600">Farmers registered in your territory</p>
                  </div>
                  <Button onClick={() => setShowAddFarmer(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Register Farmer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {farmerRegistrations.map((farmer) => (
                    <div key={farmer.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">
                            {farmer.personalInfo.firstName} {farmer.personalInfo.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {farmer.farmInfo.farmName} • {farmer.farmInfo.farmSize} hectares
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSyncStatusColor(farmer.syncStatus)}>
                            {farmer.syncStatus}
                          </Badge>
                          <Badge variant="outline">
                            {farmer.dataCollection.verificationStatus}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p className="font-medium">{farmer.personalInfo.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Main Crops</p>
                          <p className="font-medium">{farmer.farmInfo.mainCrops.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Visit Date</p>
                          <p className="font-medium">{farmer.dataCollection.visitDate.toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedFarmer(farmer)}>
                          <FileText className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Camera className="h-3 w-3 mr-1" />
                          Add Photos
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Data Collections</CardTitle>
                    <p className="text-gray-600">Field data and observations</p>
                  </div>
                  <Button onClick={() => setShowDataCollection(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataCollections.map((data) => (
                    <div key={data.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium capitalize">{data.collectionType.replace('_', ' ')}</h3>
                          <p className="text-sm text-gray-600">
                            Farmer ID: {data.farmerId} • {data.visitDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSyncStatusColor(data.syncStatus)}>
                            {data.syncStatus}
                          </Badge>
                          <Badge variant="outline" className={
                            data.priority === 'urgent' ? 'border-red-500 text-red-700' :
                            data.priority === 'high' ? 'border-orange-500 text-orange-700' :
                            'border-gray-300'
                          }>
                            {data.priority}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">
                        {data.data.generalObservations}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📷 {data.photos.length} photos</span>
                          <span>📍 GPS recorded</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="territory">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Territory Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  {territories.map((territory) => (
                    <div key={territory.id} className="p-4 border rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{territory.name}</h3>
                          <p className="text-sm text-gray-600">{territory.region} • {territory.district}</p>
                        </div>
                        <Badge variant="outline">
                          {Math.round((territory.coveredFarmers / territory.totalFarmers) * 100)}% covered
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Farmers Covered</span>
                          <span>{territory.coveredFarmers} / {territory.totalFarmers}</span>
                        </div>
                        <Progress 
                          value={(territory.coveredFarmers / territory.totalFarmers) * 100} 
                          className="h-2" 
                        />
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>Assigned Enumerators: {territory.assignedEnumerators.length}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Territory Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Interactive map will be displayed here</p>
                      <p className="text-sm text-gray-500">Showing farmer locations and coverage</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Registered Farmers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Pending Registration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Current Location</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enumerator Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {enumeratorProfile && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input value={enumeratorProfile.name} readOnly />
                        </div>
                        <div>
                          <Label>Employee ID</Label>
                          <Input value={enumeratorProfile.employeeId} readOnly />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <Input value={enumeratorProfile.email} readOnly />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input value={enumeratorProfile.phone} readOnly />
                        </div>
                      </div>

                      <div>
                        <Label>Zone</Label>
                        <Input value={enumeratorProfile.zone} readOnly />
                      </div>

                      <div>
                        <Label>Territory</Label>
                        <Input value={enumeratorProfile.territory.join(', ')} readOnly />
                      </div>

                      <div>
                        <Label>Specialization</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {enumeratorProfile.specialization.map((spec, index) => (
                            <Badge key={index} variant="outline">{spec}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Languages</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {enumeratorProfile.languages.map((lang, index) => (
                            <Badge key={index} variant="outline">{lang}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="font-medium mb-2">Status</p>
                        <Badge className={getStatusColor(enumeratorProfile.currentStatus)}>
                          {enumeratorProfile.currentStatus.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div>
                        <p className="font-medium mb-2">Last Sync</p>
                        <p className="text-sm text-gray-600">
                          {enumeratorProfile.lastSync.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {enumeratorProfile && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Data Accuracy</span>
                          <span>{enumeratorProfile.performance.accuracy}%</span>
                        </div>
                        <Progress value={enumeratorProfile.performance.accuracy} className="h-3" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Completion Rate</span>
                          <span>{enumeratorProfile.performance.completionRate}%</span>
                        </div>
                        <Progress value={enumeratorProfile.performance.completionRate} className="h-3" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {enumeratorProfile.performance.farmsVisited}
                          </p>
                          <p className="text-sm text-blue-700">Farms Visited</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {enumeratorProfile.performance.dataPointsCollected}
                          </p>
                          <p className="text-sm text-green-700">Data Points</p>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600 text-center">
                          {enumeratorProfile.experience}
                        </p>
                        <p className="text-sm text-yellow-700 text-center">Years Experience</p>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Recent Achievements</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-gold-500" />
                            <span>100+ farmers registered this month</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span>95%+ data accuracy maintained</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Territory coverage goal exceeded</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Register Farmer Modal */}
      {showAddFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Register New Farmer</h3>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={newFarmer.personalInfo?.firstName || ''}
                      onChange={(e) => setNewFarmer({
                        ...newFarmer,
                        personalInfo: { ...newFarmer.personalInfo!, firstName: e.target.value }
                      })}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={newFarmer.personalInfo?.lastName || ''}
                      onChange={(e) => setNewFarmer({
                        ...newFarmer,
                        personalInfo: { ...newFarmer.personalInfo!, lastName: e.target.value }
                      })}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={newFarmer.personalInfo?.phone || ''}
                      onChange={(e) => setNewFarmer({
                        ...newFarmer,
                        personalInfo: { ...newFarmer.personalInfo!, phone: e.target.value }
                      })}
                      placeholder="+254712345678"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newFarmer.personalInfo?.gender || 'male'}
                      onChange={(e) => setNewFarmer({
                        ...newFarmer,
                        personalInfo: { ...newFarmer.personalInfo!, gender: e.target.value as any }
                      })}
                      aria-label="Select gender"
                      title="Select gender"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Farm Information */}
              <div>
                <h4 className="font-medium mb-3">Farm Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Farm Name</Label>
                    <Input
                      value={newFarmer.farmInfo?.farmName || ''}
                      onChange={(e) => setNewFarmer({
                        ...newFarmer,
                        farmInfo: { ...newFarmer.farmInfo!, farmName: e.target.value }
                      })}
                      placeholder="Enter farm name"
                    />
                  </div>
                  <div>
                    <Label>Farm Size (hectares)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newFarmer.farmInfo?.farmSize || ''}
                      onChange={(e) => setNewFarmer({
                        ...newFarmer,
                        farmInfo: { ...newFarmer.farmInfo!, farmSize: parseFloat(e.target.value) }
                      })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={newFarmer.farmInfo?.location?.address || ''}
                      onChange={(e) => setNewFarmer({
                        ...newFarmer,
                        farmInfo: {
                          ...newFarmer.farmInfo!,
                          location: { ...newFarmer.farmInfo!.location!, address: e.target.value }
                        }
                      })}
                      placeholder="Enter farm address"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={registerFarmer}>Register Farmer</Button>
              <Button variant="outline" onClick={() => setShowAddFarmer(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Collection Modal */}
      {showDataCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Add Data Collection</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Select Farmer</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedFarmer?.id || ''}
                  onChange={(e) => {
                    const farmer = farmerRegistrations.find(f => f.id === e.target.value);
                    setSelectedFarmer(farmer || null);
                  }}
                  aria-label="Select farmer"
                  title="Select farmer"
                >
                  <option value="">Select a farmer</option>
                  {farmerRegistrations.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.personalInfo.firstName} {farmer.personalInfo.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Collection Type</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newDataCollection.collectionType || 'general_visit'}
                  onChange={(e) => setNewDataCollection({
                    ...newDataCollection,
                    collectionType: e.target.value as any
                  })}
                  aria-label="Select collection type"
                  title="Select collection type"
                >
                  <option value="general_visit">General Visit</option>
                  <option value="yield">Yield Assessment</option>
                  <option value="pest_assessment">Pest Assessment</option>
                  <option value="soil_test">Soil Test</option>
                  <option value="crop_monitoring">Crop Monitoring</option>
                </select>
              </div>

              <div>
                <Label>Priority</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newDataCollection.priority || 'medium'}
                  onChange={(e) => setNewDataCollection({
                    ...newDataCollection,
                    priority: e.target.value as any
                  })}
                  aria-label="Select priority"
                  title="Select priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <Label>Observations</Label>
                <Textarea
                  value={newDataCollection.data?.generalObservations || ''}
                  onChange={(e) => setNewDataCollection({
                    ...newDataCollection,
                    data: { ...newDataCollection.data!, generalObservations: e.target.value }
                  })}
                  placeholder="Enter your observations..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={addDataCollection} disabled={!selectedFarmer}>
                Add Data Collection
              </Button>
              <Button variant="outline" onClick={() => setShowDataCollection(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnumeratorMode;