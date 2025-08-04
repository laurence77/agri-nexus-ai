// Farm Visit Scheduling Components
// Agronomist visits, calendar integration, visit logging with photos

export { VisitScheduler } from './VisitScheduler';
export { CalendarView } from './CalendarView';
export { VisitLogger } from './VisitLogger';
export { AgronomistDirectory } from './AgronomistDirectory';
export { VisitReports } from './VisitReports';
export { VisitNotifications } from './VisitNotifications';

// Re-export scheduling service types for convenience
export type {
  FarmVisit,
  Agronomist,
  VisitReport,
  VisitPhoto,
  VisitRecommendation,
  CalendarEvent
} from '@/services/scheduling/visit-service';

export type {
  NotificationPreference,
  ReminderSettings,
  AvailabilitySlot
} from '@/services/scheduling/notification-service';

// Scheduling Component metadata
export const SCHEDULING_COMPONENTS_METADATA = {
  visitScheduler: {
    title: 'Visit Scheduler',
    description: 'Comprehensive farm visit scheduling system with agronomist matching and calendar integration',
    features: [
      'Smart agronomist matching based on expertise and location',
      'Real-time availability checking and booking',
      'Integrated calendar with conflict detection',
      'Automated reminder system via SMS and email',
      'Weather-aware scheduling with automatic rescheduling',
      'Multi-language support for diverse user base'
    ],
    technologies: ['Calendar APIs', 'Geolocation Services', 'Weather APIs', 'SMS/Email Integration']
  },
  calendarView: {
    title: 'Calendar View',
    description: 'Interactive calendar interface for managing farm visits and agricultural activities',
    features: [
      'Monthly, weekly, and daily calendar views',
      'Drag-and-drop visit rescheduling',
      'Color-coded visit types and priorities',
      'Integration with external calendar systems',
      'Conflict detection and resolution suggestions',
      'Seasonal activity planning and tracking'
    ],
    technologies: ['Calendar Libraries', 'Drag & Drop APIs', 'External Calendar Sync', 'Date Management']
  },
  visitLogger: {
    title: 'Visit Logger',
    description: 'Mobile-first visit documentation with photo capture and recommendation tracking',
    features: [
      'Photo capture with GPS tagging and timestamps',
      'Voice-to-text report generation',
      'Standardized assessment forms and checklists',
      'Real-time cloud synchronization',
      'Offline capability for remote areas',
      'Digital signature capture for visit confirmation'
    ],
    technologies: ['Camera APIs', 'GPS Services', 'Voice Recognition', 'Offline Storage']
  },
  agronomistDirectory: {
    title: 'Agronomist Directory',
    description: 'Directory of verified agricultural experts with specializations and availability',
    features: [
      'Comprehensive agronomist profiles with credentials',
      'Specialization matching (crops, pests, soil, irrigation)',
      'Rating and review system from farmers',
      'Real-time availability and scheduling',
      'Travel cost calculation and optimization',
      'Multi-language communication support'
    ],
    technologies: ['Profile Management', 'Matching Algorithms', 'Review Systems', 'Cost Optimization']
  }
} as const;

// Visit Types and Priorities
export const VISIT_TYPES = {
  consultation: {
    id: 'consultation',
    name: 'General Consultation',
    description: 'Routine farm consultation and advice',
    icon: '💬',
    color: 'text-blue-400',
    duration: 60, // minutes
    priority: 'medium'
  },
  pest_control: {
    id: 'pest_control',
    name: 'Pest & Disease Control',
    description: 'Pest identification and treatment recommendations',
    icon: '🐛',
    color: 'text-red-400',
    duration: 90,
    priority: 'high'
  },
  soil_testing: {
    id: 'soil_testing',
    name: 'Soil Testing & Analysis',
    description: 'Soil health assessment and fertility recommendations',
    icon: '🌱',
    color: 'text-green-400',
    duration: 120,
    priority: 'medium'
  },
  irrigation: {
    id: 'irrigation',
    name: 'Irrigation System',
    description: 'Water management and irrigation optimization',
    icon: '💧',
    color: 'text-cyan-400',
    duration: 90,
    priority: 'medium'
  },
  harvest: {
    id: 'harvest',
    name: 'Harvest Planning',
    description: 'Harvest timing and post-harvest handling',
    icon: '🌾',
    color: 'text-yellow-400',
    duration: 75,
    priority: 'high'
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Response',
    description: 'Urgent agricultural emergency response',
    icon: '🚨',
    color: 'text-red-500',
    duration: 60,
    priority: 'urgent'
  },
  training: {
    id: 'training',
    name: 'Training Session',
    description: 'Farmer education and skill development',
    icon: '📚',
    color: 'text-purple-400',
    duration: 180,
    priority: 'medium'
  },
  certification: {
    id: 'certification',
    name: 'Certification Audit',
    description: 'Organic or quality certification assessment',
    icon: '🏆',
    color: 'text-gold-400',
    duration: 240,
    priority: 'high'
  }
} as const;

// Visit Status Constants
export const VISIT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
  NO_SHOW: 'no_show'
} as const;

export type VisitStatus = typeof VISIT_STATUS[keyof typeof VISIT_STATUS];

// Visit Priority Constants
export const VISIT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type VisitPriority = typeof VISIT_PRIORITY[keyof typeof VISIT_PRIORITY];

// Agronomist Specializations
export const SPECIALIZATIONS = {
  crop_production: {
    id: 'crop_production',
    name: 'Crop Production',
    description: 'General crop cultivation and management',
    icon: '🌾',
    color: 'text-green-400'
  },
  pest_management: {
    id: 'pest_management',
    name: 'Pest Management',
    description: 'Integrated pest and disease management',
    icon: '🛡️',
    color: 'text-red-400'
  },
  soil_science: {
    id: 'soil_science',
    name: 'Soil Science',
    description: 'Soil health, fertility, and conservation',
    icon: '🌱',
    color: 'text-brown-400'
  },
  irrigation: {
    id: 'irrigation',
    name: 'Irrigation Systems',
    description: 'Water management and irrigation design',
    icon: '💧',
    color: 'text-blue-400'
  },
  organic_farming: {
    id: 'organic_farming',
    name: 'Organic Farming',
    description: 'Organic production and certification',
    icon: '🍃',
    color: 'text-green-500'
  },
  horticulture: {
    id: 'horticulture',
    name: 'Horticulture',
    description: 'Fruit and vegetable production',
    icon: '🍅',
    color: 'text-red-500'
  },
  livestock: {
    id: 'livestock',
    name: 'Livestock Integration',
    description: 'Mixed farming and livestock management',
    icon: '🐄',
    color: 'text-purple-400'
  },
  agribusiness: {
    id: 'agribusiness',
    name: 'Agribusiness',
    description: 'Farm business and market linkages',
    icon: '📈',
    color: 'text-yellow-400'
  }
} as const;

