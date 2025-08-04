import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  FileText,
  Plus,
  Send,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Mail,
  Printer,
  Share2,
  Filter,
  Search,
  MoreVertical,
  Settings,
  RefreshCw,
  TrendingUp,
  Archive
} from 'lucide-react';
import { InvoiceData, InvoiceStatus } from '@/services/payment/payment-service';
import { paymentUtils, PAYMENT_CONFIG, INVOICE_STATUS } from './index';

interface InvoiceManagerProps {
  userId: string;
  userRole?: 'farm_owner' | 'farm_manager' | 'admin';
  onInvoiceCreate?: (invoice: InvoiceData) => void;
  onInvoiceSend?: (invoiceId: string) => void;
  onPaymentReceived?: (invoiceId: string, amount: number) => void;
  className?: string;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'service' | 'product' | 'subscription' | 'salary';
  template: Partial<InvoiceData>;
}

interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingAmount: number;
  overdueInvoices: number;
  monthlyRevenue: number;
}

/**
 * Invoice Manager Component
 * Automated invoice generation and management for agricultural services
 */
export function InvoiceManager({ 
  userId,
  userRole = 'farm_owner',
  onInvoiceCreate,
  onInvoiceSend,
  onPaymentReceived,
  className 
}: InvoiceManagerProps) {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingAmount: 0,
    overdueInvoices: 0,
    monthlyRevenue: 0
  });
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('KES');

  useEffect(() => {
    loadInvoices();
    loadTemplates();
  }, [userId]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Mock invoice data - in production, fetch from payment service
      const mockInvoices: InvoiceData[] = [
        {
          id: 'inv_001',
          invoiceNumber: 'INV-202407-0001',
          fromUser: {
            id: userId,
            name: 'Sarah Wanjiku Farm',
            email: 'sarah@wanjikufarm.ke',
            phone: '+254712345678',
            address: 'Kiambu County, Kenya'
          },
          toUser: {
            id: 'client_001',
            name: 'Nairobi Fresh Markets',
            email: 'orders@nairobifresh.co.ke',
            phone: '+254703456789',
            address: 'Industrial Area, Nairobi'
          },
          items: [
            {
              id: 'item_001',
              description: 'Organic Tomatoes - Grade A',
              quantity: 500,
              unit: 'kg',
              unitPrice: 80,
              total: 40000
            },
            {
              id: 'item_002',
              description: 'Fresh Spinach',
              quantity: 100,
              unit: 'bunches',
              unitPrice: 15,
              total: 1500
            }
          ],
          subtotal: 41500,
          taxRate: 16,
          taxAmount: 6640,
          total: 48140,
          currency: 'KES',
          status: 'sent' as InvoiceStatus,
          issueDate: new Date('2024-07-25'),
          dueDate: new Date('2024-08-08'),
          paymentTerms: 14,
          notes: 'Payment due within 14 days of delivery. Late payments subject to 2% monthly penalty.',
          createdAt: new Date('2024-07-25T10:00:00Z'),
          updatedAt: new Date('2024-07-25T10:00:00Z')
        },
        {
          id: 'inv_002',
          invoiceNumber: 'INV-202407-0002',
          fromUser: {
            id: userId,
            name: 'Sarah Wanjiku Farm',
            email: 'sarah@wanjikufarm.ke',
            phone: '+254712345678',
            address: 'Kiambu County, Kenya'
          },
          toUser: {
            id: 'client_002',
            name: 'Green Valley Cooperative',
            email: 'procurement@greenvalley.co.ke',
            phone: '+254756789012',
            address: 'Nakuru County, Kenya'
          },
          items: [
            {
              id: 'item_003',
              description: 'White Maize - H513 Variety',
              quantity: 1000,
              unit: 'kg',
              unitPrice: 45,
              total: 45000
            }
          ],
          subtotal: 45000,
          taxRate: 16,
          taxAmount: 7200,
          total: 52200,
          currency: 'KES',
          status: 'paid' as InvoiceStatus,
          issueDate: new Date('2024-07-20'),
          dueDate: new Date('2024-08-03'),
          paymentTerms: 14,
          paymentDate: new Date('2024-07-28'),
          paymentMethod: 'mpesa',
          paymentReference: 'PAY_1234567890',
          createdAt: new Date('2024-07-20T14:30:00Z'),
          updatedAt: new Date('2024-07-28T16:45:00Z')
        },
        {
          id: 'inv_003',
          invoiceNumber: 'INV-202407-0003',
          fromUser: {
            id: userId,
            name: 'Sarah Wanjiku Farm',
            email: 'sarah@wanjikufarm.ke',
            phone: '+254712345678',
            address: 'Kiambu County, Kenya'
          },
          toUser: {
            id: 'client_003',
            name: 'Urban Grocers Ltd',
            email: 'supplies@urbangrocers.ke',
            phone: '+254720123456',
            address: 'Westlands, Nairobi'
          },
          items: [
            {
              id: 'item_004',
              description: 'Mixed Vegetables Package',
              quantity: 50,
              unit: 'packages',
              unitPrice: 120,
              total: 6000
            }
          ],
          subtotal: 6000,
          taxRate: 16,
          taxAmount: 960,
          total: 6960,
          currency: 'KES',
          status: 'overdue' as InvoiceStatus,
          issueDate: new Date('2024-07-10'),
          dueDate: new Date('2024-07-24'),
          paymentTerms: 14,
          createdAt: new Date('2024-07-10T09:15:00Z'),
          updatedAt: new Date('2024-07-10T09:15:00Z')
        }
      ];

      setInvoices(mockInvoices);
      
      // Calculate stats
      const stats: InvoiceStats = {
        totalInvoices: mockInvoices.length,
        paidInvoices: mockInvoices.filter(inv => inv.status === 'paid').length,
        pendingAmount: mockInvoices
          .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
          .reduce((sum, inv) => sum + inv.total, 0),
        overdueInvoices: mockInvoices.filter(inv => inv.status === 'overdue').length,
        monthlyRevenue: mockInvoices
          .filter(inv => inv.status === 'paid' && 
            inv.paymentDate && 
            inv.paymentDate.getMonth() === new Date().getMonth())
          .reduce((sum, inv) => sum + inv.total, 0)
      };
      
      setInvoiceStats(stats);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    // Mock invoice templates
    const mockTemplates: InvoiceTemplate[] = [
      {
        id: 'template_001',
        name: 'Crop Sales Invoice',
        description: 'Standard invoice for crop sales to buyers',
        category: 'product',
        template: {
          paymentTerms: 14,
          taxRate: 16,
          currency: 'KES',
          notes: 'Payment due within 14 days of delivery.'
        }
      },
      {
        id: 'template_002',
        name: 'Agricultural Services',
        description: 'Invoice for farming services provided',
        category: 'service',
        template: {
          paymentTerms: 7,
          taxRate: 16,
          currency: 'KES',
          notes: 'Service charges as agreed. Payment due on completion.'
        }
      },
      {
        id: 'template_003',
        name: 'Equipment Rental',
        description: 'Invoice for farm equipment rental',
        category: 'service',
        template: {
          paymentTerms: 30,
          taxRate: 16,
          currency: 'KES',
          notes: 'Monthly equipment rental fee. Advance payment required.'
        }
      },
      {
        id: 'template_004',
        name: 'Worker Salary',
        description: 'Monthly salary invoice for farm workers',
        category: 'salary',
        template: {
          paymentTerms: 0,
          taxRate: 0,
          currency: 'KES',
          notes: 'Monthly salary payment as per employment contract.'
        }
      }
    ];
    
    setTemplates(mockTemplates);
  };

  const handleCreateInvoice = (template?: InvoiceTemplate) => {
    const newInvoice: Partial<InvoiceData> = {
      invoiceNumber: paymentUtils.generateInvoiceNumber(),
      fromUser: {
        id: userId,
        name: 'Your Farm Name',
        email: 'your@email.com',
        phone: '+254700000000',
        address: 'Your Address'
      },
      items: [],
      subtotal: 0,
      total: 0,
      currency: selectedCurrency,
      status: 'draft' as InvoiceStatus,
      issueDate: new Date(),
      paymentTerms: 14,
      taxRate: 16,
      ...(template?.template || {})
    };
    
    newInvoice.dueDate = paymentUtils.calculateDueDate(newInvoice.issueDate!, newInvoice.paymentTerms!);
    
    setSelectedInvoice(newInvoice as InvoiceData);
    setShowInvoiceForm(true);
    setShowTemplateSelector(false);
    
    if (onInvoiceCreate) {
      onInvoiceCreate(newInvoice as InvoiceData);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      // Update invoice status to sent
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, status: 'sent' as InvoiceStatus, updatedAt: new Date() }
          : inv
      ));
      
      if (onInvoiceSend) {
        onInvoiceSend(invoiceId);
      }
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-400/20';
      case 'sent':
        return 'text-blue-400 bg-blue-400/20';
      case 'overdue':
        return 'text-red-400 bg-red-400/20';
      case 'cancelled':
        return 'text-gray-400 bg-gray-400/20';
      case 'draft':
      default:
        return 'text-yellow-400 bg-yellow-400/20';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.toUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.items.some(item => item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const renderInvoiceCard = (invoice: InvoiceData) => (
    <GlassCard 
      key={invoice.id}
      className="p-6 cursor-pointer transition-all hover:scale-105"
      onClick={() => setSelectedInvoice(invoice)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{invoice.invoiceNumber}</h3>
          <p className="text-gray-300">{invoice.toUser.name}</p>
        </div>
        
        <div className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(invoice.status))}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Amount</span>
          <span className="text-white font-medium">
            {paymentUtils.formatCurrency(invoice.total, invoice.currency)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Issue Date</span>
          <span className="text-white">{invoice.issueDate.toLocaleDateString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Due Date</span>
          <span className={cn(
            'font-medium',
            paymentUtils.isInvoiceOverdue(invoice.dueDate) && invoice.status !== 'paid'
              ? 'text-red-400'
              : 'text-white'
          )}>
            {invoice.dueDate.toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex space-x-2">
          {invoice.status === 'draft' && (
            <GlassButton
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSendInvoice(invoice.id);
              }}
            >
              <Send className="h-3 w-3 mr-1" />
              Send
            </GlassButton>
          )}
          
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle download
            }}
          >
            <Download className="h-3 w-3" />
          </GlassButton>
        </div>
        
        <div className="text-sm text-gray-400">
          {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
        </div>
      </div>
    </GlassCard>
  );

  const renderTemplateSelector = () => (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Choose Invoice Template</h3>
        <button
          onClick={() => setShowTemplateSelector(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => handleCreateInvoice(template)}
            className="text-left p-4 rounded-lg border border-white/20 hover:border-blue-400/50 hover:bg-white/5 transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">{template.name}</h4>
                <p className="text-sm text-gray-300 mt-1">{template.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                    {template.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {template.template.paymentTerms} days
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10">
        <GlassButton
          variant="secondary"
          onClick={() => handleCreateInvoice()}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Blank Invoice
        </GlassButton>
      </div>
    </GlassCard>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-400" />
            <span>Invoice Manager</span>
          </h2>
          <p className="text-gray-300 mt-1">Create and manage invoices for your agricultural business</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => setShowTemplateSelector(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </GlassButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{invoiceStats.totalInvoices}</div>
          <div className="text-sm text-gray-300">Total Invoices</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{invoiceStats.paidInvoices}</div>
          <div className="text-sm text-gray-300">Paid</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{invoiceStats.overdueInvoices}</div>
          <div className="text-sm text-gray-300">Overdue</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {paymentUtils.formatCurrency(invoiceStats.pendingAmount, selectedCurrency)}
          </div>
          <div className="text-sm text-gray-300">Pending</div>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 mr-1" />
            {paymentUtils.formatCurrency(invoiceStats.monthlyRevenue, selectedCurrency)}
          </div>
          <div className="text-sm text-gray-300">This Month</div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              filterStatus === status
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
            )}
          >
            {status === 'all' ? 'All Status' : status}
          </button>
        ))}
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && renderTemplateSelector()}

      {/* Invoice Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading invoices...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">No Invoices Found</h3>
          <p className="text-gray-300 mb-6">Create your first invoice to get started</p>
          <GlassButton 
            variant="primary"
            onClick={() => setShowTemplateSelector(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map(invoice => renderInvoiceCard(invoice))}
        </div>
      )}
    </div>
  );
}

export default InvoiceManager;