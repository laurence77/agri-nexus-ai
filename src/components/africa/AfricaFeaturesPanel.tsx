import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Smartphone,
  MessageSquare,
  Phone,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Globe,
  Radio,
  Wifi,
  WifiOff,
  Languages,
  DollarSign,
  Truck,
  BookOpen,
  Award,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
  Upload,
  Shield,
  Banknote,
  PiggyBank
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface USSDSession {
  code: string;
  description: string;
  lastUsed: string;
  frequency: number;
}

interface MobileMoneyTransaction {
  id: string;
  type: 'payment' | 'receipt' | 'loan' | 'savings';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

interface MarketPrice {
  commodity: string;
  price: number;
  unit: string;
  market: string;
  change: number;
  lastUpdated: string;
}

interface CooperativeUpdate {
  id: string;
  type: 'meeting' | 'payment' | 'equipment' | 'training' | 'news';
  title: string;
  message: string;
  timestamp: string;
  urgent: boolean;
}

const AfricaFeaturesPanel = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('sw'); // Swahili default
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingUSSDActions, setPendingUSSDActions] = useState(0);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const ussdCodes: USSDSession[] = [
    { code: '*384*56#', description: 'Check crop prices', lastUsed: '2 hours ago', frequency: 15 },
    { code: '*384*12#', description: 'Log field work', lastUsed: 'Yesterday', frequency: 8 },
    { code: '*384*99#', description: 'Weather forecast', lastUsed: 'Today', frequency: 12 },
    { code: '*384*78#', description: 'Group savings', lastUsed: '3 days ago', frequency: 4 }
  ];

  const mobileMoneyTransactions: MobileMoneyTransaction[] = [
    {
      id: '1',
      type: 'receipt',
      amount: 15000,
      currency: 'KSH',
      description: 'Maize sale to Mama Grace',
      status: 'completed',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'payment',
      amount: 2500,
      currency: 'KSH',
      description: 'Seeds purchase - Kimani Stores',
      status: 'completed',
      timestamp: 'Yesterday'
    },
    {
      id: '3',
      type: 'loan',
      amount: 8000,
      currency: 'KSH',
      description: 'Fertilizer advance from cooperative',
      status: 'pending',
      timestamp: '3 days ago'
    }
  ];

  const marketPrices: MarketPrice[] = [
    { commodity: 'Maize', price: 35, unit: 'kg', market: 'Wakulima Market', change: +2.5, lastUpdated: '1 hour ago' },
    { commodity: 'Beans', price: 80, unit: 'kg', market: 'Kiambu Market', change: -1.2, lastUpdated: '2 hours ago' },
    { commodity: 'Tomatoes', price: 25, unit: 'kg', market: 'Muthurwa Market', change: +5.8, lastUpdated: '30 min ago' },
    { commodity: 'Onions', price: 45, unit: 'kg', market: 'Nairobi Market', change: -0.5, lastUpdated: '1 hour ago' }
  ];

  const cooperativeUpdates: CooperativeUpdate[] = [
    {
      id: '1',
      type: 'meeting',
      title: 'Monthly Group Meeting',
      message: 'Mkutano wa kila mwezi utafanyika Jumamosi saa 8 asubuhi. Tema: Mazao ya msimu ujao.',
      timestamp: '1 hour ago',
      urgent: true
    },
    {
      id: '2',
      type: 'equipment',
      title: 'Tractor Available',
      message: 'Trekta inapatikana kwa ajili ya kulima mashamba. Wasiliana na Joshua - 0722123456',
      timestamp: '3 hours ago',
      urgent: false
    },
    {
      id: '3',
      type: 'training',
      title: 'Mafunzo ya Kilimo Modern',
      message: 'Mafunzo ya mbinu za kisasa za kilimo - Tarehe 15 mwezi huu. Bure kwa wanachama wote.',
      timestamp: '1 day ago',
      urgent: false
    }
  ];

  const handleUSSDAction = (code: string) => {
    logger.info('USSD code dialed', { code, isOfflineMode }, 'AfricaFeaturesPanel');
    if (isOfflineMode) {
      setPendingUSSDActions(prev => prev + 1);
    }
  };

  const handleMobileMoneyAction = (action: string, amount?: number) => {
    logger.info('Mobile money action requested', { action, amount }, 'AfricaFeaturesPanel');
  };

  const getText = (key: string): string => {
    const translations: { [key: string]: { [lang: string]: string } } = {
      'dashboard': {
        'en': 'Dashboard',
        'sw': 'Dashibodi',
        'ha': 'Dashboard',
        'yo': 'Dashboard',
        'am': 'ዳሽቦርድ',
        'fr': 'Tableau de bord'
      },
      'my_farm': {
        'en': 'My Farm',
        'sw': 'Shamba Langu',
        'ha': 'Gonana',
        'yo': 'Oko Mi',
        'am': 'የኔ እርሻ',
        'fr': 'Ma Ferme'
      },
      'group': {
        'en': 'Group',
        'sw': 'Kikundi',
        'ha': 'Kungiya',
        'yo': 'Egbe',
        'am': 'ቡድን',
        'fr': 'Groupe'
      }
    };
    
    return translations[key]?.[selectedLanguage] || translations[key]?.['en'] || key;
  };

  return (
    <div className="space-y-6">
      {/* Header with Language Selector */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Africa-Smart Features</h2>
              <p className="text-sm text-gray-600">Designed for local needs</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOfflineMode ? (
              <Badge className="glass-badge warning">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline Mode
              </Badge>
            ) : (
              <Badge className="glass-badge success">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`glass-button text-xs px-3 py-1 ${
                selectedLanguage === lang.code ? 'bg-white/20' : ''
              }`}
            >
              <span className="mr-1">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="ussd" className="space-y-4">
        <div className="glass-card !padding-2 !margin-0">
          <TabsList className="w-full bg-transparent grid grid-cols-5 text-xs">
            <TabsTrigger value="ussd" className="glass-button data-[state=active]:bg-white/20">
              <Phone className="w-3 h-3 mr-1" />
              USSD
            </TabsTrigger>
            <TabsTrigger value="mobile-money" className="glass-button data-[state=active]:bg-white/20">
              <CreditCard className="w-3 h-3 mr-1" />
              M-Money
            </TabsTrigger>
            <TabsTrigger value="markets" className="glass-button data-[state=active]:bg-white/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Markets
            </TabsTrigger>
            <TabsTrigger value="cooperative" className="glass-button data-[state=active]:bg-white/20">
              <Users className="w-3 h-3 mr-1" />
              Group
            </TabsTrigger>
            <TabsTrigger value="training" className="glass-button data-[state=active]:bg-white/20">
              <BookOpen className="w-3 h-3 mr-1" />
              Learn
            </TabsTrigger>
          </TabsList>
        </div>

        {/* USSD Integration Tab */}
        <TabsContent value="ussd" className="space-y-4">
          <div className="glass-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">USSD Quick Actions</h3>
                <p className="text-sm text-gray-600">Works on any phone, no internet needed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ussdCodes.map((ussd, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-lg font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {ussd.code}
                    </code>
                    <Badge className="glass-badge info text-xs">
                      {ussd.frequency} uses
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{ussd.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last used: {ussd.lastUsed}</span>
                    <Button 
                      size="sm" 
                      className="glass-button"
                      onClick={() => handleUSSDAction(ussd.code)}
                    >
                      Dial Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {pendingUSSDActions > 0 && (
              <div className="glass-notification warning mt-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {pendingUSSDActions} USSD requests queued for when connection returns
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Mobile Money Tab */}
        <TabsContent value="mobile-money" className="space-y-4">
          <div className="glass-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mobile Money Integration</h3>
                <p className="text-sm text-gray-600">M-Pesa, Airtel Money, MTN Mobile Money</p>
              </div>
            </div>

            {/* Account Balance */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">KSh 23,450</p>
                <p className="text-sm text-green-700">M-Pesa Balance</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">KSh 8,200</p>
                <p className="text-sm text-blue-700">Group Savings</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Button 
                className="glass-button bg-gradient-to-r from-green-500 to-green-600 text-white border-0 h-12 flex-col"
                onClick={() => handleMobileMoneyAction('send_money')}
              >
                <Upload className="w-4 h-4 mb-1" />
                <span className="text-xs">Send Money</span>
              </Button>
              <Button 
                className="glass-button bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 h-12 flex-col"
                onClick={() => handleMobileMoneyAction('request_money')}
              >
                <Download className="w-4 h-4 mb-1" />
                <span className="text-xs">Request</span>
              </Button>
              <Button 
                className="glass-button bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 h-12 flex-col"
                onClick={() => handleMobileMoneyAction('pay_loan')}
              >
                <PiggyBank className="w-4 h-4 mb-1" />
                <span className="text-xs">Pay Loan</span>
              </Button>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Recent Transactions</h4>
              {mobileMoneyTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      transaction.type === 'receipt' ? 'bg-green-100' :
                      transaction.type === 'payment' ? 'bg-red-100' :
                      transaction.type === 'loan' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      {transaction.type === 'receipt' ? <Download className="w-4 h-4 text-green-600" /> :
                       transaction.type === 'payment' ? <Upload className="w-4 h-4 text-red-600" /> :
                       transaction.type === 'loan' ? <Banknote className="w-4 h-4 text-orange-600" /> :
                       <PiggyBank className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.type === 'receipt' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'receipt' ? '+' : '-'}{transaction.currency} {transaction.amount.toLocaleString()}
                    </p>
                    <Badge className={`glass-badge text-xs ${
                      transaction.status === 'completed' ? 'success' :
                      transaction.status === 'pending' ? 'warning' : 'error'
                    }`}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Market Prices Tab */}
        <TabsContent value="markets" className="space-y-4">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Market Intelligence</h3>
                  <p className="text-sm text-gray-600">Real-time commodity prices</p>
                </div>
              </div>
              <Button className="glass-button" size="sm">
                <Radio className="w-4 h-4 mr-1" />
                Subscribe SMS
              </Button>
            </div>

            <div className="space-y-3">
              {marketPrices.map((price, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{price.commodity}</h4>
                    <p className="text-sm text-gray-600">{price.market}</p>
                    <p className="text-xs text-gray-500">Updated {price.lastUpdated}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      KSh {price.price}/{price.unit}
                    </p>
                    <div className={`flex items-center text-sm ${
                      price.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {price.change > 0 ? '↗' : '↘'} {Math.abs(price.change)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-notification info mt-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium">Best Selling Opportunity</p>
                  <p className="text-sm text-gray-600">
                    Tomatoes showing +5.8% increase. Consider selling at Muthurwa Market today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Cooperative Tab */}
        <TabsContent value="cooperative" className="space-y-4">
          <div className="glass-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kibera Farmers Cooperative</h3>
                <p className="text-sm text-gray-600">247 active members</p>
              </div>
            </div>

            {/* Cooperative Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600">KSh 15,000</p>
                <p className="text-xs text-gray-600">My Shares</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">KSh 2,300</p>
                <p className="text-xs text-gray-600">Monthly Savings</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">8%</p>
                <p className="text-xs text-gray-600">Annual Return</p>
              </div>
            </div>

            {/* Group Updates */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Group Updates</h4>
              {cooperativeUpdates.map((update) => (
                <div key={update.id} className={`p-4 rounded-lg border-l-4 ${
                  update.urgent ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={`glass-badge ${update.urgent ? 'error' : 'info'} text-xs`}>
                          {update.type}
                        </Badge>
                        {update.urgent && <Badge className="glass-badge error text-xs">Urgent</Badge>}
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-1">{update.title}</h5>
                      <p className="text-sm text-gray-700 mb-2">{update.message}</p>
                      <p className="text-xs text-gray-500">{update.timestamp}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-2" />
                  </div>
                </div>
              ))}
            </div>

            {/* Group Services */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button className="glass-button h-16 flex-col">
                <Truck className="w-5 h-5 mb-1" />
                <span className="text-xs">Book Transport</span>
              </Button>
              <Button className="glass-button h-16 flex-col">
                <Shield className="w-5 h-5 mb-1" />
                <span className="text-xs">Group Insurance</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="glass-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Agricultural Training</h3>
                <p className="text-sm text-gray-600">Learn modern farming techniques</p>
              </div>
            </div>

            {/* Available Courses */}
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">Modern Maize Farming</h4>
                    <p className="text-sm text-gray-600">Increase your maize yield by 40%</p>
                  </div>
                  <Badge className="glass-badge success">Free</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>📱 Mobile friendly</span>
                    <span>🎧 Audio available</span>
                    <span>🏆 Certificate</span>
                  </div>
                  <Button size="sm" className="glass-button">
                    Start Learning
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">Organic Pest Control</h4>
                    <p className="text-sm text-gray-600">Natural methods to protect your crops</p>
                  </div>
                  <Badge className="glass-badge info">New</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>📱 Mobile friendly</span>
                    <span>🎥 Video lessons</span>
                    <span>💰 Income boost</span>
                  </div>
                  <Button size="sm" className="glass-button">
                    Start Learning
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">Financial Management for Farmers</h4>
                    <p className="text-sm text-gray-600">Manage your farm finances effectively</p>
                  </div>
                  <Badge className="glass-badge warning">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-full mr-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full progress-65"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">65% complete</p>
                  </div>
                  <Button size="sm" className="glass-button">
                    Continue
                  </Button>
                </div>
              </div>
            </div>

            {/* Achievement */}
            <div className="glass-notification success mt-4">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Achievement Unlocked!</p>
                  <p className="text-sm text-green-700">
                    Completed "Soil Health Management" - Earned 50 points
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AfricaFeaturesPanel;