import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  QrCode, 
  Search, 
  Package, 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp,
  Eye,
  Shield,
  Award,
  Truck,
  Factory,
  Store,
  User,
  Scan,
  Download,
  Share,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { TraceabilityBatch, QRCodeData } from '@/types/traceability-system';
import { enhancedQRService, SmartQRCodeData, QRAnalytics } from '@/services/traceability/enhanced-qr-service';

interface TraceabilityDashboardProps {
  userId?: string;
  tenantId?: string;
}

const TraceabilityDashboard: React.FC<TraceabilityDashboardProps> = ({
  userId,
  tenantId
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'batches' | 'scanner' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [batches, setBatches] = useState<TraceabilityBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<TraceabilityBatch | null>(null);
  const [qrAnalytics, setQrAnalytics] = useState<QRAnalytics | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedData, setScannedData] = useState<SmartQRCodeData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [userId, tenantId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Simulate loading data
      const mockBatches: TraceabilityBatch[] = [
        {
          batch_id: 'BATCH-001',
          internal_batch_code: 'INT-001',
          qr_code: 'qr_batch_001',
          user_id: userId || 'farmer-001',
          tenant_id: tenantId || 'tenant-001',
          farm_profile_id: 'farm-001',
          field_id: 'field-001',
          crop_variety_id: 'maize-h614',
          crop_variety_name: 'Hybrid Maize H614',
          crop_scientific_name: 'Zea mays',
          seed_variety: 'H614',
          organic_certified: true,
          planting_date: '2024-03-15',
          harvest_date: '2024-07-20',
          production_season: 'Summer 2024',
          growing_period_days: 127,
          planted_area_hectares: 2.5,
          harvested_quantity_kg: 12500,
          yield_per_hectare: 5000,
          quality_grade: 'Premium A',
          field_location: {
            gps_coordinates: { latitude: -1.2921, longitude: 36.8219 },
            field_name: 'North Field',
            field_size_hectares: 2.5,
            soil_type: 'Clay loam',
            elevation_meters: 1650,
            nearest_town: 'Nairobi',
            region: 'Central Kenya',
            country: 'Kenya'
          },
          certifications: [
            {
              certification_id: 'org-001',
              certification_type: 'organic',
              certification_name: 'Organic Kenya Certification',
              certifying_body: 'Kenya Organic Agriculture Network',
              certificate_number: 'KOAN-2024-001',
              issue_date: '2024-01-15',
              expiry_date: '2025-01-14',
              renewal_date: '2024-12-01',
              scope_description: 'Organic maize production',
              certified_products: ['Maize'],
              certified_processes: ['Production', 'Harvesting', 'Storage'],
              certificate_document_url: '/certificates/org-001.pdf',
              verification_status: 'valid',
              last_verification_date: '2024-01-15',
              next_audit_date: '2024-10-15',
              standards_version: 'KOAN-2024',
              compliance_level: 'advanced',
              non_conformities: [],
              created_at: '2024-01-15T00:00:00Z',
              updated_at: '2024-01-15T00:00:00Z'
            }
          ],
          compliance_records: [],
          third_party_verifications: [],
          production_activities: [],
          input_applications: [],
          monitoring_records: [],
          food_safety_records: [],
          residue_test_results: [],
          contaminant_test_results: [],
          post_harvest_handling: [],
          processing_records: [],
          storage_records: [],
          transport_records: [],
          distribution_chain: [],
          chain_of_custody: [],
          quality_inspections: [],
          laboratory_tests: [],
          defect_records: [],
          sustainability_metrics: {
            metrics_id: 'sus-001',
            calculation_date: '2024-07-20',
            carbon_footprint_kg_co2_eq: 180,
            carbon_intensity_per_kg: 0.015,
            carbon_sequestration_kg_co2: 25,
            total_water_usage_liters: 3500,
            water_intensity_per_kg: 0.28,
            irrigation_efficiency: 0.85,
            rainwater_harvested_liters: 500,
            total_energy_consumption_kwh: 120,
            renewable_energy_percentage: 40,
            energy_intensity_per_kg: 0.01,
            soil_organic_matter_percentage: 3.2,
            soil_erosion_rate: 'low',
            biodiversity_index: 0.75,
            cover_crop_usage_percentage: 30,
            synthetic_fertilizer_kg_per_hectare: 85,
            pesticide_usage_kg_per_hectare: 2.5,
            organic_input_percentage: 70,
            waste_generated_kg: 150,
            waste_recycled_percentage: 80,
            packaging_recyclable_percentage: 90,
            fair_wage_compliance: true,
            worker_safety_score: 92,
            community_investment_amount: 500,
            calculated_by: 'system',
            calculation_method: 'ISO 14040',
            data_quality_score: 85
          },
          carbon_footprint: {
            assessment_id: 'carbon-001',
            assessment_scope: 'cradle_to_farm_gate',
            emission_sources: [],
            total_emissions_kg_co2_eq: 180,
            carbon_sequestration: [],
            total_sequestration_kg_co2: 25,
            net_carbon_footprint_kg_co2_eq: 155,
            carbon_intensity_per_kg_product: 0.012,
            calculation_methodology: 'IPCC Guidelines',
            emission_factors_source: 'IPCC 2019',
            assessment_boundary: 'Farm gate',
            verified_by_third_party: false,
            verification_standard: '',
            assessment_date: '2024-07-20',
            valid_until: '2025-07-20'
          },
          water_usage_records: [],
          export_records: [],
          buyer_information: [],
          price_information: {
            currency: 'KES',
            farm_gate_price_per_kg: 45,
            market_price_per_kg: 55,
            premium_percentage: 20,
            price_date: '2024-07-20'
          },
          photos: [],
          documents: [],
          blockchain_records: [],
          batch_status: 'harvested',
          lifecycle_stage: 'post_harvest',
          parent_batches: [],
          child_batches: [],
          related_batches: [],
          created_at: '2024-03-15T00:00:00Z',
          updated_at: '2024-07-20T00:00:00Z',
          created_by: userId || 'farmer-001',
          last_modified_by: userId || 'farmer-001',
          public_visibility: 'full',
          consumer_facing_info: {
            display_name: 'Premium Organic Maize',
            story: 'Grown with care using sustainable organic practices',
            farm_description: 'Family-owned farm in Central Kenya',
            farmer_name: 'John Kamau',
            farmer_photo: '/photos/farmer-001.jpg',
            farmer_message: 'Thank you for choosing our organic maize!',
            generations_farming: 3,
            harvest_date: '2024-07-20',
            harvest_story: 'Hand-picked at optimal maturity',
            processing_methods: ['Sun-drying', 'Winnowing'],
            time_to_market_days: 3,
            sustainable_practices: ['Organic farming', 'Water conservation', 'Composting'],
            environmental_benefits: ['Soil health improvement', 'Carbon sequestration'],
            social_impact: ['Fair wages', 'Community development'],
            certification_logos: ['/logos/organic.png'],
            certification_descriptions: ['Certified Organic by KOAN'],
            nutritional_highlights: ['High in fiber', 'Rich in antioxidants'],
            health_benefits: ['Heart health', 'Digestive health'],
            recipe_suggestions: ['Ugali', 'Roasted corn', 'Corn soup'],
            storage_instructions: 'Store in cool, dry place',
            best_before_guidance: 'Best consumed within 12 months',
            farm_website: 'https://kamaufarm.co.ke',
            social_media_links: ['@kamaufarm'],
            farmer_contact_preference: 'website',
            farm_photos: ['/photos/farm-001-1.jpg', '/photos/farm-001-2.jpg'],
            product_photos: ['/photos/maize-001.jpg'],
            harvest_videos: ['/videos/harvest-001.mp4'],
            last_updated: '2024-07-20T00:00:00Z'
          }
        }
      ];

      setBatches(mockBatches);

      // Load analytics
      const analytics = await enhancedQRService.generateQRAnalytics();
      setQrAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      setLoading(true);
      // Simulate QR code verification
      const verification = await enhancedQRService.verifySmartQRCode(qrData);
      setScannedData(verification.qrData);
      setScannerActive(false);
    } catch (error) {
      console.error('Failed to scan QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBatchQRCode = async (batch: TraceabilityBatch) => {
    try {
      setLoading(true);
      const qrCode = await enhancedQRService.generateSmartQRCode(batch);
      console.log('Generated QR Code:', qrCode);
      
      // Update batch with QR code
      const updatedBatch = { ...batch, qr_code: qrCode.qrCodeUrl };
      setBatches(prev => prev.map(b => b.batch_id === batch.batch_id ? updatedBatch : b));
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{batches.length}</div>
              <div className="text-sm text-gray-500">Active Batches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <QrCode className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{qrAnalytics?.total_qr_codes_generated || 0}</div>
              <div className="text-sm text-gray-500">QR Codes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold">{qrAnalytics?.total_scans || 0}</div>
              <div className="text-sm text-gray-500">Total Scans</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold">{qrAnalytics?.unique_scanners || 0}</div>
              <div className="text-sm text-gray-500">Unique Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Batches */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batches.map((batch) => (
                <div 
                  key={batch.batch_id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedBatch(batch)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      batch.batch_status === 'harvested' ? 'bg-green-500' :
                      batch.batch_status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <div className="font-medium">{batch.crop_variety_name}</div>
                      <div className="text-sm text-gray-500">
                        {batch.batch_id} • {batch.harvested_quantity_kg}kg • {batch.field_location.region}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={batch.organic_certified ? 'default' : 'secondary'}>
                      {batch.organic_certified ? 'Organic' : 'Conventional'}
                    </Badge>
                    <Badge variant="outline">{batch.quality_grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traceability Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Supply Chain Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <Factory className="h-12 w-12 mx-auto text-green-600 mb-2" />
                <div className="font-medium">Farm</div>
                <div className="text-sm text-gray-500">Origin</div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-4"></div>
              <div className="text-center">
                <Truck className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <div className="font-medium">Transport</div>
                <div className="text-sm text-gray-500">Logistics</div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-4"></div>
              <div className="text-center">
                <Store className="h-12 w-12 mx-auto text-orange-600 mb-2" />
                <div className="font-medium">Retail</div>
                <div className="text-sm text-gray-500">Distribution</div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-4"></div>
              <div className="text-center">
                <User className="h-12 w-12 mx-auto text-purple-600 mb-2" />
                <div className="font-medium">Consumer</div>
                <div className="text-sm text-gray-500">End User</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              QR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!scannerActive ? (
                <Button 
                  onClick={() => setScannerActive(true)}
                  className="w-full"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR Code
                </Button>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <div className="text-sm text-gray-500 mb-4">Point camera at QR code</div>
                  <Button 
                    variant="outline" 
                    onClick={() => setScannerActive(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {scannedData && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Verified Product</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Product:</strong> {scannedData.cropType}</div>
                    <div><strong>Farmer:</strong> {scannedData.farmerName}</div>
                    <div><strong>Origin:</strong> {scannedData.location.region}</div>
                    <div><strong>Harvest:</strong> {scannedData.harvestDate}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium">Organic</div>
                  <div className="text-sm text-gray-500">KOAN Certified</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Valid</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">Fair Trade</div>
                  <div className="text-sm text-gray-500">FLO Certified</div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Valid</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <div className="font-medium">GlobalGAP</div>
                  <div className="text-sm text-gray-500">Good Agricultural Practice</div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Expires Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share Batch
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBatchDetails = () => {
    if (!selectedBatch) {
      return (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <div className="text-gray-500">Select a batch to view details</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Batch Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  {selectedBatch.crop_variety_name}
                </CardTitle>
                <div className="text-gray-600">
                  {selectedBatch.batch_id} • {selectedBatch.field_location.region}, {selectedBatch.field_location.country}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedBatch.organic_certified ? 'default' : 'secondary'}>
                  {selectedBatch.organic_certified ? 'Organic' : 'Conventional'}
                </Badge>
                <Badge variant="outline">{selectedBatch.quality_grade}</Badge>
                <Button 
                  onClick={() => generateBatchQRCode(selectedBatch)}
                  disabled={loading}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Batch Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Production Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Planting Date:</span>
                  <span>{new Date(selectedBatch.planting_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Harvest Date:</span>
                  <span>{new Date(selectedBatch.harvest_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growing Period:</span>
                  <span>{selectedBatch.growing_period_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Area Planted:</span>
                  <span>{selectedBatch.planted_area_hectares} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Harvest:</span>
                  <span>{selectedBatch.harvested_quantity_kg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Yield per Hectare:</span>
                  <span>{selectedBatch.yield_per_hectare.toLocaleString()} kg/ha</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location & Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Field Name:</span>
                  <span>{selectedBatch.field_location.field_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Soil Type:</span>
                  <span>{selectedBatch.field_location.soil_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Elevation:</span>
                  <span>{selectedBatch.field_location.elevation_meters}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nearest Town:</span>
                  <span>{selectedBatch.field_location.nearest_town}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coordinates:</span>
                  <span>
                    {selectedBatch.field_location.gps_coordinates.latitude.toFixed(4)}, 
                    {selectedBatch.field_location.gps_coordinates.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sustainability Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbon Footprint:</span>
                  <span>{selectedBatch.sustainability_metrics.carbon_footprint_kg_co2_eq} kg CO2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Water Usage:</span>
                  <span>{selectedBatch.sustainability_metrics.total_water_usage_liters.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Organic Inputs:</span>
                  <span>{selectedBatch.sustainability_metrics.organic_input_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Soil Organic Matter:</span>
                  <span>{selectedBatch.sustainability_metrics.soil_organic_matter_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Energy Efficiency:</span>
                  <span>{selectedBatch.sustainability_metrics.energy_intensity_per_kg} kWh/kg</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle>Certifications & Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedBatch.certifications.map((cert) => (
                <div key={cert.certification_id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{cert.certification_name}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Type:</strong> {cert.certification_type}</div>
                    <div><strong>Body:</strong> {cert.certifying_body}</div>
                    <div><strong>Number:</strong> {cert.certificate_number}</div>
                    <div><strong>Valid Until:</strong> {new Date(cert.expiry_date).toLocaleDateString()}</div>
                    <Badge className="mt-2" variant={
                      cert.verification_status === 'valid' ? 'default' : 'destructive'
                    }>
                      {cert.verification_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consumer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Consumer-Facing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Product Story</h4>
                <p className="text-sm text-gray-600 mb-4">{selectedBatch.consumer_facing_info.story}</p>
                
                <h4 className="font-medium mb-2">Farmer Information</h4>
                <div className="text-sm text-gray-600">
                  <div><strong>Name:</strong> {selectedBatch.consumer_facing_info.farmer_name}</div>
                  <div><strong>Experience:</strong> {selectedBatch.consumer_facing_info.generations_farming} generations</div>
                  <div><strong>Message:</strong> {selectedBatch.consumer_facing_info.farmer_message}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Sustainable Practices</h4>
                <div className="space-y-1 mb-4">
                  {selectedBatch.consumer_facing_info.sustainable_practices.map((practice, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {practice}
                    </div>
                  ))}
                </div>
                
                <h4 className="font-medium mb-2">Recipe Suggestions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBatch.consumer_facing_info.recipe_suggestions.map((recipe, idx) => (
                    <Badge key={idx} variant="outline">{recipe}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      {qrAnalytics && (
        <>
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <QrCode className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold">{qrAnalytics.total_qr_codes_generated}</div>
                <div className="text-sm text-gray-500">QR Codes Generated</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold">{qrAnalytics.total_scans}</div>
                <div className="text-sm text-gray-500">Total Scans</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-2xl font-bold">{qrAnalytics.unique_scanners}</div>
                <div className="text-sm text-gray-500">Unique Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <div className="text-2xl font-bold">{qrAnalytics.engagement_metrics.average_scans_per_code.toFixed(1)}</div>
                <div className="text-sm text-gray-500">Avg Scans/QR</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scans by User Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(qrAnalytics.scan_by_user_type).map(([type, count]) => ({
                          name: type,
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(qrAnalytics.scan_by_user_type).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scans by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(qrAnalytics.scan_by_location).map(([location, count]) => ({
                      name: location,
                      scans: count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="scans" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Peak Scanning Times</h4>
                  <div className="space-y-2">
                    {qrAnalytics.engagement_metrics.peak_scanning_times.map((time, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Most Scanned Products</h4>
                  <div className="space-y-2">
                    {qrAnalytics.engagement_metrics.most_scanned_products.map((product, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{product}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Consumer Insights</h4>
                  <div className="space-y-2 text-sm">
                    <div>Average Engagement: {qrAnalytics.consumer_insights.average_engagement_time}s</div>
                    <div>Conversion Rate: {(qrAnalytics.consumer_insights.conversion_to_purchase * 100).toFixed(1)}%</div>
                    <div className="space-y-1">
                      <div className="font-medium">Top Information:</div>
                      {qrAnalytics.consumer_insights.top_information_accessed.map((info, idx) => (
                        <div key={idx} className="text-xs text-gray-600">• {info}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderScanner = () => (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Scan className="h-6 w-6" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {!scannerActive ? (
              <div>
                <QrCode className="h-24 w-24 mx-auto text-gray-400 mb-6" />
                <h3 className="text-lg font-medium mb-2">Scan Product QR Code</h3>
                <p className="text-gray-600 mb-6">Point your camera at a QR code to verify product authenticity and view traceability information</p>
                <Button 
                  onClick={() => setScannerActive(true)}
                  size="lg"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div>
                <div className="border-4 border-dashed border-blue-300 rounded-lg p-12 mb-6">
                  <QrCode className="h-24 w-24 mx-auto text-blue-400 mb-4" />
                  <div className="text-blue-600 font-medium">Camera Active</div>
                  <div className="text-sm text-gray-500">Point at QR code to scan</div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setScannerActive(false)}
                >
                  Stop Scanning
                </Button>
              </div>
            )}

            {scannedData && (
              <div className="mt-8 border rounded-lg p-6 bg-green-50 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-lg">Product Verified</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium mb-2">Product Information</div>
                    <div className="space-y-1">
                      <div><strong>Product:</strong> {scannedData.cropType} {scannedData.variety}</div>
                      <div><strong>Batch ID:</strong> {scannedData.batchId}</div>
                      <div><strong>Harvest Date:</strong> {scannedData.harvestDate}</div>
                      <div><strong>Quality:</strong> Premium Grade</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">Origin & Farmer</div>
                    <div className="space-y-1">
                      <div><strong>Farmer:</strong> {scannedData.farmerName}</div>
                      <div><strong>Location:</strong> {scannedData.location.region}, {scannedData.location.country}</div>
                      <div><strong>Certifications:</strong></div>
                      <div className="flex flex-wrap gap-1">
                        {scannedData.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {scannedData.sustainability_metrics && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="font-medium mb-2">Sustainability Metrics</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">{scannedData.sustainability_metrics.carbon_footprint}kg</div>
                        <div className="text-xs text-gray-500">CO2 Footprint</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{scannedData.sustainability_metrics.water_usage}L</div>
                        <div className="text-xs text-gray-500">Water Used</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">{scannedData.sustainability_metrics.organic_certified ? '100%' : '0%'}</div>
                        <div className="text-xs text-gray-500">Organic</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Traceability Dashboard</h1>
        <p className="text-gray-600">Track, verify, and manage product traceability with QR code integration</p>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Package className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="batches">
            <Eye className="h-4 w-4 mr-2" />
            Batch Details
          </TabsTrigger>
          <TabsTrigger value="scanner">
            <Scan className="h-4 w-4 mr-2" />
            QR Scanner
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="batches">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Batches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search batches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {batches
                        .filter(batch => 
                          batch.batch_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          batch.crop_variety_name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(batch => (
                        <div 
                          key={batch.batch_id}
                          className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                            selectedBatch?.batch_id === batch.batch_id ? 'bg-blue-50 border-blue-300' : ''
                          }`}
                          onClick={() => setSelectedBatch(batch)}
                        >
                          <div className="font-medium text-sm">{batch.crop_variety_name}</div>
                          <div className="text-xs text-gray-500">{batch.batch_id}</div>
                          <div className="text-xs text-gray-500">{batch.harvested_quantity_kg}kg</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              {renderBatchDetails()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scanner">
          {renderScanner()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TraceabilityDashboard;