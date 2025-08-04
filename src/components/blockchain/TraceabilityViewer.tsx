import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  Package,
  MapPin,
  Calendar,
  Shield,
  Truck,
  Thermometer,
  Droplets,
  Award,
  Eye,
  Download,
  Share2,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Building,
  Leaf,
  Zap,
  FileText,
  Camera,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { TraceabilityRecord } from '@/services/blockchain/fabric-network';

interface TraceabilityViewerProps {
  batchId: string;
  onViewQRCode?: (batchId: string) => void;
  onShareRecord?: (record: TraceabilityRecord) => void;
  onDownloadReport?: (record: TraceabilityRecord) => void;
  className?: string;
}

interface TimelineEvent {
  id: string;
  type: 'planting' | 'treatment' | 'harvest' | 'storage' | 'transport' | 'quality_test' | 'certification';
  title: string;
  description: string;
  date: Date;
  location?: string;
  evidence?: string[];
  operator?: string;
  status: 'completed' | 'in_progress' | 'pending';
}

/**
 * Traceability Viewer Component
 * Displays comprehensive crop traceability information from blockchain
 */
export function TraceabilityViewer({ 
  batchId, 
  onViewQRCode,
  onShareRecord,
  onDownloadReport,
  className 
}: TraceabilityViewerProps) {
  const [record, setRecord] = useState<TraceabilityRecord | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'timeline' | 'certifications' | 'sustainability'>('overview');
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'failed' | null>(null);

  useEffect(() => {
    if (batchId) {
      loadTraceabilityRecord();
    }
  }, [batchId]);

  const loadTraceabilityRecord = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock traceability record - in production, fetch from blockchain service
      const mockRecord: TraceabilityRecord = {
        id: `trace_${batchId}`,
        batchId,
        farmerId: 'farmer_001',
        farmerName: 'Sarah Wanjiku',
        cropType: 'maize',
        variety: 'H513',
        plantingDate: '2024-03-15',
        harvestDate: '2024-07-20',
        location: {
          latitude: -1.2921,
          longitude: 36.8219,
          region: 'Central Kenya',
          country: 'Kenya'
        },
        certifications: ['Organic', 'Fair Trade', 'GlobalGAP'],
        treatments: [
          {
            type: 'fertilizer',
            name: 'Organic Compost',
            date: '2024-04-01',
            quantity: '200kg',
            operator: 'Sarah Wanjiku'
          },
          {
            type: 'organic_treatment',
            name: 'Neem Oil Spray',
            date: '2024-05-15',
            quantity: '5L',
            operator: 'Farm Worker'
          }
        ],
        qualityTests: [
          {
            testType: 'Moisture Content',
            result: '13.5%',
            date: '2024-07-21',
            lab: 'Kenya Agricultural Testing Lab',
            certificate: 'KATL-2024-7821'
          },
          {
            testType: 'Aflatoxin Level',
            result: '2 ppb (Safe)',
            date: '2024-07-21',
            lab: 'Kenya Agricultural Testing Lab',
            certificate: 'KATL-2024-7822'
          }
        ],
        storage: [
          {
            facility: 'Wanjiku Farm Storage',
            temperature: 20,
            humidity: 12,
            date: '2024-07-22',
            conditions: 'Excellent'
          }
        ],
        transport: [
          {
            carrier: 'AgriTransport Ltd',
            vehicleId: 'KCA 123A',
            startLocation: 'Wanjiku Farm, Nyeri',
            endLocation: 'Nairobi Grain Market',
            startDate: '2024-07-25',
            endDate: '2024-07-25',
            temperature: 22,
            conditions: 'Good'
          }
        ],
        marketplace: {
          price: 45,
          currency: 'KES',
          status: 'sold',
          listedDate: '2024-07-26',
          soldDate: '2024-07-28'
        },
        sustainability: {
          carbonFootprint: 2.5,
          waterUsage: 450,
          energyConsumption: 12,
          organicCertified: true,
          fairTradeCertified: true
        },
        timestamps: {
          created: '2024-03-15T08:00:00Z',
          updated: '2024-07-28T14:30:00Z',
          blockNumber: 12456,
          transactionId: 'tx_89a7c3d2f1e4b9c8'
        }
      };

      setRecord(mockRecord);
      setVerificationStatus('verified');
      generateTimeline(mockRecord);
    } catch (error) {
      console.error('Failed to load traceability record:', error);
      setError(error instanceof Error ? error.message : 'Failed to load record');
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeline = (record: TraceabilityRecord) => {
    const events: TimelineEvent[] = [];

    // Planting
    events.push({
      id: 'planting',
      type: 'planting',
      title: 'Crop Planted',
      description: `${record.variety} ${record.cropType} planted`,
      date: new Date(record.plantingDate),
      location: `${record.location.region}, ${record.location.country}`,
      operator: record.farmerName,
      status: 'completed'
    });

    // Treatments
    record.treatments.forEach((treatment, index) => {
      events.push({
        id: `treatment_${index}`,
        type: 'treatment',
        title: `${treatment.type.replace('_', ' ')} Applied`,
        description: `${treatment.name} - ${treatment.quantity}`,
        date: new Date(treatment.date),
        operator: treatment.operator,
        status: 'completed'
      });
    });

    // Harvest
    if (record.harvestDate) {
      events.push({
        id: 'harvest',
        type: 'harvest',
        title: 'Crop Harvested',
        description: 'Harvest completed and quality assessed',
        date: new Date(record.harvestDate),
        location: `${record.location.region}, ${record.location.country}`,
        operator: record.farmerName,
        status: 'completed'
      });
    }

    // Quality tests
    record.qualityTests.forEach((test, index) => {
      events.push({
        id: `test_${index}`,
        type: 'quality_test',
        title: `Quality Test: ${test.testType}`,
        description: `Result: ${test.result}`,
        date: new Date(test.date),
        location: test.lab,
        evidence: [test.certificate],
        status: 'completed'
      });
    });

    // Storage
    record.storage.forEach((storage, index) => {
      events.push({
        id: `storage_${index}`,
        type: 'storage',
        title: 'Storage Recorded',
        description: `${storage.facility} - ${storage.conditions} conditions`,
        date: new Date(storage.date),
        location: storage.facility,
        status: 'completed'
      });
    });

    // Transport
    record.transport.forEach((transport, index) => {
      events.push({
        id: `transport_${index}`,
        type: 'transport',
        title: 'Transportation',
        description: `${transport.startLocation} → ${transport.endLocation}`,
        date: new Date(transport.startDate),
        operator: transport.carrier,
        status: 'completed'
      });
    });

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    setTimeline(events);
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'planting': return <Leaf className="h-4 w-4 text-green-400" />;
      case 'treatment': return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'harvest': return <Package className="h-4 w-4 text-orange-400" />;
      case 'storage': return <Building className="h-4 w-4 text-blue-400" />;
      case 'transport': return <Truck className="h-4 w-4 text-purple-400" />;
      case 'quality_test': return <FileText className="h-4 w-4 text-red-400" />;
      case 'certification': return <Award className="h-4 w-4 text-gold-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getVerificationIcon = () => {
    switch (verificationStatus) {
      case 'verified': return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'failed': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default: return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleShare = () => {
    if (record && onShareRecord) {
      onShareRecord(record);
    }
  };

  const handleDownload = () => {
    if (record && onDownloadReport) {
      onDownloadReport(record);
    }
  };

  const handleViewQR = () => {
    if (onViewQRCode) {
      onViewQRCode(batchId);
    }
  };

  if (loading) {
    return (
      <GlassCard className={cn('p-8 text-center', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4" />
        <p className="text-white">Loading traceability data...</p>
      </GlassCard>
    );
  }

  if (error || !record) {
    return (
      <GlassCard className={cn('p-8 text-center border-red-500/30', className)}>
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold text-white mb-2">Record Not Found</h3>
        <p className="text-gray-300 mb-4">{error || 'Unable to load traceability record'}</p>
        <GlassButton onClick={loadTraceabilityRecord} variant="primary">
          Try Again
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {record.variety} {record.cropType.charAt(0).toUpperCase() + record.cropType.slice(1)}
              </h2>
              <p className="text-gray-300">Batch ID: {batchId}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getVerificationIcon()}
                <span className={cn(
                  'text-sm font-medium',
                  verificationStatus === 'verified' ? 'text-green-400' :
                  verificationStatus === 'pending' ? 'text-yellow-400' :
                  'text-red-400'
                )}>
                  {verificationStatus === 'verified' ? 'Blockchain Verified' :
                   verificationStatus === 'pending' ? 'Verification Pending' :
                   'Verification Failed'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <GlassButton variant="secondary" size="sm" onClick={handleViewQR}>
              <QrCode className="h-4 w-4" />
            </GlassButton>
            <GlassButton variant="secondary" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </GlassButton>
            <GlassButton variant="secondary" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </GlassButton>
            <GlassButton variant="primary" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Full Report
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <User className="h-6 w-6 mx-auto mb-2 text-blue-400" />
          <div className="text-sm text-gray-300">Farmer</div>
          <div className="text-white font-medium">{record.farmerName}</div>
        </GlassCard>

        <GlassCard className="p-4 text-center">
          <MapPin className="h-6 w-6 mx-auto mb-2 text-green-400" />
          <div className="text-sm text-gray-300">Origin</div>
          <div className="text-white font-medium">{record.location.region}</div>
        </GlassCard>

        <GlassCard className="p-4 text-center">
          <Award className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
          <div className="text-sm text-gray-300">Certifications</div>
          <div className="text-white font-medium">{record.certifications.length}</div>
        </GlassCard>

        <GlassCard className="p-4 text-center">
          <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-400" />
          <div className="text-sm text-gray-300">Harvest Date</div>
          <div className="text-white font-medium">
            {record.harvestDate ? new Date(record.harvestDate).toLocaleDateString() : 'Pending'}
          </div>
        </GlassCard>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'certifications', label: 'Certifications', icon: Award },
          { id: 'sustainability', label: 'Sustainability', icon: Leaf }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              selectedTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-400" />
              <span>Product Details</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Crop Type</span>
                <span className="text-white font-medium capitalize">{record.cropType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Variety</span>
                <span className="text-white font-medium">{record.variety}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Planting Date</span>
                <span className="text-white font-medium">
                  {new Date(record.plantingDate).toLocaleDateString()}
                </span>
              </div>
              {record.harvestDate && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Harvest Date</span>
                  <span className="text-white font-medium">
                    {new Date(record.harvestDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-300">Location</span>
                <span className="text-white font-medium">{record.location.region}</span>
              </div>
            </div>
          </GlassCard>

          {/* Quality Tests */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-400" />
              <span>Quality Tests</span>
            </h3>
            
            <div className="space-y-3">
              {record.qualityTests.map((test, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-medium">{test.testType}</span>
                    <span className="text-green-400 text-sm font-medium">{test.result}</span>
                  </div>
                  <div className="text-gray-300 text-sm">
                    {test.lab} • {new Date(test.date).toLocaleDateString()}
                  </div>
                  {test.certificate && (
                    <div className="text-blue-400 text-sm mt-1 flex items-center space-x-1">
                      <ExternalLink className="h-3 w-3" />
                      <span>Certificate: {test.certificate}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Storage Conditions */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-400" />
              <span>Storage Conditions</span>
            </h3>
            
            <div className="space-y-3">
              {record.storage.map((storage, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{storage.facility}</span>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      storage.conditions === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                      storage.conditions === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    )}>
                      {storage.conditions}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Thermometer className="h-3 w-3" />
                      <span>{storage.temperature}°C</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Droplets className="h-3 w-3" />
                      <span>{storage.humidity}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(storage.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Transportation */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Truck className="h-5 w-5 text-orange-400" />
              <span>Transportation</span>
            </h3>
            
            <div className="space-y-3">
              {record.transport.map((transport, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-white font-medium">{transport.carrier}</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-300 text-sm">{transport.vehicleId}</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-1">
                    {transport.startLocation} → {transport.endLocation}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>{new Date(transport.startDate).toLocaleDateString()}</span>
                    {transport.temperature && (
                      <div className="flex items-center space-x-1">
                        <Thermometer className="h-3 w-3" />
                        <span>{transport.temperature}°C</span>
                      </div>
                    )}
                    <span className="capitalize">{transport.conditions}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {selectedTab === 'timeline' && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-400" />
            <span>Traceability Timeline</span>
          </h3>
          
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center">
                    {getEventIcon(event.type)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-8 bg-white/10 ml-4 mt-2" />
                  )}
                </div>
                
                <div className="flex-1 bg-black/20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">{event.title}</h4>
                    <span className="text-xs text-gray-400">
                      {event.date.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.operator && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{event.operator}</span>
                      </div>
                    )}
                    {event.evidence && (
                      <div className="flex items-center space-x-1">
                        <Camera className="h-3 w-3" />
                        <span>{event.evidence.length} evidence</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {selectedTab === 'certifications' && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-400" />
            <span>Certifications</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {record.certifications.map((cert, index) => (
              <div key={index} className="bg-black/20 rounded-lg p-4 text-center">
                <Award className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
                <h4 className="text-white font-medium mb-2">{cert}</h4>
                <div className="text-sm text-gray-400">Certified</div>
                <div className="mt-3">
                  <GlassButton variant="secondary" size="sm">
                    View Certificate
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {selectedTab === 'sustainability' && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-green-400" />
            <span>Sustainability Metrics</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Carbon Footprint</span>
                  <span className="text-white font-medium">{record.sustainability.carbonFootprint} kg CO₂</span>
                </div>
                <div className="w-full bg-gray-600/30 rounded-full h-2">
                  <div 
                    className="h-2 bg-green-400 rounded-full"
                    style={{ width: `${Math.min((record.sustainability.carbonFootprint / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Water Usage</span>
                  <span className="text-white font-medium">{record.sustainability.waterUsage} L</span>
                </div>
                <div className="w-full bg-gray-600/30 rounded-full h-2">
                  <div 
                    className="h-2 bg-blue-400 rounded-full"
                    style={{ width: `${Math.min((record.sustainability.waterUsage / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Energy Consumption</span>
                  <span className="text-white font-medium">{record.sustainability.energyConsumption} kWh</span>
                </div>
                <div className="w-full bg-gray-600/30 rounded-full h-2">
                  <div 
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{ width: `${Math.min((record.sustainability.energyConsumption / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <h4 className="text-white font-medium mb-1">Organic Certified</h4>
                <p className="text-gray-300 text-sm">No synthetic chemicals used</p>
              </div>

              <div className="bg-black/20 rounded-lg p-4 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                <h4 className="text-white font-medium mb-1">Fair Trade Certified</h4>
                <p className="text-gray-300 text-sm">Ethical labor practices</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Blockchain Verification */}
      <GlassCard className="p-4 border-green-500/30">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-green-400" />
          <div className="flex-1">
            <div className="text-white font-medium">Blockchain Verified</div>
            <div className="text-gray-300 text-sm">
              Block #{record.timestamps.blockNumber} • Transaction: {record.timestamps.transactionId}
            </div>
          </div>
          <GlassButton variant="secondary" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

export default TraceabilityViewer;