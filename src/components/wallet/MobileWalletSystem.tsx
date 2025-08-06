import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Wallet,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Send,
  Download,
  Upload,
  RefreshCw,
  History,
  Shield,
  Award,
  Users,
  Smartphone,
  Zap,
  Target,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Copy,
  QrCode,
  Scan,
  Phone,
  Mail,
  MapPin,
  Star,
  Gift,
  Percent,
  PiggyBank,
  Calculator,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Settings,
  Bell,
  Info,
  ExternalLink,
  FileText,
  Receipt,
  Building2,
  Landmark,
  X,
  Check,
  Lock,
  Unlock,
  Fingerprint,
  Key
} from 'lucide-react';

interface WalletAccount {
  id: string;
  userId: string;
  accountNumber: string;
  accountName: string;
  type: 'main' | 'savings' | 'credit' | 'business';
  currency: string;
  balance: number;
  availableBalance: number;
  blockedAmount: number;
  creditLimit?: number;
  interestRate?: number;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: Date;
  lastActivity: Date;
}

interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  category: 'transfer' | 'payment' | 'deposit' | 'withdrawal' | 'reward' | 'refund' | 'fee' | 'loan' | 'savings';
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  recipient?: ContactInfo;
  sender?: ContactInfo;
  merchantInfo?: MerchantInfo;
  metadata: Record<string, any>;
  fees: number;
  timestamp: Date;
  balanceAfter: number;
}

interface ContactInfo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  walletAddress?: string;
  bankAccount?: BankAccount;
}

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

interface MerchantInfo {
  id: string;
  name: string;
  category: string;
  logo?: string;
  location?: string;
}

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'card' | 'ussd' | 'transfer';
  name: string;
  details: string;
  isDefault: boolean;
  isVerified: boolean;
  logo?: string;
}

interface CreditScore {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  factors: CreditFactor[];
  history: CreditHistory[];
  recommendations: string[];
  lastUpdated: Date;
}

interface CreditFactor {
  factor: string;
  score: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface CreditHistory {
  month: string;
  score: number;
  change: number;
}

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  term: number; // months
  requirements: string[];
  benefits: string[];
  processingTime: string;
  isEligible: boolean;
}

interface SavingsProduct {
  id: string;
  name: string;
  description: string;
  interestRate: number;
  minBalance: number;
  lockPeriod?: number; // months
  features: string[];
  isFlexible: boolean;
}

const mockWalletAccount: WalletAccount = {
  id: 'wallet-001',
  userId: 'user-001',
  accountNumber: '2047891234',
  accountName: 'John Adebayo',
  type: 'main',
  currency: 'NGN',
  balance: 125750.50,
  availableBalance: 120750.50,
  blockedAmount: 5000.00,
  isActive: true,
  isPrimary: true,
  createdAt: new Date('2023-01-15'),
  lastActivity: new Date()
};

const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    walletId: 'wallet-001',
    type: 'credit',
    category: 'transfer',
    amount: 50000,
    currency: 'NGN',
    description: 'Payment received from FreshMart',
    reference: 'TXN2024011501',
    status: 'completed',
    sender: {
      id: 'merchant-001',
      name: 'FreshMart Limited',
      phone: '+234-901-234-5678',
      email: 'payments@freshmart.com'
    },
    metadata: { orderId: 'ORDER-2024-001', productType: 'Tomatoes' },
    fees: 150,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    balanceAfter: 125750.50
  },
  {
    id: 'txn-002',
    walletId: 'wallet-001',
    type: 'debit',
    category: 'transfer',
    amount: 15000,
    currency: 'NGN',
    description: 'Transfer to Amina Hassan',
    reference: 'TXN2024011502',
    status: 'completed',
    recipient: {
      id: 'user-002',
      name: 'Amina Hassan',
      phone: '+234-803-123-4567',
      avatar: '/api/placeholder/32/32'
    },
    metadata: { purpose: 'Seed payment' },
    fees: 50,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    balanceAfter: 75700.50
  },
  {
    id: 'txn-003',
    walletId: 'wallet-001',
    type: 'credit',
    category: 'reward',
    amount: 2500,
    currency: 'NGN',
    description: 'Referral bonus - 2 new farmers',
    reference: 'RWD2024011501',
    status: 'completed',
    metadata: { program: 'farmer-referral', count: 2 },
    fees: 0,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    balanceAfter: 90700.50
  },
  {
    id: 'txn-004',
    walletId: 'wallet-001',
    type: 'debit',
    category: 'payment',
    amount: 8500,
    currency: 'NGN',
    description: 'Fertilizer purchase - AgriSupply',
    reference: 'TXN2024011503',
    status: 'completed',
    merchantInfo: {
      id: 'merchant-002',
      name: 'AgriSupply Store',
      category: 'Agricultural Supplies',
      location: 'Kano'
    },
    metadata: { productType: 'Fertilizer', quantity: '50kg' },
    fees: 85,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    balanceAfter: 88200.50
  }
];

const mockCreditScore: CreditScore = {
  score: 750,
  grade: 'A',
  factors: [
    {
      factor: 'Payment History',
      score: 90,
      impact: 'positive',
      description: 'Excellent track record of on-time payments'
    },
    {
      factor: 'Transaction Volume',
      score: 85,
      impact: 'positive',
      description: 'High transaction volume indicates active business'
    },
    {
      factor: 'Account Age',
      score: 70,
      impact: 'neutral',
      description: 'Account established for 12 months'
    },
    {
      factor: 'Network Trust',
      score: 80,
      impact: 'positive',
      description: 'Strong reputation in farmer community'
    }
  ],
  history: [
    { month: 'Dec 2023', score: 740, change: 5 },
    { month: 'Jan 2024', score: 750, change: 10 }
  ],
  recommendations: [
    'Maintain consistent payment patterns',
    'Increase savings account activity',
    'Complete farmer verification process'
  ],
  lastUpdated: new Date()
};

const mockLoanProducts: LoanProduct[] = [
  {
    id: 'loan-001',
    name: 'Farmer Quick Loan',
    description: 'Fast cash for immediate farming needs',
    minAmount: 50000,
    maxAmount: 500000,
    interestRate: 2.5,
    term: 6,
    requirements: ['Active wallet for 6+ months', 'Minimum credit score: 600'],
    benefits: ['Quick approval', 'Flexible repayment', 'No collateral required'],
    processingTime: '24 hours',
    isEligible: true
  },
  {
    id: 'loan-002',
    name: 'Equipment Finance',
    description: 'Funding for agricultural equipment and machinery',
    minAmount: 200000,
    maxAmount: 2000000,
    interestRate: 15,
    term: 24,
    requirements: ['Business registration', 'Credit score: 650+', 'Income verification'],
    benefits: ['Competitive rates', 'Asset-backed security', 'Extended repayment'],
    processingTime: '5-7 days',
    isEligible: true
  }
];

const mockSavingsProducts: SavingsProduct[] = [
  {
    id: 'save-001',
    name: 'Harvest Savings',
    description: 'Flexible savings for your farming income',
    interestRate: 8.5,
    minBalance: 10000,
    features: ['Daily interest calculation', 'No withdrawal penalties', 'Mobile access'],
    isFlexible: true
  },
  {
    id: 'save-002',
    name: 'Season Lock Savings',
    description: 'Lock funds for better returns during farming seasons',
    interestRate: 12,
    minBalance: 50000,
    lockPeriod: 6,
    features: ['Higher interest rates', 'Seasonal unlock', 'Goal-based savings'],
    isFlexible: false
  }
];

