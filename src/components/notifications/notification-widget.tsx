import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellRing,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  Brain,
  Cloud,
  Wrench,
  DollarSign,
  Users,
  Settings,
  ExternalLink
} from "lucide-react";

interface NotificationWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCenter: () => void;
}

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'weather' | 'ai' | 'equipment' | 'market' | 'cooperative' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

const NotificationWidget = ({ isOpen, onClose, onOpenCenter }: NotificationWidgetProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sample recent notifications (top 5 most recent)
  useEffect(() => {
    const recentNotifications: Notification[] = [
      {
        id: '1',
        type: 'critical',
        category: 'weather',
        title: 'Severe Weather Alert',
        message: 'Heavy rainfall expected in next 6 hours.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        priority: 'high',
        actionRequired: true
      },
      {
        id: '2',
        type: 'warning',
        category: 'ai',
        title: 'Disease Detection',
        message: 'Potential tomato blight detected in Field 5.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        priority: 'high',
        actionRequired: true
      },
      {
        id: '3',
        type: 'info',
        category: 'market',
        title: 'Price Alert',
        message: 'Maize prices up 12% at Nairobi Market.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true,
        priority: 'medium',
        actionRequired: false
      },
      {
        id: '4',
        type: 'success',
        category: 'equipment',
        title: 'Irrigation Activated',
        message: 'Smart irrigation started in Field 8.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isRead: true,
        priority: 'low',
        actionRequired: false
      },
      {
        id: '5',
        type: 'warning',
        category: 'equipment',
        title: 'Maintenance Due',
        message: 'Tractor TK-001 service in 2 days.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isRead: false,
        priority: 'medium',
        actionRequired: true
      }
    ];
    setNotifications(recentNotifications);
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

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => n.type === 'critical' && !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 w-96 max-h-[600px] z-50">
      <div className="glass-card !margin-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BellRing className="w-6 h-6 text-blue-600" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-600">
                {unreadCount} unread{criticalCount > 0 && `, ${criticalCount} critical`}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="glass-button !padding-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Critical Alerts Banner */}
        {criticalCount > 0 && (
          <div className="glass-notification error mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {criticalCount} critical alert{criticalCount > 1 ? 's' : ''} require immediate attention
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            className="glass-button text-xs"
            disabled={unreadCount === 0}
          >
            <Check className="w-3 h-3 mr-1" />
            Mark All Read
          </Button>
          <Button
            onClick={onOpenCenter}
            variant="outline"
            size="sm"
            className="glass-button text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View All
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg bg-white/50 hover:bg-white/70 transition-colors cursor-pointer ${
                  !notification.isRead ? 'border-l-2 border-blue-500' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(notification.timestamp)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Badge className={`glass-badge text-xs ${
                          notification.type === 'critical' ? 'error' : 
                          notification.type === 'warning' ? 'warning' : 
                          notification.type === 'success' ? 'success' : 'info'
                        }`}>
                          {notification.type}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge className="glass-badge warning text-xs">
                            Action
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <Button
                onClick={onOpenCenter}
                variant="outline"
                className="glass-button w-full"
              >
                View All Notifications
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationWidget;