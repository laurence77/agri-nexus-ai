// Agricultural Automation Components
// n8n workflow integration for smart farming automation

export { WorkflowBuilder } from './WorkflowBuilder';

// Re-export automation service types for convenience
export type {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowConnection,
  WorkflowExecution,
  AutomationTrigger,
  WorkflowTemplate
} from '@/services/automation/n8n-workflow-service';

// Automation Component metadata
export const AUTOMATION_COMPONENTS_METADATA = {
  workflowBuilder: {
    title: 'Workflow Builder',
    description: 'Visual workflow creation and management interface for agricultural automation',
    features: [
      'Pre-built agricultural workflow templates',
      'Visual workflow editor with drag-and-drop',
      'Real-time execution monitoring',
      'Template marketplace with ratings',
      'Advanced analytics and performance metrics',
      'Multi-category automation (irrigation, market, health, finance, compliance)'
    ],
    technologies: ['n8n', 'Workflow Automation', 'Visual Editor', 'Templates']
  }
} as const;

// Automation Categories
export const AUTOMATION_CATEGORIES = {
  irrigation: {
    id: 'irrigation',
    name: 'Smart Irrigation',
    description: 'Automated watering systems with weather integration',
    icon: '💧',
    color: 'text-blue-400',
    templates: [
      'Smart Irrigation with Weather Integration',
      'Drip Irrigation Controller',
      'Moisture-based Watering System',
      'Multi-Zone Irrigation Manager',
      'Rain Sensor Integration',
      'Solar-powered Irrigation',
      'Greenhouse Climate Control',
      'Hydroponic Nutrient Management'
    ]
  },
  market_intelligence: {
    id: 'market_intelligence',
    name: 'Market Intelligence',
    description: 'Price monitoring and market analysis automation',
    icon: '📈',
    color: 'text-green-400',
    templates: [
      'Market Price Intelligence Monitor',
      'Commodity Price Alerts',
      'Supply Chain Price Tracking',
      'Export Opportunity Scanner',
      'Seasonal Price Forecasting',
      'Competitor Price Analysis'
    ]
  },
  crop_health: {
    id: 'crop_health',
    name: 'Crop Health Monitoring',
    description: 'AI-powered monitoring and disease detection',
    icon: '🌱',
    color: 'text-purple-400',
    templates: [
      'AI-Powered Crop Health Monitoring',
      'Disease Early Warning System',
      'Pest Detection and Alert',
      'Satellite Imagery Analysis',
      'NDVI Trend Monitoring',
      'Growth Stage Tracking',
      'Yield Prediction Model',
      'Quality Assessment Automation',
      'Harvest Timing Optimizer',
      'Post-harvest Quality Monitor',
      'Storage Condition Alerts',
      'Traceability Data Collection'
    ]
  },
  financial: {
    id: 'financial',
    name: 'Financial Management',
    description: 'Automated accounting and expense tracking',
    icon: '💰',
    color: 'text-yellow-400',
    templates: [
      'Farm Financial Management Automation',
      'Mobile Money Transaction Tracking',
      'Expense Categorization System',
      'Profit/Loss Analysis',
      'Invoice Generation Automation'
    ]
  },
  compliance: {
    id: 'compliance',
    name: 'Compliance & Reporting',
    description: 'Regulatory compliance and certification maintenance',
    icon: '📋',
    color: 'text-red-400',
    templates: [
      'Regulatory Compliance & Certification',
      'Organic Certification Monitoring',
      'Fair Trade Compliance Checker',
      'Documentation Automation'
    ]
  },
  logistics: {
    id: 'logistics',
    name: 'Logistics & Supply Chain',
    description: 'Transportation and supply chain automation',
    icon: '🚚',
    color: 'text-orange-400',
    templates: [
      'Supply Chain Tracking',
      'Delivery Route Optimization',
      'Inventory Management Automation',
      'Cold Chain Monitoring'
    ]
  }
} as const;

// Workflow Trigger Types
export const TRIGGER_TYPES = {
  schedule: {
    name: 'Schedule',
    description: 'Time-based triggers (cron, intervals)',
    icon: '⏰',
    examples: ['Every 6 hours', 'Daily at 8 AM', 'Weekly on Monday']
  },
  webhook: {
    name: 'Webhook',
    description: 'HTTP endpoint triggers',
    icon: '🔗',
    examples: ['API calls', 'External system notifications', 'Form submissions']
  },
  sensor: {
    name: 'Sensor',
    description: 'IoT sensor-based triggers',
    icon: '📡',
    examples: ['Soil moisture threshold', 'Temperature alerts', 'pH level changes']
  },
  email: {
    name: 'Email',
    description: 'Email-based triggers',
    icon: '📧',
    examples: ['New email received', 'Specific sender', 'Subject keywords']
  },
  manual: {
    name: 'Manual',
    description: 'User-initiated triggers',
    icon: '👆',
    examples: ['Button click', 'Mobile app action', 'Dashboard trigger']
  },
  condition: {
    name: 'Condition',
    description: 'Data condition-based triggers',
    icon: '🎯',
    examples: ['Price thresholds', 'Weather conditions', 'Stock levels']
  }
} as const;

