import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  ExclamationTriangleIcon, 
  TrendingUpIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ChartBarIcon,
  LightBulbIcon,
  GiftIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { FarmerRetentionService, FarmerEngagementScore, RetentionInsight, RetentionCampaign, RetentionOverview } from '@/lib/farmer-retention';

export default function FarmerRetentionDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'insights' | 'campaigns' | 'value'>('overview');
  const [overview, setOverview] = useState<RetentionOverview | null>(null);
  const [riskUsers, setRiskUsers] = useState<FarmerEngagementScore[]>([]);
  const [insights, setInsights] = useState<RetentionInsight[]>([]);
  const [campaigns, setCampaigns] = useState<RetentionCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCampaignModal, setNewCampaignModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, would call FarmerRetentionService
      const mockOverview: RetentionOverview = {
        total_farmers: 1247,
        at_risk_farmers: 87,
        average_engagement: 73,
        active_campaigns: 5,
        retention_rate: 93.2,
        churn_prevention_success: 78
      };

      const mockRiskUsers: FarmerEngagementScore[] = [
        {
          id: '1',
          user_id: 'user_1',
          tenant_id: 'tenant_1',
          overall_score: 35,
          component_scores: {
            login_frequency: 5,
            feature_usage: 8,
            data_quality: 12,
            support_interaction: 3,
            revenue_contribution: 4,
            social_engagement: 3
          },
          trend: 'declining',
          risk_level: 'critical',
          calculated_at: '2024-01-25T10:00:00Z',
          next_calculation: '2024-02-01T10:00:00Z'
        },
        {
          id: '2',
          user_id: 'user_2',
          tenant_id: 'tenant_1',
          overall_score: 52,
          component_scores: {
            login_frequency: 12,
            feature_usage: 10,
            data_quality: 15,
            support_interaction: 8,
            revenue_contribution: 5,
            social_engagement: 2
          },
          trend: 'declining',
          risk_level: 'high',
          calculated_at: '2024-01-25T10:00:00Z',
          next_calculation: '2024-02-01T10:00:00Z'
        }
      ];

      const mockInsights: RetentionInsight[] = [
        {
          id: '1',
          user_id: 'user_1',
          tenant_id: 'tenant_1',
          insight_type: 'churn_risk',
          severity: 'critical',
          title: 'Critical Churn Risk - John Smith Farm',
          description: 'Engagement score dropped 35% in the last month. No login in 14 days.',
          recommendations: [
            'Schedule immediate personal check-in call',
            'Review recent support tickets for unresolved issues',
            'Offer personalized platform walkthrough'
          ],
          data_points: {
            last_login: '14 days ago',
            score_drop: 35,
            feature_usage: 'minimal'
          },
          confidence_score: 0.92,
          detected_at: '2024-01-25T09:00:00Z',
          status: 'active'
        },
        {
          id: '2',
          user_id: 'user_3',
          tenant_id: 'tenant_1',
          insight_type: 'feature_adoption',
          severity: 'warning',
          title: 'Low Feature Adoption - Sarah Johnson',
          description: 'Using only 3 of 15 available features despite 90 days on platform.',
          recommendations: [
            'Send feature spotlight email series',
            'Schedule optional feature demo call',
            'Provide relevant use case examples'
          ],
          data_points: {
            features_used: 3,
            features_available: 15,
            days_on_platform: 90
          },
          confidence_score: 0.78,
          detected_at: '2024-01-25T08:30:00Z',
          status: 'active'
        }
      ];

      const mockCampaigns: RetentionCampaign[] = [
        {
          id: '1',
          tenant_id: 'tenant_1',
          name: 'At-Risk Farmer Recovery',
          campaign_type: 'reactivation',
          target_audience: {
            criteria: {
              risk_levels: ['high', 'critical'],
              last_login_days_ago: 7
            }
          },
          triggers: [{
            type: 'score_change',
            conditions: { risk_level: 'high' },
            frequency: 'daily'
          }],
          actions: [{
            type: 'email',
            template_id: 'reactivation_email'
          }, {
            type: 'phone_call',
            delay_hours: 24
          }],
          status: 'active',
          start_date: '2024-01-20T00:00:00Z',
          metrics: {
            total_targeted: 45,
            total_reached: 38,
            total_engaged: 22,
            total_converted: 8,
            conversion_rate: 17.8,
            engagement_rate: 57.9,
            retention_improvement: 12,
            revenue_impact: 0
          },
          created_by: 'manager_1',
          created_at: '2024-01-20T00:00:00Z'
        },
        {
          id: '2',
          tenant_id: 'tenant_1',
          name: 'New Farmer Onboarding',
          campaign_type: 'onboarding',
          target_audience: {
            criteria: {
              tenure_days_range: [0, 30]
            }
          },
          triggers: [{
            type: 'time_based',
            conditions: { days_after_signup: 1 },
            frequency: 'immediate'
          }],
          actions: [{
            type: 'email',
            template_id: 'welcome_series'
          }, {
            type: 'training_session',
            delay_hours: 72
          }],
          status: 'active',
          start_date: '2024-01-15T00:00:00Z',
          metrics: {
            total_targeted: 23,
            total_reached: 23,
            total_engaged: 19,
            total_converted: 15,
            conversion_rate: 65.2,
            engagement_rate: 82.6,
            retention_improvement: 25,
            revenue_impact: 0
          },
          created_by: 'manager_1',
          created_at: '2024-01-15T00:00:00Z'
        }
      ];

      setOverview(mockOverview);
      setRiskUsers(mockRiskUsers);
      setInsights(mockInsights);
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Failed to fetch retention data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUpIcon className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingUpIcon className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'onboarding': return <UsersIcon className="w-5 h-5" />;
      case 'reactivation': return <HeartIcon className="w-5 h-5" />;
      case 'education': return <LightBulbIcon className="w-5 h-5" />;
      case 'celebration': return <GiftIcon className="w-5 h-5" />;
      default: return <BellIcon className="w-5 h-5" />;
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
            <HeartIcon className="w-8 h-8 text-red-500 mr-3" />
            Farmer Retention & Engagement
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'engagement', label: 'Engagement Scores', icon: TrendingUpIcon },
              { key: 'insights', label: 'AI Insights', icon: LightBulbIcon },
              { key: 'campaigns', label: 'Retention Campaigns', icon: BellIcon },
              { key: 'value', label: 'Value Realization', icon: GiftIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
                {key === 'insights' && insights.filter(i => i.status === 'active').length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {insights.filter(i => i.status === 'active').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <HeartIcon className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-green-600">
                        {overview.retention_rate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-800">Retention Rate</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <TrendingUpIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {overview.average_engagement}
                      </div>
                      <div className="text-sm text-blue-800">Avg Engagement Score</div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-red-600">
                        {overview.at_risk_farmers}
                      </div>
                      <div className="text-sm text-red-800">At-Risk Farmers</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* At-Risk Farmers Quick View */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">High-Risk Farmers</h3>
                  <button
                    onClick={() => setActiveTab('engagement')}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {riskUsers.slice(0, 3).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(user.risk_level)}`}>
                            {user.risk_level}
                          </span>
                          {getTrendIcon(user.trend)}
                          <span className="text-sm text-gray-500">User {user.user_id}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Engagement Score: <span className="font-semibold">{user.overall_score}/100</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-red-600 hover:text-red-800">
                          <PhoneIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:text-blue-800">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign Performance Summary */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {campaigns.filter(c => c.status === 'active').slice(0, 3).map(campaign => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        {getCampaignTypeIcon(campaign.campaign_type)}
                        <h4 className="ml-2 font-medium text-gray-900">{campaign.name}</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Engagement Rate</span>
                          <span className="font-medium">{campaign.metrics.engagement_rate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Conversion Rate</span>
                          <span className="font-medium">{campaign.metrics.conversion_rate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Farmers Reached</span>
                          <span className="font-medium">{campaign.metrics.total_reached}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Engagement Scores Tab */}
          {activeTab === 'engagement' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Farmer Engagement Scores</h3>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="">All Risk Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Recalculate Scores
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {riskUsers.map(user => (
                  <div key={user.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <UsersIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">User {user.user_id}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(user.risk_level)}`}>
                              {user.risk_level} risk
                            </span>
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(user.trend)}
                              <span className="text-sm text-gray-500">{user.trend}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{user.overall_score}</div>
                        <div className="text-sm text-gray-500">/ 100</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(user.component_scores).map(([component, score]) => (
                        <div key={component} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{score}</div>
                          <div className="text-xs text-gray-600 capitalize">
                            {component.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Last updated: {new Date(user.calculated_at).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Contact
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">AI-Generated Retention Insights</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Generate New Insights
                </button>
              </div>

              {insights.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <LightBulbIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No active insights</p>
                  <p className="text-sm">All farmers are showing healthy engagement patterns!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map(insight => (
                    <div key={insight.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                              {insight.severity}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                              {insight.insight_type.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              {(insight.confidence_score * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h4>
                          <p className="text-gray-700 mb-4">{insight.description}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Recommended Actions:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600">{rec}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Detected: {new Date(insight.detected_at).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                            Take Action
                          </button>
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Retention Campaigns</h3>
                <button
                  onClick={() => setNewCampaignModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Create Campaign
                </button>
              </div>

              <div className="space-y-4">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getCampaignTypeIcon(campaign.campaign_type)}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="capitalize">{campaign.campaign_type}</span>
                            <span>•</span>
                            <span className={`capitalize ${campaign.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                          View Details
                        </button>
                        {campaign.status === 'active' && (
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            Edit
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-gray-900">{campaign.metrics.total_targeted}</div>
                        <div className="text-xs text-gray-600">Targeted</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{campaign.metrics.engagement_rate.toFixed(1)}%</div>
                        <div className="text-xs text-blue-800">Engagement</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">{campaign.metrics.conversion_rate.toFixed(1)}%</div>
                        <div className="text-xs text-green-800">Conversion</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">{campaign.metrics.retention_improvement}%</div>
                        <div className="text-xs text-purple-800">Retention ↑</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Started: {new Date(campaign.start_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Value Realization Tab */}
          {activeTab === 'value' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Value Realization</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Calculate Value
                </button>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <p className="text-gray-500">Value realization tracking interface would be implemented here.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$147K</div>
                    <div className="text-sm text-green-800">Average Cost Savings</div>
                    <div className="text-xs text-gray-600 mt-1">per farmer annually</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12.5%</div>
                    <div className="text-sm text-blue-800">Yield Improvement</div>
                    <div className="text-xs text-gray-600 mt-1">average across all crops</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <div className="text-sm text-purple-800">Value Attribution</div>
                    <div className="text-xs text-gray-600 mt-1">to platform usage</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Campaign Modal */}
      {newCampaignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Retention Campaign</h3>
              <form>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Spring Reactivation Drive"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Campaign Type</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="reactivation">Reactivation</option>
                      <option value="onboarding">Onboarding</option>
                      <option value="education">Education</option>
                      <option value="celebration">Celebration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="high_risk">High Risk Farmers</option>
                      <option value="new_users">New Users</option>
                      <option value="low_adoption">Low Feature Adoption</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Create Campaign
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCampaignModal(false)}
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