// Marketplace Service Types and Interfaces
import { ProvenanceService, ProvenanceMetadata } from '../../lib/provenance';
// Agricultural input marketplace with verified dealers and logistics

export interface AgroDealer {
  id: string;
  name: string;
  businessName: string;
  description: string;
  logo?: string;
  rating: number;
  totalReviews: number;
  location: {
    address: string;
    city: string;
    region: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    whatsapp?: string;
  };
  verification: {
    businessLicense: boolean;
    taxCompliance: boolean;
    qualityCertificates: string[];
    lastVerified: Date;
    verificationLevel: 'basic' | 'verified' | 'premium';
  };
  serviceAreas: string[];
  specialties: string[];
  deliveryOptions: {
    type: 'pickup' | 'delivery' | 'shipping';
    available: boolean;
    cost: number;
    freeAbove?: number;
    estimatedDays?: number;
  }[];
  paymentMethods: string[];
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  policies: {
    returnPolicy?: string;
    warrantyPolicy?: string;
    shippingPolicy?: string;
    privacyPolicy?: string;
  };
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  dealerId: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  currency: string;
  stock: number;
  minOrderQty: number;
  maxOrderQty?: number;
  images: string[];
  specifications: Record<string, string | number>;
  certifications?: string[];
  usage_instructions?: string;
  benefits?: string[];
  tags?: string[];
  sku?: string;
  barcode?: string;
  brand?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  expiryDate?: Date;
  warranty?: string;
  discounts?: {
    type: 'percentage' | 'fixed';
    value: number;
    minQty?: number;
    validUntil?: Date;
    description?: string;
  }[];
  dealer?: {
    id: string;
    name: string;
    rating: number;
    totalReviews: number;
    location: string;
    verified: boolean;
    serviceAreas?: string[];
  };
  rating: number;
  totalReviews: number;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string;
  subcategories?: ProductCategory[];
  isActive: boolean;
  sortOrder: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerDetails: {
    name: string;
    phone: string;
    email?: string;
    location: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount?: number;
  total: number;
  currency: string;
  status: 'draft' | 'submitted' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentReference?: string;
  deliveryAddress: {
    address: string;
    city: string;
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  deliveryOption: {
    type: 'pickup' | 'delivery' | 'shipping';
    provider?: string;
    estimatedDelivery?: Date;
    trackingNumber?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  dealerId: string;
  dealerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: Record<string, any>;
  notes?: string;
}

export interface DeliveryRoute {
  id: string;
  providerId: string;
  providerName: string;
  orderId: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleInfo?: {
    type: string;
    plateNumber: string;
    capacity: string;
  };
  pickupAddress: string;
  deliveryAddress: string;
  distance: number;
  estimatedDuration: number;
  actualDuration?: number;
  cost: number;
  trackingUpdates: {
    status: string;
    location?: string;
    timestamp: Date;
    notes?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}

export interface DeliveryProvider {
  id: string;
  name: string;
  description: string;
  logo?: string;
  rating: number;
  totalDeliveries: number;
  serviceAreas: string[];
  vehicleTypes: string[];
  pricing: {
    baseRate: number;
    perKmRate: number;
    perKgRate: number;
    minimumCharge: number;
  };
  contact: {
    phone: string;
    email: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quote {
  id: string;
  buyerId: string;
  dealerId: string;
  items: {
    productId: string;
    quantity: number;
    specifications?: Record<string, any>;
  }[];
  message?: string;
  status: 'pending' | 'responded' | 'accepted' | 'declined' | 'expired';
  dealerResponse?: {
    totalPrice: number;
    currency: string;
    deliveryFee: number;
    deliveryDays: number;
    validUntil: Date;
    notes?: string;
    alternativeProducts?: {
      productId: string;
      reason: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  targetType: 'product' | 'dealer';
  targetId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

export interface MarketplaceAnalytics {
  totalProducts: number;
  totalDealers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCategories: {
    category: string;
    orderCount: number;
    revenue: number;
  }[];
  topDealers: {
    dealerId: string;
    dealerName: string;
    orderCount: number;
    revenue: number;
    rating: number;
  }[];
  ordersByStatus: Record<string, number>;
  revenueByMonth: {
    month: string;
    revenue: number;
    orders: number;
  }[];
}

// Marketplace Service Class
export class MarketplaceService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Product Management
  async getProducts(filters?: {
    category?: string;
    dealerId?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/products?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get products: ${response.statusText}`);
    }

    return response.json();
  }

  async getProduct(productId: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get product: ${response.statusText}`);
    }

    return response.json();
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, provenanceMeta?: ProvenanceMetadata): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    const createdProduct = await response.json();
    if (provenanceMeta) {
      await ProvenanceService.recordRecordChanges(
        'products',
        createdProduct.id,
        Object.fromEntries(Object.entries(createdProduct).map(([k, v]) => [k, { newValue: v }])),
        provenanceMeta
      );
    }
    return createdProduct;
  

  async updateProduct(productId: string, updates: Partial<Product>, provenanceMeta?: ProvenanceMetadata): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.statusText}`);
    }

    const updatedProduct = await response.json();
    if (provenanceMeta) {
      await ProvenanceService.recordRecordChanges(
        'products',
        productId,
        Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, { newValue: v }])),
        provenanceMeta
      );
    }
    return updatedProduct;
  }

  // Dealer Management
  async getDealers(filters?: {
    location?: string;
    specialty?: string;
    verified?: boolean;
    minRating?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ dealers: AgroDealer[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/dealers?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get dealers: ${response.statusText}`);
    }

    return response.json();
  }

  async getDealer(dealerId: string): Promise<AgroDealer> {
    const response = await fetch(`${this.baseUrl}/dealers/${dealerId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get dealer: ${response.statusText}`);
    }

    return response.json();
  }

  async registerDealer(dealer: Omit<AgroDealer, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgroDealer> {
    const response = await fetch(`${this.baseUrl}/dealers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dealer)
    });

    if (!response.ok) {
      throw new Error(`Failed to register dealer: ${response.statusText}`);
    }

    return response.json();
  }

  // Order Management
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, provenanceMeta?: ProvenanceMetadata): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    const createdOrder = await response.json();
    if (provenanceMeta) {
      await ProvenanceService.recordRecordChanges(
        'orders',
        createdOrder.id,
        Object.fromEntries(Object.entries(createdOrder).map(([k, v]) => [k, { newValue: v }])),
        provenanceMeta
      );
    }
    return createdOrder;
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get order: ${response.statusText}`);
    }

    return response.json();
  }

  async updateOrderStatus(orderId: string, status: Order['status'], notes?: string, provenanceMeta?: ProvenanceMetadata): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, notes })
    });

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }

    const updatedOrder = await response.json();
    if (provenanceMeta) {
      await ProvenanceService.recordRecordChanges(
        'orders',
        orderId,
        { status: { newValue: status }, ...(notes ? { notes: { newValue: notes } } : {}) },
        provenanceMeta
      );
    }
    return updatedOrder;
  }

  async getUserOrders(userId: string, filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    const params = new URLSearchParams({ userId });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/orders?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user orders: ${response.statusText}`);
    }

    return response.json();
  }

  // Quote Management
  async createQuote(quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>, provenanceMeta?: ProvenanceMetadata): Promise<Quote> {
    const response = await fetch(`${this.baseUrl}/quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quote)
    });

    if (!response.ok) {
      throw new Error(`Failed to create quote: ${response.statusText}`);
    }

    return response.json();
  }

  async respondToQuote(quoteId: string, response: Quote['dealerResponse']): Promise<Quote> {
    const resp = await fetch(`${this.baseUrl}/quotes/${quoteId}/respond`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    });

    if (!resp.ok) {
      throw new Error(`Failed to respond to quote: ${resp.statusText}`);
    }

    return resp.json();
  }

  // Review Management
  async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpfulVotes'>, provenanceMeta?: ProvenanceMetadata): Promise<Review> {
    const response = await fetch(`${this.baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(review)
    });

    if (!response.ok) {
      throw new Error(`Failed to create review: ${response.statusText}`);
    }

    const createdReview = await response.json();
    if (provenanceMeta) {
      await ProvenanceService.recordRecordChanges(
        'reviews',
        createdReview.id,
        Object.fromEntries(Object.entries(createdReview).map(([k, v]) => [k, { newValue: v }])),
        provenanceMeta
      );
    }
    return createdReview;
  }

  async getReviews(targetType: 'product' | 'dealer', targetId: string): Promise<Review[]> {
    const response = await fetch(`${this.baseUrl}/reviews?targetType=${targetType}&targetId=${targetId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get reviews: ${response.statusText}`);
    }

    return response.json();
  }

  // Delivery Management
  async createDeliveryRoute(route: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt' | 'trackingUpdates'>, provenanceMeta?: ProvenanceMetadata): Promise<DeliveryRoute> {
    const response = await fetch(`${this.baseUrl}/delivery/routes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(route)
    });

    if (!response.ok) {
      throw new Error(`Failed to create delivery route: ${response.statusText}`);
    }

    const createdRoute = await response.json();
    if (provenanceMeta) {
      await ProvenanceService.recordRecordChanges(
        'delivery_routes',
        createdRoute.id,
        Object.fromEntries(Object.entries(createdRoute).map(([k, v]) => [k, { newValue: v }])),
        provenanceMeta
      );
    }
    return createdRoute;
  }

  async trackDelivery(routeId: string): Promise<DeliveryRoute> {
    const response = await fetch(`${this.baseUrl}/delivery/routes/${routeId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to track delivery: ${response.statusText}`);
    }

    return response.json();
  }

  // Search and Recommendations
  async searchProducts(query: string, filters?: any): Promise<Product[]> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/search/products?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.statusText}`);
    }

    return response.json();
  }

  async getRecommendedProducts(userId: string, limit: number = 10): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/recommendations/products?userId=${userId}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get recommendations: ${response.statusText}`);
    }

    return response.json();
  }

  // Analytics
  async getMarketplaceAnalytics(startDate: Date, endDate: Date): Promise<MarketplaceAnalytics> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const response = await fetch(`${this.baseUrl}/analytics/marketplace?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get marketplace analytics: ${response.statusText}`);
    }

    return response.json();
  }
}

// Default export
export default MarketplaceService;