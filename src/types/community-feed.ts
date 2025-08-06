export interface CommunityPost {
  id: string;
  author_user_id: string;
  author_profile?: CommunityUserProfile;
  tenant_id: string;
  
  // Content
  title?: string;
  content: string;
  content_type: 'text' | 'question' | 'tip' | 'alert' | 'discussion' | 'poll' | 'event';
  post_format: 'standard' | 'long_form' | 'media_rich' | 'infographic' | 'story';
  
  // Categorization
  category: PostCategory;
  subcategory?: string;
  tags: string[];
  topics: string[];
  
  // Location Context
  location?: PostLocation;
  affects_locations?: string[]; // Areas this post is relevant to
  
  // Media Attachments
  media_attachments: PostMedia[];
  external_links: ExternalLink[];
  
  // Metadata
  language: string;
  reading_time_minutes?: number;
  complexity_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Visibility & Targeting
  visibility: 'public' | 'community_only' | 'followers_only' | 'private_group';
  target_audience?: TargetAudience;
  community_groups?: string[]; // Community IDs this is posted to
  
  // Priority & Urgency
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  urgency_level?: 'routine' | 'time_sensitive' | 'emergency';
  expiry_date?: string; // For time-sensitive information
  
  // Engagement Metrics
  engagement_stats: PostEngagementStats;
  
  // Moderation & Quality
  moderation_status: 'pending' | 'approved' | 'flagged' | 'removed' | 'featured';
  quality_score?: number; // 0-100
  fact_check_status?: 'verified' | 'disputed' | 'unverified';
  expert_reviewed: boolean;
  
  // Post Features
  is_pinned: boolean;
  is_featured: boolean;
  allows_comments: boolean;
  allows_sharing: boolean;
  is_poll: boolean;
  poll_data?: PollData;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
  last_activity_at: string;
  
  // Analytics
  view_count: number;
  unique_viewers: number;
  engagement_rate: number;
  reach_score: number;
}

export interface CommunityUserProfile {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  location: string;
  farm_type?: string;
  specializations: string[];
  expertise_areas: string[];
  
  // Reputation & Trust
  reputation_score: number;
  trust_level: 'newcomer' | 'basic' | 'member' | 'regular' | 'leader' | 'expert';
  verification_badges: string[];
  
  // Community Standing
  is_verified: boolean;
  is_expert: boolean;
  is_moderator: boolean;
  is_extension_officer: boolean;
  is_researcher: boolean;
  
  // Activity Metrics
  posts_count: number;
  helpful_answers_count: number;
  community_points: number;
  join_date: string;
  last_active: string;
  
  // Profile Settings
  show_location: boolean;
  allow_direct_messages: boolean;
  notification_preferences: NotificationPreferences;
}

export interface PostEngagementStats {
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  reactions: {
    [reaction: string]: number; // like, love, helpful, insightful, etc.
  };
  
  // User-specific engagement
  current_user_liked: boolean;
  current_user_saved: boolean;
  current_user_shared: boolean;
  current_user_reaction?: string;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'infographic' | '360_photo' | 'drone_video';
  url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  alt_text?: string;
  
  // Media metadata
  file_size_bytes?: number;
  duration_seconds?: number; // for video/audio
  dimensions?: {
    width: number;
    height: number;
  };
  
  // Content analysis
  contains_text?: boolean;
  extracted_text?: string;
  ai_description?: string;
  content_tags?: string[];
  
  uploaded_at: string;
}

export interface ExternalLink {
  url: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  domain: string;
  is_trusted_source: boolean;
  link_type: 'article' | 'video' | 'research_paper' | 'tool' | 'marketplace' | 'other';
}

export interface PostLocation {
  address?: string;
  city?: string;
  state?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  location_precision: 'exact' | 'approximate' | 'city' | 'region';
  affects_radius_km?: number;
}

export interface TargetAudience {
  farm_types?: string[];
  experience_levels?: string[];
  crop_types?: string[];
  regions?: string[];
  languages?: string[];
  interests?: string[];
}

export interface PollData {
  question: string;
  options: PollOption[];
  poll_type: 'single_choice' | 'multiple_choice' | 'rating_scale' | 'text_response';
  allows_custom_answers: boolean;
  is_anonymous: boolean;
  closes_at?: string;
  total_votes: number;
  results_visible_before_voting: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  vote_count: number;
  percentage: number;
  current_user_voted: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_user_id: string;
  author_profile?: CommunityUserProfile;
  parent_comment_id?: string; // For nested comments
  
  // Content
  content: string;
  content_type: 'text' | 'answer' | 'question' | 'correction' | 'addition';
  
  // Media
  media_attachments: PostMedia[];
  external_links: ExternalLink[];
  
