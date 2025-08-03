import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Droplets,
  Sprout,
  Package,
  DollarSign,
  Users,
  Plus,
  Camera,
  Phone,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Edit,
  Save,
  X,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Field {
  id: string;
  name: string;
  crop: string;
  area: number;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  lastWatered: string;
  harvestDate: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  cost: number;
}

interface Sale {
  id: string;
  buyer: string;
  crop: string;
  quantity: number;
  price: number;
  status: 'pending' | 'delivered' | 'paid';
  date: string;
}

const MobileFarmManager = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [currentTab, setCurrentTab] = useState('fields');
  const [showAddField, setShowAddField] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState(3);

  const fields: Field[] = [
    {
      id: '1',
      name: 'Shamba Moja',
      crop: 'Maize',
      area: 2.5,
      health: 'excellent',
      lastWatered: '2 days ago',
      harvestDate: '2024-03-15'
    },
    {
      id: '2',
      name: 'Shamba Mbili',
      crop: 'Beans',
      area: 1.8,
      health: 'good',
      lastWatered: '1 day ago',
      harvestDate: '2024-02-28'
    },
    {
      id: '3',
      name: 'Shamba Tatu',
      crop: 'Tomatoes',
      area: 1.2,
      health: 'fair',
      lastWatered: '4 days ago',
      harvestDate: '2024-04-10'
    }
  ];

  const inventory: InventoryItem[] = [
    { id: '1', name: 'Fertilizer (DAP)', quantity: 25, unit: 'kg', status: 'in_stock', cost: 1250 },
    { id: '2', name: 'Seeds (Maize)', quantity: 5, unit: 'kg', status: 'low_stock', cost: 800 },
    { id: '3', name: 'Pesticide', quantity: 0, unit: 'liters', status: 'out_of_stock', cost: 0 }
  ];

  const sales: Sale[] = [
    { id: '1', buyer: 'Mama Grace', crop: 'Maize', quantity: 100, price: 35, status: 'pending', date: 'Today' },
    { id: '2', buyer: 'Kimani Traders', crop: 'Beans', quantity: 50, price: 80, status: 'delivered', date: 'Yesterday' },
    { id: '3', buyer: 'Local Market', crop: 'Tomatoes', quantity: 30, price: 25, status: 'paid', date: '2 days ago' }
  ];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'success';
      case 'good': return 'success';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      case 'pending': return 'warning';
      case 'delivered': return 'info';
      case 'paid': return 'success';
      default: return 'info';
    }
  };

  const handleQuickAction = (action: string) => {
    // Simulate offline-capable actions
    console.log(`Quick action: ${action}`);
    if (!isOnline) {
      setPendingSyncs(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 pb-20">
      {/* Mobile Header */}
      <div className="glass-card !rounded-b-3xl !rounded-t-none sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">My Farm</h1>
              <p className="text-xs text-gray-600">John Kamau • Kiambu</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${isOnline ? 'bg-green-100' : 'bg-orange-100'}`}>
              {isOnline ? <Wifi className="w-3 h-3 text-green-600" /> : <WifiOff className="w-3 h-3 text-orange-600" />}
              <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* Pending Syncs */}
            {!isOnline && pendingSyncs > 0 && (
              <Badge className="glass-badge warning text-xs">
                {pendingSyncs} pending
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 px-4 pb-4">
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-600">3</p>
            <p className="text-xs text-gray-600">Active Fields</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600">5.5</p>
            <p className="text-xs text-gray-600">Total Acres</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-purple-600">KSh 45K</p>
            <p className="text-xs text-gray-600">This Month</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          {/* Mobile Tab Navigation */}
          <div className="glass-card !padding-2 !margin-0">
            <TabsList className="w-full bg-transparent grid grid-cols-4">
              <TabsTrigger value="fields" className="glass-button text-xs data-[state=active]:bg-white/20">
                <MapPin className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="inventory" className="glass-button text-xs data-[state=active]:bg-white/20">
                <Package className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="sales" className="glass-button text-xs data-[state=active]:bg-white/20">
                <DollarSign className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="group" className="glass-button text-xs data-[state=active]:bg-white/20">
                <Users className="w-3 h-3" />
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Fields Tab */}
          <TabsContent value="fields" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Fields</h2>
              <Button 
                onClick={() => setShowAddField(true)}
                className="glass-button bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </Button>
            </div>

            {fields.map((field) => (
              <div key={field.id} className="glass-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                    <p className="text-sm text-gray-600">{field.crop} • {field.area} acres</p>
                  </div>
                  <Badge className={`glass-badge ${getHealthColor(field.health)}`}>
                    {field.health}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Last Watered</p>
                    <p className="text-sm font-medium">{field.lastWatered}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Harvest Date</p>
                    <p className="text-sm font-medium">{field.harvestDate}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="glass-button text-xs"
                    onClick={() => handleQuickAction('water')}
                  >
                    <Droplets className="w-3 h-3 mr-1" />
                    Water
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="glass-button text-xs"
                    onClick={() => handleQuickAction('photo')}
                  >
                    <Camera className="w-3 h-3 mr-1" />
                    Photo
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="glass-button text-xs"
                    onClick={() => handleQuickAction('notes')}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Notes
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
              <Button 
                className="glass-button bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            {inventory.map((item) => (
              <div key={item.id} className="glass-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit} • KSh {item.cost.toLocaleString()}
                    </p>
                  </div>
                  <Badge className={`glass-badge ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="glass-button text-xs flex-1"
                    onClick={() => handleQuickAction('update_inventory')}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Update
                  </Button>
                  {item.status === 'low_stock' || item.status === 'out_of_stock' ? (
                    <Button 
                      size="sm" 
                      className="glass-button bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 flex-1"
                      onClick={() => handleQuickAction('reorder')}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Reorder
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Sales & Orders</h2>
              <Button 
                className="glass-button bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Sale
              </Button>
            </div>

            {sales.map((sale) => (
              <div key={sale.id} className="glass-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{sale.buyer}</h3>
                    <p className="text-sm text-gray-600">
                      {sale.quantity}kg {sale.crop} @ KSh {sale.price}/kg
                    </p>
                    <p className="text-xs text-gray-500">{sale.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`glass-badge ${getStatusColor(sale.status)} mb-1`}>
                      {sale.status}
                    </Badge>
                    <p className="text-lg font-bold text-green-600">
                      KSh {(sale.quantity * sale.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {sale.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="glass-button text-xs flex-1"
                        onClick={() => handleQuickAction('call_buyer')}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        className="glass-button bg-gradient-to-r from-green-500 to-green-600 text-white border-0 flex-1"
                        onClick={() => handleQuickAction('mark_delivered')}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Delivered
                      </Button>
                    </>
                  )}
                  {sale.status === 'delivered' && (
                    <Button 
                      size="sm" 
                      className="glass-button bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 w-full"
                      onClick={() => handleQuickAction('mark_paid')}
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Cooperative Group Tab */}
          <TabsContent value="group" className="space-y-4">
            <div className="glass-card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Kibera Farmers Group</h3>
                  <p className="text-sm text-gray-600">247 members • Established 2018</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">KSh 15K</p>
                  <p className="text-xs text-gray-600">My Shares</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">KSh 2.3K</p>
                  <p className="text-xs text-gray-600">Monthly Savings</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Group Meeting</p>
                    <p className="text-xs text-blue-600">Tomorrow 2:00 PM at Community Center</p>
                  </div>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Equipment Available</p>
                    <p className="text-xs text-green-600">Tractor available for booking this weekend</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>

            {/* Group Services */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Services</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="glass-button h-16 flex-col"
                  onClick={() => handleQuickAction('book_equipment')}
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Book Equipment</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="glass-button h-16 flex-col"
                  onClick={() => handleQuickAction('bulk_buying')}
                >
                  <DollarSign className="w-5 h-5 mb-1" />
                  <span className="text-xs">Bulk Buying</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="glass-button h-16 flex-col"
                  onClick={() => handleQuickAction('group_chat')}
                >
                  <MessageSquare className="w-5 h-5 mb-1" />
                  <span className="text-xs">Group Chat</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="glass-button h-16 flex-col"
                  onClick={() => handleQuickAction('market_prices')}
                >
                  <TrendingUp className="w-5 h-5 mb-1" />
                  <span className="text-xs">Market Prices</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Emergency Actions */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="glass-button bg-gradient-to-r from-red-500 to-red-600 text-white border-0 h-12"
              onClick={() => handleQuickAction('emergency_call')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Emergency Call
            </Button>
            <Button 
              className="glass-button bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 h-12"
              onClick={() => handleQuickAction('weather_alert')}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Weather Alert
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Sync Button (appears when offline) */}
      {!isOnline && pendingSyncs > 0 && (
        <div className="fixed bottom-24 right-4 z-50">
          <Button 
            className="glass-button bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-full w-16 h-16 shadow-lg"
            onClick={() => {
              setIsOnline(true);
              setPendingSyncs(0);
            }}
          >
            <Smartphone className="w-6 h-6" />
          </Button>
          <Badge className="glass-badge error absolute -top-2 -right-2 text-xs">
            {pendingSyncs}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default MobileFarmManager;