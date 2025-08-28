import { createClient } from '@supabase/supabase-js';
import { SecurityService } from '@/lib/security';

export interface FarmerEngagementScore {
  id: string;
  user_id: string;
  tenant_id: string;
  overall_score: number; // 0-100
  component_scores: {
    login_frequency: number;
    feature_usage: number;
    data_quality: number;
    support_interaction: number;
    revenue_contribution: number;
    social_engagement: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  calculated_at: string;
  next_calculation: string;
}

export interface RetentionInsight {
  id: string;
  user_id: string;
  tenant_id: string;
  insight_type: 'churn_risk' | 'engagement_drop' | 'feature_adoption' | 'value_realization' | 'usage_anomaly';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendations: string[];
  data_points: Record<string, any>;
  confidence_score: number; // 0-1
  detected_at: string;
  expires_at?: string;
  status: 'active' | 'addressed' | 'dismissed';
}

export interface RetentionCampaign {
  id: string;
  tenant_id: string;
  name: string;
  campaign_type: 'onboarding' | 'reactivation' | 'upsell' | 'feedback' | 'education' | 'celebration';
  target_audience: RetentionAudience;
  triggers: RetentionTrigger[];
  actions: RetentionAction[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: string;
  end_date?: string;
  metrics: CampaignMetrics;
  created_by: string;
  created_at: string;
}

export interface RetentionAudience {
  criteria: {
    engagement_score_range?: [number, number];
    risk_levels?: string[];
    user_roles?: string[];
    tenure_days_range?: [number, number];
    feature_usage?: string[];
    last_login_days_ago?: number;
  };
  exclusions?: {
    recently_contacted_days?: number;
    opted_out_communications?: boolean;
    test_accounts?: boolean;
  };
}

export interface RetentionTrigger {
  type: 'score_change' | 'login_frequency' | 'feature_usage' | 'time_based' | 'behavior_pattern';
  conditions: Record<string, any>;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

export interface RetentionAction {
  type: 'email' | 'in_app_notification' | 'phone_call' | 'personal_visit' | 'discount_offer' | 'feature_unlock' | 'training_session';
  template_id?: string;
  message_content?: string;
  assigned_to?: string; // For personal outreach
  delay_hours?: number;
  conditions?: Record<string, any>;
}

export interface CampaignMetrics {
  total_targeted: number;
  total_reached: number;
  total_engaged: number;
  total_converted: number;
  conversion_rate: number;
  engagement_rate: number;
  retention_improvement: number;
  revenue_impact: number;
}

export interface FarmerLifecycleStage {
  user_id: string;
  tenant_id: string;
  current_stage: 'prospect' | 'onboarding' | 'active' | 'power_user' | 'at_risk' | 'churned' | 'win_back';
  stage_entered_at: string;
  stage_duration_days: number;
  expected_next_stages: string[];
  stage_completion_score: number; // 0-1
  blockers: string[];
  opportunities: string[];
}

export interface ValueRealization {
  id: string;
  user_id: string;
  tenant_id: string;
  value_metric: 'cost_savings' | 'yield_improvement' | 'time_savings' | 'efficiency_gains' | 'revenue_increase';
  baseline_value: number;
  current_value: number;
  improvement_percentage: number;
  measurement_period_days: number;
  confidence_level: 'low' | 'medium' | 'high';
  attribution_to_platform: number; // 0-1
  last_calculated: string;
  supporting_data: Record<string, any>;
}

export class FarmerRetentionService {
  private static supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  /**
   * Calculate engagement score for a farmer
   */
  static async calculateEngagementScore(userId: string, tenantId: string): Promise<FarmerEngagementScore> {
    try {
      // Get user's historical data for the last 90 days
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Login frequency score (0-20 points)
      const { data: loginData } = await this.supabase
        .from('user_activity_log')
        .select('timestamp')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('action', 'login_success')
        .gte('timestamp', startDate.toISOString());

      const loginDays = new Set(loginData?.map(log => 
        new Date(log.timestamp).toDateString()
      )).size;
      const loginFrequencyScore = Math.min(20, (loginDays / 30) * 20); // Max 20 for daily login

      // Feature usage score (0-25 points)
      const { data: featureData } = await this.supabase
        .from('user_activity_log')
        .select('action')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .gte('timestamp', startDate.toISOString())
        .neq('action', 'login_success');

      const uniqueFeatures = new Set(featureData?.map(log => log.action)).size;
      const featureUsageScore = Math.min(25, (uniqueFeatures / 15) * 25); // Max 25 for using 15+ features

      // Data quality score (0-20 points)
      const { data: userData } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .single();

      let dataQualityScore = 0;
      if (userData) {
        const completedFields = [
          userData.full_name,
          userData.phone_number,
          userData.location,
          userData.farm_size,
          userData.primary_crops
        ].filter(Boolean).length;
        dataQualityScore = (completedFields / 5) * 20;
      }

      // Support interaction score (0-15 points)
      const { data: supportData } = await this.supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .in('action', ['support_ticket_created', 'help_article_viewed', 'feedback_submitted'])
        .gte('timestamp', startDate.toISOString());

      const supportScore = Math.min(15, (supportData?.length || 0) * 3); // 3 points per interaction, max 15

      // Revenue contribution score (0-15 points)
      const { data: financialData } = await this.supabase
        .from('financial_records')
        .select('amount')
        .eq('tenant_id', tenantId)
        .eq('transaction_type', 'income')
        .gte('date', startDate.toISOString().split('T')[0]);

      const totalRevenue = financialData?.reduce((sum, record) => sum + record.amount, 0) || 0;
      const revenueScore = Math.min(15, (totalRevenue / 100000) * 15); // Max 15 for $100k+ revenue

      // Social engagement score (0-5 points)
      const { data: socialData } = await this.supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .in('action', ['social_post_created', 'social_post_liked', 'social_comment_created'])
        .gte('timestamp', startDate.toISOString());

      const socialScore = Math.min(5, (socialData?.length || 0) * 0.5); // 0.5 points per interaction, max 5

      // Calculate overall score
      const componentScores = {
        login_frequency: Math.round(loginFrequencyScore),
        feature_usage: Math.round(featureUsageScore),
        data_quality: Math.round(dataQualityScore),
        support_interaction: Math.round(supportScore),
        revenue_contribution: Math.round(revenueScore),
        social_engagement: Math.round(socialScore)
      };

      const overallScore = Object.values(componentScores).reduce((sum, score) => sum + score, 0);

      // Determine trend and risk level
      const trend = await this.calculateEngagementTrend(userId, tenantId);
      const riskLevel = this.determineRiskLevel(overallScore, trend);

      const engagementScore: FarmerEngagementScore = {
        id: `${userId}_${Date.now()}`,
        user_id: userId,
        tenant_id: tenantId,
        overall_score: overallScore,
        component_scores: componentScores,
        trend,
        risk_level: riskLevel,
        calculated_at: new Date().toISOString(),
        next_calculation: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Next week
      };

      // Store the score
      await this.supabase
        .from('farmer_engagement_scores')
        .upsert({
          user_id: userId,
          tenant_id: tenantId,
          overall_score: overallScore,
          component_scores: componentScores,
          trend,
          risk_level: riskLevel,
          calculated_at: engagementScore.calculated_at,
          next_calculation: engagementScore.next_calculation
        }, { onConflict: 'user_id,tenant_id' });

      // Generate insights if needed
      await this.generateRetentionInsights(userId, tenantId, engagementScore);

      return engagementScore;

    } catch (error) {
      console.error('Engagement score calculation failed:', error);
      throw error;
    }
  }

  /**
   * Generate retention insights based on engagement data
   */
  static async generateRetentionInsights(
    userId: string,
    tenantId: string,
    engagementScore: FarmerEngagementScore
  ): Promise<RetentionInsight[]> {
    const insights: RetentionInsight[] = [];

    // Churn risk insight
    if (engagementScore.risk_level === 'critical' || engagementScore.risk_level === 'high') {
      insights.push({
        id: `churn_risk_${userId}_${Date.now()}`,
        user_id: userId,
        tenant_id: tenantId,
        insight_type: 'churn_risk',
        severity: engagementScore.risk_level === 'critical' ? 'critical' : 'warning',
        title: 'High Churn Risk Detected',
        description: `Farmer engagement score is ${engagementScore.overall_score}/100 with ${engagementScore.trend} trend`,
        recommendations: this.generateChurnRiskRecommendations(engagementScore),
        data_points: {
          overall_score: engagementScore.overall_score,
          trend: engagementScore.trend,
          lowest_component: this.getLowestScoringComponent(engagementScore.component_scores)
        },
        confidence_score: 0.85,
        detected_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        status: 'active'
      });
    }

    // Feature adoption insight
    if (engagementScore.component_scores.feature_usage < 15) {
      insights.push({
        id: `feature_adoption_${userId}_${Date.now()}`,
        user_id: userId,
        tenant_id: tenantId,
        insight_type: 'feature_adoption',
        severity: 'warning',
        title: 'Low Feature Adoption',
        description: 'Farmer is not fully utilizing available platform features',
        recommendations: [
          'Schedule a platform walkthrough session',
          'Send targeted feature introduction emails',
          'Offer hands-on training for key features',
          'Provide use case examples relevant to their farm type'
        ],
        data_points: {
          feature_usage_score: engagementScore.component_scores.feature_usage,
          features_needed: ['crop_planning', 'financial_tracking', 'weather_monitoring']
        },
        confidence_score: 0.75,
        detected_at: new Date().toISOString(),
        status: 'active'
      });
    }

    // Store insights in database
    if (insights.length > 0) {
      await this.supabase
        .from('retention_insights')
        .upsert(insights.map(insight => ({
          user_id: insight.user_id,
          tenant_id: insight.tenant_id,
          insight_type: insight.insight_type,
          severity: insight.severity,
          title: insight.title,
          description: insight.description,
          recommendations: insight.recommendations,
          data_points: insight.data_points,
          confidence_score: insight.confidence_score,
          detected_at: insight.detected_at,
          expires_at: insight.expires_at,
          status: insight.status
        })), { onConflict: 'user_id,tenant_id,insight_type' });
    }

    return insights;
  }

