import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'warning' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'field'; // 'field' is optimized for field workers
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glow?: boolean;
}

/**
 * Apple Glass Button Component
 * Optimized for field workers with 60px minimum touch targets
 * Includes haptic feedback simulation and high contrast support
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({
    children,
    variant = 'default',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    glow = false,
    className,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      
      // Haptic feedback simulation for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      onClick?.(e);
    };

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return 'glass-button-primary';
        case 'danger':
          return 'glass-button-danger';
        case 'warning':
          return 'glass-button-warning';
        case 'success':
          return 'glass-button-success';
        case 'ghost':
          return 'glass-button-ghost';
        default:
          return '';
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'min-h-[48px] px-4 py-2 text-sm';
        case 'md':
          return 'min-h-[56px] px-6 py-3 text-base';
        case 'lg':
          return 'min-h-[64px] px-8 py-4 text-lg';
        case 'xl':
          return 'min-h-[72px] px-10 py-5 text-xl';
        case 'field':
          return 'min-h-[68px] min-w-[68px] px-6 py-4 text-lg font-bold'; // Optimized for outdoor use
        default:
          return 'min-h-[56px] px-6 py-3 text-base';
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          'glass-button',
          getVariantStyles(),
          getSizeStyles(),
          {
            'w-full': fullWidth,
            'animate-pulse-glow': glow,
            'opacity-50 cursor-not-allowed': disabled || loading,
            'cursor-pointer': !disabled && !loading,
          },
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-center justify-center space-x-2">
          {loading && (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
          
          {!loading && icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">
              {icon}
            </span>
          )}
          
          {!loading && (
            <span className="truncate">
              {children}
            </span>
          )}
          
          {!loading && icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">
              {icon}
            </span>
          )}
        </div>
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

/**
 * Quick Action Button for Field Workers
 * Large, highly visible buttons for common farming tasks
 */
interface QuickActionButtonProps extends Omit<GlassButtonProps, 'size' | 'variant'> {
  action: 'checkin' | 'checkout' | 'irrigate' | 'harvest' | 'spray' | 'emergency';
  count?: number; // For badge display
}

export function QuickActionButton({ 
  action, 
  count, 
  children, 
  className, 
  ...props 
}: QuickActionButtonProps) {
  const getActionConfig = () => {
    switch (action) {
      case 'checkin':
        return {
          variant: 'success' as const,
          icon: '📍',
          color: 'border-green-400 bg-green-400/20'
        };
      case 'checkout':
        return {
          variant: 'primary' as const,
          icon: '🏃',
          color: 'border-blue-400 bg-blue-400/20'
        };
      case 'irrigate':
        return {
          variant: 'primary' as const,
          icon: '💧',
          color: 'border-blue-400 bg-blue-400/20'
        };
      case 'harvest':
        return {
          variant: 'warning' as const,
          icon: '🌾',
          color: 'border-yellow-400 bg-yellow-400/20'
        };
      case 'spray':
        return {
          variant: 'warning' as const,
          icon: '🚿',
          color: 'border-orange-400 bg-orange-400/20'
        };
      case 'emergency':
        return {
          variant: 'danger' as const,
          icon: '🚨',
          color: 'border-red-400 bg-red-400/20'
        };
      default:
        return {
          variant: 'default' as const,
          icon: '⚡',
          color: 'border-gray-400 bg-gray-400/20'
        };
    }
  };

  const config = getActionConfig();

  return (
    <div className="relative">
      <GlassButton
        variant={config.variant}
        size="field"
        icon={<span className="text-2xl">{config.icon}</span>}
        className={cn(
          'relative flex-col space-y-1 h-20 w-20 rounded-xl',
          config.color,
          className
        )}
        {...props}
      >
        <div className="text-xs font-medium text-center leading-tight">
          {children}
        </div>
      </GlassButton>
      
      {count !== undefined && count > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  );
}

/**
 * Toggle Button for Settings
 */
interface ToggleButtonProps extends Omit<GlassButtonProps, 'variant'> {
  active: boolean;
  onToggle: (active: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function ToggleButton({
  active,
  onToggle,
  activeLabel = 'ON',
  inactiveLabel = 'OFF',
  children,
  className,
  ...props
}: ToggleButtonProps) {
  return (
    <GlassButton
      variant={active ? 'success' : 'default'}
      onClick={() => onToggle(!active)}
      className={cn(
        'transition-all duration-300',
        {
          'border-green-400 bg-green-400/20': active,
          'border-gray-400 bg-gray-400/20': !active,
        },
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <div className={cn(
          'w-3 h-3 rounded-full transition-colors duration-300',
          active ? 'bg-green-400' : 'bg-gray-400'
        )} />
        <span>{children}</span>
        <span className="text-xs font-bold">
          {active ? activeLabel : inactiveLabel}
        </span>
      </div>
    </GlassButton>
  );
}

/**
 * Floating Action Button for Quick Access
 */
interface FloatingActionButtonProps extends Omit<GlassButtonProps, 'size' | 'fullWidth'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  position = 'bottom-right',
  children,
  className,
  ...props
}: FloatingActionButtonProps) {
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6';
      case 'bottom-left':
        return 'fixed bottom-6 left-6';
      case 'top-right':
        return 'fixed top-6 right-6';
      case 'top-left':
        return 'fixed top-6 left-6';
      default:
        return 'fixed bottom-6 right-6';
    }
  };

  return (
    <GlassButton
      size="lg"
      variant="primary"
      glow
      className={cn(
        getPositionStyles(),
        'rounded-full h-16 w-16 shadow-2xl z-50',
        'hover:scale-110 active:scale-95',
        className
      )}
      {...props}
    >
      {children}
    </GlassButton>
  );
}

/**
 * Button Group for Related Actions
 */
interface ButtonGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  spacing = 'normal',
  className
}: ButtonGroupProps) {
  const getSpacingClass = () => {
    if (orientation === 'horizontal') {
      switch (spacing) {
        case 'tight': return 'space-x-1';
        case 'normal': return 'space-x-2';
        case 'loose': return 'space-x-4';
        default: return 'space-x-2';
      }
    } else {
      switch (spacing) {
        case 'tight': return 'space-y-1';
        case 'normal': return 'space-y-2';
        case 'loose': return 'space-y-4';
        default: return 'space-y-2';
      }
    }
  };

  return (
    <div className={cn(
      'flex',
      orientation === 'horizontal' ? 'flex-row' : 'flex-col',
      getSpacingClass(),
      className
    )}>
      {children}
    </div>
  );
}

// Additional CSS for success and ghost variants
const additionalStyles = `
.glass-button-success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.3));
  border-color: #22c55e;
  color: white;
}

.glass-button-success:hover {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.4));
  box-shadow: var(--shadow-glass-hover), 0 0 20px rgba(34, 197, 94, 0.3);
}

.glass-button-ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.glass-button-ghost:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}
`;

// Inject additional styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = additionalStyles;
  document.head.appendChild(style);
}

export default GlassButton;