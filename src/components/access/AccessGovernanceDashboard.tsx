import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  UserGroupIcon,
  KeyIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { AccessControlService, AccessRequest, PermissionDrift } from '@/lib/access-control';

interface AccessAnalytics {
  totalRequests: number;
  approvedRequests: number;
  deniedRequests: number;
  emergencyAccesses: number;
  topRequestedPermissions: Array<{ permission: string; count: number }>;
  accessByUser: Array<{ user_id: string; full_name: string; access_count: number }>;
  riskScore: number;
}

export default function AccessGovernanceDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'drift' | 'analytics' | 'roles'>('overview');
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [permissionDrifts, setPermissionDrifts] = useState<PermissionDrift[]>([]);
  const [analytics, setAnalytics] = useState<AccessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, these would be API calls
      const mockRequests: AccessRequest[] = [
        {
          id: '1',
          user_id: 'user_1',
          tenant_id: 'tenant_1',
          requested_permission: 'financial.delete',
          resource_type: 'financial_record',
          resource_id: 'record_123',
          justification: 'Need to remove duplicate transaction entry',
          status: 'pending',
          requested_at: '2024-01-25T10:30:00Z',
          emergency_access: false
        },
        {
          id: '2',
          user_id: 'user_2',
          tenant_id: 'tenant_1',
          requested_permission: 'system.backup',
          resource_type: 'system',
          justification: 'Emergency backup before system maintenance',
          status: 'approved',
          requested_at: '2024-01-25T08:15:00Z',
          reviewed_at: '2024-01-25T08:30:00Z',
          reviewed_by: 'admin_1',
          review_notes: 'Approved for scheduled maintenance',
          emergency_access: true
        },
        {
          id: '3',
          user_id: 'user_3',
          tenant_id: 'tenant_1',
          requested_permission: 'farms.delete',
          resource_type: 'farm',
          resource_id: 'farm_456',
          justification: 'Testing purposes - will restore from backup',
          status: 'denied',
          requested_at: '2024-01-24T14:20:00Z',
          reviewed_at: '2024-01-24T15:45:00Z',
          reviewed_by: 'admin_1',
          review_notes: 'Production data should not be deleted for testing'
        }
      ];

      const mockDrifts: PermissionDrift[] = [
        {
          id: '1',
          user_id: 'user_4',
          tenant_id: 'tenant_1',
          permission_id: 'perm_1',
          drift_type: 'stale',
          detected_at: '2024-01-25T12:00:00Z',
          severity: 'medium',
          description: 'User has not logged in for 95 days',
          auto_remediated: false
        },
        {
          id: '2',
          user_id: 'user_5',
          tenant_id: 'tenant_1',
          permission_id: 'perm_2',
          drift_type: 'excessive',
          detected_at: '2024-01-25T11:30:00Z',
          severity: 'high',
          description: 'User has 23 permissions, expected ~8 for worker role',
          auto_remediated: false
        }
      ];

      const mockAnalytics: AccessAnalytics = {
        totalRequests: 15,
        approvedRequests: 8,
        deniedRequests: 4,
        emergencyAccesses: 3,
        topRequestedPermissions: [
          { permission: 'financial.delete', count: 4 },
          { permission: 'farms.update', count: 3 },
          { permission: 'system.backup', count: 2 }
        ],
        accessByUser: [
          { user_id: 'user_1', full_name: 'John Smith', access_count: 45 },
          { user_id: 'user_2', full_name: 'Sarah Johnson', access_count: 32 },
          { user_id: 'user_3', full_name: 'Mike Brown', access_count: 28 }
        ],
        riskScore: 23
      };

      setAccessRequests(mockRequests);
      setPermissionDrifts(mockDrifts);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch access governance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReview = async (requestId: string, approved: boolean, notes: string) => {
    try {
      // In real implementation, this would call AccessControlService.reviewAccessRequest
      setAccessRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: approved ? 'approved' : 'denied',
              reviewed_at: new Date().toISOString(),
              review_notes: notes
            }
          : req
      ));
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to review access request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'denied': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
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
            <ShieldCheckIcon className="w-8 h-8 text-blue-600 mr-3" />
            Access Governance & Permission Management
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'requests', label: 'Access Requests', icon: KeyIcon },
              { key: 'drift', label: 'Permission Drift', icon: ExclamationTriangleIcon },
              { key: 'analytics', label: 'Analytics', icon: ChartBarIcon },
              { key: 'roles', label: 'Role Management', icon: UserGroupIcon }
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
                {key === 'requests' && accessRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {accessRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
                {key === 'drift' && permissionDrifts.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {permissionDrifts.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <KeyIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.totalRequests}
                      </div>
                      <div className="text-sm text-blue-800">Total Requests</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.approvedRequests}
                      </div>
                      <div className="text-sm text-green-800">Approved</div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <XCircleIcon className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-red-600">
                        {analytics.deniedRequests}
                      </div>
                      <div className="text-sm text-red-800">Denied</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.emergencyAccesses}
                      </div>
                      <div className="text-sm text-orange-800">Emergency Access</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="#e5e7eb"
                            strokeWidth="10"
                            fill="transparent"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke={analytics.riskScore >= 70 ? '#dc2626' : analytics.riskScore >= 40 ? '#d97706' : '#16a34a'}
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={`${analytics.riskScore * 2.83} 283`}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getRiskScoreColor(analytics.riskScore)}`}>
                            {analytics.riskScore}
                          </div>
                          <div className="text-sm text-gray-500">Risk Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    {analytics.riskScore < 30 && 'Low risk - Good access governance'}
                    {analytics.riskScore >= 30 && analytics.riskScore < 70 && 'Medium risk - Monitor closely'}
                    {analytics.riskScore >= 70 && 'High risk - Immediate attention required'}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Requested Permissions</h3>
                  <div className="space-y-3">
                    {analytics.topRequestedPermissions.map((perm, index) => (
                      <div key={perm.permission} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{perm.permission}</span>
                        </div>
                        <span className="text-sm text-gray-500">{perm.count} requests</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Access Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Access Requests</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Filter
                  </button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Bulk Review
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {accessRequests.map(request => (
                  <div key={request.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {request.requested_permission}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          {request.emergency_access && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Emergency
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500">Resource Type</div>
                            <div className="text-sm font-medium text-gray-900">{request.resource_type}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Resource ID</div>
                            <div className="text-sm font-medium text-gray-900">{request.resource_id || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Requested</div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(request.requested_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Expires</div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.expires_at ? new Date(request.expires_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-gray-500">Justification</div>
                          <div className="text-sm text-gray-900 mt-1">{request.justification}</div>
                        </div>

                        {request.review_notes && (
                          <div className="mb-4">
                            <div className="text-sm text-gray-500">Review Notes</div>
                            <div className="text-sm text-gray-900 mt-1">{request.review_notes}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                            >
                              Review
                            </button>
                            <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">
                              View Details
                            </button>
                          </>
                        )}
                        {request.status !== 'pending' && (
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permission Drift Tab */}
          {activeTab === 'drift' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Permission Drift Detection</h3>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Run Detection
                </button>
              </div>

              {permissionDrifts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No permission drift detected</p>
                  <p className="text-sm">Your access governance is healthy!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {permissionDrifts.map(drift => (
                    <div key={drift.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 capitalize">
                              {drift.drift_type} Permission
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(drift.severity)}`}>
                              {drift.severity}
                            </span>
                          </div>

                          <div className="text-sm text-gray-900 mb-4">
                            {drift.description}
                          </div>

                          <div className="text-xs text-gray-500">
                            Detected: {new Date(drift.detected_at).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700">
                            Remediate
                          </button>
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">
                            Ignore
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Access Analytics</h3>
              
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h4>
                <div className="space-y-4">
                  {analytics.accessByUser.map((user, index) => (
                    <div key={user.user_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{user.full_name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{user.access_count} accesses</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Create Role
                </button>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <p className="text-gray-500">Role management interface would be implemented here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Review Access Request</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  Permission: <span className="font-semibold">{selectedRequest.requested_permission}</span>
                </p>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Review notes..."
                  rows={3}
                />
              </div>
              <div className="items-center px-4 py-3 space-x-4">
                <button
                  onClick={() => handleRequestReview(selectedRequest.id, true, 'Approved')}
                  className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRequestReview(selectedRequest.id, false, 'Denied')}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700"
                >
                  Deny
                </button>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}