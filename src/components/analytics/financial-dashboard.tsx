import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { FinancialRecord, YieldRecord } from '@/types';
import { logger } from '@/lib/logger';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Target,
  Calendar,
  FileText,
  Download
} from 'lucide-react';

export function FinancialDashboard() {
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [yieldRecords, setYieldRecords] = useState<YieldRecord[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod, selectedFarm]);

  const loadFinancialData = async () => {
    // Simulate API calls
    const mockFinancialRecords = generateMockFinancialRecords();
    const mockYieldRecords = generateMockYieldRecords();
    
    setFinancialRecords(mockFinancialRecords);
    setYieldRecords(mockYieldRecords);
  };

  // Calculate financial metrics
  const totalRevenue = financialRecords
    .filter(r => r.type === 'income')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalExpenses = financialRecords
    .filter(r => r.type === 'expense')
    .reduce((acc, r) => acc + r.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Calculate ROI per acre
  const totalAcres = 450; // This would come from farm data
  const revenuePerAcre = totalRevenue / totalAcres;
  const expensePerAcre = totalExpenses / totalAcres;
  const profitPerAcre = netProfit / totalAcres;

  // Monthly data for charts
  const monthlyData = generateMonthlyFinancialData(financialRecords);
  const expenseBreakdown = generateExpenseBreakdown(financialRecords);
  const cropROIData = generateCropROIData(yieldRecords, financialRecords);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Financial Analytics & ROI
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track profitability, expenses, and return on investment
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Financial Record</DialogTitle>
              </DialogHeader>
              <FinancialRecordForm onSubmit={() => setIsAddRecordOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xs text-green-600">${revenuePerAcre.toFixed(0)}/acre</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg mr-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalExpenses.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-xs text-red-600">${expensePerAcre.toFixed(0)}/acre</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${netProfit >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                {netProfit >= 0 ? (
                  <ArrowUpRight className="h-6 w-6 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${Math.abs(netProfit).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                <p className={`text-xs ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(profitPerAcre).toFixed(0)}/acre
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profitMargin.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">Profit Margin</p>
                <p className={`text-xs ${profitMargin >= 15 ? 'text-green-600' : profitMargin >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {profitMargin >= 15 ? 'Excellent' : profitMargin >= 5 ? 'Good' : 'Poor'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="crops">Crop ROI</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue vs Expenses (Monthly)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                      <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Profit Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Profit Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Profit']} />
                      <Area 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {((totalRevenue / totalExpenses) * 100).toFixed(0)}%
                  </div>
                  <p className="text-sm text-gray-500">Revenue/Expense Ratio</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(totalRevenue / 12).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Avg Monthly Revenue</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(totalExpenses / 12).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Avg Monthly Expenses</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(totalAcres)}
                  </div>
                  <p className="text-sm text-gray-500">Total Acres Managed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-4 h-4 rounded-full`}
                        style={{backgroundColor: category.color}}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-500">
                          {category.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${category.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        ${(category.value / totalAcres).toFixed(0)}/acre
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crops">
          <CropROIAnalysis cropData={cropROIData} />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReports 
            financialRecords={financialRecords}
            yieldRecords={yieldRecords}
            summary={{
              totalRevenue,
              totalExpenses,
              netProfit,
              profitMargin,
              revenuePerAcre,
              expensePerAcre,
              profitPerAcre
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CropROIAnalysisProps {
  cropData: Array<{
    crop: string;
    revenue: number;
    expenses: number;
    profit: number;
    roi: number;
    acres: number;
  }>;
}

function CropROIAnalysis({ cropData }: CropROIAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* ROI Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Crop ROI Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crop" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'ROI']} />
                <Bar dataKey="roi" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Crop Performance Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cropData.map((crop, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{crop.crop}</span>
                <Badge variant={crop.roi >= 20 ? 'default' : crop.roi >= 10 ? 'secondary' : 'destructive'}>
                  {crop.roi.toFixed(1)}% ROI
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Revenue</p>
                  <p className="font-bold text-green-600">${crop.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expenses</p>
                  <p className="font-bold text-red-600">${crop.expenses.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Profit</p>
                  <p className={`font-bold ${crop.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(crop.profit).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Acres</p>
                  <p className="font-bold">{crop.acres}</p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500">Profit per Acre</p>
                <p className="text-lg font-bold">
                  ${(crop.profit / crop.acres).toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface FinancialReportsProps {
  financialRecords: FinancialRecord[];
  yieldRecords: YieldRecord[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    revenuePerAcre: number;
    expensePerAcre: number;
    profitPerAcre: number;
  };
}

function FinancialReports({ financialRecords, yieldRecords, summary }: FinancialReportsProps) {
  const exportReport = (type: 'pdf' | 'excel') => {
    // Simulate report generation
    logger.info('Report generation requested', { type }, 'FinancialDashboard');
    // In a real app, this would generate and download the report
  };

  return (
    <div className="space-y-6">
      {/* Report Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-medium">Financial Reports</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and download detailed financial reports
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => exportReport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Financial Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-medium">${summary.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span className="font-medium">${summary.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Profit:</span>
                  <span className={`font-medium ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(summary.netProfit).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Margin:</span>
                  <span className="font-medium">{summary.profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Per Acre Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Revenue per Acre:</span>
                  <span className="font-medium">${summary.revenuePerAcre.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expense per Acre:</span>
                  <span className="font-medium">${summary.expensePerAcre.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit per Acre:</span>
                  <span className={`font-medium ${summary.profitPerAcre >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(summary.profitPerAcre).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {financialRecords.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${record.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium">{record.description}</p>
                    <p className="text-sm text-gray-500">
                      {record.category} • {record.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {record.type === 'income' ? '+' : '-'}${record.amount.toLocaleString()}
                  </p>
                  {record.fieldId && (
                    <p className="text-sm text-gray-500">Field specific</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Form Component
function FinancialRecordForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    type: 'expense' as FinancialRecord['type'],
    category: 'seeds' as FinancialRecord['category'],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    fieldId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('Financial record submitted', { type: formData.type, category: formData.category, amount: formData.amount }, 'FinancialDashboard');
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(value: FinancialRecord['type']) => 
            setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value: FinancialRecord['category']) => 
            setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seeds">Seeds</SelectItem>
              <SelectItem value="fertilizer">Fertilizer</SelectItem>
              <SelectItem value="pesticide">Pesticide</SelectItem>
              <SelectItem value="fuel">Fuel</SelectItem>
              <SelectItem value="labor">Labor</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="harvest_sale">Harvest Sale</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">
          Add Record
        </Button>
      </div>
    </form>
  );
}

// Mock data generators
function generateMockFinancialRecords(): FinancialRecord[] {
  const records: FinancialRecord[] = [];
  const categories: FinancialRecord['category'][] = ['seeds', 'fertilizer', 'pesticide', 'fuel', 'labor', 'equipment', 'harvest_sale'];
  
  // Generate expense records
  for (let i = 0; i < 50; i++) {
    const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const category = categories[Math.floor(Math.random() * (categories.length - 1))]; // Exclude harvest_sale
    const amount = Math.round((Math.random() * 5000 + 500) * 100) / 100;
    
    records.push({
      id: `expense-${i}`,
      farmId: 'farm-1',
      type: 'expense',
      category,
      amount,
      description: `${category.charAt(0).toUpperCase() + category.slice(1)} purchase`,
      date,
      season: date.getMonth() >= 3 && date.getMonth() <= 8 ? 'Spring/Summer' : 'Fall/Winter',
      crop: Math.random() > 0.5 ? 'Corn' : 'Soybeans'
    });
  }

  // Generate income records (harvest sales)
  for (let i = 0; i < 20; i++) {
    const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const amount = Math.round((Math.random() * 15000 + 5000) * 100) / 100;
    
    records.push({
      id: `income-${i}`,
      farmId: 'farm-1',
      type: 'income',
      category: 'harvest_sale',
      amount,
      description: 'Crop harvest sale',
      date,
      season: date.getMonth() >= 8 && date.getMonth() <= 11 ? 'Fall' : 'Spring',
      crop: Math.random() > 0.5 ? 'Corn' : 'Soybeans'
    });
  }

  return records.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function generateMockYieldRecords(): YieldRecord[] {
  return [
    {
      id: 'yield-1',
      fieldId: 'field-1',
      cropId: 'crop-1',
      harvestDate: new Date('2024-09-15'),
      actualYield: 180,
      expectedYield: 175,
      quality: 'premium',
      moistureContent: 15.5,
      pricePerUnit: 4.25,
      totalRevenue: 32400,
      notes: 'Excellent growing conditions'
    },
    {
      id: 'yield-2',
      fieldId: 'field-2',
      cropId: 'crop-2',
      harvestDate: new Date('2024-10-01'),
      actualYield: 55,
      expectedYield: 50,
      quality: 'standard',
      moistureContent: 13.2,
      pricePerUnit: 12.80,
      totalRevenue: 14080,
      notes: 'Good yield despite drought conditions'
    }
  ];
}

function generateMonthlyFinancialData(records: FinancialRecord[]) {
  const monthlyData = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 12; i++) {
    const monthRecords = records.filter(r => r.date.getMonth() === i);
    const revenue = monthRecords.filter(r => r.type === 'income').reduce((acc, r) => acc + r.amount, 0);
    const expenses = monthRecords.filter(r => r.type === 'expense').reduce((acc, r) => acc + r.amount, 0);
    
    monthlyData.push({
      month: months[i],
      revenue,
      expenses,
      profit: revenue - expenses
    });
  }
  
  return monthlyData;
}

function generateExpenseBreakdown(records: FinancialRecord[]) {
  const expenseRecords = records.filter(r => r.type === 'expense');
  const categoryTotals: Record<string, number> = {};
  
  expenseRecords.forEach(record => {
    categoryTotals[record.category] = (categoryTotals[record.category] || 0) + record.amount;
  });

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  const total = Object.values(categoryTotals).reduce((acc, val) => acc + val, 0);
  
  return Object.entries(categoryTotals).map(([category, value], index) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value,
    percentage: (value / total) * 100,
    color: colors[index % colors.length]
  })).sort((a, b) => b.value - a.value);
}

function generateCropROIData(yieldRecords: YieldRecord[], financialRecords: FinancialRecord[]) {
  const crops = ['Corn', 'Soybeans', 'Wheat'];
  
  return crops.map(crop => {
    const cropYields = yieldRecords.filter(y => y.notes?.includes(crop) || Math.random() > 0.5);
    const cropRevenue = cropYields.reduce((acc, y) => acc + y.totalRevenue, 0) || Math.random() * 50000 + 20000;
    const cropExpenses = financialRecords
      .filter(r => r.type === 'expense' && (r.crop === crop || Math.random() > 0.7))
      .reduce((acc, r) => acc + r.amount, 0) || Math.random() * 30000 + 15000;
    
    const profit = cropRevenue - cropExpenses;
    const roi = (profit / cropExpenses) * 100;
    const acres = Math.floor(Math.random() * 150) + 50;
    
    return {
      crop,
      revenue: Math.round(cropRevenue),
      expenses: Math.round(cropExpenses),
      profit: Math.round(profit),
      roi: Math.round(roi * 10) / 10,
      acres
    };
  });
}