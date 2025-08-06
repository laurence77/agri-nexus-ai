import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  CloudArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { offlineSyncService } from '@/lib/offline-sync';

interface DisasterRecoveryPlan {
  id: string;
  plan_name: string;
  plan_type: string;
  priority_level: string;
  recovery_time_objective_hours: number;
  recovery_point_objective_hours: number;
  recovery_steps: string[];
  contact_list: Record<string, string>;
  last_tested: string | null;
  last_test_result: string | null;
  next_review_date: string;
  is_active: boolean;
}

interface RecoveryExecution {
  id: string;
  plan_id: string;
  incident_description: string;
  executed_by: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  steps_completed: string[];
  downtime_minutes: number | null;
  data_loss_hours: number | null;
}

interface BackupInstance {
  id: string;
  backup_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  file_size_bytes: number | null;
  backup_location: string;
  retention_until: string;
}

export default function DisasterRecoveryDashboard() {
  const [activeTab, setActiveTab] = useState<'plans' | 'executions' | 'backups' | 'testing'>('plans');
  const [plans, setPlans] = useState<DisasterRecoveryPlan[]>([]);
  const [executions, setExecutions] = useState<RecoveryExecution[]>([]);
  const [backups, setBackups] = useState<BackupInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingPlan, setTestingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be API calls
      const mockPlans: DisasterRecoveryPlan[] = [
        {
          id: '1',
          plan_name: 'Data Loss Recovery Plan',
          plan_type: 'data_loss',
          priority_level: 'critical',
          recovery_time_objective_hours: 4,
          recovery_point_objective_hours: 1,
          recovery_steps: [
            'Assess extent of data loss',
            'Identify latest backup',
            'Verify backup integrity',
            'Restore from backup',
            'Validate restored data',
            'Notify affected users',
            'Update documentation'
          ],
          contact_list: {
            primary_contact: 'system_admin@farm.com',
            backup_contact: 'owner@farm.com',
            external_support: 'support@agrinexus.ai'
          },
          last_tested: '2024-01-15T10:00:00Z',
          last_test_result: 'successful',
          next_review_date: '2024-04-15',
          is_active: true
        },
        {
          id: '2',
          plan_name: 'System Failure Recovery',
          plan_type: 'system_failure',
          priority_level: 'high',
          recovery_time_objective_hours: 2,
          recovery_point_objective_hours: 0.5,
          recovery_steps: [
            'Identify failed components',
            'Switch to backup systems',
            'Restore services',
            'Verify functionality',
            'Monitor system health'
          ],
          contact_list: {
            primary_contact: 'tech_lead@farm.com',
            external_support: 'infrastructure@agrinexus.ai'
          },
          last_tested: null,
          last_test_result: null,
          next_review_date: '2024-03-01',
          is_active: true
        }
      ];

      const mockExecutions: RecoveryExecution[] = [
        {
          id: '1',
          plan_id: '1',
          incident_description: 'Database corruption after power outage',
          executed_by: 'admin@farm.com',
          started_at: '2024-01-20T14:30:00Z',
          completed_at: '2024-01-20T17:15:00Z',
          status: 'completed',
          steps_completed: ['Assess extent of data loss', 'Identify latest backup', 'Restore from backup'],
          downtime_minutes: 165,
          data_loss_hours: 0.25
        }
      ];

      const mockBackups: BackupInstance[] = [
        {
          id: '1',
          backup_type: 'full',
          status: 'completed',
          started_at: '2024-01-25T02:00:00Z',
          completed_at: '2024-01-25T03:45:00Z',
          file_size_bytes: 2147483648, // 2GB
          backup_location: 's3',
          retention_until: '2024-04-25T02:00:00Z'
        },
        {
          id: '2',
          backup_type: 'incremental',
          status: 'completed',
          started_at: '2024-01-26T02:00:00Z',
          completed_at: '2024-01-26T02:15:00Z',
          file_size_bytes: 104857600, // 100MB
          backup_location: 's3',
          retention_until: '2024-04-26T02:00:00Z'
        }
      ];

      setPlans(mockPlans);
      setExecutions(mockExecutions);
      setBackups(mockBackups);
    } catch (error) {
      console.error('Failed to fetch disaster recovery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'successful': return 'text-green-600 bg-green-100';
      case 'in_progress': case 'syncing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const testRecoveryPlan = async (planId: string) => {
    setTestingPlan(planId);
    
    try {
      // Simulate testing process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update plan test results
      setPlans(prev => prev.map(plan => 
        plan.id === planId 
          ? { 
              ...plan, 
              last_tested: new Date().toISOString(),
              last_test_result: 'successful'
            }
          : plan
      ));
    } catch (error) {
      console.error('Recovery plan test failed:', error);
    } finally {
      setTestingPlan(null);
    }
  };

  const createBackup = async () => {
    try {
      const result = await offlineSyncService.createBackup();
      console.log('Backup created:', result);
      
      // Refresh backup list
      fetchData();
    } catch (error) {
      console.error('Backup creation failed:', error);
    }
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
            Disaster Recovery & Business Continuity
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'plans', label: 'Recovery Plans', icon: DocumentTextIcon },
              { key: 'executions', label: 'Execution History', icon: PlayIcon },
              { key: 'backups', label: 'Backup Status', icon: CloudArrowDownIcon },
              { key: 'testing', label: 'Testing Schedule', icon: ClockIcon }
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
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Recovery Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recovery Plans</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Create New Plan
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{plan.plan_name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{plan.plan_type.replace('_', ' ')}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(plan.priority_level)}`}>
                        {plan.priority_level}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">RTO</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {plan.recovery_time_objective_hours}h
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">RPO</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {plan.recovery_point_objective_hours}h
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">Recovery Steps ({plan.recovery_steps.length})</div>
                      <div className="space-y-1">
                        {plan.recovery_steps.slice(0, 3).map((step, index) => (
                          <div key={index} className="text-sm text-gray-700">
                            {index + 1}. {step}
                          </div>
                        ))}
                        {plan.recovery_steps.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{plan.recovery_steps.length - 3} more steps
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {plan.last_test_result === 'successful' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : plan.last_test_result === 'failed' ? (
                          <XCircleIcon className="w-5 h-5 text-red-500" />
                        ) : (
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {plan.last_tested ? 
                            `Last tested: ${new Date(plan.last_tested).toLocaleDateString()}` : 
                            'Never tested'
                          }
                        </span>
                      </div>
                      
                      <button
                        onClick={() => testRecoveryPlan(plan.id)}
                        disabled={testingPlan === plan.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                      >
                        {testingPlan === plan.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Testing...
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4 mr-1" />
                            Test Plan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution History Tab */}
          {activeTab === 'executions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Recovery Plan Executions</h3>
              
              {executions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No recovery plan executions recorded</p>
                  <p className="text-sm">This is good - it means no disasters have occurred!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {executions.map(execution => (
                    <div key={execution.id} className="bg-white border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {execution.incident_description}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Executed by {execution.executed_by}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Started</div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(execution.started_at).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="text-sm font-medium text-gray-900">
                            {execution.downtime_minutes ? `${execution.downtime_minutes} min` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Data Loss</div>
                          <div className="text-sm font-medium text-gray-900">
                            {execution.data_loss_hours ? `${execution.data_loss_hours}h` : 'None'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Steps Completed</div>
                          <div className="text-sm font-medium text-gray-900">
                            {execution.steps_completed.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Backup Status Tab */}
          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Backup Status</h3>
                <button
                  onClick={createBackup}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Create Backup Now
                </button>
              </div>

              <div className="grid gap-4">
                {backups.map(backup => (
                  <div key={backup.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(backup.status)}`}>
                        <CloudArrowDownIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {backup.backup_type} Backup
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(backup.started_at).toLocaleString()} • {formatFileSize(backup.file_size_bytes)} • {backup.backup_location.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testing Schedule Tab */}
          {activeTab === 'testing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Testing Schedule</h3>
              
              <div className="grid gap-4">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{plan.plan_name}</h4>
                        <p className="text-sm text-gray-600">
                          Next review: {new Date(plan.next_review_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {plan.last_test_result && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.last_test_result)}`}>
                            {plan.last_test_result}
                          </span>
                        )}
                        <button
                          onClick={() => testRecoveryPlan(plan.id)}
                          disabled={testingPlan === plan.id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                          {testingPlan === plan.id ? 'Testing...' : 'Run Test'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}