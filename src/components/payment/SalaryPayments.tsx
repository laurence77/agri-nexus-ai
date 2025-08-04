import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  Users,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Send,
  Download,
  Eye,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  FileText,
  Calculator,
  Award,
  TrendingUp,
  Settings,
  Bell
} from 'lucide-react';
import { SalaryPayment, PaymentTransaction } from '@/services/payment/payment-service';
import { paymentUtils, PAYMENT_CONFIG, PAYMENT_STATUS, PaymentStatus } from './index';

interface SalaryPaymentsProps {
  farmId: string;
  userId: string;
  userRole?: 'farm_owner' | 'farm_manager' | 'admin';
  onSalaryProcess?: (payments: SalaryPayment[]) => void;
  onPaymentComplete?: (paymentId: string) => void;
  className?: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  phoneNumber: string;
  baseSalary: number;
  currency: string;
  paymentMethod: string;
  bankAccount?: string;
  taxId?: string;
  status: 'active' | 'inactive' | 'terminated';
  hireDate: Date;
  department: string;
}

interface PayrollPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  totalAmount: number;
  employeeCount: number;
}

interface AttendanceRecord {
  employeeId: string;
  daysWorked: number;
  overtimeHours: number;
  bonuses: number;
  deductions: number;
  totalEarnings: number;
}

/**
 * Salary Payments Component
 * Automated salary and wage payments for farm workers and staff
 */
