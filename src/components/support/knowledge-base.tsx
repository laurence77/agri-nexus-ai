import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Search,
  FileText,
  Video,
  Download,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Eye,
  ThumbsUp,
  Share2,
  Filter,
  Bookmark,
  Play,
  FileDown,
  Globe,
  Smartphone,
  Brain,
  Zap,
  TrendingUp,
  Settings,
  CreditCard,
  Users,
  Leaf
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  type: 'article' | 'video' | 'guide' | 'tutorial';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  views: number;
  likes: number;
  lastUpdated: string;
  author: string;
  tags: string[];
  featured: boolean;
  downloadable: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  articleCount: number;
  color: string;
}

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories: Category[] = [
    {
      id: 'all',
      name: 'All Categories',
      description: 'Browse all knowledge base articles',
      icon: <BookOpen className="w-5 h-5" />,
      articleCount: 156,
      color: 'blue'
    },
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Essential guides for new users',
      icon: <Leaf className="w-5 h-5" />,
      articleCount: 23,
      color: 'green'
    },
    {
      id: 'ai-features',
      name: 'AI Features',
      description: 'Understanding and using AI capabilities',
      icon: <Brain className="w-5 h-5" />,
      articleCount: 18,
      color: 'purple'
    },
    {
      id: 'farm-management',
      name: 'Farm Management',
      description: 'Managing crops, fields, and operations',
      icon: <TrendingUp className="w-5 h-5" />,
      articleCount: 34,
      color: 'emerald'
    },
    {
      id: 'sensors-iot',
      name: 'Sensors & IoT',
      description: 'Hardware setup and sensor management',
      icon: <Zap className="w-5 h-5" />,
      articleCount: 19,
      color: 'orange'
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      description: 'Buying, selling, and payments',
      icon: <CreditCard className="w-5 h-5" />,
      articleCount: 15,
      color: 'indigo'
    },
    {
      id: 'mobile-app',
      name: 'Mobile App',
      description: 'Using the mobile application',
      icon: <Smartphone className="w-5 h-5" />,
      articleCount: 12,
      color: 'pink'
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: <Settings className="w-5 h-5" />,
      articleCount: 21,
      color: 'red'
    },
    {
      id: 'community',
      name: 'Community',
      description: 'Cooperatives and farmer groups',
      icon: <Users className="w-5 h-5" />,
      articleCount: 14,
      color: 'cyan'
    }
  ];

  const articles: Article[] = [
    {
      id: '1',
      title: 'Complete Guide to Farm Profile Setup',
      description: 'Step-by-step instructions for creating and optimizing your farm profile for maximum AI accuracy.',
      content: 'Your farm profile is the foundation of your AgriNexus AI experience. This comprehensive guide will walk you through every step of setting up your profile for optimal results...',
      category: 'getting-started',
      type: 'guide',
      difficulty: 'beginner',
      readTime: 8,
      views: 2847,
      likes: 156,
      lastUpdated: '2024-01-28',
      author: 'AgriNexus Team',
      tags: ['setup', 'profile', 'beginner', 'foundation'],
      featured: true,
      downloadable: true
    },
    {
      id: '2',
      title: 'AI Disease Detection: Best Practices',
      description: 'Learn how to take optimal photos and interpret AI disease detection results for maximum accuracy.',
      content: 'Our AI disease detection system achieves 92% accuracy when used correctly. This guide covers photography techniques, lighting conditions, and interpretation of results...',
      category: 'ai-features',
      type: 'tutorial',
      difficulty: 'intermediate',
      readTime: 12,
      views: 1956,
      likes: 189,
      lastUpdated: '2024-01-25',
      author: 'Dr. Sarah Mwangi',
      tags: ['ai', 'disease', 'detection', 'photography'],
      featured: true,
      downloadable: false
    },
    {
      id: '3',
      title: 'IoT Sensor Installation Video Series',
      description: 'Complete video walkthrough of installing and configuring various IoT sensors for smart farming.',
      content: 'This video series covers everything from unboxing to configuration of soil moisture, temperature, and humidity sensors...',
      category: 'sensors-iot',
      type: 'video',
      difficulty: 'advanced',
      readTime: 25,
      views: 1234,
      likes: 98,
      lastUpdated: '2024-01-20',
      author: 'John Kimani',
      tags: ['sensors', 'iot', 'installation', 'video'],
      featured: false,
      downloadable: false
    },
    {
      id: '4',
      title: 'Marketplace Success: From Farm to Sale',
      description: 'Proven strategies for successful selling on the AgriNexus marketplace, including pricing and presentation.',
      content: 'Learn from top-selling farmers on our marketplace. This guide covers photography, pricing strategies, and building buyer trust...',
      category: 'marketplace',
      type: 'article',
      difficulty: 'intermediate',
      readTime: 15,
      views: 3421,
      likes: 267,
      lastUpdated: '2024-01-18',
      author: 'Grace Wanjiku',
      tags: ['marketplace', 'selling', 'pricing', 'success'],
      featured: true,
      downloadable: true
    },
    {
      id: '5',
      title: 'Mobile App Offline Features Guide',
      description: 'Comprehensive overview of features that work without internet connection and data synchronization.',
      content: 'The AgriNexus mobile app works seamlessly offline. This guide explains which features are available offline and how data sync works...',
      category: 'mobile-app',
      type: 'guide',
      difficulty: 'beginner',
      readTime: 6,
      views: 1567,
      likes: 134,
      lastUpdated: '2024-01-15',
      author: 'Mobile Team',
      tags: ['mobile', 'offline', 'sync', 'features'],
      featured: false,
      downloadable: false
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesType = selectedType === 'all' || article.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
  });

  const featuredArticles = articles.filter(article => article.featured);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'guide': return <BookOpen className="w-4 h-4" />;
      case 'tutorial': return <Play className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'info';
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || 'blue';
  };

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        {/* Article Header */}
        <div className="glass-card">
          <div className="flex items-start justify-between mb-6">
            <Button
              onClick={() => setSelectedArticle(null)}
              variant="outline"
              className="glass-button"
            >
              ← Back to Knowledge Base
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="glass-button">
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark
              </Button>
              <Button variant="outline" className="glass-button">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {selectedArticle.downloadable && (
                <Button variant="outline" className="glass-button">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Badge className={`glass-badge ${getDifficultyColor(selectedArticle.difficulty)}`}>
                {selectedArticle.difficulty}
              </Badge>
              <Badge className="glass-badge info">
                {getTypeIcon(selectedArticle.type)}
                <span className="ml-1">{selectedArticle.type}</span>
              </Badge>
              <span className="text-sm text-gray-600">
                {selectedArticle.readTime} min read
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{selectedArticle.title}</h1>
            <p className="text-xl text-gray-600">{selectedArticle.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>By {selectedArticle.author}</span>
                <span>•</span>
                <span>Updated {new Date(selectedArticle.lastUpdated).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{selectedArticle.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{selectedArticle.likes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="glass-card">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {selectedArticle.content}
            </p>
            
            {/* Placeholder for full content */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 italic">
                This would contain the full article content with formatted text, images, code blocks, and interactive elements.
              </p>
            </div>
          </div>

          {/* Article Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag, index) => (
                  <Badge key={index} className="glass-badge info text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Was this helpful?</span>
                <Button size="sm" className="glass-button">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Yes
                </Button>
                <Button size="sm" variant="outline" className="glass-button">
                  No
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Knowledge Base Header */}
      <div className="glass-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Knowledge Base</h2>
            <p className="text-sm text-gray-600">Comprehensive guides, tutorials, and documentation</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search articles, guides, and tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 w-full"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="glass-input"
            >
              <option value="all">All Types</option>
              <option value="article">Articles</option>
              <option value="guide">Guides</option>
              <option value="tutorial">Tutorials</option>
              <option value="video">Videos</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="glass-input"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <Button variant="outline" className="glass-button">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Featured Articles
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {featuredArticles.slice(0, 4).map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 bg-${getCategoryColor(article.category)}-100 rounded-lg flex items-center justify-center text-${getCategoryColor(article.category)}-600`}>
                    {getTypeIcon(article.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{article.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.description}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{article.readTime} min</span>
                      <span>•</span>
                      <span>{article.views.toLocaleString()} views</span>
                      <span>•</span>
                      <Badge className={`glass-badge ${getDifficultyColor(article.difficulty)} text-xs`}>
                        {article.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                    selectedCategory === category.id ? 'bg-white/30' : 'hover:bg-white/20'
                  }`}
                >
                  <div className={`w-8 h-8 bg-${category.color}-100 rounded-lg flex items-center justify-center text-${category.color}-600`}>
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-600">{category.articleCount} articles</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Articles</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Video Tutorials</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Downloads</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="lg:col-span-3">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <p className="text-sm text-gray-600">{filteredArticles.length} articles found</p>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No articles found</h4>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="p-6 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-${getCategoryColor(article.category)}-100 rounded-lg flex items-center justify-center text-${getCategoryColor(article.category)}-600 flex-shrink-0`}>
                        {getTypeIcon(article.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center space-x-2 ml-4">
                            {article.featured && <Star className="w-4 h-4 text-yellow-500" />}
                            {article.downloadable && <Download className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{article.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <Badge className={`glass-badge ${getDifficultyColor(article.difficulty)} text-xs`}>
                            {article.difficulty}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime} min read</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{article.likes}</span>
                          </div>
                          <span>•</span>
                          <span>Updated {new Date(article.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} className="glass-badge info text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge className="glass-badge info text-xs">
                              +{article.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;