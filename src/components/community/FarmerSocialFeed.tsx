import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Calendar,
  Camera,
  Video,
  FileText,
  Users,
  TrendingUp,
  Bookmark,
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  Star,
  Award,
  Sprout,
  Cow,
  CloudRain,
  DollarSign,
  Filter,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import { AuthService } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  farmType: string;
  expertise: string[];
  reputation: number;
  verified: boolean;
}

interface PostMedia {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  caption?: string;
}

interface Post {
  id: string;
  author: User;
  content: string;
  media: PostMedia[];
  category: 'general' | 'crop_advice' | 'livestock' | 'weather' | 'market' | 'equipment' | 'pest_disease';
  tags: string[];
  location?: {
    name: string;
    coordinates: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  isLiked: boolean;
  isSaved: boolean;
  isPinned: boolean;
  visibility: 'public' | 'followers' | 'community';
  urgency: 'normal' | 'urgent' | 'critical';
}

interface Comment {
  id: string;
  author: User;
  postId: string;
  parentId?: string;
  content: string;
  media?: PostMedia[];
  createdAt: Date;
  likes: number;
  replies: Comment[];
  isLiked: boolean;
  isExpertVerified: boolean;
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isJoined: boolean;
  isPrivate: boolean;
  moderators: User[];
}

const mockUser: User = {
  id: 'user-1',
  name: 'John Farmer',
  avatar: '/api/placeholder/32/32',
  location: 'Lagos, Nigeria',
  farmType: 'Mixed Farming',
  expertise: ['Crop Rotation', 'Organic Farming', 'Pest Control'],
  reputation: 850,
  verified: true
};

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: 'user-2',
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      location: 'Kano, Nigeria',
      farmType: 'Crop Farming',
      expertise: ['Maize', 'Rice', 'Irrigation'],
      reputation: 1200,
      verified: true
    },
    content: 'Just harvested my first batch of drought-resistant maize! The yield exceeded expectations by 30%. Happy to share seeds with fellow farmers in the community. #DroughtResistant #MaizeHarvest #SeedSharing',
    media: [
      {
        id: 'media-1',
        type: 'image',
        url: '/api/placeholder/600/400',
        caption: 'Drought-resistant maize harvest'
      }
    ],
    category: 'crop_advice',
    tags: ['maize', 'drought-resistant', 'harvest', 'seeds'],
    location: {
      name: 'Kano State',
      coordinates: [8.5200, 8.3200]
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 45,
    comments: 12,
    shares: 8,
    saved: 23,
    isLiked: false,
    isSaved: true,
    isPinned: false,
    visibility: 'public',
    urgency: 'normal'
  },
  {
    id: '2',
    author: {
      id: 'user-3',
      name: 'Dr. Michael Adebayo',
      avatar: '/api/placeholder/40/40',
      location: 'Ibadan, Nigeria',
      farmType: 'Research Station',
      expertise: ['Plant Pathology', 'Disease Control', 'Research'],
      reputation: 2500,
      verified: true
    },
    content: '🚨 URGENT: Fall Armyworm spotted in several maize farms across Oyo State. Early detection is crucial. Look for small holes in leaves and sawdust-like frass. Immediate action needed! Contact agricultural extension officers.',
    media: [
      {
        id: 'media-2',
        type: 'image',
        url: '/api/placeholder/600/400',
        caption: 'Fall Armyworm damage symptoms'
      }
    ],
    category: 'pest_disease',
    tags: ['fall-armyworm', 'maize', 'pest-alert', 'oyo-state'],
    location: {
      name: 'Oyo State',
      coordinates: [7.3775, 3.9470]
    },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    likes: 89,
    comments: 34,
    shares: 67,
    saved: 156,
    isLiked: true,
    isSaved: true,
    isPinned: true,
    visibility: 'public',
    urgency: 'critical'
  },
  {
    id: '3',
    author: {
      id: 'user-4',
      name: 'Amina Hassan',
      avatar: '/api/placeholder/40/40',
      location: 'Kaduna, Nigeria',
      farmType: 'Livestock',
      expertise: ['Cattle Breeding', 'Veterinary Care', 'Pasture Management'],
      reputation: 920,
      verified: false
    },
    content: 'Market prices for cattle have increased by 15% this week. Good time for those ready to sell. Also, sharing my feeding schedule that improved weight gain by 25%. Details in comments.',
    media: [],
    category: 'market',
    tags: ['cattle', 'market-prices', 'livestock', 'feeding'],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 28,
    comments: 9,
    shares: 15,
    saved: 42,
    isLiked: false,
    isSaved: false,
    isPinned: false,
    visibility: 'public',
    urgency: 'normal'
  }
];

const mockCommunities: CommunityGroup[] = [
  {
    id: 'comm-1',
    name: 'Maize Farmers Association',
    description: 'Connect with maize farmers across Nigeria',
    memberCount: 1250,
    category: 'Crop Farming',
    isJoined: true,
    isPrivate: false,
    moderators: []
  },
  {
    id: 'comm-2',
    name: 'Organic Farming Nigeria',
    description: 'Sustainable and organic farming practices',
    memberCount: 890,
    category: 'Sustainable Agriculture',
    isJoined: false,
    isPrivate: false,
    moderators: []
  },
  {
    id: 'comm-3',
    name: 'Young Farmers Network',
    description: 'Empowering the next generation of farmers',
    memberCount: 2100,
    category: 'General',
    isJoined: true,
    isPrivate: false,
    moderators: []
  }
];

export function FarmerSocialFeed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [communities, setCommunities] = useState<CommunityGroup[]>(mockCommunities);
  const [activeTab, setActiveTab] = useState('feed');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Post['category']>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [user] = useState<User>(mockUser);

  const categories = [
    { id: 'general', name: 'General Discussion', icon: MessageCircle },
    { id: 'crop_advice', name: 'Crop Advice', icon: Sprout },
    { id: 'livestock', name: 'Livestock', icon: Cow },
    { id: 'weather', name: 'Weather Updates', icon: CloudRain },
    { id: 'market', name: 'Market Info', icon: DollarSign },
    { id: 'equipment', name: 'Equipment & Tools', icon: Settings },
    { id: 'pest_disease', name: 'Pest & Disease', icon: AlertCircle }
  ];

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isSaved: !post.isSaved,
          saved: post.isSaved ? post.saved - 1 : post.saved + 1
        };
      }
      return post;
    }));
  };

  const handleShare = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));
    navigator.share && navigator.share({
      title: 'AgriNexus Post',
      text: 'Check out this farming tip!',
      url: `${window.location.origin}/post/${postId}`
    });
  };

  const handleJoinCommunity = (communityId: string) => {
    setCommunities(communities.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          isJoined: !community.isJoined,
          memberCount: community.isJoined 
            ? community.memberCount - 1 
            : community.memberCount + 1
        };
      }
      return community;
    }));
  };

  const createPost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: user,
      content: newPostContent,
      media: [],
      category: selectedCategory,
      tags: extractHashtags(newPostContent),
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      saved: 0,
      isLiked: false,
      isSaved: false,
      isPinned: false,
      visibility: 'public',
      urgency: 'normal'
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowCreatePost(false);
  };

  const extractHashtags = (text: string): string[] => {
    return text.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];
  };

  const getUrgencyColor = (urgency: Post['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : MessageCircle;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Community</h1>
        <p className="text-gray-600">Connect, learn, and grow with fellow farmers</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - User Profile & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        {user.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-sm text-gray-600">{user.location}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{user.reputation} reputation</span>
                    </div>
                    <p className="text-sm text-gray-600">{user.farmType}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Expertise</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.expertise.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={() => setShowCreatePost(true)}
                    className="w-full justify-start"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="w-4 h-4 mr-2" />
                    Share Photo
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Find Experts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {communities.filter(c => c.isJoined).slice(0, 3).map((community) => (
                      <div key={community.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{community.name}</p>
                          <p className="text-xs text-gray-600">{community.memberCount} members</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full text-sm" size="sm">
                      View All Communities
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Filter Bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search posts, farmers, topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select 
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Create Post Modal/Card */}
              {showCreatePost && (
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Create New Post</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowCreatePost(false)}
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.location}</p>
                      </div>
                    </div>
                    
                    <Textarea
                      placeholder="What's happening on your farm? Share tips, ask questions, or update the community..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={4}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <select 
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as Post['category'])}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-1" />
                          Photo
                        </Button>
                        <Button variant="outline" size="sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          Location
                        </Button>
                        <Button onClick={createPost} disabled={!newPostContent.trim()}>
                          Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts Feed */}
              <div className="space-y-6">
                {filteredPosts.map((post) => {
                  const CategoryIcon = getCategoryIcon(post.category);
                  
                  return (
                    <Card key={post.id} className={`${post.isPinned ? 'border-blue-300 bg-blue-50/20' : ''} ${post.urgency === 'critical' ? 'border-red-300' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{post.author.name}</h3>
                                {post.author.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                {post.isPinned && <Badge variant="secondary" className="text-xs">Pinned</Badge>}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{post.author.location}</span>
                                <span>•</span>
                                <span>{post.createdAt.toLocaleDateString()}</span>
                                {post.location && (
                                  <>
                                    <span>•</span>
                                    <MapPin className="w-3 h-3" />
                                    <span>{post.location.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getUrgencyColor(post.urgency)}>
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {post.urgency === 'critical' ? 'URGENT' : 
                               post.urgency === 'urgent' ? 'Important' : 
                               categories.find(c => c.id === post.category)?.name}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                          
                          {post.media.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {post.media.map((media) => (
                                <div key={media.id} className="relative rounded-lg overflow-hidden">
                                  {media.type === 'image' ? (
                                    <img
                                      src={media.url}
                                      alt={media.caption}
                                      className="w-full h-48 object-cover"
                                    />
                                  ) : media.type === 'video' ? (
                                    <video
                                      src={media.url}
                                      poster={media.thumbnail}
                                      className="w-full h-48 object-cover"
                                      controls
                                    />
                                  ) : (
                                    <div className="bg-gray-100 h-48 flex items-center justify-center">
                                      <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(post.id)}
                                className={post.isLiked ? 'text-red-500' : ''}
                              >
                                <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                                {post.likes}
                              </Button>
                              
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {post.comments}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(post.id)}
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                {post.shares}
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSave(post.id)}
                              className={post.isSaved ? 'text-blue-500' : ''}
                            >
                              <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar - Trending & Suggestions */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trending Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { tag: 'drought-resistant', posts: 45, trend: 'up' },
                      { tag: 'fall-armyworm', posts: 78, trend: 'up' },
                      { tag: 'market-prices', posts: 23, trend: 'stable' },
                      { tag: 'irrigation', posts: 34, trend: 'up' },
                      { tag: 'organic-farming', posts: 19, trend: 'down' }
                    ].map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">#{topic.tag}</p>
                          <p className="text-xs text-gray-600">{topic.posts} posts</p>
                        </div>
                        <TrendingUp className={`w-4 h-4 ${
                          topic.trend === 'up' ? 'text-green-500' : 
                          topic.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                        }`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Farmers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Dr. Fatima Ahmed', location: 'Abuja, Nigeria', expertise: 'Rice Specialist', reputation: 1800 },
                      { name: 'Peter Okafor', location: 'Enugu, Nigeria', expertise: 'Cassava Expert', reputation: 1200 },
                      { name: 'Aisha Muhammad', location: 'Kebbi, Nigeria', expertise: 'Irrigation Systems', reputation: 950 }
                    ].map((farmer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {farmer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{farmer.name}</p>
                            <p className="text-xs text-gray-600">{farmer.expertise}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Follow</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weather Alert</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CloudRain className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Rain Expected</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Heavy rainfall predicted for the next 3 days. Consider harvesting ready crops and protecting livestock.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="communities">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Card key={community.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{community.description}</p>
                    </div>
                    {community.isPrivate && <Badge variant="outline">Private</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Members</span>
                      <span className="font-medium">{community.memberCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category</span>
                      <Badge variant="secondary">{community.category}</Badge>
                    </div>
                    <Button
                      onClick={() => handleJoinCommunity(community.id)}
                      className="w-full"
                      variant={community.isJoined ? "outline" : "default"}
                    >
                      {community.isJoined ? 'Leave' : 'Join'} Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trending This Week</CardTitle>
                <p className="text-gray-600">Most engaging content in the farming community</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPosts.filter(post => post.likes > 40).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.author.name}</p>
                          <p className="text-sm text-gray-600 truncate max-w-md">{post.content.slice(0, 100)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="space-y-6">
            {posts.filter(post => post.isSaved).map((post) => {
              const CategoryIcon = getCategoryIcon(post.category);
              
              return (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{post.author.name}</h3>
                            {post.author.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{post.author.location}</span>
                            <span>•</span>
                            <span>{post.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={getUrgencyColor(post.urgency)}>
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        {categories.find(c => c.id === post.category)?.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-900 mb-4">{post.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                        <span>{post.shares} shares</span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(post.id)}
                        className="text-blue-500"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FarmerSocialFeed;