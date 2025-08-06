import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  WhatsApp
} from 'lucide-react';

interface FarmProfile {
  id: string;
  farmName: string;
  ownerName: string;
  avatar: string;
  coverImage: string;
  location: {
    address: string;
    coordinates: [number, number];
    region: string;
    country: string;
  };
  description: string;
  establishedYear: number;
  farmType: 'crop' | 'livestock' | 'mixed' | 'aquaculture' | 'poultry';
  totalArea: number;
  certifications: Certification[];
  specialties: string[];
  products: Product[];
  achievements: Achievement[];
  socialMedia: SocialMedia;
  contact: ContactInfo;
  statistics: FarmStatistics;
  gallery: GalleryItem[];
  reviews: Review[];
  sustainabilityScore: number;
  isVerified: boolean;
  isPublic: boolean;
  qrCode: string;
  profileViews: number;
  followers: number;
  following: number;
  joinedDate: Date;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
  verified: boolean;
  logo?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
    unit: string;
  };
  availability: 'available' | 'seasonal' | 'out_of_stock';
  harvestSeason: string[];
  organicCertified: boolean;
  quantity?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: Date;
  category: 'production' | 'sustainability' | 'community' | 'innovation' | 'quality';
}

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
  website?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  businessHours?: string;
}

interface FarmStatistics {
  totalYield: number;
  yieldGrowth: number;
  sustainabilityRating: number;
  customerSatisfaction: number;
  yearsInBusiness: number;
  totalProducts: number;
  monthlyVisitors: number;
  repeatCustomers: number;
}

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption: string;
  category: 'crops' | 'livestock' | 'equipment' | 'facilities' | 'harvest' | 'team';
  uploadDate: Date;
  likes: number;
  views: number;
}

interface Review {
  id: string;
  reviewer: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  rating: number;
  comment: string;
  date: Date;
  productId?: string;
  helpful: number;
}

const mockFarmProfile: FarmProfile = {
  id: 'farm-001',
  farmName: 'Green Valley Organic Farm',
  ownerName: 'John Adebayo',
  avatar: '/api/placeholder/120/120',
  coverImage: '/api/placeholder/1200/400',
  location: {
    address: '123 Farm Road, Ibadan, Oyo State',
    coordinates: [7.3775, 3.9470],
    region: 'Southwest Nigeria',
    country: 'Nigeria'
  },
  description: 'A 50-hectare organic farm specializing in sustainable crop production and livestock rearing. We pride ourselves on environmentally friendly practices and high-quality produce that nourishes both people and the planet.',
  establishedYear: 2015,
  farmType: 'mixed',
  totalArea: 50,
  certifications: [
    {
      id: 'cert-1',
      name: 'Organic Certification',
      issuer: 'Nigeria Organic Agriculture Network',
      issueDate: new Date('2020-03-15'),
      expiryDate: new Date('2025-03-15'),
      verified: true,
      logo: '/api/placeholder/40/40'
    },
    {
      id: 'cert-2',
      name: 'Good Agricultural Practice (GAP)',
      issuer: 'Federal Ministry of Agriculture',
      issueDate: new Date('2021-06-20'),
      verified: true,
      logo: '/api/placeholder/40/40'
    }
  ],
  specialties: ['Organic Vegetables', 'Free-Range Poultry', 'Sustainable Farming', 'Crop Rotation'],
  products: [
    {
      id: 'prod-1',
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      description: 'Fresh, juicy organic tomatoes grown without pesticides',
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
      priceRange: { min: 200, max: 350, currency: 'NGN', unit: 'kg' },
      availability: 'available',
      harvestSeason: ['March-May', 'October-December'],
      organicCertified: true,
      quantity: 500
    },
    {
      id: 'prod-2',
      name: 'Free-Range Eggs',
      category: 'Poultry',
      description: 'Fresh eggs from free-range chickens',
      images: ['/api/placeholder/300/200'],
      priceRange: { min: 50, max: 70, currency: 'NGN', unit: 'piece' },
      availability: 'available',
      harvestSeason: ['Year-round'],
      organicCertified: true,
      quantity: 2000
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'Top Organic Producer 2023',
      description: 'Recognized as the leading organic producer in Oyo State',
      icon: '🏆',
      earnedDate: new Date('2023-12-01'),
      category: 'production'
    },
    {
      id: 'ach-2',
      title: 'Sustainability Champion',
      description: 'Achieved 95% sustainability score through eco-friendly practices',
      icon: '🌱',
      earnedDate: new Date('2023-08-15'),
      category: 'sustainability'
    }
  ],
  socialMedia: {
    facebook: 'https://facebook.com/greenvalleyfarm',
    instagram: 'https://instagram.com/greenvalleyfarm',
    whatsapp: '+2348012345678',
    website: 'https://greenvalleyfarm.com'
  },
  contact: {
    email: 'info@greenvalleyfarm.com',
    phone: '+234-801-234-5678',
    whatsapp: '+2348012345678',
    website: 'https://greenvalleyfarm.com',
    businessHours: 'Mon-Sat: 8:00 AM - 6:00 PM'
  },
  statistics: {
    totalYield: 1250,
    yieldGrowth: 25,
    sustainabilityRating: 95,
    customerSatisfaction: 4.8,
    yearsInBusiness: 9,
    totalProducts: 15,
    monthlyVisitors: 340,
    repeatCustomers: 85
  },
  gallery: [
    {
      id: 'gal-1',
      type: 'image',
      url: '/api/placeholder/400/300',
      caption: 'Fresh tomato harvest',
      category: 'crops',
      uploadDate: new Date('2024-01-15'),
      likes: 45,
      views: 320
    },
    {
      id: 'gal-2',
      type: 'image',
      url: '/api/placeholder/400/300',
      caption: 'Free-range chickens',
      category: 'livestock',
      uploadDate: new Date('2024-01-10'),
      likes: 38,
      views: 280
    }
  ],
  reviews: [
    {
      id: 'rev-1',
      reviewer: { name: 'Fatima Ahmed', avatar: '/api/placeholder/32/32', verified: true },
      rating: 5,
      comment: 'Amazing quality organic produce! The tomatoes are the best I\'ve ever tasted.',
      date: new Date('2024-01-20'),
      helpful: 12
    },
    {
      id: 'rev-2',
      reviewer: { name: 'Michael Johnson', verified: false },
      rating: 4,
      comment: 'Great farm with sustainable practices. Highly recommend their eggs.',
      date: new Date('2024-01-18'),
      helpful: 8
    }
  ],
  sustainabilityScore: 95,
  isVerified: true,
  isPublic: true,
  qrCode: 'farm-001-qr-code',
  profileViews: 1250,
  followers: 340,
  following: 120,
  joinedDate: new Date('2020-01-15')
};

