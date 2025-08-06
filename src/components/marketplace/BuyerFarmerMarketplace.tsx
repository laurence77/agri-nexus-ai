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
  Search,
  Filter,
  MapPin,
  Calendar,
  Star,
  Heart,
  ShoppingCart,
  MessageCircle,
  Phone,
  Truck,
  Shield,
  Leaf,
  Award,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  Tag,
  BarChart3,
  Settings,
  Bell,
  Eye,
  ThumbsUp,
  Share2,
  Bookmark,
  RefreshCw,
  Plus,
  Minus,
  X,
  Check,
  ArrowRight,
  Zap,
  Target,
  Globe,
  CreditCard,
  FileText,
  Download,
  Trash2
} from 'lucide-react';
import { Select, SelectItem, SelectTrigger, SelectContent } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { MarketplaceService } from '@/services/marketplace/marketplace-service';

interface Farmer {
  id: string;
  name: string;
  farmName: string;
  avatar: string;
  location: string;
  coordinates: [number, number];
  verified: boolean;
  rating: number;
  totalReviews: number;
  yearsExperience: number;
  specializations: string[];
  certifications: string[];
  responseTime: number; // in hours
  fulfillmentRate: number; // percentage
  joinedDate: Date;
}

interface Product {
  id: string;
  farmerId: string;
  farmer: Farmer;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  images: string[];
  price: {
    amount: number;
    currency: string;
    unit: string;
    negotiable: boolean;
  };
  quantity: {
    available: number;
    unit: string;
    minimum: number;
  };
  quality: 'premium' | 'grade_a' | 'standard' | 'bulk';
  certifications: string[];
  harvestDate: Date;
  expiryDate?: Date;
  availability: 'available' | 'limited' | 'pre_order' | 'out_of_stock';
  shipping: {
    available: boolean;
    freeThreshold?: number;
    cost: number;
    regions: string[];
    estimatedDays: number;
  };
  packaging: string[];
  storage: string;
  nutritionalInfo?: Record<string, string>;
  sustainability: {
    organic: boolean;
    pesticide_free: boolean;
    local_sourced: boolean;
    carbon_neutral: boolean;
  };
  location: string;
  coordinates: [number, number];
  tags: string[];
  views: number;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: string;
  buyerId: string;
  farmerId: string;
  products: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
  totalAmount: number;
  currency: string;
  shipping: {
    address: string;
    method: string;
    cost: number;
    trackingNumber?: string;
    estimatedDelivery: Date;
  };
  payment: {
    method: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
  };
  messages: OrderMessage[];
  createdAt: Date;
  updatedAt: Date;
  escrow?: 'pending' | 'released' | 'failed'; // Added escrow status
}

interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

interface OrderMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'update';
}

interface MarketFilter {
  category?: string;
  priceRange?: [number, number];
  location?: string;
  certification?: string;
  availability?: string;
  quality?: string;
  shipping?: boolean;
  organic?: boolean;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'distance' | 'rating' | 'newest';
}

