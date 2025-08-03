// Core AgriNexus AI Types

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
  fieldId: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Sensor {
  id: string;
  name: string;
  type: 'soil_moisture' | 'soil_ph' | 'soil_temperature' | 'air_temperature' | 'humidity' | 'rainfall' | 'wind_speed' | 'light_intensity';
  fieldId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  batteryLevel?: number;
  lastReading?: Date;
  alertThresholds: {
    min?: number;
    max?: number;
  };
}

export interface Field {
  id: string;
  name: string;
  farmId: string;
  area: number; // in acres
  coordinates: {
    lat: number;
    lng: number;
  }[];
  soilType: string;
  currentCrop?: Crop;
  plantingDate?: Date;
  expectedHarvestDate?: Date;
  irrigationType: 'drip' | 'sprinkler' | 'flood' | 'manual';
  sensors: Sensor[];
}

export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  totalArea: number; // in acres
  fields: Field[];
  establishedDate: Date;
  farmType: 'crop' | 'livestock' | 'mixed' | 'organic' | 'greenhouse';
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  yieldExpected: number;
  yieldActual?: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'tractor' | 'harvester' | 'planter' | 'sprayer' | 'irrigation' | 'drone';
  model: string;
  year: number;
  status: 'operational' | 'maintenance' | 'repair' | 'retired';
  location?: {
    lat: number;
    lng: number;
  };
  maintenanceSchedule: MaintenanceRecord[];
  fuelConsumption?: number;
  operatingHours: number;
  assignedField?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost?: number;
  technician?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
}

export interface WeatherData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  conditions: string;
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  date: Date;
  temperatureHigh: number;
  temperatureLow: number;
  humidity: number;
  precipitationChance: number;
  precipitationAmount: number;
  windSpeed: number;
  conditions: string;
}

export interface IrrigationEvent {
  id: string;
  fieldId: string;
  timestamp: Date;
  duration: number; // in minutes
  waterAmount: number; // in gallons
  type: 'manual' | 'scheduled' | 'automatic';
  triggeredBy?: string; // sensor reading, weather, manual
  efficiency: number; // percentage
}

export interface FinancialRecord {
  id: string;
  farmId: string;
  fieldId?: string;
  type: 'income' | 'expense';
  category: 'seeds' | 'fertilizer' | 'pesticide' | 'fuel' | 'labor' | 'equipment' | 'harvest_sale' | 'other';
  amount: number;
  description: string;
  date: Date;
  season: string;
  crop?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'seed' | 'fertilizer' | 'pesticide' | 'herbicide' | 'equipment' | 'tool';
  quantity: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  purchaseDate: Date;
  expirationDate?: Date;
  location: string;
  minStockLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

export interface Alert {
  id: string;
  type: 'sensor' | 'weather' | 'equipment' | 'crop' | 'financial' | 'inventory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  farmId: string;
  fieldId?: string;
  entityId?: string; // sensor, equipment, etc.
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'planting' | 'irrigation' | 'fertilizing' | 'pest_control' | 'harvesting' | 'maintenance' | 'monitoring';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  farmId: string;
  fieldId?: string;
  scheduledDate: Date;
  completedDate?: Date;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  dependencies?: string[]; // other task IDs
}

export interface YieldRecord {
  id: string;
  fieldId: string;
  cropId: string;
  harvestDate: Date;
  actualYield: number;
  expectedYield: number;
  quality: 'premium' | 'standard' | 'low';
  moistureContent: number;
  pricePerUnit: number;
  totalRevenue: number;
  notes?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface SensorChartData {
  sensorId: string;
  sensorName: string;
  data: ChartDataPoint[];
  unit: string;
  color: string;
}

// Dashboard Metrics
export interface DashboardMetrics {
  totalFarms: number;
  totalFields: number;
  activeSensors: number;
  criticalAlerts: number;
  todayTasks: number;
  weeklyRevenue: number;
  waterUsage: number;
  equipmentUtilization: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
}