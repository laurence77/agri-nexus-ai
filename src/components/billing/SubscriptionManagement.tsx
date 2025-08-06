import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  Zap,
  Star,
  Crown,
  Building2,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Download,
  Receipt,
  Settings,
  Bell,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import PaystackService from '@/services/payment/PaystackService';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxFarms: number;
  maxUsers: number;
  maxAnimals: number;
  maxCrops: number;
  storageGB: number;
  supportLevel: 'basic' | 'priority' | 'dedicated';
  aiFeatures: boolean;
  mobileApp: boolean;
  apiAccess: boolean;
  customReports: boolean;
  multiTenant: boolean;
  popular?: boolean;
}

interface UserSubscription {
  id: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  customerId: string;
  subscriptionCode: string;
  paymentMethod?: {
    type: string;
    last4: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
  };
  usage: {
    farms: number;
    users: number;
    animals: number;
    crops: number;
    storageUsed: number;
  };
}

interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: Date;
  description: string;
  invoiceUrl?: string;
  receiptUrl?: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small farms getting started',
    price: 5000,
    currency: 'NGN',
    interval: 'monthly',
    features: [
      'Up to 2 farms',
      '5 users',
      '100 animals',
      '50 crop records',
      'Basic reporting',
      'Email support',
      'Mobile app access'
    ],
    maxFarms: 2,
    maxUsers: 5,
    maxAnimals: 100,
    maxCrops: 50,
    storageGB: 5,
    supportLevel: 'basic',
    aiFeatures: false,
    mobileApp: true,
    apiAccess: false,
    customReports: false,
    multiTenant: false
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing agricultural businesses',
    price: 15000,
    currency: 'NGN',
    interval: 'monthly',
    features: [
      'Up to 10 farms',
      '25 users',
      'Unlimited animals',
      'Unlimited crops',
      'Advanced analytics',
      'AI-powered insights',
      'Priority support',
      'API access',
      'Custom reports'
    ],
    maxFarms: 10,
    maxUsers: 25,
    maxAnimals: -1,
    maxCrops: -1,
    storageGB: 50,
    supportLevel: 'priority',
    aiFeatures: true,
    mobileApp: true,
    apiAccess: true,
    customReports: true,
    multiTenant: true,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations and cooperatives',
    price: 50000,
    currency: 'NGN',
    interval: 'monthly',
    features: [
      'Unlimited farms',
      'Unlimited users',
      'Unlimited animals & crops',
      'Advanced AI features',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
      'On-premise deployment',
      'SLA guarantee'
    ],
    maxFarms: -1,
    maxUsers: -1,
    maxAnimals: -1,
    maxCrops: -1,
    storageGB: 500,
    supportLevel: 'dedicated',
    aiFeatures: true,
    mobileApp: true,
    apiAccess: true,
    customReports: true,
    multiTenant: true
  }
];