export function SalaryPayments({ 
  farmId,
  userId,
  userRole = 'farm_manager',
  onSalaryProcess,
  onPaymentComplete,
  className 
}: SalaryPaymentsProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('KES');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'payroll' | 'history'>('overview');

  useEffect(() => {
    loadEmployees();
    loadPayrollData();
  }, [farmId]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Mock employee data - in production, fetch from HR service
      const mockEmployees: Employee[] = [
        {
          id: 'emp_001',
          name: 'John Mwangi',
          role: 'Field Supervisor',
          phoneNumber: '+254712345678',
          baseSalary: 25000,
          currency: 'KES',
          paymentMethod: 'mpesa',
          status: 'active',
          hireDate: new Date('2023-01-15'),
          department: 'Operations'
        },
        {
          id: 'emp_002',
          name: 'Mary Wanjiru',
          role: 'Crop Specialist',
          phoneNumber: '+254787654321',
          baseSalary: 30000,
          currency: 'KES',
          paymentMethod: 'mpesa',
          status: 'active',
          hireDate: new Date('2023-03-01'),
          department: 'Agronomy'
        },
        {
          id: 'emp_003',
          name: 'Peter Kimani',
          role: 'Equipment Operator',
          phoneNumber: '+254756789012',
          baseSalary: 20000,
          currency: 'KES',
          paymentMethod: 'airtel_money',
          status: 'active',
          hireDate: new Date('2023-06-10'),
          department: 'Operations'
        },
        {
          id: 'emp_004',
          name: 'Grace Njeri',
          role: 'Quality Control',
          phoneNumber: '+254701234567',
          baseSalary: 22000,
          currency: 'KES',
          paymentMethod: 'mpesa',
          status: 'active',
          hireDate: new Date('2023-08-20'),
          department: 'Quality'
        },
        {
          id: 'emp_005',
          name: 'David Ochieng',
          role: 'Farm Worker',
          phoneNumber: '+254734567890',
          baseSalary: 15000,
          currency: 'KES',
          paymentMethod: 'mpesa',
          status: 'active',
          hireDate: new Date('2024-01-05'),
          department: 'Operations'
        }
      ];

      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollData = async () => {
    try {
      // Mock payroll periods
      const mockPeriods: PayrollPeriod[] = [
        {
          id: 'period_001',
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-07-31'),
          payDate: new Date('2024-08-05'),
          status: 'completed',
          totalAmount: 112000,
          employeeCount: 5
        },
        {
          id: 'period_002',
          startDate: new Date('2024-08-01'),
          endDate: new Date('2024-08-31'),
          payDate: new Date('2024-09-05'),
          status: 'draft',
          totalAmount: 115000,
          employeeCount: 5
        }
      ];

      setPayrollPeriods(mockPeriods);
      setSelectedPeriod(mockPeriods[1]); // Current period

      // Mock attendance records for current period
      const mockAttendance: AttendanceRecord[] = [
        {
          employeeId: 'emp_001',
          daysWorked: 22,
          overtimeHours: 8,
          bonuses: 2000,
          deductions: 500,
          totalEarnings: 26500
        },
        {
          employeeId: 'emp_002',
          daysWorked: 21,
          overtimeHours: 5,
          bonuses: 1500,
          deductions: 0,
          totalEarnings: 31500
        },
        {
          employeeId: 'emp_003',
          daysWorked: 20,
          overtimeHours: 10,
          bonuses: 1000,
          deductions: 200,
          totalEarnings: 20800
        },
        {
          employeeId: 'emp_004',
          daysWorked: 22,
          overtimeHours: 6,
          bonuses: 800,
          deductions: 300,
          totalEarnings: 22500
        },
        {
          employeeId: 'emp_005',
          daysWorked: 23,
          overtimeHours: 12,
          bonuses: 500,
          deductions: 100,
          totalEarnings: 15400
        }
      ];

      setAttendanceRecords(mockAttendance);

      // Mock salary payments
      const mockPayments: SalaryPayment[] = mockAttendance.map(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        return {
          id: `sal_${record.employeeId}_${Date.now()}`,
          employeeId: record.employeeId,
          employeeName: employee?.name || 'Unknown',
          payrollPeriodId: 'period_002',
          baseSalary: employee?.baseSalary || 0,
          overtimePay: (record.overtimeHours * 100), // KES 100 per hour
          bonuses: record.bonuses,
          deductions: record.deductions,
          grossAmount: record.totalEarnings,
          taxAmount: Math.round(record.totalEarnings * 0.05), // 5% tax
          netAmount: Math.round(record.totalEarnings * 0.95),
          currency: employee?.currency || 'KES',
          paymentMethod: employee?.paymentMethod || 'mpesa',
          phoneNumber: employee?.phoneNumber || '',
          status: 'pending' as PaymentStatus,
          payDate: new Date('2024-09-05'),
          createdAt: new Date(),
          updatedAt: new Date()
        } as SalaryPayment;
      });

      setSalaryPayments(mockPayments);
    } catch (error) {
      console.error('Failed to load payroll data:', error);
    }
  };

  const handleProcessPayroll = async () => {
    if (!selectedPeriod) return;
    
    setProcessing(true);
    try {
      // Process salary payments
      const updatedPayments = salaryPayments.map(payment => ({
        ...payment,
        status: 'processing' as PaymentStatus,
        updatedAt: new Date()
      }));
      
      setSalaryPayments(updatedPayments);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update payment status to completed
      const completedPayments = updatedPayments.map(payment => ({
        ...payment,
        status: 'completed' as PaymentStatus,
        paidAt: new Date(),
        reference: paymentUtils.generatePaymentRef('SAL'),
        updatedAt: new Date()
      }));
      
      setSalaryPayments(completedPayments);
      
      // Update payroll period status
      setPayrollPeriods(prev => prev.map(period => 
        period.id === selectedPeriod.id 
          ? { ...period, status: 'completed' }
          : period
      ));
      
      if (onSalaryProcess) {
        onSalaryProcess(completedPayments);
      }
      
    } catch (error) {
      console.error('Payroll processing failed:', error);
      
      // Update status to failed
      setSalaryPayments(prev => prev.map(payment => ({
        ...payment,
        status: 'failed' as PaymentStatus,
        updatedAt: new Date()
      })));
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    return paymentUtils.getStatusColor(status);
  };

  const filteredPayments = salaryPayments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = !searchTerm || 
      payment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phoneNumber.includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  const renderEmployeeCard = (employee: Employee) => {
    const attendance = attendanceRecords.find(record => record.employeeId === employee.id);
    
    return (
      <GlassCard key={employee.id} className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-white">{employee.name}</h3>
            <p className="text-gray-300 text-sm">{employee.role}</p>
            <p className="text-gray-400 text-xs">{employee.department}</p>
          </div>
          
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            employee.status === 'active' ? 'text-green-400 bg-green-400/20' : 'text-gray-400 bg-gray-400/20'
          )}>
            {employee.status}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Base Salary</span>
            <span className="text-white font-medium">
              {paymentUtils.formatCurrency(employee.baseSalary, employee.currency)}
            </span>
          </div>
          
          {attendance && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-300">Days Worked</span>
                <span className="text-blue-400">{attendance.daysWorked}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Overtime Hours</span>
                <span className="text-yellow-400">{attendance.overtimeHours}h</span>
              </div>
              
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-gray-300">Total Earnings</span>
                <span className="text-green-400 font-medium">
                  {paymentUtils.formatCurrency(attendance.totalEarnings, employee.currency)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {employee.paymentMethod.toUpperCase()} • {employee.phoneNumber}
          </div>
          
          <div className="flex space-x-1">
            <GlassButton variant="secondary" size="sm">
              <Edit className="h-3 w-3" />
            </GlassButton>
            <GlassButton variant="secondary" size="sm">
              <Eye className="h-3 w-3" />
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    );
  };

  const renderPayrollSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <GlassCard className="p-4 text-center">
        <div className="text-2xl font-bold text-blue-400">{employees.length}</div>
        <div className="text-sm text-gray-300">Total Employees</div>
      </GlassCard>
      
      <GlassCard className="p-4 text-center">
        <div className="text-2xl font-bold text-green-400">
          {paymentUtils.formatCurrency(
            salaryPayments.reduce((sum, payment) => sum + payment.grossAmount, 0),
            selectedCurrency
          )}
        </div>
        <div className="text-sm text-gray-300">Total Gross</div>
      </GlassCard>
      
      <GlassCard className="p-4 text-center">
        <div className="text-2xl font-bold text-red-400">
          {paymentUtils.formatCurrency(
            salaryPayments.reduce((sum, payment) => sum + payment.taxAmount, 0),
            selectedCurrency
          )}
        </div>
        <div className="text-sm text-gray-300">Total Tax</div>
      </GlassCard>
      
      <GlassCard className="p-4 text-center">
        <div className="text-2xl font-bold text-purple-400">
          {paymentUtils.formatCurrency(
            salaryPayments.reduce((sum, payment) => sum + payment.netAmount, 0),
            selectedCurrency
          )}
        </div>
        <div className="text-sm text-gray-300">Net Payout</div>
      </GlassCard>
    </div>
  );

  const renderPaymentItem = (payment: SalaryPayment) => (
    <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <Users className="h-5 w-5 text-blue-400" />
        </div>
        
        <div>
          <div className="font-medium text-white">{payment.employeeName}</div>
          <div className="text-sm text-gray-300">{payment.phoneNumber}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-semibold text-green-400">
          {paymentUtils.formatCurrency(payment.netAmount, payment.currency)}
        </div>
        
        <div className="flex items-center justify-end space-x-2 mt-1">
          <div className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(payment.status))}>
            {payment.status}
          </div>
          {payment.reference && (
            <span className="text-xs text-gray-400">{payment.reference}</span>
          )}
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
            <Users className="h-6 w-6 text-green-400" />
            <span>Salary Payments</span>
          </h2>
          <p className="text-gray-300 mt-1">Manage employee salaries and payroll processing</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
            />
          </div>

          <GlassButton variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </GlassButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'payroll', label: 'Payroll', icon: Calculator },
          { id: 'history', label: 'History', icon: Clock }
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
      {activeTab === 'overview' && (
        <>
          {renderPayrollSummary()}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Payroll Status</h3>
              <div className="space-y-3">
                {payrollPeriods.slice(0, 3).map(period => (
                  <div key={period.id} className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">
                        {period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-300">
                        {period.employeeCount} employees
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">
                        {paymentUtils.formatCurrency(period.totalAmount, selectedCurrency)}
                      </div>
                      <div className={cn('text-xs px-2 py-1 rounded-full', getStatusColor(period.status as any))}>
                        {period.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
            
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <GlassButton
                  variant="primary"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('payroll')}
                >
                  <Calculator className="h-4 w-4 mr-3" />
                  Current Payroll
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('employees')}
                >
                  <Users className="h-4 w-4 mr-3" />
                  Manage Employees
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Payroll Reports
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </>
      )}

      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(employee => renderEmployeeCard(employee))}
        </div>
      )}

      {activeTab === 'payroll' && (
        <>
          {/* Payroll Period Selector */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Current Payroll Period</h3>
              {selectedPeriod?.status === 'draft' && (
                <GlassButton
                  variant="primary"
                  onClick={handleProcessPayroll}
                  disabled={processing}
                >
                  {processing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4 mr-2" />
                  )}
                  {processing ? 'Processing...' : 'Process Payroll'}
                </GlassButton>
              )}
            </div>
            
            {selectedPeriod && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-300 text-sm">Period</div>
                  <div className="text-white font-medium">
                    {selectedPeriod.startDate.toLocaleDateString()} - {selectedPeriod.endDate.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 text-sm">Pay Date</div>
                  <div className="text-white font-medium">
                    {selectedPeriod.payDate.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 text-sm">Employees</div>
                  <div className="text-blue-400 font-medium">{selectedPeriod.employeeCount}</div>
                </div>
                <div>
                  <div className="text-gray-300 text-sm">Total Amount</div>
                  <div className="text-green-400 font-medium">
                    {paymentUtils.formatCurrency(selectedPeriod.totalAmount, selectedCurrency)}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Payment List */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'pending', 'completed', 'failed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                  filterStatus === status
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <GlassCard className="divide-y divide-white/10">
            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-lg font-semibold text-white mb-2">No Salary Payments</h3>
                <p className="text-gray-300">Payroll data will appear here once processed</p>
              </div>
            ) : (
              filteredPayments.map(payment => renderPaymentItem(payment))
            )}
          </GlassCard>
        </>
      )}

      {activeTab === 'history' && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payroll History</h3>
          <div className="space-y-4">
            {payrollPeriods.map(period => (
              <div key={period.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">
                    {period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-300">
                    {period.employeeCount} employees • Paid on {period.payDate.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">
                    {paymentUtils.formatCurrency(period.totalAmount, selectedCurrency)}
                  </div>
                  <div className={cn('text-xs px-2 py-1 rounded-full mt-1', getStatusColor(period.status as any))}>
                    {period.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

export default SalaryPayments;