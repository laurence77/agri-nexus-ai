import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Search,
  BookOpen,
  Video,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Globe,
  Smartphone,
  Headphones,
  FileText,
  Play,
  Languages,
  MapPin,
  Calendar,
  Zap,
  Brain,
  Leaf,
  TrendingUp,
  Settings,
  CreditCard,
  Shield,
  Truck,
  Eye
} from "lucide-react";
import { ProvenanceTooltip } from '@/components/ui/provenance-tooltip';
import { ProvenanceViewer } from '@/components/ui/provenance-viewer';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
  tags: string[];
}

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  lastUpdate: string;
  agent: string;
}

interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  views: number;
  rating: number;
}

const Support = () => {
  const [activeTab, setActiveTab] = useState('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    priority: 'medium',
    subject: '',
    description: '',
    language: 'en'
  });

  const supportCategories = [
    { id: 'all', name: 'All Topics', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'getting-started', name: 'Getting Started', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ai-features', name: 'AI Features', icon: <Brain className="w-4 h-4" /> },
    { id: 'marketplace', name: 'Marketplace', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'sensors', name: 'Sensors & IoT', icon: <Zap className="w-4 h-4" /> },
    { id: 'mobile', name: 'Mobile App', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'payments', name: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: <Settings className="w-4 h-4" /> }
  ];

  const faqData: FAQItem[] = [
    {
      id: '1',
      category: 'getting-started',
      question: 'How do I create my first farm profile?',
      answer: 'To create your farm profile, go to Settings > Farm Profile. Enter your farm details including location, size, primary crops, and farming methods. You can also upload photos and set your farming goals.',
      helpful: 47,
      tags: ['profile', 'setup', 'farm']
    },
    {
      id: '2',
      category: 'ai-features',
      question: 'How accurate is the AI disease detection?',
      answer: 'Our AI disease detection has an accuracy rate of 92% for common crop diseases. Simply take a clear photo of the affected plant, and our AI will analyze it within seconds. For best results, ensure good lighting and focus on the affected area.',
      helpful: 89,
      tags: ['ai', 'disease', 'detection', 'accuracy']
    },
    {
      id: '3',
      category: 'marketplace',
      question: 'What payment methods are supported?',
      answer: 'We support M-Pesa, bank transfers, cash on delivery, and our secure escrow service. M-Pesa is the most popular choice for instant transactions. For large purchases, we recommend using our escrow service for added security.',
      helpful: 156,
      tags: ['payment', 'mpesa', 'escrow', 'security']
    },
    {
      id: '4',
      category: 'sensors',
      question: 'How do I connect my IoT sensors?',
      answer: 'Connect your sensors via the Sensors tab. Ensure your sensors are powered on and within WiFi range. Use the "Add Sensor" button and follow the pairing instructions. Most sensors connect automatically via Bluetooth or WiFi.',
      helpful: 73,
      tags: ['sensors', 'iot', 'connection', 'setup']
    },
    {
      id: '5',
      category: 'mobile',
      question: 'Does the app work offline?',
      answer: 'Yes! Many features work offline including farm data entry, sensor readings, and previously downloaded weather forecasts. Data syncs automatically when you reconnect to the internet.',
      helpful: 124,
      tags: ['offline', 'mobile', 'sync', 'data']
    },
    {
      id: '6',
      category: 'troubleshooting',
      question: 'Why are my notifications not working?',
      answer: 'Check your notification settings in Settings > Notifications. Ensure you have enabled the notification types you want to receive. For mobile notifications, check your device settings and ensure the app has notification permissions.',
      helpful: 67,
      tags: ['notifications', 'settings', 'permissions']
    }
  ];

  const tutorialVideos: TutorialVideo[] = [
    {
      id: '1',
      title: 'Getting Started with AgriNexus AI',
      description: 'Complete walkthrough of setting up your farm profile and basic features',
      duration: '8:45',
      category: 'getting-started',
      thumbnail: '/api/placeholder/300/200',
      difficulty: 'beginner',
      views: 2847,
      rating: 4.8
    },
    {
      id: '2',
      title: 'Using AI for Crop Disease Detection',
      description: 'Learn how to use our AI-powered disease detection system effectively',
      duration: '6:23',
      category: 'ai-features',
      thumbnail: '/api/placeholder/300/200',
      difficulty: 'intermediate',
      views: 1956,
      rating: 4.9
    },
    {
      id: '3',
      title: 'Selling on the Marketplace',
      description: 'Step-by-step guide to listing your products and connecting with buyers',
      duration: '12:34',
      category: 'marketplace',
      thumbnail: '/api/placeholder/300/200',
      difficulty: 'beginner',
      views: 3421,
      rating: 4.7
    },
    {
      id: '4',
      title: 'Setting Up IoT Sensors',
      description: 'Hardware setup and configuration for smart farming sensors',
      duration: '15:17',
      category: 'sensors',
      thumbnail: '/api/placeholder/300/200',
      difficulty: 'advanced',
      views: 1234,
      rating: 4.6
    }
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: 'TK-001',
      title: 'Cannot connect M-Pesa payment',
      status: 'in-progress',
      priority: 'high',
      category: 'payments',
      createdAt: '2024-02-01T10:30:00Z',
      lastUpdate: '2024-02-01T14:22:00Z',
      agent: 'Sarah Mwangi'
    },
    {
      id: 'TK-002',
      title: 'Weather data not updating',
      status: 'resolved',
      priority: 'medium',
      category: 'technical',
      createdAt: '2024-01-30T09:15:00Z',
      lastUpdate: '2024-01-31T16:45:00Z',
      agent: 'John Kimani'
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const markHelpful = (faqId: string) => {
    // In a real app, this would update the backend
    console.log(`Marked FAQ ${faqId} as helpful`);
  };

  const submitContactForm = () => {
    // In a real app, this would submit to backend
    console.log('Contact form submitted:', contactForm);
    setShowContactForm(false);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      category: 'general',
      priority: 'medium',
      subject: '',
      description: '',
      language: 'en'
    });
  };

  const renderHelpCenter = () => (
    <div className="space-y-6">
      {/* Search and Categories */}
      <div className="glass-card">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for help topics, features, or issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 w-full"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {supportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`glass-button flex items-center space-x-2 ${
                  selectedCategory === category.id ? 'bg-white/30' : ''
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-4">Get instant help from our support team</p>
          <Button className="glass-button bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            Start Chat
          </Button>
        </div>

        <div className="glass-card text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
          <p className="text-sm text-gray-600 mb-4">Call us for urgent issues</p>
          <Button
            onClick={() => window.open('tel:+254722123456')}
            className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
          >
            Call Now
          </Button>
        </div>

        <div className="glass-card text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
          <p className="text-sm text-gray-600 mb-4">Detailed help via email</p>
          <Button
            onClick={() => setShowContactForm(true)}
            className="glass-button bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0"
          >
            Send Email
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-600">Find quick answers to common questions</p>
          </div>
        </div>

        {filteredFAQs.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search or browse all categories</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="border border-white/20 rounded-lg">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFAQ === faq.id ? 
                    <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  }
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-700 mb-4">{faq.answer}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.map((tag, index) => (
                          <Badge key={index} className="glass-badge info text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Was this helpful?</span>
                        <Button
                          onClick={() => markHelpful(faq.id)}
                          size="sm"
                          className="glass-button text-xs"
                        >
                          👍 Yes ({faq.helpful})
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTutorials = () => (
    <div className="space-y-6">
      {/* Tutorial Categories */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Video Tutorials</h2>
            <p className="text-sm text-gray-600">Step-by-step guides for all features</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutorialVideos.map((video) => (
            <div key={video.id} className="bg-white/50 rounded-lg overflow-hidden hover:scale-105 transition-transform">
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-3 h-3" />
                    <span>{video.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{video.rating}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Badge className={`glass-badge text-xs ${
                    video.difficulty === 'beginner' ? 'success' :
                    video.difficulty === 'intermediate' ? 'warning' : 'error'
                  }`}>
                    {video.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Documentation</h2>
            <p className="text-sm text-gray-600">Comprehensive guides and API documentation</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'User Guide', icon: <BookOpen className="w-5 h-5" />, description: 'Complete user manual', link: '#' },
            { title: 'API Documentation', icon: <FileText className="w-5 h-5" />, description: 'Developer resources', link: '#' },
            { title: 'Troubleshooting', icon: <Settings className="w-5 h-5" />, description: 'Common issues and solutions', link: '#' },
            { title: 'Best Practices', icon: <TrendingUp className="w-5 h-5" />, description: 'Optimization tips', link: '#' },
            { title: 'Security Guide', icon: <Shield className="w-5 h-5" />, description: 'Account and data security', link: '#' },
            { title: 'Mobile App Guide', icon: <Smartphone className="w-5 h-5" />, description: 'Mobile-specific features', link: '#' }
          ].map((doc, index) => (
            <div key={index} className="p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {doc.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{doc.title}</h3>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                </div>
              </div>
              <Button variant="outline" className="glass-button w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Guide
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      {/* Contact Options */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
            <p className="text-sm text-gray-600">Multiple ways to get help when you need it</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/50 rounded-lg">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Available 24/7</p>
            <Badge className="glass-badge success">Online</Badge>
          </div>

          <div className="text-center p-6 bg-white/50 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Phone</h3>
            <p className="text-sm text-gray-600 mb-2">+254 722 123 456</p>
            <p className="text-xs text-gray-500">Mon-Fri 8AM-6PM EAT</p>
          </div>

          <div className="text-center p-6 bg-white/50 rounded-lg">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Email</h3>
            <p className="text-sm text-gray-600 mb-2">support@agrinexus.ai</p>
            <p className="text-xs text-gray-500">Response within 2 hours</p>
          </div>

          <div className="text-center p-6 bg-white/50 rounded-lg">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Community</h3>
            <p className="text-sm text-gray-600 mb-2">Farmer Forums</p>
            <p className="text-xs text-gray-500">Peer-to-peer help</p>
          </div>
        </div>
      </div>

      {/* Support Tickets */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Support Tickets</h3>
            <p className="text-sm text-gray-600">Track your support requests</p>
          </div>
          <Button
            onClick={() => setShowContactForm(true)}
            className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
          >
            New Ticket
          </Button>
        </div>

        {supportTickets.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h4>
            <p className="text-gray-600">You haven't created any support tickets yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 bg-white/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{ticket.id}</span>
                    <ProvenanceTooltip tableName="support_tickets" recordId={ticket.id} fieldName="status">
                      <Badge className={`glass-badge ${
                        ticket.status === 'resolved' ? 'success' :
                        ticket.status === 'in-progress' ? 'warning' :
                        ticket.status === 'open' ? 'info' : 'error'
                      }`}>
                        {ticket.status}
                      </Badge>
                    </ProvenanceTooltip>
                    <ProvenanceTooltip tableName="support_tickets" recordId={ticket.id} fieldName="priority">
                      <Badge className={`glass-badge ${
                        ticket.priority === 'urgent' ? 'error' :
                        ticket.priority === 'high' ? 'warning' :
                        ticket.priority === 'medium' ? 'info' : 'success'
                      }`}>
                        {ticket.priority}
                      </Badge>
                    </ProvenanceTooltip>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{ticket.title}</h4>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <ProvenanceTooltip tableName="support_tickets" recordId={ticket.id} fieldName="agent">
                    <span>Agent: {ticket.agent}</span>
                  </ProvenanceTooltip>
                  <span>Last update: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                </div>
                {/* ProvenanceViewer for full ticket history (collapsible or always visible) */}
                <div className="mt-4">
                  <ProvenanceViewer tableName="support_tickets" recordId={ticket.id} maxHistory={5} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Multilingual Support */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Languages className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Language Support</h3>
            <p className="text-sm text-gray-600">Get help in your preferred language</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { code: 'en', name: 'English', flag: '🇺🇸', available: true },
            { code: 'sw', name: 'Kiswahili', flag: '🇹🇿', available: true },
            { code: 'ha', name: 'Hausa', flag: '🇳🇬', available: true },
            { code: 'yo', name: 'Yoruba', flag: '🇳🇬', available: false },
            { code: 'am', name: 'Amharic', flag: '🇪🇹', available: false },
            { code: 'fr', name: 'Français', flag: '🇫🇷', available: true },
            { code: 'ar', name: 'العربية', flag: '🇪🇬', available: false },
            { code: 'pt', name: 'Português', flag: '🇦🇴', available: false }
          ].map((lang) => (
            <div key={lang.code} className="p-3 bg-white/50 rounded-lg text-center">
              <span className="text-2xl mb-2 block">{lang.flag}</span>
              <p className="font-medium text-gray-900">{lang.name}</p>
              <Badge className={`glass-badge ${lang.available ? 'success' : 'info'} text-xs mt-1`}>
                {lang.available ? 'Available' : 'Coming Soon'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Contact Form Modal
  const ContactFormModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
            <p className="text-sm text-gray-600">We'll get back to you within 2 hours</p>
          </div>
          <Button
            onClick={() => setShowContactForm(false)}
            variant="ghost"
            className="glass-button !padding-2"
          >
            ×
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                className="glass-input w-full"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                className="glass-input w-full"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                className="glass-input w-full"
                placeholder="+254 722 123 456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="contact-language">Language</label>
              <select
                id="contact-language"
                title="Language"
                value={contactForm.language}
                onChange={(e) => setContactForm(prev => ({ ...prev, language: e.target.value }))}
                className="glass-input w-full"
              >
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
                <option value="ha">Hausa</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="contact-category">Category</label>
              <select
                id="contact-category"
                title="Category"
                value={contactForm.category}
                onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                className="glass-input w-full"
              >
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing & Payments</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="contact-priority">Priority</label>
              <select
                id="contact-priority"
                title="Priority"
                value={contactForm.priority}
                onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                className="glass-input w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              value={contactForm.subject}
              onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
              className="glass-input w-full"
              placeholder="Brief description of your issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={contactForm.description}
              onChange={(e) => setContactForm(prev => ({ ...prev, description: e.target.value }))}
              className="glass-input w-full h-32"
              placeholder="Please provide detailed information about your issue or question..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setShowContactForm(false)}
              variant="outline"
              className="glass-button"
            >
              Cancel
            </Button>
            <Button
              onClick={submitContactForm}
              className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
            >
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float support-bg-float" />
      </div>

      <div className="pt-32 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-gray-600">
                  Get the help you need to make the most of AgriNexus AI
                </p>
              </div>
            </div>

            {/* Support Status */}
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Support Online</span>
              </div>
              <div className="text-sm text-gray-600">Average response: 2 hours</div>
              <div className="text-sm text-gray-600">Available in 4 languages</div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="glass-card !padding-2 !margin-0">
              <TabsList className="w-full bg-transparent">
                <TabsTrigger value="help" className="glass-button data-[state=active]:bg-white/20">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </TabsTrigger>
                <TabsTrigger value="tutorials" className="glass-button data-[state=active]:bg-white/20">
                  <Video className="w-4 h-4 mr-2" />
                  Tutorials
                </TabsTrigger>
                <TabsTrigger value="support" className="glass-button data-[state=active]:bg-white/20">
                  <Headphones className="w-4 h-4 mr-2" />
                  Contact Support
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="help">
              {renderHelpCenter()}
            </TabsContent>

            <TabsContent value="tutorials">
              {renderTutorials()}
            </TabsContent>

            <TabsContent value="support">
              {renderSupport()}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && <ContactFormModal />}
    </div>
  );
};

export default Support;