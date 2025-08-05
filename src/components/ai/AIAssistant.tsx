import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain,
  Send,
  Mic,
  MicOff,
  Image,
  FileText,
  Camera,
  Lightbulb,
  TrendingUp,
  Leaf,
  Heart,
  Cloud,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  MessageSquare,
  Bot,
  User,
  Sparkles,
  Zap,
  Eye,
  Thermometer,
  Droplets,
  Sun
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: 'general' | 'crops' | 'livestock' | 'weather' | 'diagnosis' | 'recommendation';
  attachments?: {
    type: 'image' | 'document' | 'data';
    name: string;
    url: string;
  }[];
  confidence?: number;
  sources?: string[];
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'prediction' | 'diagnosis' | 'recommendation' | 'monitoring';
  icon: React.ReactNode;
  examples: string[];
  accuracy: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
  category: 'crops' | 'livestock' | 'weather' | 'finance' | 'planning';
}

const aiCapabilities: AICapability[] = [
  {
    id: 'crop-diagnosis',
    name: 'Crop Disease Diagnosis',
    description: 'Identify plant diseases and pests from images',
    category: 'diagnosis',
    icon: <Leaf className="h-4 w-4" />,
    examples: ['Upload plant leaf photos for disease identification', 'Analyze pest damage patterns', 'Recommend treatment options'],
    accuracy: 92
  },
  {
    id: 'yield-prediction',
    name: 'Yield Prediction',
    description: 'Predict crop yields based on current conditions',
    category: 'prediction',
    icon: <TrendingUp className="h-4 w-4" />,
    examples: ['Estimate harvest quantities', 'Compare with historical data', 'Factor in weather conditions'],
    accuracy: 87
  },
  {
    id: 'livestock-health',
    name: 'Livestock Health Monitoring',
    description: 'Monitor animal health and breeding cycles',
    category: 'monitoring',
    icon: <Heart className="h-4 w-4" />,
    examples: ['Track reproductive cycles', 'Identify health issues early', 'Optimize breeding schedules'],
    accuracy: 89
  },
  {
    id: 'weather-analysis',
    name: 'Weather Impact Analysis',
    description: 'Analyze weather patterns and agricultural impact',
    category: 'analysis',
    icon: <Cloud className="h-4 w-4" />,
    examples: ['Predict weather effects on crops', 'Optimize irrigation timing', 'Plan planting schedules'],
    accuracy: 85
  },
  {
    id: 'financial-planning',
    name: 'Financial Planning',
    description: 'Optimize farm economics and resource allocation',
    category: 'recommendation',
    icon: <BarChart3 className="h-4 w-4" />,
    examples: ['Calculate profitability', 'Optimize input costs', 'Plan investments'],
    accuracy: 91
  }
];

const quickActions: QuickAction[] = [
  {
    id: 'crop-problem',
    title: 'Diagnose Crop Problem',
    description: 'Get help identifying crop issues',
    prompt: 'I have a problem with my crops. Can you help me diagnose what might be wrong?',
    icon: <AlertTriangle className="h-4 w-4" />,
    category: 'crops'
  },
  {
    id: 'planting-advice',
    title: 'Planting Recommendations',
    description: 'Best crops for current season',
    prompt: 'What crops should I plant this season based on current conditions?',
    icon: <Leaf className="h-4 w-4" />,
    category: 'crops'
  },
  {
    id: 'animal-health',
    title: 'Animal Health Check',
    description: 'Assess livestock health status',
    prompt: 'I need help assessing the health of my livestock. What should I look for?',
    icon: <Heart className="h-4 w-4" />,
    category: 'livestock'
  },
  {
    id: 'weather-planning',
    title: 'Weather-Based Planning',
    description: 'Plan activities around weather',
    prompt: 'How should I adjust my farming activities based on the upcoming weather?',
    icon: <Cloud className="h-4 w-4" />,
    category: 'weather'
  },
  {
    id: 'profit-optimization',
    title: 'Optimize Profits',
    description: 'Improve farm profitability',
    prompt: 'How can I improve the profitability of my farm operations?',
    icon: <Target className="h-4 w-4" />,
    category: 'finance'
  },
  {
    id: 'seasonal-planning',
    title: 'Seasonal Planning',
    description: 'Plan for upcoming season',
    prompt: 'Help me create a comprehensive plan for the upcoming farming season.',
    icon: <Clock className="h-4 w-4" />,
    category: 'planning'
  }
];