// Scheduling utility functions
export const schedulingUtils = {
  /**
   * Calculate travel time between locations
   */
  calculateTravelTime: (fromCoords: { lat: number; lng: number }, toCoords: { lat: number; lng: number }): number => {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = (toCoords.lat - fromCoords.lat) * Math.PI / 180;
    const dLng = (toCoords.lng - fromCoords.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(fromCoords.lat * Math.PI / 180) * Math.cos(toCoords.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    // Assume average speed of 40 km/h for rural areas
    return Math.ceil(distance / 40 * 60); // Return time in minutes
  },

  /**
   * Calculate travel cost based on distance
   */
  calculateTravelCost: (distance: number, ratePerKm: number = 50): number => {
    // Default rate of 50 KES per km
    return Math.round(distance * ratePerKm);
  },

  /**
   * Check if time slots overlap
   */
  checkTimeOverlap: (slot1: { start: Date; end: Date }, slot2: { start: Date; end: Date }): boolean => {
    return slot1.start < slot2.end && slot2.start < slot1.end;
  },

  /**
   * Generate available time slots
   */
  generateTimeSlots: (
    date: Date, 
    workingHours: { start: string; end: string }, 
    duration: number, 
    existingBookings: { start: Date; end: Date }[] = []
  ): { start: Date; end: Date }[] => {
    const slots: { start: Date; end: Date }[] = [];
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    
    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    let currentTime = new Date(startTime);
    
    while (currentTime.getTime() + (duration * 60000) <= endTime.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + (duration * 60000));
      const slot = { start: new Date(currentTime), end: slotEnd };
      
      // Check if slot conflicts with existing bookings
      const hasConflict = existingBookings.some(booking => 
        schedulingUtils.checkTimeOverlap(slot, booking)
      );
      
      if (!hasConflict) {
        slots.push(slot);
      }
      
      // Move to next 30-minute slot
      currentTime.setTime(currentTime.getTime() + (30 * 60000));
    }
    
    return slots;
  },

  /**
   * Format duration in human-readable format
   */
  formatDuration: (minutes: number): string => {
    if (minutes < 60) return `${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    
    return `${hours}h ${remainingMinutes}m`;
  },

  /**
   * Get visit type information
   */
  getVisitTypeInfo: (typeId: string) => {
    return VISIT_TYPES[typeId as keyof typeof VISIT_TYPES] || {
      icon: '📅',
      color: 'text-gray-400',
      name: 'General Visit'
    };
  },

  /**
   * Get visit status color
   */
  getVisitStatusColor: (status: VisitStatus): string => {
    switch (status) {
      case VISIT_STATUS.COMPLETED:
        return 'text-green-400 bg-green-400/20';
      case VISIT_STATUS.IN_PROGRESS:
        return 'text-blue-400 bg-blue-400/20';
      case VISIT_STATUS.CONFIRMED:
        return 'text-yellow-400 bg-yellow-400/20';
      case VISIT_STATUS.SCHEDULED:
        return 'text-purple-400 bg-purple-400/20';
      case VISIT_STATUS.CANCELLED:
      case VISIT_STATUS.NO_SHOW:
        return 'text-red-400 bg-red-400/20';
      case VISIT_STATUS.RESCHEDULED:
        return 'text-orange-400 bg-orange-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  },

  /**
   * Get priority color
   */
  getPriorityColor: (priority: VisitPriority): string => {
    switch (priority) {
      case VISIT_PRIORITY.URGENT:
        return 'text-red-500 bg-red-500/20';
      case VISIT_PRIORITY.HIGH:
        return 'text-red-400 bg-red-400/20';
      case VISIT_PRIORITY.MEDIUM:
        return 'text-yellow-400 bg-yellow-400/20';
      case VISIT_PRIORITY.LOW:
        return 'text-green-400 bg-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  },

  /**
   * Check if visit can be rescheduled
   */
  canReschedule: (visit: any, currentTime: Date = new Date()): boolean => {
    const visitTime = new Date(visit.scheduledDate);
    const timeDiff = visitTime.getTime() - currentTime.getTime();
    const hoursUntilVisit = timeDiff / (1000 * 60 * 60);
    
    // Can reschedule if more than 2 hours before visit and not completed/cancelled
    return hoursUntilVisit > 2 && 
           ![VISIT_STATUS.COMPLETED, VISIT_STATUS.CANCELLED, VISIT_STATUS.NO_SHOW].includes(visit.status);
  },

  /**
   * Generate visit reference number
   */
  generateVisitRef: (farmId: string, agronomistId: string): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const farmCode = farmId.slice(-4).toUpperCase();
    const agronCode = agronomistId.slice(-4).toUpperCase();
    return `VIS-${farmCode}-${agronCode}-${timestamp}`;
  },

  /**
   * Calculate optimal visit route for multiple farms
   */
  optimizeRoute: (visits: any[], baseLocation: { lat: number; lng: number }): any[] => {
    if (visits.length <= 1) return visits;
    
    // Simple nearest neighbor algorithm for route optimization
    const optimized = [];
    let currentLocation = baseLocation;
    let remaining = [...visits];
    
    while (remaining.length > 0) {
      let nearestIndex = 0;
      let shortestDistance = Infinity;
      
      remaining.forEach((visit, index) => {
        const distance = schedulingUtils.calculateTravelTime(currentLocation, visit.farm.coordinates);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestIndex = index;
        }
      });
      
      const nextVisit = remaining.splice(nearestIndex, 1)[0];
      optimized.push({
        ...nextVisit,
        travelTime: shortestDistance,
        travelDistance: shortestDistance * 40 / 60 // Convert minutes to km
      });
      
      currentLocation = nextVisit.farm.coordinates;
    }
    
    return optimized;
  },

  /**
   * Check weather suitability for visit
   */
  isWeatherSuitable: (weatherData: any, visitType: string): boolean => {
    const { temperature, humidity, precipitation, windSpeed } = weatherData;
    
    // Different visit types have different weather requirements
    switch (visitType) {
      case 'soil_testing':
        // Soil testing requires dry conditions
        return precipitation < 5; // mm
      
      case 'pest_control':
        // Pest control spraying requires low wind and no rain
        return precipitation < 1 && windSpeed < 15; // km/h
      
      case 'irrigation':
        // Irrigation system work can be done in most conditions
        return precipitation < 20 && windSpeed < 25;
      
      case 'emergency':
        // Emergency visits proceed regardless of weather
        return true;
      
      default:
        // General visits avoid heavy rain and extreme temperatures
        return precipitation < 10 && temperature > 10 && temperature < 40;
    }
  },

  /**
   * Generate reminder schedule
   */
  generateReminders: (visitDate: Date): Date[] => {
    const reminders: Date[] = [];
    const visitTime = visitDate.getTime();
    
    // 1 week before
    reminders.push(new Date(visitTime - (7 * 24 * 60 * 60 * 1000)));
    
    // 1 day before
    reminders.push(new Date(visitTime - (24 * 60 * 60 * 1000)));
    
    // 2 hours before
    reminders.push(new Date(visitTime - (2 * 60 * 60 * 1000)));
    
    // Filter out past reminders
    const now = new Date();
    return reminders.filter(reminder => reminder > now);
  },

  /**
   * Calculate visit score based on multiple factors
   */
  calculateVisitScore: (visit: any, agronomist: any): number => {
    let score = 0;
    
    // Specialization match (0-40 points)
    if (agronomist.specializations.includes(visit.type)) {
      score += 40;
    } else if (agronomist.specializations.includes('crop_production')) {
      score += 20; // General crop production can handle most visits
    }
    
    // Distance factor (0-30 points, closer is better)
    const travelTime = schedulingUtils.calculateTravelTime(
      agronomist.location.coordinates,
      visit.farm.coordinates
    );
    const distanceScore = Math.max(0, 30 - (travelTime / 10)); // Reduce score by travel time
    score += distanceScore;
    
    // Agronomist rating (0-20 points)
    score += (agronomist.rating / 5) * 20;
    
    // Availability (0-10 points)
    if (agronomist.isAvailable) score += 10;
    
    return Math.round(score);
  }
};

// Default export for convenient imports
export default {
  VisitScheduler,
  CalendarView,
  VisitLogger,
  AgronomistDirectory,
  VisitReports,
  VisitNotifications,
  SCHEDULING_COMPONENTS_METADATA,
  VISIT_TYPES,
  VISIT_STATUS,
  VISIT_PRIORITY,
  SPECIALIZATIONS,
  schedulingUtils
};