import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  ShoppingCart,
  Store,
  Package,
  Truck,
  Search,
  Filter,
  Star,
  MapPin,
  Shield,
  Clock,
  TrendingUp,
  Heart,
  Eye,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Award,
  Zap,
  Leaf,
  Tool,
  Droplets,
  Target,
  Users,
  Calendar,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Product, AgroDealer, Order } from '@/services/marketplace/marketplace-service';
import { marketplaceUtils, PRODUCT_CATEGORIES, ORDER_STATUS } from './index';

interface InputMarketplaceProps {
  userId: string;
  userLocation?: {
    latitude: number;
    longitude: number;
    region: string;
  };
  onProductView?: (productId: string) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onOrderCreate?: (order: Partial<Order>) => void;
  className?: string;
}

interface MarketplaceFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  location?: string;
  inStock?: boolean;
  certified?: boolean;
  dealerRating?: number;
  deliveryAvailable?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  totalPrice: number;
}

/**
 * Input Marketplace Component
 * Comprehensive agricultural input marketplace with verified dealers
 */
export function InputMarketplace({ 
  userId,
  userLocation,
  onProductView,
  onAddToCart,
  onOrderCreate,
  className 
}: InputMarketplaceProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<AgroDealer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'distance'>('relevance');

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      // Mock marketplace data - in production, fetch from marketplace service
      const mockProducts: Product[] = [
        {
          id: 'prod_001',
          dealerId: 'dealer_001',
          name: 'Hybrid Maize Seeds H513',
          description: 'High-yielding hybrid maize variety suitable for medium altitude regions. Drought tolerant with excellent cob formation.',
          category: 'seeds',
          subcategory: 'Cereal Seeds',
          price: 350,
          unit: 'kg',
          currency: 'KES',
          stock: 500,
          minOrderQty: 2,
          maxOrderQty: 100,
          images: ['/images/maize-seeds-1.jpg', '/images/maize-seeds-2.jpg'],
          specifications: {
            variety: 'H513',
            maturity: '120-130 days',
            yield_potential: '8-12 tons/ha',
            plant_height: '2.5-3m',
            grain_color: 'White',
            resistance: 'MSV, GLS, Rust'
          },
          certifications: ['KEPHIS Certified', 'Organic'],
          usage_instructions: 'Plant at 75cm x 25cm spacing. Apply fertilizer at planting and top dress at 6 weeks.',
          benefits: ['High yield potential', 'Drought tolerant', 'Disease resistant', 'Good storage quality'],
          dealer: {
            id: 'dealer_001',
            name: 'Kenya Seed Company',
            rating: 4.8,
            totalReviews: 234,
            location: 'Kitale, Kenya',
            verified: true,
            serviceAreas: ['Western Kenya', 'Rift Valley', 'Central Kenya']
          },
          rating: 4.7,
          totalReviews: 89,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-07-20')
        },
        {
          id: 'prod_002',
          dealerId: 'dealer_002',
          name: 'NPK 20-10-10 Fertilizer',
          description: 'High nitrogen fertilizer ideal for leafy vegetables and cereal crops during vegetative growth stage.',
          category: 'fertilizers',
          subcategory: 'NPK Fertilizers',
          price: 3500,
          unit: '50kg bag',
          currency: 'KES',
          stock: 200,
          minOrderQty: 1,
          maxOrderQty: 50,
          images: ['/images/npk-fertilizer-1.jpg'],
          specifications: {
            nitrogen: '20%',
            phosphorus: '10%',
            potassium: '10%',
            form: 'Granular',
            solubility: 'Slow release',
            ph_effect: 'Neutral'
          },
          certifications: ['PCPB Registered', 'ISO 9001'],
          usage_instructions: 'Apply 200-300kg per hectare at planting. Can be top-dressed after 4-6 weeks.',
          benefits: ['Promotes vegetative growth', 'Improves leaf color', 'Increases protein content', 'Long-lasting effect'],
          dealer: {
            id: 'dealer_002',
            name: 'Yara East Africa',
            rating: 4.6,
            totalReviews: 156,
            location: 'Nairobi, Kenya',
            verified: true,
            serviceAreas: ['All Kenya', 'Uganda', 'Tanzania']
          },
          rating: 4.5,
          totalReviews: 67,
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-07-18')
        },
        {
          id: 'prod_003',
          dealerId: 'dealer_003',
          name: 'Greenhouse Tomato Seeds - Anna F1',
          description: 'Determinate hybrid tomato variety perfect for greenhouse production. High yield with excellent fruit quality.',
          category: 'seeds',
          subcategory: 'Vegetable Seeds',
          price: 2800,
          unit: '10g packet',
          currency: 'KES',
          stock: 150,
          minOrderQty: 1,
          maxOrderQty: 20,
          images: ['/images/tomato-seeds-1.jpg', '/images/tomato-seeds-2.jpg'],
          specifications: {
            variety: 'Anna F1',
            fruit_weight: '180-220g',
            fruit_shape: 'Round',
            fruit_color: 'Red',
            plant_type: 'Determinate',
            maturity: '75-80 days',
            resistance: 'TMV, Fusarium'
          },
          certifications: ['KEPHIS Certified', 'F1 Hybrid'],
          usage_instructions: 'Sow in seedbed, transplant after 4-5 weeks. Space at 50cm x 40cm in greenhouse.',
          benefits: ['High yield', 'Uniform fruit size', 'Good shelf life', 'Disease resistant'],
          dealer: {
            id: 'dealer_003',
            name: 'Simlaw Seeds',
            rating: 4.9,
            totalReviews: 98,
            location: 'Naivasha, Kenya',
            verified: true,
            serviceAreas: ['Central Kenya', 'Eastern Kenya', 'Nairobi']
          },
          rating: 4.8,
          totalReviews: 42,
          discounts: [
            { type: 'percentage', value: 10, minQty: 5, description: '10% off for 5+ packets' }
          ],
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2024-07-22')
        },
        {
          id: 'prod_004',
          dealerId: 'dealer_004',
          name: 'Knapsack Sprayer 20L',
          description: 'Manual knapsack sprayer with brass nozzles and adjustable pressure. Ideal for small to medium farms.',
          category: 'tools',
          subcategory: 'Sprayers',
          price: 4500,
          unit: 'piece',
          currency: 'KES',
          stock: 75,
          minOrderQty: 1,
          maxOrderQty: 10,
          images: ['/images/sprayer-1.jpg', '/images/sprayer-2.jpg'],
          specifications: {
            capacity: '20 liters',
            material: 'HDPE plastic',
            pump_type: 'Manual piston',
            nozzle_type: 'Brass adjustable',
            hose_length: '1.5 meters',
            weight: '2.5kg empty'
          },
          certifications: ['CE Marked', 'ISO 9001'],
          usage_instructions: 'Fill with spray solution, pump to build pressure, adjust nozzle for desired spray pattern.',
          benefits: ['Durable construction', 'Easy to operate', 'Adjustable spray pattern', 'Comfortable straps'],
          dealer: {
            id: 'dealer_004',
            name: 'Farmtool Kenya',
            rating: 4.4,
            totalReviews: 78,
            location: 'Nakuru, Kenya',
            verified: true,
            serviceAreas: ['Rift Valley', 'Central Kenya', 'Western Kenya']
          },
          rating: 4.3,
          totalReviews: 28,
          warranty: '12 months',
          createdAt: new Date('2024-04-12'),
          updatedAt: new Date('2024-07-15')
        },
        {
          id: 'prod_005',
          dealerId: 'dealer_005',
          name: 'Organic Foliar Feed Concentrate',
          description: 'Concentrated organic liquid fertilizer for foliar application. Rich in micronutrients and growth hormones.',
          category: 'fertilizers',
          subcategory: 'Liquid Fertilizers',
          price: 1200,
          unit: '1L bottle',
          currency: 'KES',
          stock: 300,
          minOrderQty: 1,
          maxOrderQty: 25,
          images: ['/images/foliar-feed-1.jpg'],
          specifications: {
            npk_ratio: '5-3-4',
            organic_matter: '85%',
            micronutrients: 'Fe, Mn, Zn, B, Cu',
            ph: '6.5-7.0',
            form: 'Liquid concentrate',
            dilution_rate: '1:200'
          },
          certifications: ['Organic Certified', 'PCPB Registered'],
          usage_instructions: 'Dilute 5ml per liter of water. Spray early morning or evening. Apply every 2 weeks.',
          benefits: ['Quick nutrient uptake', '100% organic', 'Improves plant health', 'Safe for environment'],
          dealer: {
            id: 'dealer_005',
            name: 'BioLogic Solutions',
            rating: 4.7,
            totalReviews: 45,
            location: 'Thika, Kenya',
            verified: true,
            serviceAreas: ['Central Kenya', 'Eastern Kenya']
          },
          rating: 4.6,
          totalReviews: 19,
          createdAt: new Date('2024-05-08'),
          updatedAt: new Date('2024-07-25')
        }
      ];

      const mockDealers: AgroDealer[] = [
        {
          id: 'dealer_001',
          name: 'Kenya Seed Company',
          businessName: 'Kenya Seed Company Limited',
          description: 'Leading seed company in East Africa providing certified seeds for over 30 years.',
          logo: '/images/ksc-logo.jpg',
          rating: 4.8,
          totalReviews: 234,
          location: {
            address: 'Kitale, Trans-Nzoia County',
            city: 'Kitale',
            region: 'Western Kenya',
            country: 'Kenya',
            coordinates: { lat: 1.0174, lng: 35.0064 }
          },
          contact: {
            phone: '+254712345678',
            email: 'info@kenyaseed.com',
            website: 'https://kenyaseed.com'
          },
          verification: {
            businessLicense: true,
            taxCompliance: true,
            qualityCertificates: ['KEPHIS', 'ISO 9001'],
            lastVerified: new Date('2024-07-01')
          },
          serviceAreas: ['Western Kenya', 'Rift Valley', 'Central Kenya'],
          specialties: ['Cereal Seeds', 'Legume Seeds', 'Vegetable Seeds'],
          deliveryOptions: [
            { type: 'pickup', available: true, cost: 0 },
            { type: 'delivery', available: true, cost: 500, freeAbove: 10000 },
            { type: 'shipping', available: true, cost: 1000, freeAbove: 20000 }
          ],
          paymentMethods: ['M-Pesa', 'Bank Transfer', 'Cash', 'Airtel Money'],
          businessHours: {
            monday: '8:00-17:00',
            tuesday: '8:00-17:00',
            wednesday: '8:00-17:00',
            thursday: '8:00-17:00',
            friday: '8:00-17:00',
            saturday: '8:00-12:00',
            sunday: 'Closed'
          },
          isActive: true,
          createdAt: new Date('2020-01-15'),
          updatedAt: new Date('2024-07-20')
        }
      ];

      setProducts(mockProducts);
      setDealers(mockDealers);
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.dealer?.name.toLowerCase().includes(searchLower) ||
        product.subcategory.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;

    // Apply other filters
    if (filters.priceRange) {
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) return false;
    }

    if (filters.inStock && product.stock <= 0) return false;
    if (filters.certified && !product.certifications?.length) return false;
    if (filters.dealerRating && product.dealer && product.dealer.rating < filters.dealerRating) return false;

    return true;
  });

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const validation = marketplaceUtils.validateQuantity(quantity, product.stock, product.minOrderQty, product.maxOrderQty);
    
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    const finalQuantity = validation.adjustedQty || quantity;
    const pricing = marketplaceUtils.calculatePrice(product.price, finalQuantity, product.discounts?.[0]);

    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += finalQuantity;
      updatedCart[existingItemIndex].totalPrice = marketplaceUtils.calculatePrice(
        product.price, 
        updatedCart[existingItemIndex].quantity, 
        product.discounts?.[0]
      ).totalPrice;
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        product,
        quantity: finalQuantity,
        totalPrice: pricing.totalPrice
      }]);
    }

    if (onAddToCart) {
      onAddToCart(product, finalQuantity);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item => {
      if (item.product.id === productId) {
        const validation = marketplaceUtils.validateQuantity(
          newQuantity, 
          item.product.stock, 
          item.product.minOrderQty, 
          item.product.maxOrderQty
        );
        
        const finalQuantity = validation.adjustedQty || newQuantity;
        const pricing = marketplaceUtils.calculatePrice(item.product.price, finalQuantity, item.product.discounts?.[0]);

        return {
          ...item,
          quantity: finalQuantity,
          totalPrice: pricing.totalPrice
        };
      }
      return item;
    });

    setCart(updatedCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      dealerId: item.product.dealerId,
      quantity: item.quantity,
      unitPrice: item.product.price,
      totalPrice: item.totalPrice
    }));

    const orderTotals = marketplaceUtils.calculateOrderTotals(orderItems);

    const order: Partial<Order> = {
      orderNumber: marketplaceUtils.generateOrderRef('MKT'),
      buyerId: userId,
      items: orderItems,
      subtotal: orderTotals.subtotal,
      deliveryFee: orderTotals.deliveryFee,
      taxAmount: orderTotals.taxAmount,
      total: orderTotals.total,
      status: ORDER_STATUS.DRAFT,
      currency: 'KES',
      createdAt: new Date()
    };

    if (onOrderCreate) {
      onOrderCreate(order);
    }

    // Clear cart after order creation
    setCart([]);
    setShowCart(false);
  };

  const renderProductCard = (product: Product) => (
    <GlassCard 
      key={product.id}
      className="overflow-hidden cursor-pointer transition-all hover:scale-105"
      onClick={() => onProductView && onProductView(product.id)}
    >
      {/* Product Image */}
      <div className="h-48 bg-gradient-to-br from-green-600 to-blue-600 relative">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {marketplaceUtils.getCategoryInfo(product.category).icon}
        </div>
        
        {/* Stock Status */}
        <div className="absolute top-3 left-3">
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>
        </div>

        {/* Discount Badge */}
        {product.discounts && product.discounts.length > 0 && (
          <div className="absolute top-3 right-3">
            <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
              {product.discounts[0].value}% OFF
            </div>
          </div>
        )}

        {/* Certifications */}
        {product.certifications && product.certifications.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Certified</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-white text-sm leading-tight">{product.name}</h3>
          <div className="flex items-center space-x-1 ml-2">
            <Star className="h-3 w-3 text-yellow-400" />
            <span className="text-yellow-400 text-xs">{product.rating}</span>
          </div>
        </div>

        <p className="text-gray-300 text-xs mb-3 line-clamp-2">{product.description}</p>

        {/* Dealer Info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Store className="h-3 w-3 text-purple-400" />
          </div>
          <div>
            <div className="text-white text-xs font-medium">{product.dealer?.name}</div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-2 w-2 text-gray-400" />
              <span className="text-gray-400 text-xs">{product.dealer?.location}</span>
              {product.dealer?.verified && (
                <CheckCircle2 className="h-2 w-2 text-green-400" />
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-green-400 font-bold">
              KES {product.price.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs">per {product.unit}</div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-400">Min order</div>
            <div className="text-white text-xs font-medium">{product.minOrderQty} {product.unit}</div>
          </div>
        </div>

        {/* Quick Specs */}
        {product.specifications && (
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-1">Key specs:</div>
            <div className="text-xs text-gray-300 line-clamp-1">
              {marketplaceUtils.formatSpecifications(product.specifications).substring(0, 80)}...
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <GlassButton
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Add to Cart
          </GlassButton>
          
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle quick view
            }}
          >
            <Eye className="h-3 w-3" />
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );

  const renderCart = () => (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Shopping Cart ({cart.length})</h3>
        <button
          onClick={() => setShowCart(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-gray-300">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                  {marketplaceUtils.getCategoryInfo(item.product.category).icon}
                </div>
                
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{item.product.name}</div>
                  <div className="text-gray-300 text-xs">{item.product.dealer?.name}</div>
                  <div className="text-green-400 font-medium text-sm">
                    KES {item.product.price.toLocaleString()} / {item.product.unit}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  
                  <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                  
                  <button
                    onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-medium">
                    KES {item.totalPrice.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.product.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/20 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-green-400">
                KES {getCartTotal().toLocaleString()}
              </span>
            </div>
            
            <GlassButton
              variant="primary"
              className="w-full"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </GlassButton>
          </div>
        </>
      )}
    </GlassCard>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Store className="h-6 w-6 text-green-400" />
            <span>AgriInput Marketplace</span>
          </h2>
          <p className="text-gray-300 mt-1">Quality agricultural inputs from verified dealers</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
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
            variant="primary"
            size="sm"
            onClick={() => setShowCart(true)}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </GlassButton>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            selectedCategory === 'all'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
          )}
        >
          All Categories
        </button>
        {Object.values(PRODUCT_CATEGORIES).map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
              selectedCategory === category.id
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
            )}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{filteredProducts.length}</div>
          <div className="text-sm text-gray-300">Products Available</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{dealers.length}</div>
          <div className="text-sm text-gray-300">Verified Dealers</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Object.keys(PRODUCT_CATEGORIES).length}
          </div>
          <div className="text-sm text-gray-300">Categories</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">4.7</div>
          <div className="text-sm text-gray-300">Avg Rating</div>
        </GlassCard>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">No Products Found</h3>
          <p className="text-gray-300">Try adjusting your search or filters</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => renderProductCard(product))}
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {renderCart()}
          </div>
        </div>
      )}
    </div>
  );
}

export default InputMarketplace;