const mockFarmers: Farmer[] = [
  {
    id: 'farmer-1',
    name: 'Amina Hassan',
    farmName: 'Hassan Organic Farm',
    avatar: '/api/placeholder/64/64',
    location: 'Kano State, Nigeria',
    coordinates: [8.5200, 8.3200],
    verified: true,
    rating: 4.8,
    totalReviews: 156,
    yearsExperience: 12,
    specializations: ['Organic Vegetables', 'Grains', 'Spices'],
    certifications: ['Organic Certified', 'Fair Trade'],
    responseTime: 2,
    fulfillmentRate: 96,
    joinedDate: new Date('2020-03-15')
  },
  {
    id: 'farmer-2',
    name: 'John Okafor',
    farmName: 'Okafor Poultry & Crops',
    avatar: '/api/placeholder/64/64',
    location: 'Enugu State, Nigeria',
    coordinates: [6.5244, 7.5086],
    verified: true,
    rating: 4.6,
    totalReviews: 89,
    yearsExperience: 8,
    specializations: ['Poultry', 'Eggs', 'Root Crops'],
    certifications: ['HACCP Certified'],
    responseTime: 4,
    fulfillmentRate: 92,
    joinedDate: new Date('2021-01-20')
  }
];

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    farmerId: 'farmer-1',
    farmer: mockFarmers[0],
    name: 'Premium Organic Tomatoes',
    category: 'Vegetables',
    subcategory: 'Fruits',
    description: 'Fresh, vine-ripened organic tomatoes grown without pesticides. Perfect for cooking, salads, or processing. Rich in vitamins and antioxidants.',
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
    price: {
      amount: 450,
      currency: 'NGN',
      unit: 'kg',
      negotiable: true
    },
    quantity: {
      available: 500,
      unit: 'kg',
      minimum: 10
    },
    quality: 'premium',
    certifications: ['Organic', 'Non-GMO'],
    harvestDate: new Date('2024-01-15'),
    expiryDate: new Date('2024-01-25'),
    availability: 'available',
    shipping: {
      available: true,
      freeThreshold: 10000,
      cost: 2000,
      regions: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt'],
      estimatedDays: 2
    },
    packaging: ['Crates', 'Baskets', 'Bags'],
    storage: 'Cool, dry place',
    nutritionalInfo: {
      'Vitamin C': '28mg',
      'Lycopene': '2573μg',
      'Potassium': '237mg'
    },
    sustainability: {
      organic: true,
      pesticide_free: true,
      local_sourced: true,
      carbon_neutral: false
    },
    location: 'Kano State',
    coordinates: [8.5200, 8.3200],
    tags: ['organic', 'fresh', 'premium', 'vine-ripened'],
    views: 234,
    likes: 45,
    isLiked: false,
    isSaved: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'prod-2',
    farmerId: 'farmer-2',
    farmer: mockFarmers[1],
    name: 'Free-Range Eggs',
    category: 'Poultry',
    subcategory: 'Eggs',
    description: 'Fresh eggs from free-range chickens. No hormones or antibiotics. Rich in omega-3 fatty acids and protein.',
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    price: {
      amount: 80,
      currency: 'NGN',
      unit: 'piece',
      negotiable: false
    },
    quantity: {
      available: 1000,
      unit: 'pieces',
      minimum: 30
    },
    quality: 'grade_a',
    certifications: ['Free-Range', 'Hormone-Free'],
    harvestDate: new Date('2024-01-18'),
    availability: 'available',
    shipping: {
      available: true,
      cost: 1500,
      regions: ['Lagos', 'Abuja', 'Enugu', 'Ibadan'],
      estimatedDays: 1
    },
    packaging: ['Cartons', 'Trays'],
    storage: 'Refrigerated',
    sustainability: {
      organic: false,
      pesticide_free: true,
      local_sourced: true,
      carbon_neutral: false
    },
    location: 'Enugu State',
    coordinates: [6.5244, 7.5086],
    tags: ['free-range', 'fresh', 'protein', 'omega-3'],
    views: 189,
    likes: 32,
    isLiked: true,
    isSaved: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18')
  }
];

const categories = [
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'grains', name: 'Grains & Cereals', icon: '🌾' },
  { id: 'poultry', name: 'Poultry & Eggs', icon: '🥚' },
  { id: 'livestock', name: 'Livestock', icon: '🐄' },
  { id: 'dairy', name: 'Dairy Products', icon: '🥛' },
  { id: 'spices', name: 'Spices & Herbs', icon: '🌿' },
  { id: 'processed', name: 'Processed Foods', icon: '🍯' }
];

