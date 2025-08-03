import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Search,
  Filter,
  Plus,
  Pin,
  Clock,
  Eye,
  Star,
  CheckCircle,
  AlertCircle,
  Leaf,
  Brain,
  TrendingUp,
  Zap,
  Globe,
  Award,
  Calendar,
  MapPin,
  Tag
} from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
    verified: boolean;
    location: string;
    joinDate: string;
  };
  category: string;
  tags: string[];
  createdAt: string;
  lastActivity: string;
  views: number;
  replies: number;
  likes: number;
  solved: boolean;
  pinned: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Reply {
  id: string;
  postId: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
    verified: boolean;
  };
  createdAt: string;
  likes: number;
  helpful: boolean;
}

const CommunityForum = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showNewPost, setShowNewPost] = useState(false);

  const categories = [
    { id: 'all', name: 'All Topics', icon: <Users className="w-4 h-4" />, count: 1247 },
    { id: 'getting-started', name: 'Getting Started', icon: <Leaf className="w-4 h-4" />, count: 342 },
    { id: 'ai-features', name: 'AI & Smart Farming', icon: <Brain className="w-4 h-4" />, count: 189 },
    { id: 'crop-management', name: 'Crop Management', icon: <TrendingUp className="w-4 h-4" />, count: 456 },
    { id: 'sensors-iot', name: 'Sensors & IoT', icon: <Zap className="w-4 h-4" />, count: 123 },
    { id: 'marketplace', name: 'Marketplace', icon: <Globe className="w-4 h-4" />, count: 87 },
    { id: 'success-stories', name: 'Success Stories', icon: <Award className="w-4 h-4" />, count: 54 }
  ];

  const forumPosts: ForumPost[] = [
    {
      id: '1',
      title: 'How to improve maize yield using AI recommendations?',
      content: 'I\'ve been using AgriNexus AI for 3 months and wondering how to best utilize the AI recommendations for my 10-acre maize farm. What has worked for other farmers?',
      author: {
        name: 'John Mbeki',
        avatar: '/api/placeholder/40/40',
        reputation: 245,
        verified: true,
        location: 'Kiambu, Kenya',
        joinDate: '2023-08-15'
      },
      category: 'ai-features',
      tags: ['maize', 'ai', 'yield', 'recommendations'],
      createdAt: '2024-02-01T10:30:00Z',
      lastActivity: '2024-02-01T14:22:00Z',
      views: 127,
      replies: 8,
      likes: 15,
      solved: false,
      pinned: false,
      difficulty: 'intermediate'
    },
    {
      id: '2',
      title: 'Setting up soil moisture sensors - Complete guide',
      content: 'Here\'s my complete setup guide for IoT soil moisture sensors. This took me weeks to figure out, so sharing to help others avoid the same struggles.',
      author: {
        name: 'Sarah Mwangi',
        avatar: '/api/placeholder/40/40',
        reputation: 890,
        verified: true,
        location: 'Nyeri, Kenya',
        joinDate: '2023-03-22'
      },
      category: 'sensors-iot',
      tags: ['sensors', 'iot', 'soil', 'moisture', 'setup', 'guide'],
      createdAt: '2024-01-30T16:45:00Z',
      lastActivity: '2024-02-01T09:15:00Z',
      views: 342,
      replies: 23,
      likes: 67,
      solved: true,
      pinned: true,
      difficulty: 'advanced'
    },
    {
      id: '3',
      title: 'First month using AgriNexus - Amazing results!',
      content: 'Just wanted to share my experience after first month. My tomato yield increased by 22% and water usage dropped by 18%. Here\'s what I learned...',
      author: {
        name: 'Grace Wanjiku',
        avatar: '/api/placeholder/40/40',
        reputation: 156,
        verified: false,
        location: 'Nakuru, Kenya',
        joinDate: '2024-01-05'
      },
      category: 'success-stories',
      tags: ['success', 'tomatoes', 'yield', 'water-savings'],
      createdAt: '2024-01-28T11:20:00Z',
      lastActivity: '2024-01-31T15:33:00Z',
      views: 89,
      replies: 12,
      likes: 34,
      solved: false,
      pinned: false,
      difficulty: 'beginner'
    }
  ];

  const topContributors = [
    { name: 'Samuel Ochieng', reputation: 2456, posts: 89, helpful: 156, avatar: '/api/placeholder/32/32' },
    { name: 'Mary Nyong', reputation: 1893, posts: 67, helpful: 134, avatar: '/api/placeholder/32/32' },
    { name: 'James Kiprotich', reputation: 1456, posts: 45, helpful: 98, avatar: '/api/placeholder/32/32' },
    { name: 'Agnes Waweru', reputation: 1234, posts: 56, helpful: 87, avatar: '/api/placeholder/32/32' },
    { name: 'David Musyoka', reputation: 987, posts: 34, helpful: 76, avatar: '/api/placeholder/32/32' }
  ];

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6">
      {/* Forum Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Community Forum</h2>
              <p className="text-sm text-gray-600">Connect with fellow farmers and share knowledge</p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewPost(true)}
            className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="solved">Solved First</option>
                <option value="unanswered">Unanswered</option>
              </select>
              <Button variant="outline" className="glass-button">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`glass-button flex items-center space-x-2 ${
                  selectedCategory === category.id ? 'bg-white/30' : ''
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
                <Badge className="glass-badge info text-xs">{category.count}</Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="glass-card text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600">Try adjusting your search or browse different categories</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="glass-card hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="flex items-start space-x-4">
                  {/* Author Avatar */}
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full"
                  />

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {post.pinned && <Pin className="w-4 h-4 text-orange-500" />}
                        {post.solved && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      <Badge className={`glass-badge ${getDifficultyColor(post.difficulty)} text-xs`}>
                        {post.difficulty}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} className="glass-badge info text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 4 && (
                        <Badge className="glass-badge info text-xs">
                          +{post.tags.length - 4} more
                        </Badge>
                      )}
                    </div>

                    {/* Author Info and Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{post.author.name}</span>
                          {post.author.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}
                          <span>•</span>
                          <span>{post.author.reputation} rep</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{post.author.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(post.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replies}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Forum Stats */}
          <div className="glass-card">
            <h3 className="font-semibold text-gray-900 mb-4">Forum Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Members</span>
                <span className="font-medium">3,456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Solved Posts</span>
                <span className="font-medium">89%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Online Now</span>
                <span className="font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  127
                </span>
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="glass-card">
            <h3 className="font-semibold text-gray-900 mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {topContributors.map((contributor, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={contributor.avatar}
                      alt={contributor.name}
                      className="w-8 h-8 rounded-full"
                    />
                    {index < 3 && (
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{contributor.name}</p>
                    <p className="text-xs text-gray-600">{contributor.reputation} rep • {contributor.helpful} helpful</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">New post in AI Features</span>
                <span className="text-xs text-gray-500">5m ago</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Question solved in Sensors</span>
                <span className="text-xs text-gray-500">12m ago</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">New member joined</span>
                <span className="text-xs text-gray-500">18m ago</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Success story shared</span>
                <span className="text-xs text-gray-500">25m ago</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-card">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Button variant="outline" className="glass-button w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Forum Guidelines
              </Button>
              <Button variant="outline" className="glass-button w-full justify-start">
                <Star className="w-4 h-4 mr-2" />
                Featured Posts
              </Button>
              <Button variant="outline" className="glass-button w-full justify-start">
                <Award className="w-4 h-4 mr-2" />
                Achievements
              </Button>
              <Button variant="outline" className="glass-button w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;