// Popular Workflow Templates
export const POPULAR_TEMPLATES = [
  {
    id: 'smart-irrigation-weather',
    name: 'Smart Irrigation with Weather Integration',
    category: 'irrigation',
    difficulty: 'intermediate',
    estimatedTime: 45,
    downloads: 1250,
    rating: 4.8,
    savings: '30-40% water savings'
  },
  {
    id: 'financial-management',
    name: 'Farm Financial Management Automation',
    category: 'financial',
    difficulty: 'intermediate',
    estimatedTime: 60,
    downloads: 1120,
    rating: 4.7,
    savings: 'Automated bookkeeping'
  },
  {
    id: 'market-price-monitor',
    name: 'Market Price Intelligence Monitor',
    category: 'market_intelligence',
    difficulty: 'beginner',
    estimatedTime: 20,
    downloads: 980,
    rating: 4.6,
    savings: 'Maximize selling profits'
  },
  {
    id: 'crop-health-monitoring',
    name: 'AI-Powered Crop Health Monitoring',
    category: 'crop_health',
    difficulty: 'advanced',
    estimatedTime: 90,
    downloads: 756,
    rating: 4.9,
    savings: 'Early disease detection'
  },
  {
    id: 'compliance-reporting',
    name: 'Regulatory Compliance & Certification',
    category: 'compliance',
    difficulty: 'advanced',
    estimatedTime: 120,
    downloads: 342,
    rating: 4.5,
    savings: 'Automated compliance'
  }
] as const;

// Automation utilities
export const automationUtils = {
  /**
   * Get category information by ID
   */
  getCategoryInfo: (categoryId: string) => {
    return AUTOMATION_CATEGORIES[categoryId as keyof typeof AUTOMATION_CATEGORIES];
  },

  /**
   * Get difficulty color class
   */
  getDifficultyColor: (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  },

  /**
   * Format execution time
   */
  formatExecutionTime: (milliseconds: number) => {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    if (milliseconds < 3600000) return `${(milliseconds / 60000).toFixed(1)}m`;
    return `${(milliseconds / 3600000).toFixed(1)}h`;
  },

  /**
   * Calculate cost savings
   */
  calculateSavings: (
    automationType: string,
    farmSize: number,
    executionsPerMonth: number
  ) => {
    const savingsPerExecution = {
      irrigation: 2.50,  // USD per execution
      financial: 5.00,   // USD per hour saved
      market_intelligence: 1.00, // USD per alert
      crop_health: 15.00, // USD per early detection
      compliance: 25.00   // USD per report
    };

    const base = savingsPerExecution[automationType as keyof typeof savingsPerExecution] || 1;
    const sizeMultiplier = Math.log(farmSize + 1) / Math.log(10); // Logarithmic scaling
    
    return base * executionsPerMonth * sizeMultiplier;
  },

  /**
   * Generate cron expression from human-readable schedule
   */
  generateCron: (schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'hourly';
    time?: string; // HH:MM format
    dayOfWeek?: number; // 0-6, Sunday = 0
    dayOfMonth?: number; // 1-31
  }) => {
    const [hour = '8', minute = '0'] = (schedule.time || '08:00').split(':');
    
    switch (schedule.frequency) {
      case 'hourly':
        return `0 * * * *`; // Every hour
      case 'daily':
        return `${minute} ${hour} * * *`; // Daily at specified time
      case 'weekly':
        return `${minute} ${hour} * * ${schedule.dayOfWeek || 1}`; // Weekly on specified day
      case 'monthly':
        return `${minute} ${hour} ${schedule.dayOfMonth || 1} * *`; // Monthly on specified day
      default:
        return `0 8 * * *`; // Default: Daily at 8 AM
    }
  },

  /**
   * Validate workflow configuration
   */
  validateWorkflow: (workflow: any) => {
    const errors: string[] = [];
    
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.category) errors.push('Category is required');
    if (!workflow.nodes || workflow.nodes.length === 0) errors.push('At least one node is required');
    
    // Validate nodes
    workflow.nodes?.forEach((node: any, index: number) => {
      if (!node.name) errors.push(`Node ${index + 1} is missing a name`);
      if (!node.type) errors.push(`Node ${index + 1} is missing a type`);
    });
    
    // Validate connections
    if (workflow.connections) {
      Object.values(workflow.connections).forEach((connections: any) => {
        connections.main?.forEach((connectionArray: any[]) => {
          connectionArray.forEach((connection: any) => {
            if (!workflow.nodes.find((n: any) => n.name === connection.node)) {
              errors.push(`Invalid connection to non-existent node: ${connection.node}`);
            }
          });
        });
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Generate workflow documentation
   */
  generateDocumentation: (workflow: any) => {
    const doc = {
      name: workflow.name,
      description: workflow.description,
      category: workflow.category,
      setup: [],
      usage: [],
      nodes: workflow.nodes?.map((node: any) => ({
        name: node.name,
        type: node.type,
        description: node.notes || `${node.type} node`
      })) || []
    };
    
    return doc;
  }
};

// Default export for convenient imports
export default {
  WorkflowBuilder,
  AUTOMATION_COMPONENTS_METADATA,
  AUTOMATION_CATEGORIES,
  TRIGGER_TYPES,
  POPULAR_TEMPLATES,
  automationUtils
};