export function BuyerFarmerMarketplace() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [farmers, setFarmers] = useState<Farmer[]>(mockFarmers);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MarketFilter>({});
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const userId = 'demo-user'; // Replace with actual user ID from auth context
  const [useEscrow, setUseEscrow] = useState(false);

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const service = new MarketplaceService();
        const recs = await service.getRecommendedProducts(userId, 8);
        setRecommended(recs);
      } catch (err) {
        setRecommended([]);
      }
    }
    fetchRecommended();
  }, [userId]);

  // Filter products based on search and filters
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory;

      const matchesAvailability = !filters.availability || product.availability === filters.availability;

      const matchesQuality = !filters.quality || product.quality === filters.quality;

      const matchesOrganic = !filters.organic || product.sustainability.organic;

      const matchesShipping = !filters.shipping || product.shipping.available;

      const matchesPriceRange = !filters.priceRange || 
        (product.price.amount >= filters.priceRange[0] && product.price.amount <= filters.priceRange[1]);

      return matchesSearch && matchesCategory && matchesAvailability && 
             matchesQuality && matchesOrganic && matchesShipping && matchesPriceRange;
    });

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_low':
            return a.price.amount - b.price.amount;
          case 'price_high':
            return b.price.amount - a.price.amount;
          case 'rating':
            return b.farmer.rating - a.farmer.rating;
          case 'newest':
            return b.createdAt.getTime() - a.createdAt.getTime();
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, filters, products]);

  const handleLike = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, isLiked: !product.isLiked, likes: product.isLiked ? product.likes - 1 : product.likes + 1 }
        : product
    ));
  };

  const handleSave = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, isSaved: !product.isSaved }
        : product
    ));
  };

  const addToCart = (product: Product, quantity: number) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.pricePerUnit }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        product,
        quantity,
        pricePerUnit: product.price.amount,
        subtotal: quantity * product.price.amount
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity, subtotal: quantity * item.pricePerUnit }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'grade_a': return 'bg-green-100 text-green-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'bulk': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-orange-100 text-orange-800';
      case 'pre_order': return 'bg-blue-100 text-blue-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
      setSelectedProduct(product);
      setShowProductModal(true);
    }}>
      <div className="relative">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            className="p-2"
            onClick={(e) => {
              e.stopPropagation();
              handleLike(product.id);
            }}
          >
            <Heart className={`w-4 h-4 ${product.isLiked ? 'fill-current text-red-500' : ''}`} />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="p-2"
            onClick={(e) => {
              e.stopPropagation();
              handleSave(product.id);
            }}
          >
            <Bookmark className={`w-4 h-4 ${product.isSaved ? 'fill-current text-blue-500' : ''}`} />
          </Button>
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge className={getQualityColor(product.quality)}>
            {product.quality.replace('_', ' ')}
          </Badge>
          {product.sustainability.organic && (
            <Badge className="bg-green-600 text-white">
              <Leaf className="w-3 h-3 mr-1" />
              Organic
            </Badge>
          )}
        </div>
        <div className="absolute bottom-2 right-2">
          <Badge className={getAvailabilityColor(product.availability)}>
            {product.availability.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg truncate">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.category} • {product.subcategory}</p>
          </div>
          
          <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={product.farmer.avatar} />
              <AvatarFallback className="text-xs">{product.farmer.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{product.farmer.name}</span>
            {product.farmer.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs text-gray-600">{product.farmer.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-green-600">
                ₦{product.price.amount.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">/{product.price.unit}</span>
              {product.price.negotiable && (
                <Badge variant="outline" className="ml-2 text-xs">Negotiable</Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{product.quantity.available} {product.quantity.unit}</p>
              <p className="text-xs text-gray-500">Min: {product.quantity.minimum}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{product.location}</span>
            <span>•</span>
            <Clock className="w-3 h-3" />
            <span>{Math.ceil((new Date().getTime() - product.harvestDate.getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
                setShowProductModal(true);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, product.quantity.minimum);
              }}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agricultural Marketplace</h1>
        <p className="text-gray-600">Connect directly with farmers and buy fresh, quality produce</p>
      </div>

      {/* Recommended for You section */}
      {recommended.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Recommended for You</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommended.map(product => (
              <div key={product.id} className="min-w-[220px] max-w-xs bg-white/80 rounded-lg shadow p-3 flex-shrink-0">
                <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-full h-32 object-cover rounded mb-2" />
                <div className="font-medium text-gray-900 mb-1">{product.name}</div>
                <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                <div className="text-green-700 font-bold mb-1">KES {product.price.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-400">{product.farmer?.name || 'Unknown Farmer'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="saved">Saved Items</TabsTrigger>
          <TabsTrigger value="cart" className="relative">
            Cart
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search products, farmers, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">Category</SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                    
                    <select
                      value={filters.sortBy || 'relevance'}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>

                {showFilters && (
                  <div className="mt-4 p-4 border-t space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Price Range (₦)</label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={filters.priceRange?.[0] || ''}
                            onChange={(e) => setFilters({
                              ...filters,
                              priceRange: [Number(e.target.value) || 0, filters.priceRange?.[1] || 10000]
                            })}
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value={filters.priceRange?.[1] || ''}
                            onChange={(e) => setFilters({
                              ...filters,
                              priceRange: [filters.priceRange?.[0] || 0, Number(e.target.value) || 10000]
                            })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Quality</label>
                        <select
                          value={filters.quality || ''}
                          onChange={(e) => setFilters({...filters, quality: e.target.value || undefined})}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">All Quality</option>
                          <option value="premium">Premium</option>
                          <option value="grade_a">Grade A</option>
                          <option value="standard">Standard</option>
                          <option value="bulk">Bulk</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Availability</label>
                        <select
                          value={filters.availability || ''}
                          onChange={(e) => setFilters({...filters, availability: e.target.value || undefined})}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">All Availability</option>
                          <option value="available">Available Now</option>
                          <option value="limited">Limited Stock</option>
                          <option value="pre_order">Pre-order</option>
                        </select>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Features</label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={filters.organic || false}
                            onChange={(e) => setFilters({...filters, organic: e.target.checked || undefined})}
                          />
                          Organic Only
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={filters.shipping || false}
                            onChange={(e) => setFilters({...filters, shipping: e.target.checked || undefined})}
                          />
                          Free Shipping
                        </label>
                      </div>
                      
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          onClick={() => setFilters({})}
                          className="w-full"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Quick Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="whitespace-nowrap"
                  >
                    All Products
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setFilters({});
                  }}>
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="farmers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmers.map(farmer => (
              <Card key={farmer.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={farmer.avatar} />
                      <AvatarFallback>{farmer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{farmer.name}</h3>
                        {farmer.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                      </div>
                      <p className="text-gray-600">{farmer.farmName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(farmer.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {farmer.rating} ({farmer.totalReviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{farmer.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{farmer.yearsExperience} years experience</span>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Specializations:</p>
                      <div className="flex flex-wrap gap-1">
                        {farmer.specializations.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {farmer.specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{farmer.specializations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Response Time</p>
                        <p className="font-medium">{farmer.responseTime}h avg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fulfillment Rate</p>
                        <p className="font-medium">{farmer.fulfillmentRate}%</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View Products
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">
                  When you place orders, they will appear here for tracking and management.
                </p>
                <Button onClick={() => setActiveTab('marketplace')}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(p => p.isSaved).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            
            {products.filter(p => p.isSaved).length === 0 && (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved items</h3>
                    <p className="text-gray-600 mb-4">
                      Save products you're interested in to view them later.
                    </p>
                    <Button onClick={() => setActiveTab('marketplace')}>
                      Browse Products
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cart">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {cart.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                    <p className="text-gray-600 mb-4">
                      Add some products to your cart to get started.
                    </p>
                    <Button onClick={() => setActiveTab('marketplace')}>
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <Card key={item.productId}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          
                          <div className="flex-1">
                            <h3 className="font-medium">{item.product.name}</h3>
                            <p className="text-sm text-gray-600">{item.product.farmer.name}</p>
                            <p className="text-sm text-gray-600">
                              ₦{item.pricePerUnit.toLocaleString()}/{item.product.price.unit}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm text-gray-600 ml-2">
                                {item.product.quantity.unit}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold">₦{item.subtotal.toLocaleString()}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-600 hover:text-red-700 mt-2"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="mb-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="escrow"
                        checked={useEscrow}
                        onChange={e => setUseEscrow(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="escrow" className="text-sm">Pay with Escrow (funds held securely until delivery)</label>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₦{getCartTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>₦2,000</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₦{(getCartTotal() + 2000).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </Button>
                      <Button variant="outline" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Farmers
                      </Button>
                    </div>

                    <div className="text-xs text-gray-600">
                      <p>• Secure payment processing</p>
                      <p>• Direct communication with farmers</p>
                      <p>• Fresh produce guarantee</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <Button variant="ghost" onClick={() => setShowProductModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProduct.images.slice(1).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${selectedProduct.name} ${index + 2}`}
                        className="w-full h-20 object-cover rounded cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getQualityColor(selectedProduct.quality)}>
                      {selectedProduct.quality.replace('_', ' ')}
                    </Badge>
                    <Badge className={getAvailabilityColor(selectedProduct.availability)}>
                      {selectedProduct.availability.replace('_', ' ')}
                    </Badge>
                    {selectedProduct.sustainability.organic && (
                      <Badge className="bg-green-600 text-white">
                        <Leaf className="w-3 h-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ₦{selectedProduct.price.amount.toLocaleString()}
                    <span className="text-lg text-gray-600">/{selectedProduct.price.unit}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Available: {selectedProduct.quantity.available} {selectedProduct.quantity.unit}
                    • Min order: {selectedProduct.quantity.minimum} {selectedProduct.quantity.unit}
                  </p>
                </div>

                <div className="border rounded p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedProduct.farmer.avatar} />
                      <AvatarFallback>{selectedProduct.farmer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{selectedProduct.farmer.name}</h3>
                        {selectedProduct.farmer.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-sm text-gray-600">{selectedProduct.farmer.farmName}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(selectedProduct.farmer.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">
                          {selectedProduct.farmer.rating} ({selectedProduct.farmer.totalReviews})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Message Farmer
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      View Farm Profile
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      addToCart(selectedProduct, selectedProduct.quantity.minimum);
                      setShowProductModal(false);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline">
                    <Heart className={`w-4 h-4 ${selectedProduct.isLiked ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline">
                    <Bookmark className={`w-4 h-4 ${selectedProduct.isSaved ? 'fill-current text-blue-500' : ''}`} />
                  </Button>
                </div>

                {selectedProduct.shipping.available && (
                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Shipping Available</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      ₦{selectedProduct.shipping.cost} • {selectedProduct.shipping.estimatedDays} days delivery
                    </p>
                    {selectedProduct.shipping.freeThreshold && (
                      <p className="text-xs text-green-600">
                        Free shipping on orders above ₦{selectedProduct.shipping.freeThreshold.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerFarmerMarketplace;