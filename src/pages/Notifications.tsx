import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from '@/components/notifications/notification-center';
import { useNotifications } from '@/hooks/useNotifications';
import { logger } from '@/lib/logger';
import {
  Bell,
  BellRing,
  Settings,
  Plus,
  TestTube,
  Zap,
  Brain,
  Cloud,
  Wrench,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Smartphone,
  MessageSquare,
  Phone,
  Mail
} from "lucide-react";

const Notifications = () => {
  const {
    addNotification,
    getCounts,
    preferences,
    requestPermission
  } = useNotifications();

  const [showTestNotifications, setShowTestNotifications] = useState(false);
  const counts = getCounts();

  // Test notification samples
  const testNotifications = [
    {
      type: 'critical' as const,
      category: 'weather' as const,
      title: 'Severe Storm Warning',
      message: 'Category 3 storm approaching in 4 hours. Secure all equipment and livestock immediately.',
      priority: 'high' as const,
      actionRequired: true
    },
    {
      type: 'warning' as const,
      category: 'ai' as const,
      title: 'Crop Disease Detected',
      message: 'AI analysis indicates 85% probability of early blight in tomato Field 7. Immediate treatment recommended.',
      priority: 'high' as const,
      actionRequired: true
    },
    {
      type: 'info' as const,
      category: 'market' as const,
      title: 'Price Alert: Coffee',
      message: 'Coffee prices increased 8% at Mombasa market. Current rate: KSh 180/kg. Consider selling stored inventory.',
      priority: 'medium' as const,
      actionRequired: false
    },
    {
      type: 'success' as const,
      category: 'equipment' as const,
      title: 'Irrigation Complete',
      message: 'Automated irrigation cycle completed successfully in Fields 3, 5, and 8. Water usage: 2,450 liters.',
      priority: 'low' as const,
      actionRequired: false
    },
    {
      type: 'warning' as const,
      category: 'equipment' as const,
      title: 'Equipment Maintenance Alert',
      message: 'Tractor TK-002 has completed 240 hours since last service. Schedule maintenance within 7 days.',
      priority: 'medium' as const,
      actionRequired: true
    },
    {
      type: 'info' as const,
      category: 'cooperative' as const,
      title: 'Group Meeting Scheduled',
      message: 'Quarterly cooperative meeting on March 15 at 3 PM. Topic: New fertilizer procurement program.',
      priority: 'medium' as const,
      actionRequired: false
    }
  ];

  const sendTestNotification = (notification: any) => {
    const id = addNotification(notification);
    if (id) {
      logger.info('Test notification sent', { title: notification.title }, 'Notifications');
    }
  };

  const enableBrowserNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      addNotification({
        type: 'success',
        category: 'system',
        title: 'Browser Notifications Enabled',
        message: 'You will now receive real-time notifications in your browser.',
        priority: 'low',
        actionRequired: false
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float animate-delay-2s" />
      </div>

      <div className="pt-32 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                {counts.unread > 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{counts.unread}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Notification Center</h1>
                <p className="text-gray-600">
                  Manage your farm alerts and communication preferences
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{counts.unread}</div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{counts.critical}</div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{counts.actionRequired}</div>
                <div className="text-sm text-gray-600">Action Required</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{counts.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Browser Notifications</h3>
              <p className="text-sm text-gray-600 mb-4">Enable real-time alerts in your browser</p>
              <Button 
                onClick={enableBrowserNotifications}
                className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
              >
                Enable
              </Button>
            </div>

            <div className="glass-card text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">SMS Alerts</h3>
              <p className="text-sm text-gray-600 mb-4">
                {preferences.channels.sms ? 'Active' : 'Configure SMS notifications'}
              </p>
              <Badge className={`glass-badge ${preferences.channels.sms ? 'success' : 'info'}`}>
                {preferences.channels.sms ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <div className="glass-card text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">USSD Support</h3>
              <p className="text-sm text-gray-600 mb-4">
                {preferences.channels.ussd ? 'Feature phone ready' : 'Enable USSD notifications'}
              </p>
              <Badge className={`glass-badge ${preferences.channels.ussd ? 'success' : 'info'}`}>
                {preferences.channels.ussd ? 'Ready' : 'Available'}
              </Badge>
            </div>

            <div className="glass-card text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Reports</h3>
              <p className="text-sm text-gray-600 mb-4">
                {preferences.channels.email ? 'Weekly summaries enabled' : 'Setup email notifications'}
              </p>
              <Badge className={`glass-badge ${preferences.channels.email ? 'success' : 'info'}`}>
                {preferences.channels.email ? 'Active' : 'Setup'}
              </Badge>
            </div>
          </div>

          {/* Test Notifications Section */}
          <div className="glass-card mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Test Notifications</h3>
                  <p className="text-sm text-gray-600">Try different notification types to test your settings</p>
                </div>
              </div>
              <Button
                onClick={() => setShowTestNotifications(!showTestNotifications)}
                variant="outline"
                className="glass-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showTestNotifications ? 'Hide Tests' : 'Show Tests'}
              </Button>
            </div>

            {showTestNotifications && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testNotifications.map((notification, index) => (
                  <div key={index} className="p-4 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                        notification.type === 'critical' ? 'bg-red-500' :
                        notification.type === 'warning' ? 'bg-orange-500' :
                        notification.type === 'success' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}>
                        {notification.type === 'critical' ? <XCircle className="w-4 h-4" /> :
                         notification.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                         notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                         <Info className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <Badge className={`glass-badge text-xs ${
                          notification.type === 'critical' ? 'error' :
                          notification.type === 'warning' ? 'warning' :
                          notification.type === 'success' ? 'success' : 'info'
                        }`}>
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{notification.message}</p>
                    <Button
                      onClick={() => sendTestNotification(notification)}
                      size="sm"
                      className="glass-button w-full"
                    >
                      <Zap className="w-3 h-3 mr-2" />
                      Send Test
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification Categories Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { 
                category: 'weather', 
                icon: <Cloud className="w-6 h-6" />, 
                title: 'Weather Alerts', 
                enabled: preferences.categories.weather,
                description: 'Storm warnings, rainfall predictions, temperature alerts'
              },
              { 
                category: 'ai', 
                icon: <Brain className="w-6 h-6" />, 
                title: 'AI Insights', 
                enabled: preferences.categories.ai,
                description: 'Disease detection, yield predictions, optimization tips'
              },
              { 
                category: 'equipment', 
                icon: <Wrench className="w-6 h-6" />, 
                title: 'Equipment Status', 
                enabled: preferences.categories.equipment,
                description: 'Maintenance schedules, system status, repair alerts'
              },
              { 
                category: 'market', 
                icon: <DollarSign className="w-6 h-6" />, 
                title: 'Market Updates', 
                enabled: preferences.categories.market,
                description: 'Price changes, demand forecasts, trading opportunities'
              },
              { 
                category: 'cooperative', 
                icon: <Users className="w-6 h-6" />, 
                title: 'Cooperative News', 
                enabled: preferences.categories.cooperative,
                description: 'Group meetings, shared resources, community events'
              },
              { 
                category: 'system', 
                icon: <Settings className="w-6 h-6" />, 
                title: 'System Updates', 
                enabled: preferences.categories.system,
                description: 'Platform updates, security alerts, maintenance notices'
              }
            ].map((item, index) => (
              <div key={index} className="glass-card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                    item.enabled ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-400'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <Badge className={`glass-badge ${item.enabled ? 'success' : 'info'}`}>
                      {item.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Main Notification Center */}
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
};

export default Notifications;