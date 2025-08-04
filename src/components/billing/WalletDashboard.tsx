'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { walletService, Wallet, WalletTransaction, Invoice } from '@/services/billing/WalletService';
import { MobileMoneyPayment } from '@/components/payment/MobileMoneyPayment';
import '@/styles/glass-agricultural.css';

interface WalletStats {
  totalBalance: number;
  availableCredit: number;
  totalSpent: number;
  pendingInvoices: number;
}

export function WalletDashboard() {
  const { profile, tenant } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalBalance: 0,
    availableCredit: 0,
    totalSpent: 0,
    pendingInvoices: 0
  });
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && tenant) {
      loadWalletData();
    }
  }, [profile, tenant]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // Get or create wallet
      const walletData = await walletService.ensureWallet(
        profile!.id,
        tenant!.id,
        tenant!.currency || 'KES'
      );
      setWallet(walletData);

      // Load transactions
      const transactionData = await walletService.getTransactionHistory(walletData.id, 20);
      setTransactions(transactionData);

      // Calculate stats
      const totalSpent = transactionData
        .filter(t => t.transaction_type === 'payment' && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      setStats({
        totalBalance: walletData.balance,
        availableCredit: walletData.available_credit,
        totalSpent,
        pendingInvoices: 0 // TODO: Implement invoice counting
      });

    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpSuccess = async (response: any) => {
    try {
      // Transaction will be completed via webhook
      // Refresh wallet data after a short delay
      setTimeout(() => {
        loadWalletData();
      }, 2000);
      
      setShowTopUp(false);
      alert('Top-up initiated successfully! Your wallet will be updated shortly.');
    } catch (error) {
      console.error('Error processing top-up:', error);
    }
  };

  const formatAmount = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, string> = {
      'deposit': '💰',
      'withdrawal': '💸',
      'payment': '🛒',
      'refund': '↩️',
      'credit_disbursement': '🏦',
      'credit_repayment': '💳'
    };
    return icons[type] || '💱';
  };

  const getTransactionColor = (type: string) => {
    const colors: Record<string, string> = {
      'deposit': 'text-green-400',
      'withdrawal': 'text-red-400',
      'payment': 'text-yellow-400',
      'refund': 'text-blue-400',
      'credit_disbursement': 'text-green-400',
      'credit_repayment': 'text-red-400'
    };
    return colors[type] || 'text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass animate-pulse p-8 text-center">
            <div className="text-white text-lg">Loading wallet...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
        <div className="glass p-6 text-center">
          <div className="text-red-400 text-lg mb-4">Error Loading Wallet</div>
          <div className="text-white/80 mb-4">{error}</div>
          <button 
            onClick={loadWalletData}
            className="glass-button glass-button-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
      {/* Header */}
      <div className="glass p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Digital Wallet</h1>
            <p className="text-white/80">Manage payments, credit, and billing</p>
          </div>
          
          <button
            onClick={() => setShowTopUp(true)}
            className="glass-button glass-button-primary"
          >
            💰 Top Up Wallet
          </button>
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">💰</div>
            <div className="text-green-primary text-sm font-medium">BALANCE</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatAmount(stats.totalBalance, wallet?.currency)}
          </div>
          <div className="text-white/60 text-sm">Available funds</div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🏦</div>
            <div className="text-blue-primary text-sm font-medium">CREDIT</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatAmount(stats.availableCredit, wallet?.currency)}
          </div>
          <div className="text-white/60 text-sm">Available credit</div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📊</div>
            <div className="text-yellow-primary text-sm font-medium">SPENT</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatAmount(stats.totalSpent, wallet?.currency)}
          </div>
          <div className="text-white/60 text-sm">Total spent</div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📄</div>
            <div className="text-red-primary text-sm font-medium">PENDING</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {stats.pendingInvoices}
          </div>
          <div className="text-white/60 text-sm">Pending invoices</div>
        </div>
      </div>

      {/* Wallet Actions */}
      <div className="glass p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowTopUp(true)}
            className="glass-agricultural p-4 rounded-lg hover:scale-105 transition-transform text-center"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="text-white text-sm">Top Up</div>
          </button>
          
          <button className="glass-agricultural p-4 rounded-lg hover:scale-105 transition-transform text-center">
            <div className="text-2xl mb-2">💳</div>
            <div className="text-white text-sm">Apply Credit</div>
          </button>
          
          <button className="glass-agricultural p-4 rounded-lg hover:scale-105 transition-transform text-center">
            <div className="text-2xl mb-2">📄</div>
            <div className="text-white text-sm">View Invoices</div>
          </button>
          
          <button className="glass-agricultural p-4 rounded-lg hover:scale-105 transition-transform text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-white text-sm">Usage Report</div>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
          <button className="text-green-primary hover:text-green-300 text-sm">
            View All
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center text-white/80 py-8">
            <div className="text-4xl mb-4">💰</div>
            <div>No transactions yet</div>
            <div className="text-sm mt-2">Start by topping up your wallet</div>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="glass-agricultural p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {transaction.description}
                      </div>
                      <div className="text-white/60 text-sm">
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.amount >= 0 ? '+' : ''}
                      {formatAmount(transaction.amount, transaction.currency)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="glass p-6 mb-4">
              <h3 className="text-xl font-semibold text-white mb-4">Top Up Amount</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Amount ({wallet?.currency})
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    step="100"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 100)}
                    className="glass-input w-full"
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 2000, 5000, 10000, 20000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount)}
                      className={`glass-button text-sm ${
                        topUpAmount === amount ? 'glass-button-primary' : ''
                      }`}
                    >
                      {formatAmount(amount, wallet?.currency)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <MobileMoneyPayment
              amount={topUpAmount}
              currency={wallet?.currency || 'KES'}
              description="AgriNexus Wallet Top-up"
              reference={`TOPUP_${Date.now()}`}
              onSuccess={handleTopUpSuccess}
              onError={(error) => {
                console.error('Top-up error:', error);
                alert('Top-up failed: ' + error);
              }}
              onCancel={() => setShowTopUp(false)}
              metadata={{
                transactionType: 'wallet_topup',
                walletId: wallet?.id,
                userId: profile?.id
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletDashboard;