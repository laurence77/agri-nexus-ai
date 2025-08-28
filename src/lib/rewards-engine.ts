import { supabase } from '@/lib/supabase';
import { SecurityService } from '@/lib/security';
import { 
  RewardAction, 
  UserReward, 
  UserPoints, 
  DailyStreak, 
  ReferralProgram, 
  UserReferral, 
  TrainingReward, 
  UserTrainingProgress,
  PointTransaction,
  RewardLevel,
  Achievement,
  UserAchievement,
  RewardsNotification,
  RewardsSettings,
  Leaderboard,
  LeaderboardEntry
} from '@/types/rewards';

export class RewardsEngineService {
  private static supabase = supabase;

  // Default reward actions for the agricultural platform
  private static defaultRewardActions: RewardAction[] = [
    {
      id: 'daily_login',
      name: 'Daily Login',
      description: 'Log into the platform daily',
      category: 'daily',
      points_value: 10,
      max_daily_points: 10,
      cooldown_hours: 20,
      requirements: [],
      icon: '🌅',
      color: '#10B981'
    },
    {
      id: 'crop_data_entry',
      name: 'Crop Data Entry',
      description: 'Enter crop planting or harvest data',
      category: 'daily',
      points_value: 25,
      max_daily_points: 100,
      cooldown_hours: 1,
      requirements: ['field_selected', 'crop_type_specified'],
      icon: '🌱',
      color: '#059669'
    },
    {
      id: 'weather_check',
      name: 'Weather Monitoring',
      description: 'Check weather conditions for your location',
      category: 'daily',
      points_value: 5,
      max_daily_points: 15,
      cooldown_hours: 4,
      requirements: [],
      icon: '🌤️',
      color: '#0EA5E9'
    },
    {
      id: 'financial_record',
      name: 'Financial Tracking',
      description: 'Add income or expense records',
      category: 'daily',
      points_value: 20,
      max_daily_points: 60,
      cooldown_hours: 2,
      requirements: ['amount_specified', 'category_selected'],
      icon: '💰',
      color: '#F59E0B'
    },
    {
      id: 'training_completion',
      name: 'Training Module Completed',
      description: 'Complete an agricultural training module',
      category: 'training',
      points_value: 100,
      requirements: ['module_completed', 'min_score_70'],
      icon: '🎓',
      color: '#8B5CF6'
    },
    {
      id: 'perfect_training_score',
      name: 'Perfect Training Score',
      description: 'Achieve 100% on a training module',
      category: 'training',
      points_value: 50,
      requirements: ['score_100_percent'],
      icon: '⭐',
      color: '#F59E0B'
    },
    {
      id: 'successful_referral',
      name: 'Successful Referral',
      description: 'Successfully refer a new farmer who completes onboarding',
      category: 'referral',
      points_value: 500,
      requirements: ['referee_onboarded', 'referee_active_30_days'],
      icon: '👥',
      color: '#EC4899'
    },
    {
      id: 'social_post',
      name: 'Community Contribution',
      description: 'Share knowledge or experience in the community',
      category: 'social',
      points_value: 30,
      max_daily_points: 90,
      cooldown_hours: 6,
      requirements: ['min_characters_50'],
      icon: '📝',
      color: '#6366F1'
    },
    {
      id: 'help_another_farmer',
      name: 'Help Another Farmer',
      description: 'Provide helpful advice or answer questions',
      category: 'social',
      points_value: 40,
      max_daily_points: 120,
      cooldown_hours: 2,
      requirements: ['response_marked_helpful'],
      icon: '🤝',
      color: '#10B981'
    },
    {
      id: 'yield_milestone',
      name: 'Yield Improvement Milestone',
      description: 'Achieve significant yield improvements',
      category: 'milestone',
      points_value: 1000,
      requirements: ['yield_improvement_15_percent'],
      icon: '🏆',
      color: '#DC2626'
    }
  ];

  // Default reward levels
  private static defaultLevels: RewardLevel[] = [
    { level: 1, name: 'Seedling Farmer', points_required: 0, benefits: ['Basic features'], badge_icon: '🌱', badge_color: '#10B981' },
    { level: 2, name: 'Growing Farmer', points_required: 500, benefits: ['Weather alerts'], badge_icon: '🌿', badge_color: '#059669' },
    { level: 3, name: 'Experienced Farmer', points_required: 1500, benefits: ['Advanced analytics'], badge_icon: '🌾', badge_color: '#0EA5E9' },
    { level: 4, name: 'Master Farmer', points_required: 3500, benefits: ['Premium support'], badge_icon: '👨‍🌾', badge_color: '#F59E0B' },
    { level: 5, name: 'Agricultural Expert', points_required: 7500, benefits: ['Community leadership'], badge_icon: '🏆', badge_color: '#8B5CF6' },
    { level: 6, name: 'Farm Innovator', points_required: 15000, benefits: ['Beta features'], badge_icon: '💡', badge_color: '#EC4899' },
    { level: 7, name: 'Agricultural Pioneer', points_required: 30000, benefits: ['Direct consultation'], badge_icon: '🚀', badge_color: '#DC2626' }
  ];

  /**
   * Award points to a user for completing an action
   */
  static async awardPoints(
    userId: string,
    tenantId: string,
    actionId: string,
    metadata?: Record<string, any>
  ): Promise<UserReward | null> {
    try {
      // Get reward action details
      const rewardAction = this.defaultRewardActions.find(action => action.id === actionId);
      if (!rewardAction) {
        throw new Error(`Reward action ${actionId} not found`);
      }

      // Check cooldown and daily limits
      const canAward = await this.checkAwardEligibility(userId, tenantId, actionId);
      if (!canAward.eligible) {
        console.log(`Award not eligible: ${canAward.reason}`);
        return null;
      }

      // Calculate points with streak bonuses
      let pointsToAward = rewardAction.points_value;
      const streakBonus = await this.calculateStreakBonus(userId, tenantId, actionId);
      pointsToAward = Math.round(pointsToAward * streakBonus.multiplier);

      // Create reward record
      const userReward: UserReward = {
        id: `reward_${Date.now()}_${userId}`,
        user_id: userId,
        tenant_id: tenantId,
        reward_action_id: actionId,
        points_earned: pointsToAward,
        earned_at: new Date().toISOString(),
        metadata: {
          ...metadata,
          streak_multiplier: streakBonus.multiplier,
          streak_count: streakBonus.streak_count,
          original_points: rewardAction.points_value
        },
        streak_count: streakBonus.streak_count
      };

      // Store reward
      await this.supabase
        .from('user_rewards')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          reward_action_id: actionId,
          points_earned: pointsToAward,
          earned_at: userReward.earned_at,
          metadata: userReward.metadata,
          streak_count: streakBonus.streak_count
        });

      // Update user points
      await this.updateUserPoints(userId, tenantId, pointsToAward);

      // Create points transaction
      await this.createPointsTransaction(userId, tenantId, {
        transaction_type: 'earned',
        points_amount: pointsToAward,
        description: `Earned points for: ${rewardAction.name}`,
        category: rewardAction.category,
        metadata: userReward.metadata,
        related_id: userReward.id
      });

      // Update daily streak if applicable
      if (rewardAction.category === 'daily') {
        await this.updateDailyStreak(userId, tenantId, actionId);
      }

      // Check for achievements
      await this.checkAchievements(userId, tenantId);

      // Check for level ups
      await this.checkLevelUp(userId, tenantId);

      // Send notification
      await this.sendRewardNotification(userId, tenantId, {
        notification_type: 'points_earned',
        title: 'Points Earned!',
        message: `You earned ${pointsToAward} points for ${rewardAction.name}${streakBonus.multiplier > 1 ? ` (${streakBonus.multiplier}x streak bonus!)` : ''}`,
        points_amount: pointsToAward,
        metadata: { action_name: rewardAction.name, streak_bonus: streakBonus.multiplier > 1 }
      });

