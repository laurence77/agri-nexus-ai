import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon,
  FireIcon,
  StarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BellIcon,
  ChartBarIcon,
  GiftIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { RewardsEngineService } from '@/lib/rewards-engine';
import { 
  UserPoints, 
  UserReward, 
  DailyStreak, 
  UserAchievement, 
  RewardsNotification,
  LeaderboardEntry
} from '@/types/rewards';

export default function RewardsIncentiveDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'streaks' | 'referrals' | 'achievements' | 'leaderboard' | 'redeem'>('overview');
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [recentRewards, setRecentRewards] = useState<UserReward[]>([]);
  const [activeStreaks, setActiveStreaks] = useState<DailyStreak[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [notifications, setNotifications] = useState<RewardsNotification[]>([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number>(0);
  const [nextLevelInfo, setNextLevelInfo] = useState<{ level: number; name: string; pointsNeeded: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - in real implementation, would call RewardsEngineService
      const mockData = {
        userPoints: {
          id: '1',
          user_id: 'user_1',
          tenant_id: 'tenant_1',
          total_points: 2850,
          available_points: 2450,
          lifetime_points: 3250,
          current_level: 3,
          next_level_points: 3500,
          last_updated: new Date().toISOString()
        },
        recentRewards: [
          {
            id: '1',
            user_id: 'user_1',
            tenant_id: 'tenant_1',
            reward_action_id: 'daily_login',
            points_earned: 15,
            earned_at: new Date().toISOString(),
            streak_count: 7,
            metadata: { streak_multiplier: 1.25, action_name: 'Daily Login' }
          },
          {
            id: '2',
            user_id: 'user_1',
            tenant_id: 'tenant_1',
            reward_action_id: 'crop_data_entry',
            points_earned: 25,
            earned_at: new Date(Date.now() - 86400000).toISOString(),
            metadata: { action_name: 'Crop Data Entry', field_name: 'North Field' }
          },
          {
            id: '3',
            user_id: 'user_1',
            tenant_id: 'tenant_1',
            reward_action_id: 'training_completion',
            points_earned: 150,
            earned_at: new Date(Date.now() - 172800000).toISOString(),
            metadata: { action_name: 'Training Completion', module_name: 'Sustainable Farming Practices', perfect_score: true }
          }
        ],
        activeStreaks: [
          {
            id: '1',
            user_id: 'user_1',
            tenant_id: 'tenant_1',
            streak_type: 'login' as const,
            current_streak: 7,
            longest_streak: 12,
            last_activity_date: new Date().toISOString().split('T')[0],
            streak_started_date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
            is_active: true,
            bonus_multiplier: 1.25
          },
          {
            id: '2',
            user_id: 'user_1',
            tenant_id: 'tenant_1',
            streak_type: 'data_entry' as const,
            current_streak: 4,
            longest_streak: 8,
            last_activity_date: new Date().toISOString().split('T')[0],
            streak_started_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
            is_active: true,
            bonus_multiplier: 1.0
          }
        ],
        achievements: [
          {
            id: '1',
            user_id: 'user_1',
            tenant_id: 'tenant_1',
            achievement_id: 'first_week_streak',
            earned_at: new Date(Date.now() - 86400000).toISOString(),
            progress_value: 7,
            is_completed: true,
            notification_sent: true
          }
        ],
        leaderboardPosition: 15,
        nextLevelInfo: {
          level: 4,
          name: 'Master Farmer',
          pointsNeeded: 650
        },
        unreadNotifications: 3
      };

      setUserPoints(mockData.userPoints);
      setRecentRewards(mockData.recentRewards);
      setActiveStreaks(mockData.activeStreaks);
      setAchievements(mockData.achievements);
      setLeaderboardPosition(mockData.leaderboardPosition);
      setNextLevelInfo(mockData.nextLevelInfo);

    } catch (error) {
      console.error('Failed to fetch rewards dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakIcon = (streakType: string) => {
    const icons = {
      login: CalendarDaysIcon,
      data_entry: '📊',
      training: AcademicCapIcon,
      social_engagement: '💬',
      feature_usage: '🔧'
    };
    return icons[streakType as keyof typeof icons] || FireIcon;
  };

  const getStreakColor = (streakCount: number) => {
    if (streakCount >= 30) return 'text-red-600 bg-red-100';
    if (streakCount >= 14) return 'text-orange-600 bg-orange-100';
    if (streakCount >= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diffHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
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
            <TrophyIcon className="w-8 h-8 text-yellow-500 mr-3" />
            Rewards & Incentives
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'streaks', label: 'Daily Streaks', icon: FireIcon },
              { key: 'referrals', label: 'Referrals', icon: UserGroupIcon },
              { key: 'achievements', label: 'Achievements', icon: StarIcon },
              { key: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon },
              { key: 'redeem', label: 'Redeem Rewards', icon: GiftIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === key
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
                {key === 'overview' && notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && userPoints && (
            <div className="space-y-6">
              {/* Points and Level Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <TrophyIcon className="w-10 h-10" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold">{userPoints.total_points.toLocaleString()}</div>
                      <div className="text-yellow-100">Total Points</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <StarIcon className="w-10 h-10" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold">Level {userPoints.current_level}</div>
                      <div className="text-blue-100">Current Level</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <FireIcon className="w-10 h-10" />
                    <div className="ml-4">
                      <div className="text-2xl font-bold">{activeStreaks.reduce((max, streak) => Math.max(max, streak.current_streak), 0)}</div>
                      <div className="text-green-100">Best Streak</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">#{leaderboardPosition}</div>
                    <div className="ml-4">
                      <div className="text-pink-100">Leaderboard</div>
                      <div className="text-pink-100">Position</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress to Next Level */}
              {nextLevelInfo && (
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Progress to {nextLevelInfo.name}</h3>
                    <span className="text-sm text-gray-600">{nextLevelInfo.pointsNeeded} points needed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, ((userPoints.total_points) / (userPoints.total_points + nextLevelInfo.pointsNeeded)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Rewards */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GiftIcon className="w-6 h-6 text-green-600 mr-2" />
                    Recent Rewards
                  </h3>
                  <div className="space-y-4">
                    {recentRewards.slice(0, 5).map(reward => (
                      <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{reward.metadata?.action_name}</div>
                          <div className="text-sm text-gray-600">
                            {formatTimeAgo(reward.earned_at)}
                            {reward.streak_count && ` • ${reward.streak_count} day streak`}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-green-600">+{reward.points_earned}</span>
                          {reward.metadata?.streak_multiplier && reward.metadata.streak_multiplier > 1 && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              {reward.metadata.streak_multiplier}x
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Streaks */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FireIcon className="w-6 h-6 text-orange-600 mr-2" />
                    Active Streaks
                  </h3>
                  <div className="space-y-4">
                    {activeStreaks.map(streak => {
                      const Icon = getStreakIcon(streak.streak_type);
                      return (
                        <div key={streak.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {typeof Icon === 'string' ? (
                              <span className="text-2xl">{Icon}</span>
                            ) : (
                              <Icon className="w-6 h-6 text-blue-600" />
                            )}
                            <div>
                              <div className="font-medium text-gray-900 capitalize">
                                {streak.streak_type.replace('_', ' ')} Streak
                              </div>
                              <div className="text-sm text-gray-600">
                                Best: {streak.longest_streak} days
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStreakColor(streak.current_streak)}`}>
                              {streak.current_streak} days
                            </div>
                            {streak.bonus_multiplier > 1 && (
                              <div className="text-xs text-orange-600 mt-1">
                                {streak.bonus_multiplier}x bonus!
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Streaks Tab */}
          {activeTab === 'streaks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Daily Streaks</h3>
                <div className="text-sm text-gray-600">
                  Keep your streaks alive to earn bonus multipliers!
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeStreaks.map(streak => {
                  const Icon = getStreakIcon(streak.streak_type);
                  const daysUntilNextBonus = streak.current_streak < 7 ? 7 - streak.current_streak :
                                           streak.current_streak < 14 ? 14 - streak.current_streak :
                                           streak.current_streak < 30 ? 30 - streak.current_streak : 0;
                  
                  return (
                    <div key={streak.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {typeof Icon === 'string' ? (
                            <span className="text-3xl">{Icon}</span>
                          ) : (
                            <Icon className="w-8 h-8 text-blue-600" />
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900 capitalize">
                              {streak.streak_type.replace('_', ' ')} Streak
                            </h4>
                            <p className="text-sm text-gray-600">
                              Started {new Date(streak.streak_started_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${getStreakColor(streak.current_streak)}`}>
                          {streak.current_streak}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Streak</span>
                          <span className="font-medium">{streak.current_streak} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Best Streak</span>
                          <span className="font-medium">{streak.longest_streak} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Bonus</span>
                          <span className="font-medium text-orange-600">{streak.bonus_multiplier}x</span>
                        </div>
                        {daysUntilNextBonus > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Next Bonus In</span>
                            <span className="font-medium text-blue-600">{daysUntilNextBonus} days</span>
                          </div>
                        )}
                      </div>

                      {/* Streak Timeline */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex space-x-1">
                          {Array.from({ length: 30 }, (_, i) => {
                            const dayOffset = i - 29;
                            const date = new Date();
                            date.setDate(date.getDate() + dayOffset);
                            const dateStr = date.toISOString().split('T')[0];
                            
                            const isActive = dayOffset <= 0 && 
                                           new Date(streak.streak_started_date) <= date && 
                                           date <= new Date(streak.last_activity_date);
                            const isToday = dayOffset === 0;
                            
                            return (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-sm ${
                                  isActive
                                    ? isToday
                                      ? 'bg-green-500'
                                      : 'bg-blue-500'
                                    : 'bg-gray-200'
                                }`}
                                title={date.toLocaleDateString()}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>30 days ago</span>
                          <span>Today</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Streak Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Streak Bonus System</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                    <span>7+ days: 1.25x points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-400 rounded"></div>
                    <span>14+ days: 1.5x points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span>30+ days: 2x points</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Refer & Earn</h3>
                    <p className="text-pink-100">Invite farmers to join and earn 500 points for each successful referral!</p>
                  </div>
                  <UserGroupIcon className="w-16 h-16 opacity-50" />
                </div>
              </div>

              {/* Referral Code */}
              <div className="bg-white border rounded-lg p-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Referral Code</h4>
                  <div className="inline-flex items-center bg-gray-100 rounded-lg px-6 py-3">
                    <code className="text-2xl font-bold text-blue-600">FARM247</code>
                    <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                      Copy Code
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Share this code with other farmers to earn rewards!</p>
                </div>
              </div>

              {/* Referral Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-gray-600">Total Referrals</div>
                </div>
                <div className="bg-white border rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">6</div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="bg-white border rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">3,000</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
              </div>

              {/* Referral History */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Referrals</h4>
                <div className="space-y-4">
                  {[
                    { name: 'John Doe', status: 'completed', date: '2024-01-25', points: 500 },
                    { name: 'Mary Smith', status: 'pending', date: '2024-01-23', points: 0 },
                    { name: 'Peter Johnson', status: 'completed', date: '2024-01-20', points: 500 }
                  ].map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserGroupIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{referral.name}</div>
                          <div className="text-sm text-gray-600">Referred on {referral.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          referral.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status}
                        </span>
                        <span className="font-bold text-green-600">+{referral.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs would be implemented similarly... */}
          {activeTab === 'achievements' && (
            <div className="text-center py-12">
              <StarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Achievements system coming soon!</p>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="text-center py-12">
              <TrophyIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Leaderboard feature coming soon!</p>
            </div>
          )}

          {activeTab === 'redeem' && (
            <div className="text-center py-12">
              <GiftIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Reward redemption system coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}