export function SubscriptionManagement() {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const paystackService = new PaystackService();

  useEffect(() => {
    loadSubscriptionData();
    loadBillingHistory();
  }, []);

  const loadSubscriptionData = async () => {
    // Simulate loading current subscription
    const mockSubscription: UserSubscription = {
      id: 'sub_1',
      planId: 'professional',
      status: 'active',
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2024-02-01'),
      cancelAtPeriodEnd: false,
      customerId: 'cus_123',
      subscriptionCode: 'SUB_123456',
      paymentMethod: {
        type: 'card',
        last4: '4321',
        brand: 'Visa',
        expiryMonth: '12',
        expiryYear: '26'
      },
      usage: {
        farms: 3,
        users: 12,
        animals: 245,
        crops: 18,
        storageUsed: 15.6
      }
    };
    setCurrentSubscription(mockSubscription);
  };

  const loadBillingHistory = async () => {
    // Simulate loading billing history
    const mockHistory: BillingHistory[] = [
      {
        id: 'inv_1',
        amount: 15000,
        currency: 'NGN',
        status: 'paid',
        date: new Date('2024-01-01'),
        description: 'Professional Plan - January 2024',
        receiptUrl: '/api/receipts/inv_1'
      },
      {
        id: 'inv_2',
        amount: 15000,
        currency: 'NGN',
        status: 'paid',
        date: new Date('2023-12-01'),
        description: 'Professional Plan - December 2023',
        receiptUrl: '/api/receipts/inv_2'
      }
    ];
    setBillingHistory(mockHistory);
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    setPaymentLoading(true);
    setSelectedPlan(plan);

    try {
      // Initialize Paystack transaction
      const transaction = await paystackService.initializeTransaction({
        email: 'user@example.com', // Get from user context
        amount: PaystackService.toKobo(plan.price),
        currency: plan.currency,
        metadata: {
          planId: plan.id,
          planName: plan.name,
          interval: plan.interval,
          userId: 'user_123', // Get from user context
          tenantId: 'tenant_123' // Get from user context
        },
        channels: ['card', 'bank', 'ussd', 'bank_transfer']
      });

      if (transaction.status) {
        // Open Paystack payment popup
        PaystackService.initializePaystackPopup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          email: 'user@example.com',
          amount: PaystackService.toKobo(plan.price),
          currency: plan.currency,
          ref: transaction.data.reference,
          metadata: {
            planId: plan.id,
            planName: plan.name
          },
          callback: (response) => {
            handlePaymentSuccess(response);
          },
          onClose: () => {
            setPaymentLoading(false);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      setPaymentLoading(false);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      // Verify transaction
      const verification = await paystackService.verifyTransaction(response.reference);
      
      if (verification.status && verification.data.status === 'success') {
        // Update subscription status
        await updateSubscription(selectedPlan!);
        setShowUpgradeModal(false);
        setPaymentLoading(false);
        alert('Subscription upgraded successfully!');
        loadSubscriptionData();
        loadBillingHistory();
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentLoading(false);
      alert('Payment verification failed. Please contact support.');
    }
  };

  const updateSubscription = async (plan: SubscriptionPlan) => {
    // Update subscription in database
    // This would typically be handled by a webhook
    console.log('Updating subscription to:', plan.name);
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      if (currentSubscription) {
        await paystackService.cancelSubscription(
          currentSubscription.subscriptionCode,
          'cancel_token' // This would be generated by your backend
        );
        
        // Update local state
        setCurrentSubscription({
          ...currentSubscription,
          cancelAtPeriodEnd: true
        });
        
        setShowCancelModal(false);
        alert('Subscription will be cancelled at the end of the current period.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please contact support.');
    }
    setIsLoading(false);
  };

  const getCurrentPlanDetails = () => {
    if (!currentSubscription) return null;
    return subscriptionPlans.find(plan => plan.id === currentSubscription.planId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const calculateUsagePercentage = (used: number, max: number) => {
    if (max === -1) return 0; // Unlimited
    return Math.min((used / max) * 100, 100);
  };

  const currentPlan = getCurrentPlanDetails();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
        <p className="text-gray-600">Manage your subscription, billing, and usage</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Subscription */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Current Subscription</CardTitle>
                    {currentSubscription && (
                      <Badge className={getStatusColor(currentSubscription.status)}>
                        {currentSubscription.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {currentPlan && currentSubscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            {currentPlan.popular && <Star className="h-5 w-5 text-yellow-500" />}
                            {currentPlan.name}
                          </h3>
                          <p className="text-gray-600">{currentPlan.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {PaystackService.formatCurrency(currentPlan.price)}
                          </p>
                          <p className="text-sm text-gray-600">per {currentPlan.interval}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Current Period</p>
                          <p className="font-medium">
                            {currentSubscription.currentPeriodStart.toLocaleDateString()} - {currentSubscription.currentPeriodEnd.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Next Billing</p>
                          <p className="font-medium">
                            {currentSubscription.currentPeriodEnd.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {currentSubscription.paymentMethod && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="font-medium">
                              {currentSubscription.paymentMethod.brand} •••• {currentSubscription.paymentMethod.last4}
                            </span>
                            <span className="text-sm text-gray-600">
                              {currentSubscription.paymentMethod.expiryMonth}/{currentSubscription.paymentMethod.expiryYear}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setShowUpgradeModal(true)}
                          className="flex-1"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCancelModal(true)}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      </div>

                      {currentSubscription.cancelAtPeriodEnd && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <p className="text-sm text-yellow-800">
                              Your subscription will be cancelled on {currentSubscription.currentPeriodEnd.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No active subscription</p>
                      <Button onClick={() => setShowUpgradeModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Choose a Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Receipt className="h-4 w-4 mr-2" />
                    Payment History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Billing Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingHistory.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{PaystackService.formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-gray-600">{payment.date.toLocaleDateString()}</p>
                        </div>
                        <Badge className={PaystackService.getPaymentStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''} ${
                  currentSubscription?.planId === plan.id ? 'bg-blue-50' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="mb-4">
                    {plan.id === 'starter' && <Zap className="h-8 w-8 mx-auto text-green-500" />}
                    {plan.id === 'professional' && <Crown className="h-8 w-8 mx-auto text-blue-500" />}
                    {plan.id === 'enterprise' && <Building2 className="h-8 w-8 mx-auto text-purple-500" />}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  <div className="my-4">
                    <span className="text-3xl font-bold">{PaystackService.formatCurrency(plan.price)}</span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-6">
                    <div>Farms: {plan.maxFarms === -1 ? 'Unlimited' : plan.maxFarms}</div>
                    <div>Users: {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</div>
                    <div>Storage: {plan.storageGB}GB</div>
                    <div>Support: {plan.supportLevel}</div>
                  </div>

                  {currentSubscription?.planId === plan.id ? (
                    <Button disabled className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUpgrade(plan)}
                      disabled={paymentLoading}
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {paymentLoading && selectedPlan?.id === plan.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TrendingUp className="h-4 w-4 mr-2" />
                      )}
                      {currentSubscription ? 'Upgrade' : 'Choose Plan'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need a Custom Plan?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Looking for a custom solution? We offer tailored plans for large organizations, 
                cooperatives, and government agencies.
              </p>
              <Button variant="outline">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <p className="text-gray-600">View and download your payment history</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-gray-600">{payment.date.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{PaystackService.formatCurrency(payment.amount)}</p>
                        <Badge className={PaystackService.getPaymentStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {payment.receiptUrl && (
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                        {payment.invoiceUrl && (
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <p className="text-gray-600">Current usage vs plan limits</p>
              </CardHeader>
              <CardContent>
                {currentSubscription && currentPlan && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Farms</span>
                        <span>
                          {currentSubscription.usage.farms}
                          {currentPlan.maxFarms !== -1 && ` / ${currentPlan.maxFarms}`}
                        </span>
                      </div>
                      {currentPlan.maxFarms !== -1 && (
                        <Progress 
                          value={calculateUsagePercentage(currentSubscription.usage.farms, currentPlan.maxFarms)} 
                          className="h-2" 
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Users</span>
                        <span>
                          {currentSubscription.usage.users}
                          {currentPlan.maxUsers !== -1 && ` / ${currentPlan.maxUsers}`}
                        </span>
                      </div>
                      {currentPlan.maxUsers !== -1 && (
                        <Progress 
                          value={calculateUsagePercentage(currentSubscription.usage.users, currentPlan.maxUsers)} 
                          className="h-2" 
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Animals</span>
                        <span>
                          {currentSubscription.usage.animals}
                          {currentPlan.maxAnimals !== -1 && ` / ${currentPlan.maxAnimals}`}
                        </span>
                      </div>
                      {currentPlan.maxAnimals !== -1 && (
                        <Progress 
                          value={calculateUsagePercentage(currentSubscription.usage.animals, currentPlan.maxAnimals)} 
                          className="h-2" 
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Storage</span>
                        <span>{currentSubscription.usage.storageUsed}GB / {currentPlan.storageGB}GB</span>
                      </div>
                      <Progress 
                        value={calculateUsagePercentage(currentSubscription.usage.storageUsed, currentPlan.storageGB)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <p className="text-gray-600">Track your resource consumption</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Usage Insights</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      Your farm count has increased by 50% this month. Consider upgrading for better management.
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Optimization Tip</span>
                    </div>
                    <p className="text-sm text-green-800">
                      You're efficiently using your storage. Great job on data management!
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Reminder</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Your next billing cycle starts in 5 days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Billing Email</Label>
                  <Input 
                    type="email" 
                    defaultValue="billing@example.com" 
                    placeholder="Enter billing email"
                  />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input 
                    defaultValue="AgriTech Solutions Ltd" 
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label>Tax ID / VAT Number</Label>
                  <Input 
                    placeholder="Enter tax identification number"
                  />
                </div>
                <Button>Update Billing Info</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-gray-600">Get notified before payments</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Usage Alerts</p>
                    <p className="text-sm text-gray-600">Alerts when approaching limits</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Receipt Emails</p>
                    <p className="text-sm text-gray-600">Email receipts after payments</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Choose Your Plan</h3>
            <p className="text-gray-600 mb-6">
              Select a plan that best fits your agricultural business needs.
            </p>
            <div className="space-y-3">
              {subscriptionPlans.map((plan) => (
                <Button
                  key={plan.id}
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => handleUpgrade(plan)}
                  disabled={paymentLoading}
                >
                  <span>{plan.name}</span>
                  <span>{PaystackService.formatCurrency(plan.price)}</span>
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Cancel Subscription</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionManagement;