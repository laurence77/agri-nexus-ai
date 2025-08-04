import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  ShoppingCart,
  Shield,
  Star,
  MapPin,
  Package,
  Calendar,
  DollarSign,
  Users,
  Truck,
  Eye,
  Heart,
  MessageCircle,
  Filter,
  Search,
  ArrowUpDown,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  QrCode,
  Share2,
  Lock,
  Unlock,
  CreditCard,
  Wallet
} from 'lucide-react';
import { MarketplaceListing } from '@/services/blockchain/fabric-network';

interface MarketplaceBlockchainProps {
  onListingSelect?: (listing: MarketplaceListing) => void;
  onInitiateEscrow?: (listingId: string, buyerId: string) => void;
  onViewTraceability?: (batchId: string) => void;
  userRole?: 'buyer' | 'seller' | 'both';
  className?: string;
}

interface MarketplaceFilters {
  cropType?: string;
  region?: string;
  priceRange?: { min: number; max: number };
  certifications?: string[];
  qualityGrade?: string;
  deliveryOptions?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'quality' | 'distance' | 'newest';
}

/**
 * Blockchain-Powered Marketplace Component
 * Displays verified agricultural products with traceability and escrow integration
 */
export function MarketplaceBlockchain({ 
  onListingSelect,
  onInitiateEscrow,
  onViewTraceability,
  userRole = 'buyer',
  className 
}: MarketplaceBlockchainProps) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadMarketplaceListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, filters, searchTerm]);

  const loadMarketplaceListings = async () => {
    setLoading(true);
    try {
      // Mock marketplace listings - in production, fetch from blockchain service
      const mockListings: MarketplaceListing[] = [
        {
          id: 'listing_001',
          sellerId: 'farmer_001',
          sellerName: 'Sarah Wanjiku',
          batchId: 'batch_2024_001',
          cropType: 'maize',
          variety: 'H513',
          quantity: 1000,
          unit: 'kg',
          pricePerUnit: 45,
          currency: 'KES',
          totalValue: 45000,
          qualityGrade: 'Grade A',
          certifications: ['Organic', 'Fair Trade'],
          availableFrom: '2024-07-25',
          expiryDate: '2024-08-25',
          location: {
            region: 'Central Kenya',
            country: 'Kenya',
            coordinates: { lat: -1.2921, lng: 36.8219 }
          },
          images: ['/images/maize-1.jpg', '/images/maize-2.jpg'],
          description: 'Premium organic white maize, drought-resistant variety. Ideal for both human consumption and animal feed.',
          minOrderQuantity: 100,
          deliveryOptions: [
            { type: 'pickup', cost: 0, estimatedDays: 0 },
            { type: 'delivery', cost: 2000, estimatedDays: 2 },
            { type: 'shipping', cost: 3500, estimatedDays: 5 }
          ],
          paymentTerms: {
            acceptedMethods: ['M-Pesa', 'Airtel Money', 'Bank Transfer'],
            advancePercentage: 30,
            escrowRequired: true
          },
          status: 'active',
          createdAt: '2024-07-25T10:00:00Z',
          updatedAt: '2024-07-25T10:00:00Z'
        },
        {
          id: 'listing_002',
          sellerId: 'farmer_002',
          sellerName: 'John Mwangi',
          batchId: 'batch_2024_002',
          cropType: 'beans',
          variety: 'Rose Coco',
          quantity: 500,
          unit: 'kg',
          pricePerUnit: 120,
          currency: 'KES',
          totalValue: 60000,
          qualityGrade: 'Grade A+',
          certifications: ['GlobalGAP', 'Organic'],
          availableFrom: '2024-07-26',
          expiryDate: '2024-09-26',
          location: {
            region: 'Eastern Kenya',
            country: 'Kenya',
            coordinates: { lat: -1.5177, lng: 37.2634 }
          },
          images: ['/images/beans-1.jpg'],
          description: 'Premium Rose Coco beans, perfect protein source. Grown using sustainable farming practices.',
          minOrderQuantity: 50,
          deliveryOptions: [
            { type: 'pickup', cost: 0, estimatedDays: 0 },
            { type: 'delivery', cost: 1500, estimatedDays: 1 }
          ],
          paymentTerms: {
            acceptedMethods: ['M-Pesa', 'Bank Transfer'],
            advancePercentage: 50,
            escrowRequired: true
          },
          status: 'active',
          createdAt: '2024-07-26T14:30:00Z',
          updatedAt: '2024-07-26T14:30:00Z'
        },
        {
          id: 'listing_003',
          sellerId: 'farmer_003',
          sellerName: 'Grace Nyong\'o',
          batchId: 'batch_2024_003',
          cropType: 'tomatoes',
          variety: 'Roma',
          quantity: 200,
          unit: 'kg',
          pricePerUnit: 80,
          currency: 'KES',
          totalValue: 16000,
          qualityGrade: 'Grade B+',
          certifications: ['Fair Trade'],
          availableFrom: '2024-07-27',
          expiryDate: '2024-08-02',
          location: {
            region: 'Rift Valley',
            country: 'Kenya',
            coordinates: { lat: -0.0917, lng: 34.7680 }
          },
          images: ['/images/tomatoes-1.jpg', '/images/tomatoes-2.jpg', '/images/tomatoes-3.jpg'],
          description: 'Fresh Roma tomatoes, perfect for processing and fresh consumption. Harvested at optimal ripeness.',
          minOrderQuantity: 25,
          deliveryOptions: [
            { type: 'pickup', cost: 0, estimatedDays: 0 },
            { type: 'delivery', cost: 800, estimatedDays: 1 }
          ],
          paymentTerms: {
            acceptedMethods: ['M-Pesa', 'Cash'],
            advancePercentage: 0,
            escrowRequired: false
          },
          status: 'active',
          createdAt: '2024-07-27T09:15:00Z',
          updatedAt: '2024-07-27T09:15:00Z'
        }
      ];

      setListings(mockListings);
    } catch (error) {
      console.error('Failed to load marketplace listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Crop type filter
    if (filters.cropType) {
      filtered = filtered.filter(listing => listing.cropType === filters.cropType);
    }

    // Region filter
    if (filters.region) {
      filtered = filtered.filter(listing => listing.location.region === filters.region);
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(listing =>
        listing.pricePerUnit >= filters.priceRange!.min &&
        listing.pricePerUnit <= filters.priceRange!.max
      );
    }

    // Certifications filter
    if (filters.certifications && filters.certifications.length > 0) {
      filtered = filtered.filter(listing =>
        filters.certifications!.some(cert => listing.certifications.includes(cert))
      );
    }

    // Quality grade filter
    if (filters.qualityGrade) {
      filtered = filtered.filter(listing => listing.qualityGrade === filters.qualityGrade);
    }

    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          break;
      }
    }

    setFilteredListings(filtered);
  };

  const handleListingClick = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    if (onListingSelect) {
      onListingSelect(listing);
    }
  };

  const handleInitiateEscrow = (listingId: string) => {
    if (onInitiateEscrow) {
      onInitiateEscrow(listingId, 'current-user-id'); // In real app, get from auth
    }
  };

  const handleViewTraceability = (batchId: string) => {
    if (onViewTraceability) {
      onViewTraceability(batchId);
    }
  };

  const getCropIcon = (cropType: string) => {
    const icons: Record<string, string> = {
      maize: '🌽',
      beans: '🫘',
      tomatoes: '🍅',
      onions: '🧅',
      potatoes: '🥔',
      cassava: '🍠',
      rice: '🌾'
    };
    return icons[cropType] || '🌱';
  };

  const getQualityColor = (grade: string) => {
    if (grade.includes('A+')) return 'text-green-400 bg-green-400/20';
    if (grade.includes('A')) return 'text-blue-400 bg-blue-400/20';
    if (grade.includes('B+')) return 'text-yellow-400 bg-yellow-400/20';
    if (grade.includes('B')) return 'text-orange-400 bg-orange-400/20';
    return 'text-gray-400 bg-gray-400/20';
  };

  const renderListingCard = (listing: MarketplaceListing) => (
    <GlassCard
      key={listing.id}
      className="overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
      onClick={() => handleListingClick(listing)}
    >
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-green-600 to-blue-600 relative">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {getCropIcon(listing.cropType)}
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            listing.status === 'active' ? 'bg-green-500/20 text-green-400' :
            listing.status === 'reserved' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-gray-500/20 text-gray-400'
          )}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </div>
        </div>

        {/* Escrow Badge */}
        {listing.paymentTerms.escrowRequired && (
          <div className="absolute top-3 right-3">
            <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Escrow</span>
            </div>
          </div>
        )}

        {/* Quality Grade */}
        <div className="absolute bottom-3 left-3">
          <div className={cn('px-2 py-1 rounded-full text-xs font-medium', getQualityColor(listing.qualityGrade))}>
            {listing.qualityGrade}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white capitalize">
              {listing.variety} {listing.cropType}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Users className="h-3 w-3" />
              <span>{listing.sellerName}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-green-400">
              {listing.pricePerUnit} {listing.currency}
            </div>
            <div className="text-xs text-gray-400">per {listing.unit}</div>
          </div>
        </div>

        {/* Location & Quantity */}
        <div className="flex justify-between items-center mb-3 text-sm text-gray-300">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{listing.location.region}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Package className="h-3 w-3" />
            <span>{listing.quantity.toLocaleString()} {listing.unit}</span>
          </div>
        </div>

        {/* Certifications */}
        <div className="flex flex-wrap gap-1 mb-3">
          {listing.certifications.map((cert, index) => (
            <div key={index} className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <Award className="h-3 w-3" />
              <span>{cert}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>

        {/* Actions */}
        <div className="flex space-x-2">
          <GlassButton
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleInitiateEscrow(listing.id);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Now
          </GlassButton>
          
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewTraceability(listing.batchId);
            }}
          >
            <QrCode className="h-4 w-4" />
          </GlassButton>
          
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle share
            }}
          >
            <Share2 className="h-4 w-4" />
          </GlassButton>
        </div>

        {/* Delivery Info */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Truck className="h-3 w-3" />
              <span>Delivery from {listing.deliveryOptions[0]?.cost === 0 ? 'Free pickup' : `${listing.deliveryOptions[0]?.cost} ${listing.currency}`}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Min {listing.minOrderQuantity} {listing.unit}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 text-green-400" />
            <span>Blockchain Marketplace</span>
          </h2>
          <p className="text-gray-300 mt-1">Verified agricultural products with full traceability</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </GlassButton>

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? '☷' : '☰'}
          </GlassButton>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <GlassCard className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Crop Type</label>
              <select
                value={filters.cropType || ''}
                onChange={(e) => setFilters({...filters, cropType: e.target.value || undefined})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="" className="bg-gray-800">All Crops</option>
                <option value="maize" className="bg-gray-800">Maize</option>
                <option value="beans" className="bg-gray-800">Beans</option>
                <option value="tomatoes" className="bg-gray-800">Tomatoes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
              <select
                value={filters.region || ''}
                onChange={(e) => setFilters({...filters, region: e.target.value || undefined})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="" className="bg-gray-800">All Regions</option>
                <option value="Central Kenya" className="bg-gray-800">Central Kenya</option>
                <option value="Eastern Kenya" className="bg-gray-800">Eastern Kenya</option>
                <option value="Rift Valley" className="bg-gray-800">Rift Valley</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quality Grade</label>
              <select
                value={filters.qualityGrade || ''}
                onChange={(e) => setFilters({...filters, qualityGrade: e.target.value || undefined})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="" className="bg-gray-800">All Grades</option>
                <option value="Grade A+" className="bg-gray-800">Grade A+</option>
                <option value="Grade A" className="bg-gray-800">Grade A</option>
                <option value="Grade B+" className="bg-gray-800">Grade B+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy || ''}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value as any || undefined})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="" className="bg-gray-800">Default</option>
                <option value="price_asc" className="bg-gray-800">Price: Low to High</option>
                <option value="price_desc" className="bg-gray-800">Price: High to Low</option>
                <option value="newest" className="bg-gray-800">Newest First</option>
              </select>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{filteredListings.length}</div>
          <div className="text-sm text-gray-300">Active Listings</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {filteredListings.filter(l => l.paymentTerms.escrowRequired).length}
          </div>
          <div className="text-sm text-gray-300">Escrow Protected</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {new Set(filteredListings.flatMap(l => l.certifications)).size}
          </div>
          <div className="text-sm text-gray-300">Certifications</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {new Set(filteredListings.map(l => l.location.region)).size}
          </div>
          <div className="text-sm text-gray-300">Regions</div>
        </GlassCard>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading marketplace listings...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">No Products Found</h3>
          <p className="text-gray-300">Try adjusting your search criteria or filters</p>
        </GlassCard>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredListings.map(listing => renderListingCard(listing))}
        </div>
      )}

      {/* Blockchain Info */}
      <GlassCard className="p-4 border-blue-500/30">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-blue-400" />
          <div className="flex-1">
            <div className="text-white font-medium">Blockchain-Verified Marketplace</div>
            <div className="text-gray-300 text-sm">
              All products are verified on blockchain with complete traceability from farm to consumer
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">Live</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default MarketplaceBlockchain;