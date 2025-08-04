// Input Marketplace Components
// Verified agro-dealers, product listings, farmer ordering, and delivery coordination

export { InputMarketplace } from './InputMarketplace';
export { ProductCatalog } from './ProductCatalog';
export { DealerDirectory } from './DealerDirectory';
export { OrderManagement } from './OrderManagement';
export { DeliveryTracking } from './DeliveryTracking';
export { ProductSearch } from './ProductSearch';

// Re-export marketplace service types for convenience
export type {
  AgroDealer,
  Product,
  ProductCategory,
  Order,
  OrderItem,
  DeliveryRoute,
  DeliveryProvider
} from '@/services/marketplace/marketplace-service';

export type {
  ProductReview,
  ProductRating,
  DealerVerification,
  QualityCertificate
} from '@/services/marketplace/verification-service';

// Marketplace Component metadata
export const MARKETPLACE_COMPONENTS_METADATA = {
  inputMarketplace: {
    title: 'Input Marketplace',
    description: 'Comprehensive agricultural input marketplace with verified dealers and integrated logistics',
    features: [
      'Verified agro-dealer network with quality certifications',
      'Comprehensive product catalog with detailed specifications',
      'Smart search and filtering by crop type, region, price',
      'Real-time inventory management and availability',
      'Integrated order processing and payment',
      'Last-mile delivery coordination with tracking'
    ],
    technologies: ['Product Management', 'Inventory Tracking', 'Logistics Integration', 'Payment Processing']
  },
  productCatalog: {
    title: 'Product Catalog',
    description: 'Searchable catalog of agricultural inputs with detailed product information and reviews',
    features: [
      'Categorized product listings (seeds, fertilizers, pesticides, tools)',
      'Detailed product specifications and usage guidelines',
      'High-quality product images and documentation',
      'User reviews and ratings system',
      'Price comparison across dealers',
      'Stock availability and delivery estimates'
    ],
    technologies: ['Search Engine', 'Image Management', 'Review System', 'Inventory APIs']
  },
  dealerDirectory: {
    title: 'Dealer Directory',
    description: 'Directory of verified agricultural input dealers with ratings and certifications',
    features: [
      'Comprehensive dealer profiles with verification status',
      'Business registration and licensing verification',
      'Quality certifications and compliance records',
      'Customer reviews and satisfaction ratings',
      'Service area coverage and delivery options',
      'Direct communication channels'
    ],
    technologies: ['Verification System', 'Geolocation Services', 'Communication APIs', 'Document Management']
  },
  orderManagement: {
    title: 'Order Management',
    description: 'End-to-end order processing from cart to delivery confirmation',
    features: [
      'Shopping cart with bulk ordering capabilities',
      'Quote requests for large orders',
      'Order approval workflows for cooperatives',
      'Payment integration with escrow protection',
      'Order status tracking and updates',
      'Return and refund management'
    ],
    technologies: ['Workflow Management', 'Payment Integration', 'Status Tracking', 'Notification System']
  }
} as const;

