'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { supabase } from '@/lib/supabase';
import { MobileMoneyPayment } from '@/components/payment/MobileMoneyPayment';
import '@/styles/glass-agricultural.css';

interface InputProduct {
  id: string;
  name: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'equipment' | 'tools';
  subcategory: string;
  description: string;
  price_per_unit: number;
  unit: string;
  currency: string;
  stock_quantity: number;
  minimum_order: number;
  seller_id: string;
  seller: {
    id: string;
    business_name: string;
    contact_person: string;
    phone_number: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    rating: number;
    total_sales: number;
  };
  images: string[];
  specifications: Record<string, any>;
  delivery_options: Array<{
    type: 'pickup' | 'delivery';
    cost: number;
    estimated_days: number;
  }>;
  created_at: string;
}

interface CartItem {
  product: InputProduct;
  quantity: number;
  total: number;
}

export function InputMarketplaceHub() {
  const { profile, tenant } = useAuth();
  const [products, setProducts] = useState<InputProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InputProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Load input products with seller information
      const { data: productsData, error: productsError } = await supabase
        .from('input_products')
        .select(`
          *,
          seller:input_sellers(
            id,
            business_name,
            contact_person,
            phone_number,
            verification_status,
            rating,
            total_sales
          )
        `)
        .eq('status', 'active')
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      setProducts(productsData || []);

      // Extract unique categories
      const uniqueCategories = [...new Set(productsData?.map(p => p.category) || [])];
      setCategories(uniqueCategories);

    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.subcategory.toLowerCase().includes(query) ||
        product.seller.business_name.toLowerCase().includes(query)
      );
    }

    // Sort by verification status and rating
    filtered.sort((a, b) => {
      // Verified sellers first
      if (a.seller.verification_status === 'verified' && b.seller.verification_status !== 'verified') {
        return -1;
      }
      if (b.seller.verification_status === 'verified' && a.seller.verification_status !== 'verified') {
        return 1;
      }
      
      // Then by rating
      return b.seller.rating - a.seller.rating;
    });

    setFilteredProducts(filtered);
  };

  const addToCart = (product: InputProduct, quantity: number) => {
    if (quantity < product.minimum_order) {
      alert(`Minimum order quantity is ${product.minimum_order} ${product.unit}`);
      return;
    }

    if (quantity > product.stock_quantity) {
      alert(`Only ${product.stock_quantity} ${product.unit} available in stock`);
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity, total: quantity * product.price_per_unit }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity,
        total: quantity * product.price_per_unit
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    try {
      // Create orders for each seller
      const ordersByseller = cart.reduce((acc, item) => {
        const sellerId = item.product.seller_id;
        if (!acc[sellerId]) {
          acc[sellerId] = [];
        }
        acc[sellerId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      for (const [sellerId, items] of Object.entries(ordersByeller)) {
        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
        
        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            tenant_id: tenant?.id,
            buyer_id: profile?.id,
            seller_id: sellerId,
            total_amount: totalAmount,
            currency: tenant?.currency || 'KES',
            payment_status: 'completed',
            order_status: 'confirmed',
            payment_reference: paymentResponse.transactionId,
            delivery_address: profile?.address || '',
            notes: `Input purchase order - ${items.length} items`
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price_per_unit,
          total_price: item.total
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Update product stock
        for (const item of items) {
          await supabase
            .from('input_products')
            .update({ 
              stock_quantity: item.product.stock_quantity - item.quantity 
            })
            .eq('id', item.product.id);
        }
      }

      // Clear cart and close payment
      setCart([]);
      setShowPayment(false);
      
      alert('Order placed successfully! You will receive a confirmation message.');
      
      // Reload products to update stock quantities
      loadProducts();

    } catch (err) {
      console.error('Error processing order:', err);
      alert('Order processing failed. Please contact support.');
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="status-badge status-healthy text-xs">✓ Verified</span>;
      case 'pending':
        return <span className="status-badge status-warning text-xs">⏳ Pending</span>;
      default:
        return <span className="status-badge status-danger text-xs">❌ Unverified</span>;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass animate-pulse p-8 text-center">
            <div className="text-white text-lg">Loading marketplace...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
      {/* Header */}
      <div className="glass p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Input Marketplace</h1>
            <p className="text-white/80">Quality agricultural inputs from verified suppliers</p>
          </div>
          
          <button
            onClick={() => setShowCart(true)}
            className="glass-button glass-button-primary relative"
          >
            🛒 Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {getTotalCartItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
          />

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort Options */}
          <select className="glass-input">
            <option value="relevance">Sort by Relevance</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            formatPrice={formatPrice}
            getVerificationBadge={getVerificationBadge}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="glass p-8 text-center">
          <div className="text-white text-lg mb-2">No products found</div>
          <div className="text-white/80">Try adjusting your search or filters</div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
          formatPrice={formatPrice}
          getTotalCartValue={getTotalCartValue}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <MobileMoneyPayment
              amount={getTotalCartValue()}
              currency={tenant?.currency || 'KES'}
              description="Agricultural Input Purchase"
              reference={`INPUT_${Date.now()}`}
              onSuccess={handlePaymentSuccess}
              onError={(error) => {
                console.error('Payment error:', error);
                alert('Payment failed: ' + error);
              }}
              onCancel={() => setShowPayment(false)}
              metadata={{
                transactionType: 'input_purchase',
                itemCount: cart.length,
                farmId: profile?.metadata?.default_farm_id
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ 
  product, 
  onAddToCart, 
  formatPrice, 
  getVerificationBadge 
}: {
  product: InputProduct;
  onAddToCart: (product: InputProduct, quantity: number) => void;
  formatPrice: (price: number, currency: string) => string;
  getVerificationBadge: (status: string) => React.ReactNode;
}) {
  const [quantity, setQuantity] = useState(product.minimum_order);

  return (
    <div className="glass p-4 hover:scale-105 transition-transform">
      {/* Product Image */}
      <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
        {product.images?.[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-6xl">
            {product.category === 'seeds' ? '🌱' :
             product.category === 'fertilizers' ? '🧪' :
             product.category === 'pesticides' ? '🚫' :
             product.category === 'equipment' ? '🚜' : '🛠️'}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-white font-semibold mb-1">{product.name}</h3>
          <p className="text-white/80 text-sm line-clamp-2">{product.description}</p>
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-green-primary font-bold text-lg">
              {formatPrice(product.price_per_unit, product.currency)}
            </div>
            <div className="text-white/60 text-xs">per {product.unit}</div>
          </div>
          <div className="text-white/80 text-sm">
            Stock: {product.stock_quantity} {product.unit}
          </div>
        </div>

        {/* Seller Info */}
        <div className="border-t border-white/20 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">{product.seller.business_name}</span>
            {getVerificationBadge(product.seller.verification_status)}
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>⭐ {product.seller.rating.toFixed(1)}</span>
            <span>•</span>
            <span>{product.seller.total_sales} sales</span>
          </div>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="border-t border-white/20 pt-3">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-white/80 text-sm">Qty:</label>
            <input
              type="number"
              min={product.minimum_order}
              max={product.stock_quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || product.minimum_order)}
              className="glass-input text-center w-20 py-1 text-sm"
            />
            <span className="text-white/60 text-xs">{product.unit}</span>
          </div>
          
          <button
            onClick={() => onAddToCart(product, quantity)}
            className="glass-button glass-button-primary w-full text-sm"
            disabled={quantity < product.minimum_order || quantity > product.stock_quantity}
          >
            Add to Cart - {formatPrice(quantity * product.price_per_unit, product.currency)}
          </button>
        </div>
      </div>
    </div>
  );
}

// Cart Modal Component
function CartModal({
  cart,
  onClose,
  onRemoveItem,
  onCheckout,
  formatPrice,
  getTotalCartValue
}: {
  cart: CartItem[];
  onClose: () => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  formatPrice: (price: number, currency: string) => string;
  getTotalCartValue: () => number;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
          <button onClick={onClose} className="glass-button">×</button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center text-white/80 py-8">
            <div className="text-4xl mb-4">🛒</div>
            <div>Your cart is empty</div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.product.id} className="glass-agricultural p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.product.name}</h4>
                      <p className="text-white/80 text-sm">{item.product.seller.business_name}</p>
                      <div className="text-white/60 text-sm">
                        {item.quantity} {item.product.unit} × {formatPrice(item.product.price_per_unit, item.product.currency)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {formatPrice(item.total, item.product.currency)}
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-red-400 hover:text-red-300 text-sm mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-lg font-semibold">Total:</span>
                <span className="text-green-primary text-xl font-bold">
                  {formatPrice(getTotalCartValue(), cart[0]?.product.currency || 'KES')}
                </span>
              </div>
              
              <div className="flex gap-3">
                <button onClick={onClose} className="glass-button flex-1">
                  Continue Shopping
                </button>
                <button onClick={onCheckout} className="glass-button glass-button-primary flex-1">
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InputMarketplaceHub;