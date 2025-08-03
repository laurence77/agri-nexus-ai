import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertCircle,
  Bell,
  Calendar,
  MapPin,
  DollarSign,
  Activity,
  Target,
  Brain,
  Globe,
  Smartphone,
  MessageSquare
} from "lucide-react";

interface PriceAlert {
  id: string;
  commodity: string;
  targetPrice: number;
  currentPrice: number;
  condition: 'above' | 'below';
  market: string;
  active: boolean;
  notificationMethod: string[];
}

interface MarketData {
  commodity: string;
  markets: Array<{
    name: string;
    currentPrice: number;
    previousPrice: number;
    change: number;
    changePercent: number;
    volume: number;
    lastUpdated: string;
  }>;
  forecast: Array<{
    date: string;
    predictedPrice: number;
    confidence: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    averagePrice: number;
    volatility: number;
  }>;
}

const PriceTracker = () => {
  const [selectedCommodity, setSelectedCommodity] = useState('maize');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    commodity: 'maize',
    targetPrice: '',
    condition: 'above' as 'above' | 'below',
    market: 'nairobi',
    notificationMethod: ['push'] as string[]
  });

  const commodities = [
    { id: 'maize', name: 'Maize', unit: 'kg', icon: '🌽' },
    { id: 'rice', name: 'Rice', unit: 'kg', icon: '🍚' },
    { id: 'beans', name: 'Beans', unit: 'kg', icon: '🫘' },
    { id: 'coffee', name: 'Coffee', unit: 'kg', icon: '☕' },
    { id: 'tea', name: 'Tea', unit: 'kg', icon: '🍃' },
    { id: 'tomatoes', name: 'Tomatoes', unit: 'kg', icon: '🍅' }
  ];

  const markets = [
    { id: 'nairobi', name: 'Nairobi Market', country: 'Kenya' },
    { id: 'mombasa', name: 'Mombasa Market', country: 'Kenya' },
    { id: 'kampala', name: 'Kampala Market', country: 'Uganda' },
    { id: 'dar-es-salaam', name: 'Dar es Salaam Market', country: 'Tanzania' },
    { id: 'lagos', name: 'Lagos Market', country: 'Nigeria' },
    { id: 'accra', name: 'Accra Market', country: 'Ghana' }
  ];

  // Sample market data
  useEffect(() => {
    const sampleData: MarketData = {
      commodity: selectedCommodity,
      markets: [
        {
          name: 'Nairobi Market',
          currentPrice: 65,
          previousPrice: 62,
          change: 3,
          changePercent: 4.8,
          volume: 2500,
          lastUpdated: '2024-02-01 14:30'
        },
        {
          name: 'Mombasa Market',
          currentPrice: 68,
          previousPrice: 65,
          change: 3,
          changePercent: 4.6,
          volume: 1800,
          lastUpdated: '2024-02-01 14:25'
        },
        {
          name: 'Kampala Market',
          currentPrice: 70,
          previousPrice: 72,
          change: -2,
          changePercent: -2.8,
          volume: 1200,
          lastUpdated: '2024-02-01 14:20'
        }
      ],
      forecast: [
        { date: '2024-02-02', predictedPrice: 66, confidence: 0.85 },
        { date: '2024-02-03', predictedPrice: 67, confidence: 0.82 },
        { date: '2024-02-04', predictedPrice: 68, confidence: 0.78 },
        { date: '2024-02-05', predictedPrice: 70, confidence: 0.75 },
        { date: '2024-02-06', predictedPrice: 71, confidence: 0.72 },
        { date: '2024-02-07', predictedPrice: 69, confidence: 0.70 }
      ],
      seasonalTrends: [
        { month: 'Jan', averagePrice: 58, volatility: 0.12 },
        { month: 'Feb', averagePrice: 62, volatility: 0.15 },
        { month: 'Mar', averagePrice: 68, volatility: 0.18 },
        { month: 'Apr', averagePrice: 75, volatility: 0.22 },
        { month: 'May', averagePrice: 72, volatility: 0.20 },
        { month: 'Jun', averagePrice: 65, volatility: 0.16 }
      ]
    };

    setMarketData(sampleData);

    // Sample price alerts
    const sampleAlerts: PriceAlert[] = [
      {
        id: '1',
        commodity: 'maize',
        targetPrice: 70,
        currentPrice: 65,
        condition: 'above',
        market: 'nairobi',
        active: true,
        notificationMethod: ['push', 'sms']
      },
      {
        id: '2',
        commodity: 'coffee',
        targetPrice: 300,
        currentPrice: 320,
        condition: 'below',
        market: 'nyeri',
        active: true,
        notificationMethod: ['push', 'email']
      }
    ];

    setPriceAlerts(sampleAlerts);
  }, [selectedCommodity]);

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  const createAlert = () => {
    if (!newAlert.targetPrice) return;

    const alert: PriceAlert = {
      id: `alert_${Date.now()}`,
      commodity: newAlert.commodity,
      targetPrice: parseFloat(newAlert.targetPrice),
      currentPrice: marketData?.markets[0]?.currentPrice || 0,
      condition: newAlert.condition,
      market: newAlert.market,
      active: true,
      notificationMethod: newAlert.notificationMethod
    };

    setPriceAlerts(prev => [...prev, alert]);
    setShowCreateAlert(false);
    setNewAlert({
      commodity: 'maize',
      targetPrice: '',
      condition: 'above',
      market: 'nairobi',
      notificationMethod: ['push']
    });
  };

  const toggleAlert = (alertId: string) => {
    setPriceAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, active: !alert.active } : alert
      )
    );
  };

  const deleteAlert = (alertId: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="space-y-6">
      {/* Commodity Selector */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Price Tracker</h2>
            <p className="text-sm text-gray-600">Monitor commodity prices across African markets</p>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {commodities.map((commodity) => (
            <button
              key={commodity.id}
              onClick={() => setSelectedCommodity(commodity.id)}
              className={`glass-button p-3 text-center ${
                selectedCommodity === commodity.id ? 'bg-white/30' : ''
              }`}
            >
              <span className="text-lg mb-1 block">{commodity.icon}</span>
              <span className="text-sm font-medium">{commodity.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Market Prices */}
      {marketData && (
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Current {commodities.find(c => c.id === selectedCommodity)?.name} Prices
            </h3>
            <Badge className="glass-badge success">Live Data</Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {marketData.markets.map((market, index) => (
              <div key={index} className="p-4 bg-white/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{market.name}</h4>
                  <div className={`flex items-center space-x-1 ${
                    market.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {market.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="text-xs font-medium">{market.changePercent.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(market.currentPrice)}/kg
                  </p>
                  <p className="text-sm text-gray-600">Volume: {market.volume.toLocaleString()} kg</p>
                  <p className="text-xs text-gray-500">Updated: {new Date(market.lastUpdated).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Price Forecast */}
      {marketData && (
        <div className="glass-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">7-Day AI Price Forecast</h3>
              <p className="text-sm text-gray-600">Machine learning predictions based on market trends</p>
            </div>
          </div>

          <div className="grid md:grid-cols-6 gap-4">
            {marketData.forecast.map((forecast, index) => (
              <div key={index} className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">
                  {new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(forecast.predictedPrice)}
                </p>
                <div className="flex items-center justify-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-purple-500 h-1 rounded-full"
                      style={{ width: `${forecast.confidence * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{(forecast.confidence * 100).toFixed(0)}% confidence</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Alerts */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>
              <p className="text-sm text-gray-600">Get notified when prices hit your targets</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateAlert(true)}
            className="glass-button bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0"
          >
            <Bell className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>

        {priceAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No price alerts set</h4>
            <p className="text-gray-600">Create alerts to monitor price changes for your commodities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {priceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${alert.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {commodities.find(c => c.id === alert.commodity)?.name} {alert.condition} {formatCurrency(alert.targetPrice)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {markets.find(m => m.id === alert.market)?.name} • Current: {formatCurrency(alert.currentPrice)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {alert.notificationMethod.map((method, index) => (
                        <Badge key={index} className="glass-badge info text-xs">
                          {method === 'push' && <Smartphone className="w-3 h-3 mr-1" />}
                          {method === 'sms' && <MessageSquare className="w-3 h-3 mr-1" />}
                          {method === 'email' && <Globe className="w-3 h-3 mr-1" />}
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => toggleAlert(alert.id)}
                    variant="outline"
                    size="sm"
                    className="glass-button"
                  >
                    {alert.active ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    onClick={() => deleteAlert(alert.id)}
                    variant="outline"
                    size="sm"
                    className="glass-button text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Price Alert</h3>
              <Button
                onClick={() => setShowCreateAlert(false)}
                variant="ghost"
                size="sm"
                className="glass-button"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
                <select
                  value={newAlert.commodity}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, commodity: e.target.value }))}
                  className="glass-input w-full"
                >
                  {commodities.map(commodity => (
                    <option key={commodity.id} value={commodity.id}>
                      {commodity.icon} {commodity.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Market</label>
                <select
                  value={newAlert.market}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, market: e.target.value }))}
                  className="glass-input w-full"
                >
                  {markets.map(market => (
                    <option key={market.id} value={market.id}>
                      {market.name}, {market.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as 'above' | 'below' }))}
                    className="glass-input w-full"
                  >
                    <option value="above">Price goes above</option>
                    <option value="below">Price goes below</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Price (KSh)</label>
                  <input
                    type="number"
                    value={newAlert.targetPrice}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                    className="glass-input w-full"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Methods</label>
                <div className="space-y-2">
                  {[
                    { id: 'push', name: 'Push Notification', icon: <Smartphone className="w-4 h-4" /> },
                    { id: 'sms', name: 'SMS', icon: <MessageSquare className="w-4 h-4" /> },
                    { id: 'email', name: 'Email', icon: <Globe className="w-4 h-4" /> }
                  ].map((method) => (
                    <label key={method.id} className="flex items-center space-x-3 p-2 bg-white/50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAlert.notificationMethod.includes(method.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAlert(prev => ({
                              ...prev,
                              notificationMethod: [...prev.notificationMethod, method.id]
                            }));
                          } else {
                            setNewAlert(prev => ({
                              ...prev,
                              notificationMethod: prev.notificationMethod.filter(m => m !== method.id)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-orange-600 rounded"
                      />
                      <div className="flex items-center space-x-2">
                        {method.icon}
                        <span className="text-sm">{method.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={() => setShowCreateAlert(false)}
                  variant="outline"
                  className="glass-button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createAlert}
                  className="glass-button bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0"
                >
                  Create Alert
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceTracker;