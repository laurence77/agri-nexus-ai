import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  UserGroupIcon,
  GiftIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { RewardsNotification } from '@/types/rewards';

interface RewardsNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: RewardsNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export default function RewardsNotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}: RewardsNotificationCenterProps) {
  const [localNotifications, setLocalNotifications] = useState<RewardsNotification[]>([]);

  useEffect(() => {
    // Mock notifications for demonstration
    const mockNotifications: RewardsNotification[] = [
      {
        id: '1',
        user_id: 'user_1',
        tenant_id: 'tenant_1',
        notification_type: 'points_earned',
        title: 'Points Earned!',
        message: 'You earned 15 points for Daily Login (1.25x streak bonus!)',
        points_amount: 15,
        is_read: false,
        created_at: new Date().toISOString(),
        metadata: { action_name: 'Daily Login', streak_bonus: true }
      },
      {
        id: '2',
        user_id: 'user_1',
        tenant_id: 'tenant_1',
        notification_type: 'streak_milestone',
        title: '7 Day Streak!',
        message: 'Amazing! You\'ve maintained a 7-day login streak!',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        metadata: { streak_type: 'login', streak_count: 7, multiplier: 1.25 }
      },
      {
        id: '3',
        user_id: 'user_1',
        tenant_id: 'tenant_1',
        notification_type: 'level_up',
        title: 'Level Up!',
        message: 'Congratulations! You\'ve reached Experienced Farmer (Level 3)',
        is_read: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        metadata: { old_level: 2, new_level: 3, level_name: 'Experienced Farmer' }
      },
      {
        id: '4',
        user_id: 'user_1',
        tenant_id: 'tenant_1',
        notification_type: 'achievement_unlocked',
        title: 'Achievement Unlocked!',
        message: 'You\'ve unlocked the "Data Enthusiast" achievement for consistent data entry!',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        metadata: { achievement_name: 'Data Enthusiast', achievement_points: 100 }
      },
      {
        id: '5',
        user_id: 'user_1',
        tenant_id: 'tenant_1',
        notification_type: 'referral_success',
        title: 'Referral Successful!',
        message: 'You earned 500 points for successfully referring a new farmer!',
        points_amount: 500,
        is_read: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        metadata: { referral_name: 'John Smith' }
      },
      {
        id: '6',
        user_id: 'user_1',
        tenant_id: 'tenant_1',
        notification_type: 'reward_available',
        title: 'New Rewards Available!',
        message: 'Check out the new rewards in the redemption store!',
        is_read: true,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        metadata: { new_items_count: 3 }
      }
    ];

    setLocalNotifications(mockNotifications);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'points_earned':
        return <GiftIcon className="w-6 h-6 text-green-600" />;
      case 'level_up':
        return <ArrowUpIcon className="w-6 h-6 text-blue-600" />;
      case 'streak_milestone':
        return <FireIcon className="w-6 h-6 text-orange-600" />;
      case 'achievement_unlocked':
        return <StarIcon className="w-6 h-6 text-yellow-600" />;
      case 'referral_success':
        return <UserGroupIcon className="w-6 h-6 text-pink-600" />;
      case 'reward_available':
        return <TrophyIcon className="w-6 h-6 text-purple-600" />;
      default:
        return <BellIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    
    switch (type) {
      case 'points_earned':
        return 'bg-green-50 border-green-200';
      case 'level_up':
        return 'bg-blue-50 border-blue-200';
      case 'streak_milestone':
        return 'bg-orange-50 border-orange-200';
      case 'achievement_unlocked':
        return 'bg-yellow-50 border-yellow-200';
      case 'referral_success':
        return 'bg-pink-50 border-pink-200';
      case 'reward_available':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const handleMarkAsRead = (notificationId: string) => {
    setLocalNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      )
    );
    onMarkAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    setLocalNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    );
    onMarkAllAsRead();
  };

  const unreadCount = localNotifications.filter(n => !n.is_read).length;
  const recentNotifications = localNotifications
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50" onClick={onClose} />
        
        {/* Panel */}
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellIcon className="w-6 h-6 mr-2" />
                    <h2 className="text-lg font-medium">Rewards Notifications</h2>
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="mt-2 text-sm text-blue-200 hover:text-white underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {recentNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <BellIcon className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No notifications yet</p>
                    <p className="text-sm">Your reward notifications will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.is_read ? 'border-l-4' : ''
                        } ${getNotificationBgColor(notification.notification_type, notification.is_read)}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.notification_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`text-sm font-medium ${
                                !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckIcon className="w-4 h-4 text-gray-500" />
                                </button>
                              )}
                            </div>
                            
                            <p className={`text-sm ${
                              !notification.is_read ? 'text-gray-700' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            
                            {notification.points_amount && (
                              <div className="flex items-center mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  +{notification.points_amount} points
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                              
                              {/* Special metadata display */}
                              {notification.metadata?.streak_bonus && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  Streak Bonus!
                                </span>
                              )}
                              
                              {notification.metadata?.level_name && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {notification.metadata.level_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Notifications are kept for 30 days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Toast Component for real-time notifications
export function RewardsNotificationToast({ 
  notification, 
  onClose, 
  isVisible 
}: { 
  notification: RewardsNotification | null; 
  onClose: () => void;
  isVisible: boolean;
}) {
  useEffect(() => {
    if (isVisible && notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, notification, onClose]);

  if (!isVisible || !notification) return null;

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'points_earned':
        return <GiftIcon className="w-6 h-6 text-green-600" />;
      case 'level_up':
        return <ArrowUpIcon className="w-6 h-6 text-blue-600" />;
      case 'streak_milestone':
        return <FireIcon className="w-6 h-6 text-orange-600" />;
      case 'achievement_unlocked':
        return <StarIcon className="w-6 h-6 text-yellow-600" />;
      case 'referral_success':
        return <UserGroupIcon className="w-6 h-6 text-pink-600" />;
      default:
        return <BellIcon className="w-6 h-6 text-blue-600" />;
    }
  };

  const getToastBgClass = (type: string) => {
    switch (type) {
      case 'points_earned':
        return 'from-green-500 to-emerald-500';
      case 'level_up':
        return 'from-blue-500 to-indigo-500';
      case 'streak_milestone':
        return 'from-orange-500 to-red-500';
      case 'achievement_unlocked':
        return 'from-yellow-500 to-orange-500';
      case 'referral_success':
        return 'from-pink-500 to-rose-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`bg-gradient-to-r ${getToastBgClass(notification.notification_type)} rounded-lg shadow-lg p-4 text-white transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {getToastIcon(notification.notification_type)}
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.title}</p>
            <p className="text-sm opacity-90">{notification.message}</p>
            
            {notification.points_amount && (
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20">
                  +{notification.points_amount} points
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="ml-2 flex-shrink-0 rounded-md text-white hover:text-gray-200 focus:outline-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}