  /**
   * Create and execute retention campaign
   */
  static async createRetentionCampaign(
    tenantId: string,
    campaign: Omit<RetentionCampaign, 'id' | 'metrics' | 'created_at'>
  ): Promise<RetentionCampaign> {
    try {
      const campaignId = `campaign_${Date.now()}`;
      
      // Create campaign record
      const newCampaign: RetentionCampaign = {
        ...campaign,
        id: campaignId,
        metrics: {
          total_targeted: 0,
          total_reached: 0,
          total_engaged: 0,
          total_converted: 0,
          conversion_rate: 0,
          engagement_rate: 0,
          retention_improvement: 0,
          revenue_impact: 0
        },
        created_at: new Date().toISOString()
      };

      await this.supabase
        .from('retention_campaigns')
        .insert({
          id: campaignId,
          tenant_id: newCampaign.tenant_id,
          name: newCampaign.name,
          campaign_type: newCampaign.campaign_type,
          target_audience: newCampaign.target_audience,
          triggers: newCampaign.triggers,
          actions: newCampaign.actions,
          status: newCampaign.status,
          start_date: newCampaign.start_date,
          end_date: newCampaign.end_date,
          metrics: newCampaign.metrics,
          created_by: newCampaign.created_by
        });

      // If campaign is active, execute it
      if (newCampaign.status === 'active') {
        await this.executeCampaign(campaignId);
      }

      return newCampaign;

    } catch (error) {
      console.error('Campaign creation failed:', error);
      throw error;
    }
  }

  /**
   * Execute a retention campaign
   */
  static async executeCampaign(campaignId: string): Promise<void> {
    try {
      // Get campaign details
      const { data: campaign } = await this.supabase
        .from('retention_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (!campaign) return;

      // Find target audience
      const targetUsers = await this.findTargetAudience(campaign.tenant_id, campaign.target_audience);
      
      // Execute actions for each user
      let reached = 0;
      let engaged = 0;

      for (const user of targetUsers) {
        for (const action of campaign.actions) {
          const result = await this.executeRetentionAction(user, action, campaign);
          if (result.delivered) reached++;
          if (result.engaged) engaged++;
        }
      }

      // Update campaign metrics
      await this.supabase
        .from('retention_campaigns')
        .update({
          metrics: {
            ...campaign.metrics,
            total_targeted: targetUsers.length,
            total_reached: reached,
            total_engaged: engaged,
            engagement_rate: targetUsers.length > 0 ? (engaged / targetUsers.length) * 100 : 0
          }
        })
        .eq('id', campaignId);

      // Log campaign execution
      await SecurityService.logUserActivity({
        userId: 'system',
        tenantId: campaign.tenant_id,
        action: 'retention_campaign_executed',
        resourceType: 'retention_campaign',
        resourceId: campaignId,
        success: true,
        metadata: {
          campaign_name: campaign.name,
          users_targeted: targetUsers.length,
          users_reached: reached
        }
      });

    } catch (error) {
      console.error('Campaign execution failed:', error);
    }
  }

  /**
   * Calculate value realization for a farmer
   */
  static async calculateValueRealization(
    userId: string,
    tenantId: string
  ): Promise<ValueRealization[]> {
    try {
      const valueRealizations: ValueRealization[] = [];

      // Calculate cost savings from better input management
      const costSavings = await this.calculateCostSavings(userId, tenantId);
      if (costSavings.improvement > 0) {
        valueRealizations.push({
          id: `cost_savings_${userId}`,
          user_id: userId,
          tenant_id: tenantId,
          value_metric: 'cost_savings',
          baseline_value: costSavings.baseline,
          current_value: costSavings.current,
          improvement_percentage: costSavings.improvement,
          measurement_period_days: 365,
          confidence_level: costSavings.confidence,
          attribution_to_platform: 0.7,
          last_calculated: new Date().toISOString(),
          supporting_data: costSavings.data
        });
      }

      // Calculate yield improvements
      const yieldImprovement = await this.calculateYieldImprovement(userId, tenantId);
      if (yieldImprovement.improvement > 0) {
        valueRealizations.push({
          id: `yield_improvement_${userId}`,
          user_id: userId,
          tenant_id: tenantId,
          value_metric: 'yield_improvement',
          baseline_value: yieldImprovement.baseline,
          current_value: yieldImprovement.current,
          improvement_percentage: yieldImprovement.improvement,
          measurement_period_days: 365,
          confidence_level: yieldImprovement.confidence,
          attribution_to_platform: 0.6,
          last_calculated: new Date().toISOString(),
          supporting_data: yieldImprovement.data
        });
      }

      // Store value realizations
      if (valueRealizations.length > 0) {
        await this.supabase
          .from('value_realizations')
          .upsert(valueRealizations.map(vr => ({
            user_id: vr.user_id,
            tenant_id: vr.tenant_id,
            value_metric: vr.value_metric,
            baseline_value: vr.baseline_value,
            current_value: vr.current_value,
            improvement_percentage: vr.improvement_percentage,
            measurement_period_days: vr.measurement_period_days,
            confidence_level: vr.confidence_level,
            attribution_to_platform: vr.attribution_to_platform,
            supporting_data: vr.supporting_data
          })), { onConflict: 'user_id,tenant_id,value_metric' });
      }

      return valueRealizations;

    } catch (error) {
      console.error('Value realization calculation failed:', error);
      return [];
    }
  }

  /**
   * Get retention dashboard data
   */
  static async getRetentionDashboard(tenantId: string): Promise<{
    overview: RetentionOverview;
    riskUsers: FarmerEngagementScore[];
    activeInsights: RetentionInsight[];
    campaignPerformance: RetentionCampaign[];
  }> {
    try {
      // Get overall retention metrics
      const { data: engagementScores } = await this.supabase
        .from('farmer_engagement_scores')
        .select('*')
        .eq('tenant_id', tenantId);

      const totalUsers = engagementScores?.length || 0;
      const riskUsers = engagementScores?.filter(s => s.risk_level === 'high' || s.risk_level === 'critical') || [];
      const avgEngagement = engagementScores?.reduce((sum, s) => sum + s.overall_score, 0) / totalUsers || 0;

      // Get active insights
      const { data: insights } = await this.supabase
        .from('retention_insights')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('detected_at', { ascending: false })
        .limit(10);

      // Get recent campaigns
      const { data: campaigns } = await this.supabase
        .from('retention_campaigns')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(5);

      const overview: RetentionOverview = {
        total_farmers: totalUsers,
        at_risk_farmers: riskUsers.length,
        average_engagement: Math.round(avgEngagement),
        active_campaigns: campaigns?.filter(c => c.status === 'active').length || 0,
        retention_rate: totalUsers > 0 ? ((totalUsers - riskUsers.length) / totalUsers) * 100 : 100,
        churn_prevention_success: 85 // Mock data - would be calculated from historical data
      };

      return {
        overview,
        riskUsers: riskUsers.slice(0, 10),
        activeInsights: insights || [],
        campaignPerformance: campaigns || []
      };

    } catch (error) {
      console.error('Retention dashboard data fetch failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private static async calculateEngagementTrend(userId: string, tenantId: string): Promise<'improving' | 'stable' | 'declining'> {
    // Get last 3 engagement scores to determine trend
    const { data: scores } = await this.supabase
      .from('farmer_engagement_scores')
      .select('overall_score, calculated_at')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .order('calculated_at', { ascending: false })
      .limit(3);

    if (!scores || scores.length < 2) return 'stable';

    const recent = scores[0].overall_score;
    const previous = scores[1].overall_score;
    const difference = recent - previous;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  private static determineRiskLevel(score: number, trend: string): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low';
    if (score >= 60 && trend !== 'declining') return 'medium';
    if (score >= 40 || (score >= 60 && trend === 'declining')) return 'high';
    return 'critical';
  }

  private static generateChurnRiskRecommendations(engagementScore: FarmerEngagementScore): string[] {
    const recommendations: string[] = [];
    const scores = engagementScore.component_scores;

    if (scores.login_frequency < 10) {
      recommendations.push('Schedule regular check-in calls to encourage platform usage');
      recommendations.push('Send weekly digest emails highlighting relevant features');
    }

    if (scores.feature_usage < 15) {
      recommendations.push('Provide personalized training on underutilized features');
      recommendations.push('Create custom dashboard highlighting relevant tools');
    }

    if (scores.revenue_contribution < 8) {
      recommendations.push('Offer business consultation to identify value opportunities');
      recommendations.push('Connect with successful farmers in similar operations');
    }

    if (scores.support_interaction === 0) {
      recommendations.push('Proactively reach out to offer support and guidance');
    }

    return recommendations;
  }

  private static getLowestScoringComponent(scores: Record<string, number>): string {
    return Object.entries(scores).reduce((min, [key, value]) => 
      value < scores[min] ? key : min, 
      Object.keys(scores)[0]
    );
  }

  private static async findTargetAudience(tenantId: string, audience: RetentionAudience): Promise<any[]> {
    // This would implement complex audience targeting logic
    // For now, return a simplified result
    const { data: users } = await this.supabase
      .from('farmer_engagement_scores')
      .select('user_id, overall_score, risk_level')
      .eq('tenant_id', tenantId);

    return users?.filter(user => {
      if (audience.criteria.risk_levels && !audience.criteria.risk_levels.includes(user.risk_level)) {
        return false;
      }
      if (audience.criteria.engagement_score_range) {
        const [min, max] = audience.criteria.engagement_score_range;
        if (user.overall_score < min || user.overall_score > max) {
          return false;
        }
      }
      return true;
    }) || [];
  }

  private static async executeRetentionAction(user: any, action: RetentionAction, campaign: RetentionCampaign): Promise<{
    delivered: boolean;
    engaged: boolean;
  }> {
    // This would implement actual action execution (emails, notifications, etc.)
    // For now, return mock success
    return { delivered: true, engaged: Math.random() > 0.3 };
  }

  private static async calculateCostSavings(userId: string, tenantId: string): Promise<{
    baseline: number;
    current: number;
    improvement: number;
    confidence: 'low' | 'medium' | 'high';
    data: Record<string, any>;
  }> {
    // Mock implementation - would calculate actual cost savings
    return {
      baseline: 50000,
      current: 42000,
      improvement: 16,
      confidence: 'medium',
      data: { category: 'input_optimization', period: 'annual' }
    };
  }

  private static async calculateYieldImprovement(userId: string, tenantId: string): Promise<{
    baseline: number;
    current: number;
    improvement: number;
    confidence: 'low' | 'medium' | 'high';
    data: Record<string, any>;
  }> {
    // Mock implementation - would calculate actual yield improvements
    return {
      baseline: 150,
      current: 165,
      improvement: 10,
      confidence: 'high',
      data: { metric: 'bushels_per_acre', crop: 'corn' }
    };
  }
}

export interface RetentionOverview {
  total_farmers: number;
  at_risk_farmers: number;
  average_engagement: number;
  active_campaigns: number;
  retention_rate: number;
  churn_prevention_success: number;
}

export default FarmerRetentionService;
