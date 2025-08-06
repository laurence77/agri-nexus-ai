import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ProvenanceTooltip } from "@/components/ui/provenance-tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Package,
  Truck,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  Eye,
  BarChart3,
  Globe,
  Smartphone,
  CreditCard,
  Banknote,
  Handshake
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  unit: string;
  seller: {
    name: string;
    location: string;
    rating: number;
    verified: boolean;
    phone: string;
  };
  description: string;
  quality: string;
  quantity: number;
  images: string[];
  priceHistory: Array<{ date: string; price: number }>;
  harvestDate: string;
  deliveryOptions: string[];
  paymentMethods: string[];
  tags: string[];
  featured: boolean;
}

interface MarketPrice {
  commodity: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  market: string;
  currency: string;
  unit: string;
  lastUpdated: string;
}

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<{[key: string]: number}>({});

  // Sample market data
  useEffect(() => {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Premium Maize (White)',
        category: 'grains',
        price: 65,
        currency: 'KSH',
        unit: 'kg',
        seller: {
          name: 'Kibera Farmers Cooperative',
          location: 'Nairobi, Kenya',
          rating: 4.8,
          verified: true,
          phone: '+254722123456'
        },
        description: 'High-quality white maize, recently harvested. Moisture content below 14%. Perfect for commercial use.',
        quality: 'Grade A',
        quantity: 2500,
        images: ['/api/placeholder/300/200'],
        priceHistory: [
          { date: '2024-01-01', price: 60 },
          { date: '2024-01-15', price: 62 },
          { date: '2024-02-01', price: 65 }
        ],
        harvestDate: '2024-01-20',
        deliveryOptions: ['Pickup', 'Local Delivery', 'Regional Transport'],
        paymentMethods: ['M-Pesa', 'Cash', 'Bank Transfer'],
        tags: ['organic', 'bulk-available', 'grade-a'],
        featured: true
      },
      {
        id: '2',
        name: 'Fresh Tomatoes',
        category: 'vegetables',
        price: 180,
        currency: 'KSH',
        unit: 'kg',
        seller: {
          name: 'John Mbeki',
          location: 'Kiambu, Kenya',
          rating: 4.5,
          verified: true,
          phone: '+254733987654'
        },
        description: 'Fresh Roma tomatoes, perfect for processing or fresh market. Harvested this morning.',
        quality: 'Premium',
        quantity: 500,
        images: ['/api/placeholder/300/200'],
        priceHistory: [
          { date: '2024-01-01', price: 160 },
          { date: '2024-01-15', price: 170 },
          { date: '2024-02-01', price: 180 }
        ],
        harvestDate: '2024-02-01',
        deliveryOptions: ['Pickup', 'Same-day Delivery'],
        paymentMethods: ['M-Pesa', 'Cash'],
        tags: ['fresh', 'same-day', 'premium'],
        featured: false
      },
      {
        id: '3',
        name: 'Arabica Coffee Beans',
        category: 'cash-crops',
        price: 320,
        currency: 'KSH',
        unit: 'kg',
        seller: {
          name: 'Mt. Kenya Coffee Growers',
          location: 'Nyeri, Kenya',
          rating: 4.9,
          verified: true,
          phone: '+254744567890'
        },
        description: 'Premium Arabica coffee beans, sun-dried and properly processed. Export quality.',
        quality: 'AA Grade',
        quantity: 1000,
        images: ['/api/placeholder/300/200'],
        priceHistory: [
          { date: '2024-01-01', price: 300 },
          { date: '2024-01-15', price: 310 },
          { date: '2024-02-01', price: 320 }
        ],
        harvestDate: '2024-01-10',
        deliveryOptions: ['Pickup', 'Regional Transport', 'Export Shipping'],
        paymentMethods: ['Bank Transfer', 'M-Pesa', 'USD'],
        tags: ['export-quality', 'arabica', 'aa-grade'],
        featured: true
      }
    ];

    const sampleMarketPrices: MarketPrice[] = [
      {
        commodity: 'Maize',
        currentPrice: 65,
        previousPrice: 62,
        change: 3,
        changePercent: 4.8,
        market: 'Nairobi',
        currency: 'KSH',
        unit: 'kg',
        lastUpdated: '2024-02-01 14:30'
      },
      {
        commodity: 'Rice',
        currentPrice: 120,
        previousPrice: 125,
        change: -5,
        changePercent: -4.0,
        market: 'Mombasa',
        currency: 'KSH',
        unit: 'kg',
        lastUpdated: '2024-02-01 14:30'
      },
      {
        commodity: 'Beans',
        currentPrice: 180,
        previousPrice: 175,
        change: 5,
        changePercent: 2.9,
        market: 'Nairobi',
        currency: 'KSH',
        unit: 'kg',
        lastUpdated: '2024-02-01 14:30'
      },
      {
        commodity: 'Coffee',
        currentPrice: 320,
        previousPrice: 310,
        change: 10,
        changePercent: 3.2,
        market: 'Nyeri',
        currency: 'KSH',
        unit: 'kg',
        lastUpdated: '2024-02-01 14:30'
      }
    ];

    setProducts(sampleProducts);
    setMarketPrices(sampleMarketPrices);
  }, []);

  const categories = [
    { id: 'all', name: 'All Products', icon: <Package className="w-4 h-4" /> },
    { id: 'grains', name: 'Grains & Cereals', icon: <Package className="w-4 h-4" /> },
    { id: 'vegetables', name: 'Vegetables', icon: <Package className="w-4 h-4" /> },
    { id: 'fruits', name: 'Fruits', icon: <Package className="w-4 h-4" /> },
    { id: 'cash-crops', name: 'Cash Crops', icon: <Package className="w-4 h-4" /> },
    { id: 'livestock', name: 'Livestock', icon: <Package className="w-4 h-4" /> },
    { id: 'seeds', name: 'Seeds & Inputs', icon: <Package className="w-4 h-4" /> }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatters = {
      KSH: (val: number) => `KSh ${val.toLocaleString()}`,
      USD: (val: number) => `$${val.toLocaleString()}`,
      NGN: (val: number) => `₦${val.toLocaleString()}`,
      GHS: (val: number) => `₵${val.toLocaleString()}`
    };
    return formatters[currency as keyof typeof formatters]?.(amount) || `${currency} ${amount}`;
  };

  const renderMarketPrices = () => (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Live Market Prices</h2>
            <p className="text-sm text-gray-600">Real-time commodity prices across East Africa</p>
          </div>
        </div>
        <Badge className="glass-badge success">Live</Badge>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketPrices.map((price, index) => (
          <div key={index} className="p-4 bg-white/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{price.commodity}</h3>
              <div className={`flex items-center space-x-1 ${
                price.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {price.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="text-xs font-medium">{price.changePercent.toFixed(1)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(price.currentPrice, price.currency)}/{price.unit}
              </p>
              <p className="text-xs text-gray-600">{price.market} Market</p>
              <p className="text-xs text-gray-500">Updated: {new Date(price.lastUpdated).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProductCard = (product: Product) => (
    <div key={product.id} className="glass-card group hover:scale-105">
      {product.featured && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="glass-badge success">Featured</Badge>
        </div>
      )}
      
      <div className="relative">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <button
          onClick={() => toggleFavorite(product.id)}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            favorites.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
          }`}
          aria-label={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
          title={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <ProvenanceTooltip tableName="products" recordId={product.id} fieldName="name">
  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
</ProvenanceTooltip>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(product.price, product.currency)}/{product.unit}
            </p>
            <ProvenanceTooltip tableName="products" recordId={product.id} fieldName="quantity">
  <p className="text-xs text-gray-600">{product.quantity} {product.unit} available</p>
</ProvenanceTooltip>
          </div>
          <ProvenanceTooltip tableName="products" recordId={product.id} fieldName="quality">
  <Badge className="glass-badge info">{product.quality}</Badge>
</ProvenanceTooltip>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <ProvenanceTooltip tableName="products" recordId={product.id} fieldName="seller.rating">
  <span className="text-sm font-medium">{product.seller.rating}</span>
</ProvenanceTooltip>
          </div>
          <span className="text-sm text-gray-600">•</span>
          <ProvenanceTooltip tableName="products" recordId={product.id} fieldName="seller.name">
  <span className="text-sm text-gray-600">{product.seller.name}</span>
</ProvenanceTooltip>
          {product.seller.verified && (
            <CheckCircle className="w-4 h-4 text-blue-500" />
          )}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          {product.seller.location}
        </div>

        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} className="glass-badge info text-xs">{tag}</Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            onClick={() => addToCart(product.id)}
            className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          <Button
            variant="outline"
            className="glass-button"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contact
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBuyTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="glass-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products, sellers, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 w-full"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="glass-button">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" className="glass-button">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`glass-button flex items-center space-x-2 ${
                selectedCategory === category.id ? 'bg-white/30' : ''
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Market Prices */}
      {renderMarketPrices()}

      {/* Products Grid */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <p className="text-sm text-gray-600">{filteredProducts.length} products found</p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(renderProductCard)}
          </div>
        )}
      </div>
    </div>
  );

  const renderSellTab = () => (
    <div className="space-y-6">
      {/* Seller Dashboard */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Active Listings</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-sm text-gray-600">Products for sale</p>
        </div>

        <div className="glass-card text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-green-600">KSh 245K</p>
          <p className="text-sm text-gray-600">Revenue earned</p>
        </div>

        <div className="glass-card text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Seller Rating</h3>
          <p className="text-3xl font-bold text-purple-600">4.8</p>
          <p className="text-sm text-gray-600">Based on 47 reviews</p>
        </div>
      </div>

      {/* Create Listing */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sell Your Products</h2>
            <p className="text-sm text-gray-600">List your farm products and reach thousands of buyers</p>
          </div>
          <Button className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/50 rounded-lg">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">List Products</h3>
            <p className="text-sm text-gray-600">Upload photos and descriptions</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Set Prices</h3>
            <p className="text-sm text-gray-600">Competitive market-based pricing</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-lg">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Connect Buyers</h3>
            <p className="text-sm text-gray-600">Direct communication channels</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-lg">
            <Truck className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Arrange Delivery</h3>
            <p className="text-sm text-gray-600">Flexible delivery options</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-6">
      {/* Pricing Analytics */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pricing Intelligence</h2>
            <p className="text-sm text-gray-600">AI-powered market analysis and price predictions</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">+12%</div>
            <p className="text-sm text-gray-600">Average price increase</p>
            <p className="text-xs text-gray-500">vs last month</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">KSh 180</div>
            <p className="text-sm text-gray-600">Recommended maize price</p>
            <p className="text-xs text-gray-500">per kg</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">85%</div>
            <p className="text-sm text-gray-600">Price prediction accuracy</p>
            <p className="text-xs text-gray-500">AI model confidence</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">24h</div>
            <p className="text-sm text-gray-600">Price update frequency</p>
            <p className="text-xs text-gray-500">Real-time data</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Solutions</h2>
            <p className="text-sm text-gray-600">Secure, Africa-optimized payment methods</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">M-Pesa Integration</h3>
                <Badge className="glass-badge success text-xs">Most Popular</Badge>
              </div>
            </div>
            <p className="text-sm text-green-700 mb-4">
              Instant mobile money payments across East Africa. Low fees, high security.
            </p>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Instant transfers</li>
              <li>• 1.5% transaction fee</li>
              <li>• Works with feature phones</li>
            </ul>
          </div>

          <div className="p-6 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Bank Transfer</h3>
                <Badge className="glass-badge info text-xs">Secure</Badge>
              </div>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Direct bank transfers for large transactions. Enhanced security and documentation.
            </p>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Large transaction support</li>
              <li>• 0.5% transaction fee</li>
              <li>• Full documentation</li>
            </ul>
          </div>

          <div className="p-6 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Handshake className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Escrow Service</h3>
                <Badge className="glass-badge warning text-xs">Protected</Badge>
              </div>
            </div>
            <p className="text-sm text-orange-700 mb-4">
              Secure escrow for high-value transactions. Money held until delivery confirmation.
            </p>
            <ul className="text-sm text-orange-600 space-y-1">
              <li>• Buyer protection</li>
              <li>• 2% service fee</li>
              <li>• Dispute resolution</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl animate-float animate-delay-2s" />
      </div>

      <div className="pt-32 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">AgriNexus Marketplace</h1>
                <p className="text-gray-600">
                  Connect farmers, buyers, and cooperatives across Africa
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2,847</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">15,230</div>
                <div className="text-sm text-gray-600">Registered Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">KSh 2.4M</div>
                <div className="text-sm text-gray-600">Daily Volume</div>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="glass-card !padding-2 !margin-0">
              <TabsList className="w-full bg-transparent">
                <TabsTrigger value="buy" className="glass-button data-[state=active]:bg-white/20">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Products
                </TabsTrigger>
                <TabsTrigger value="sell" className="glass-button data-[state=active]:bg-white/20">
                  <Package className="w-4 h-4 mr-2" />
                  Sell Products
                </TabsTrigger>
                <TabsTrigger value="pricing" className="glass-button data-[state=active]:bg-white/20">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Market Pricing
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="buy">
              {renderBuyTab()}
            </TabsContent>

            <TabsContent value="sell">
              {renderSellTab()}
            </TabsContent>

            <TabsContent value="pricing">
              {renderPricingTab()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;