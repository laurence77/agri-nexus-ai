import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  MapPin,
  Camera,
  QrCode,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  User,
  Building2,
  Tractor,
  Filter,
  X,
  Plus,
  Edit
} from 'lucide-react';

interface FarmerData {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    nationalId?: string;
    dateOfBirth?: string;
    gender: 'male' | 'female' | 'other';
    education: string;
    householdSize: number;
  };
  contactInfo: {
    address: string;
    village: string;
    ward: string;
    lga: string;
    state: string;
    country: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
  };
  farmInfo: {
    farmName?: string;
    totalLandSize: number;
    landSizeUnit: 'hectares' | 'acres';
    ownershipType: 'owned' | 'rented' | 'shared' | 'communal';
    soilType: string;
    waterSource: string[];
    mainCrops: string[];
    livestockTypes: string[];
  };
  economicInfo: {
    primaryIncome: string;
    secondaryIncome?: string;
    annualIncome?: number;
    bankAccount?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
    cooperativeMember?: {
      cooperativeName: string;
      membershipId: string;
    };
  };
  status: 'draft' | 'completed' | 'verified' | 'rejected';
  photos: {
    profilePhoto?: string;
    farmPhoto?: string;
    idDocument?: string;
  };
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    location: {
      latitude: number;
      longitude: number;
    };
    deviceInfo: {
      userAgent: string;
      timestamp: Date;
    };
  };
}

interface OnboardingStats {
  total: number;
  completed: number;
  pending: number;
  verified: number;
  rejected: number;
}

export function BulkFarmerOnboarding() {
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [currentFarmer, setCurrentFarmer] = useState<Partial<FarmerData> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState<OnboardingStats>({
    total: 0,
    completed: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadFarmers();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [farmers]);

  const loadFarmers = () => {
    try {
      const stored = localStorage.getItem('onboarded_farmers');
      if (stored) {
        const data = JSON.parse(stored).map((farmer: Partial<FarmerData>) => ({
          ...farmer,
          metadata: {
            ...farmer.metadata,
            createdAt: new Date(farmer.metadata.createdAt),
            updatedAt: new Date(farmer.metadata.updatedAt)
          }
        }));
        setFarmers(data);
      }
    } catch (error) {
      console.error('Error loading farmers:', error);
    }
  };

  const saveFarmers = (farmerList: FarmerData[]) => {
    try {
      localStorage.setItem('onboarded_farmers', JSON.stringify(farmerList));
      setFarmers(farmerList);
    } catch (error) {
      console.error('Error saving farmers:', error);
    }
  };

  const calculateStats = () => {
    const total = farmers.length;
    const completed = farmers.filter(f => f.status === 'completed').length;
    const pending = farmers.filter(f => f.status === 'draft').length;
    const verified = farmers.filter(f => f.status === 'verified').length;
    const rejected = farmers.filter(f => f.status === 'rejected').length;

    setStats({ total, completed, pending, verified, rejected });
  };

  const initializeNewFarmer = (): Partial<FarmerData> => ({
    id: `farmer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    personalInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      gender: 'male',
      education: '',
      householdSize: 1
    },
    contactInfo: {
      address: '',
      village: '',
      ward: '',
      lga: '',
      state: '',
      country: 'Nigeria',
    },
    farmInfo: {
      totalLandSize: 0,
      landSizeUnit: 'hectares',
      ownershipType: 'owned',
      soilType: '',
      waterSource: [],
      mainCrops: [],
      livestockTypes: []
    },
    economicInfo: {
      primaryIncome: 'farming'
    },
    status: 'draft',
    photos: {},
    metadata: {
      createdBy: 'agent_001', // This would come from logged-in agent
      createdAt: new Date(),
      updatedAt: new Date(),
      location: {
        latitude: 0,
        longitude: 0
      },
      deviceInfo: {
        userAgent: navigator.userAgent,
        timestamp: new Date()
      }
    }
  });

  const startNewOnboarding = () => {
    setCurrentFarmer(initializeNewFarmer());
    setIsEditing(true);
    setShowForm(true);
    setCurrentStep(1);
  };

  const editFarmer = (farmer: FarmerData) => {
    setCurrentFarmer(farmer);
    setIsEditing(true);
    setShowForm(true);
    setCurrentStep(1);
  };

  const saveFarmer = () => {
    if (!currentFarmer || !currentFarmer.id) return;

    const updatedFarmer: FarmerData = {
      ...currentFarmer as FarmerData,
      metadata: {
        ...currentFarmer.metadata!,
        updatedAt: new Date()
      }
    };

    const existingIndex = farmers.findIndex(f => f.id === currentFarmer.id);
    let updatedFarmers: FarmerData[];

    if (existingIndex >= 0) {
      updatedFarmers = [...farmers];
      updatedFarmers[existingIndex] = updatedFarmer;
    } else {
      updatedFarmers = [...farmers, updatedFarmer];
    }

    saveFarmers(updatedFarmers);
    setShowForm(false);
    setCurrentFarmer(null);
    setIsEditing(false);
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (currentFarmer) {
            setCurrentFarmer(prev => ({
              ...prev,
              contactInfo: {
                ...(prev?.contactInfo || {}),
                gpsCoordinates: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy
                }
              },
              metadata: {
                ...(prev?.metadata || {}),
                location: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                }
              }
            }));
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get location. Please ensure location services are enabled.');
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const capturePhoto = (type: 'profilePhoto' | 'farmPhoto' | 'idDocument') => {
    // In a real implementation, this would open camera or file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && currentFarmer) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          setCurrentFarmer(prev => ({
            ...prev,
            photos: {
              ...prev?.photos,
              [type]: imageData
            }
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = 
      farmer.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.personalInfo.phone.includes(searchTerm) ||
      farmer.contactInfo.village.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || farmer.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const exportData = () => {
    const csvHeaders = [
      'ID', 'First Name', 'Last Name', 'Phone', 'Email', 'Village', 'Ward', 
      'LGA', 'State', 'Farm Size', 'Land Unit', 'Main Crops', 'Status', 'Created Date'
    ];
    
    const csvData = farmers.map(farmer => [
      farmer.id,
      farmer.personalInfo.firstName,
      farmer.personalInfo.lastName,
      farmer.personalInfo.phone,
      farmer.personalInfo.email || '',
      farmer.contactInfo.village,
      farmer.contactInfo.ward,
      farmer.contactInfo.lga,
      farmer.contactInfo.state,
      farmer.farmInfo.totalLandSize,
      farmer.farmInfo.landSizeUnit,
      farmer.farmInfo.mainCrops.join(', '),
      farmer.status,
      farmer.metadata.createdAt.toLocaleDateString()
    ]);

    const csv = [csvHeaders, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showForm && currentFarmer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Farmer' : 'New Farmer Onboarding'}
              </h1>
              <p className="text-gray-600">Step {currentStep} of 4</p>
            </div>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Steps */}
          <Card>
            <CardContent className="p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={currentFarmer.personalInfo?.firstName || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          personalInfo: {
                            ...(prev?.personalInfo || {}),
                            firstName: e.target.value
                          }
                        }))}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={currentFarmer.personalInfo?.lastName || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          personalInfo: {
                            ...(prev?.personalInfo || {}),
                            lastName: e.target.value
                          }
                        }))}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={currentFarmer.personalInfo?.phone || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          personalInfo: {
                            ...(prev?.personalInfo || {}),
                            phone: e.target.value
                          }
                        }))}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={currentFarmer.personalInfo?.email || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          personalInfo: {
                            ...(prev?.personalInfo || {}),
                            email: e.target.value
                          }
                        }))}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={currentFarmer.personalInfo?.gender || 'male'}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          personalInfo: {
                            ...(prev?.personalInfo || {}),
                            gender: e.target.value as 'male' | 'female' | 'other'
                          }
                        }))}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="householdSize">Household Size</Label>
                      <Input
                        id="householdSize"
                        type="number"
                        min="1"
                        value={currentFarmer.personalInfo?.householdSize || 1}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          personalInfo: {
                            ...(prev?.personalInfo || {}),
                            householdSize: parseInt(e.target.value) || 1
                          }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => capturePhoto('profilePhoto')}>
                      <Camera className="h-4 w-4 mr-2" />
                      Take Profile Photo
                    </Button>
                    {currentFarmer.photos?.profilePhoto && (
                      <Badge className="bg-green-100 text-green-800">Photo Captured</Badge>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Contact & Location</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={currentFarmer.contactInfo?.address || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          contactInfo: {
                            ...(prev?.contactInfo || {}),
                            address: e.target.value
                          }
                        }))}
                        placeholder="Enter full address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="village">Village/Community</Label>
                      <Input
                        id="village"
                        value={currentFarmer.contactInfo?.village || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          contactInfo: {
                            ...(prev?.contactInfo || {}),
                            village: e.target.value
                          }
                        }))}
                        placeholder="Enter village name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ward">Ward</Label>
                      <Input
                        id="ward"
                        value={currentFarmer.contactInfo?.ward || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          contactInfo: {
                            ...(prev?.contactInfo || {}),
                            ward: e.target.value
                          }
                        }))}
                        placeholder="Enter ward"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lga">Local Government Area</Label>
                      <Input
                        id="lga"
                        value={currentFarmer.contactInfo?.lga || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          contactInfo: {
                            ...(prev?.contactInfo || {}),
                            lga: e.target.value
                          }
                        }))}
                        placeholder="Enter LGA"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={currentFarmer.contactInfo?.state || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          contactInfo: {
                            ...(prev?.contactInfo || {}),
                            state: e.target.value
                          }
                        }))}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div>
                    <Button onClick={getCurrentLocation} className="mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      Get GPS Location
                    </Button>
                    {currentFarmer.contactInfo?.gpsCoordinates && (
                      <div className="text-sm text-gray-600">
                        <p>Location: {currentFarmer.contactInfo.gpsCoordinates.latitude.toFixed(6)}, {currentFarmer.contactInfo.gpsCoordinates.longitude.toFixed(6)}</p>
                        <p>Accuracy: {currentFarmer.contactInfo.gpsCoordinates.accuracy?.toFixed(0)}m</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Farm Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="farmName">Farm Name (Optional)</Label>
                      <Input
                        id="farmName"
                        value={currentFarmer.farmInfo?.farmName || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          farmInfo: {
                            ...(prev?.farmInfo || {}),
                            farmName: e.target.value
                          }
                        }))}
                        placeholder="Enter farm name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ownershipType">Land Ownership</Label>
                      <select
                        id="ownershipType"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={currentFarmer.farmInfo?.ownershipType || 'owned'}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          farmInfo: {
                            ...(prev?.farmInfo || {}),
                            ownershipType: e.target.value as 'owned' | 'rented' | 'shared' | 'communal'
                          }
                        }))}
                      >
                        <option value="owned">Owned</option>
                        <option value="rented">Rented</option>
                        <option value="shared">Shared</option>
                        <option value="communal">Communal</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="totalLandSize">Total Land Size</Label>
                      <Input
                        id="totalLandSize"
                        type="number"
                        min="0"
                        step="0.1"
                        value={currentFarmer.farmInfo?.totalLandSize || 0}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          farmInfo: {
                            ...(prev?.farmInfo || {}),
                            totalLandSize: parseFloat(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="landSizeUnit">Unit</Label>
                      <select
                        id="landSizeUnit"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={currentFarmer.farmInfo?.landSizeUnit || 'hectares'}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          farmInfo: {
                            ...(prev?.farmInfo || {}),
                            landSizeUnit: e.target.value as 'hectares' | 'acres'
                          }
                        }))}
                      >
                        <option value="hectares">Hectares</option>
                        <option value="acres">Acres</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="soilType">Soil Type</Label>
                      <Input
                        id="soilType"
                        value={currentFarmer.farmInfo?.soilType || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          farmInfo: {
                            ...(prev?.farmInfo || {}),
                            soilType: e.target.value
                          }
                        }))}
                        placeholder="e.g., Sandy loam, Clay, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="mainCrops">Main Crops (comma separated)</Label>
                      <Input
                        id="mainCrops"
                        value={currentFarmer.farmInfo?.mainCrops?.join(', ') || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          farmInfo: {
                            ...(prev?.farmInfo || {}),
                            mainCrops: e.target.value.split(',').map(crop => crop.trim()).filter(crop => crop)
                          }
                        }))}
                        placeholder="e.g., Maize, Rice, Cassava"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => capturePhoto('farmPhoto')}>
                      <Camera className="h-4 w-4 mr-2" />
                      Take Farm Photo
                    </Button>
                    {currentFarmer.photos?.farmPhoto && (
                      <Badge className="bg-green-100 text-green-800">Photo Captured</Badge>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Economic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryIncome">Primary Income Source</Label>
                      <select
                        id="primaryIncome"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={currentFarmer.economicInfo?.primaryIncome || 'farming'}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          economicInfo: {
                            ...(prev?.economicInfo || {}),
                            primaryIncome: e.target.value
                          }
                        }))}
                      >
                        <option value="farming">Farming</option>
                        <option value="livestock">Livestock</option>
                        <option value="trading">Trading</option>
                        <option value="artisan">Artisan</option>
                        <option value="employment">Employment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="annualIncome">Estimated Annual Income (Optional)</Label>
                      <Input
                        id="annualIncome"
                        type="number"
                        min="0"
                        value={currentFarmer.economicInfo?.annualIncome || ''}
                        onChange={(e) => setCurrentFarmer(prev => ({
                          ...prev,
                          economicInfo: {
                            ...(prev?.economicInfo || {}),
                            annualIncome: parseFloat(e.target.value) || undefined
                          }
                        }))}
                        placeholder="Enter annual income"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Bank Account Information (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          value={currentFarmer.economicInfo?.bankAccount?.bankName || ''}
                          onChange={(e) => setCurrentFarmer(prev => ({
                            ...prev,
                            economicInfo: {
                              ...(prev?.economicInfo || {}),
                              bankAccount: {
                                ...(prev?.economicInfo?.bankAccount || {}),
                                bankName: e.target.value
                              }
                            }
                          }))}
                          placeholder="Enter bank name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={currentFarmer.economicInfo?.bankAccount?.accountNumber || ''}
                          onChange={(e) => setCurrentFarmer(prev => ({
                            ...prev,
                            economicInfo: {
                              ...(prev?.economicInfo || {}),
                              bankAccount: {
                                ...(prev?.economicInfo?.bankAccount || {}),
                                accountNumber: e.target.value
                              }
                            }
                          }))}
                          placeholder="Enter account number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input
                          id="accountName"
                          value={currentFarmer.economicInfo?.bankAccount?.accountName || ''}
                          onChange={(e) => setCurrentFarmer(prev => ({
                            ...prev,
                            economicInfo: {
                              ...(prev?.economicInfo || {}),
                              bankAccount: {
                                ...(prev?.economicInfo?.bankAccount || {}),
                                accountName: e.target.value
                              }
                            }
                          }))}
                          placeholder="Enter account name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p><strong>Name:</strong> {currentFarmer.personalInfo?.firstName} {currentFarmer.personalInfo?.lastName}</p>
                    <p><strong>Phone:</strong> {currentFarmer.personalInfo?.phone}</p>
                    <p><strong>Location:</strong> {currentFarmer.contactInfo?.village}, {currentFarmer.contactInfo?.lga}</p>
                    <p><strong>Farm Size:</strong> {currentFarmer.farmInfo?.totalLandSize} {currentFarmer.farmInfo?.landSizeUnit}</p>
                    <p><strong>Main Crops:</strong> {currentFarmer.farmInfo?.mainCrops?.join(', ')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentFarmer(prev => ({ ...prev, status: 'draft' }));
                  saveFarmer();
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    setCurrentFarmer(prev => ({ ...prev, status: 'completed' }));
                    saveFarmer();
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Onboarding
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Onboarding</h1>
            <p className="text-gray-600">Bulk registration and management of smallholder farmers</p>
          </div>
          <Button onClick={startNewOnboarding} className="bg-green-600 hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" />
            New Farmer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Farmers</p>
              </div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
                <p className="text-sm text-gray-600">Verified</p>
              </div>
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Onboarding Progress</span>
              <span className="text-sm text-gray-600">
                {stats.completed} / {stats.total} completed ({Math.round((stats.completed / stats.total) * 100)}%)
              </span>
            </div>
            <Progress value={(stats.completed / stats.total) * 100} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search farmers by name, phone, or village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            <Button variant="outline" onClick={exportData} disabled={farmers.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Farmers List */}
      <Card>
        <CardHeader>
          <CardTitle>Farmers ({filteredFarmers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFarmers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No farmers found</p>
              <p className="text-sm text-gray-500 mt-2">
                {farmers.length === 0 ? 'Start by onboarding your first farmer' : 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFarmers.map((farmer) => (
                <div key={farmer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(farmer.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {farmer.personalInfo.firstName} {farmer.personalInfo.lastName}
                        </p>
                        <Badge className={getStatusColor(farmer.status)}>
                          {farmer.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {farmer.personalInfo.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {farmer.contactInfo.village}, {farmer.contactInfo.lga}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tractor className="h-3 w-3" />
                            {farmer.farmInfo.totalLandSize} {farmer.farmInfo.landSizeUnit}
                          </span>
                        </div>
                        {farmer.farmInfo.mainCrops.length > 0 && (
                          <p>Crops: {farmer.farmInfo.mainCrops.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => editFarmer(farmer)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {Object.keys(farmer.photos).length > 0 && (
                      <Badge variant="outline">
                        {Object.keys(farmer.photos).length} photos
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BulkFarmerOnboarding;