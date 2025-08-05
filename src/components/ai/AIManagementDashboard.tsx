import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Bot, 
  Brain, 
  Zap, 
  TrendingUp, 
  Settings, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  Lightbulb,
  Shield,
  Cpu,
  Database
} from 'lucide-react'
import AIOrchestrator, { AIAgent, AIAgentType, AITask, AIInsight } from '@/services/ai/AIOrchestrator'

interface AIMetrics {
  totalAgents: number
  activeAgents: number
  totalTasks: number
  completedTasks: number
  averageConfidence: number
  averageResponseTime: number
}

const AIManagementDashboard: React.FC = () => {
  const [orchestrator] = useState(() => new AIOrchestrator())
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [tasks, setTasks] = useState<AITask[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [metrics, setMetrics] = useState<AIMetrics>({
    totalAgents: 0,
    activeAgents: 0,
    totalTasks: 0,
    completedTasks: 0,
    averageConfidence: 0,
    averageResponseTime: 0
  })
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    // Set up event listeners
    orchestrator.on('orchestrator:initialized', () => {
      refreshData()
      setIsInitializing(false)
    })

    orchestrator.on('agent:initialized', () => refreshData())
    orchestrator.on('task:completed', () => refreshData())
    orchestrator.on('insight:generated', () => refreshData())

    return () => {
      orchestrator.removeAllListeners()
    }
  }, [orchestrator])

  const refreshData = async () => {
    setAgents(orchestrator.getAgents())
    setTasks(orchestrator.getTasks())
    setInsights(orchestrator.getInsights())
    
    const newMetrics = await orchestrator.getPerformanceMetrics()
    setMetrics(newMetrics)
  }

  const initializeAI = async () => {
    setIsInitializing(true)
    try {
      await orchestrator.initialize()
    } catch (error) {
      console.error('Failed to initialize AI:', error)
      setIsInitializing(false)
    }
  }

  const connectAgentToFarm = async (agentId: string, farmId: string = 'farm-001') => {
    try {
      await orchestrator.connectAgentToFarm(agentId, farmId)
      refreshData()
    } catch (error) {
      console.error('Failed to connect agent:', error)
    }
  }

  const submitTestTask = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return

    const taskTypes = {
      [AIAgentType.FARM_MANAGER]: 'crop_planning',
      [AIAgentType.VET_ASSISTANT]: 'health_assessment',
      [AIAgentType.SALES_AGENT]: 'market_analysis',
      [AIAgentType.DATA_ANALYST]: 'performance_analysis',
      [AIAgentType.AUTOMATION_CONTROLLER]: 'workflow_optimization',
      [AIAgentType.TRANSACTION_ANALYZER]: 'financial_analysis',
      [AIAgentType.COMMUNICATION_MONITOR]: 'message_analysis',
      [AIAgentType.COMPETITIVE_INTELLIGENCE]: 'market_research'
    }

    try {
      await orchestrator.submitTask({
        agentId,
        type: taskTypes[agent.type] || 'general_task',
        priority: 'medium',
        payload: { test: true, timestamp: new Date() }
      })
      refreshData()
    } catch (error) {
      console.error('Failed to submit task:', error)
    }
  }

  const getAgentTypeIcon = (type: AIAgentType) => {
    switch (type) {
      case AIAgentType.FARM_MANAGER: return <Target className="h-4 w-4" />
      case AIAgentType.VET_ASSISTANT: return <Shield className="h-4 w-4" />
      case AIAgentType.SALES_AGENT: return <TrendingUp className="h-4 w-4" />
      case AIAgentType.DATA_ANALYST: return <BarChart3 className="h-4 w-4" />
      case AIAgentType.AUTOMATION_CONTROLLER: return <Zap className="h-4 w-4" />
      case AIAgentType.TRANSACTION_ANALYZER: return <Database className="h-4 w-4" />
      case AIAgentType.COMMUNICATION_MONITOR: return <Activity className="h-4 w-4" />
      case AIAgentType.COMPETITIVE_INTELLIGENCE: return <Lightbulb className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'idle': return 'bg-blue-100 text-blue-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'learning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Management Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your AI agent ecosystem</p>
      </div>

      {/* Initialization */}
      {metrics.totalAgents === 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Initialize AI System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Get started by initializing your AI agent ecosystem. This will set up all specialized AI assistants for your farm.
            </p>
            <Button onClick={initializeAI} disabled={isInitializing} className="w-full">
              {isInitializing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Initializing AI Agents...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Initialize AI System
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      {metrics.totalAgents > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Agents</p>
                  <p className="text-2xl font-bold">{metrics.totalAgents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{metrics.activeAgents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Tasks</p>
                  <p className="text-2xl font-bold">{metrics.totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{metrics.completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="text-2xl font-bold">{(metrics.averageConfidence * 100).toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold">{(metrics.averageResponseTime / 1000).toFixed(1)}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks & Processing</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getAgentTypeIcon(agent.type)}
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <p className="text-sm text-gray-600">{agent.model}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Confidence</span>
                        <span className="font-medium">{(agent.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={agent.confidence * 100} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Accuracy</span>
                        <span className="font-medium">{(agent.performance.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={agent.performance.accuracy * 100} className="h-2" />
                    </div>

                    {/* Capabilities */}
                    <div>
                      <p className="text-sm font-medium mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 3).map(capability => (
                          <Badge key={capability} variant="outline" className="text-xs">
                            {capability.replace('_', ' ')}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.capabilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Farm Connections */}
                    <div>
                      <p className="text-sm font-medium mb-1">Farm Connections</p>
                      <p className="text-sm text-gray-600">
                        {agent.farmConnections.length} farm{agent.farmConnections.length !== 1 ? 's' : ''} connected
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {agent.farmConnections.length === 0 ? (
                        <Button 
                          size="sm" 
                          onClick={() => connectAgentToFarm(agent.id)}
                          className="flex-1"
                        >
                          Connect to Farm
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => submitTestTask(agent.id)}
                          className="flex-1"
                        >
                          Test Agent
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <p className="text-gray-600">Monitor AI task processing and results</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No tasks submitted yet. Connect agents to farms and they will start processing tasks automatically.
                  </p>
                ) : (
                  tasks.slice(0, 10).map((task) => {
                    const agent = agents.find(a => a.id === task.agentId)
                    return (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {agent && getAgentTypeIcon(agent.type)}
                            <span className="font-medium">{task.type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Agent: {agent?.name || 'Unknown'} • 
                          Created: {task.createdAt.toLocaleTimeString()}
                          {task.completedAt && ` • Completed: ${task.completedAt.toLocaleTimeString()}`}
                        </p>

                        {task.result && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium mb-1">Result:</p>
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(task.result, null, 2)}
                            </pre>
                          </div>
                        )}

                        {task.error && (
                          <div className="mt-3 p-3 bg-red-50 rounded">
                            <p className="text-sm font-medium text-red-800 mb-1">Error:</p>
                            <p className="text-sm text-red-700">{task.error}</p>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <p className="text-gray-600">Intelligence and recommendations from your AI agents</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No insights generated yet. AI agents will provide insights as they analyze your farm data.
                  </p>
                ) : (
                  insights.slice(0, 10).map((insight) => {
                    const agent = agents.find(a => a.id === insight.agentId)
                    return (
                      <div key={insight.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {agent && getAgentTypeIcon(agent.type)}
                            <div>
                              <h3 className="font-medium">{insight.title}</h3>
                              <p className="text-sm text-gray-600">{agent?.name}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              {insight.type}
                            </Badge>
                            <Badge 
                              className={
                                insight.impact === 'critical' ? 'bg-red-100 text-red-800' :
                                insight.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                                insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {insight.impact}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{insight.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Confidence: {(insight.confidence * 100).toFixed(1)}%</span>
                          <span>{insight.createdAt.toLocaleString()}</span>
                        </div>

                        {insight.actionRequired && (
                          <div className="mt-3 pt-3 border-t">
                            <Button size="sm" variant="outline">
                              Take Action
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle>AI System Configuration</CardTitle>
              <p className="text-gray-600">Configure AI agents and system settings</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">System Settings</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Auto-initialization:</span>
                        <Badge variant="outline">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Learning mode:</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Data sharing:</span>
                        <Badge variant="outline">Anonymous</Badge>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3">Configure</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Performance Tuning</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Response time target:</span>
                        <span>< 2 seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence threshold:</span>
                        <span>80%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Batch processing:</span>
                        <Badge variant="outline">Enabled</Badge>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3">Optimize</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button size="sm" variant="outline">Reset All Agents</Button>
                    <Button size="sm" variant="outline">Export Logs</Button>
                    <Button size="sm" variant="outline">Import Config</Button>
                    <Button size="sm" variant="outline">System Health</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AIManagementDashboard