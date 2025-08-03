import { useState, useEffect, useCallback } from 'react';

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

const defaultPreferences: NotificationPreferences = {
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
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('agri-nexus-notification-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse notification preferences:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save preferences to localStorage
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem('agri-nexus-notification-preferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Generate unique notification ID
  const generateId = useCallback(() => {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Check if notifications are allowed during quiet hours
  const isQuietTime = useCallback(() => {
    if (!preferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(preferences.quietHours.start.replace(':', ''));
    const endTime = parseInt(preferences.quietHours.end.replace(':', ''));
    
    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [preferences.quietHours]);

  // Add new notification
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'isArchived'>) => {
    // Check if notifications are enabled and category is allowed
    if (!preferences.enabled || !preferences.categories[notificationData.category]) {
      return null;
    }

    // Don't show non-critical notifications during quiet hours
    if (notificationData.type !== 'critical' && isQuietTime()) {
      return null;
    }

    const notification: Notification = {
      ...notificationData,
      id: generateId(),
      timestamp: new Date(),
      isRead: false,
      isArchived: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Trigger different notification channels based on preferences
    if (preferences.channels.push && 'Notification' in window) {
      // Browser push notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id
        });
      }
    }

    // Simulate SMS/USSD for demo (would integrate with actual SMS service)
    if (preferences.channels.sms && notification.type === 'critical') {
      console.log(`SMS would be sent: ${notification.title} - ${notification.message}`);
    }

    if (preferences.channels.ussd && notification.actionRequired) {
      console.log(`USSD notification: *123*${notification.id}# to view details`);
    }

    return notification.id;
  }, [preferences, isQuietTime, generateId]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  }, []);

  // Archive notification
  const archiveNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isArchived: true } : notif
      )
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get filtered notifications
  const getNotifications = useCallback((filters?: {
    category?: string;
    type?: string;
    isRead?: boolean;
    isArchived?: boolean;
  }) => {
    if (!filters) return notifications;

    return notifications.filter(notif => {
      if (filters.category && notif.category !== filters.category) return false;
      if (filters.type && notif.type !== filters.type) return false;
      if (filters.isRead !== undefined && notif.isRead !== filters.isRead) return false;
      if (filters.isArchived !== undefined && notif.isArchived !== filters.isArchived) return false;
      return true;
    });
  }, [notifications]);

  // Get notification counts
  const getCounts = useCallback(() => {
    const unread = notifications.filter(n => !n.isRead && !n.isArchived).length;
    const critical = notifications.filter(n => n.type === 'critical' && !n.isRead && !n.isArchived).length;
    const actionRequired = notifications.filter(n => n.actionRequired && !n.isRead && !n.isArchived).length;
    
    return { unread, critical, actionRequired, total: notifications.length };
  }, [notifications]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Simulate real-time notifications (for demo purposes)
  useEffect(() => {
    if (isLoading) return;

    const simulateNotifications = () => {
      const sampleNotifications = [
        {
          type: 'info' as const,
          category: 'weather' as const,
          title: 'Weather Update',
          message: 'Favorable conditions for planting detected.',
          priority: 'medium' as const,
          actionRequired: false
        },
        {
          type: 'warning' as const,
          category: 'ai' as const,
          title: 'AI Alert',
          message: 'Unusual growth pattern detected in Field 12.',
          priority: 'high' as const,
          actionRequired: true
        },
        {
          type: 'info' as const,
          category: 'market' as const,
          title: 'Market Update',
          message: 'Coffee prices stable at regional markets.',
          priority: 'low' as const,
          actionRequired: false
        }
      ];

      // Add a random notification every 30 seconds for demo
      const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
      addNotification(randomNotification);
    };

    // Simulate notifications every 30 seconds for demo
    const interval = setInterval(simulateNotifications, 30000);
    return () => clearInterval(interval);
  }, [isLoading, addNotification]);

  return {
    notifications,
    preferences,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll,
    getNotifications,
    getCounts,
    updatePreferences,
    requestPermission,
    isQuietTime
  };
};