export function DigitalFarmProfile() {
  const [profile, setProfile] = useState<FarmProfile>(mockFarmProfile);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('all');
  const [showContact, setShowContact] = useState(false);

  const farmTypeIcons = {
    crop: Sprout,
    livestock: Cow,
    mixed: Tractor,
    aquaculture: CloudRain,
    poultry: Cow
  };

  const categoryColors = {
    production: 'bg-blue-100 text-blue-800',
    sustainability: 'bg-green-100 text-green-800',
    community: 'bg-purple-100 text-purple-800',
    innovation: 'bg-orange-100 text-orange-800',
    quality: 'bg-yellow-100 text-yellow-800'
  };

  const FarmTypeIcon = farmTypeIcons[profile.farmType];

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/farm/${profile.id}`);
    alert('Profile link copied to clipboard!');
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.farmName,
        text: profile.description,
        url: `${window.location.origin}/farm/${profile.id}`
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredGallery = selectedGalleryCategory === 'all' 
    ? profile.gallery 
    : profile.gallery.filter(item => item.category === selectedGalleryCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image & Header */}
      <div className="relative">
        <div 
          className="h-64 bg-cover bg-center cover-image"
          style={{ '--cover-image': `url(${profile.coverImage})` } as React.CSSProperties}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleShareProfile}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button variant="secondary" size="sm">
              <QrCode className="w-4 h-4 mr-1" />
              QR Code
            </Button>
            {isEditing && (
              <Button variant="secondary" size="sm">
                <Camera className="w-4 h-4 mr-1" />
                Change Cover
              </Button>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-16 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profile.farmName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="sm" 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{profile.farmName}</h1>
                      {profile.isVerified && <Verified className="w-6 h-6 text-blue-500" />}
                      <Badge className="bg-green-600 text-white">
                        <FarmTypeIcon className="w-3 h-3 mr-1" />
                        {profile.farmType.charAt(0).toUpperCase() + profile.farmType.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-white/90 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location.region}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Est. {profile.establishedYear}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sprout className="w-4 h-4" />
                        <span>{profile.totalArea} hectares</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-white/80">
                      <span><strong>{profile.followers}</strong> Followers</span>
                      <span><strong>{profile.following}</strong> Following</span>
                      <span><strong>{profile.profileViews}</strong> Views</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="secondary">
                      <Heart className="w-4 h-4 mr-1" />
                      Follow
                    </Button>
                    <Button variant="secondary" onClick={() => setShowContact(true)}>
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
                      <Edit3 className="w-4 h-4 mr-1" />
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {profile.farmName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={profile.description}
                        onChange={(e) => setProfile({...profile, description: e.target.value})}
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Specialties & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          <Leaf className="w-3 h-3 mr-1" />
                          {specialty}
                        </Badge>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Settings className="w-3 h-3 mr-1" />
                          Edit Specialties
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Achievements & Awards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.achievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={categoryColors[achievement.category]}>
                                {achievement.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {achievement.earnedDate.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Farm Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Yield (tons)</span>
                      <span className="font-semibold">{profile.statistics.totalYield}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Yield Growth</span>
                      <span className="font-semibold text-green-600">+{profile.statistics.yieldGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer Rating</span>
                      <div className="flex items-center gap-1">
                        {renderStars(Math.floor(profile.statistics.customerSatisfaction))}
                        <span className="text-sm font-semibold ml-1">
                          {profile.statistics.customerSatisfaction}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Sustainability Score</span>
                        <span className="font-semibold">{profile.statistics.sustainabilityRating}%</span>
                      </div>
                      <Progress value={profile.statistics.sustainabilityRating} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{profile.location.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{profile.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{profile.contact.email}</span>
                    </div>
                    {profile.contact.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a 
                          href={profile.contact.website} 
                          className="text-sm text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    {profile.contact.businessHours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{profile.contact.businessHours}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-2">Follow us on:</p>
                      <div className="flex gap-2">
                        {profile.socialMedia.facebook && (
                          <Button size="sm" variant="outline" className="p-2">
                            <Facebook className="w-3 h-3" />
                          </Button>
                        )}
                        {profile.socialMedia.instagram && (
                          <Button size="sm" variant="outline" className="p-2">
                            <Instagram className="w-3 h-3" />
                          </Button>
                        )}
                        {profile.socialMedia.twitter && (
                          <Button size="sm" variant="outline" className="p-2">
                            <Twitter className="w-3 h-3" />
                          </Button>
                        )}
                        {profile.socialMedia.whatsapp && (
                          <Button size="sm" variant="outline" className="p-2">
                            <WhatsApp className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleCopyProfileLink}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Profile Link
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Download Profile PDF
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR Code
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative h-48 bg-cover bg-center product-image" style={{'--product-image': `url(${product.images[0]})`} as React.CSSProperties}>
                    <div className="absolute top-2 right-2">
                      <Badge className={product.availability === 'available' ? 'bg-green-600' : 'bg-orange-600'}>
                        {product.availability.replace('_', ' ')}
                      </Badge>
                    </div>
                    {product.organicCertified && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Leaf className="w-3 h-3 mr-1" />
                          Organic
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      
                      <p className="text-sm text-gray-700">{product.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-bold">
                            ₦{product.priceRange.min} - ₦{product.priceRange.max}
                          </span>
                          <span className="text-sm text-gray-600">/{product.priceRange.unit}</span>
                        </div>
                        {product.quantity && (
                          <Badge variant="outline">
                            {product.quantity} {product.priceRange.unit} available
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Inquire
                        </Button>
                        <Button size="sm" className="flex-1">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {isEditing && (
                <Card className="border-2 border-dashed border-gray-300 flex items-center justify-center h-64">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {['all', 'crops', 'livestock', 'equipment', 'facilities', 'harvest', 'team'].map((category) => (
                    <Button
                      key={category}
                      variant={selectedGalleryCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedGalleryCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
                
                {isEditing && (
                  <Button>
                    <Camera className="w-4 h-4 mr-2" />
                    Add Photos
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGallery.map((item) => (
                  <Card key={item.id} className="overflow-hidden group cursor-pointer">
                    <div className="relative">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.caption}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="relative">
                          <img
                            src={item.thumbnail || item.url}
                            alt={item.caption}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <Button size="sm" variant="secondary">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-sm font-medium truncate">{item.caption}</p>
                          <div className="flex items-center justify-between text-white/80 text-xs">
                            <span>{item.uploadDate.toLocaleDateString()}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {item.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {item.views}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.certifications.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {cert.logo && (
                        <img src={cert.logo} alt={cert.issuer} className="w-12 h-12 object-contain" />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{cert.name}</h3>
                          {cert.verified && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{cert.issuer}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Issue Date:</span>
                            <span>{cert.issueDate.toLocaleDateString()}</span>
                          </div>
                          {cert.expiryDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expiry Date:</span>
                              <span className={cert.expiryDate < new Date() ? 'text-red-600' : ''}>
                                {cert.expiryDate.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {cert.certificateUrl && (
                          <Button variant="outline" size="sm" className="mt-3">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {isEditing && (
                <Card className="border-2 border-dashed border-gray-300 flex items-center justify-center min-h-40">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Customer Reviews</CardTitle>
                    <div className="flex items-center gap-2">
                      {renderStars(Math.floor(profile.statistics.customerSatisfaction))}
                      <span className="text-lg font-semibold">{profile.statistics.customerSatisfaction}</span>
                      <span className="text-gray-600">({profile.reviews.length} reviews)</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.reviewer.avatar} />
                            <AvatarFallback>
                              {review.reviewer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.reviewer.name}</span>
                              {review.reviewer.verified && (
                                <Badge variant="outline" className="text-xs">Verified</Badge>
                              )}
                              <span className="text-gray-500 text-sm">{review.date.toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(review.rating)}
                            </div>
                            
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <button className="flex items-center gap-1 hover:text-blue-600">
                                <ThumbsUp className="w-3 h-3" />
                                Helpful ({review.helpful})
                              </button>
                              <button className="hover:text-blue-600">Reply</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Profile Views</p>
                      <p className="text-2xl font-bold">{profile.profileViews}</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">New Followers</p>
                      <p className="text-2xl font-bold">23</p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+8% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Product Inquiries</p>
                      <p className="text-2xl font-bold">45</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+25% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Engagement Rate</p>
                      <p className="text-2xl font-bold">8.2%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+3% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DigitalFarmProfile;