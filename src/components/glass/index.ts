// Apple Glass Agricultural Component Library
// Optimized for field workers and outdoor visibility

// Core Glass Components
export { 
  GlassCard, 
  CropMonitoringCard, 
  MetricCard, 
  EquipmentStatusCard, 
  AlertsPanel, 
  MarketTicker 
} from './GlassCard';

export { 
  GlassButton, 
  QuickActionButton, 
  ToggleButton, 
  FloatingActionButton, 
  ButtonGroup 
} from './GlassButton';

export { 
  GlassInput, 
  SearchInput, 
  NumberInput, 
  DateInput 
} from './GlassInput';

export { 
  WeatherWidget, 
  MiniWeatherCard 
} from './WeatherWidget';

// Agricultural-specific components will be added here
export * from './YieldChart';
export * from './CropHealthIndicator';
export * from './IrrigationControls';
export * from './TaskManager';

// Component library version and metadata
export const GLASS_LIBRARY_VERSION = '1.0.0';
export const GLASS_LIBRARY_NAME = 'AgriNexus Glass UI';

// Design system tokens
export const GLASS_TOKENS = {
  colors: {
    agricultural: {
      primary: '#22c55e',
      secondary: '#10b981',
      tertiary: '#16a34a'
    },
    status: {
      healthy: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      growing: '#eab308',
      harvesting: '#fbbf24'
    },
    elements: {
      water: '#0ea5e9',
      equipment: '#ea580c',
      soil: '#78350f',
      crop: '#84cc16'
    }
  },
  spacing: {
    fieldWorker: {
      touchTarget: '60px',
      padding: '16px',
      margin: '12px'
    }
  },
  typography: {
    fieldWorker: {
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '1.4'
    }
  }
} as const;

// Utility functions for the design system
export const glassUtils = {
  /**
   * Get appropriate glass variant based on agricultural context
   */
  getAgriculturalVariant: (context: 'crop' | 'water' | 'equipment' | 'warning' | 'general') => {
    switch (context) {
      case 'crop': return 'agricultural';
      case 'water': return 'water';
      case 'equipment': return 'equipment';
      case 'warning': return 'warning';
      default: return 'default';
    }
  },

  /**
   * Get status color based on health score
   */
  getHealthStatusColor: (score: number) => {
    if (score >= 80) return 'healthy';
    if (score >= 60) return 'warning';
    return 'danger';
  },

  /**
   * Get crop status variant
   */
  getCropStatusVariant: (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'harvested': return 'agricultural';
      case 'growing':
      case 'flowering': return 'crop';
      case 'warning':
      case 'pest': return 'warning';
      case 'disease':
      case 'failed': return 'danger';
      default: return 'default';
    }
  }
};

// Component presets for common agricultural use cases
export const AGRICULTURAL_PRESETS = {
  dashboard: {
    cropMonitoring: {
      variant: 'agricultural' as const,
      glow: true,
      hover: true
    },
    weatherWidget: {
      variant: 'water' as const,
      compact: false,
      showForecast: true,
      showAlerts: true
    },
    equipmentStatus: {
      variant: 'equipment' as const,
      hover: true
    }
  },
  fieldWorker: {
    quickActions: {
      size: 'field' as const,
      variant: 'primary' as const,
      glow: true
    },
    dataEntry: {
      size: 'lg' as const,
      variant: 'agricultural' as const,
      fullWidth: true
    }
  },
  mobile: {
    touchTargets: {
      minHeight: '60px',
      minWidth: '60px',
      fontSize: '16px' // Prevents iOS zoom
    }
  }
} as const;

export default {
  GlassCard,
  GlassButton,
  GlassInput,
  WeatherWidget,
  GLASS_TOKENS,
  glassUtils,
  AGRICULTURAL_PRESETS
};