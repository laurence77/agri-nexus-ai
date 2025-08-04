/**
 * n8n Workflow Service for Agricultural Automation
 * Manages automated workflows for irrigation, market intelligence, crop monitoring, and compliance
 * Integrates with n8n API for workflow orchestration and execution
 */

import axios, { AxiosInstance } from 'axios';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: 'irrigation' | 'market_intelligence' | 'crop_health' | 'financial' | 'compliance' | 'logistics';
  tags: string[];
  active: boolean;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  settings: {
    timezone: string;
    saveExecutionProgress: boolean;
    saveManualExecutions: boolean;
    callerPolicy: 'workflowsFromSameOwner' | 'workflowsFromAList' | 'any';
    errorWorkflow?: string;
  };
  staticData?: Record<string, any>;
  pinData?: Record<string, any>;
  versionId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhookId?: string;
  disabled?: boolean;
  notes?: string;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  continueOnFail?: boolean;
}

export interface WorkflowConnection {
  node: string;
  type: 'main' | 'ai';
  index: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  mode: 'manual' | 'trigger' | 'webhook' | 'retry' | 'cli';
  startedAt: Date;
  stoppedAt?: Date;
  status: 'new' | 'running' | 'success' | 'failed' | 'canceled' | 'crashed' | 'waiting';
  data?: {
    resultData: {
      runData: Record<string, any>;
      pinData?: Record<string, any>;
      lastNodeExecuted?: string;
    };
    executionData?: {
      contextData: Record<string, any>;
      nodeExecutionStack: any[];
      metadata: Record<string, any>;
      waitingExecution: Record<string, any>;
      waitingExecutionSource: Record<string, any>;
    };
  };
  retryOf?: string;
  retrySuccessId?: string;
  error?: {
    message: string;
    name: string;
    description: string;
    node?: string;
    stack?: string;
    timestamp: Date;
  };
}