// Product Categories
export const PRODUCT_CATEGORIES = {
  seeds: {
    id: 'seeds',
    name: 'Seeds & Planting Materials',
    description: 'Certified seeds, seedlings, and planting materials',
    icon: '🌱',
    color: 'text-green-400',
    subcategories: [
      'Vegetable Seeds',
      'Cereal Seeds',
      'Legume Seeds',
      'Fruit Seedlings',
      'Flower Seeds',
      'Hybrid Varieties',
      'Organic Seeds',
      'Traditional Varieties'
    ]
  },
  fertilizers: {
    id: 'fertilizers',
    name: 'Fertilizers & Nutrients',
    description: 'Organic and synthetic fertilizers, soil amendments',
    icon: '🧪',
    color: 'text-blue-400',
    subcategories: [
      'NPK Fertilizers',
      'Organic Fertilizers',
      'Liquid Fertilizers',
      'Foliar Feeds',
      'Soil Conditioners',
      'Micronutrients',
      'Lime & pH Adjusters',
      'Compost & Manure'
    ]
  },
  pesticides: {
    id: 'pesticides',
    name: 'Pesticides & Chemicals',
    description: 'Crop protection chemicals and bio-pesticides',
    icon: '🛡️',
    color: 'text-red-400',
    subcategories: [
      'Insecticides',
      'Herbicides',
      'Fungicides',
      'Nematicides',
      'Bio-pesticides',
      'Growth Regulators',
      'Adjuvants',
      'Fumigants'
    ]
  },
  tools: {
    id: 'tools',
    name: 'Tools & Equipment',
    description: 'Farming tools, equipment, and machinery',
    icon: '🔧',
    color: 'text-yellow-400',
    subcategories: [
      'Hand Tools',
      'Power Tools',
      'Irrigation Equipment',
      'Harvesting Tools',
      'Sprayers',
      'Tractors & Implements',
      'Storage Equipment',
      'Processing Equipment'
    ]
  },
  livestock: {
    id: 'livestock',
    name: 'Livestock Supplies',
    description: 'Animal feed, veterinary supplies, and equipment',
    icon: '🐄',
    color: 'text-purple-400',
    subcategories: [
      'Animal Feed',
      'Feed Supplements',
      'Veterinary Medicines',
      'Vaccines',
      'Animal Housing',
      'Milking Equipment',
      'Breeding Supplies',
      'Water Systems'
    ]
  },
  irrigation: {
    id: 'irrigation',
    name: 'Irrigation Systems',
    description: 'Water management and irrigation solutions',
    icon: '💧',
    color: 'text-cyan-400',
    subcategories: [
      'Drip Irrigation',
      'Sprinkler Systems',
      'Pipes & Fittings',
      'Pumps & Motors',
      'Water Storage',
      'Filtration Systems',
      'Automation Controllers',
      'Solar Pumps'
    ]
  }
} as const;

// Order Status Constants
export const ORDER_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  READY: 'ready',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Delivery Status Constants
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  RETURNED: 'returned'
} as const;

export type DeliveryStatus = typeof DELIVERY_STATUS[keyof typeof DELIVERY_STATUS];