export function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<AICapability | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadInitialMessage();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: `Hello! I'm your AI Agricultural Assistant. I'm here to help you with:

🌱 **Crop Management** - Disease diagnosis, yield prediction, planting advice
🐄 **Livestock Care** - Health monitoring, breeding optimization, feed planning  
🌤️ **Weather Analysis** - Impact assessment, irrigation planning, activity scheduling
💰 **Financial Planning** - Profitability analysis, cost optimization, investment planning
📊 **Data Insights** - Performance analytics, trend analysis, recommendations

What would you like help with today?`,
      timestamp: new Date(),
      category: 'general',
      confidence: 100
    };

    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string, category?: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
      category: category as any
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(content, category);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userInput: string, category?: string): ChatMessage => {
    const input = userInput.toLowerCase();
    let response = '';
    let responseCategory: ChatMessage['category'] = 'general';
    let confidence = 85;
    let sources: string[] = [];

    // Crop-related responses
    if (input.includes('crop') || input.includes('plant') || input.includes('disease') || input.includes('pest')) {
      responseCategory = 'crops';
      if (input.includes('disease') || input.includes('sick') || input.includes('yellow') || input.includes('spots')) {
        response = `Based on your description, here are the most likely causes and solutions:

🔍 **Possible Issues:**
• **Fungal Disease** - Yellow spots or wilting may indicate fungal infection
• **Nutrient Deficiency** - Yellowing could be nitrogen or iron deficiency  
• **Pest Damage** - Check for insect activity or larvae

💡 **Recommended Actions:**
1. **Immediate**: Apply organic fungicide if fungal disease suspected
2. **Nutrition**: Test soil and apply balanced fertilizer if deficient
3. **Monitoring**: Check plants daily and isolate affected areas
4. **Prevention**: Improve drainage and air circulation

📸 **Next Steps**: Upload photos of affected plants for more accurate diagnosis.`;
        confidence = 88;
        sources = ['Plant Pathology Database', 'Integrated Pest Management Guide'];
      } else if (input.includes('plant') || input.includes('grow') || input.includes('season')) {
        response = `Here are my planting recommendations based on current conditions:

🌱 **Best Crops for Current Season:**
• **Primary**: Maize, beans, sweet potatoes (long rains season)
• **Secondary**: Kale, spinach, tomatoes (with irrigation)
• **Intercropping**: Beans with maize for nitrogen fixation

📅 **Optimal Timing:**
• **Main Season**: Plant within next 2-3 weeks
• **Late Planting**: Risk of reduced yields after optimal window
• **Succession**: Stagger plantings every 2 weeks for continuous harvest

🌤️ **Weather Considerations:**
• Current rainfall patterns favor water-loving crops
• Temperature ranges are ideal for most vegetables
• Consider drainage for heavy rainfall periods`;
        confidence = 92;
        sources = ['Seasonal Planting Guide', 'Weather Analysis Module'];
      }
    }
    
    // Livestock-related responses
    else if (input.includes('animal') || input.includes('livestock') || input.includes('cow') || input.includes('chicken') || input.includes('goat')) {
      responseCategory = 'livestock';
      if (input.includes('health') || input.includes('sick') || input.includes('disease')) {
        response = `Here's a comprehensive livestock health assessment guide:

🔍 **Daily Health Checks:**
• **Appetite**: Monitor feed consumption and water intake
• **Behavior**: Look for lethargy, isolation, or unusual behavior
• **Physical**: Check eyes, nose, breathing, and body condition
• **Movement**: Assess gait and mobility

⚠️ **Warning Signs:**
• Reduced appetite for more than 24 hours
• Abnormal discharge from eyes, nose, or reproductive organs
• Difficulty breathing or rapid breathing
• Lameness or reluctance to move

💊 **Immediate Actions:**
1. Isolate sick animals to prevent spread
2. Ensure access to clean water and quality feed
3. Take temperature and record symptoms
4. Contact veterinarian if symptoms persist

📊 **Preventive Measures:**
• Maintain vaccination schedules
• Provide balanced nutrition
• Ensure clean living conditions
• Regular deworming as recommended`;
        confidence = 90;
        sources = ['Veterinary Health Guidelines', 'Livestock Management Best Practices'];
      } else if (input.includes('breeding') || input.includes('mating') || input.includes('reproduce')) {
        response = `Optimizing your breeding program for better results:

📅 **Breeding Schedule Optimization:**
• **Heat Detection**: Monitor for signs 2x daily during breeding season
• **Timing**: Breed 12-18 hours after heat detection for cattle
• **Record Keeping**: Track all breeding dates and outcomes

🎯 **Genetic Improvement:**
• **Selection Criteria**: Focus on production, health, and fertility traits
• **Breeding Stock**: Choose animals with proven performance records
• **Avoid Inbreeding**: Maintain genetic diversity in your herd

📈 **Performance Tracking:**
• **Conception Rate**: Target 85%+ for optimal performance
• **Calving Interval**: Aim for 12-13 months for dairy cattle
• **Offspring Quality**: Monitor growth rates and health status

🔬 **Modern Techniques:**
• Consider AI for genetic improvement
• Pregnancy testing at 30-35 days post-breeding
• Nutritional supplements during breeding season`;
        confidence = 89;
        sources = ['Reproductive Management Guide', 'Genetics and Breeding Handbook'];
      }
    }
    
    // Weather-related responses
    else if (input.includes('weather') || input.includes('rain') || input.includes('drought') || input.includes('irrigation')) {
      responseCategory = 'weather';
      response = `Weather analysis and farming recommendations:

🌤️ **Current Weather Impact:**
• **Rainfall**: Above average - good for most crops but monitor drainage
• **Temperature**: Optimal range for vegetative growth
• **Humidity**: High levels increase disease pressure

💧 **Irrigation Management:**
• **Current Needs**: Reduce irrigation frequency due to adequate rainfall
• **Soil Moisture**: Monitor to prevent waterlogging
• **Scheduling**: Adjust based on daily rainfall measurements

⚠️ **Risk Management:**
• **Disease Prevention**: High humidity increases fungal disease risk
• **Drainage**: Ensure proper field drainage to prevent root rot
• **Pest Monitoring**: Wet conditions may increase certain pest populations

📅 **7-Day Outlook:**
• Days 1-3: Continued showers, reduce field activities
• Days 4-5: Clearing conditions, good for spraying/fertilizing
• Days 6-7: Dry conditions, resume normal operations`;
      confidence = 87;
      sources = ['Weather Analysis Module', 'Irrigation Management System'];
    }
    
    // Financial/planning responses
    else if (input.includes('profit') || input.includes('cost') || input.includes('money') || input.includes('finance') || input.includes('plan')) {
      responseCategory = 'recommendation';
      response = `Here's your farm profitability optimization plan:

💰 **Cost Reduction Strategies:**
• **Input Efficiency**: Optimize fertilizer and pesticide use based on soil tests
• **Labor Optimization**: Mechanize repetitive tasks where cost-effective
• **Bulk Purchasing**: Coordinate with neighbors for bulk input purchases
• **Energy Savings**: Consider solar for water pumping and lighting

📈 **Revenue Enhancement:**
• **Premium Markets**: Target organic or direct-to-consumer sales
• **Value Addition**: Process raw products (milk to cheese, grains to flour)
• **Diversification**: Add complementary enterprises (poultry, vegetables)
• **Seasonal Timing**: Market produce during peak price periods

📊 **Financial Metrics to Track:**
• **Gross Margin**: Revenue minus variable costs per hectare
• **Break-even Point**: Minimum production needed to cover costs
• **ROI**: Return on investment for different enterprises
• **Cash Flow**: Monthly income and expense projections

🎯 **Quick Wins:**
1. Reduce input costs by 10-15% through precision application
2. Increase yields by 20% through better crop management
3. Access premium markets for 15-25% price increase`;
      confidence = 91;
      sources = ['Farm Economics Database', 'Market Analysis Module'];
    }
    
    // Default response
    else {
      response = `I understand you need agricultural assistance. I can help you with:

🌾 **Crop Management**
• Disease and pest identification
• Planting recommendations
• Yield optimization strategies

🐄 **Livestock Care**
• Health monitoring and assessment
• Breeding program optimization
• Feed and nutrition planning

🌤️ **Weather & Planning**
• Weather impact analysis
• Irrigation scheduling
• Seasonal activity planning

💡 **Smart Recommendations**
• Data-driven insights from your farm
• Best practice recommendations
• Performance optimization tips

Please provide more specific details about what you'd like help with, or try one of the quick action buttons below!`;
      confidence = 75;
    }

    return {
      id: `ai-${Date.now()}`,
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      category: responseCategory,
      confidence,
      sources
    };
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt, action.category);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // In a real implementation, this would start/stop speech recognition
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crops': return 'bg-green-100 text-green-800';
      case 'livestock': return 'bg-blue-100 text-blue-800';
      case 'weather': return 'bg-purple-100 text-purple-800';
      case 'diagnosis': return 'bg-red-100 text-red-800';
      case 'recommendation': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCapabilities = activeCategory === 'all' 
    ? aiCapabilities 
    : aiCapabilities.filter(cap => cap.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agricultural Assistant</h1>
        <p className="text-gray-600">Get intelligent insights and recommendations for your farm</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Chat Assistant
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        {message.type === 'assistant' ? (
                          <Bot className="h-4 w-4 mt-1 text-blue-600" />
                        ) : (
                          <User className="h-4 w-4 mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          
                          {message.category && message.category !== 'general' && (
                            <div className="mt-2">
                              <Badge className={getCategoryColor(message.category)} size="sm">
                                {message.category}
                              </Badge>
                            </div>
                          )}
                          
                          {message.confidence && (
                            <div className="mt-2 text-xs opacity-70">
                              Confidence: {message.confidence}%
                            </div>
                          )}
                          
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-2 text-xs opacity-70">
                              Sources: {message.sources.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs opacity-50 text-right">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything about your farm..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                      className="pr-12"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      onClick={handleFileUpload}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant={isListening ? "default" : "outline"}
                    size="sm"
                    onClick={toggleVoiceInput}
                  >
                    {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button onClick={() => sendMessage(inputMessage)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    // Handle file upload in real implementation
                    console.log('File selected:', e.target.files?.[0]);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleQuickAction(action)}
                  >
                    <div className="flex items-start gap-3">
                      {action.icon}
                      <div>
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-gray-600">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Capabilities</CardTitle>
              <div className="flex gap-1 flex-wrap">
                <Button
                  size="sm"
                  variant={activeCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setActiveCategory('all')}
                >
                  All
                </Button>
                {['analysis', 'prediction', 'diagnosis', 'recommendation'].map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={activeCategory === category ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCapabilities.map((capability) => (
                  <div
                    key={capability.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCapability?.id === capability.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCapability(capability)}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {capability.icon}
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{capability.name}</h3>
                        <p className="text-xs text-gray-600">{capability.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="text-xs">
                        {capability.category}
                      </Badge>
                      <span className="text-green-600 font-medium">{capability.accuracy}% accuracy</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Farm Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature
                  </span>
                  <span className="font-medium">24°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    Humidity
                  </span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Season
                  </span>
                  <span className="font-medium">Long Rains</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Active Crops
                  </span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Livestock
                  </span>
                  <span className="font-medium">25 animals</span>
                </div>
                
                <div className="mt-4 p-2 bg-green-50 rounded text-xs">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    <span className="font-medium">Farm Health: Excellent</span>
                  </div>
                  <p className="text-green-600 mt-1">All systems operating optimally</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;