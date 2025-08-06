import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Brain,
  Cloud,
  Wrench,
  DollarSign,
  Users,
  Settings,
  Bell,
  ExternalLink
} from "lucide-react";

interface NotificationToastProps {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'weather' | 'ai' | 'equipment' | 'market' | 'cooperative' | 'system';
  title: string;
  message: string;
  actionRequired?: boolean;
  autoHide?: boolean;
  duration?: number;
  onDismiss: (id: string) => void;
  onAction?: (id: string) => void;
  actionLabel?: string;
}

const NotificationToast = ({
  id,
  type,
  category,
  title,
  message,
  actionRequired = false,
  autoHide = true,
  duration = 5000,
  onDismiss,
  onAction,
  actionLabel = "View Details"
}: NotificationToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (autoHide && type !== 'critical') {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            handleDismiss();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [autoHide, duration, type]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300); // Allow animation to complete
  };

  const getToastIcon = () => {
    switch (type) {
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = () => {
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

  const getToastStyles = () => {
    const baseStyles = "glass-card border-l-4 shadow-lg";
    switch (type) {
      case 'critical': return `${baseStyles} border-l-red-500 bg-red-50/80`;
      case 'warning': return `${baseStyles} border-l-orange-500 bg-orange-50/80`;
      case 'info': return `${baseStyles} border-l-blue-500 bg-blue-50/80`;
      case 'success': return `${baseStyles} border-l-green-500 bg-green-50/80`;
      default: return `${baseStyles} border-l-gray-500`;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      case 'success': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 w-80 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={getToastStyles()}>
        {/* Progress Bar */}
        {autoHide && type !== 'critical' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg">
            <div
              className={`h-full rounded-t-lg transition-all duration-100 notification-progress ${
                type === 'critical' ? 'bg-red-500' :
                type === 'warning' ? 'bg-orange-500' :
                type === 'info' ? 'bg-blue-500' :
                'bg-green-500'
              }`}
              style={{ '--notification-progress': `${progress}%` } as React.CSSProperties}
            />
          </div>
        )}

        <div className="flex items-start space-x-3">
          {/* Type Icon */}
          <div className={`${getIconColor()} mt-1`}>
            {getToastIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
              <div className={`${getIconColor()}`}>
                {getCategoryIcon()}
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {message}
            </p>

            {/* Badges and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={`glass-badge text-xs ${
                  type === 'critical' ? 'error' :
                  type === 'warning' ? 'warning' :
                  type === 'success' ? 'success' : 'info'
                }`}>
                  {type}
                </Badge>
                {actionRequired && (
                  <Badge className="glass-badge warning text-xs">
                    Action Required
                  </Badge>
                )}
                <span className="text-xs text-gray-500 capitalize">{category}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {(actionRequired || onAction) && (
              <div className="flex items-center space-x-2 mt-3">
                {onAction && (
                  <Button
                    onClick={() => onAction(id)}
                    size="sm"
                    className="glass-button bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-xs px-3 py-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {actionLabel}
                  </Button>
                )}
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="glass-button text-xs px-3 py-1"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Dismiss
                </Button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="glass-button !padding-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;