import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  MapPin,
  Calendar,
  Camera,
  Edit3,
  Share2,
  Download,
  QrCode,
  Verified,
  Star,
  Award,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Sprout,
  Cow,
  Tractor,
  CloudRain,
  DollarSign,
  Leaf,
  BarChart3,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Zap,
  Settings,
  ExternalLink,
  Copy,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  WhatsApp,
  Lock,
  Unlock,
  UserPlus,
  MessageSquare,
  FileText,
  Briefcase,
  MapIcon,
  CalendarDays,
  ThumbsUp,
  Send,
  Link2,
  BookOpen,
  Handshake,
  RefreshCw,
  Filter,
  Search,
  Flag,
  Trophy
} from 'lucide-react';

import { DigitalFarmProfileService } from '@/lib/digital-farm-profile-service';
import { DigitalFarmProfile, ProfilePrivacySettings, FarmProduct, FarmGalleryItem } from '@/types/digital-farm-profile';

interface EnhancedDigitalFarmProfileProps {
  profileId?: string;
  isOwner?: boolean;
  viewerUserId?: string;
  initialProfile?: DigitalFarmProfile;
}

export default function EnhancedDigitalFarmProfile({
  profileId,
  isOwner = false,
  viewerUserId,
  initialProfile
}: EnhancedDigitalFarmProfileProps) {
  const [profile, setProfile] = useState<DigitalFarmProfile | null>(initialProfile || null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(!initialProfile);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareableLink, setShareableLink] = useState('');

  // Gallery and content filters
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('all');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');

  useEffect(() => {
    if (profileId && !initialProfile) {
      fetchProfile();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    if (!profileId) return;
    
    try {
      setLoading(true);
      const fetchedProfile = await DigitalFarmProfileService.getFarmProfile(profileId, viewerUserId);
      setProfile(fetchedProfile);
      setShareableLink(`${window.location.origin}/farm/${fetchedProfile.profile_url_slug}`);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || !viewerUserId) return;
    
    try {
      const result = await DigitalFarmProfileService.toggleFollowProfile(
        viewerUserId,
        profile.id,
        profile.tenant_id
      );
      setIsFollowing(result.isFollowing);
      
      // Update followers count in UI
      setProfile(prev => prev ? {
        ...prev,
        followers_count: prev.followers_count + (result.isFollowing ? 1 : -1)
      } : prev);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleShare = async (shareType: 'link' | 'qr_code' | 'social') => {
    if (!profile) return;

    try {
      switch (shareType) {
        case 'link':
          await navigator.clipboard.writeText(shareableLink);
          alert('Profile link copied to clipboard!');
          break;
        case 'qr_code':
          // Generate and display QR code
          break;
        case 'social':
          if (navigator.share) {
            await navigator.share({
              title: `${profile.farm_name} - Digital Farm Profile`,
              text: profile.description,
              url: shareableLink
            });
          }
          break;
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const updatePrivacySettings = async (newSettings: ProfilePrivacySettings) => {
    if (!profile || !isOwner) return;

    try {
      await DigitalFarmProfileService.updateFarmProfile(
        profile.id,
        profile.user_id,
        profile.tenant_id,
        { privacy_settings: newSettings }
      );
      
      setProfile(prev => prev ? { ...prev, privacy_settings: newSettings } : prev);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  const getVerificationBadgeColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-gold-100 text-gold-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Profile Not Found</h2>
        <p className="text-gray-500">The requested farm profile could not be found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Cover Image & Header */}
      <div className="relative">
        <div 
          className="h-80 bg-cover bg-center relative overflow-hidden"
          style={{ 
            backgroundImage: profile.cover_image_url 
              ? `url(${profile.cover_image_url})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex gap-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowShareModal(true)}
              className="backdrop-blur-sm bg-white/90 hover:bg-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            {profile.qr_code_url && (
              <Button 
                variant="secondary" 
                size="sm"
                className="backdrop-blur-sm bg-white/90 hover:bg-white"
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
            )}
            
            {isOwner && (
              <>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setShowPrivacyModal(true)}
                  className="backdrop-blur-sm bg-white/90 hover:bg-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="backdrop-blur-sm bg-white/90 hover:bg-white"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </>
            )}
          </div>

          {/* Profile Completion Indicator for Owner */}
          {isOwner && (
            <div className="absolute top-6 left-6">
              <Card className="backdrop-blur-sm bg-white/90 border-0">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getCompletionColor(profile.profile_completion_percentage)}`} />
                      <span className="font-medium">Profile {profile.profile_completion_percentage}% Complete</span>
                    </div>
                  </div>
                  <Progress 
                    value={profile.profile_completion_percentage} 
                    className="mt-2 h-1"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Profile Header Content */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 pb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
              {/* Avatar with Verification Badges */}
              <div className="relative">
                <Avatar className="w-40 h-40 border-6 border-white shadow-2xl">
                  <AvatarImage src={profile.avatar_url} alt={profile.farm_name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {profile.farm_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                {profile.verification_status.is_verified && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <Badge className={`${getVerificationBadgeColor(profile.verification_status.verification_level)} border-2 border-white`}>
                      <Verified className="w-3 h-3 mr-1" />
                      {profile.verification_status.verification_level}
                    </Badge>
                  </div>
                )}
                
                {isOwner && isEditing && (
                  <Button 
                    size="sm" 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Farm Info */}
              <div className="flex-1 text-white lg:text-black lg:bg-white/95 lg:backdrop-blur-sm lg:rounded-lg lg:p-6 lg:shadow-lg">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl lg:text-4xl font-bold">{profile.farm_name}</h1>
                      
                      {profile.verification_status.is_verified && (
                        <CheckCircle className="w-6 h-6 lg:w-7 lg:h-7 text-blue-500" />
                      )}
                      
                      <Badge className="bg-green-600 text-white capitalize">
                        {profile.farm_types.join(', ')}
                      </Badge>
                    </div>
                    
                    <p className="text-lg lg:text-gray-600 mb-1">{profile.owner_name}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm lg:text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location.city}, {profile.location.state}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Est. {profile.established_year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sprout className="w-4 h-4" />
                        <span>{profile.total_area_hectares} hectares</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{profile.profile_views.toLocaleString()} views</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm lg:text-gray-700">
                      <span><strong>{profile.followers_count}</strong> Followers</span>
                      <span><strong>{profile.following_count}</strong> Following</span>
                      <span><strong>{profile.products.length}</strong> Products</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwner && (
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleFollow}
                        className={isFollowing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                      
                      <Button variant="outline" className="border-white text-black lg:border-gray-300">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      
                      <Button variant="outline" className="border-white text-black lg:border-gray-300">
                        <Handshake className="w-4 h-4 mr-2" />
                        Collaborate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 h-auto bg-transparent border-0">
              <TabsTrigger value="overview" className="flex items-center gap-2 py-4">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2 py-4">
                <Sprout className="w-4 h-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2 py-4">
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="certifications" className="flex items-center gap-2 py-4">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Certs</span>
              </TabsTrigger>
              <TabsTrigger value="sustainability" className="flex items-center gap-2 py-4">
                <Leaf className="w-4 h-4" />
                <span className="hidden sm:inline">Sustainability</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2 py-4">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Community</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 py-4">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2 py-4">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Contact</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Overview Tab - Enhanced */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Farm Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      About {profile.farm_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={profile.description}
                        onChange={(e) => setProfile({...profile, description: e.target.value})}
                        rows={4}
                        className="mb-4"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed mb-4">{profile.description}</p>
                    )}
                    
                    {/* Farm Type and Specialties */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Farm Type</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.farm_types.map((type, index) => (
                            <Badge key={index} variant="outline" className="capitalize">
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Primary Crops</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.primary_crops.map((crop, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800">
                              <Sprout className="w-3 h-3 mr-1" />
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {profile.specialties.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Specialties</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary">
                                <Star className="w-3 h-3 mr-1" />
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Statistics Dashboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Farm Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {profile.statistics.sustainability_rating}%
                        </div>
                        <div className="text-sm text-gray-600">Sustainability</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {profile.statistics.yield_improvement_percentage}%
                        </div>
                        <div className="text-sm text-gray-600">Yield Growth</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {profile.statistics.customer_satisfaction_rating}
                        </div>
                        <div className="text-sm text-gray-600">Rating</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {profile.statistics.years_in_business || new Date().getFullYear() - profile.established_year}
                        </div>
                        <div className="text-sm text-gray-600">Years</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity & Achievements */}
                {profile.achievements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile.achievements.slice(0, 3).map((achievement) => (
                          <div key={achievement.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                              <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-100 text-blue-800 capitalize">
                                  {achievement.category}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(achievement.achievement_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Contact Card with Privacy Controls */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Contact Information
                      </CardTitle>
                      {profile.privacy_settings.show_contact_info !== 'public' && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.privacy_settings.show_location !== 'hidden' && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm">
                          {profile.privacy_settings.show_location === 'exact' 
                            ? profile.location.address
                            : `${profile.location.city}, ${profile.location.state}`}
                        </span>
                      </div>
                    )}
                    
                    {profile.privacy_settings.show_contact_info !== 'private' && (
                      <>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm">{profile.contact_information.primary_phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm">{profile.contact_information.email}</span>
                        </div>
                      </>
                    )}
                    
                    {profile.contact_information.business_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium">Business Hours</div>
                          <div className="text-gray-600">Mon-Sat: 8:00 AM - 6:00 PM</div>
                        </div>
                      </div>
                    )}

                    {/* Social Media Links */}
                    {Object.keys(profile.social_media_links).length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-600 mb-2">Follow us on:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(profile.social_media_links).map(([platform, url]) => {
                            if (!url) return null;
                            const Icon = {
                              facebook: Facebook,
                              instagram: Instagram,
                              twitter: Twitter,
                              linkedin: Linkedin,
                              youtube: Youtube,
                              whatsapp: WhatsApp,
                              website: Globe
                            }[platform] || Globe;
                            
                            return (
                              <Button 
                                key={platform} 
                                size="sm" 
                                variant="outline" 
                                className="p-2"
                                onClick={() => window.open(url, '_blank')}
                              >
                                <Icon className="w-3 h-3" />
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Trust Score & Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Trust & Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Verification Level */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Verification Level</span>
                        <Badge className={getVerificationBadgeColor(profile.verification_status.verification_level)}>
                          {profile.verification_status.verification_level}
                        </Badge>
                      </div>
                      
                      {/* Trust Indicators */}
                      {profile.trust_indicators.map((indicator, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">
                            {indicator.indicator_type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(indicator.score / indicator.max_score) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {Math.round((indicator.score / indicator.max_score) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleShare('link')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Profile Link
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Download Profile PDF
                    </Button>
                    
                    {profile.qr_code_url && (
                      <Button variant="outline" className="w-full justify-start">
                        <QrCode className="w-4 h-4 mr-2" />
                        Show QR Code
                      </Button>
                    )}
                    
                    {!isOwner && (
                      <>
                        <Button variant="outline" className="w-full justify-start">
                          <Flag className="w-4 h-4 mr-2" />
                          Report Profile
                        </Button>
                        
                        <Button variant="outline" className="w-full justify-start">
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Endorse Skills
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs would continue with enhanced content... */}
          
          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <p className="text-gray-600">
                    Connect with {profile.farm_name} for products, services, or collaboration opportunities.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-4">Send a Message</h3>
                      <Input placeholder="Your name" />
                      <Input placeholder="Your email" type="email" />
                      <Input placeholder="Subject" />
                      <Textarea placeholder="Your message..." rows={6} />
                      <Button className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                    
                    {/* Contact Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Contact Information</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <div className="font-medium">Phone</div>
                            <div className="text-gray-600">{profile.contact_information.primary_phone}</div>
                            {profile.contact_information.secondary_phone && (
                              <div className="text-gray-600">{profile.contact_information.secondary_phone}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <div className="font-medium">Email</div>
                            <div className="text-gray-600">{profile.contact_information.email}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <div className="font-medium">Location</div>
                            <div className="text-gray-600">
                              {profile.location.city}, {profile.location.state}, {profile.location.country}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <div className="font-medium">Business Hours</div>
                            <div className="text-gray-600">
                              Monday - Saturday: 8:00 AM - 6:00 PM<br />
                              Sunday: Closed
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share {profile.farm_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                value={shareableLink}
                readOnly
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => handleShare('link')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => handleShare('social')}
              >
                <Share2 className="w-6 h-6" />
                <span className="text-xs">Share</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <QrCode className="w-6 h-6" />
                <span className="text-xs">QR Code</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Download className="w-6 h-6" />
                <span className="text-xs">PDF</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Settings Modal */}
      {isOwner && (
        <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Privacy Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show contact information</label>
                  <select 
                    value={profile.privacy_settings.show_contact_info}
                    onChange={(e) => updatePrivacySettings({
                      ...profile.privacy_settings,
                      show_contact_info: e.target.value as any
                    })}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="public">Public</option>
                    <option value="followers_only">Followers Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show location</label>
                  <select 
                    value={profile.privacy_settings.show_location}
                    onChange={(e) => updatePrivacySettings({
                      ...profile.privacy_settings,
                      show_location: e.target.value as any
                    })}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="exact">Exact</option>
                    <option value="approximate">Approximate</option>
                    <option value="city_only">City Only</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Allow direct messages</label>
                  <Switch
                    checked={profile.privacy_settings.allow_direct_messages}
                    onCheckedChange={(checked) => updatePrivacySettings({
                      ...profile.privacy_settings,
                      allow_direct_messages: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Searchable in directory</label>
                  <Switch
                    checked={profile.privacy_settings.searchable_in_directory}
                    onCheckedChange={(checked) => updatePrivacySettings({
                      ...profile.privacy_settings,
                      searchable_in_directory: checked
                    })}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}