export function MobileWalletSystem() {
  const [walletAccount, setWalletAccount] = useState<WalletAccount>(mockWalletAccount);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [creditScore] = useState<CreditScore>(mockCreditScore);
  const [loanProducts] = useState<LoanProduct[]>(mockLoanProducts);
  const [savingsProducts] = useState<SavingsProduct[]>(mockSavingsProducts);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'credit') {
      switch (transaction.category) {
        case 'transfer': return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
        case 'deposit': return <Plus className="w-5 h-5 text-green-600" />;
        case 'reward': return <Award className="w-5 h-5 text-purple-600" />;
        case 'refund': return <RefreshCw className="w-5 h-5 text-blue-600" />;
        default: return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      }
    } else {
      switch (transaction.category) {
        case 'transfer': return <ArrowUpRight className="w-5 h-5 text-red-600" />;
        case 'payment': return <CreditCard className="w-5 h-5 text-blue-600" />;
        case 'withdrawal': return <Minus className="w-5 h-5 text-red-600" />;
        case 'fee': return <Receipt className="w-5 h-5 text-orange-600" />;
        default: return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreditGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'text-green-600';
      case 'B+':
      case 'B': return 'text-blue-600';
      case 'C+':
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.recipient?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.sender?.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTransfer = () => {
    if (!transferAmount || !transferRecipient) return;
    
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      walletId: walletAccount.id,
      type: 'debit',
      category: 'transfer',
      amount: parseFloat(transferAmount),
      currency: walletAccount.currency,
      description: `Transfer to ${transferRecipient}`,
      reference: `TXN${Date.now()}`,
      status: 'pending',
      recipient: {
        id: 'temp-id',
        name: transferRecipient
      },
      metadata: { note: transferNote },
      fees: Math.round(parseFloat(transferAmount) * 0.01),
      timestamp: new Date(),
      balanceAfter: walletAccount.balance - parseFloat(transferAmount)
    };

    setTransactions([newTransaction, ...transactions]);
    setWalletAccount({
      ...walletAccount,
      balance: walletAccount.balance - parseFloat(transferAmount),
      availableBalance: walletAccount.availableBalance - parseFloat(transferAmount)
    });

    // Clear form
    setTransferAmount('');
    setTransferRecipient('');
    setTransferNote('');

    // Simulate transaction completion
    setTimeout(() => {
      setTransactions(prev => prev.map(t => 
        t.id === newTransaction.id ? { ...t, status: 'completed' } : t
      ));
    }, 3000);
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/api/placeholder/40/40" />
              <AvatarFallback>JA</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">AgriWallet</h1>
              <p className="text-sm text-white/80">{walletAccount.accountName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">
              <Bell className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-white/80 mb-1">Available Balance</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold">
              {showBalance ? formatCurrency(walletAccount.availableBalance) : '••••••'}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBalance(!showBalance)}
              className="text-white hover:bg-white/20"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-white/70">
            Blocked: {formatCurrency(walletAccount.blockedAmount)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 -mt-6 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto bg-white shadow-md"
            onClick={() => setActiveTab('transfer')}
          >
            <Send className="w-6 h-6 mb-2 text-blue-600" />
            <span className="text-xs">Transfer</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto bg-white shadow-md"
            onClick={() => setActiveTab('savings')}
          >
            <PiggyBank className="w-6 h-6 mb-2 text-green-600" />
            <span className="text-xs">Save</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto bg-white shadow-md"
            onClick={() => setActiveTab('loans')}
          >
            <Calculator className="w-6 h-6 mb-2 text-purple-600" />
            <span className="text-xs">Loans</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto bg-white shadow-md"
            onClick={() => setActiveTab('qr')}
          >
            <QrCode className="w-6 h-6 mb-2 text-orange-600" />
            <span className="text-xs">Pay/Receive</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="hidden" />

        <TabsContent value="dashboard" className="space-y-4">
          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{walletAccount.accountNumber}</span>
                  <Button size="sm" variant="ghost">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Balance</span>
                <span className="font-semibold">{formatCurrency(walletAccount.balance)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Status</span>
                <Badge className={walletAccount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {walletAccount.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Credit Score */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Credit Score</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getCreditGradeColor(creditScore.grade)}`}>
                      {creditScore.score}
                    </span>
                    <Badge className={`${getCreditGradeColor(creditScore.grade)} bg-opacity-10`}>
                      Grade {creditScore.grade}
                    </Badge>
                  </div>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${(creditScore.score / 850) * 100}, 100`}
                      className="text-green-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium">{Math.round((creditScore.score / 850) * 100)}%</span>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => setActiveTab('credit')}
              >
                View Details
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setActiveTab('history')}
                >
                  <History className="w-3 h-3 mr-1" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowTransactionDetails(true);
                    }}
                  >
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getTransactionIcon(transaction)}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-600">
                        {transaction.timestamp.toLocaleDateString()} • {transaction.reference}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={getStatusColor(transaction.status)} variant="secondary">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Money</CardTitle>
              <p className="text-sm text-gray-600">Transfer funds to another AgriWallet user</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Recipient</label>
                <Input
                  placeholder="Phone number, email, or wallet ID"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="pl-8"
                  />
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Available: {formatCurrency(walletAccount.availableBalance)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Note (Optional)</label>
                <Input
                  placeholder="What's this for?"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                />
              </div>

              {transferAmount && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span>{formatCurrency(parseFloat(transferAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Fee</span>
                    <span>{formatCurrency((parseFloat(transferAmount) || 0) * 0.01)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Debit</span>
                    <span>{formatCurrency((parseFloat(transferAmount) || 0) * 1.01)}</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={handleTransfer}
                disabled={!transferAmount || !transferRecipient}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Money
              </Button>
            </CardContent>
          </Card>

          {/* Quick Transfer Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: 'Amina', avatar: '/api/placeholder/40/40' },
                  { name: 'John', avatar: '/api/placeholder/40/40' },
                  { name: 'Fatima', avatar: '/api/placeholder/40/40' },
                  { name: 'More', avatar: null }
                ].map((contact, index) => (
                  <div key={index} className="text-center">
                    <Avatar className="w-12 h-12 mx-auto mb-2">
                      <AvatarImage src={contact.avatar || ''} />
                      <AvatarFallback>
                        {contact.name === 'More' ? <Plus className="w-5 h-5" /> : contact.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs">{contact.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="transfer">Transfers</option>
              <option value="payment">Payments</option>
              <option value="deposit">Deposits</option>
              <option value="reward">Rewards</option>
            </select>
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <Card 
                key={transaction.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedTransaction(transaction);
                  setShowTransactionDetails(true);
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getTransactionIcon(transaction)}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-600">
                        {transaction.timestamp.toLocaleDateString()} • {transaction.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={getStatusColor(transaction.status)} variant="secondary">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="credit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credit Score Details</CardTitle>
              <p className="text-sm text-gray-600">
                Last updated: {creditScore.lastUpdated.toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getCreditGradeColor(creditScore.grade)} mb-2`}>
                  {creditScore.score}
                </div>
                <Badge className={`${getCreditGradeColor(creditScore.grade)} bg-opacity-10 text-lg px-3 py-1`}>
                  Grade {creditScore.grade}
                </Badge>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Credit Factors</h3>
                {creditScore.factors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{factor.factor}</span>
                      <span className="font-medium">{factor.score}%</span>
                    </div>
                    <Progress value={factor.score} className="h-2" />
                    <p className="text-xs text-gray-600">{factor.description}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Recommendations</h3>
                {creditScore.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          {loanProducts.map((loan) => (
            <Card key={loan.id}>
              <CardHeader>
                <CardTitle className="text-lg">{loan.name}</CardTitle>
                <p className="text-sm text-gray-600">{loan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Amount Range</p>
                    <p className="font-medium">{formatCurrency(loan.minAmount)} - {formatCurrency(loan.maxAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Interest Rate</p>
                    <p className="font-medium">{loan.interestRate}% monthly</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Term</p>
                    <p className="font-medium">{loan.term} months</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Processing</p>
                    <p className="font-medium">{loan.processingTime}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">Benefits</p>
                  <div className="space-y-1">
                    {loan.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-xs">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  disabled={!loan.isEligible}
                  variant={loan.isEligible ? 'default' : 'secondary'}
                >
                  {loan.isEligible ? 'Apply Now' : 'Not Eligible'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          {savingsProducts.map((savings) => (
            <Card key={savings.id}>
              <CardHeader>
                <CardTitle className="text-lg">{savings.name}</CardTitle>
                <p className="text-sm text-gray-600">{savings.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Interest Rate</p>
                    <p className="font-medium text-green-600">{savings.interestRate}% annually</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Minimum Balance</p>
                    <p className="font-medium">{formatCurrency(savings.minBalance)}</p>
                  </div>
                  {savings.lockPeriod && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Lock Period</p>
                      <p className="font-medium">{savings.lockPeriod} months</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">Features</p>
                  <div className="space-y-1">
                    {savings.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">
                  Open {savings.name} Account
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">QR Pay</CardTitle>
              <p className="text-sm text-gray-600">Pay or receive money using QR codes</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex flex-col items-center p-6">
                  <QrCode className="w-8 h-8 mb-2 text-blue-600" />
                  <span className="text-sm">Show QR</span>
                  <span className="text-xs text-gray-600">to receive</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center p-6">
                  <Scan className="w-8 h-8 mb-2 text-green-600" />
                  <span className="text-sm">Scan QR</span>
                  <span className="text-xs text-gray-600">to pay</span>
                </Button>
              </div>

              <div className="text-center py-8">
                <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg mx-auto flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Your QR Code</p>
                    <p className="text-xs text-gray-500">Scan to send money to you</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Modal */}
      {showTransactionDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full max-h-[80vh] overflow-y-auto rounded-t-2xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Transaction Details</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowTransactionDetails(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                  {getTransactionIcon(selectedTransaction)}
                </div>
                <p className="text-2xl font-bold">
                  {selectedTransaction.type === 'credit' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                </p>
                <Badge className={getStatusColor(selectedTransaction.status)}>
                  {selectedTransaction.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Description</span>
                  <span className="font-medium">{selectedTransaction.description}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-medium">{selectedTransaction.reference}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium">
                    {selectedTransaction.timestamp.toLocaleDateString()} {selectedTransaction.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Fee</span>
                  <span className="font-medium">{formatCurrency(selectedTransaction.fees)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Balance After</span>
                  <span className="font-medium">{formatCurrency(selectedTransaction.balanceAfter)}</span>
                </div>

                {selectedTransaction.recipient && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient</span>
                    <span className="font-medium">{selectedTransaction.recipient.name}</span>
                  </div>
                )}

                {selectedTransaction.sender && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sender</span>
                    <span className="font-medium">{selectedTransaction.sender.name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  <Receipt className="w-4 h-4 mr-2" />
                  Receipt
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-white border-t">
        <div className="grid grid-cols-5 p-2">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            className="flex flex-col items-center p-2 h-auto"
            onClick={() => setActiveTab('dashboard')}
          >
            <Wallet className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            size="sm"
            className="flex flex-col items-center p-2 h-auto"
            onClick={() => setActiveTab('history')}
          >
            <History className="w-5 h-5 mb-1" />
            <span className="text-xs">History</span>
          </Button>
          <Button
            variant={activeTab === 'transfer' ? 'default' : 'ghost'}
            size="sm"
            className="flex flex-col items-center p-2 h-auto"
            onClick={() => setActiveTab('transfer')}
          >
            <Send className="w-5 h-5 mb-1" />
            <span className="text-xs">Transfer</span>
          </Button>
          <Button
            variant={activeTab === 'loans' ? 'default' : 'ghost'}
            size="sm"
            className="flex flex-col items-center p-2 h-auto"
            onClick={() => setActiveTab('loans')}
          >
            <Calculator className="w-5 h-5 mb-1" />
            <span className="text-xs">Loans</span>
          </Button>
          <Button
            variant={activeTab === 'qr' ? 'default' : 'ghost'}
            size="sm"
            className="flex flex-col items-center p-2 h-auto"
            onClick={() => setActiveTab('qr')}
          >
            <QrCode className="w-5 h-5 mb-1" />
            <span className="text-xs">QR Pay</span>
          </Button>
        </div>
      </div>

      <div className="h-20"></div> {/* Spacer for bottom navigation */}
    </div>
  );
}

export default MobileWalletSystem;