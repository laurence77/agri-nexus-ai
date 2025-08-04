import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  Wallet,
  CreditCard,
  Send,
  Download,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Smartphone,
  Clock,
  Calendar,
  Filter,
  Search,
  ExternalLink,
  Settings,
  Bell,
  Lock,
  Unlock
} from 'lucide-react';
import { WalletAccount, PaymentTransaction } from '@/services/payment/payment-service';
import { paymentUtils, PAYMENT_CONFIG, PAYMENT_STATUS, PaymentStatus } from './index';

interface WalletDashboardProps {
  userId: string;
  onSendMoney?: (amount: number, recipient: string, currency: string) => void;
  onReceiveMoney?: () => void;
  onWithdraw?: (amount: number, method: string) => void;
  onTopUp?: (amount: number, method: string) => void;
  className?: string;
}

interface WalletStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingTransactions: number;
  successRate: number;
}

/**
 * Wallet Dashboard Component
 * Comprehensive wallet management for African mobile money integration
 */
export function WalletDashboard({ 
  userId,
  onSendMoney,
  onReceiveMoney,
  onWithdraw,
  onTopUp,
  className 
}: WalletDashboardProps) {
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('KES');
  const [showBalances, setShowBalances] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingTransactions: 0,
    successRate: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'sent' | 'received' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWalletData();
    loadTransactionHistory();
  }, [userId]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // Mock wallet data - in production, fetch from payment service
      const mockWallets: WalletAccount[] = [
        {
          id: 'wallet_kes',
          userId,
          currency: 'KES',
          balance: 45750.50,
          availableBalance: 42750.50,
          reservedBalance: 3000.00,
          status: 'active',
          lastUpdated: new Date(),
          linkedAccounts: [
            { type: 'mpesa', number: '254712345678', verified: true },
            { type: 'airtel_money', number: '254787654321', verified: true }
          ]
        },
        {
          id: 'wallet_ugx',
          userId,
          currency: 'UGX',
          balance: 850000,
          availableBalance: 850000,
          reservedBalance: 0,
          status: 'active',
          lastUpdated: new Date(),
          linkedAccounts: [
            { type: 'mtn_momo', number: '256771234567', verified: true }
          ]
        },
        {
          id: 'wallet_ghs',
          userId,
          currency: 'GHS',
          balance: 2450.75,
          availableBalance: 2450.75,
          reservedBalance: 0,
          status: 'active',
          lastUpdated: new Date(),
          linkedAccounts: [
            { type: 'mtn_momo', number: '233241234567', verified: true },
            { type: 'vodafone_cash', number: '233501234567', verified: false }
          ]
        }
      ];

      setWallets(mockWallets);
      
      // Calculate stats
      const totalUSD = mockWallets.reduce((sum, wallet) => {
        // Simplified conversion to USD for stats
        const conversionRate = wallet.currency === 'KES' ? 0.0075 : 
                             wallet.currency === 'UGX' ? 0.00027 :
                             wallet.currency === 'GHS' ? 0.084 : 1;
        return sum + (wallet.balance * conversionRate);
      }, 0);

      setWalletStats({
        totalBalance: totalUSD,
        monthlyIncome: 1250.00,
        monthlyExpenses: 890.00,
        pendingTransactions: 3,
        successRate: 98.5
      });
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionHistory = async () => {
    try {
      // Mock transaction data - in production, fetch from payment service
      const mockTransactions: PaymentTransaction[] = [
        {
          id: 'txn_001',
          walletId: 'wallet_kes',
          type: 'payment',
          amount: 5000,
          currency: 'KES',
          status: 'completed' as PaymentStatus,
          description: 'Payment for maize seeds',
          recipient: 'Agro Dealers Ltd',
          paymentMethod: 'mpesa',
          reference: 'PAY_1234567890',
          createdAt: new Date('2024-07-25T10:30:00Z'),
          completedAt: new Date('2024-07-25T10:32:00Z'),
          fees: {
            platformFee: 125,
            providerFee: 75,
            total: 200
          }
        },
        {
          id: 'txn_002',
          walletId: 'wallet_kes',
          type: 'topup',
          amount: 15000,
          currency: 'KES',
          status: 'completed' as PaymentStatus,
          description: 'Wallet top-up via M-Pesa',
          sender: '+254712345678',
          paymentMethod: 'mpesa',
          reference: 'TOP_9876543210',
          createdAt: new Date('2024-07-24T14:15:00Z'),
          completedAt: new Date('2024-07-24T14:16:00Z'),
          fees: {
            platformFee: 0,
            providerFee: 0,
            total: 0
          }
        },
        {
          id: 'txn_003',
          walletId: 'wallet_kes',
          type: 'salary',
          amount: 8500,
          currency: 'KES',
          status: 'pending' as PaymentStatus,
          description: 'Monthly salary payment',
          recipient: 'John Mwangi',
          paymentMethod: 'mpesa',
          reference: 'SAL_5555666677',
          createdAt: new Date('2024-07-26T09:00:00Z'),
          fees: {
            platformFee: 212.50,
            providerFee: 85,
            total: 297.50
          }
        },
        {
          id: 'txn_004',
          walletId: 'wallet_ugx',
          type: 'withdrawal',
          amount: 100000,
          currency: 'UGX',
          status: 'completed' as PaymentStatus,
          description: 'Cash withdrawal',
          paymentMethod: 'mtn_momo',
          reference: 'WTH_1111222233',
          createdAt: new Date('2024-07-23T16:45:00Z'),
          completedAt: new Date('2024-07-23T16:47:00Z'),
          fees: {
            platformFee: 1000,
            providerFee: 500,
            total: 1500
          }
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadWalletData(), loadTransactionHistory()]);
    setRefreshing(false);
  };

  const getSelectedWallet = () => {
    return wallets.find(w => w.currency === selectedCurrency) || wallets[0];
  };

  const filteredTransactions = transactions.filter(txn => {
    const wallet = getSelectedWallet();
    if (!wallet || txn.walletId !== wallet.id) return false;
    
    const matchesFilter = transactionFilter === 'all' || 
      (transactionFilter === 'sent' && ['payment', 'withdrawal', 'salary'].includes(txn.type)) ||
      (transactionFilter === 'received' && ['topup', 'receive'].includes(txn.type)) ||
      (transactionFilter === 'pending' && txn.status === 'pending');
    
    const matchesSearch = !searchTerm || 
      txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.recipient && txn.recipient.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const renderWalletCard = (wallet: WalletAccount) => (
    <GlassCard 
      key={wallet.id}
      className={cn(
        'p-6 cursor-pointer transition-all',
        selectedCurrency === wallet.currency ? 'ring-2 ring-blue-400' : 'hover:scale-105'
      )}
      onClick={() => setSelectedCurrency(wallet.currency)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{wallet.currency} Wallet</h3>
            <p className="text-sm text-gray-300">
              {PAYMENT_CONFIG.supportedCurrencies.find(c => c.code === wallet.currency)?.name}
            </p>
          </div>
        </div>
        
        <div className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          wallet.status === 'active' ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'
        )}>
          {wallet.status}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">Available Balance</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBalances(!showBalances);
            }}
            className="text-gray-400 hover:text-white"
          >
            {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
        
        <div className="text-2xl font-bold text-white">
          {showBalances 
            ? paymentUtils.formatCurrency(wallet.availableBalance, wallet.currency)
            : '••••••••'
          }
        </div>
        
        {wallet.reservedBalance > 0 && (
          <div className="text-sm text-yellow-400">
            Reserved: {paymentUtils.formatCurrency(wallet.reservedBalance, wallet.currency)}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-2">
          {wallet.linkedAccounts.map((account, index) => (
            <div key={index} className="flex items-center space-x-1 text-xs">
              <Smartphone className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300">{account.type}</span>
              {account.verified ? (
                <Shield className="h-3 w-3 text-green-400" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-yellow-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );

  const renderTransactionItem = (transaction: PaymentTransaction) => (
    <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          transaction.type === 'payment' || transaction.type === 'withdrawal' || transaction.type === 'salary' 
            ? 'bg-red-500/20 text-red-400' 
            : 'bg-green-500/20 text-green-400'
        )}>
          {transaction.type === 'payment' || transaction.type === 'withdrawal' || transaction.type === 'salary' ? (
            <ArrowUpRight className="h-5 w-5" />
          ) : (
            <ArrowDownLeft className="h-5 w-5" />
          )}
        </div>
        
        <div>
          <div className="font-medium text-white">{transaction.description}</div>
          <div className="text-sm text-gray-300 flex items-center space-x-2">
            <span>{transaction.recipient || transaction.sender || 'System'}</span>
            <span>•</span>
            <span>{transaction.reference}</span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className={cn(
          'font-semibold',
          transaction.type === 'payment' || transaction.type === 'withdrawal' || transaction.type === 'salary'
            ? 'text-red-400' 
            : 'text-green-400'
        )}>
          {transaction.type === 'payment' || transaction.type === 'withdrawal' || transaction.type === 'salary' ? '-' : '+'}
          {paymentUtils.formatCurrency(transaction.amount, transaction.currency)}
        </div>
        
        <div className="flex items-center justify-end space-x-2 mt-1">
          <div className={cn('px-2 py-1 rounded-full text-xs font-medium', paymentUtils.getStatusColor(transaction.status))}>
            {transaction.status}
          </div>
          <span className="text-xs text-gray-400">
            {transaction.completedAt ? 
              transaction.completedAt.toLocaleDateString() : 
              transaction.createdAt.toLocaleDateString()
            }
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Wallet className="h-6 w-6 text-blue-400" />
            <span>Wallet Dashboard</span>
          </h2>
          <p className="text-gray-300 mt-1">Manage your multi-currency wallet and payments</p>
        </div>

        <div className="flex items-center space-x-3">
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Refresh
          </GlassButton>

          <GlassButton variant="secondary" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </GlassButton>
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.map(wallet => renderWalletCard(wallet))}
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassButton
            variant="primary"
            className="flex-col h-20"
            onClick={() => onSendMoney && onSendMoney(0, '', selectedCurrency)}
          >
            <Send className="h-5 w-5 mb-2" />
            Send Money
          </GlassButton>
          
          <GlassButton
            variant="secondary"
            className="flex-col h-20"
            onClick={() => onReceiveMoney && onReceiveMoney()}
          >
            <Download className="h-5 w-5 mb-2" />
            Receive
          </GlassButton>
          
          <GlassButton
            variant="secondary"
            className="flex-col h-20"
            onClick={() => onTopUp && onTopUp(0, 'mpesa')}
          >
            <Plus className="h-5 w-5 mb-2" />
            Top Up
          </GlassButton>
          
          <GlassButton
            variant="secondary"
            className="flex-col h-20"
            onClick={() => onWithdraw && onWithdraw(0, 'mpesa')}
          >
            <Minus className="h-5 w-5 mb-2" />
            Withdraw
          </GlassButton>
        </div>
      </GlassCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            ${walletStats.totalBalance.toFixed(2)}
          </div>
          <div className="text-sm text-gray-300">Total Balance (USD)</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 mr-1" />
            ${walletStats.monthlyIncome.toFixed(0)}
          </div>
          <div className="text-sm text-gray-300">Monthly Income</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-400 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 mr-1" />
            ${walletStats.monthlyExpenses.toFixed(0)}
          </div>
          <div className="text-sm text-gray-300">Monthly Expenses</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {walletStats.successRate}%
          </div>
          <div className="text-sm text-gray-300">Success Rate</div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: Wallet },
          { id: 'transactions', label: 'Transactions', icon: Clock },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <>
          {/* Transaction Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            
            <div className="flex space-x-2">
              {['all', 'sent', 'received', 'pending'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setTransactionFilter(filter as any)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                    transactionFilter === filter
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction List */}
          <GlassCard className="divide-y divide-white/10">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-lg font-semibold text-white mb-2">No Transactions Found</h3>
                <p className="text-gray-300">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredTransactions.map(transaction => renderTransactionItem(transaction))
            )}
          </GlassCard>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Trends</h3>
            <div className="text-center py-8 text-gray-400">
              Chart visualization would go here
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {PAYMENT_CONFIG.mobileMoneyProviders.map(provider => (
                <div key={provider.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{provider.name}</span>
                  </div>
                  <span className="text-gray-300">
                    {Math.floor(Math.random() * 50) + 10}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

export default WalletDashboard;