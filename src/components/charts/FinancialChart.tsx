import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Target,
  Calendar,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  crops: {
    maize: number;
    beans: number;
    tomatoes: number;
    other: number;
  };
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface FinancialChartProps {
  timeframe?: 'quarterly' | 'yearly' | 'seasonal';
  currency?: 'KSH' | 'USD' | 'NGN';
}

const FinancialChart = ({ timeframe = 'quarterly', currency = 'KSH' }: FinancialChartProps) => {
  const [selectedView, setSelectedView] = useState<'revenue' | 'expenses' | 'profit'>('revenue');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  const financialData: FinancialData[] = [
    {
      month: 'Jan',
      revenue: 45000,
      expenses: 28000,
      profit: 17000,
      crops: { maize: 25000, beans: 12000, tomatoes: 8000, other: 0 }
    },
    {
      month: 'Feb',
      revenue: 52000,
      expenses: 31000,
      profit: 21000,
      crops: { maize: 28000, beans: 15000, tomatoes: 9000, other: 0 }
    },
    {
      month: 'Mar',
      revenue: 38000,
      expenses: 25000,
      profit: 13000,
      crops: { maize: 20000, beans: 10000, tomatoes: 8000, other: 0 }
    },
    {
      month: 'Apr',
      revenue: 67000,
      expenses: 35000,
      profit: 32000,
      crops: { maize: 35000, beans: 18000, tomatoes: 14000, other: 0 }
    },
    {
      month: 'May',
      revenue: 71000,
      expenses: 38000,
      profit: 33000,
      crops: { maize: 40000, beans: 20000, tomatoes: 11000, other: 0 }
    },
    {
      month: 'Jun',
      revenue: 58000,
      expenses: 32000,
      profit: 26000,
      crops: { maize: 30000, beans: 16000, tomatoes: 12000, other: 0 }
    }
  ];

  const expenseCategories: ExpenseCategory[] = [
    { category: 'Seeds & Fertilizer', amount: 12000, percentage: 35, color: 'from-emerald-500 to-green-600' },
    { category: 'Labor', amount: 8500, percentage: 25, color: 'from-blue-500 to-blue-600' },
    { category: 'Equipment', amount: 6800, percentage: 20, color: 'from-purple-500 to-purple-600' },
    { category: 'Transport', amount: 4250, percentage: 12, color: 'from-orange-500 to-orange-600' },
    { category: 'Other', amount: 2720, percentage: 8, color: 'from-gray-500 to-gray-600' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev < 100 ? prev + 2 : 100));
    }, 50);
    return () => clearInterval(timer);
  }, [selectedView]);

  const totalRevenue = financialData.reduce((sum, data) => sum + data.revenue, 0);
  const totalExpenses = financialData.reduce((sum, data) => sum + data.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = (totalProfit / totalRevenue) * 100;

  const latestMonth = financialData[financialData.length - 1];
  const previousMonth = financialData[financialData.length - 2];
  const revenueGrowth = ((latestMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;

  const maxValue = Math.max(...financialData.map(d => Math.max(d.revenue, d.expenses, d.profit)));
  
  const getBarHeight = (value: number) => {
    return (value / maxValue) * 200; // 200px max height
  };

  const formatCurrency = (amount: number) => {
    const formatters = {
      KSH: (val: number) => `KSh ${val.toLocaleString()}`,
      USD: (val: number) => `$${(val / 100).toLocaleString()}`, // Assuming 1 USD = 100 KSH
      NGN: (val: number) => `₦${(val * 5).toLocaleString()}` // Assuming 1 KSH = 5 NGN
    };
    return formatters[currency](amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Financial Analytics</h3>
              <p className="text-sm text-gray-600">Farm revenue, expenses and profitability</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="glass-input !padding-2 text-sm border-0"
            >
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="seasonal">Seasonal</option>
            </select>
            <select 
              value={currency}
              className="glass-input !padding-2 text-sm border-0"
            >
              <option value="KSH">KSH</option>
              <option value="USD">USD</option>
              <option value="NGN">NGN</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
            </div>
            <p className="text-sm text-green-700">Total Revenue</p>
            <div className="flex items-center justify-center space-x-1 mt-1">
              {revenueGrowth > 0 ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
              <span className={`text-xs ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <CreditCard className="w-4 h-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
            </div>
            <p className="text-sm text-red-700">Total Expenses</p>
            <p className="text-xs text-red-600">{((totalExpenses / totalRevenue) * 100).toFixed(1)}% of revenue</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</span>
            </div>
            <p className="text-sm text-blue-700">Net Profit</p>
            <p className="text-xs text-blue-600">{profitMargin.toFixed(1)}% margin</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{formatCurrency(latestMonth.revenue)}</span>
            </div>
            <p className="text-sm text-purple-700">Latest Month</p>
            <p className="text-xs text-purple-600">June 2024</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue/Expense Chart */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Financial Trends</h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedView('revenue')}
                className={`glass-button text-xs ${selectedView === 'revenue' ? 'bg-white/30' : ''}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedView('expenses')}
                className={`glass-button text-xs ${selectedView === 'expenses' ? 'bg-white/30' : ''}`}
              >
                Expenses
              </button>
              <button
                onClick={() => setSelectedView('profit')}
                className={`glass-button text-xs ${selectedView === 'profit' ? 'bg-white/30' : ''}`}
              >
                Profit
              </button>
            </div>
          </div>

          <div className="relative bg-white/50 rounded-xl p-6" style={{ height: '280px' }}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-6 bottom-6 flex flex-col justify-between text-xs text-gray-500 w-12">
              <span>{formatCurrency(maxValue)}</span>
              <span>{formatCurrency(maxValue / 2)}</span>
              <span>{formatCurrency(0)}</span>
            </div>

            {/* Chart content */}
            <div className="ml-14 mr-4 h-full flex items-end justify-between space-x-2">
              {financialData.map((data, index) => {
                const value = data[selectedView];
                const barHeight = getBarHeight(value);
                const animatedHeight = (barHeight * animationProgress) / 100;
                
                const getBarColor = () => {
                  switch (selectedView) {
                    case 'revenue': return 'from-green-500 to-emerald-600';
                    case 'expenses': return 'from-red-500 to-red-600';
                    case 'profit': return 'from-blue-500 to-blue-600';
                    default: return 'from-gray-500 to-gray-600';
                  }
                };
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    {/* Bar */}
                    <div className="relative w-full flex justify-center" style={{ height: '200px' }}>
                      <div 
                        className={`bg-gradient-to-t ${getBarColor()} rounded-t-lg transition-all duration-1000 ease-out`}
                        style={{ 
                          width: '24px', 
                          height: `${animatedHeight}px`,
                          opacity: animationProgress / 100
                        }}
                      ></div>
                    </div>
                    
                    {/* Month label */}
                    <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="glass-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Expense Breakdown</h4>
          </div>

          <div className="space-y-4">
            {expenseCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(category.amount)}</span>
                    <span className="text-xs text-gray-500">({category.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${(category.percentage * animationProgress) / 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total Monthly Expenses</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(expenseCategories.reduce((sum, cat) => sum + cat.amount, 0))}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                {((expenseCategories.reduce((sum, cat) => sum + cat.amount, 0) / latestMonth.revenue) * 100).toFixed(1)}% of monthly revenue
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Revenue Breakdown */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Revenue by Crop</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(latestMonth.crops).map(([crop, amount], index) => {
            if (amount === 0) return null;
            const colors = ['from-yellow-500 to-orange-500', 'from-green-500 to-emerald-600', 'from-red-500 to-pink-600', 'from-purple-500 to-indigo-600'];
            const percentage = (amount / latestMonth.revenue) * 100;
            
            return (
              <div key={crop} className="text-center p-4 bg-white/50 rounded-lg">
                <div className={`w-12 h-12 bg-gradient-to-r ${colors[index]} rounded-xl flex items-center justify-center text-white mx-auto mb-3`}>
                  <span className="text-xs font-bold">{crop.slice(0, 2).toUpperCase()}</span>
                </div>
                <h5 className="font-semibold text-gray-900 capitalize">{crop}</h5>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(amount)}</p>
                <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className={`bg-gradient-to-r ${colors[index]} h-1 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${(percentage * animationProgress) / 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;