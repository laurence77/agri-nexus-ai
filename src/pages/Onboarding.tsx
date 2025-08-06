import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  User,
  MapPin,
  Sprout,
  Smartphone,
  Users,
  Target,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Globe,
  Tractor,
  DollarSign,
  Calendar,
  Zap,
  Brain,
  Phone,
  MessageSquare,
  Languages,
  Droplets,
  Sun,
  TrendingUp,
  Award,
  Play,
  BookOpen,
  Shield
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface OnboardingData {
  personalInfo: {
    name: string;
    phone: string;
    location: string;
    experience: string;
    education: string;
  };
  farmInfo: {
    size: string;
    primaryCrop: string;
    secondaryCrops: string[];
    farmingMethod: string;
    hasEquipment: boolean;
    hasSensors: boolean;
  };
  goals: {
    primaryGoal: string;
    targetYield: string;
    timeframe: string;
    challenges: string[];
  };
  preferences: {
    language: string;
    communicationMethod: string;
    notifications: string[];
    cooperativeInterest: boolean;
  };
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    personalInfo: {
      name: '',
      phone: '',
      location: '',
      experience: '',
      education: ''
    },
    farmInfo: {
      size: '',
      primaryCrop: '',
      secondaryCrops: [],
      farmingMethod: '',
      hasEquipment: false,
      hasSensors: false
    },
    goals: {
      primaryGoal: '',
      targetYield: '',
      timeframe: '',
      challenges: []
    },
    preferences: {
      language: 'en',
      communicationMethod: '',
      notifications: [],
      cooperativeInterest: false
    }
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (section: keyof OnboardingData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to dashboard
      try {
        // Use email or phone as user id if available
        const userId = formData.personalInfo.email || formData.personalInfo.phone || 'unknown';
        const { ProvenanceService } = await import('@/lib/provenance');
        // Flatten all fields for provenance
        const changes: Record<string, any> = {};
        Object.entries(formData).forEach(([section, fields]) => {
          Object.entries(fields as any).forEach(([key, value]) => {
            changes[`${section}.${key}`] = { newValue: value };
          });
        });
        await ProvenanceService.recordRecordChanges('onboarding', userId, changes, {
          source: 'user',
          entered_by: userId,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to record provenance for onboarding:', err);
      }
      console.log('Onboarding completed:', formData);
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderPersonalInfo = () => (
    <div className="glass-card max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
          <p className="text-gray-600">Let's start with some basic details about you</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={formData.personalInfo.name}
            onChange={(e) => updateFormData('personalInfo', 'name', e.target.value)}
            className="glass-input w-full"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="tel"
              value={formData.personalInfo.phone}
              onChange={(e) => updateFormData('personalInfo', 'phone', e.target.value)}
              className="glass-input w-full pl-10"
              placeholder="+254 722 123 456"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={formData.personalInfo.location}
              onChange={(e) => updateFormData('personalInfo', 'location', e.target.value)}
              className="glass-input w-full pl-10"
              placeholder="County, Region, Country"
            />
          </div>
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">Years of Farming Experience</label>
          <select
            id="experience"
            value={formData.personalInfo.experience}
            onChange={(e) => updateFormData('personalInfo', 'experience', e.target.value)}
            className="glass-input w-full"
            aria-label="Select your years of farming experience"
            title="Years of Farming Experience"
          >
            <option value="">Select experience level</option>
            <option value="beginner">New to farming (0-2 years)</option>
            <option value="intermediate">Some experience (3-10 years)</option>
            <option value="experienced">Experienced (11-20 years)</option>
            <option value="expert">Very experienced (20+ years)</option>
          </select>
        </div>

        <div>
          <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
          <select
            id="education"
            value={formData.personalInfo.education}
            onChange={(e) => updateFormData('personalInfo', 'education', e.target.value)}
            className="glass-input w-full"
            aria-label="Select your education level"
            title="Education Level"
          >
            <option value="">Select education level</option>
            <option value="primary">Primary education</option>
            <option value="secondary">Secondary education</option>
            <option value="tertiary">College/University</option>
            <option value="agricultural">Agricultural training</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderFarmInfo = () => (
    <div className="glass-card max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Farm Information</h2>
          <p className="text-gray-600">Tell us about your farming operation</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size (acres)</label>
          <input
            type="number"
            value={formData.farmInfo.size}
            onChange={(e) => updateFormData('farmInfo', 'size', e.target.value)}
            className="glass-input w-full"
            placeholder="Total farm size in acres"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Crop</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Maize', 'Beans', 'Tomatoes', 'Cassava', 'Rice', 'Wheat', 'Coffee', 'Tea'].map((crop) => (
              <button
                key={crop}
                onClick={() => updateFormData('farmInfo', 'primaryCrop', crop.toLowerCase())}
                className={`glass-button text-center p-4 ${
                  formData.farmInfo.primaryCrop === crop.toLowerCase() ? 'bg-white/30' : ''
                }`}
              >
                <Sprout className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <span className="text-sm font-medium">{crop}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Farming Method</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'traditional', label: 'Traditional', icon: <Sun className="w-5 h-5" /> },
              { key: 'mixed', label: 'Mixed', icon: <TrendingUp className="w-5 h-5" /> },
              { key: 'modern', label: 'Modern', icon: <Zap className="w-5 h-5" /> }
            ].map((method) => (
              <button
                key={method.key}
                onClick={() => updateFormData('farmInfo', 'farmingMethod', method.key)}
                className={`glass-button p-4 flex flex-col items-center space-y-2 ${
                  formData.farmInfo.farmingMethod === method.key ? 'bg-white/30' : ''
                }`}
              >
                {method.icon}
                <span className="text-sm font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Tractor className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Farm Equipment</p>
                <p className="text-sm text-gray-600">Tractors, irrigation systems</p>
              </div>
            </div>
            <input
              id="hasEquipment"
              type="checkbox"
              checked={formData.farmInfo.hasEquipment}
              onChange={(e) => updateFormData('farmInfo', 'hasEquipment', e.target.checked)}
              className="h-4 w-4 text-green-600 rounded"
              aria-label="I have farm equipment"
              title="I have farm equipment"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Smart Sensors</p>
                <p className="text-sm text-gray-600">IoT devices, monitoring systems</p>
              </div>
            </div>
            <input
              id="hasSensors"
              type="checkbox"
              checked={formData.farmInfo.hasSensors}
              onChange={(e) => updateFormData('farmInfo', 'hasSensors', e.target.checked)}
              className="h-4 w-4 text-purple-600 rounded"
              aria-label="I have smart sensors"
              title="I have smart sensors"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="glass-card max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
          <p className="text-gray-600">What do you want to achieve with AgriNexus AI?</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Primary Goal</label>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { key: 'yield', label: 'Increase Yield', desc: 'Optimize crop production' },
              { key: 'efficiency', label: 'Improve Efficiency', desc: 'Reduce costs and waste' },
              { key: 'income', label: 'Boost Income', desc: 'Maximize farm profitability' },
              { key: 'sustainability', label: 'Sustainable Farming', desc: 'Eco-friendly practices' }
            ].map((goal) => (
              <button
                key={goal.key}
                onClick={() => updateFormData('goals', 'primaryGoal', goal.key)}
                className={`glass-button p-4 text-left ${
                  formData.goals.primaryGoal === goal.key ? 'bg-white/30' : ''
                }`}
              >
                <h3 className="font-medium text-gray-900">{goal.label}</h3>
                <p className="text-sm text-gray-600">{goal.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="targetYield" className="block text-sm font-medium text-gray-700 mb-2">Target Yield Increase</label>
          <select
            id="targetYield"
            value={formData.goals.targetYield}
            onChange={(e) => updateFormData('goals', 'targetYield', e.target.value)}
            className="glass-input w-full"
            aria-label="Select your target yield increase percentage"
            title="Target Yield Increase"
          >
            <option value="">Select target increase</option>
            <option value="10">10% increase</option>
            <option value="20">20% increase</option>
            <option value="30">30% increase</option>
            <option value="40">40% or more</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe to Achieve Goals</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: '1season', label: '1 Season' },
              { key: '1year', label: '1 Year' },
              { key: '2years', label: '2+ Years' }
            ].map((time) => (
              <button
                key={time.key}
                onClick={() => updateFormData('goals', 'timeframe', time.key)}
                className={`glass-button p-3 ${
                  formData.goals.timeframe === time.key ? 'bg-white/30' : ''
                }`}
              >
                <Calendar className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                <span className="text-sm font-medium">{time.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Main Challenges (select all that apply)</label>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Weather unpredictability',
              'Pest and disease control',
              'Market price volatility',
              'Limited access to resources',
              'Lack of farming knowledge',
              'Water scarcity'
            ].map((challenge) => (
              <label key={challenge} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.goals.challenges.includes(challenge)}
                  onChange={(e) => {
                    const challenges = formData.goals.challenges;
                    if (e.target.checked) {
                      updateFormData('goals', 'challenges', [...challenges, challenge]);
                    } else {
                      updateFormData('goals', 'challenges', challenges.filter(c => c !== challenge));
                    }
                  }}
                  className="h-4 w-4 text-orange-600 rounded"
                />
                <span className="text-sm text-gray-700">{challenge}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="glass-card max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
          <p className="text-gray-600">Customize your AgriNexus AI experience</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Language</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { code: 'en', name: 'English', flag: '🇺🇸' },
              { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
              { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
              { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
              { code: 'am', name: 'Amharic', flag: '🇪🇹' },
              { code: 'fr', name: 'Français', flag: '🇫🇷' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => updateFormData('preferences', 'language', lang.code)}
                className={`glass-button p-3 flex items-center space-x-2 ${
                  formData.preferences.language === lang.code ? 'bg-white/30' : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Communication Method</label>
          <div className="space-y-3">
            {[
              { key: 'sms', label: 'SMS Text Messages', icon: <MessageSquare className="w-5 h-5" />, desc: 'Works on all phones' },
              { key: 'app', label: 'Mobile App', icon: <Smartphone className="w-5 h-5" />, desc: 'Rich notifications and features' },
              { key: 'ussd', label: 'USSD Codes', icon: <Phone className="w-5 h-5" />, desc: 'No internet required' }
            ].map((method) => (
              <button
                key={method.key}
                onClick={() => updateFormData('preferences', 'communicationMethod', method.key)}
                className={`glass-button w-full p-4 flex items-center space-x-3 text-left ${
                  formData.preferences.communicationMethod === method.key ? 'bg-white/30' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {method.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{method.label}</p>
                  <p className="text-sm text-gray-600">{method.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Notification Types</label>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Weather alerts',
              'Market price updates',
              'AI recommendations',
              'Planting reminders',
              'Harvest notifications',
              'Equipment maintenance'
            ].map((notification) => (
              <label key={notification} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences.notifications.includes(notification)}
                  onChange={(e) => {
                    const notifications = formData.preferences.notifications;
                    if (e.target.checked) {
                      updateFormData('preferences', 'notifications', [...notifications, notification]);
                    } else {
                      updateFormData('preferences', 'notifications', notifications.filter(n => n !== notification));
                    }
                  }}
                  className="h-4 w-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700">{notification}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Join a Cooperative</p>
              <p className="text-sm text-blue-700">Connect with local farmers for group buying and shared resources</p>
            </div>
          </div>
          <input
            id="cooperativeInterest"
            type="checkbox"
            checked={formData.preferences.cooperativeInterest}
            onChange={(e) => updateFormData('preferences', 'cooperativeInterest', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
            aria-label="I am interested in joining a cooperative"
            title="Join a Cooperative"
          />
        </div>
      </div>
    </div>
  );

  const renderCompletion = () => (
    <div className="glass-card max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to AgriNexus AI!</h2>
        <p className="text-xl text-gray-600 mb-6">
          Your intelligent farming companion is now configured and ready to help you achieve your goals.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white/50 rounded-lg">
          <Brain className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
          <p className="text-sm text-gray-600">Personalized recommendations based on your farm data</p>
        </div>
        <div className="p-6 bg-white/50 rounded-lg">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Yield Optimization</h3>
          <p className="text-sm text-gray-600">Data-driven strategies to maximize your harvest</p>
        </div>
        <div className="p-6 bg-white/50 rounded-lg">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Community Connection</h3>
          <p className="text-sm text-gray-600">Connect with local farmers and cooperatives</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4 p-4 bg-emerald-50 rounded-lg">
          <Award className="w-6 h-6 text-emerald-600" />
          <div className="text-left">
            <p className="font-medium text-emerald-900">Onboarding Complete!</p>
            <p className="text-sm text-emerald-700">You're all set to start your smart farming journey</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/dashboard')}
            className="glass-button bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-8 py-3"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Using AgriNexus AI
          </Button>
          <Button
            onClick={() => navigate('/africa')}
            variant="outline"
            className="glass-button px-8 py-3"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            View Tutorial
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float animate-delay-2s" />
      </div>

      {/* Header */}
      <nav className="glass-card fixed top-4 left-4 right-4 z-50 !margin-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriNexus AI Setup</h1>
              <p className="text-xs text-gray-600">Let's get your farm configured</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Step {currentStep} of {totalSteps}</p>
              <p className="text-xs text-gray-600">{Math.round(progress)}% complete</p>
            </div>
            <div className="w-20">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 1 && renderPersonalInfo()}
            {currentStep === 2 && renderFarmInfo()}
            {currentStep === 3 && renderGoals()}
            {currentStep === 4 && renderPreferences()}
            {currentStep === 5 && renderCompletion()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={currentStep === 1}
                className="glass-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i + 1 <= currentStep ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={handleNext}
                className="glass-button bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0"
              >
                {currentStep === totalSteps - 1 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <div className="glass-card max-w-md mx-auto !margin-0">
          <div className="flex items-center space-x-3 p-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Your data is secure</p>
              <p className="text-xs text-gray-600">End-to-end encrypted and never shared without permission</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;