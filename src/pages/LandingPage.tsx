import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Leaf, 
  TrendingUp, 
  Users, 
  Globe, 
  Smartphone,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Cloud,
  MapPin,
  Truck,
  Target,
  Star,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Mail,
  Phone,
  Send,
  BookOpen,
  Newspaper
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { value: '$4.18B', label: 'Current Market Size', trend: '+152%' },
    { value: '$10.58B', label: 'Projected by 2030', trend: 'Growing' },
    { value: '25%', label: 'Yield Increase', trend: 'Typical ROI' },
    { value: '500M+', label: 'Smallholder Farmers', trend: 'Global' }
  ];

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Farm Intelligence",
      description: "Advanced machine learning for crop yield prediction, disease detection, and automated decision making with 92% accuracy.",
      stats: "92% accuracy in yield prediction"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Africa-First Design",
      description: "Built for local infrastructure challenges with USSD, SMS integration, and offline-first architecture for rural connectivity.",
      stats: "Works with feature phones"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Automated Workflows",
      description: "400+ agricultural service integrations with smart automation for irrigation, market alerts, and cooperative management.",
      stats: "400+ integrations available"
    }
  ];

  const benefits = [
    "15-25% increase in crop yields",
    "20-30% reduction in water usage",
    "30-40% decrease in equipment downtime", 
    "Real-time market price intelligence",
    "Cooperative group management",
    "Multi-language support (7 African languages)"
  ];

  const testimonials = [
    {
      name: "Amara Kone",
      role: "Cooperative Manager, Mali",
      content: "AgriNexus transformed our 200-member cooperative. We increased yields by 28% and our farmers now get market prices via SMS.",
      rating: 5
    },
    {
      name: "Joseph Mbeki", 
      role: "Smallholder Farmer, Kenya",
      content: "The AI disease detection saved my tomato crop. I just sent a photo and got treatment advice in Swahili within minutes.",
      rating: 5
    },
    {
      name: "Sarah Nyong",
      role: "Agricultural Extension Officer, Nigeria",
      content: "Managing 500+ farmers is now possible with automated reminders and group messaging. Game-changing technology.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-full blur-3xl animate-float animate-delay-2s" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-2xl animate-pulse-subtle" />
      </div>

      {/* Navigation */}
      <nav className="glass-card fixed top-4 left-4 right-4 z-50 !margin-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriNexus AI</h1>
              <p className="text-xs text-gray-600">Smart Farming for Africa</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-700 hover:text-emerald-600 transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-700 hover:text-emerald-600 transition-colors">Success Stories</a>
            <a href="#pricing" className="text-gray-700 hover:text-emerald-600 transition-colors">Pricing</a>
            <Button 
              onClick={() => navigate('/login')}
              className="glass-button bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="glass-badge success">
                  <Zap className="w-3 h-3" />
                  AI-Powered Agriculture Platform
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                    Smart Farming
                  </span>
                  <br />
                  <span className="text-gray-900">for Modern Africa</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Revolutionize your agricultural operations with AI-powered insights, 
                  cooperative management, and market intelligence designed specifically 
                  for African farmers and agribusinesses.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/onboarding')}
                  className="glass-button bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-8 py-4 text-lg"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="glass-button px-8 py-4 text-lg"
                >
                  Watch Demo
                  <Smartphone className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                {benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Floating Stats Cards */}
              <div className="relative z-10 space-y-6">
                <div className="glass-card animate-float">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-emerald-600">{stats[currentStat].value}</h3>
                      <p className="text-gray-600">{stats[currentStat].label}</p>
                    </div>
                    <Badge className="glass-badge success">{stats[currentStat].trend}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card animate-float animate-delay-1s">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">92%</p>
                        <p className="text-sm text-gray-600">AI Accuracy</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card animate-float animate-delay-2s">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">500K+</p>
                        <p className="text-sm text-gray-600">Farmers</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card animate-float animate-delay-3s">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">25% Average Yield Increase</p>
                        <p className="text-sm text-gray-600">Within first growing season</p>
                      </div>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-emerald-400/30 to-green-400/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="glass-badge info mb-4">
              <Brain className="w-3 h-3" />
              Cutting-Edge Technology
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Intelligent Agriculture for the Modern World
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines advanced machine learning, IoT sensors, 
              and local expertise to deliver unprecedented farming intelligence.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card group hover:scale-105">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                      <Badge className="glass-badge success text-xs">{feature.stats}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center text-emerald-600 font-medium">
                    Learn more
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              { icon: <Cloud className="w-6 h-6" />, title: "Weather AI", desc: "Hyper-local forecasting" },
              { icon: <MapPin className="w-6 h-6" />, title: "Field Mapping", desc: "GPS boundary detection" },
              { icon: <Truck className="w-6 h-6" />, title: "Market Linkage", desc: "Direct buyer connections" },
              { icon: <Shield className="w-6 h-6" />, title: "Secure Data", desc: "End-to-end encryption" }
            ].map((item, index) => (
              <div key={index} className="glass-card text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                  {item.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="glass-badge success mb-4">
              <Users className="w-3 h-3" />
              Success Stories
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Transforming Agriculture Across Africa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of farmers and cooperatives who have revolutionized 
              their operations with AgriNexus AI.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">
                  Ready to Transform Your Farm?
                </h2>
                <p className="text-xl text-gray-600">
                  Join the agricultural revolution with AI-powered insights, 
                  cooperative management, and market intelligence.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate('/onboarding')}
                  className="glass-button bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-8 py-4 text-lg"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="glass-button px-8 py-4 text-lg"
                >
                  Schedule Demo
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card text-white">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Newspaper className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">
                  Stay Ahead with AgriNexus Insights
                </h2>
                <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                  Get daily agricultural insights, AI tips, market intelligence, and success stories 
                  from African farmers delivered straight to your inbox.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm text-emerald-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Daily market prices</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Weather forecasts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>AI farming tips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Success stories</span>
                </div>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 rounded-lg border border-emerald-300 bg-white/10 backdrop-blur-lg text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <Button className="glass-button bg-white text-emerald-600 hover:bg-emerald-50 border-0 px-6 py-3">
                    <Send className="w-4 h-4 mr-2" />
                    Subscribe Free
                  </Button>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <p className="text-sm text-emerald-200">
                    Join 25,000+ farmers already subscribed
                  </p>
                  <a 
                    href="https://agrinexusai.substack.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-white hover:text-emerald-200 transition-colors underline"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read on Substack</span>
                  </a>
                </div>
              </div>

              <div className="text-xs text-emerald-200 pt-2">
                No spam. Unsubscribe anytime. Available in English, Swahili, French & Portuguese.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AgriNexus AI</span>
              </div>
              <p className="text-gray-300">
                Revolutionizing agriculture across Africa with intelligent technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <a 
                    href="https://facebook.com/agrinexusai" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors group"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a 
                    href="https://twitter.com/agrinexusai" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors group"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a 
                    href="https://instagram.com/agrinexusai" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors group"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a 
                    href="https://linkedin.com/company/agrinexusai" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors group"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a 
                    href="https://youtube.com/@agrinexusai" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors group"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a 
                    href="https://github.com/laurence77/agri-nexus-ai" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors group"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a 
                    href="https://agrinexusai.substack.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors group"
                    aria-label="Substack Newsletter"
                  >
                    <Newspaper className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a 
                    href="https://agrinexusai.substack.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors group"
                    aria-label="Subscribe to Newsletter"
                  >
                    <BookOpen className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                </div>
                <div className="space-y-2 pt-2">
                  <a 
                    href="mailto:hello@agrinexus.ai" 
                    className="flex items-center space-x-2 text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">hello@agrinexus.ai</span>
                  </a>
                  <a 
                    href="tel:+254700000000" 
                    className="flex items-center space-x-2 text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">+254 700 000 000</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                <p>&copy; 2025 AgriNexus AI. All rights reserved. Built for African agriculture.</p>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">About</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Blog</a>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-500">
                Empowering African farmers with AI technology • Available in 8 languages • Supporting 500,000+ farmers across Africa
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;