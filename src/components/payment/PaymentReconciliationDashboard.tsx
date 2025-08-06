import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { PaymentReconciliationService, ReconciliationSession, PaymentDiscrepancy } from '@/lib/payment-reconciliation';

interface ReconciliationSummary {
  total_transactions: number;
  matched_transactions: number;
  unmatched_transactions: number;
  total_discrepancies: number;
  critical_discrepancies: number;
  total_amount_processed: number;
  total_amount_matched: number;
  reconciliation_rate: number;
}

export default function PaymentReconciliationDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'discrepancies' | 'providers' | 'reports'>('overview');
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [discrepancies, setDiscrepancies] = useState<PaymentDiscrepancy[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSessionModal, setNewSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ReconciliationSession | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, these would be API calls
      const mockSessions: ReconciliationSession[] = [
        {
          id: '1',
          tenant_id: 'tenant_1',
          name: 'January 2024 Reconciliation',
          period_start: '2024-01-01',
          period_end: '2024-01-31',
          account_ids: ['main_checking', 'savings'],
          status: 'completed',
          total_transactions: 245,
          matched_transactions: 235,
          discrepancies: 5,
          total_amount_reconciled: 875000,
          created_by: 'user_1',
          started_at: '2024-02-01T09:00:00Z',
          completed_at: '2024-02-01T14:30:00Z'
        },
        {
          id: '2',
          tenant_id: 'tenant_1',
          name: 'February 2024 Reconciliation',
          period_start: '2024-02-01',
          period_end: '2024-02-28',
          account_ids: ['main_checking', 'credit_card'],
          status: 'in_progress',
          total_transactions: 189,
          matched_transactions: 156,
          discrepancies: 8,
          total_amount_reconciled: 0,
          created_by: 'user_1',
          started_at: '2024-03-01T08:15:00Z'
        }
      ];

      const mockDiscrepancies: PaymentDiscrepancy[] = [
        {
          id: '1',
          session_id: '2',
          discrepancy_type: 'missing_external',
          severity: 'high',
          description: 'Internal payment of $12,500 to John Deere not found in bank records',
          resolution_status: 'open',
          created_at: '2024-03-01T10:00:00Z'
        },
        {
          id: '2',
          session_id: '2',
          discrepancy_type: 'amount_mismatch',
          severity: 'medium',
          description: 'Crop insurance payment: Internal $8,450 vs Bank $8,400 (difference: $50)',
          resolution_status: 'investigating',
          created_at: '2024-03-01T11:30:00Z'
        },
        {
          id: '3',
          session_id: '2',
          discrepancy_type: 'missing_internal',
          severity: 'critical',
          description: 'Bank withdrawal of $25,000 not recorded in internal system',
          resolution_status: 'escalated',
          assigned_to: 'manager_1',
          created_at: '2024-03-01T12:15:00Z'
        }
      ];

      const mockSummary: ReconciliationSummary = {
        total_transactions: 434,
        matched_transactions: 391,
        unmatched_transactions: 43,
        total_discrepancies: 13,
        critical_discrepancies: 1,
        total_amount_processed: 1250000,
        total_amount_matched: 1187500,
        reconciliation_rate: 90.1
      };

      setSessions(mockSessions);
      setDiscrepancies(mockDiscrepancies);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Failed to fetch reconciliation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = async (sessionData: {
    name: string;
    periodStart: string;
    periodEnd: string;
    accountIds: string[];
  }) => {
    try {
      // In real implementation, call PaymentReconciliationService.startReconciliationSession
      console.log('Starting new session:', sessionData);
      setNewSessionModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to start reconciliation session:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'review_required': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResolutionStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'escalated': return 'text-red-600 bg-red-100';
      case 'open': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCardIcon className="w-8 h-8 text-blue-600 mr-3" />
            Payment Reconciliation
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'sessions', label: 'Sessions', icon: ClockIcon },
              { key: 'discrepancies', label: 'Discrepancies', icon: ExclamationTriangleIcon },
              { key: 'providers', label: 'Payment Providers', icon: CreditCardIcon },
              { key: 'reports', label: 'Reports', icon: DocumentTextIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
                {key === 'discrepancies' && discrepancies.filter(d => d.resolution_status === 'open').length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {discrepancies.filter(d => d.resolution_status === 'open').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && summary && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(summary.total_amount_processed)}
                      </div>
                      <div className="text-sm text-blue-800">Total Processed</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-green-600">
                        {summary.reconciliation_rate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-800">Reconciliation Rate</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {summary.total_discrepancies}
                      </div>
                      <div className="text-sm text-orange-800">Total Discrepancies</div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-red-600">
                        {summary.critical_discrepancies}
                      </div>
                      <div className="text-sm text-red-800">Critical Issues</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Reconciliation Sessions</h3>
                  <button
                    onClick={() => setNewSessionModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    New Session
                  </button>
                </div>

                <div className="space-y-4">
                  {sessions.slice(0, 3).map(session => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{session.name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">{session.matched_transactions}</span> / {session.total_transactions} matched
                          </div>
                          <div>
                            <span className="font-medium">{session.discrepancies}</span> discrepancies
                          </div>
                          <div>
                            {formatDate(session.period_start)} - {formatDate(session.period_end)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {session.status === 'in_progress' && (
                          <button className="p-2 text-blue-600 hover:text-blue-800">
                            <PlayIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Reconciliation Sessions</h3>
                <button
                  onClick={() => setNewSessionModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Start New Session
                </button>
              </div>

              <div className="space-y-4">
                {sessions.map(session => (
                  <div key={session.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-xl font-semibold text-gray-900">{session.name}</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(session.period_start)} - {formatDate(session.period_end)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                        >
                          View Details
                        </button>
                        {session.status === 'in_progress' && (
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            Continue
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{session.total_transactions}</div>
                        <div className="text-sm text-gray-600">Total Transactions</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{session.matched_transactions}</div>
                        <div className="text-sm text-green-800">Matched</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {session.total_transactions - session.matched_transactions}
                        </div>
                        <div className="text-sm text-yellow-800">Unmatched</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{session.discrepancies}</div>
                        <div className="text-sm text-red-800">Discrepancies</div>
                      </div>
                    </div>

                    {session.total_amount_reconciled > 0 && (
                      <div className="text-sm text-gray-600">
                        Amount Reconciled: <span className="font-semibold">{formatCurrency(session.total_amount_reconciled)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discrepancies Tab */}
          {activeTab === 'discrepancies' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Payment Discrepancies</h3>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {discrepancies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No discrepancies found</p>
                  <p className="text-sm">All transactions are properly reconciled!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {discrepancies.map(discrepancy => (
                    <div key={discrepancy.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(discrepancy.severity)}`}>
                              {discrepancy.severity}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResolutionStatusColor(discrepancy.resolution_status)}`}>
                              {discrepancy.resolution_status.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                              {discrepancy.discrepancy_type.replace('_', ' ')}
                            </span>
                          </div>

                          <p className="text-gray-900 mb-3">{discrepancy.description}</p>

                          <div className="text-sm text-gray-500">
                            Created: {formatDate(discrepancy.created_at)}
                            {discrepancy.assigned_to && (
                              <span className="ml-4">Assigned to: User {discrepancy.assigned_to}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                            Investigate
                          </button>
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment Providers Tab */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Payment Providers</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Add Provider
                </button>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <p className="text-gray-500">Payment provider configuration interface would be implemented here.</p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>• Bank account integration (Chase, Wells Fargo, etc.)</p>
                  <p>• Payment processors (Stripe, Square, PayPal)</p>
                  <p>• Agricultural marketplaces (Grain.com, AgriSuite)</p>
                  <p>• Government payment systems (USDA, FSA)</p>
                  <p>• Insurance companies (Crop Growers, AgriLogic)</p>
                  <p>• Carbon credit exchanges (Nori, Indigo)</p>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Reconciliation Reports</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Generate Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Summary Report', description: 'High-level reconciliation overview', icon: ChartBarIcon },
                  { name: 'Detailed Transactions', description: 'Complete transaction listing with matches', icon: DocumentTextIcon },
                  { name: 'Discrepancy Report', description: 'All identified discrepancies and resolutions', icon: ExclamationTriangleIcon },
                  { name: 'Audit Trail', description: 'Complete audit trail for compliance', icon: ClockIcon },
                  { name: 'Variance Analysis', description: 'Analysis of amount and timing variances', icon: ChartBarIcon },
                  { name: 'Provider Performance', description: 'Payment provider sync and accuracy metrics', icon: CreditCardIcon }
                ].map((report) => (
                  <div key={report.name} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <report.icon className="w-8 h-8 text-blue-600" />
                      <h4 className="ml-3 text-lg font-semibold text-gray-900">{report.name}</h4>
                    </div>
                    <p className="text-gray-600 mb-4">{report.description}</p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Generate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      {newSessionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Start New Reconciliation Session</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                startNewSession({
                  name: formData.get('name') as string,
                  periodStart: formData.get('periodStart') as string,
                  periodEnd: formData.get('periodEnd') as string,
                  accountIds: ['main_checking'] // Simplified for demo
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Session Name</label>
                    <input
                      type="text"
                      name="name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="March 2024 Reconciliation"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Period Start</label>
                    <input
                      type="date"
                      name="periodStart"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Period End</label>
                    <input
                      type="date"
                      name="periodEnd"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Start Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSessionModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}