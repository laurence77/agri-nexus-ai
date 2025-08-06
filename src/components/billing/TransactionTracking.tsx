import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import PaystackService from '@/services/payment/PaystackService';

interface TransactionStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  totalAmount: number;
  successfulAmount: number;
  failedAmount: number;
  averageAmount: number;
  successRate: number;
}

interface TransactionTrend {
  date: Date;
  count: number;
  amount: number;
  successRate: number;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  amount: number;
  successRate: number;
}

interface RecentTransaction {
  id: string;
  reference: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  date: Date;
  customer: string;
  paymentMethod: string;
}

export function TransactionTracking() {
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    totalAmount: 0,
    successfulAmount: 0,
    failedAmount: 0,
    averageAmount: 0,
    successRate: 0
  });
  
  const [trends, setTrends] = useState<TransactionTrend[]>([]);
  const [paymentMethodStats, setPaymentMethodStats] = useState<PaymentMethodStats[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const paystackService = new PaystackService();

  useEffect(() => {
    loadTransactionData();
  }, [selectedPeriod]);

  const loadTransactionData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockStats: TransactionStats = {
        total: 127,
        successful: 115,
        failed: 8,
        pending: 4,
        totalAmount: 1890000,
        successfulAmount: 1725000,
        failedAmount: 120000,
        averageAmount: 14882,
        successRate: 90.55
      };

      const mockTrends: TransactionTrend[] = generateMockTrends();
      const mockPaymentMethods: PaymentMethodStats[] = [
        { method: 'card', count: 87, amount: 1305000, successRate: 92.0 },
        { method: 'bank_transfer', count: 28, amount: 420000, successRate: 89.3 },
        { method: 'ussd', count: 12, amount: 165000, successRate: 83.3 }
      ];

      const mockRecentTransactions: RecentTransaction[] = [
        {
          id: 'txn_1',
          reference: 'agri_1704067200_abc123',
          amount: 15000,
          status: 'success',
          date: new Date(),
          customer: 'john@example.com',
          paymentMethod: 'Visa **** 4321'
        },
        {
          id: 'txn_2', 
          reference: 'agri_1704067100_def456',
          amount: 50000,
          status: 'pending',
          date: new Date(Date.now() - 300000),
          customer: 'jane@example.com',
          paymentMethod: 'Bank Transfer'
        }
      ];

      setStats(mockStats);
      setTrends(mockTrends);
      setPaymentMethodStats(mockPaymentMethods);
      setRecentTransactions(mockRecentTransactions);

    } catch (error) {
      console.error('Error loading transaction data:', error);
    }
    setIsLoading(false);
  };

  const generateMockTrends = (): TransactionTrend[] => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const trends: TransactionTrend[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.push({
        date,
        count: Math.floor(Math.random() * 20) + 5,
        amount: Math.floor(Math.random() * 300000) + 50000,
        successRate: Math.floor(Math.random() * 20) + 80
      });
    }
    
    return trends;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    return PaystackService.getPaymentStatusColor(status);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const calculateTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Tracking</h1>
            <p className="text-gray-600">Monitor payment performance and trends</p>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button onClick={loadTransactionData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              {getTrendIcon(stats.total, stats.total * 0.9)}
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{stats.total}</p>
              <p className="text-sm text-gray-600 mb-2">Total Transactions</p>
              <div className="flex items-center text-sm">
                <span className="text-green-600">
                  +{calculateTrendPercentage(stats.total, stats.total * 0.9)}%
                </span>
                <span className="text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">{stats.successRate}%</p>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{stats.successful}</p>
              <p className="text-sm text-gray-600">Successful</p>
              <Progress value={stats.successRate} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">{((stats.failed / stats.total) * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Failure Rate</p>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{stats.failed}</p>
              <p className="text-sm text-gray-600">Failed</p>
              <Progress value={(stats.failed / stats.total) * 100} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              {getTrendIcon(stats.totalAmount, stats.totalAmount * 0.85)}
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{PaystackService.formatCurrency(stats.totalAmount)}</p>
              <p className="text-sm text-gray-600 mb-2">Total Volume</p>
              <div className="flex items-center text-sm">
                <span className="text-green-600">
                  +{calculateTrendPercentage(stats.totalAmount, stats.totalAmount * 0.85)}%
                </span>
                <span className="text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Transaction Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transaction Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.slice(-7).map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {trend.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-medium">{trend.count} txns</p>
                      <p className="text-gray-600">{PaystackService.formatCurrency(trend.amount)}</p>
                    </div>
                    <Badge className={trend.successRate > 90 ? 'bg-green-100 text-green-800' : 
                                      trend.successRate > 80 ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800'}>
                      {trend.successRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethodStats.map((method, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">
                        {method.method === 'card' ? '💳' : 
                         method.method === 'bank_transfer' ? '🏦' : '📱'}
                      </div>
                      <span className="font-medium capitalize">{method.method.replace('_', ' ')}</span>
                    </div>
                    <Badge className={method.successRate > 90 ? 'bg-green-100 text-green-800' : 
                                      method.successRate > 80 ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800'}>
                      {method.successRate}% success
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Transactions</p>
                      <p className="font-medium">{method.count}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Volume</p>
                      <p className="font-medium">{PaystackService.formatCurrency(method.amount)}</p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={method.successRate} 
                    className="h-2 mt-3"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {getStatusIcon(transaction.status)}
                  <div>
                    <p className="font-medium">{transaction.reference}</p>
                    <div className="text-sm text-gray-600">
                      <p>{transaction.customer}</p>
                      <p>{transaction.paymentMethod}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{PaystackService.formatCurrency(transaction.amount)}</p>
                    <p className="text-sm text-gray-600">
                      {transaction.date.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t text-center">
            <Button variant="outline">
              View All Transactions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-4" />
            <p className="text-2xl font-bold mb-2">
              {Math.floor(stats.total / 1.5)}
            </p>
            <p className="text-sm text-gray-600">Unique Customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-4" />
            <p className="text-2xl font-bold mb-2">
              {PaystackService.formatCurrency(stats.averageAmount)}
            </p>
            <p className="text-sm text-gray-600">Average Transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <PieChart className="h-8 w-8 text-purple-500 mx-auto mb-4" />
            <p className="text-2xl font-bold mb-2">
              {((stats.successfulAmount / stats.totalAmount) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Successful Volume</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TransactionTracking;