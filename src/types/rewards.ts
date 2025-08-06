export interface RewardAction {
  id: string;
  name: string;
  description: string;
  category: 'daily' | 'referral' | 'training' | 'milestone' | 'social' | 'achievement';
  points_value: number;
  max_daily_points?: number;
  cooldown_hours?: number;
  requirements?: string[];
  icon: string;
  color: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  tenant_id: string;
  reward_action_id: string;
  points_earned: number;
  earned_at: string;
  metadata?: Record<string, any>;
  streak_count?: number;
  referral_id?: string;
  training_module_id?: string;
}

export interface UserPoints {
  id: string;
  user_id: string;
  tenant_id: string;
  total_points: number;
  available_points: number;
  lifetime_points: number;
  current_level: number;
  next_level_points: number;
  last_updated: string;
}

export interface DailyStreak {
  id: string;
  user_id: string;
  tenant_id: string;
  streak_type: 'login' | 'data_entry' | 'training' | 'social_engagement' | 'feature_usage';
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_started_date: string;
  is_active: boolean;
  bonus_multiplier: number;
}

export interface ReferralProgram {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  referrer_reward_points: number;
  referee_reward_points: number;
  bonus_tiers: ReferralTier[];
  status: 'active' | 'inactive' | 'draft';
  start_date: string;
  end_date?: string;
  terms_conditions: string;
}

export interface ReferralTier {
  tier_name: string;
  referrals_required: number;
  bonus_points: number;
  bonus_rewards?: string[];
}

export interface UserReferral {
  id: string;
  referrer_user_id: string;
  referee_user_id: string;
  tenant_id: string;
  program_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'credited';
  referrer_points_earned: number;
  referee_points_earned: number;
  referred_at: string;
  completed_at?: string;
  credited_at?: string;
}

export interface TrainingReward {
  id: string;
  training_module_id: string;
  tenant_id: string;
  completion_points: number;
  perfect_score_bonus?: number;
  first_time_bonus?: number;
  time_limit_bonus?: number;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface UserTrainingProgress {
  id: string;
  user_id: string;
  tenant_id: string;
  training_module_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'certified';
  progress_percentage: number;
  score?: number;
  completion_time_minutes?: number;
  attempts: number;
  points_earned: number;
  started_at?: string;
  completed_at?: string;
  certificate_issued?: boolean;
}

export interface RewardLevel {
  level: number;
  name: string;
  points_required: number;
  benefits: string[];
  badge_icon: string;
  badge_color: string;
  unlock_features?: string[];
}

export interface PointTransaction {
  id: string;
  user_id: string;
  tenant_id: string;
  transaction_type: 'earned' | 'redeemed' | 'bonus' | 'penalty' | 'transfer';
  points_amount: number;
  balance_after: number;
  description: string;
  category: string;
  metadata?: Record<string, any>;
  created_at: string;
  related_id?: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  tenant_id: string;
  reward_item_id: string;
  points_cost: number;
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
  requested_at: string;
  approved_at?: string;
  fulfilled_at?: string;
  fulfillment_notes?: string;
  approved_by?: string;
}

export interface RewardItem {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  points_cost: number;
  category: 'digital' | 'physical' | 'service' | 'discount' | 'feature_unlock';
  item_type: string;
  image_url?: string;
  availability_count?: number;
  is_active: boolean;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  total_points: number;
  current_level: number;
  level_name: string;
  rank: number;
  badge_icon: string;
  streak_count?: number;
  recent_achievements: string[];
}

export interface Leaderboard {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  leaderboard_type: 'points' | 'streaks' | 'referrals' | 'training' | 'custom';
  time_period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'all_time';
  entries: LeaderboardEntry[];
  last_updated: string;
  is_public: boolean;
}

export interface Achievement {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  category: string;
  achievement_type: 'one_time' | 'repeatable' | 'progressive';
  requirements: AchievementRequirement[];
  reward_points: number;
  badge_icon: string;
  badge_color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_secret: boolean;
  created_at: string;
}

export interface AchievementRequirement {
  requirement_type: 'points_total' | 'streak_count' | 'referrals_count' | 'training_completed' | 'feature_usage' | 'custom';
  target_value: number;
  time_period?: string;
  specific_criteria?: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  tenant_id: string;
  achievement_id: string;
  earned_at: string;
  progress_value: number;
  is_completed: boolean;
  notification_sent: boolean;
}

export interface RewardsNotification {
  id: string;
  user_id: string;
  tenant_id: string;
  notification_type: 'points_earned' | 'level_up' | 'streak_milestone' | 'achievement_unlocked' | 'referral_success' | 'reward_available';
  title: string;
  message: string;
  points_amount?: number;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

export interface RewardsSettings {
  id: string;
  tenant_id: string;
  is_enabled: boolean;
  point_exchange_rate: number; // Points per dollar/currency unit
  max_daily_points: number;
  level_progression_formula: 'linear' | 'exponential' | 'custom';
  streak_bonus_multiplier: number;
  referral_enabled: boolean;
  leaderboard_enabled: boolean;
  notification_preferences: {
    points_earned: boolean;
    level_up: boolean;
    achievements: boolean;
    streaks: boolean;
    referrals: boolean;
  };
  custom_reward_actions: RewardAction[];
  branding: {
    points_name: string; // e.g., "AgriPoints", "Farm Coins"
    primary_color: string;
    secondary_color: string;
  };
}

export interface RewardsAnalytics {
  tenant_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  total_points_distributed: number;
  total_points_redeemed: number;
  active_users_with_rewards: number;
  top_reward_actions: Array<{
    action_id: string;
    action_name: string;
    usage_count: number;
    points_distributed: number;
  }>;
  engagement_metrics: {
    daily_active_users: number;
    streak_participation_rate: number;
    referral_success_rate: number;
    training_completion_rate: number;
  };
  level_distribution: Record<string, number>;
  last_calculated: string;
}