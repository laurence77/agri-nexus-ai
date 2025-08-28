import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  CheckSquare, 
  Square,
  Plus,
  Edit,
  Trash2,
  Copy,
  Upload,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  MapPin,
  Calendar,
  Camera,
  FileText,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  type: 'checkbox' | 'text' | 'number' | 'photo' | 'signature' | 'location' | 'date';
  required: boolean;
  completed: boolean;
  value?: unknown;
  options?: string[]; // For dropdown/select items
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: 'farmer_onboarding' | 'farm_inspection' | 'livestock_check' | 'crop_survey' | 'training' | 'custom';
  tasks: TaskItem[];
  estimatedTime: number; // in minutes
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
}

interface ChecklistInstance {
  id: string;
  templateId: string;
  templateName: string;
  assignedTo: string;
  farmerInfo?: {
    id: string;
    name: string;
    phone: string;
    location: string;
  };
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  dueDate?: Date;
  tasks: TaskItem[];
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

const defaultTemplates: ChecklistTemplate[] = [
  {
    id: 'farmer_onboarding',
    name: 'Farmer Registration',
    description: 'Complete farmer onboarding and KYC process',
    category: 'farmer_onboarding',
    estimatedTime: 30,
    createdBy: 'system',
    createdAt: new Date(),
    isPublic: true,
    tasks: [
      {
        id: '1',
        title: 'Collect Personal Information',
        description: 'Full name, phone number, ID verification',
        type: 'checkbox',
        required: true,
        completed: false
      },
      {
        id: '2',
        title: 'Take Profile Photo',
        type: 'photo',
        required: true,
        completed: false
      },
      {
        id: '3',
        title: 'Record GPS Location',
        type: 'location',
        required: true,
        completed: false
      },
      {
        id: '4',
        title: 'Farm Size',
        description: 'Total land size in hectares',
        type: 'number',
        required: true,
        completed: false,
        validation: { min: 0.1, max: 1000 }
      },
      {
        id: '5',
        title: 'Main Crops',
        description: 'List primary crops grown',
        type: 'text',
        required: true,
        completed: false
      },
      {
        id: '6',
        title: 'Bank Account Details',
        description: 'Account number and bank name',
        type: 'text',
        required: false,
        completed: false
      },
      {
        id: '7',
        title: 'Signature',
        description: 'Digital signature for consent',
        type: 'signature',
        required: true,
        completed: false
      }
    ]
  },
  {
    id: 'farm_inspection',
    name: 'Farm Inspection',
    description: 'Comprehensive farm assessment and documentation',
    category: 'farm_inspection',
    estimatedTime: 45,
    createdBy: 'system',
    createdAt: new Date(),
    isPublic: true,
    tasks: [
      {
        id: '1',
        title: 'Verify Farm Location',
        type: 'location',
        required: true,
        completed: false
      },
      {
        id: '2',
        title: 'Farm Boundary Photos',
        description: 'Take photos of all four boundaries',
        type: 'photo',
        required: true,
        completed: false
      },
      {
        id: '3',
        title: 'Soil Quality Assessment',
        description: 'Visual inspection of soil condition',
        type: 'text',
        required: true,
        completed: false
      },
      {
        id: '4',
        title: 'Water Source Availability',
        type: 'checkbox',
        required: true,
        completed: false
      },
      {
        id: '5',
        title: 'Current Crop Status',
        description: 'Growth stage and health assessment',
        type: 'text',
        required: true,
        completed: false
      },
      {
        id: '6',
        title: 'Infrastructure Check',
        description: 'Storage facilities, equipment, etc.',
        type: 'text',
        required: false,
        completed: false
      },
      {
        id: '7',
        title: 'Pest/Disease Issues',
        description: 'Document any visible problems',
        type: 'text',
        required: false,
        completed: false
      }
    ]
  }
];

export function TaskChecklistSystem() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(defaultTemplates);
  const [instances, setInstances] = useState<ChecklistInstance[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'instances' | 'create'>('instances');
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<ChecklistInstance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load templates
      const storedTemplates = localStorage.getItem('checklist_templates');
      if (storedTemplates) {
        const parsed: unknown = JSON.parse(storedTemplates);
        const loadedTemplates: ChecklistTemplate[] = Array.isArray(parsed)
          ? (parsed as ChecklistTemplate[]).map((template) => ({
              ...template,
              createdAt: new Date(template.createdAt)
            }))
          : [];
        setTemplates([...defaultTemplates, ...loadedTemplates]);
      }

      // Load instances
      const storedInstances = localStorage.getItem('checklist_instances');
      if (storedInstances) {
        const parsed: unknown = JSON.parse(storedInstances);
        const loadedInstances: ChecklistInstance[] = Array.isArray(parsed)
          ? (parsed as ChecklistInstance[]).map((instance) => ({
              ...instance,
              startedAt: instance.startedAt ? new Date(instance.startedAt) : undefined,
              completedAt: instance.completedAt ? new Date(instance.completedAt) : undefined,
              dueDate: instance.dueDate ? new Date(instance.dueDate) : undefined
            }))
          : [];
        setInstances(loadedInstances);
      }
    } catch (error) {
      console.error('Error loading checklist data:', error);
    }
  };

  const saveTemplates = (templateList: ChecklistTemplate[]) => {
    try {
      const customTemplates = templateList.filter(t => !defaultTemplates.find(dt => dt.id === t.id));
      localStorage.setItem('checklist_templates', JSON.stringify(customTemplates));
      setTemplates(templateList);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  const saveInstances = (instanceList: ChecklistInstance[]) => {
    try {
      localStorage.setItem('checklist_instances', JSON.stringify(instanceList));
      setInstances(instanceList);
    } catch (error) {
      console.error('Error saving instances:', error);
    }
  };

  const createInstanceFromTemplate = (template: ChecklistTemplate, farmerInfo?: ChecklistInstance['farmerInfo']) => {
    const instance: ChecklistInstance = {
      id: `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      templateName: template.name,
      assignedTo: 'current_agent', // Would come from auth context
      status: 'assigned',
      progress: 0,
      tasks: template.tasks.map(task => ({ ...task, completed: false, value: undefined })),
      farmerInfo,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours
    };

    const updatedInstances = [...instances, instance];
    saveInstances(updatedInstances);
    setSelectedInstance(instance);
    setActiveTab('instances');
  };

  const updateInstance = (instanceId: string, updates: Partial<ChecklistInstance>) => {
    const updatedInstances = instances.map(instance => {
      if (instance.id === instanceId) {
        const updatedInstance = { ...instance, ...updates };
        
        // Calculate progress
        const completedTasks = updatedInstance.tasks.filter(task => task.completed).length;
        updatedInstance.progress = Math.round((completedTasks / updatedInstance.tasks.length) * 100);
        
        // Update status based on progress
        if (updatedInstance.progress === 100 && updatedInstance.status !== 'completed') {
          updatedInstance.status = 'completed';
          updatedInstance.completedAt = new Date();
        } else if (updatedInstance.progress > 0 && updatedInstance.status === 'assigned') {
          updatedInstance.status = 'in_progress';
          updatedInstance.startedAt = new Date();
        }

        return updatedInstance;
      }
      return instance;
    });

    saveInstances(updatedInstances);
    
    // Update selected instance if it's the one being updated
    if (selectedInstance?.id === instanceId) {
      setSelectedInstance(updatedInstances.find(i => i.id === instanceId) || null);
    }
  };

  const updateTaskInInstance = (instanceId: string, taskId: string, updates: Partial<TaskItem>) => {
    const instance = instances.find(i => i.id === instanceId);
    if (!instance) return;

    const updatedTasks = instance.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );

    updateInstance(instanceId, { tasks: updatedTasks });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Square className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInstances = instances.filter(instance => {
    const matchesSearch = 
      instance.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.farmerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || instance.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderTaskInput = (task: TaskItem, instanceId: string) => {
    switch (task.type) {
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateTaskInInstance(instanceId, task.id, { completed: !task.completed })}
              className="flex-shrink-0"
            >
              {task.completed ? (
                <CheckSquare className="h-5 w-5 text-green-500" />
              ) : (
                <Square className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <span className={task.completed ? 'line-through text-gray-500' : ''}>
              {task.title}
            </span>
          </div>
        );
      
      case 'text':
        return (
          <div>
            <Label>{task.title}</Label>
            <Input
              value={task.value || ''}
              onChange={(e) => {
                updateTaskInInstance(instanceId, task.id, { 
                  value: e.target.value,
                  completed: e.target.value.length > 0
                });
              }}
              placeholder={task.description}
              className={task.completed ? 'bg-green-50 border-green-200' : ''}
            />
          </div>
        );
      
      case 'number':
        return (
          <div>
            <Label>{task.title}</Label>
            <Input
              type="number"
              value={task.value || ''}
              min={task.validation?.min}
              max={task.validation?.max}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateTaskInInstance(instanceId, task.id, { 
                  value,
                  completed: !isNaN(value)
                });
              }}
              placeholder={task.description}
              className={task.completed ? 'bg-green-50 border-green-200' : ''}
            />
          </div>
        );
      
      case 'photo':
        return (
          <div>
            <Label>{task.title}</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Simulate photo capture
                  updateTaskInInstance(instanceId, task.id, { 
                    value: `photo_${Date.now()}.jpg`,
                    completed: true
                  });
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                {task.completed ? 'Retake Photo' : 'Take Photo'}
              </Button>
              {task.completed && (
                <Badge className="bg-green-100 text-green-800">
                  Photo captured
                </Badge>
              )}
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div>
            <Label>{task.title}</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        updateTaskInInstance(instanceId, task.id, { 
                          value: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                          },
                          completed: true
                        });
                      },
                      (error) => {
                        console.error('Error getting location:', error);
                      }
                    );
                  }
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {task.completed ? 'Update Location' : 'Get Location'}
              </Button>
              {task.completed && task.value && (
                <Badge className="bg-green-100 text-green-800">
                  {task.value.latitude?.toFixed(6)}, {task.value.longitude?.toFixed(6)}
                </Badge>
              )}
            </div>
          </div>
        );
      
      case 'date':
        return (
          <div>
            <Label>{task.title}</Label>
            <Input
              type="date"
              value={task.value || ''}
              onChange={(e) => {
                updateTaskInInstance(instanceId, task.id, { 
                  value: e.target.value,
                  completed: e.target.value.length > 0
                });
              }}
              className={task.completed ? 'bg-green-50 border-green-200' : ''}
            />
          </div>
        );
      
      case 'signature':
        return (
          <div>
            <Label>{task.title}</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Simulate signature capture
                  updateTaskInInstance(instanceId, task.id, { 
                    value: `signature_${Date.now()}.png`,
                    completed: true
                  });
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                {task.completed ? 'Update Signature' : 'Capture Signature'}
              </Button>
              {task.completed && (
                <Badge className="bg-green-100 text-green-800">
                  Signature captured
                </Badge>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (selectedInstance) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedInstance.templateName}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={getStatusColor(selectedInstance.status)}>
                  {selectedInstance.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-gray-600">
                  Progress: {selectedInstance.progress}%
                </span>
                {selectedInstance.farmerInfo && (
                  <span className="text-sm text-gray-600">
                    Farmer: {selectedInstance.farmerInfo.name}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedInstance(null)}>
              Back to List
            </Button>
          </div>

          <div className="mb-6">
            <Progress value={selectedInstance.progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedInstance.tasks.map((task, index) => (
                  <div key={task.id} className={`p-4 border rounded-lg ${task.completed ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          task.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          {task.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}
                        {renderTaskInput(task, selectedInstance.id)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                  value={selectedInstance.notes || ''}
                  onChange={(e) => updateInstance(selectedInstance.id, { notes: e.target.value })}
                  placeholder="Add any additional notes or observations..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedInstance(null)}>
                  Save & Close
                </Button>
                {selectedInstance.progress === 100 && (
                  <Button 
                    onClick={() => updateInstance(selectedInstance.id, { status: 'completed' })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Checklist
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Checklist System</h1>
        <p className="text-gray-600">Manage field work templates and track completion</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant={activeTab === 'instances' ? 'default' : 'outline'}
          onClick={() => setActiveTab('instances')}
        >
          Active Tasks ({instances.filter(i => i.status !== 'completed').length})
        </Button>
        <Button 
          variant={activeTab === 'templates' ? 'default' : 'outline'}
          onClick={() => setActiveTab('templates')}
        >
          Templates ({templates.length})
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder={activeTab === 'instances' ? "Search tasks..." : "Search templates..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {activeTab === 'instances' ? (
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            ) : (
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="farmer_onboarding">Farmer Onboarding</option>
                <option value="farm_inspection">Farm Inspection</option>
                <option value="livestock_check">Livestock Check</option>
                <option value="crop_survey">Crop Survey</option>
                <option value="training">Training</option>
                <option value="custom">Custom</option>
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {activeTab === 'instances' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstances.map((instance) => (
            <Card key={instance.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6" onClick={() => setSelectedInstance(instance)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(instance.status)}
                    <h3 className="font-semibold">{instance.templateName}</h3>
                  </div>
                  <Badge className={getStatusColor(instance.status)}>
                    {instance.status.replace('_', ' ')}
                  </Badge>
                </div>

                {instance.farmerInfo && (
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {instance.farmerInfo.name}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {instance.farmerInfo.location}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{instance.progress}%</span>
                  </div>
                  <Progress value={instance.progress} className="h-2" />
                </div>

                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {instance.dueDate && (
                      <span>Due: {instance.dueDate.toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {instance.completedAt ? `Completed ${instance.completedAt.toLocaleDateString()}` :
                       instance.startedAt ? `Started ${instance.startedAt.toLocaleDateString()}` :
                       'Not started'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredInstances.length === 0 && (
            <div className="col-span-full text-center py-12">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active tasks found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create tasks from templates to get started
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {template.estimatedTime} min
                      </span>
                      <span>{template.tasks.length} tasks</span>
                      <Badge variant="outline" className="text-xs">
                        {template.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Tasks:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {template.tasks.slice(0, 3).map((task) => (
                      <li key={task.id} className="flex items-center gap-2">
                        <Square className="h-3 w-3" />
                        {task.title}
                        {task.required && <span className="text-red-500">*</span>}
                      </li>
                    ))}
                    {template.tasks.length > 3 && (
                      <li className="text-gray-500">
                        +{template.tasks.length - 3} more tasks...
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => createInstanceFromTemplate(template)}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No templates found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create custom templates for your specific workflows
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskChecklistSystem;