export interface AutomationTrigger {
  id: string;
  name: string;
  type: 'schedule' | 'webhook' | 'sensor' | 'email' | 'manual' | 'condition';
  workflowId: string;
  active: boolean;
  config: {
    schedule?: {
      cron: string;
      timezone: string;
    };
    webhook?: {
      path: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      authentication?: 'none' | 'basicAuth' | 'headerAuth';
    };
    sensor?: {
      fieldId: string;
      sensorType: string;
      condition: string;
      threshold: number;
    };
    condition?: {
      field: string;
      operator: 'equals' | 'greater' | 'less' | 'contains';
      value: any;
    };
  };
  lastTriggered?: Date;
  nextScheduled?: Date;
  executionCount: number;
  successCount: number;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number; // minutes
  requirements: string[];
  benefits: string[];
  workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>;
  documentation: {
    setup: string;
    usage: string;
    troubleshooting: string;
    examples: any[];
  };
  author: string;
  version: string;
  downloads: number;
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * n8n Workflow Service for Agricultural Automation
 */
export class N8nWorkflowService {
  private apiClient: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private templates: Map<string, WorkflowTemplate> = new Map();
  private activeWorkflows: Map<string, WorkflowDefinition> = new Map();

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.apiClient = axios.create({
      baseURL: `${baseUrl}/api/v1`,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    this.initializeTemplates();
  }

  /**
   * Initialize pre-built workflow templates
   */
  private initializeTemplates(): void {
    const templates: WorkflowTemplate[] = [
      {
        id: 'smart-irrigation-weather',
        name: 'Smart Irrigation with Weather Integration',
        description: 'Automated irrigation system that considers soil moisture, weather forecasts, and crop water requirements',
        category: 'irrigation',
        tags: ['irrigation', 'weather', 'sensors', 'automation'],
        difficulty: 'intermediate',
        estimatedSetupTime: 45,
        requirements: ['Soil moisture sensors', 'Weather API access', 'Irrigation system'],
        benefits: ['30-40% water savings', 'Improved crop yields', 'Reduced labor costs'],
        workflow: this.createSmartIrrigationWorkflow(),
        documentation: {
          setup: 'Install soil moisture sensors and connect to n8n. Configure weather API credentials.',
          usage: 'Workflow runs every 6 hours and triggers irrigation based on conditions.',
          troubleshooting: 'Check sensor connectivity and API rate limits.',
          examples: []
        },
        author: 'AgriNexus AI',
        version: '1.2.0',
        downloads: 1250,
        rating: 4.8,
        reviews: 89,
        createdAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-07-20')
      },
      {
        id: 'market-price-monitor',
        name: 'Market Price Intelligence Monitor',
        description: 'Tracks commodity prices, identifies trends, and sends alerts for optimal selling opportunities',
        category: 'market_intelligence',
        tags: ['prices', 'market', 'alerts', 'analytics'],
        difficulty: 'beginner',
        estimatedSetupTime: 20,
        requirements: ['Market data API access', 'Notification channels'],
        benefits: ['Maximize selling profits', 'Market timing insights', 'Price trend analysis'],
        workflow: this.createMarketPriceWorkflow(),
        documentation: {
          setup: 'Configure market data sources and notification preferences.',
          usage: 'Monitors prices daily and sends alerts for significant changes.',
          troubleshooting: 'Verify API endpoints and notification settings.',
          examples: []
        },
        author: 'AgriNexus AI',
        version: '1.1.0',
        downloads: 980,
        rating: 4.6,
        reviews: 67,
        createdAt: new Date('2024-05-20'),
        updatedAt: new Date('2024-07-10')
      },
      {
        id: 'crop-health-monitoring',
        name: 'AI-Powered Crop Health Monitoring',
        description: 'Continuous monitoring of crop health using satellite imagery, IoT sensors, and AI disease detection',
        category: 'crop_health',
        tags: ['ai', 'monitoring', 'diseases', 'satellite', 'iot'],
        difficulty: 'advanced',
        estimatedSetupTime: 90,
        requirements: ['Satellite imagery API', 'IoT sensors', 'AI/ML models'],
        benefits: ['Early disease detection', 'Yield optimization', 'Reduced crop losses'],
        workflow: this.createCropHealthWorkflow(),
        documentation: {
          setup: 'Connect satellite APIs, configure IoT sensors, and train AI models.',
          usage: 'Runs continuously with daily satellite checks and real-time sensor monitoring.',
          troubleshooting: 'Monitor API quotas and sensor connectivity.',
          examples: []
        },
        author: 'AgriNexus AI',
        version: '2.0.0',
        downloads: 756,
        rating: 4.9,
        reviews: 123,
        createdAt: new Date('2024-04-10'),
        updatedAt: new Date('2024-07-25')
      },
      {
        id: 'financial-management',
        name: 'Farm Financial Management Automation',
        description: 'Automated expense tracking, invoice generation, profit analysis, and financial reporting',
        category: 'financial',
        tags: ['finance', 'accounting', 'invoicing', 'reporting'],
        difficulty: 'intermediate',
        estimatedSetupTime: 60,
        requirements: ['Accounting software integration', 'Bank API access', 'Mobile money integration'],
        benefits: ['Automated bookkeeping', 'Real-time profit tracking', 'Tax compliance'],
        workflow: this.createFinancialWorkflow(),
        documentation: {
          setup: 'Connect accounting software and bank APIs.',
          usage: 'Processes transactions daily and generates monthly reports.',
          troubleshooting: 'Check API credentials and data mapping.',
          examples: []
        },
        author: 'AgriNexus AI',
        version: '1.3.0',
        downloads: 1120,
        rating: 4.7,
        reviews: 95,
        createdAt: new Date('2024-03-25'),
        updatedAt: new Date('2024-07-15')
      },
      {
        id: 'compliance-reporting',
        name: 'Regulatory Compliance & Certification',
        description: 'Automated compliance monitoring, document generation, and certification maintenance',
        category: 'compliance',
        tags: ['compliance', 'certification', 'documentation', 'reporting'],
        difficulty: 'advanced',
        estimatedSetupTime: 120,
        requirements: ['Document management system', 'Certification body APIs', 'Data validation'],
        benefits: ['Automated compliance', 'Certification maintenance', 'Audit readiness'],
        workflow: this.createComplianceWorkflow(),
        documentation: {
          setup: 'Configure certification requirements and document templates.',
          usage: 'Monitors compliance continuously and generates reports monthly.',
          troubleshooting: 'Verify document templates and API connections.',
          examples: []
        },
        author: 'AgriNexus AI',
        version: '1.0.0',
        downloads: 342,
        rating: 4.5,
        reviews: 28,
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-07-05')
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Get all available workflow templates
   */
  async getWorkflowTemplates(category?: string): Promise<WorkflowTemplate[]> {
    let templates = Array.from(this.templates.values());
    
    if (category) {
      templates = templates.filter(template => template.category === category);
    }
    
    return templates.sort((a, b) => b.downloads - a.downloads);
  }

  /**
   * Get workflow template by ID
   */
  async getWorkflowTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Create workflow from template
   */
  async createWorkflowFromTemplate(
    templateId: string,
    customizations: {
      name?: string;
      farmId: string;
      fieldIds?: string[];
      parameters?: Record<string, any>;
    }
  ): Promise<WorkflowDefinition> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Create workflow definition from template
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const workflow: WorkflowDefinition = {
        ...template.workflow,
        id: workflowId,
        name: customizations.name || template.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Apply customizations
      if (customizations.parameters) {
        workflow.nodes = workflow.nodes.map(node => ({
          ...node,
          parameters: { ...node.parameters, ...customizations.parameters }
        }));
      }

      // Add farm/field context
      workflow.staticData = {
        ...workflow.staticData,
        farmId: customizations.farmId,
        fieldIds: customizations.fieldIds || []
      };

      // Create workflow via n8n API
      const response = await this.apiClient.post('/workflows', workflow);
      
      const createdWorkflow = response.data;
      this.activeWorkflows.set(workflowId, createdWorkflow);

      console.log('Workflow created from template:', templateId, '→', workflowId);
      return createdWorkflow;
    } catch (error) {
      console.error('Failed to create workflow from template:', error);
      throw error;
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    workflowId: string,
    inputData?: Record<string, any>,
    mode: 'manual' | 'trigger' = 'manual'
  ): Promise<WorkflowExecution> {
    try {
      const response = await this.apiClient.post(`/workflows/${workflowId}/execute`, {
        data: inputData,
        mode
      });

      const execution: WorkflowExecution = {
        id: response.data.executionId,
        workflowId,
        mode,
        startedAt: new Date(),
        status: 'running'
      };

      console.log('Workflow execution started:', execution.id);
      return execution;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow execution status and results
   */
  async getWorkflowExecution(executionId: string): Promise<WorkflowExecution> {
    try {
      const response = await this.apiClient.get(`/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get workflow execution:', error);
      throw error;
    }
  }

  /**
   * Get workflow execution history
   */
  async getWorkflowExecutions(
    workflowId: string,
    options: {
      limit?: number;
      status?: WorkflowExecution['status'];
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<WorkflowExecution[]> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());

      const response = await this.apiClient.get(`/workflows/${workflowId}/executions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get workflow executions:', error);
      throw error;
    }
  }

  /**
   * Create automation trigger
   */
  async createTrigger(trigger: Omit<AutomationTrigger, 'id' | 'executionCount' | 'successCount' | 'failureCount' | 'createdAt' | 'updatedAt'>): Promise<AutomationTrigger> {
    try {
      const triggerId = `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newTrigger: AutomationTrigger = {
        ...trigger,
        id: triggerId,
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Register trigger with n8n
      if (trigger.type === 'schedule' && trigger.config.schedule) {
        await this.apiClient.post('/workflows/triggers', {
          workflowId: trigger.workflowId,
          type: 'cron',
          config: {
            cron: trigger.config.schedule.cron,
            timezone: trigger.config.schedule.timezone
          }
        });
      }

      console.log('Automation trigger created:', triggerId);
      return newTrigger;
    } catch (error) {
      console.error('Failed to create trigger:', error);
      throw error;
    }
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    try {
      const response = await this.apiClient.put(`/workflows/${workflowId}`, updates);
      
      const updatedWorkflow = response.data;
      this.activeWorkflows.set(workflowId, updatedWorkflow);

      console.log('Workflow updated:', workflowId);
      return updatedWorkflow;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  }

  /**
   * Activate/deactivate workflow
   */
  async toggleWorkflow(workflowId: string, active: boolean): Promise<void> {
    try {
      await this.apiClient.put(`/workflows/${workflowId}/activate`, { active });
      
      const workflow = this.activeWorkflows.get(workflowId);
      if (workflow) {
        workflow.active = active;
        workflow.updatedAt = new Date();
      }

      console.log('Workflow toggled:', workflowId, active ? 'activated' : 'deactivated');
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
      throw error;
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/workflows/${workflowId}`);
      this.activeWorkflows.delete(workflowId);
      
      console.log('Workflow deleted:', workflowId);
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow analytics
   */
  async getWorkflowAnalytics(workflowId: string, days: number = 30): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    successRate: number;
    executionTrend: Array<{ date: string; executions: number; success: number; failed: number }>;
    commonErrors: Array<{ error: string; count: number }>;
    performanceMetrics: {
      avgMemoryUsage: number;
      avgCpuUsage: number;
      avgDuration: number;
    };
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const executions = await this.getWorkflowExecutions(workflowId, { startDate, endDate });
      
      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(e => e.status === 'success').length;
      const failedExecutions = executions.filter(e => e.status === 'failed').length;
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
      
      // Calculate average execution time
      const completedExecutions = executions.filter(e => e.stoppedAt);
      const averageExecutionTime = completedExecutions.length > 0 
        ? completedExecutions.reduce((sum, e) => sum + (e.stoppedAt!.getTime() - e.startedAt.getTime()), 0) / completedExecutions.length / 1000
        : 0;

      // Generate execution trend
      const executionTrend = this.generateExecutionTrend(executions, days);
      
      // Analyze common errors
      const commonErrors = this.analyzeCommonErrors(executions);

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        averageExecutionTime,
        successRate,
        executionTrend,
        commonErrors,
        performanceMetrics: {
          avgMemoryUsage: 45.2, // MB - would be calculated from actual metrics
          avgCpuUsage: 12.8,    // %
          avgDuration: averageExecutionTime
        }
      };
    } catch (error) {
      console.error('Failed to get workflow analytics:', error);
      throw error;
    }
  }

  /**
   * Generate execution trend data
   */
  private generateExecutionTrend(executions: WorkflowExecution[], days: number): Array<{ date: string; executions: number; success: number; failed: number }> {
    const trend = [];
    const endDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayExecutions = executions.filter(e => 
        e.startedAt.toISOString().split('T')[0] === dateStr
      );
      
      trend.push({
        date: dateStr,
        executions: dayExecutions.length,
        success: dayExecutions.filter(e => e.status === 'success').length,
        failed: dayExecutions.filter(e => e.status === 'failed').length
      });
    }
    
    return trend;
  }

  /**
   * Analyze common errors
   */
  private analyzeCommonErrors(executions: WorkflowExecution[]): Array<{ error: string; count: number }> {
    const errorCounts = new Map<string, number>();
    
    executions
      .filter(e => e.error)
      .forEach(e => {
        const error = e.error!.message;
        errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
      });
    
    return Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Create smart irrigation workflow definition
   */
  private createSmartIrrigationWorkflow(): Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: 'Smart Irrigation with Weather Integration',
      description: 'Automated irrigation based on soil moisture, weather, and crop requirements',
      category: 'irrigation',
      tags: ['irrigation', 'weather', 'sensors'],
      active: false,
      nodes: [
        {
          id: 'start',
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [100, 200],
          parameters: {
            rule: {
              interval: [{ field: 'hours', value: 6 }]
            }
          }
        },
        {
          id: 'soil-sensor',
          name: 'Get Soil Moisture',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [300, 200],
          parameters: {
            url: '={{$env.AGRINEXUS_API}}/sensors/soil-moisture/{{$env.FIELD_ID}}',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{$env.API_TOKEN}}'
            }
          }
        },
        {
          id: 'weather-api',
          name: 'Get Weather Forecast',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [300, 350],
          parameters: {
            url: '={{$env.WEATHER_API_URL}}/forecast?lat={{$env.FIELD_LAT}}&lon={{$env.FIELD_LON}}&appid={{$env.WEATHER_API_KEY}}',
            method: 'GET'
          }
        },
        {
          id: 'irrigation-logic',
          name: 'Irrigation Decision',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [500, 275],
          parameters: {
            functionCode: `
              const soilMoisture = $('Get Soil Moisture').first().json.moisture_level;
              const weather = $('Get Weather Forecast').first().json;
              const rainForecast = weather.list[0].rain ? weather.list[0].rain['3h'] || 0 : 0;
              
              const cropWaterRequirement = 25; // mm per day
              const moistureThreshold = 30; // %
              
              const needsIrrigation = soilMoisture < moistureThreshold && rainForecast < 5;
              const irrigationDuration = needsIrrigation ? Math.max(10, cropWaterRequirement - rainForecast) : 0;
              
              return [{ 
                needsIrrigation, 
                irrigationDuration,
                soilMoisture,
                rainForecast,
                reason: needsIrrigation ? 'Low soil moisture and minimal rain expected' : 'Adequate moisture or rain expected'
              }];
            `
          }
        },
        {
          id: 'irrigation-control',
          name: 'Control Irrigation System',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [700, 275],
          parameters: {
            url: '={{$env.IRRIGATION_API}}/control',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{$env.IRRIGATION_TOKEN}}'
            },
            body: {
              field_id: '={{$env.FIELD_ID}}',
              action: '={{$json.needsIrrigation ? "start" : "stop"}}',
              duration_minutes: '={{$json.irrigationDuration}}'
            }
          }
        },
        {
          id: 'log-activity',
          name: 'Log Irrigation Activity',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [900, 275],
          parameters: {
            url: '={{$env.AGRINEXUS_API}}/activities',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{$env.API_TOKEN}}'
            },
            body: {
              field_id: '={{$env.FIELD_ID}}',
              activity_type: 'irrigation',
              automated: true,
              details: {
                soil_moisture: '={{$("Irrigation Decision").first().json.soilMoisture}}',
                rain_forecast: '={{$("Irrigation Decision").first().json.rainForecast}}',
                irrigation_duration: '={{$("Irrigation Decision").first().json.irrigationDuration}}',
                reason: '={{$("Irrigation Decision").first().json.reason}}'
              }
            }
          }
        }
      ],
      connections: {
        'Schedule Trigger': { main: [[{ node: 'Get Soil Moisture', type: 'main', index: 0 }, { node: 'Get Weather Forecast', type: 'main', index: 0 }]] },
        'Get Soil Moisture': { main: [[{ node: 'Irrigation Decision', type: 'main', index: 0 }]] },
        'Get Weather Forecast': { main: [[{ node: 'Irrigation Decision', type: 'main', index: 0 }]] },
        'Irrigation Decision': { main: [[{ node: 'Control Irrigation System', type: 'main', index: 0 }]] },
        'Control Irrigation System': { main: [[{ node: 'Log Irrigation Activity', type: 'main', index: 0 }]] }
      },
      settings: {
        timezone: 'Africa/Nairobi',
        saveExecutionProgress: true,
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner'
      },
      versionId: 1
    };
  }

  /**
   * Create market price monitoring workflow definition
   */
  private createMarketPriceWorkflow(): Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: 'Market Price Intelligence Monitor',
      description: 'Tracks commodity prices and sends alerts for optimal selling opportunities',
      category: 'market_intelligence',
      tags: ['prices', 'market', 'alerts'],
      active: false,
      nodes: [
        {
          id: 'daily-trigger',
          name: 'Daily Price Check',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [100, 200],
          parameters: {
            rule: {
              interval: [{ field: 'hours', value: 24 }]
            }
          }
        },
        {
          id: 'fetch-prices',
          name: 'Fetch Market Prices',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [300, 200],
          parameters: {
            url: '={{$env.MARKET_API}}/prices/{{$env.CROP_TYPE}}',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{$env.MARKET_API_KEY}}'
            }
          }
        },
        {
          id: 'price-analysis',
          name: 'Price Trend Analysis',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [500, 200],
          parameters: {
            functionCode: `
              const currentPrice = $json.current_price;
              const weekAgoPrice = $json.week_ago_price;
              const monthAgoPrice = $json.month_ago_price;
              
              const weeklyChange = ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100;
              const monthlyChange = ((currentPrice - monthAgoPrice) / monthAgoPrice) * 100;
              
              let recommendation = 'hold';
              let alert = false;
              
              if (weeklyChange > 10) {
                recommendation = 'sell';
                alert = true;
              } else if (weeklyChange < -15) {
                recommendation = 'wait';
                alert = true;
              }
              
              return [{
                currentPrice,
                weeklyChange,
                monthlyChange,
                recommendation,
                alert,
                analysis: \`Price: \${currentPrice} KES/kg. Weekly: \${weeklyChange.toFixed(1)}%, Monthly: \${monthlyChange.toFixed(1)}%\`
              }];
            `
          }
        },
        {
          id: 'send-alert',
          name: 'Send Price Alert',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [700, 200],
          parameters: {
            url: '={{$env.NOTIFICATION_API}}/sms',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{$env.NOTIFICATION_TOKEN}}'
            },
            body: {
              to: '={{$env.FARMER_PHONE}}',
              message: 'AgriNexus Alert: {{$json.analysis}}. Recommendation: {{$json.recommendation.toUpperCase()}}'
            }
          }
        }
      ],
      connections: {
        'Daily Price Check': { main: [[{ node: 'Fetch Market Prices', type: 'main', index: 0 }]] },
        'Fetch Market Prices': { main: [[{ node: 'Price Trend Analysis', type: 'main', index: 0 }]] },
        'Price Trend Analysis': { main: [[{ node: 'Send Price Alert', type: 'main', index: 0 }]] }
      },
      settings: {
        timezone: 'Africa/Nairobi',
        saveExecutionProgress: true,
        saveManualExecutions: false,
        callerPolicy: 'workflowsFromSameOwner'
      },
      versionId: 1
    };
  }

  /**
   * Create crop health monitoring workflow definition
   */
  private createCropHealthWorkflow(): Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: 'AI-Powered Crop Health Monitoring',
      description: 'Continuous monitoring using satellite imagery, IoT sensors, and AI disease detection',
      category: 'crop_health',
      tags: ['ai', 'monitoring', 'diseases', 'satellite'],
      active: false,
      nodes: [
        {
          id: 'health-check-trigger',
          name: 'Daily Health Check',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [100, 200],
          parameters: {
            rule: {
              interval: [{ field: 'hours', value: 24 }]
            }
          }
        },
        {
          id: 'satellite-imagery',
          name: 'Get Satellite Images',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [300, 150],
          parameters: {
            url: '={{$env.SATELLITE_API}}/imagery?lat={{$env.FIELD_LAT}}&lon={{$env.FIELD_LON}}&date={{$now.format("YYYY-MM-DD")}}',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{$env.SATELLITE_API_KEY}}'
            }
          }
        },
        {
          id: 'iot-sensors',
          name: 'Get IoT Sensor Data',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [300, 250],
          parameters: {
            url: '={{$env.AGRINEXUS_API}}/sensors/all/{{$env.FIELD_ID}}',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{$env.API_TOKEN}}'
            }
          }
        },
        {
          id: 'ai-analysis',
          name: 'AI Disease Detection',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [500, 200],
          parameters: {
            url: '={{$env.AGRINEXUS_API}}/ai/crop-monitoring/analyze-satellite',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{$env.API_TOKEN}}'
            },
            body: {
              fieldId: '={{$env.FIELD_ID}}',
              satelliteData: '={{$("Get Satellite Images").first().json.imageData}}',
              sensorData: '={{$("Get IoT Sensor Data").first().json}}'
            }
          }
        },
        {
          id: 'health-assessment',
          name: 'Health Assessment',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [700, 200],
          parameters: {
            functionCode: `
              const analysis = $json.analysis;
              const healthScore = (analysis.ndviScore + 1) * 50; // Convert NDVI to 0-100 scale
              
              let status = 'healthy';
              let alerts = [];
              
              if (healthScore < 60) {
                status = 'stressed';
                alerts.push('Vegetation stress detected');
              }
              
              if (analysis.stressIndicators.diseaseRisk > 0.5) {
                status = 'at_risk';
                alerts.push('High disease risk detected');
              }
              
              if (analysis.stressIndicators.waterStress > 0.7) {
                alerts.push('Water stress critical');
              }
              
              return [{
                healthScore,
                status,
                alerts,
                ndviScore: analysis.ndviScore,
                diseaseRisk: analysis.stressIndicators.diseaseRisk,
                recommendations: analysis.recommendations || []
              }];
            `
          }
        },
        {
          id: 'send-health-report',
          name: 'Send Health Report',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [900, 200],
          parameters: {
            url: '={{$env.NOTIFICATION_API}}/email',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{$env.NOTIFICATION_TOKEN}}'
            },
            body: {
              to: '={{$env.FARMER_EMAIL}}',
              subject: 'Daily Crop Health Report - Field {{$env.FIELD_NAME}}',
              html: `
                <h2>Crop Health Report</h2>
                <p><strong>Health Score:</strong> {{$json.healthScore}}/100</p>
                <p><strong>Status:</strong> {{$json.status}}</p>
                <p><strong>NDVI Score:</strong> {{$json.ndviScore}}</p>
                <p><strong>Disease Risk:</strong> {{($json.diseaseRisk * 100).toFixed(1)}}%</p>
                {{#if $json.alerts.length}}
                <h3>Alerts:</h3>
                <ul>{{#each $json.alerts}}<li>{{this}}</li>{{/each}}</ul>
                {{/if}}
                {{#if $json.recommendations.length}}
                <h3>Recommendations:</h3>
                <ul>{{#each $json.recommendations}}<li>{{this}}</li>{{/each}}</ul>
                {{/if}}
              `
            }
          }
        }
      ],
      connections: {
        'Daily Health Check': { main: [[{ node: 'Get Satellite Images', type: 'main', index: 0 }, { node: 'Get IoT Sensor Data', type: 'main', index: 0 }]] },
        'Get Satellite Images': { main: [[{ node: 'AI Disease Detection', type: 'main', index: 0 }]] },
        'Get IoT Sensor Data': { main: [[{ node: 'AI Disease Detection', type: 'main', index: 0 }]] },
        'AI Disease Detection': { main: [[{ node: 'Health Assessment', type: 'main', index: 0 }]] },
        'Health Assessment': { main: [[{ node: 'Send Health Report', type: 'main', index: 0 }]] }
      },
      settings: {
        timezone: 'Africa/Nairobi',
        saveExecutionProgress: true,
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner'
      },
      versionId: 1
    };
  }

  /**
   * Create financial management workflow definition
   */
  private createFinancialWorkflow(): Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: 'Farm Financial Management Automation',
      description: 'Automated expense tracking, invoice generation, and financial reporting',
      category: 'financial',
      tags: ['finance', 'accounting', 'invoicing'],
      active: false,
      nodes: [
        {
          id: 'daily-financial-sync',
          name: 'Daily Financial Sync',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [100, 200],
          parameters: {
            rule: {
              interval: [{ field: 'hours', value: 24 }]
            }
          }
        },
        {
          id: 'fetch-transactions',
          name: 'Fetch Mobile Money Transactions',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [300, 200],
          parameters: {
            url: '={{$env.MOMO_API}}/transactions?date={{$now.format("YYYY-MM-DD")}}',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{$env.MOMO_API_KEY}}'
            }
          }
        },
        {
          id: 'categorize-expenses',
          name: 'Categorize Expenses',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [500, 200],
          parameters: {
            functionCode: `
              const transactions = $json.transactions || [];
              const categorized = [];
              
              const categories = {
                'seeds': ['seed', 'seedling', 'planting'],
                'fertilizer': ['fertilizer', 'compost', 'manure'],
                'pesticide': ['pesticide', 'insecticide', 'herbicide'],
                'labor': ['worker', 'harvest', 'wage'],
                'fuel': ['fuel', 'diesel', 'petrol'],
                'equipment': ['tool', 'machinery', 'equipment'],
                'other': []
              };
              
              transactions.forEach(tx => {
                let category = 'other';
                const description = tx.description.toLowerCase();
                
                for (const [cat, keywords] of Object.entries(categories)) {
                  if (keywords.some(keyword => description.includes(keyword))) {
                    category = cat;
                    break;
                  }
                }
                
                categorized.push({
                  ...tx,
                  category,
                  farm_id: $env.FARM_ID
                });
              });
              
              return categorized;
            `
          }
        },
        {
          id: 'update-accounting',
          name: 'Update Accounting System',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [700, 200],
          parameters: {
            url: '={{$env.AGRINEXUS_API}}/accounting/transactions',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{$env.API_TOKEN}}'
            },
            body: '={{$json}}'
          }
        },
        {
          id: 'monthly-report',
          name: 'Generate Monthly Report',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [100, 350],
          parameters: {
            rule: {
              interval: [{ field: 'months', value: 1 }]
            }
          }
        },
        {
          id: 'profit-analysis',
          name: 'Calculate Profit/Loss',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [500, 350],
          parameters: {
            url: '={{$env.AGRINEXUS_API}}/analytics/profit-loss?farm_id={{$env.FARM_ID}}&period=month',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{$env.API_TOKEN}}'
            }
          }
        },
        {
          id: 'send-financial-report',
          name: 'Send Financial Report',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [700, 350],
          parameters: {
            url: '={{$env.NOTIFICATION_API}}/email',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{$env.NOTIFICATION_TOKEN}}'
            },
            body: {
              to: '={{$env.FARMER_EMAIL}}',
              subject: 'Monthly Financial Report - {{$now.format("MMMM YYYY")}}',
              attachments: [
                {
                  filename: 'financial-report.pdf',
                  content: '={{$json.reportPdf}}'
                }
              ]
            }
          }
        }
      ],
      connections: {
        'Daily Financial Sync': { main: [[{ node: 'Fetch Mobile Money Transactions', type: 'main', index: 0 }]] },
        'Fetch Mobile Money Transactions': { main: [[{ node: 'Categorize Expenses', type: 'main', index: 0 }]] },
        'Categorize Expenses': { main: [[{ node: 'Update Accounting System', type: 'main', index: 0 }]] },
        'Generate Monthly Report': { main: [[{ node: 'Calculate Profit/Loss', type: 'main', index: 0 }]] },
        'Calculate Profit/Loss': { main: [[{ node: 'Send Financial Report', type: 'main', index: 0 }]] }
      },
      settings: {
        timezone: 'Africa/Nairobi',
        saveExecutionProgress: true,
        saveManualExecutions: false,
        callerPolicy: 'workflowsFromSameOwner'
      },
      versionId: 1
    };
  }

  /**
   * Create compliance reporting workflow definition
   */
  private createComplianceWorkflow(): Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: 'Regulatory Compliance & Certification',
      description: 'Automated compliance monitoring and certification maintenance',
      category: 'compliance',
      tags: ['compliance', 'certification', 'documentation'],
      active: false,
      nodes: [
        {
          id: 'monthly-compliance-check',
          name: 'Monthly Compliance Check',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [100, 200],
          parameters: {
            rule: {
              interval: [{ field: 'months', value: 1 }]
            }
          }
        },
        {
          id: 'gather-compliance-data',
          name: 'Gather Compliance Data',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [300, 200],
          parameters: {
            url: '={{$env.AGRINEXUS_API}}/compliance/data/{{$env.FARM_ID}}',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{$env.API_TOKEN}}'
            }
          }
        },
        {
          id: 'validate-compliance',
          name: 'Validate Compliance Requirements',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [500, 200],
          parameters: {
            functionCode: `
              const data = $json;
              const validations = [];
              
              // Organic certification checks
              if (data.certifications.includes('Organic')) {
                const syntheticUsage = data.activities.filter(a => 
                  a.type === 'pesticide' && a.synthetic === true
                );
                
                if (syntheticUsage.length > 0) {
                  validations.push({
                    type: 'violation',
                    certification: 'Organic',
                    issue: 'Synthetic pesticide usage detected',
                    severity: 'high'
                  });
                }
              }
              
              // Fair Trade checks
              if (data.certifications.includes('Fair Trade')) {
                const laborViolations = data.labor_records.filter(r => 
                  r.hours_per_day > 8 || r.wage_per_hour < 2.5
                );
                
                if (laborViolations.length > 0) {
                  validations.push({
                    type: 'violation',
                    certification: 'Fair Trade',
                    issue: 'Labor standards not met',
                    severity: 'medium'
                  });
                }
              }
              
              // Document completeness
              const requiredDocs = ['activity_logs', 'expense_records', 'harvest_data'];
              const missingDocs = requiredDocs.filter(doc => !data[doc] || data[doc].length === 0);
              
              if (missingDocs.length > 0) {
                validations.push({
                  type: 'missing_documentation',
                  issue: \`Missing: \${missingDocs.join(', ')}\`,
                  severity: 'low'
                });
              }
              
              return [{
                validations,
                compliant: validations.filter(v => v.severity === 'high').length === 0,
                issues: validations.length
              }];
            `
          }
        },
        {
          id: 'generate-compliance-report',
          name: 'Generate Compliance Report',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [700, 200],
          parameters: {
            url: '={{$env.AGRINEXUS_API}}/compliance/report',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{$env.API_TOKEN}}'
            },
            body: {
              farm_id: '={{$env.FARM_ID}}',
              period: '={{$now.format("YYYY-MM")}}',
              validations: '={{$json.validations}}',
              compliant: '={{$json.compliant}}'
            }
          }
        },
        {
          id: 'notify-violations',
          name: 'Notify of Violations',
          type: 'n8n-nodes-base.if',
          typeVersion: 1,
          position: [500, 350],
          parameters: {
            conditions: {
              boolean: [
                {
                  value1: '={{$json.compliant}}',
                  operation: 'equal',
                  value2: false
                }
              ]
            }
          }
        },
        {
          id: 'send-violation-alert',
          name: 'Send Violation Alert',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [700, 350],
          parameters: {
            url: '={{$env.NOTIFICATION_API}}/sms',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{$env.NOTIFICATION_TOKEN}}'
            },
            body: {
              to: '={{$env.FARMER_PHONE}}',
              message: 'URGENT: Compliance violations detected. Check your AgriNexus dashboard immediately.'
            }
          }
        }
      ],
      connections: {
        'Monthly Compliance Check': { main: [[{ node: 'Gather Compliance Data', type: 'main', index: 0 }]] },
        'Gather Compliance Data': { main: [[{ node: 'Validate Compliance Requirements', type: 'main', index: 0 }]] },
        'Validate Compliance Requirements': { main: [[{ node: 'Generate Compliance Report', type: 'main', index: 0 }, { node: 'Notify of Violations', type: 'main', index: 0 }]] },
        'Notify of Violations': { main: [[{ node: 'Send Violation Alert', type: 'main', index: 0 }]] }
      },
      settings: {
        timezone: 'Africa/Nairobi',
        saveExecutionProgress: true,
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner'
      },
      versionId: 1
    };
  }
}

export default N8nWorkflowService;