  // Expert Features
  is_expert_answer: boolean;
  is_verified_answer: boolean;
  expert_endorsements: ExpertEndorsement[];
  
  // Quality & Moderation
  quality_score?: number;
  helpful_votes: number;
  unhelpful_votes: number;
  is_solution: boolean; // Marked as solution by post author
  
  // Engagement
  replies_count: number;
  likes_count: number;
  current_user_liked: boolean;
  current_user_voted_helpful?: boolean;
  
  // Moderation
  moderation_status: 'pending' | 'approved' | 'flagged' | 'removed';
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Nested replies (if loading thread)
  replies?: CommunityComment[];
}

export interface ExpertEndorsement {
  expert_user_id: string;
  expert_name: string;
  expert_title: string;
  endorsement_type: 'accurate' | 'helpful' | 'comprehensive' | 'practical';
  comment?: string;
  endorsed_at: string;
}

export interface CommunityGroup {
  id: string;
  tenant_id: string;
  name: string;
  display_name: string;
  description: string;
  long_description?: string;
  
  // Categorization
  category: 'crop_specific' | 'technique' | 'regional' | 'general' | 'market' | 'technology' | 'sustainability';
  subcategories: string[];
  focus_areas: string[];
  
  // Visual Identity
  avatar_url?: string;
  cover_image_url?: string;
  color_theme?: string;
  
  // Group Settings
  group_type: 'public' | 'private' | 'restricted' | 'invite_only';
  membership_approval_required: boolean;
  posting_permissions: 'all_members' | 'moderators_only' | 'approved_members';
  
  // Membership
  member_count: number;
  active_member_count: number;
  moderators: GroupModerator[];
  experts: GroupExpert[];
  
  // Content Rules
  content_guidelines: string;
  prohibited_content: string[];
  auto_moderation_enabled: boolean;
  requires_expert_approval: boolean;
  
  // Activity
  posts_count: number;
  posts_this_week: number;
  last_activity_at: string;
  
  // User's relationship to group
  current_user_membership?: GroupMembership;
  
  created_at: string;
  updated_at: string;
}

export interface GroupModerator {
  user_id: string;
  name: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'moderator';
  appointed_at: string;
  permissions: ModeratorPermission[];
}

export interface GroupExpert {
  user_id: string;
  name: string;
  avatar_url?: string;
  expertise_areas: string[];
  credentials: string[];
  verified_at: string;
}

export interface GroupMembership {
  user_id: string;
  group_id: string;
  membership_status: 'active' | 'pending' | 'suspended' | 'banned';
  member_role: 'member' | 'contributor' | 'moderator' | 'expert' | 'admin';
  joined_at: string;
  last_activity_at: string;
  
  // Member preferences
  notification_level: 'all' | 'mentions_only' | 'important_only' | 'none';
  post_notifications: boolean;
  comment_notifications: boolean;
}

export interface QandAThread {
  id: string;
  tenant_id: string;
  
  // Question Details
  question_title: string;
  question_content: string;
  question_category: PostCategory;
  question_tags: string[];
  
  // Context
  urgency_level: 'routine' | 'urgent' | 'emergency';
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
  location_context?: PostLocation;
  crop_context?: string[];
  season_context?: string;
  
  // Question Author
  author_user_id: string;
  author_profile?: CommunityUserProfile;
  
  // Media & Attachments
  question_media: PostMedia[];
  diagnostic_images?: string[]; // For pest/disease identification
  
  // Answer Management
  answers: QandAAnswer[];
  best_answer_id?: string;
  expert_answers_count: number;
  community_answers_count: number;
  
  // Status & Progress
  status: 'open' | 'answered' | 'resolved' | 'closed' | 'escalated';
  resolution_type?: 'community_solved' | 'expert_verified' | 'self_resolved' | 'no_solution';
  
  // Expert Assignment
  assigned_experts: string[];
  expert_response_deadline?: string;
  escalation_level: number; // 0 = community, 1 = local expert, 2 = specialist
  
  // Engagement & Quality
  view_count: number;
  follower_count: number;
  helpful_votes: number;
  quality_score: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  first_answer_at?: string;
  resolved_at?: string;
  
  // Follow-up
  follow_up_questions: string[];
  related_threads: string[];
  outcome_reported: boolean;
  outcome_description?: string;
}

export interface QandAAnswer {
  id: string;
  thread_id: string;
  author_user_id: string;
  author_profile?: CommunityUserProfile;
  
  // Answer Content
  content: string;
  answer_type: 'direct_answer' | 'partial_solution' | 'alternative_approach' | 'resource_recommendation' | 'clarification_question';
  
  // Evidence & Support
  supporting_evidence: string[];
  references: ExternalLink[];
  media_attachments: PostMedia[];
  
  // Expert Features
  is_expert_answer: boolean;
  expert_credentials?: string[];
  confidence_level?: 'low' | 'medium' | 'high';
  
  // Community Validation
  helpful_votes: number;
  unhelpful_votes: number;
  expert_endorsements: ExpertEndorsement[];
  is_best_answer: boolean;
  
  // Implementation Tracking
  implementation_reports: ImplementationReport[];
  success_rate?: number;
  
  created_at: string;
  updated_at: string;
}

export interface ImplementationReport {
  user_id: string;
  outcome: 'successful' | 'partially_successful' | 'unsuccessful' | 'too_early';
  description: string;
  lessons_learned?: string;
  reported_at: string;
}

export interface ExpertSystem {
  id: string;
  name: string;
  title: string;
  organization?: string;
  
  // Expertise
  specialization_areas: string[];
  crops_expertise: string[];
  regions_covered: string[];
  languages: string[];
  
  // Credentials
  qualifications: string[];
  certifications: string[];
  years_experience: number;
  
  // Availability
  availability_schedule: {
    [day: string]: {
      available: boolean;
      start_time?: string;
      end_time?: string;
    };
  };
  response_time_hours: number;
  max_questions_per_day: number;
  
  // Performance Metrics
  total_questions_answered: number;
  average_rating: number;
  success_rate_percentage: number;
  response_time_average_hours: number;
  
  // Communication Preferences
  preferred_contact_methods: string[];
  consultation_fee?: {
    amount: number;
    currency: string;
    per: 'question' | 'hour' | 'session';
  };
  
  // Status
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  
  created_at: string;
  last_active: string;
}

export interface NotificationPreferences {
  new_posts: boolean;
  new_comments: boolean;
  mentions: boolean;
  direct_messages: boolean;
  expert_responses: boolean;
  community_updates: boolean;
  weekly_digest: boolean;
  
  // Delivery methods
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  
  // Timing
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
}

export interface CommunityEvent {
  id: string;
  tenant_id: string;
  organizer_user_id: string;
  
  // Event Details
  title: string;
  description: string;
  event_type: 'workshop' | 'webinar' | 'field_visit' | 'market_day' | 'training' | 'conference' | 'social';
  category: string;
  
  // Scheduling
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  
  // Location
  location_type: 'physical' | 'virtual' | 'hybrid';
  physical_address?: string;
  virtual_link?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Participation
  max_participants?: number;
  registration_required: boolean;
  registration_fee?: {
    amount: number;
    currency: string;
  };
  participant_count: number;
  waitlist_count: number;
  
  // Content
  agenda: EventAgenda[];
  speakers: EventSpeaker[];
  materials: string[];
  prerequisites?: string[];
  
  // Engagement
  allows_questions: boolean;
  allows_networking: boolean;
  has_discussion_forum: boolean;
  
  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registration_status: 'open' | 'closed' | 'waitlist_only';
  
  created_at: string;
  updated_at: string;
}

export interface EventAgenda {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
  duration_minutes: number;
  activity_type: 'presentation' | 'discussion' | 'hands_on' | 'break' | 'networking';
}

export interface EventSpeaker {
  name: string;
  title: string;
  organization?: string;
  bio?: string;
  avatar_url?: string;
  expertise_areas: string[];
}

export type PostCategory = 
  | 'general_discussion'
  | 'crop_advice'
  | 'livestock_management' 
  | 'pest_disease_control'
  | 'weather_climate'
  | 'market_prices'
  | 'equipment_machinery'
  | 'sustainable_practices'
  | 'technology_innovation'
  | 'financial_management'
  | 'policy_regulations'
  | 'community_announcements'
  | 'knowledge_sharing'
  | 'success_stories'
  | 'challenges_problems'
  | 'research_insights'
  | 'training_education';

export type ModeratorPermission = 
  | 'delete_posts'
  | 'edit_posts'
  | 'ban_users'
  | 'approve_posts'
  | 'pin_posts'
  | 'manage_events'
  | 'invite_experts'
  | 'edit_group_settings'
  | 'view_analytics';

// Search and filtering
export interface CommunitySearchFilters {
  categories?: PostCategory[];
  tags?: string[];
  location_radius_km?: number;
  urgency_levels?: string[];
  content_types?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  expert_verified_only?: boolean;
  has_media?: boolean;
  language?: string;
}

export interface CommunityFeedSettings {
  default_feed_type: 'chronological' | 'algorithmic' | 'expert_curated';
  show_categories: PostCategory[];
  hide_categories: PostCategory[];
  expert_content_priority: 'high' | 'normal' | 'low';
  local_content_boost: boolean;
  notification_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
  content_language_preferences: string[];
}