import AfricaFeaturesPanel from '@/components/africa/AfricaFeaturesPanel';
import MobileFarmManager from '@/components/mobile/MobileFarmManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Globe,
  ArrowLeft,
  Users,
  TrendingUp,
  MessageSquare,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AfricaFeatures = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-red-400/10 to-yellow-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header Navigation */}
      <nav className="glass-card fixed top-4 left-4 right-4 z-50 !margin-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/dashboard')}
              className="glass-button !padding-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Africa Smart Features</h1>
                <p className="text-xs text-gray-600">Designed for local needs & infrastructure</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className="glass-badge success">
              <Users className="w-3 h-3 mr-1" />
              247 Cooperative Members
            </Badge>
            <Badge className="glass-badge info">
              <Phone className="w-3 h-3 mr-1" />
              USSD Ready
            </Badge>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="glass-card mb-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
                  Africa-First Technology
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Features designed specifically for African agriculture - USSD integration, 
                mobile money, cooperative management, and multi-language support for 
                maximum accessibility and local relevance.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-700">Works on Feature Phones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">SMS & USSD Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Real-time Market Prices</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">Cooperative Management</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interface Selection Tabs */}
          <Tabs defaultValue="desktop" className="space-y-6">
            <div className="glass-card !padding-3 !margin-0">
              <TabsList className="w-full bg-transparent grid grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="desktop" className="glass-button data-[state=active]:bg-white/20">
                  <Globe className="w-4 h-4 mr-2" />
                  Desktop Interface
                </TabsTrigger>
                <TabsTrigger value="mobile" className="glass-button data-[state=active]:bg-white/20">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile Interface
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Desktop Africa Features */}
            <TabsContent value="desktop" className="space-y-6">
              <div className="glass-card">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Desktop Africa Features Panel</h2>
                  <p className="text-gray-600">Full-featured interface for cooperatives and extension officers</p>
                </div>
                <AfricaFeaturesPanel />
              </div>
            </TabsContent>

            {/* Mobile Farm Manager */}
            <TabsContent value="mobile" className="space-y-6">
              <div className="max-w-md mx-auto">
                <div className="glass-card mb-6 text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Mobile Farm Manager</h2>
                  <p className="text-gray-600">Touch-friendly interface optimized for smartphones</p>
                </div>
                <div className="border-4 border-gray-300 rounded-3xl overflow-hidden bg-white shadow-2xl">
                  <MobileFarmManager />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              {
                title: "USSD Integration",
                description: "Dial *384# codes for instant access to farm data, prices, and services",
                icon: <Phone className="w-8 h-8" />,
                color: "from-blue-500 to-blue-600",
                features: ["Works offline", "No data required", "Any phone compatible"]
              },
              {
                title: "Mobile Money",
                description: "M-Pesa, Airtel Money integration for seamless transactions",
                icon: <TrendingUp className="w-8 h-8" />,
                color: "from-green-500 to-green-600",
                features: ["Instant payments", "Group savings", "Loan management"]
              },
              {
                title: "Multi-Language",
                description: "Support for 7 African languages with voice navigation",
                icon: <Globe className="w-8 h-8" />,
                color: "from-orange-500 to-orange-600",
                features: ["Swahili", "Hausa", "Yoruba", "Amharic", "French"]
              },
              {
                title: "Cooperative Tools",
                description: "Manage groups, equipment sharing, and collective marketing",
                icon: <Users className="w-8 h-8" />,
                color: "from-purple-500 to-purple-600",
                features: ["Member management", "Equipment booking", "Group messaging"]
              }
            ].map((feature, index) => (
              <div key={index} className="glass-card group hover:scale-105">
                <div className="space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mx-auto`}>
                    {feature.icon}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                    <div className="space-y-1">
                      {feature.features.map((item, i) => (
                        <div key={i} className="flex items-center justify-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Implementation Stats */}
          <div className="glass-card mt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Real-World Impact</h2>
              <p className="text-gray-600">Results from our Africa-first approach</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "85%", label: "Farmer Adoption Rate", sublabel: "Within 6 months" },
                { value: "40%", label: "Increased Market Access", sublabel: "Via cooperative selling" },
                { value: "60%", label: "Reduced Transaction Costs", sublabel: "Mobile money integration" },
                { value: "95%", label: "Feature Phone Compatibility", sublabel: "USSD-based access" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-900">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfricaFeatures;