import { supabase } from '@/lib/supabase';
import { SecurityService } from '@/lib/security';
import { RewardsEngineService } from '@/lib/rewards-engine';
import { 
  DigitalFarmProfile, 
  FarmProduct, 
  FarmService, 
  FarmGalleryItem,
  YieldRecord,
  FarmCertification,
  ProfilePrivacySettings,
  ProfileShare,
  CollaborationRequest,
  FarmProfileSearchFilters,
  FarmProfileSearchResult,
  ProfileEndorsement,
  TrustIndicator,
  VerificationStatus,
  FarmStatistics
} from '@/types/digital-farm-profile';

export class DigitalFarmProfileService {
  private static supabase = supabase;

  /**
   * Create a new digital farm profile
   */
  static async createFarmProfile(
    userId: string,
    tenantId: string,
    profileData: Partial<DigitalFarmProfile>
  ): Promise<DigitalFarmProfile> {
    try {
      const profileId = `farm_${Date.now()}_${userId}`;
      const urlSlug = this.generateUrlSlug(profileData.farm_name || 'farm');
      
      const newProfile: DigitalFarmProfile = {
        id: profileId,
        user_id: userId,
        tenant_id: tenantId,
        farm_name: profileData.farm_name || '',
        owner_name: profileData.owner_name || '',
        profile_type: profileData.profile_type || 'individual',
        description: profileData.description || '',
        established_year: profileData.established_year || new Date().getFullYear(),
        total_area_hectares: profileData.total_area_hectares || 0,
        farm_types: profileData.farm_types || [],
        primary_crops: profileData.primary_crops || [],
        livestock_types: profileData.livestock_types || [],
        
        // Initialize default values
        location: profileData.location || this.getDefaultLocation(),
        contact_information: profileData.contact_information || this.getDefaultContact(),
        certifications: [],
        specialties: [],
        farming_methods: [],
        sustainability_practices: [],
        products: [],
        services_offered: [],
        seasonal_calendar: [],
        achievements: [],
        awards: [],
        testimonials: [],
        statistics: this.initializeDefaultStatistics(),
        yield_history: [],
        financial_overview: this.initializeDefaultFinancialOverview(),
        gallery: [],
        documents: [],
        social_media_links: {},
        community_involvement: [],
        mentorship_status: 'none',
        verification_status: this.initializeVerificationStatus(),
        trust_indicators: [],
        compliance_records: [],
        privacy_settings: this.getDefaultPrivacySettings(),
        visibility: 'public',
        profile_completion_percentage: this.calculateCompletionPercentage(profileData),
        profile_views: 0,
        followers_count: 0,
        following_count: 0,
        endorsements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        is_active: true,
        profile_url_slug: urlSlug,
        ...profileData
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('digital_farm_profiles')
        .insert([{
          id: newProfile.id,
          user_id: newProfile.user_id,
          tenant_id: newProfile.tenant_id,
          farm_name: newProfile.farm_name,
          owner_name: newProfile.owner_name,
          profile_type: newProfile.profile_type,
          description: newProfile.description,
          established_year: newProfile.established_year,
          total_area_hectares: newProfile.total_area_hectares,
          farm_types: newProfile.farm_types,
          primary_crops: newProfile.primary_crops,
          livestock_types: newProfile.livestock_types,
          location: newProfile.location,
          contact_information: newProfile.contact_information,
          privacy_settings: newProfile.privacy_settings,
          visibility: newProfile.visibility,
          profile_completion_percentage: newProfile.profile_completion_percentage,
          profile_url_slug: newProfile.profile_url_slug,
          created_at: newProfile.created_at,
          updated_at: newProfile.updated_at,
          last_active: newProfile.last_active,
          is_active: newProfile.is_active
        }])
        .select()
        .single();

      if (error) throw error;

      // Award points for profile creation
      await RewardsEngineService.awardPoints(
        userId, 
        tenantId, 
        'profile_created',
        { profile_id: profileId, farm_name: newProfile.farm_name }
      );

      // Generate QR code
      await this.generateQRCode(profileId);

      // Log activity
      await SecurityService.logUserActivity({
        userId,
        tenantId,
        action: 'farm_profile_created',
        resourceType: 'farm_profile',
        resourceId: profileId,
        success: true,
        metadata: {
          farm_name: newProfile.farm_name,
          profile_type: newProfile.profile_type,
          completion_percentage: newProfile.profile_completion_percentage
        }
      });

      return newProfile;

    } catch (error) {
      console.error('Profile creation failed:', error);
      throw error;
    }
  }

  /**
   * Update farm profile
   */
  static async updateFarmProfile(
    profileId: string,
    userId: string,
    tenantId: string,
    updates: Partial<DigitalFarmProfile>
  ): Promise<DigitalFarmProfile> {
    try {
      // Check ownership
      const existingProfile = await this.getFarmProfile(profileId);
      if (existingProfile.user_id !== userId) {
        throw new Error('Unauthorized: Cannot update profile you do not own');
      }

      // Calculate new completion percentage
      const completionPercentage = this.calculateCompletionPercentage({
        ...existingProfile,
        ...updates
      });

      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
        profile_completion_percentage: completionPercentage
      };

      // Update in database
      const { data, error } = await this.supabase
        .from('digital_farm_profiles')
        .update(updatedData)
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;

      // Award points for profile completion milestones
      if (completionPercentage >= 50 && existingProfile.profile_completion_percentage < 50) {
        await RewardsEngineService.awardPoints(
          userId, 
          tenantId, 
          'profile_50_complete',
          { profile_id: profileId, completion: completionPercentage }
        );
      }
      if (completionPercentage >= 100 && existingProfile.profile_completion_percentage < 100) {
        await RewardsEngineService.awardPoints(
          userId, 
          tenantId, 
          'profile_100_complete',
          { profile_id: profileId, completion: completionPercentage }
        );
      }

      return { ...existingProfile, ...updatedData };

    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Get farm profile by ID
   */
  static async getFarmProfile(
    profileId: string,
    viewerUserId?: string
  ): Promise<DigitalFarmProfile> {
    try {
      const { data, error } = await this.supabase
        .from('digital_farm_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Profile not found');

      // Check privacy settings
      if (!this.canViewProfile(data, viewerUserId)) {
        throw new Error('Profile is not accessible');
      }

      // Increment view count if viewer is different from owner
      if (viewerUserId && viewerUserId !== data.user_id) {
        await this.incrementProfileViews(profileId);
      }

      return data;

    } catch (error) {
      console.error('Profile fetch failed:', error);
      throw error;
    }
  }

  /**
   * Search farm profiles
   */
  static async searchFarmProfiles(
    filters: FarmProfileSearchFilters,
    viewerLocation?: { latitude: number; longitude: number },
    limit: number = 20,
    offset: number = 0
  ): Promise<FarmProfileSearchResult[]> {
    try {
      let query = this.supabase
        .from('digital_farm_profiles')
        .select('*')
        .eq('is_active', true)
        .in('visibility', ['public', 'community_only']);

      // Apply filters
      if (filters.farm_types && filters.farm_types.length > 0) {
        query = query.overlaps('farm_types', filters.farm_types);
      }

      if (filters.crops && filters.crops.length > 0) {
        query = query.overlaps('primary_crops', filters.crops);
      }

      if (filters.min_area_hectares) {
        query = query.gte('total_area_hectares', filters.min_area_hectares);
      }

      if (filters.max_area_hectares) {
        query = query.lte('total_area_hectares', filters.max_area_hectares);
      }

      if (filters.established_year_range) {
        query = query
          .gte('established_year', filters.established_year_range[0])
          .lte('established_year', filters.established_year_range[1]);
      }

      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('profile_completion_percentage', { ascending: false });

      if (error) throw error;

      // Calculate search results with relevance scoring
      const results: FarmProfileSearchResult[] = (data || []).map(profile => {
        const matchScore = this.calculateMatchScore(profile, filters);
        const distanceKm = viewerLocation 
          ? this.calculateDistance(viewerLocation, profile.location.coordinates)
          : undefined;

        return {
          profile,
          match_score: matchScore,
          distance_km: distanceKm,
          matching_criteria: this.getMatchingCriteria(profile, filters),
          relevance_factors: this.calculateRelevanceFactors(profile, filters, distanceKm)
        };
      });

      // Sort by relevance
      return results.sort((a, b) => b.match_score - a.match_score);

    } catch (error) {
      console.error('Profile search failed:', error);
      throw error;
    }
  }

  /**
   * Add product to farm profile
   */
  static async addProduct(
    profileId: string,
    userId: string,
    tenantId: string,
    productData: Omit<FarmProduct, 'id' | 'created_at' | 'updated_at'>
  ): Promise<FarmProduct> {
    try {
      const productId = `prod_${Date.now()}_${profileId}`;
      
      const newProduct: FarmProduct = {
        ...productData,
        id: productId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to profile's products array
      const { data, error } = await this.supabase
        .from('farm_products')
        .insert([{
          id: newProduct.id,
          profile_id: profileId,
          user_id: userId,
          tenant_id: tenantId,
          ...newProduct
        }])
        .select()
        .single();

      if (error) throw error;

      // Award points for adding products
      await RewardsEngineService.awardPoints(
        userId,
        tenantId,
        'product_added',
        { profile_id: profileId, product_name: newProduct.name }
      );

      return newProduct;

    } catch (error) {
      console.error('Product addition failed:', error);
      throw error;
    }
  }

  /**
   * Add media to farm gallery
   */
  static async addGalleryItem(
    profileId: string,
    userId: string,
    tenantId: string,
    mediaData: Omit<FarmGalleryItem, 'id' | 'uploaded_at' | 'views_count' | 'likes_count'>
  ): Promise<FarmGalleryItem> {
    try {
      const mediaId = `media_${Date.now()}_${profileId}`;
      
      const newMediaItem: FarmGalleryItem = {
        ...mediaData,
        id: mediaId,
        uploaded_at: new Date().toISOString(),
        views_count: 0,
        likes_count: 0
      };

      const { data, error } = await this.supabase
        .from('farm_gallery_items')
        .insert([{
          id: newMediaItem.id,
          profile_id: profileId,
          user_id: userId,
          tenant_id: tenantId,
          ...newMediaItem
        }])
        .select()
        .single();

      if (error) throw error;

      // Award points for adding media
      await RewardsEngineService.awardPoints(
        userId,
        tenantId,
        'media_uploaded',
        { profile_id: profileId, media_type: newMediaItem.type }
      );

      return newMediaItem;

    } catch (error) {
      console.error('Gallery item addition failed:', error);
      throw error;
    }
  }

  /**
   * Follow/Unfollow a farm profile
   */
  static async toggleFollowProfile(
    followerId: string,
    profileId: string,
    tenantId: string
  ): Promise<{ isFollowing: boolean }> {
    try {
      // Check if already following
      const { data: existingFollow } = await this.supabase
        .from('profile_follows')
        .select('id')
        .eq('follower_user_id', followerId)
        .eq('profile_id', profileId)
        .single();

      if (existingFollow) {
        // Unfollow
        await this.supabase
          .from('profile_follows')
          .delete()
          .eq('follower_user_id', followerId)
          .eq('profile_id', profileId);

        // Decrement followers count
        await this.updateFollowersCount(profileId, -1);

        return { isFollowing: false };
      } else {
        // Follow
        await this.supabase
          .from('profile_follows')
          .insert([{
            follower_user_id: followerId,
            profile_id: profileId,
            tenant_id: tenantId,
            followed_at: new Date().toISOString()
          }]);

        // Increment followers count
        await this.updateFollowersCount(profileId, 1);

        // Award points for following
        await RewardsEngineService.awardPoints(
          followerId,
          tenantId,
          'profile_followed',
          { profile_id: profileId }
        );

        return { isFollowing: true };
      }

    } catch (error) {
      console.error('Follow toggle failed:', error);
      throw error;
    }
  }

  /**
   * Endorse a farmer's skills
   */
  static async endorseProfile(
    endorserId: string,
    profileId: string,
    tenantId: string,
    endorsementData: Omit<ProfileEndorsement, 'id' | 'created_at'>
  ): Promise<ProfileEndorsement> {
    try {
      const endorsementId = `endorse_${Date.now()}_${profileId}`;
      
      const newEndorsement: ProfileEndorsement = {
        ...endorsementData,
        id: endorsementId,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('profile_endorsements')
        .insert([{
          id: newEndorsement.id,
          profile_id: profileId,
          endorser_id: endorserId,
          tenant_id: tenantId,
          ...newEndorsement
        }])
        .select()
        .single();

      if (error) throw error;

      // Award points for giving endorsement
      await RewardsEngineService.awardPoints(
        endorserId,
        tenantId,
        'endorsement_given',
        { profile_id: profileId, skill: endorsementData.skill_or_attribute }
      );

      return newEndorsement;

    } catch (error) {
      console.error('Endorsement failed:', error);
      throw error;
    }
  }

  /**
   * Create a shareable profile link
   */
  static async createProfileShare(
    profileId: string,
    sharedByUserId: string,
    shareData: Omit<ProfileShare, 'id' | 'view_count' | 'created_at'>
  ): Promise<ProfileShare> {
    try {
      const shareId = `share_${Date.now()}_${profileId}`;
      
      const newShare: ProfileShare = {
        ...shareData,
        id: shareId,
        profile_id: profileId,
        shared_by_user_id: sharedByUserId,
        view_count: 0,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('profile_shares')
        .insert([newShare])
        .select()
        .single();

      if (error) throw error;

      return newShare;

    } catch (error) {
      console.error('Profile share creation failed:', error);
      throw error;
    }
  }

  /**
   * Update farm statistics
   */
  static async updateFarmStatistics(
    profileId: string,
    userId: string,
    tenantId: string,
    statistics: Partial<FarmStatistics>
  ): Promise<FarmStatistics> {
    try {
      const updatedStats: FarmStatistics = {
        ...statistics,
        calculated_at: new Date().toISOString()
      } as FarmStatistics;

      const { data, error } = await this.supabase
        .from('digital_farm_profiles')
        .update({ statistics: updatedStats })
        .eq('id', profileId)
        .eq('user_id', userId)
        .select('statistics')
        .single();

      if (error) throw error;

      return data.statistics;

    } catch (error) {
      console.error('Statistics update failed:', error);
      throw error;
    }
  }

  /**
   * Get profiles for discovery/recommendations
   */
  static async getRecommendedProfiles(
    userId: string,
    tenantId: string,
    limit: number = 10
  ): Promise<DigitalFarmProfile[]> {
    try {
      // Get user's profile to understand their interests
      const { data: userProfile } = await this.supabase
        .from('digital_farm_profiles')
        .select('primary_crops, farm_types, location')
        .eq('user_id', userId)
        .single();

      let query = this.supabase
        .from('digital_farm_profiles')
        .select('*')
        .eq('is_active', true)
        .eq('visibility', 'public')
        .neq('user_id', userId)
        .limit(limit);

      // If user has a profile, recommend similar farms
      if (userProfile) {
        if (userProfile.primary_crops?.length > 0) {
          query = query.overlaps('primary_crops', userProfile.primary_crops);
        }
      }

      const { data, error } = await query.order('followers_count', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Profile recommendations failed:', error);
      return [];
    }
  }

  // Private helper methods

  private static generateUrlSlug(farmName: string): string {
    return farmName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) + '-' + Date.now().toString(36);
  }

  private static getDefaultLocation() {
    return {
      address: '',
      city: '',
      state: '',
      country: '',
      coordinates: { latitude: 0, longitude: 0 },
      timezone: 'UTC',
      climate_zone: '',
      soil_type: [],
      water_sources: []
    };
  }

  private static getDefaultContact() {
    return {
      primary_phone: '',
      email: '',
      business_hours: {
        monday: { open: '08:00', close: '17:00', is_closed: false },
        tuesday: { open: '08:00', close: '17:00', is_closed: false },
        wednesday: { open: '08:00', close: '17:00', is_closed: false },
        thursday: { open: '08:00', close: '17:00', is_closed: false },
        friday: { open: '08:00', close: '17:00', is_closed: false },
        saturday: { open: '08:00', close: '12:00', is_closed: false },
        sunday: { open: '08:00', close: '12:00', is_closed: true }
      },
      preferred_contact_method: 'phone' as const,
      languages_spoken: ['English']
    };
  }

  private static getDefaultPrivacySettings(): ProfilePrivacySettings {
    return {
      show_contact_info: 'public',
      show_financial_data: 'private',
      show_yield_data: 'followers_only',
      show_location: 'approximate',
      allow_direct_messages: true,
      allow_product_inquiries: true,
      allow_collaboration_requests: true,
      show_online_status: false,
      searchable_in_directory: true
    };
  }

  private static initializeDefaultStatistics(): FarmStatistics {
    return {
      total_area_cultivated: 0,
      current_season_yield_tons: 0,
      yield_per_hectare_avg: 0,
      yield_improvement_percentage: 0,
      water_usage_efficiency: 0,
      fertilizer_efficiency: 0,
      labor_productivity: 0,
      carbon_footprint_tons: 0,
      biodiversity_index: 0,
      soil_health_score: 0,
      sustainability_rating: 0,
      revenue_growth_percentage: 0,
      profit_margin_percentage: 0,
      cost_per_hectare: 0,
      customer_satisfaction_rating: 0,
      repeat_customer_percentage: 0,
      market_reach_km: 0,
      mechanization_level: 0,
      technology_adoption_score: 0,
      crop_diversity_index: 0,
      calculated_at: new Date().toISOString()
    };
  }

  private static initializeDefaultFinancialOverview() {
    return {
      revenue_categories: [],
      cost_breakdown: [],
      profitability_trends: [],
      investment_areas: [],
      financial_goals: [],
      is_public: false,
      last_updated: new Date().toISOString()
    };
  }

  private static initializeVerificationStatus(): VerificationStatus {
    return {
      is_verified: false,
      verification_level: 'basic',
      verified_by: 'system',
      verification_badges: []
    };
  }

  private static calculateCompletionPercentage(profile: Partial<DigitalFarmProfile>): number {
    const fields = [
      'farm_name', 'description', 'established_year', 'total_area_hectares',
      'primary_crops', 'location', 'contact_information'
    ];
    
    const completed = fields.filter(field => {
      const value = profile[field as keyof DigitalFarmProfile];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== undefined && value !== null && value !== '';
    });

    return Math.round((completed.length / fields.length) * 100);
  }

  private static canViewProfile(profile: any, viewerUserId?: string): boolean {
    if (profile.visibility === 'public') return true;
    if (!viewerUserId) return false;
    if (profile.user_id === viewerUserId) return true;
    
    // Additional privacy checks would go here
    return profile.visibility !== 'private';
  }

  private static async incrementProfileViews(profileId: string): Promise<void> {
    await this.supabase
      .from('digital_farm_profiles')
      .update({ 
        profile_views: this.supabase.sql`profile_views + 1`,
        last_active: new Date().toISOString()
      })
      .eq('id', profileId);
  }

  private static async updateFollowersCount(profileId: string, delta: number): Promise<void> {
    await this.supabase
      .from('digital_farm_profiles')
      .update({ 
        followers_count: this.supabase.sql`followers_count + ${delta}`
      })
      .eq('id', profileId);
  }

  private static calculateMatchScore(profile: any, filters: FarmProfileSearchFilters): number {
    let score = 0;
    
    // Farm type match
    if (filters.farm_types && profile.farm_types) {
      const matches = filters.farm_types.filter(type => profile.farm_types.includes(type)).length;
      score += (matches / filters.farm_types.length) * 30;
    }
    
    // Crop match
    if (filters.crops && profile.primary_crops) {
      const matches = filters.crops.filter(crop => profile.primary_crops.includes(crop)).length;
      score += (matches / filters.crops.length) * 40;
    }
    
    // Completion bonus
    score += profile.profile_completion_percentage * 0.3;
    
    return Math.min(100, score);
  }

  private static getMatchingCriteria(profile: any, filters: FarmProfileSearchFilters): string[] {
    const criteria = [];
    
    if (filters.farm_types) {
      const matches = filters.farm_types.filter(type => profile.farm_types?.includes(type));
      if (matches.length > 0) criteria.push(`Farm types: ${matches.join(', ')}`);
    }
    
    if (filters.crops) {
      const matches = filters.crops.filter(crop => profile.primary_crops?.includes(crop));
      if (matches.length > 0) criteria.push(`Crops: ${matches.join(', ')}`);
    }
    
    return criteria;
  }

  private static calculateRelevanceFactors(profile: any, filters: FarmProfileSearchFilters, distanceKm?: number) {
    return {
      location: distanceKm ? Math.max(0, 100 - distanceKm) : 50,
      products: 70,
      services: 60,
      reputation: profile.followers_count || 0,
      compatibility: 80
    };
  }

  private static calculateDistance(point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static async generateQRCode(profileId: string): Promise<string> {
    // In a real implementation, this would generate an actual QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://agrinexus.com/farm/${profileId}`)}`;
    
    await this.supabase
      .from('digital_farm_profiles')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', profileId);

    return qrCodeUrl;
  }
}
