import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellRing,
  BellOff,
  X,
  Check,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Settings,
  Filter,
  Search,
  Download,
  Trash2,
  Smartphone,
  MessageSquare,
  Phone,
  Mail,
  Brain,
  Cloud,
  TrendingUp,
  Wrench,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Droplets,
  Sun,
  Thermometer
} from "lucide-react";

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'weather' | 'ai' | 'equipment' | 'market' | 'cooperative' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isArchived: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  data?: any;
}

interface NotificationPreferences {
  enabled: boolean;
  channels: {
    push: boolean;
    sms: boolean;
    email: boolean;
    ussd: boolean;
  };
  categories: {
    weather: boolean;
    ai: boolean;
    equipment: boolean;
    market: boolean;
    cooperative: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    channels: {
      push: true,
      sms: true,
      email: false,
      ussd: false
    },
    categories: {
      weather: true,
      ai: true,
      equipment: true,
      market: true,
      cooperative: false,
      system: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '06:00'
    }
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Sample notifications
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'critical',
        category: 'weather',
        title: 'Severe Weather Alert',
        message: 'Heavy rainfall expected in next 6 hours. Consider protecting crops in Fields 3, 7, and 12.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        isArchived: false,
        priority: 'high',
        actionRequired: true,
        data: { fields: ['3', '7', '12'], severity: 'high' }
      },
      {
        id: '2',
        type: 'warning',
        category: 'ai',
        title: 'Disease Detection Alert',
        message: 'AI detected potential tomato blight in Field 5. Immediate inspection recommended.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        isArchived: false,
        priority: 'high',
        actionRequired: true,
        data: { field: '5', crop: 'tomatoes', disease: 'blight', confidence: 0.87 }
      },
      {
        id: '3',
        type: 'info',
        category: 'market',
        title: 'Price Alert: Maize',
        message: 'Maize prices increased by 12% at Nairobi Market. Current price: KSh 65/kg.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true,
        isArchived: false,
        priority: 'medium',
        actionRequired: false,
        data: { commodity: 'maize', price: 65, change: 12, market: 'Nairobi' }
      },
      {
        id: '4',
        type: 'success',
        category: 'equipment',
        title: 'Irrigation System Activated',
        message: 'Smart irrigation system automatically activated for Field 8 based on soil moisture readings.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isRead: true,
        isArchived: false,
        priority: 'low',
        actionRequired: false,
        data: { field: '8', system: 'irrigation', trigger: 'soil_moisture' }
      },
      {
        id: '5',
        type: 'warning',
        category: 'equipment',
        title: 'Equipment Maintenance Due',
        message: 'Tractor TK-001 requires scheduled maintenance. Next service in 2 days.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isRead: false,
        isArchived: false,
        priority: 'medium',
        actionRequired: true,
        data: { equipment: 'TK-001', type: 'tractor', daysUntilService: 2 }
      },
      {
        id: '6',
        type: 'info',
        category: 'cooperative',
        title: 'Group Meeting Reminder',
        message: 'Monthly cooperative meeting scheduled for tomorrow at 2 PM. Agenda: seed procurement.',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
        isRead: true,
        isArchived: false,
        priority: 'medium',
        actionRequired: false,
        data: { meeting: 'monthly', time: '14:00', agenda: 'seed procurement' }
      }
    ];
    setNotifications(sampleNotifications);
  }, []);

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'weather': return <Cloud className="w-4 h-4" />;
      case 'ai': return <Brain className="w-4 h-4" />;
      case 'equipment': return <Wrench className="w-4 h-4" />;
      case 'market': return <DollarSign className="w-4 h-4" />;
      case 'cooperative': return <Users className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'info': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isArchived: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (notif.isArchived && activeTab !== 'archived') return false;
    if (!notif.isArchived && activeTab === 'archived') return false;
    if (activeTab !== 'all' && activeTab !== 'archived' && notif.category !== activeTab) return false;
    if (searchQuery && !notif.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notif.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const criticalCount = notifications.filter(n => n.type === 'critical' && !n.isRead && !n.isArchived).length;

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderNotificationSettings = () => (
    <div className="glass-card max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-600">Customize how you receive alerts</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowSettings(false)}
          variant="outline"
          className="glass-button"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Global Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Enable Notifications</h3>
            <p className="text-sm text-gray-600">Master toggle for all notifications</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={(e) => setPreferences(prev => ({ ...prev, enabled: e.target.checked }))}
            className="h-4 w-4 text-blue-600 rounded"
          />
        </div>

        {/* Delivery Channels */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Delivery Methods</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { key: 'push', label: 'Push Notifications', icon: <Smartphone className="w-4 h-4" />, desc: 'Mobile app alerts' },
              { key: 'sms', label: 'SMS Messages', icon: <MessageSquare className="w-4 h-4" />, desc: 'Text messages' },
              { key: 'email', label: 'Email Alerts', icon: <Mail className="w-4 h-4" />, desc: 'Email notifications' },
              { key: 'ussd', label: 'USSD Codes', icon: <Phone className="w-4 h-4" />, desc: 'Feature phone compatible' }
            ].map((channel) => (
              <label key={channel.key} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels[channel.key as keyof typeof preferences.channels]}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    channels: { ...prev.channels, [channel.key]: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  {channel.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{channel.label}</p>
                  <p className="text-xs text-gray-600">{channel.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Notification Categories</h3>
          <div className="space-y-3">
            {[
              { key: 'weather', label: 'Weather Alerts', icon: <Cloud className="w-4 h-4" />, desc: 'Forecasts and warnings' },
              { key: 'ai', label: 'AI Recommendations', icon: <Brain className="w-4 h-4" />, desc: 'Smart insights and predictions' },
              { key: 'equipment', label: 'Equipment Status', icon: <Wrench className="w-4 h-4" />, desc: 'Maintenance and alerts' },
              { key: 'market', label: 'Market Updates', icon: <DollarSign className="w-4 h-4" />, desc: 'Price changes and trends' },
              { key: 'cooperative', label: 'Cooperative News', icon: <Users className="w-4 h-4" />, desc: 'Group activities and meetings' },
              { key: 'system', label: 'System Notifications', icon: <Settings className="w-4 h-4" />, desc: 'Platform updates' }
            ].map((category) => (
              <label key={category.key} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.categories[category.key as keyof typeof preferences.categories]}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    categories: { ...prev.categories, [category.key]: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{category.label}</p>
                  <p className="text-xs text-gray-600">{category.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Quiet Hours</h3>
            <input
              type="checkbox"
              checked={preferences.quietHours.enabled}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                quietHours: { ...prev.quietHours, enabled: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, start: e.target.value }
                  }))}
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, end: e.target.value }
                  }))}
                  className="glass-input w-full"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button 
            onClick={() => setShowSettings(false)}
            variant="outline"
            className="glass-button"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              // Save preferences logic here
              setShowSettings(false);
            }}
            className="glass-button bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );

  if (showSettings) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50" />
        </div>
        <div className="pt-32 px-4">
          {renderNotificationSettings()}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{unreadCount}</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
            <p className="text-sm text-gray-600">
              {unreadCount} unread, {criticalCount} critical alerts
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="glass-button"
            disabled={unreadCount === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button
            onClick={() => setShowSettings(true)}
            variant="outline"
            className="glass-button"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-10 w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="glass-button">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="glass-button">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="glass-card !padding-2 !margin-0">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger value="all" className="glass-button data-[state=active]:bg-white/20">
              <Bell className="w-4 h-4 mr-2" />
              All ({notifications.filter(n => !n.isArchived).length})
            </TabsTrigger>
            <TabsTrigger value="weather" className="glass-button data-[state=active]:bg-white/20">
              <Cloud className="w-4 h-4 mr-2" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="ai" className="glass-button data-[state=active]:bg-white/20">
              <Brain className="w-4 h-4 mr-2" />
              AI Alerts
            </TabsTrigger>
            <TabsTrigger value="equipment" className="glass-button data-[state=active]:bg-white/20">
              <Wrench className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="archived" className="glass-button data-[state=active]:bg-white/20">
              <Clock className="w-4 h-4 mr-2" />
              Archived
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`glass-card hover:scale-[1.01] transition-all cursor-pointer ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <Badge className={`glass-badge ${notification.type === 'critical' ? 'error' : notification.type === 'warning' ? 'warning' : notification.type === 'success' ? 'success' : 'info'}`}>
                          {notification.type}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge className="glass-badge warning">Action Required</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatRelativeTime(notification.timestamp)}</span>
                        <span className="capitalize">{notification.category}</span>
                        <span className="capitalize">{notification.priority} priority</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveNotification(notification.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="glass-button !padding-2"
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="glass-button !padding-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;