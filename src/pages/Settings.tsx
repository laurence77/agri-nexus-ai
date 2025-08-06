import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Globe,
  Smartphone,
  Database,
  Zap,
  ArrowLeft,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  Moon,
  Sun,
  Languages,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Profile Settings
    profile: {
      name: 'John Kamau',
      email: 'john.kamau@example.com',
      phone: '+254 722 123 456',
      location: 'Kiambu, Kenya',
      farmSize: '5.5',
      primaryCrop: 'maize',
      experience: '8'
    },
    // Notification Settings
    notifications: {
      weatherAlerts: true,
      priceUpdates: true,
      equipmentMaintenance: true,
      yieldPredictions: true,
      cooperativeUpdates: true,
      smsNotifications: true,
      emailNotifications: true,
      pushNotifications: true,
      marketOpportunities: true,
      aiRecommendations: true
    },
    // System Settings
    system: {
      theme: 'light',
      language: 'en',
      currency: 'KSH',
      timezone: 'Africa/Nairobi',
      units: 'metric',
      autoSync: true,
      offlineMode: false,
      dataCompression: true,
      autoBackup: true
    },
    // Privacy & Security
    privacy: {
      dataSharing: false,
      analytics: true,
      locationTracking: true,
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordStrength: 'medium'
    },
    // Integration Settings
    integrations: {
      ussdEnabled: true,
      mobileMoneyIntegration: true,
      weatherAPI: true,
      marketDataAPI: true,
      cooperativeSync: true,
      equipmentConnected: 2,
      sensorsConnected: 8
    }
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Show success notification
    }, 2000);
  };

  const handleReset = () => {
    // Reset to default settings
    console.log('Reset to defaults');
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agrinexus-settings.json';
    link.click();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-slate-400/10 to-gray-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-gray-400/10 to-blue-400/10 rounded-full blur-3xl animate-float animate-delay-2s" />
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
              <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
                <p className="text-xs text-gray-600">Configure your AgriNexus AI experience</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="glass-button !padding-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={exportSettings}
              className="glass-button !padding-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="glass-button bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 !padding-2"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 px-4 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="glass-card">
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center">
                  <SettingsIcon className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-slate-600 to-gray-700 bg-clip-text text-transparent">
                  Configuration Center
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Customize your AgriNexus AI platform settings, notifications, security preferences, 
                and integration options to optimize your farming experience.
              </p>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <div className="glass-card !padding-3 !margin-0">
              <TabsList className="w-full bg-transparent grid grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="profile" className="glass-button data-[state=active]:bg-white/20">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="glass-button data-[state=active]:bg-white/20">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="system" className="glass-button data-[state=active]:bg-white/20">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  System
                </TabsTrigger>
                <TabsTrigger value="privacy" className="glass-button data-[state=active]:bg-white/20">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="integrations" className="glass-button data-[state=active]:bg-white/20">
                  <Zap className="w-4 h-4 mr-2" />
                  Integrations
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <div className="glass-card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                    <p className="text-sm text-gray-600">Manage your personal and farm details</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={settings.profile.name}
                        onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                        className="glass-input w-full"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                        className="glass-input w-full"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                        className="glass-input w-full"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={settings.profile.location}
                          onChange={(e) => updateSetting('profile', 'location', e.target.value)}
                          className="glass-input w-full pl-10"
                          placeholder="Farm location"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size (acres)</label>
                      <input
                        type="number"
                        value={settings.profile.farmSize}
                        onChange={(e) => updateSetting('profile', 'farmSize', e.target.value)}
                        className="glass-input w-full"
                        placeholder="Total farm size"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="primaryCrop" className="block text-sm font-medium text-gray-700 mb-2">Primary Crop</label>
                      <select
                        id="primaryCrop"
                        value={settings.profile.primaryCrop}
                        onChange={(e) => updateSetting('profile', 'primaryCrop', e.target.value)}
                        className="glass-input w-full"
                        aria-label="Select your primary crop type"
                        title="Primary Crop"
                      >
                        <option value="maize">Maize</option>
                        <option value="beans">Beans</option>
                        <option value="tomatoes">Tomatoes</option>
                        <option value="cassava">Cassava</option>
                        <option value="rice">Rice</option>
                        <option value="wheat">Wheat</option>
                        <option value="coffee">Coffee</option>
                        <option value="tea">Tea</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                      <input
                        type="number"
                        value={settings.profile.experience}
                        onChange={(e) => updateSetting('profile', 'experience', e.target.value)}
                        className="glass-input w-full"
                        placeholder="Years farming"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Change Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="glass-input w-full pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Profile Completion</p>
                      <p className="text-sm text-blue-700">
                        Complete your profile to receive personalized AI recommendations and better yield predictions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="glass-card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                    <p className="text-sm text-gray-600">Choose how you want to receive updates and alerts</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Alert Types */}
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Alert Types</h4>
                    
                    {[
                      { key: 'weatherAlerts', label: 'Weather Alerts', desc: 'Severe weather warnings and optimal conditions' },
                      { key: 'priceUpdates', label: 'Market Price Updates', desc: 'Real-time commodity price changes' },
                      { key: 'equipmentMaintenance', label: 'Equipment Maintenance', desc: 'Scheduled maintenance reminders' },
                      { key: 'yieldPredictions', label: 'Yield Predictions', desc: 'AI-generated crop yield forecasts' },
                      { key: 'cooperativeUpdates', label: 'Cooperative Updates', desc: 'Group announcements and meetings' },
                      { key: 'marketOpportunities', label: 'Market Opportunities', desc: 'Buying and selling recommendations' },
                      { key: 'aiRecommendations', label: 'AI Recommendations', desc: 'Automated farming suggestions' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <Switch
                          checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                          onCheckedChange={(checked) => updateSetting('notifications', item.key, checked)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Delivery Methods */}
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Delivery Methods</h4>
                    
                    {[
                      { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Text messages to your phone', icon: <Smartphone className="w-4 h-4" /> },
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Updates sent to your email', icon: <Globe className="w-4 h-4" /> },
                      { key: 'pushNotifications', label: 'Push Notifications', desc: 'In-app notification alerts', icon: <Bell className="w-4 h-4" /> }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                          onCheckedChange={(checked) => updateSetting('notifications', item.key, checked)}
                        />
                      </div>
                    ))}

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">USSD Notifications Active</p>
                          <p className="text-sm text-green-700">
                            Critical alerts will be sent via USSD to ensure delivery on all phone types.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Display & Localization */}
                <div className="glass-card">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Display & Localization</h3>
                      <p className="text-sm text-gray-600">Customize appearance and regional settings</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => updateSetting('system', 'theme', 'light')}
                          className={`glass-button flex-1 ${settings.system.theme === 'light' ? 'bg-white/30' : ''}`}
                        >
                          <Sun className="w-4 h-4 mr-2" />
                          Light
                        </button>
                        <button
                          onClick={() => updateSetting('system', 'theme', 'dark')}
                          className={`glass-button flex-1 ${settings.system.theme === 'dark' ? 'bg-white/30' : ''}`}
                        >
                          <Moon className="w-4 h-4 mr-2" />
                          Dark
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <div className="relative">
                        <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          id="language"
                          value={settings.system.language}
                          onChange={(e) => updateSetting('system', 'language', e.target.value)}
                          className="glass-input w-full pl-10"
                          aria-label="Select your preferred language"
                          title="Language"
                        >
                          <option value="en">English</option>
                          <option value="sw">Kiswahili</option>
                          <option value="ha">Hausa</option>
                          <option value="yo">Yoruba</option>
                          <option value="am">Amharic</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          id="currency"
                          value={settings.system.currency}
                          onChange={(e) => updateSetting('system', 'currency', e.target.value)}
                          className="glass-input w-full pl-10"
                          aria-label="Select your preferred currency"
                          title="Currency"
                        >
                          <option value="KSH">Kenyan Shilling (KSH)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="NGN">Nigerian Naira (NGN)</option>
                          <option value="GHS">Ghanaian Cedi (GHS)</option>
                          <option value="TZS">Tanzanian Shilling (TZS)</option>
                          <option value="UGX">Ugandan Shilling (UGX)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          id="timezone"
                          value={settings.system.timezone}
                          onChange={(e) => updateSetting('system', 'timezone', e.target.value)}
                          className="glass-input w-full pl-10"
                          aria-label="Select your timezone"
                          title="Timezone"
                        >
                          <option value="Africa/Nairobi">East Africa Time (GMT+3)</option>
                          <option value="Africa/Lagos">West Africa Time (GMT+1)</option>
                          <option value="Africa/Cairo">Egypt Time (GMT+2)</option>
                          <option value="Africa/Johannesburg">South Africa Time (GMT+2)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data & Sync */}
                <div className="glass-card">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Data & Synchronization</h3>
                      <p className="text-sm text-gray-600">Manage data storage and sync preferences</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'autoSync', label: 'Auto Sync', desc: 'Automatically sync data when connected' },
                      { key: 'offlineMode', label: 'Offline Mode', desc: 'Enable offline functionality' },
                      { key: 'dataCompression', label: 'Data Compression', desc: 'Reduce data usage with compression' },
                      { key: 'autoBackup', label: 'Auto Backup', desc: 'Automatically backup your data' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <Switch
                          checked={settings.system[item.key as keyof typeof settings.system] as boolean}
                          onCheckedChange={(checked) => updateSetting('system', item.key, checked)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button className="glass-button w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Settings
                    </Button>
                    <Button variant="outline" className="glass-button w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Local Data
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Privacy & Security */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="glass-card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
                    <p className="text-sm text-gray-600">Control your data privacy and account security</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Privacy Controls</h4>
                    
                    {[
                      { key: 'dataSharing', label: 'Data Sharing', desc: 'Share anonymized data for research' },
                      { key: 'analytics', label: 'Usage Analytics', desc: 'Help improve the platform' },
                      { key: 'locationTracking', label: 'Location Tracking', desc: 'Enable location-based features' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <Switch
                          checked={settings.privacy[item.key as keyof typeof settings.privacy] as boolean}
                          onCheckedChange={(checked) => updateSetting('privacy', item.key, checked)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Security Settings</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Add extra security to your account</p>
                      </div>
                      <Switch
                        checked={settings.privacy.twoFactorAuth}
                        onCheckedChange={(checked) => updateSetting('privacy', 'twoFactorAuth', checked)}
                      />
                    </div>

                    <div>
                      <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <select
                        id="sessionTimeout"
                        value={settings.privacy.sessionTimeout}
                        onChange={(e) => updateSetting('privacy', 'sessionTimeout', e.target.value)}
                        className="glass-input w-full"
                        aria-label="Select session timeout duration"
                        title="Session Timeout"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Security Notice</p>
                          <p className="text-sm text-yellow-700">
                            Enable two-factor authentication for enhanced account security.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Integration Settings */}
            <TabsContent value="integrations" className="space-y-6">
              <div className="glass-card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Integrations & Connections</h3>
                    <p className="text-sm text-gray-600">Manage external services and device connections</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Service Integrations</h4>
                    
                    {[
                      { key: 'ussdEnabled', label: 'USSD Integration', desc: 'Enable USSD code functionality', status: 'active' },
                      { key: 'mobileMoneyIntegration', label: 'Mobile Money', desc: 'M-Pesa, Airtel Money integration', status: 'active' },
                      { key: 'weatherAPI', label: 'Weather API', desc: 'Real-time weather data', status: 'active' },
                      { key: 'marketDataAPI', label: 'Market Data API', desc: 'Live commodity prices', status: 'active' },
                      { key: 'cooperativeSync', label: 'Cooperative Sync', desc: 'Group data synchronization', status: 'active' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.integrations[item.key as keyof typeof settings.integrations] as boolean}
                          onCheckedChange={(checked) => updateSetting('integrations', item.key, checked)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Connected Devices</h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-green-900">Sensors Connected</h5>
                          <Badge className="glass-badge success">{settings.integrations.sensorsConnected} active</Badge>
                        </div>
                        <p className="text-sm text-green-700">
                          Temperature, humidity, soil moisture sensors operational
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-blue-900">Equipment Connected</h5>
                          <Badge className="glass-badge info">{settings.integrations.equipmentConnected} devices</Badge>
                        </div>
                        <p className="text-sm text-blue-700">
                          Irrigation systems and tractors with IoT connectivity
                        </p>
                      </div>

                      <Button className="glass-button w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Add New Device
                      </Button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">API Status</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Weather API</span>
                          <span className="text-green-600">●  Online</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Market Data</span>
                          <span className="text-green-600">●  Online</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Mobile Money</span>
                          <span className="text-green-600">●  Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;