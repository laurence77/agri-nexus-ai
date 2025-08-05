import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Package,
  Plus,
  Minus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Truck,
  ShoppingCart,
  BarChart3,
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Leaf,
  Bug,
  Droplets,
  Wrench
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'herbicides' | 'equipment' | 'tools' | 'other';
  description: string;
  sku: string;
  currentStock: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  lastRestocked: Date;
  expiryDate?: Date;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  usage: {
    lastMonth: number;
    thisMonth: number;
    projected: number;
  };
  qualityGrade?: 'A' | 'B' | 'C';
  certifications?: string[];
}

interface Transaction {
  id: string;
  itemId: string;
  type: 'purchase' | 'usage' | 'waste' | 'transfer' | 'return';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  date: Date;
  reference: string;
  supplier?: string;
  recipient?: string;
  notes?: string;
  crop?: string;
  field?: string;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: Date;
  expectedDelivery: Date;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalAmount: number;
  notes?: string;
}

interface InventoryStats {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  expiringSoon: number;
  monthlyUsageCost: number;
  averageStockTurnover: number;
}

export function InputInventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalValue: 0,
    totalItems: 0,
    lowStockItems: 0,
    expiringSoon: 0,
    monthlyUsageCost: 0,
    averageStockTurnover: 0
  });
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showStockAdjustment, setShowStockAdjustment] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: 'seeds',
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    unitCost: 0
  });
  const [adjustment, setAdjustment] = useState({
    type: 'purchase' as Transaction['type'],
    quantity: 0,
    unitCost: 0,
    reference: '',
    notes: ''
  });

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const sampleItems: InventoryItem[] = [
      {
        id: 'inv-001',
        name: 'Hybrid Maize Seeds H614',
        category: 'seeds',
        description: 'High-yield drought-resistant hybrid maize variety',
        sku: 'SEED-H614-25KG',
        currentStock: 150,
        unit: 'kg',
        minStockLevel: 50,
        maxStockLevel: 300,
        unitCost: 15.50,
        totalValue: 2325,
        supplier: 'Kenya Seed Co.',
        lastRestocked: new Date('2024-01-15'),
        location: 'Warehouse A - Section 1',
        status: 'in_stock',
        usage: { lastMonth: 75, thisMonth: 25, projected: 60 },
        qualityGrade: 'A',
        certifications: ['Certified Seeds', 'KEPHIS Approved']
      },
      {
        id: 'inv-002',
        name: 'NPK 17-17-17 Fertilizer',
        category: 'fertilizers',
        description: 'Complete NPK fertilizer for crop nutrition',
        sku: 'FERT-NPK171717-50KG',
        currentStock: 25,
        unit: 'bags (50kg)',
        minStockLevel: 30,
        maxStockLevel: 100,
        unitCost: 45.00,
        totalValue: 1125,
        supplier: 'Yara Kenya Ltd',
        lastRestocked: new Date('2024-01-20'),
        location: 'Warehouse B - Section 2',
        status: 'low_stock',
        usage: { lastMonth: 40, thisMonth: 15, projected: 35 }
      },
      {
        id: 'inv-003',
        name: 'Roundup Glyphosate',
        category: 'herbicides',
        description: 'Systemic herbicide for weed control',
        sku: 'HERB-GLYPHO-5L',
        currentStock: 8,
        unit: 'liters',
        minStockLevel: 10,
        maxStockLevel: 50,
        unitCost: 28.50,
        totalValue: 228,
        supplier: 'Bayer East Africa',
        lastRestocked: new Date('2024-01-10'),
        expiryDate: new Date('2025-12-31'),
        location: 'Chemical Store - A3',
        status: 'low_stock',
        usage: { lastMonth: 12, thisMonth: 4, projected: 8 },
        certifications: ['PCPB Registered']
      },
      {
        id: 'inv-004',
        name: 'Karate Insecticide',
        category: 'pesticides',
        description: 'Broad spectrum insecticide for pest control',
        sku: 'PEST-KARATE-1L',
        currentStock: 2,
        unit: 'liters',
        minStockLevel: 5,
        maxStockLevel: 20,
        unitCost: 35.75,
        totalValue: 71.50,
        supplier: 'Syngenta East Africa',
        lastRestocked: new Date('2024-01-08'),
        expiryDate: new Date('2024-08-15'),
        location: 'Chemical Store - B1',
        status: 'low_stock',
        usage: { lastMonth: 3, thisMonth: 1, projected: 4 },
        certifications: ['PCPB Registered']
      },
      {
        id: 'inv-005',
        name: 'Irrigation Pipes (4 inch)',
        category: 'equipment',
        description: 'PVC irrigation pipes for water distribution',
        sku: 'EQUIP-PIPE-4IN-6M',
        currentStock: 45,
        unit: 'pieces (6m)',
        minStockLevel: 20,
        maxStockLevel: 100,
        unitCost: 12.80,
        totalValue: 576,
        supplier: 'Amiran Kenya',
        lastRestocked: new Date('2024-01-25'),
        location: 'Equipment Yard - Zone C',
        status: 'in_stock',
        usage: { lastMonth: 15, thisMonth: 5, projected: 10 }
      }
    ];

    const sampleTransactions: Transaction[] = [
      {
        id: 'trans-001',
        itemId: 'inv-001',
        type: 'purchase',
        quantity: 100,
        unitCost: 15.50,
        totalCost: 1550,
        date: new Date('2024-01-15'),
        reference: 'PO-2024-001',
        supplier: 'Kenya Seed Co.',
        notes: 'Season opening stock'
      },
      {
        id: 'trans-002',
        itemId: 'inv-001',
        type: 'usage',
        quantity: -25,
        date: new Date('2024-02-01'),
        reference: 'FIELD-A-MAIZE',
        crop: 'Maize',
        field: 'Field A',
        notes: 'Planting Field A - 2.5 hectares'
      },
      {
        id: 'trans-003',
        itemId: 'inv-002',
        type: 'usage',
        quantity: -15,
        date: new Date('2024-02-05'),
        reference: 'FIELD-A-FERT',
        crop: 'Maize',
        field: 'Field A',
        notes: 'Base fertilizer application'
      }
    ];

    const samplePOs: PurchaseOrder[] = [
      {
        id: 'po-001',
        supplier: 'Yara Kenya Ltd',
        orderDate: new Date('2024-02-10'),
        expectedDelivery: new Date('2024-02-15'),
        status: 'confirmed',
        items: [
          {
            itemId: 'inv-002',
            itemName: 'NPK 17-17-17 Fertilizer',
            quantity: 50,
            unitCost: 45.00,
            totalCost: 2250
          }
        ],
        totalAmount: 2250,
        notes: 'Urgent restocking for season'
      }
    ];

    setInventory(sampleItems);
    setTransactions(sampleTransactions);
    setPurchaseOrders(samplePOs);
    calculateStats(sampleItems, sampleTransactions);
  };

  const calculateStats = (items: InventoryItem[], transactions: Transaction[]) => {
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length;
    const expiringSoon = items.filter(item => 
      item.expiryDate && 
      (item.expiryDate.getTime() - Date.now()) < (90 * 24 * 60 * 60 * 1000)
    ).length;
    
    const monthlyUsageCost = items.reduce((sum, item) => 
      sum + (item.usage.thisMonth * item.unitCost), 0
    );

    setStats({
      totalValue,
      totalItems,
      lowStockItems,
      expiringSoon,
      monthlyUsageCost,
      averageStockTurnover: 4.2
    });
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seeds': return <Leaf className="h-4 w-4" />;
      case 'fertilizers': return <Zap className="h-4 w-4" />;
      case 'pesticides': return <Bug className="h-4 w-4" />;
      case 'herbicides': return <Droplets className="h-4 w-4" />;
      case 'equipment': return <Wrench className="h-4 w-4" />;
      case 'tools': return <Wrench className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const addNewItem = () => {
    if (newItem.name && newItem.category && newItem.currentStock !== undefined) {
      const item: InventoryItem = {
        id: `inv-${Date.now()}`,
        name: newItem.name!,
        category: newItem.category!,
        description: newItem.description || '',
        sku: newItem.sku || `${newItem.category?.toUpperCase()}-${Date.now()}`,
        currentStock: newItem.currentStock!,
        unit: newItem.unit || 'units',
        minStockLevel: newItem.minStockLevel || 0,
        maxStockLevel: newItem.maxStockLevel || 100,
        unitCost: newItem.unitCost || 0,
        totalValue: (newItem.currentStock || 0) * (newItem.unitCost || 0),
        supplier: newItem.supplier || '',
        lastRestocked: new Date(),
        location: newItem.location || '',
        status: (newItem.currentStock || 0) <= (newItem.minStockLevel || 0) ? 'low_stock' : 'in_stock',
        usage: { lastMonth: 0, thisMonth: 0, projected: 0 }
      };

      setInventory(prev => [...prev, item]);
      setShowAddItem(false);
      setNewItem({ category: 'seeds', currentStock: 0, minStockLevel: 0, maxStockLevel: 0, unitCost: 0 });
    }
  };

  const adjustStock = () => {
    if (selectedItem && adjustment.quantity !== 0) {
      const transaction: Transaction = {
        id: `trans-${Date.now()}`,
        itemId: selectedItem.id,
        type: adjustment.type,
        quantity: adjustment.type === 'usage' || adjustment.type === 'waste' ? -Math.abs(adjustment.quantity) : Math.abs(adjustment.quantity),
        unitCost: adjustment.unitCost || selectedItem.unitCost,
        totalCost: Math.abs(adjustment.quantity) * (adjustment.unitCost || selectedItem.unitCost),
        date: new Date(),
        reference: adjustment.reference,
        notes: adjustment.notes
      };

      const newStock = selectedItem.currentStock + transaction.quantity;
      const updatedItem = {
        ...selectedItem,
        currentStock: Math.max(0, newStock),
        totalValue: Math.max(0, newStock) * selectedItem.unitCost,
        status: newStock <= selectedItem.minStockLevel ? 'low_stock' as const : 
                newStock === 0 ? 'out_of_stock' as const : 'in_stock' as const,
        lastRestocked: adjustment.type === 'purchase' ? new Date() : selectedItem.lastRestocked
      };

      setInventory(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item));
      setTransactions(prev => [...prev, transaction]);
      setSelectedItem(updatedItem);
      setShowStockAdjustment(false);
      setAdjustment({ type: 'purchase', quantity: 0, unitCost: 0, reference: '', notes: '' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Input Inventory Management</h1>
        <p className="text-gray-600">Track and manage agricultural inputs, costs, and stock levels</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-xl font-bold">${stats.totalValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-xl font-bold">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-xl font-bold">{stats.lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-xl font-bold">{stats.expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Monthly Usage</p>
                <p className="text-xl font-bold">${stats.monthlyUsageCost.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Turnover</p>
                <p className="text-xl font-bold">{stats.averageStockTurnover}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Inventory Management</CardTitle>
                  <p className="text-gray-600">Manage stock levels and track inventory</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowAddItem(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search items, SKU, or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                  aria-label="Filter by category"
                  title="Filter by category"
                >
                  <option value="all">All Categories</option>
                  <option value="seeds">Seeds</option>
                  <option value="fertilizers">Fertilizers</option>
                  <option value="pesticides">Pesticides</option>
                  <option value="herbicides">Herbicides</option>
                  <option value="equipment">Equipment</option>
                  <option value="tools">Tools</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Inventory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <div>
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <p className="text-sm text-gray-600">{item.sku}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current Stock</p>
                            <p className="font-medium">{item.currentStock} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Unit Cost</p>
                            <p className="font-medium">${item.unitCost}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Value</p>
                            <p className="font-medium text-green-600">${item.totalValue.toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Location</p>
                            <p className="font-medium">{item.location}</p>
                          </div>
                        </div>

                        {/* Stock Level Indicator */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Stock Level</span>
                            <span>{((item.currentStock / item.maxStockLevel) * 100).toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={(item.currentStock / item.maxStockLevel) * 100} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Min: {item.minStockLevel}</span>
                            <span>Max: {item.maxStockLevel}</span>
                          </div>
                        </div>

                        {/* Expiry Warning */}
                        {item.expiryDate && (
                          <div className="text-xs">
                            <p className="text-gray-600">
                              Expires: {item.expiryDate.toLocaleDateString()}
                              {(item.expiryDate.getTime() - Date.now()) < (90 * 24 * 60 * 60 * 1000) && (
                                <Badge variant="outline" className="ml-2 text-xs bg-yellow-50 text-yellow-700">
                                  Expiring Soon
                                </Badge>
                              )}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowStockAdjustment(true);
                            }}
                          >
                            Adjust Stock
                          </Button>
                          <Button size="sm" className="flex-1">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <p className="text-gray-600">View all inventory movements and transactions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => {
                  const item = inventory.find(i => i.id === transaction.itemId);
                  return (
                    <div key={transaction.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'purchase' ? 'bg-green-100' :
                            transaction.type === 'usage' ? 'bg-blue-100' :
                            transaction.type === 'waste' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            {transaction.type === 'purchase' ? <Plus className="h-4 w-4" /> :
                             transaction.type === 'usage' ? <Minus className="h-4 w-4" /> :
                             <XCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{item?.name}</h3>
                            <p className="text-sm text-gray-600">{transaction.reference}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {item?.unit}
                          </p>
                          {transaction.totalCost && (
                            <p className="text-sm text-gray-600">${transaction.totalCost.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>Date: {transaction.date.toLocaleDateString()}</div>
                        {transaction.supplier && <div>Supplier: {transaction.supplier}</div>}
                        {transaction.crop && <div>Crop: {transaction.crop}</div>}
                      </div>
                      {transaction.notes && (
                        <p className="text-sm text-gray-600 mt-2">{transaction.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Purchase Orders</CardTitle>
                  <p className="text-gray-600">Manage purchase orders and deliveries</p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseOrders.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">PO #{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.supplier}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {order.status}
                        </Badge>
                        <p className="text-lg font-bold mt-1">${order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>Order Date: {order.orderDate.toLocaleDateString()}</div>
                      <div>Expected: {order.expectedDelivery.toLocaleDateString()}</div>
                      <div>Items: {order.items.length}</div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{item.itemName}</span>
                          <span>{item.quantity} units × ${item.unitCost} = ${item.totalCost}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-sm text-gray-600 mt-4 p-2 bg-gray-50 rounded">{order.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Stock Turnover Rate</span>
                    <span className="font-bold text-blue-600">{stats.averageStockTurnover}x/year</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Days on Hand</span>
                    <span className="font-bold text-green-600">{Math.round(365 / stats.averageStockTurnover)} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Inventory Accuracy</span>
                    <span className="font-bold text-purple-600">97.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Carrying Cost</span>
                    <span className="font-bold text-orange-600">12% of inventory value</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  Usage trend charts coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., Hybrid Maize Seeds"
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as InventoryItem['category'] })}
                aria-label="Select item category"
                title="Select item category"
              >
                <option value="seeds">Seeds</option>
                <option value="fertilizers">Fertilizers</option>
                <option value="pesticides">Pesticides</option>
                <option value="herbicides">Herbicides</option>
                <option value="equipment">Equipment</option>
                <option value="tools">Tools</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                value={newItem.sku || ''}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Input
                value={newItem.unit || ''}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                placeholder="kg, liters, pieces"
              />
            </div>
            <div>
              <Label>Current Stock</Label>
              <Input
                type="number"
                value={newItem.currentStock}
                onChange={(e) => setNewItem({ ...newItem, currentStock: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Unit Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={newItem.unitCost}
                onChange={(e) => setNewItem({ ...newItem, unitCost: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Minimum Stock Level</Label>
              <Input
                type="number"
                value={newItem.minStockLevel}
                onChange={(e) => setNewItem({ ...newItem, minStockLevel: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Maximum Stock Level</Label>
              <Input
                type="number"
                value={newItem.maxStockLevel}
                onChange={(e) => setNewItem({ ...newItem, maxStockLevel: parseFloat(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Supplier</Label>
              <Input
                value={newItem.supplier || ''}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Location</Label>
              <Input
                value={newItem.location || ''}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                placeholder="Storage location"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Item description"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={addNewItem}>Add Item</Button>
            <Button variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockAdjustment} onOpenChange={setShowStockAdjustment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Transaction Type</Label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={adjustment.type}
                onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value as Transaction['type'] })}
                aria-label="Select transaction type"
                title="Select transaction type"
              >
                <option value="purchase">Purchase (Add Stock)</option>
                <option value="usage">Usage (Remove Stock)</option>
                <option value="waste">Waste/Loss (Remove Stock)</option>
                <option value="transfer">Transfer</option>
                <option value="return">Return</option>
              </select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={adjustment.quantity}
                onChange={(e) => setAdjustment({ ...adjustment, quantity: parseFloat(e.target.value) })}
                placeholder="Enter quantity"
              />
            </div>
            {adjustment.type === 'purchase' && (
              <div>
                <Label>Unit Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={adjustment.unitCost}
                  onChange={(e) => setAdjustment({ ...adjustment, unitCost: parseFloat(e.target.value) })}
                  placeholder="Cost per unit"
                />
              </div>
            )}
            <div>
              <Label>Reference</Label>
              <Input
                value={adjustment.reference}
                onChange={(e) => setAdjustment({ ...adjustment, reference: e.target.value })}
                placeholder="PO number, field reference, etc."
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={adjustment.notes}
                onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={adjustStock}>Apply Adjustment</Button>
            <Button variant="outline" onClick={() => setShowStockAdjustment(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InputInventoryManager;