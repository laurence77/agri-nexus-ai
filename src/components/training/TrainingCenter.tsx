import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, BookOpen, Video, FileText, Award, Download, Play, Users, Globe } from 'lucide-react'

interface TrainingModule {
  id: string
  title: string
  description: string
  category: 'crops' | 'livestock' | 'equipment' | 'business' | 'ai-integration'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  type: 'video' | 'article' | 'interactive' | 'practical'
  language: string
  progress: number
  completed: boolean
  aiIntegration?: boolean
  offlineAvailable: boolean
}

interface LearningPath {
  id: string
  title: string
  description: string
  modules: string[]
  estimatedHours: number
  certification: boolean
  role: 'farmer' | 'aggregator' | 'extension-worker' | 'cooperative-leader'
}

const TrainingCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, number>>({})

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
    { code: 'ar', name: 'العربية', flag: '🇸🇩' }
  ]

  const sampleModules: TrainingModule[] = [
    {
      id: 'crop-ai-integration',
      title: 'AI-Powered Crop Management',
      description: 'Learn how to integrate AI for automated crop monitoring, disease detection, and yield optimization',
      category: 'crops',
      difficulty: 'intermediate',
      duration: 45,
      type: 'interactive',
      language: selectedLanguage,
      progress: 0,
      completed: false,
      aiIntegration: true,
      offlineAvailable: true
    },
    {
      id: 'livestock-health-ai',
      title: 'AI Veterinary Assistant',
      description: 'Use AI for livestock health monitoring, disease diagnosis, and treatment recommendations',
      category: 'livestock',
      difficulty: 'advanced',
      duration: 60,
      type: 'video',
      language: selectedLanguage,
      progress: 0,
      completed: false,
      aiIntegration: true,
      offlineAvailable: true
    },
    {
      id: 'sales-ai-automation',
      title: 'AI Sales and Marketing',
      description: 'Leverage AI for market analysis, pricing optimization, and automated sales processes',
      category: 'business',
      difficulty: 'intermediate',
      duration: 35,
      type: 'practical',
      language: selectedLanguage,
      progress: 0,
      completed: false,
      aiIntegration: true,
      offlineAvailable: false
    },
    {
      id: 'farm-automation-ai',
      title: 'Complete Farm Automation with AI',
      description: 'Set up and manage AI systems for full farm automation and decision making',
      category: 'ai-integration',
      difficulty: 'advanced',
      duration: 90,
      type: 'interactive',
      language: selectedLanguage,
      progress: 0,
      completed: false,
      aiIntegration: true,
      offlineAvailable: true
    }
  ]

  const sampleLearningPaths: LearningPath[] = [
    {
      id: 'ai-ready-farmer',
      title: 'AI-Ready Farmer Certification',
      description: 'Complete training path to become proficient in AI-assisted farming',
      modules: ['crop-ai-integration', 'livestock-health-ai', 'farm-automation-ai'],
      estimatedHours: 25,
      certification: true,
      role: 'farmer'
    },
    {
      id: 'ai-aggregator-manager',
      title: 'AI-Powered Aggregator Management',
      description: 'Learn to manage multiple farms using AI tools and automation',
      modules: ['sales-ai-automation', 'farm-automation-ai'],
      estimatedHours: 20,
      certification: true,
      role: 'aggregator'
    }
  ]

  useEffect(() => {
    setModules(sampleModules)
    setLearningPaths(sampleLearningPaths)
  }, [selectedLanguage])

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory
    const matchesLanguage = module.language === selectedLanguage
    return matchesSearch && matchesCategory && matchesLanguage
  })

  const startModule = (moduleId: string) => {
    console.log(`Starting module: ${moduleId}`)
  }

  const downloadOfflineContent = (moduleId: string) => {
    console.log(`Downloading offline content for module: ${moduleId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Center</h1>
        <p className="text-gray-600">Master AI-powered agriculture with local language support</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search training modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Categories</option>
            <option value="crops">Crops</option>
            <option value="livestock">Livestock</option>
            <option value="equipment">Equipment</option>
            <option value="business">Business</option>
            <option value="ai-integration">AI Integration</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="ai-ready">AI Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    {module.aiIntegration && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        AI-Ready
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{module.category}</Badge>
                    <Badge variant="outline">{module.difficulty}</Badge>
                    <Badge variant="outline">{module.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <BookOpen className="h-4 w-4" />
                      {module.duration} min
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Globe className="h-4 w-4" />
                      {languages.find(l => l.code === module.language)?.name}
                    </div>
                  </div>

                  {module.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => startModule(module.id)}
                      className="flex-1"
                      variant={module.completed ? "outline" : "default"}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {module.completed ? 'Review' : 'Start'}
                    </Button>
                    
                    {module.offlineAvailable && (
                      <Button
                        onClick={() => downloadOfflineContent(module.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paths">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <Card key={path.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {path.title}
                    {path.certification && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-600">{path.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <BookOpen className="h-4 w-4" />
                      {path.estimatedHours}h
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {path.role}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Modules ({path.modules.length})</h4>
                    <div className="space-y-1">
                      {path.modules.map((moduleId) => {
                        const module = modules.find(m => m.id === moduleId)
                        return module ? (
                          <div key={moduleId} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            {module.title}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>

                  <Button className="w-full">
                    Start Learning Path
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-ready">
          <Card>
            <CardHeader>
              <CardTitle>AI Integration Readiness</CardTitle>
              <p className="text-gray-600">
                Prepare your farm for AI automation with these specialized modules
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Farm AI Manager</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Learn to set up and configure AI systems for complete farm management
                  </p>
                  <Button size="sm" className="w-full">Configure</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">AI Vet Assistant</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Train AI models for livestock health monitoring and diagnosis
                  </p>
                  <Button size="sm" className="w-full">Setup</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Sales AI Agent</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure AI for automated sales, pricing, and market analysis
                  </p>
                  <Button size="sm" className="w-full">Connect</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Data Analyst AI</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Set up AI for business analytics and competitive intelligence
                  </p>
                  <Button size="sm" className="w-full">Initialize</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TrainingCenter