      // Log activity
      await SecurityService.logUserActivity({
        userId,
        tenantId,
        action: 'reward_points_earned',
        resourceType: 'reward_action',
        resourceId: actionId,
        success: true,
        metadata: {
          points_earned: pointsToAward,
          action_name: rewardAction.name,
          streak_multiplier: streakBonus.multiplier
        }
      });

      return userReward;

    } catch (error) {
      console.error('Points award failed:', error);
      throw error;
    }
  }

  /**
   * Process referral and award points
   */
  static async processReferral(
    referrerUserId: string,
    refereeUserId: string,
    tenantId: string,
    programId: string
  ): Promise<UserReferral> {
    try {
      // Get referral program details
      const { data: program } = await this.supabase
        .from('referral_programs')
        .select('*')
        .eq('id', programId)
        .eq('tenant_id', tenantId)
        .single();

      if (!program || program.status !== 'active') {
        throw new Error('Referral program not found or inactive');
      }

      // Generate referral code
      const referralCode = this.generateReferralCode(referrerUserId);

      // Create referral record
      const userReferral: UserReferral = {
        id: `referral_${Date.now()}`,
        referrer_user_id: referrerUserId,
        referee_user_id: refereeUserId,
        tenant_id: tenantId,
        program_id: programId,
        referral_code: referralCode,
        status: 'pending',
        referrer_points_earned: 0,
        referee_points_earned: 0,
        referred_at: new Date().toISOString()
      };

      await this.supabase
        .from('user_referrals')
        .insert({
          referrer_user_id: referrerUserId,
          referee_user_id: refereeUserId,
          tenant_id: tenantId,
          program_id: programId,
          referral_code: referralCode,
          status: 'pending',
          referred_at: userReferral.referred_at
        });

      // Award initial referee points (welcome bonus)
      if (program.referee_reward_points > 0) {
        await this.updateUserPoints(refereeUserId, tenantId, program.referee_reward_points);
        await this.createPointsTransaction(refereeUserId, tenantId, {
          transaction_type: 'bonus',
          points_amount: program.referee_reward_points,
          description: 'Referral welcome bonus',
          category: 'referral',
          related_id: userReferral.id
        });

        userReferral.referee_points_earned = program.referee_reward_points;
      }

      return userReferral;

    } catch (error) {
      console.error('Referral processing failed:', error);
      throw error;
    }
  }

  /**
   * Complete referral after referee onboarding
   */
  static async completeReferral(referralId: string): Promise<void> {
    try {
      const { data: referral } = await this.supabase
        .from('user_referrals')
        .select('*, referral_programs(*)')
        .eq('id', referralId)
        .single();

      if (!referral || referral.status !== 'pending') {
        throw new Error('Referral not found or already processed');
      }

      const program = referral.referral_programs;

      // Award referrer points
      await this.updateUserPoints(referral.referrer_user_id, referral.tenant_id, program.referrer_reward_points);
      await this.createPointsTransaction(referral.referrer_user_id, referral.tenant_id, {
        transaction_type: 'earned',
        points_amount: program.referrer_reward_points,
        description: 'Successful referral reward',
        category: 'referral',
        related_id: referralId
      });

      // Update referral status
      await this.supabase
        .from('user_referrals')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          referrer_points_earned: program.referrer_reward_points
        })
        .eq('id', referralId);

      // Check for referral tier bonuses
      await this.checkReferralTierBonuses(referral.referrer_user_id, referral.tenant_id, program.id);

      // Send notification to referrer
      await this.sendRewardNotification(referral.referrer_user_id, referral.tenant_id, {
        notification_type: 'referral_success',
        title: 'Referral Successful!',
        message: `You earned ${program.referrer_reward_points} points for successfully referring a new farmer!`,
        points_amount: program.referrer_reward_points,
        metadata: { referral_id: referralId }
      });

    } catch (error) {
      console.error('Referral completion failed:', error);
      throw error;
    }
  }

  /**
   * Process training completion and award points
   */
  static async processTrainingCompletion(
    userId: string,
    tenantId: string,
    trainingModuleId: string,
    score: number,
    completionTimeMinutes: number
  ): Promise<UserTrainingProgress> {
    try {
      // Get training reward configuration
      const { data: trainingReward } = await this.supabase
        .from('training_rewards')
        .select('*')
        .eq('training_module_id', trainingModuleId)
        .eq('tenant_id', tenantId)
        .single();

      if (!trainingReward) {
        throw new Error('Training reward configuration not found');
      }

      // Calculate points based on performance
      let pointsEarned = trainingReward.completion_points;
      
      // Perfect score bonus
      if (score === 100 && trainingReward.perfect_score_bonus) {
        pointsEarned += trainingReward.perfect_score_bonus;
        await this.awardPoints(userId, tenantId, 'perfect_training_score', {
          training_module_id: trainingModuleId,
          score: score
        });
      }

      // First time completion bonus
      const { data: previousAttempts } = await this.supabase
        .from('user_training_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('training_module_id', trainingModuleId)
        .eq('status', 'completed');

      if ((!previousAttempts || previousAttempts.length === 0) && trainingReward.first_time_bonus) {
        pointsEarned += trainingReward.first_time_bonus;
      }

      // Time completion bonus
      if (trainingReward.time_limit_bonus && completionTimeMinutes <= 30) {
        pointsEarned += trainingReward.time_limit_bonus;
      }

      // Update training progress
      const trainingProgress: UserTrainingProgress = {
        id: `training_${userId}_${trainingModuleId}_${Date.now()}`,
        user_id: userId,
        tenant_id: tenantId,
        training_module_id: trainingModuleId,
        status: score >= 70 ? 'completed' : 'in_progress',
        progress_percentage: 100,
        score,
        completion_time_minutes: completionTimeMinutes,
        attempts: (previousAttempts?.length || 0) + 1,
        points_earned: pointsEarned,
        completed_at: new Date().toISOString()
      };

      await this.supabase
        .from('user_training_progress')
        .upsert({
          user_id: userId,
          tenant_id: tenantId,
          training_module_id: trainingModuleId,
          status: trainingProgress.status,
          progress_percentage: 100,
          score,
          completion_time_minutes: completionTimeMinutes,
          attempts: trainingProgress.attempts,
          points_earned: pointsEarned,
          completed_at: trainingProgress.completed_at
        }, { onConflict: 'user_id,tenant_id,training_module_id' });

      // Award completion points
      if (score >= 70) {
        await this.awardPoints(userId, tenantId, 'training_completion', {
          training_module_id: trainingModuleId,
          score,
          completion_time: completionTimeMinutes,
          points_breakdown: {
            base: trainingReward.completion_points,
            perfect_bonus: score === 100 ? trainingReward.perfect_score_bonus : 0,
            first_time_bonus: (!previousAttempts || previousAttempts.length === 0) ? trainingReward.first_time_bonus : 0,
            time_bonus: completionTimeMinutes <= 30 ? trainingReward.time_limit_bonus : 0
          }
        });
      }

      return trainingProgress;

    } catch (error) {
      console.error('Training completion processing failed:', error);
      throw error;
    }
  }

  /**
   * Update daily streak for a user
   */
  static async updateDailyStreak(
    userId: string,
    tenantId: string,
    streakType: string
  ): Promise<DailyStreak> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get current streak
      const { data: currentStreak } = await this.supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('streak_type', streakType)
        .single();

      let updatedStreak: DailyStreak;

      if (!currentStreak) {
        // Create new streak
        updatedStreak = {
          id: `streak_${userId}_${streakType}_${Date.now()}`,
          user_id: userId,
          tenant_id: tenantId,
          streak_type: streakType as any,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          streak_started_date: today,
          is_active: true,
          bonus_multiplier: 1.0
        };
      } else {
        const lastActivityDate = new Date(currentStreak.last_activity_date);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          // Already logged today
          return currentStreak;
        } else if (daysDiff === 1) {
          // Consecutive day - extend streak
          updatedStreak = {
            ...currentStreak,
            current_streak: currentStreak.current_streak + 1,
            longest_streak: Math.max(currentStreak.longest_streak, currentStreak.current_streak + 1),
            last_activity_date: today,
            bonus_multiplier: this.calculateStreakMultiplier(currentStreak.current_streak + 1)
          };
        } else {
          // Streak broken - reset
          updatedStreak = {
            ...currentStreak,
            current_streak: 1,
            last_activity_date: today,
            streak_started_date: today,
            is_active: true,
            bonus_multiplier: 1.0
          };
        }
      }

      // Save updated streak
      await this.supabase
        .from('daily_streaks')
        .upsert({
          user_id: userId,
          tenant_id: tenantId,
          streak_type: streakType,
          current_streak: updatedStreak.current_streak,
          longest_streak: updatedStreak.longest_streak,
          last_activity_date: updatedStreak.last_activity_date,
          streak_started_date: updatedStreak.streak_started_date,
          is_active: updatedStreak.is_active,
          bonus_multiplier: updatedStreak.bonus_multiplier
        }, { onConflict: 'user_id,tenant_id,streak_type' });

      // Check for streak milestones
      if (updatedStreak.current_streak > 0 && updatedStreak.current_streak % 7 === 0) {
        await this.sendRewardNotification(userId, tenantId, {
          notification_type: 'streak_milestone',
          title: `${updatedStreak.current_streak} Day Streak!`,
          message: `Amazing! You've maintained a ${updatedStreak.current_streak}-day ${streakType.replace('_', ' ')} streak!`,
          metadata: { 
            streak_type: streakType, 
            streak_count: updatedStreak.current_streak,
            multiplier: updatedStreak.bonus_multiplier
          }
        });
      }

      return updatedStreak;

    } catch (error) {
      console.error('Daily streak update failed:', error);
      throw error;
    }
  }

  /**
   * Get user's rewards dashboard data
   */
  static async getUserRewardsDashboard(userId: string, tenantId: string): Promise<{
    userPoints: UserPoints;
    recentRewards: UserReward[];
    activeStreaks: DailyStreak[];
    achievements: UserAchievement[];
    leaderboardPosition: number;
    nextLevelInfo: { level: number; name: string; pointsNeeded: number };
    unreadNotifications: number;
  }> {
    try {
      // Get user points
      const { data: userPoints } = await this.supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .single();

      // Get recent rewards
      const { data: recentRewards } = await this.supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .order('earned_at', { ascending: false })
        .limit(10);

      // Get active streaks
      const { data: activeStreaks } = await this.supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      // Get achievements
      const { data: achievements } = await this.supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('is_completed', true)
        .order('earned_at', { ascending: false });

      // Calculate leaderboard position
      const { data: leaderboardData } = await this.supabase
        .from('user_points')
        .select('user_id, total_points')
        .eq('tenant_id', tenantId)
        .order('total_points', { ascending: false });

      const leaderboardPosition = leaderboardData?.findIndex(entry => entry.user_id === userId) + 1 || 0;

      // Get next level info
      const currentLevel = userPoints?.current_level || 1;
      const nextLevel = this.defaultLevels.find(level => level.level > currentLevel);
      const nextLevelInfo = nextLevel ? {
        level: nextLevel.level,
        name: nextLevel.name,
        pointsNeeded: nextLevel.points_required - (userPoints?.total_points || 0)
      } : {
        level: currentLevel,
        name: 'Max Level',
        pointsNeeded: 0
      };

      // Get unread notifications count
      const { count: unreadNotifications } = await this.supabase
        .from('rewards_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('is_read', false);

      return {
        userPoints: userPoints || this.createDefaultUserPoints(userId, tenantId),
        recentRewards: recentRewards || [],
        activeStreaks: activeStreaks || [],
        achievements: achievements || [],
        leaderboardPosition,
        nextLevelInfo,
        unreadNotifications: unreadNotifications || 0
      };

    } catch (error) {
      console.error('Dashboard data fetch failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private static async checkAwardEligibility(
    userId: string,
    tenantId: string,
    actionId: string
  ): Promise<{ eligible: boolean; reason?: string }> {
    const rewardAction = this.defaultRewardActions.find(action => action.id === actionId);
    if (!rewardAction) {
      return { eligible: false, reason: 'Action not found' };
    }

    // Check cooldown
    if (rewardAction.cooldown_hours) {
      const cooldownTime = new Date(Date.now() - rewardAction.cooldown_hours * 60 * 60 * 1000);
      const { data: recentReward } = await this.supabase
        .from('user_rewards')
        .select('earned_at')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('reward_action_id', actionId)
        .gte('earned_at', cooldownTime.toISOString())
        .order('earned_at', { ascending: false })
        .limit(1);

      if (recentReward && recentReward.length > 0) {
        return { eligible: false, reason: 'Cooldown period active' };
      }
    }

    // Check daily limits
    if (rewardAction.max_daily_points) {
      const today = new Date().toISOString().split('T')[0];
      const { data: todayRewards } = await this.supabase
        .from('user_rewards')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('reward_action_id', actionId)
        .gte('earned_at', `${today}T00:00:00Z`)
        .lt('earned_at', `${today}T23:59:59Z`);

      const todayPoints = todayRewards?.reduce((sum, reward) => sum + reward.points_earned, 0) || 0;
      if (todayPoints >= rewardAction.max_daily_points) {
        return { eligible: false, reason: 'Daily limit reached' };
      }
    }

    return { eligible: true };
  }

  private static async calculateStreakBonus(
    userId: string,
    tenantId: string,
    actionId: string
  ): Promise<{ multiplier: number; streak_count: number }> {
    const streakType = this.mapActionToStreakType(actionId);
    if (!streakType) {
      return { multiplier: 1.0, streak_count: 0 };
    }

    const { data: streak } = await this.supabase
      .from('daily_streaks')
      .select('current_streak, bonus_multiplier')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('streak_type', streakType)
      .eq('is_active', true)
      .single();

    if (!streak) {
      return { multiplier: 1.0, streak_count: 0 };
    }

    return {
      multiplier: streak.bonus_multiplier || 1.0,
      streak_count: streak.current_streak
    };
  }

  private static calculateStreakMultiplier(streakCount: number): number {
    if (streakCount >= 30) return 2.0;      // 30+ days: 2x multiplier
    if (streakCount >= 14) return 1.5;      // 14+ days: 1.5x multiplier
    if (streakCount >= 7) return 1.25;      // 7+ days: 1.25x multiplier
    return 1.0;                             // < 7 days: no bonus
  }

  private static mapActionToStreakType(actionId: string): string | null {
    const mapping: Record<string, string> = {
      'daily_login': 'login',
      'crop_data_entry': 'data_entry',
      'training_completion': 'training',
      'social_post': 'social_engagement',
      'weather_check': 'feature_usage'
    };
    return mapping[actionId] || null;
  }

  private static generateReferralCode(userId: string): string {
    const timestamp = Date.now().toString();
    const userPart = userId.substring(0, 6);
    return `${userPart.toUpperCase()}${timestamp.slice(-6)}`;
  }

  private static async updateUserPoints(
    userId: string,
    tenantId: string,
    pointsToAdd: number
  ): Promise<void> {
    const { data: currentPoints } = await this.supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (!currentPoints) {
      // Create new user points record
      const newLevel = this.calculateLevel(pointsToAdd);
      await this.supabase
        .from('user_points')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          total_points: pointsToAdd,
          available_points: pointsToAdd,
          lifetime_points: pointsToAdd,
          current_level: newLevel.level,
          next_level_points: newLevel.nextLevelPoints,
          last_updated: new Date().toISOString()
        });
    } else {
      // Update existing points
      const newTotalPoints = currentPoints.total_points + pointsToAdd;
      const newLevel = this.calculateLevel(newTotalPoints);
      
      await this.supabase
        .from('user_points')
        .update({
          total_points: newTotalPoints,
          available_points: currentPoints.available_points + pointsToAdd,
          lifetime_points: currentPoints.lifetime_points + pointsToAdd,
          current_level: newLevel.level,
          next_level_points: newLevel.nextLevelPoints,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);
    }
  }

  private static calculateLevel(totalPoints: number): { level: number; nextLevelPoints: number } {
    const level = this.defaultLevels
      .slice()
      .reverse()
      .find(l => totalPoints >= l.points_required);
    
    const currentLevel = level || this.defaultLevels[0];
    const nextLevel = this.defaultLevels.find(l => l.level > currentLevel.level);
    
    return {
      level: currentLevel.level,
      nextLevelPoints: nextLevel ? nextLevel.points_required : 0
    };
  }

  private static async createPointsTransaction(
    userId: string,
    tenantId: string,
    transaction: Omit<PointTransaction, 'id' | 'user_id' | 'tenant_id' | 'balance_after' | 'created_at'>
  ): Promise<void> {
    // Get current balance
    const { data: userPoints } = await this.supabase
      .from('user_points')
      .select('available_points')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    const balanceAfter = (userPoints?.available_points || 0) + 
      (transaction.transaction_type === 'earned' || transaction.transaction_type === 'bonus' 
        ? transaction.points_amount 
        : -transaction.points_amount);

    await this.supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        transaction_type: transaction.transaction_type,
        points_amount: transaction.points_amount,
        balance_after: balanceAfter,
        description: transaction.description,
        category: transaction.category,
        metadata: transaction.metadata,
        related_id: transaction.related_id,
        created_at: new Date().toISOString()
      });
  }

  private static async checkLevelUp(userId: string, tenantId: string): Promise<void> {
    const { data: userPoints } = await this.supabase
      .from('user_points')
      .select('current_level, total_points')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (!userPoints) return;

    const newLevel = this.calculateLevel(userPoints.total_points);
    if (newLevel.level > userPoints.current_level) {
      const levelInfo = this.defaultLevels.find(l => l.level === newLevel.level);
      if (levelInfo) {
        await this.sendRewardNotification(userId, tenantId, {
          notification_type: 'level_up',
          title: 'Level Up!',
          message: `Congratulations! You've reached ${levelInfo.name} (Level ${levelInfo.level})`,
          metadata: {
            old_level: userPoints.current_level,
            new_level: newLevel.level,
            level_name: levelInfo.name,
            benefits: levelInfo.benefits
          }
        });
      }
    }
  }

  private static async checkAchievements(userId: string, tenantId: string): Promise<void> {
    // This would implement achievement checking logic
    // For brevity, implementing a simplified version
    console.log('Checking achievements for user:', userId);
  }

  private static async checkReferralTierBonuses(
    userId: string,
    tenantId: string,
    programId: string
  ): Promise<void> {
    // This would check for referral tier bonuses
    console.log('Checking referral tier bonuses for user:', userId);
  }

  private static async sendRewardNotification(
    userId: string,
    tenantId: string,
    notification: Omit<RewardsNotification, 'id' | 'user_id' | 'tenant_id' | 'is_read' | 'created_at'>
  ): Promise<void> {
    await this.supabase
      .from('rewards_notifications')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        notification_type: notification.notification_type,
        title: notification.title,
        message: notification.message,
        points_amount: notification.points_amount,
        metadata: notification.metadata,
        is_read: false,
        created_at: new Date().toISOString(),
        expires_at: notification.expires_at
      });
  }

  private static createDefaultUserPoints(userId: string, tenantId: string): UserPoints {
    return {
      id: `points_${userId}`,
      user_id: userId,
      tenant_id: tenantId,
      total_points: 0,
      available_points: 0,
      lifetime_points: 0,
      current_level: 1,
      next_level_points: this.defaultLevels[1].points_required,
      last_updated: new Date().toISOString()
    };
  }
}
