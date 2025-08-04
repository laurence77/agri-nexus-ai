import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  Zap,
  Play,
  Pause,
  Settings,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  Eye,
  BarChart3,
  Calendar,
  Bell,
  Droplets,
  TrendingUp,
  Shield,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Workflow,
  Edit,
  Star,
  Filter,
  Search,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { WorkflowTemplate, WorkflowDefinition, WorkflowExecution } from '@/services/automation/n8n-workflow-service';

interface WorkflowBuilderProps {
  onWorkflowCreate?: (workflow: WorkflowDefinition) => void;
  onWorkflowExecute?: (workflowId: string) => void;
  farmId: string;
  fieldIds?: string[];
  className?: string;
}

interface WorkflowCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  templates: number;
}

/**
 * Workflow Builder Component
 * Visual workflow creation and management interface for agricultural automation
 */
export function WorkflowBuilder({ 
  onWorkflowCreate,
  onWorkflowExecute,
  farmId,
  fieldIds = [],
  className 
}: WorkflowBuilderProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'my-workflows' | 'analytics'>('templates');

  const categories: WorkflowCategory[] = [
    {
      id: 'irrigation',
      name: 'Smart Irrigation',
      description: 'Automated watering systems with weather integration',
      icon: Droplets,
      color: 'text-blue-400',
      templates: 8
    },
    {
      id: 'market_intelligence',
      name: 'Market Intelligence',
      description: 'Price monitoring and market analysis automation',
      icon: TrendingUp,
      color: 'text-green-400',
      templates: 6
    },
    {
      id: 'crop_health',
      name: 'Crop Health',
      description: 'AI-powered monitoring and disease detection',
      icon: Shield,
      color: 'text-purple-400',
      templates: 12
    },
    {
      id: 'financial',
      name: 'Financial Management',
      description: 'Automated accounting and expense tracking',
      icon: DollarSign,
      color: 'text-yellow-400',
      templates: 5
    },
    {
      id: 'compliance',
      name: 'Compliance & Reporting',
      description: 'Regulatory compliance and certification maintenance',
      icon: FileText,
      color: 'text-red-400',
      templates: 4
    }
  ];

  useEffect(() => {
    loadTemplates();
    loadWorkflows();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // Mock templates - in production, fetch from n8n service
      const mockTemplates: WorkflowTemplate[] = [
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
          workflow: {} as any, // Simplified for display
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
          workflow: {} as any,
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
          workflow: {} as any,
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
          workflow: {} as any,
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
          workflow: {} as any,
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

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      // Mock user workflows - in production, fetch from n8n service
      const mockWorkflows: WorkflowDefinition[] = [
        {
          id: 'workflow_001',
          name: 'My Smart Irrigation System',
          description: 'Custom irrigation workflow for Field A',
          category: 'irrigation',
          tags: ['irrigation', 'field-a'],
          active: true,
          nodes: [],
          connections: [],
          settings: {
            timezone: 'Africa/Nairobi',
            saveExecutionProgress: true,
            saveManualExecutions: true,
            callerPolicy: 'workflowsFromSameOwner'
          },
          versionId: 1,
          createdAt: new Date('2024-07-01'),
          updatedAt: new Date('2024-07-20')
        }
      ];

      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'text-green-400 bg-green-400/20' : 'text-gray-400 bg-gray-400/20';
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleCreateFromTemplate = async (template: WorkflowTemplate) => {
    try {
      // In production, call n8n workflow service
      console.log('Creating workflow from template:', template.id);
      
      const newWorkflow: WorkflowDefinition = {
        ...template.workflow,
        id: `workflow_${Date.now()}`,
        name: `My ${template.name}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setWorkflows([...workflows, newWorkflow]);
      
      if (onWorkflowCreate) {
        onWorkflowCreate(newWorkflow);
      }

      setShowTemplateDetails(false);
      setActiveTab('my-workflows');
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const handleExecuteWorkflow = (workflowId: string) => {
    if (onWorkflowExecute) {
      onWorkflowExecute(workflowId);
    }
  };

  const renderTemplateCard = (template: WorkflowTemplate) => (
    <GlassCard
      key={template.id}
      className="overflow-hidden cursor-pointer transition-all hover:scale-105"
      onClick={() => {
        setSelectedTemplate(template);
        setShowTemplateDetails(true);
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', 
              categories.find(c => c.id === template.category)?.color.replace('text-', 'bg-').replace('-400', '-400/20') || 'bg-gray-400/20'
            )}>
              {React.createElement(
                categories.find(c => c.id === template.category)?.icon || Workflow,
                { className: cn('h-5 w-5', categories.find(c => c.id === template.category)?.color || 'text-gray-400') }
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{template.name}</h3>
              <p className="text-gray-300 text-sm">by {template.author}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">{template.rating}</span>
            </div>
            <div className={cn('px-2 py-1 rounded-full text-xs font-medium', getDifficultyColor(template.difficulty))}>
              {template.difficulty}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{template.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-gray-400 text-xs">+{template.tags.length - 3} more</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Download className="h-3 w-3" />
              <span>{template.downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{template.estimatedSetupTime}min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{template.reviews}</span>
            </div>
          </div>
        </div>

        {/* Benefits Preview */}
        <div className="space-y-1 mb-4">
          {template.benefits.slice(0, 2).map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
              <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action */}
        <GlassButton
          variant="primary"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            handleCreateFromTemplate(template);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Use Template
        </GlassButton>
      </div>
    </GlassCard>
  );

  const renderWorkflowCard = (workflow: WorkflowDefinition) => (
    <GlassCard key={workflow.id} className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Workflow className="h-5 w-5 text-blue-400" />
            <span>{workflow.name}</span>
          </h3>
          <p className="text-gray-300 text-sm mt-1">{workflow.description}</p>
        </div>
        
        <div className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(workflow.active))}>
          {workflow.active ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>Created {workflow.createdAt.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Eye className="h-3 w-3" />
          <span>v{workflow.versionId}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <GlassButton
          variant={workflow.active ? "secondary" : "primary"}
          size="sm"
          onClick={() => {
            // Toggle workflow active state
            console.log('Toggle workflow:', workflow.id);
          }}
        >
          {workflow.active ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {workflow.active ? 'Pause' : 'Activate'}
        </GlassButton>

        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => handleExecuteWorkflow(workflow.id)}
        >
          <Play className="h-4 w-4 mr-2" />
          Run Now
        </GlassButton>

        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => console.log('Edit workflow:', workflow.id)}
        >
          <Edit className="h-4 w-4" />
        </GlassButton>

        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => console.log('Analytics for:', workflow.id)}
        >
          <BarChart3 className="h-4 w-4" />
        </GlassButton>
      </div>
    </GlassCard>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Zap className="h-6 w-6 text-purple-400" />
            <span>Workflow Automation</span>
          </h2>
          <p className="text-gray-300 mt-1">Automate your farm operations with intelligent workflows</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
          </div>

          <GlassButton variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Custom
          </GlassButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
        {[
          { id: 'templates', label: 'Templates', icon: Download },
          { id: 'my-workflows', label: 'My Workflows', icon: Workflow },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <>
          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedCategory === 'all'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
              )}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
                  selectedCategory === category.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                )}
              >
                <category.icon className={cn('h-4 w-4', category.color)} />
                <span>{category.name}</span>
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {category.templates}
                </span>
              </button>
            ))}
          </div>

          {/* Template Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4" />
              <p className="text-gray-300">Loading workflow templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => renderTemplateCard(template))}
            </div>
          )}
        </>
      )}

      {/* My Workflows Tab */}
      {activeTab === 'my-workflows' && (
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Workflow className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-lg font-semibold text-white mb-2">No Workflows Yet</h3>
              <p className="text-gray-300 mb-6">Create your first automated workflow from our templates</p>
              <GlassButton 
                variant="primary"
                onClick={() => setActiveTab('templates')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Browse Templates
              </GlassButton>
            </GlassCard>
          ) : (
            workflows.map(workflow => renderWorkflowCard(workflow))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {workflows.filter(w => w.active).length}
            </div>
            <div className="text-gray-300">Active Workflows</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">247</div>
            <div className="text-gray-300">Total Executions</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">94.2%</div>
            <div className="text-gray-300">Success Rate</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">12.5h</div>
            <div className="text-gray-300">Time Saved</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">$1,250</div>
            <div className="text-gray-300">Cost Savings</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">85%</div>
            <div className="text-gray-300">Automation Rate</div>
          </GlassCard>
        </div>
      )}

      {/* Template Details Modal */}
      {showTemplateDetails && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <GlassCard className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center',
                    categories.find(c => c.id === selectedTemplate.category)?.color.replace('text-', 'bg-').replace('-400', '-400/20') || 'bg-gray-400/20'
                  )}>
                    {React.createElement(
                      categories.find(c => c.id === selectedTemplate.category)?.icon || Workflow,
                      { className: cn('h-6 w-6', categories.find(c => c.id === selectedTemplate.category)?.color || 'text-gray-400') }
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedTemplate.name}</h2>
                    <p className="text-gray-300">by {selectedTemplate.author} • v{selectedTemplate.version}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowTemplateDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-400">{selectedTemplate.rating}</div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{selectedTemplate.downloads.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{selectedTemplate.estimatedSetupTime}min</div>
                  <div className="text-xs text-gray-400">Setup Time</div>
                </div>
                <div className="text-center">
                  <div className={cn('text-xl font-bold', getDifficultyColor(selectedTemplate.difficulty).split(' ')[0])}>
                    {selectedTemplate.difficulty}
                  </div>
                  <div className="text-xs text-gray-400">Difficulty</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300">{selectedTemplate.description}</p>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedTemplate.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedTemplate.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-6 border-t border-white/20">
                <GlassButton
                  variant="primary"
                  onClick={() => handleCreateFromTemplate(selectedTemplate)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  onClick={() => console.log('Preview template:', selectedTemplate.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  onClick={() => console.log('View documentation:', selectedTemplate.id)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowBuilder;