import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Receipt, 
  Search, 
  Filter, 
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import PaystackService from '@/services/payment/PaystackService';

interface PaymentTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  date: Date;
  description: string;
  paymentMethod: {
    type: 'card' | 'bank' | 'ussd' | 'bank_transfer';
    details: string;
    last4?: string;
    brand?: string;
  };
  customer: {
    email: string;
    name: string;
  };
  invoiceUrl?: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
}

interface TransactionFilters {
  status: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  searchTerm: string;
  paymentMethod: string;
}

export function PaymentHistory() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PaymentTransaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    status: 'all',
    dateRange: { from: null, to: null },
    searchTerm: '',
    paymentMethod: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const paystackService = new PaystackService();
  const itemsPerPage = 10;

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockTransactions: PaymentTransaction[] = [
        {
          id: 'txn_1',
          reference: 'agri_1704067200_abc123',
          amount: 15000,
          currency: 'NGN',
          status: 'success',
          date: new Date('2024-01-15'),
          description: 'Professional Plan - January 2024',
          paymentMethod: {
            type: 'card',
            details: 'Visa **** 4321',
            last4: '4321',
            brand: 'Visa'
          },
          customer: {
            email: 'user@example.com',
            name: 'John Doe'
          },
          receiptUrl: '/api/receipts/txn_1',
          metadata: {
            planId: 'professional',
            planName: 'Professional Plan'
          }
        },
        {
          id: 'txn_2',
          reference: 'agri_1701475200_def456',
          amount: 15000,
          currency: 'NGN',
          status: 'success',
          date: new Date('2023-12-15'),
          description: 'Professional Plan - December 2023',
          paymentMethod: {
            type: 'bank_transfer',
            details: 'GTBank Transfer'
          },
          customer: {
            email: 'user@example.com',
            name: 'John Doe'
          },
          receiptUrl: '/api/receipts/txn_2'
        },
        {
          id: 'txn_3',
          reference: 'agri_1698883200_ghi789',
          amount: 5000,
          currency: 'NGN',
          status: 'failed',
          date: new Date('2023-11-15'),
          description: 'Starter Plan - November 2023',
          paymentMethod: {
            type: 'card',
            details: 'MasterCard **** 5678',
            last4: '5678',
            brand: 'MasterCard'
          },
          customer: {
            email: 'user@example.com',
            name: 'John Doe'
          }
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.reference.toLowerCase().includes(searchLower) ||
        tx.description.toLowerCase().includes(searchLower) ||
        tx.customer.email.toLowerCase().includes(searchLower) ||
        tx.customer.name.toLowerCase().includes(searchLower)
      );
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(tx => tx.paymentMethod.type === filters.paymentMethod);
    }

    // Date range filter
    if (filters.dateRange.from) {
      filtered = filtered.filter(tx => tx.date >= filters.dateRange.from!);
    }
    if (filters.dateRange.to) {
      filtered = filtered.filter(tx => tx.date <= filters.dateRange.to!);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const downloadReceipt = async (transaction: PaymentTransaction) => {
    if (!transaction.receiptUrl) {
      alert('Receipt not available for this transaction');
      return;
    }

    try {
      // In a real implementation, this would download from your backend
      window.open(transaction.receiptUrl, '_blank');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const downloadInvoice = async (transaction: PaymentTransaction) => {
    if (!transaction.invoiceUrl) {
      alert('Invoice not available for this transaction');
      return;
    }

    try {
      window.open(transaction.invoiceUrl, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const exportTransactions = () => {
    const csv = generateCSV(filteredTransactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (data: PaymentTransaction[]) => {
    const headers = ['Date', 'Reference', 'Description', 'Amount', 'Currency', 'Status', 'Payment Method'];
    const rows = data.map(tx => [
      tx.date.toLocaleDateString(),
      tx.reference,
      tx.description,
      tx.amount.toString(),
      tx.currency,
      tx.status,
      tx.paymentMethod.details
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getStatusColor = (status: string) => {
    return PaystackService.getPaymentStatusColor(status);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return '💳';
      case 'bank':
      case 'bank_transfer':
        return '🏦';
      case 'ussd':
        return '📱';
      default:
        return '💰';
    }
  };

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const totalAmount = filteredTransactions
    .filter(tx => tx.status === 'success')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
            <p className="text-gray-600">Track all your transactions and payments</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={exportTransactions}
              disabled={filteredTransactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={loadTransactions} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredTransactions.filter(tx => tx.status === 'success').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredTransactions.filter(tx => tx.status === 'failed').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">✗</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold">{PaystackService.formatCurrency(totalAmount)}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">₦</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-10"
                    placeholder="Search by reference, email..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="all">All Methods</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="ussd">USSD</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    status: 'all',
                    dateRange: { from: null, to: null },
                    searchTerm: '',
                    paymentMethod: 'all'
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading transactions...</span>
            </div>
          ) : currentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {getPaymentMethodIcon(transaction.paymentMethod.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{transaction.description}</p>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Reference: {transaction.reference}</p>
                            <p>Payment: {transaction.paymentMethod.details}</p>
                            <p>Date: {transaction.date.toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {PaystackService.formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-600">{transaction.currency}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {transaction.receiptUrl && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => downloadReceipt(transaction)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Receipt
                            </Button>
                          )}
                          {transaction.invoiceUrl && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => downloadInvoice(transaction)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            View Details
                          </summary>
                          <div className="mt-2 text-gray-600">
                            {Object.entries(transaction.metadata).map(([key, value]) => (
                              <p key={key}>
                                <span className="font-medium">{key}:</span> {String(value)}
                              </p>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentHistory;