import { supabase } from '@/lib/supabase';
import { SecurityService } from '@/lib/security';
import { RewardsEngineService } from '@/lib/rewards-engine';
import { 
  CommunityPost, 
  CommunityComment, 
  CommunityGroup,
  CommunityUserProfile,
  QandAThread,
  QandAAnswer,
  ExpertSystem,
  CommunityEvent,
  PostEngagementStats,
  CommunitySearchFilters,
  NotificationPreferences,
  ExpertEndorsement,
  ImplementationReport
} from '@/types/community-feed';

export class CommunityService {
  private static supabase = supabase;

  /**
   * Create a new community post
   */
  static async createPost(
    userId: string,
    tenantId: string,
    postData: Omit<CommunityPost, 'id' | 'author_user_id' | 'tenant_id' | 'engagement_stats' | 'created_at' | 'updated_at' | 'published_at' | 'last_activity_at' | 'view_count' | 'unique_viewers' | 'engagement_rate' | 'reach_score'>
  ): Promise<CommunityPost> {
    try {
      const postId = `post_${Date.now()}_${userId}`;
      
      const newPost: CommunityPost = {
        ...postData,
        id: postId,
        author_user_id: userId,
        tenant_id: tenantId,
        engagement_stats: {
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          saves_count: 0,
          reactions: {},
          current_user_liked: false,
          current_user_saved: false,
          current_user_shared: false
        },
        moderation_status: 'pending',
        quality_score: 70, // Default score, would be calculated by AI
        expert_reviewed: false,
        is_pinned: false,
        is_featured: false,
        view_count: 0,
        unique_viewers: 0,
        engagement_rate: 0,
        reach_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('community_posts')
        .insert([{
          id: newPost.id,
          author_user_id: newPost.author_user_id,
          tenant_id: newPost.tenant_id,
          title: newPost.title,
          content: newPost.content,
          content_type: newPost.content_type,
          post_format: newPost.post_format,
          category: newPost.category,
          subcategory: newPost.subcategory,
          tags: newPost.tags,
          topics: newPost.topics,
          location: newPost.location,
          media_attachments: newPost.media_attachments,
          external_links: newPost.external_links,
          language: newPost.language,
          complexity_level: newPost.complexity_level,
          visibility: newPost.visibility,
          target_audience: newPost.target_audience,
          community_groups: newPost.community_groups,
          priority: newPost.priority,
          urgency_level: newPost.urgency_level,
          expiry_date: newPost.expiry_date,
          allows_comments: newPost.allows_comments,
          allows_sharing: newPost.allows_sharing,
          is_poll: newPost.is_poll,
          poll_data: newPost.poll_data,
          created_at: newPost.created_at,
          updated_at: newPost.updated_at,
          published_at: newPost.published_at,
          last_activity_at: newPost.last_activity_at
        }])
        .select()
        .single();

      if (error) throw error;

      // Award points for posting
      await RewardsEngineService.awardPoints(
        userId,
        tenantId,
        'social_post',
        { 
          post_id: postId, 
          category: newPost.category,
          content_length: newPost.content.length 
        }
      );

      // Auto-moderate and potentially approve
      await this.moderatePost(postId);

      // Notify community if urgent
      if (newPost.priority === 'urgent' || newPost.priority === 'critical') {
        await this.notifyUrgentPost(newPost);
      }

      // Log activity
      await SecurityService.logUserActivity({
        userId,
        tenantId,
        action: 'community_post_created',
        resourceType: 'community_post',
        resourceId: postId,
        success: true,
        metadata: {
          category: newPost.category,
          priority: newPost.priority,
          content_length: newPost.content.length
        }
      });

      return newPost;

    } catch (error) {
      console.error('Post creation failed:', error);
      throw error;
    }
  }

  /**
   * Get community feed with filtering and pagination
   */
  static async getCommunityFeed(
    userId: string,
    tenantId: string,
    filters: CommunitySearchFilters = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<CommunityPost[]> {
    try {
      let query = this.supabase
        .from('community_posts')
        .select(`
          *,
          author_profiles:community_user_profiles!author_user_id(*),
          post_engagement_stats(*),
          post_comments(count)
        `)
        .eq('tenant_id', tenantId)
        .in('moderation_status', ['approved', 'featured']);

      // Apply filters
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.urgency_levels && filters.urgency_levels.length > 0) {
        query = query.in('priority', filters.urgency_levels);
      }

      if (filters.content_types && filters.content_types.length > 0) {
        query = query.in('content_type', filters.content_types);
      }

      if (filters.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end);
      }

      if (filters.expert_verified_only) {
        query = query.eq('expert_reviewed', true);
      }

      if (filters.has_media) {
        query = query.not('media_attachments', 'is', null);
      }

      if (filters.language) {
        query = query.eq('language', filters.language);
      }

      // Location-based filtering
      if (filters.location_radius_km && userId) {
        // This would require PostGIS for accurate geo-queries
        // For now, we'll implement a simple region-based filter
        const userProfile = await this.getCommunityUserProfile(userId, tenantId);
        if (userProfile?.location) {
          // Filter by same region or nearby
        }
      }

      const { data, error } = await query
        .order('last_activity_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Track user viewing activity for algorithm optimization
      if (data && data.length > 0) {
        await this.trackFeedView(userId, tenantId, data.map(p => p.id));
      }

      return data || [];

    } catch (error) {
      console.error('Feed fetch failed:', error);
      throw error;
    }
  }

  /**
   * Create Q&A thread for expert assistance
   */
  static async createQandAThread(
    userId: string,
    tenantId: string,
    threadData: Omit<QandAThread, 'id' | 'tenant_id' | 'author_user_id' | 'answers' | 'expert_answers_count' | 'community_answers_count' | 'view_count' | 'follower_count' | 'helpful_votes' | 'quality_score' | 'created_at' | 'updated_at'>
  ): Promise<QandAThread> {
    try {
      const threadId = `qna_${Date.now()}_${userId}`;
      
      const newThread: QandAThread = {
        ...threadData,
        id: threadId,
        tenant_id: tenantId,
        author_user_id: userId,
        answers: [],
        expert_answers_count: 0,
        community_answers_count: 0,
        status: 'open',
        escalation_level: 0,
        view_count: 0,
        follower_count: 0,
        helpful_votes: 0,
        quality_score: 75, // Default score
        assigned_experts: [],
        follow_up_questions: [],
        related_threads: [],
        outcome_reported: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('qna_threads')
        .insert([{
          id: newThread.id,
          tenant_id: newThread.tenant_id,
          author_user_id: newThread.author_user_id,
          question_title: newThread.question_title,
          question_content: newThread.question_content,
          question_category: newThread.question_category,
          question_tags: newThread.question_tags,
          urgency_level: newThread.urgency_level,
          complexity_level: newThread.complexity_level,
          location_context: newThread.location_context,
          crop_context: newThread.crop_context,
          season_context: newThread.season_context,
          question_media: newThread.question_media,
          diagnostic_images: newThread.diagnostic_images,
          status: newThread.status,
          escalation_level: newThread.escalation_level,
          created_at: newThread.created_at,
          updated_at: newThread.updated_at
        }])
        .select()
        .single();

      if (error) throw error;

      // Award points for asking questions
      await RewardsEngineService.awardPoints(
        userId,
        tenantId,
        'question_asked',
        { 
          thread_id: threadId, 
          category: newThread.question_category,
          urgency: newThread.urgency_level 
        }
      );

      // Auto-assign to relevant experts
      await this.assignExpertsToThread(threadId, newThread);

      // Create alert post if urgent
      if (newThread.urgency_level === 'urgent' || newThread.urgency_level === 'emergency') {
        await this.createUrgentAlert(newThread);
      }

      return newThread;

    } catch (error) {
      console.error('Q&A thread creation failed:', error);
      throw error;
    }
  }

  /**
   * Add answer to Q&A thread
   */
  static async addQandAAnswer(
    userId: string,
    tenantId: string,
    threadId: string,
    answerData: Omit<QandAAnswer, 'id' | 'thread_id' | 'author_user_id' | 'helpful_votes' | 'unhelpful_votes' | 'expert_endorsements' | 'implementation_reports' | 'success_rate' | 'created_at' | 'updated_at'>
  ): Promise<QandAAnswer> {
    try {
      const answerId = `ans_${Date.now()}_${userId}`;
      
      // Check if user is an expert
      const userProfile = await this.getCommunityUserProfile(userId, tenantId);
      const isExpert = userProfile?.is_expert || userProfile?.is_extension_officer;

      const newAnswer: QandAAnswer = {
        ...answerData,
        id: answerId,
        thread_id: threadId,
        author_user_id: userId,
        is_expert_answer: isExpert || false,
        helpful_votes: 0,
        unhelpful_votes: 0,
        expert_endorsements: [],
        is_best_answer: false,
        implementation_reports: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('qna_answers')
        .insert([{
          id: newAnswer.id,
          thread_id: newAnswer.thread_id,
          author_user_id: newAnswer.author_user_id,
          content: newAnswer.content,
          answer_type: newAnswer.answer_type,
          supporting_evidence: newAnswer.supporting_evidence,
          references: newAnswer.references,
          media_attachments: newAnswer.media_attachments,
          is_expert_answer: newAnswer.is_expert_answer,
          confidence_level: newAnswer.confidence_level,
          created_at: newAnswer.created_at,
          updated_at: newAnswer.updated_at
        }])
        .select()
        .single();

      if (error) throw error;

      // Update thread statistics
      await this.updateThreadAnswerStats(threadId, isExpert);

      // Award points for answering
      const pointsAction = isExpert ? 'expert_answer_given' : 'community_answer_given';
      await RewardsEngineService.awardPoints(
        userId,
        tenantId,
        pointsAction,
        { 
          thread_id: threadId, 
          answer_id: answerId,
          answer_length: newAnswer.content.length 
        }
      );

      // Notify thread author
      await this.notifyThreadAuthor(threadId, newAnswer);

      return newAnswer;

    } catch (error) {
      console.error('Answer creation failed:', error);
      throw error;
    }
  }

  /**
   * Add comment to a post
   */
  static async addComment(
    userId: string,
    tenantId: string,
    postId: string,
    commentData: Omit<CommunityComment, 'id' | 'post_id' | 'author_user_id' | 'helpful_votes' | 'unhelpful_votes' | 'replies_count' | 'likes_count' | 'current_user_liked' | 'current_user_voted_helpful' | 'moderation_status' | 'created_at' | 'updated_at' | 'replies'>
  ): Promise<CommunityComment> {
    try {
      const commentId = `comment_${Date.now()}_${userId}`;
      
      // Check if user is an expert
      const userProfile = await this.getCommunityUserProfile(userId, tenantId);
      const isExpert = userProfile?.is_expert || userProfile?.is_extension_officer;

      const newComment: CommunityComment = {
        ...commentData,
        id: commentId,
        post_id: postId,
        author_user_id: userId,
        is_expert_answer: isExpert || false,
        is_verified_answer: false,
        expert_endorsements: [],
        quality_score: 70,
        helpful_votes: 0,
        unhelpful_votes: 0,
        is_solution: false,
        replies_count: 0,
        likes_count: 0,
        current_user_liked: false,
        moderation_status: 'approved', // Auto-approve for now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        replies: []
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('community_comments')
        .insert([{
          id: newComment.id,
          post_id: newComment.post_id,
          author_user_id: newComment.author_user_id,
          parent_comment_id: newComment.parent_comment_id,
          content: newComment.content,
          content_type: newComment.content_type,
          media_attachments: newComment.media_attachments,
          external_links: newComment.external_links,
          is_expert_answer: newComment.is_expert_answer,
          is_verified_answer: newComment.is_verified_answer,
          quality_score: newComment.quality_score,
          is_solution: newComment.is_solution,
          moderation_status: newComment.moderation_status,
          created_at: newComment.created_at,
          updated_at: newComment.updated_at
        }])
        .select()
        .single();

      if (error) throw error;

      // Update post comment count
      await this.updatePostEngagementStats(postId, 'comments_count', 1);

      // Award points for commenting
      await RewardsEngineService.awardPoints(
        userId,
        tenantId,
        'comment_added',
        { 
          post_id: postId, 
          comment_id: commentId,
          is_expert: isExpert 
        }
      );

      return newComment;

    } catch (error) {
      console.error('Comment creation failed:', error);
      throw error;
    }
  }

  /**
   * Like/Unlike a post
   */
  static async togglePostLike(
    userId: string,
    tenantId: string,
    postId: string
  ): Promise<{ liked: boolean; likesCount: number }> {
    try {
      // Check if already liked
      const { data: existingLike } = await this.supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        // Unlike
        await this.supabase
          .from('post_likes')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        await this.updatePostEngagementStats(postId, 'likes_count', -1);
        
        return { liked: false, likesCount: -1 }; // Return relative change
      } else {
        // Like
        await this.supabase
          .from('post_likes')
          .insert([{
            user_id: userId,
            post_id: postId,
            tenant_id: tenantId,
            liked_at: new Date().toISOString()
          }]);

        await this.updatePostEngagementStats(postId, 'likes_count', 1);

        // Award points for engagement
        await RewardsEngineService.awardPoints(
          userId,
          tenantId,
          'post_liked',
          { post_id: postId }
        );

        return { liked: true, likesCount: 1 }; // Return relative change
      }

    } catch (error) {
      console.error('Post like toggle failed:', error);
      throw error;
    }
  }

  /**
   * Save/Unsave a post
   */
  static async togglePostSave(
    userId: string,
    tenantId: string,
    postId: string
  ): Promise<{ saved: boolean }> {
    try {
      // Check if already saved
      const { data: existingSave } = await this.supabase
        .from('post_saves')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (existingSave) {
        // Unsave
        await this.supabase
          .from('post_saves')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        await this.updatePostEngagementStats(postId, 'saves_count', -1);
        
        return { saved: false };
      } else {
        // Save
        await this.supabase
          .from('post_saves')
          .insert([{
            user_id: userId,
            post_id: postId,
            tenant_id: tenantId,
            saved_at: new Date().toISOString()
          }]);

        await this.updatePostEngagementStats(postId, 'saves_count', 1);

        return { saved: true };
      }

    } catch (error) {
      console.error('Post save toggle failed:', error);
      throw error;
    }
  }

  /**
   * Create or join a community group
   */
  static async createCommunityGroup(
    userId: string,
    tenantId: string,
    groupData: Omit<CommunityGroup, 'id' | 'tenant_id' | 'member_count' | 'active_member_count' | 'posts_count' | 'posts_this_week' | 'last_activity_at' | 'current_user_membership' | 'created_at' | 'updated_at'>
  ): Promise<CommunityGroup> {
    try {
      const groupId = `group_${Date.now()}_${userId}`;
      
      const newGroup: CommunityGroup = {
        ...groupData,
        id: groupId,
        tenant_id: tenantId,
        member_count: 1, // Creator is first member
        active_member_count: 1,
        posts_count: 0,
        posts_this_week: 0,
        last_activity_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save group
      const { data, error } = await this.supabase
        .from('community_groups')
        .insert([{
          id: newGroup.id,
          tenant_id: newGroup.tenant_id,
          name: newGroup.name,
          display_name: newGroup.display_name,
          description: newGroup.description,
          long_description: newGroup.long_description,
          category: newGroup.category,
          subcategories: newGroup.subcategories,
          focus_areas: newGroup.focus_areas,
          group_type: newGroup.group_type,
          membership_approval_required: newGroup.membership_approval_required,
          posting_permissions: newGroup.posting_permissions,
          content_guidelines: newGroup.content_guidelines,
          prohibited_content: newGroup.prohibited_content,
          auto_moderation_enabled: newGroup.auto_moderation_enabled,
          requires_expert_approval: newGroup.requires_expert_approval,
          created_at: newGroup.created_at,
          updated_at: newGroup.updated_at
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      await this.supabase
        .from('group_memberships')
        .insert([{
          user_id: userId,
          group_id: groupId,
          tenant_id: tenantId,
          membership_status: 'active',
          member_role: 'admin',
          joined_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        }]);

      // Award points for community leadership
      await RewardsEngineService.awardPoints(
        userId,
        tenantId,
        'community_group_created',
        { 
          group_id: groupId, 
          group_name: newGroup.name 
        }
      );

      return newGroup;

    } catch (error) {
      console.error('Community group creation failed:', error);
      throw error;
    }
  }

  /**
   * Get community user profile
   */
  static async getCommunityUserProfile(
    userId: string,
    tenantId: string
  ): Promise<CommunityUserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('community_user_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      
      return data;

    } catch (error) {
      console.error('User profile fetch failed:', error);
      return null;
    }
  }

  /**
   * Expert endorsement for answers
   */
  static async endorseAnswer(
    expertUserId: string,
    tenantId: string,
    answerId: string,
    endorsementData: Omit<ExpertEndorsement, 'expert_user_id' | 'endorsed_at'>
  ): Promise<ExpertEndorsement> {
    try {
      // Verify expert status
      const expertProfile = await this.getCommunityUserProfile(expertUserId, tenantId);
      if (!expertProfile?.is_expert && !expertProfile?.is_extension_officer) {
        throw new Error('Only experts can endorse answers');
      }

      const endorsement: ExpertEndorsement = {
        ...endorsementData,
        expert_user_id: expertUserId,
        endorsed_at: new Date().toISOString()
      };

      // Save endorsement
      await this.supabase
        .from('expert_endorsements')
        .insert([{
          answer_id: answerId,
          expert_user_id: expertUserId,
          expert_name: endorsementData.expert_name,
          expert_title: endorsementData.expert_title,
          endorsement_type: endorsementData.endorsement_type,
          comment: endorsementData.comment,
          endorsed_at: endorsement.endorsed_at
        }]);

      // Award points to answer author
      const { data: answer } = await this.supabase
        .from('qna_answers')
        .select('author_user_id, thread_id')
        .eq('id', answerId)
        .single();

      if (answer) {
        await RewardsEngineService.awardPoints(
          answer.author_user_id,
          tenantId,
          'expert_endorsement_received',
          { 
            answer_id: answerId,
            endorsement_type: endorsementData.endorsement_type,
            expert_name: endorsementData.expert_name
          }
        );
      }

      return endorsement;

    } catch (error) {
      console.error('Expert endorsement failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private static async moderatePost(postId: string): Promise<void> {
    // Simple auto-moderation logic
    // In reality, this would use AI/ML for content moderation
    await this.supabase
      .from('community_posts')
      .update({ moderation_status: 'approved' })
      .eq('id', postId);
  }

  private static async notifyUrgentPost(post: CommunityPost): Promise<void> {
    // Notify relevant experts and community managers
    // Implementation would depend on notification system
    console.log('Urgent post notification:', post.id);
  }

  private static async assignExpertsToThread(threadId: string, thread: QandAThread): Promise<void> {
    try {
      // Find relevant experts based on thread category and location
      const { data: experts } = await this.supabase
        .from('expert_system')
        .select('*')
        .overlaps('specialization_areas', [thread.question_category])
        .eq('is_active', true)
        .limit(3);

      if (experts && experts.length > 0) {
        const expertIds = experts.map(e => e.id);
        
        await this.supabase
          .from('qna_threads')
          .update({ 
            assigned_experts: expertIds,
            expert_response_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          })
          .eq('id', threadId);

        // Notify experts (implementation depends on notification system)
        console.log('Experts assigned to thread:', threadId, expertIds);
      }

    } catch (error) {
      console.error('Expert assignment failed:', error);
    }
  }

  private static async createUrgentAlert(thread: QandAThread): Promise<void> {
    // Create an alert post for urgent questions
    await this.createPost(
      thread.author_user_id,
      thread.tenant_id,
      {
        title: `URGENT: ${thread.question_title}`,
        content: `Emergency assistance needed: ${thread.question_content.substring(0, 200)}...`,
        content_type: 'alert',
        post_format: 'standard',
        category: thread.question_category,
        tags: [...thread.question_tags, 'urgent', 'alert'],
        topics: [],
        media_attachments: thread.question_media || [],
        external_links: [],
        language: 'English',
        complexity_level: thread.complexity_level,
        visibility: 'public',
        priority: 'critical',
        urgency_level: 'emergency',
        allows_comments: true,
        allows_sharing: true,
        is_poll: false
      }
    );
  }

  private static async updateThreadAnswerStats(threadId: string, isExpert: boolean): Promise<void> {
    const updateField = isExpert ? 'expert_answers_count' : 'community_answers_count';
    
    await this.supabase
      .from('qna_threads')
      .update({ 
        [updateField]: this.supabase.sql`${updateField} + 1`,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', threadId);
  }

  private static async notifyThreadAuthor(threadId: string, answer: QandAAnswer): Promise<void> {
    // Notify the question author about the new answer
    console.log('Thread author notification:', threadId, answer.id);
  }

  private static async updatePostEngagementStats(
    postId: string, 
    field: keyof PostEngagementStats, 
    delta: number
  ): Promise<void> {
    await this.supabase
      .from('community_posts')
      .update({ 
        [`engagement_stats->${field}`]: this.supabase.sql`(engagement_stats->>'${field}')::int + ${delta}`,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', postId);
  }

  private static async trackFeedView(
    userId: string,
    tenantId: string,
    postIds: string[]
  ): Promise<void> {
    // Track what content users view for algorithmic optimization
    const viewRecords = postIds.map(postId => ({
      user_id: userId,
      tenant_id: tenantId,
      post_id: postId,
      viewed_at: new Date().toISOString()
    }));

    await this.supabase
      .from('post_views')
      .insert(viewRecords);
  }
}