// Marketplace utility functions
export const marketplaceUtils = {
  /**
   * Calculate product price with discounts
   */
  calculatePrice: (basePrice: number, quantity: number, discount?: { type: 'percentage' | 'fixed'; value: number; minQty?: number }): {
    unitPrice: number;
    totalPrice: number;
    savings: number;
  } => {
    let unitPrice = basePrice;
    let savings = 0;

    if (discount && (!discount.minQty || quantity >= discount.minQty)) {
      if (discount.type === 'percentage') {
        savings = basePrice * (discount.value / 100);
        unitPrice = basePrice - savings;
      } else {
        savings = discount.value;
        unitPrice = basePrice - discount.value;
      }
    }

    return {
      unitPrice: Math.max(0, unitPrice),
      totalPrice: Math.max(0, unitPrice * quantity),
      savings: savings * quantity
    };
  },

  /**
   * Calculate delivery cost based on distance and weight
   */
  calculateDeliveryFee: (distance: number, weight: number, deliveryZone: 'local' | 'regional' | 'national'): number => {
    const baseFees = { local: 500, regional: 1000, national: 2000 }; // KES
    const distanceRate = { local: 20, regional: 30, national: 50 }; // KES per km
    const weightRate = { local: 10, regional: 15, national: 25 }; // KES per kg

    const baseFee = baseFees[deliveryZone];
    const distanceFee = distance * distanceRate[deliveryZone];
    const weightFee = weight * weightRate[deliveryZone];

    return baseFee + distanceFee + weightFee;
  },

  /**
   * Estimate delivery time
   */
  estimateDeliveryTime: (distance: number, deliveryZone: 'local' | 'regional' | 'national'): {
    minDays: number;
    maxDays: number;
    description: string;
  } => {
    const estimates = {
      local: { min: 1, max: 2, desc: 'Same day or next day delivery' },
      regional: { min: 2, max: 4, desc: '2-4 business days' },
      national: { min: 5, max: 7, desc: '5-7 business days' }
    };

    const estimate = estimates[deliveryZone];
    return {
      minDays: estimate.min,
      maxDays: estimate.max,
      description: estimate.desc
    };
  },

  /**
   * Validate product quantity against stock
   */
  validateQuantity: (requestedQty: number, availableStock: number, minOrderQty: number = 1, maxOrderQty?: number): {
    isValid: boolean;
    errors: string[];
    adjustedQty?: number;
  } => {
    const errors: string[] = [];
    let adjustedQty = requestedQty;

    if (requestedQty < minOrderQty) {
      errors.push(`Minimum order quantity is ${minOrderQty}`);
      adjustedQty = minOrderQty;
    }

    if (maxOrderQty && requestedQty > maxOrderQty) {
      errors.push(`Maximum order quantity is ${maxOrderQty}`);
      adjustedQty = maxOrderQty;
    }

    if (requestedQty > availableStock) {
      errors.push(`Only ${availableStock} units available in stock`);
      adjustedQty = availableStock;
    }

    return {
      isValid: errors.length === 0,
      errors,
      adjustedQty: adjustedQty !== requestedQty ? adjustedQty : undefined
    };
  },

  /**
   * Generate order reference number
   */
  generateOrderRef: (dealerId: string): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${dealerId.slice(-4).toUpperCase()}-${timestamp}-${random}`;
  },

  /**
   * Calculate order totals
   */
  calculateOrderTotals: (items: any[], deliveryFee: number = 0, taxRate: number = 0.16): {
    subtotal: number;
    deliveryFee: number;
    taxAmount: number;
    total: number;
  } => {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + deliveryFee + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  },

  /**
   * Format product specifications
   */
  formatSpecifications: (specs: Record<string, any>): string => {
    return Object.entries(specs)
      .map(([key, value]) => `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}`)
      .join(' | ');
  },

  /**
   * Get category icon and color
   */
  getCategoryInfo: (categoryId: string) => {
    return PRODUCT_CATEGORIES[categoryId as keyof typeof PRODUCT_CATEGORIES] || {
      icon: '📦',
      color: 'text-gray-400',
      name: 'Other Products'
    };
  },

  /**
   * Calculate dealer rating
   */
  calculateDealerRating: (reviews: any[]): {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  } => {
    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0, ratingDistribution: {} };
    }

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const totalRating = reviews.reduce((sum, review) => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
      return sum + review.rating;
    }, 0);

    return {
      averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution
    };
  },

  /**
   * Get order status color
   */
  getOrderStatusColor: (status: OrderStatus): string => {
    switch (status) {
      case ORDER_STATUS.DELIVERED:
      case ORDER_STATUS.COMPLETED:
        return 'text-green-400 bg-green-400/20';
      case ORDER_STATUS.PROCESSING:
      case ORDER_STATUS.SHIPPED:
        return 'text-blue-400 bg-blue-400/20';
      case ORDER_STATUS.CONFIRMED:
      case ORDER_STATUS.READY:
        return 'text-yellow-400 bg-yellow-400/20';
      case ORDER_STATUS.CANCELLED:
      case ORDER_STATUS.RETURNED:
        return 'text-red-400 bg-red-400/20';
      case ORDER_STATUS.DRAFT:
      case ORDER_STATUS.SUBMITTED:
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  },

  /**
   * Get delivery status color
   */
  getDeliveryStatusColor: (status: DeliveryStatus): string => {
    switch (status) {
      case DELIVERY_STATUS.DELIVERED:
        return 'text-green-400 bg-green-400/20';
      case DELIVERY_STATUS.IN_TRANSIT:
      case DELIVERY_STATUS.OUT_FOR_DELIVERY:
        return 'text-blue-400 bg-blue-400/20';
      case DELIVERY_STATUS.ASSIGNED:
      case DELIVERY_STATUS.PICKED_UP:
        return 'text-yellow-400 bg-yellow-400/20';
      case DELIVERY_STATUS.FAILED:
      case DELIVERY_STATUS.RETURNED:
        return 'text-red-400 bg-red-400/20';
      case DELIVERY_STATUS.PENDING:
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  },

  /**
   * Filter products by criteria
   */
  filterProducts: (products: any[], filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    certified?: boolean;
    dealerRating?: number;
    location?: string;
  }) => {
    return products.filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.minPrice && product.price < filters.minPrice) return false;
      if (filters.maxPrice && product.price > filters.maxPrice) return false;
      if (filters.inStock && product.stock <= 0) return false;
      if (filters.certified && !product.certifications?.length) return false;
      if (filters.dealerRating && product.dealer?.rating < filters.dealerRating) return false;
      if (filters.location && !product.dealer?.serviceAreas?.includes(filters.location)) return false;
      
      return true;
    });
  }
};

// Default export for convenient imports
export default {
  InputMarketplace,
  ProductCatalog,
  DealerDirectory,
  OrderManagement,
  DeliveryTracking,
  ProductSearch,
  MARKETPLACE_COMPONENTS_METADATA,
  PRODUCT_CATEGORIES,
  ORDER_STATUS,
  DELIVERY_STATUS,
  marketplaceUtils
};