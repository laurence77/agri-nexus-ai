'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { supabase } from '@/lib/supabase';
import { 
  GlassCard, 
  WeatherWidget, 
  MetricCard,
  CropMonitoringCard,
  AlertsPanel 
} from '@/components/glass';
import { 
  Farm, 
  Field, 
  Crop, 
  DashboardMetrics,
  WeatherData,
  SensorReading 
} from '@/types/agricultural';
import '@/styles/glass-agricultural.css';

interface FarmerDashboardProps {
  className?: string;
}

export function FarmerDashboard({ className = '' }: FarmerDashboardProps) {
  const { profile, tenant, hasPermission } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (profile?.tenant_id) {
      loadDashboardData();
    }
  }, [profile?.tenant_id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!selectedFarm) return;

    // Subscribe to sensor data changes
    const sensorSubscription = supabase
      .channel('sensor_data')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
        filter: `tenant_id=eq.${profile?.tenant_id}`
      }, (payload) => {
        setSensorData(prev => [payload.new as SensorReading, ...prev.slice(0, 99)]);
      })
      .subscribe();

    // Subscribe to crop status changes
    const cropSubscription = supabase
      .channel('crop_updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'crops',
        filter: `tenant_id=eq.${profile?.tenant_id}`
      }, (payload) => {
        setCrops(prev => prev.map(crop => 
          crop.id === payload.new.id ? payload.new as Crop : crop
        ));
      })
      .subscribe();

    return () => {
      sensorSubscription.unsubscribe();
      cropSubscription.unsubscribe();
    };
  }, [selectedFarm, profile?.tenant_id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load farms
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select(`
          *,
          owner:profiles!farms_owner_id_fkey(*),
          manager:profiles!farms_manager_id_fkey(*),
          fields!farms_id_fkey(
            *,
            crops!fields_id_fkey(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (farmsError) throw farmsError;

      setFarms(farmsData || []);
      if (farmsData && farmsData.length > 0) {
        setSelectedFarm(farmsData[0]);
        await loadFarmDetails(farmsData[0].id);
      }

      // Load dashboard metrics
      await loadMetrics();

      // Load weather data
      await loadWeatherData();

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadFarmDetails = async (farmId: string) => {
    try {
      // Load fields and crops for selected farm
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('fields')
        .select(`
          *,
          crops!fields_id_fkey(
            *,
            activities!crops_id_fkey(*)
          )
        `)
        .eq('farm_id', farmId);

      if (fieldsError) throw fieldsError;

      setFields(fieldsData || []);
      
      // Flatten crops from all fields
      const allCrops = fieldsData?.flatMap(field => field.crops || []) || [];
      setCrops(allCrops);

      // Load recent sensor data for this farm's fields
      const fieldIds = fieldsData?.map(field => field.id) || [];
      if (fieldIds.length > 0) {
        const { data: sensorData, error: sensorError } = await supabase
          .from('sensor_readings')
          .select('*')
          .in('field_id', fieldIds)
          .order('timestamp', { ascending: false })
          .limit(50);

        if (sensorError) throw sensorError;
        setSensorData(sensorData || []);
      }

    } catch (err) {
      console.error('Error loading farm details:', err);
    }
  };

  const loadMetrics = async () => {
    try {
      // Get basic counts and metrics
      const [
        farmsCount,
        fieldsCount,
        cropsCount,
        activitiesCount,
        transactionsData
      ] = await Promise.all([
        supabase.from('farms').select('id', { count: 'exact', head: true }),
        supabase.from('fields').select('id', { count: 'exact', head: true }),
        supabase.from('crops').select('id').not('status', 'eq', 'harvested'),
        supabase.from('activities').select('id').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('transactions')
          .select('amount')
          .eq('transaction_type', 'crop_sale')
          .eq('status', 'completed')
      ]);

      const totalRevenue = transactionsData.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setMetrics({
        total_farms: farmsCount.count || 0,
        total_fields: fieldsCount.count || 0,
        active_crops: cropsCount.data?.length || 0,
        recent_activities: activitiesCount.data?.length || 0,
        pending_orders: 0, // TODO: Implement orders count
        total_revenue: totalRevenue,
        weather_alerts: 0, // TODO: Implement weather alerts
        equipment_maintenance_due: 0 // TODO: Implement equipment maintenance
      });

    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  const loadWeatherData = async () => {
    try {
      // For demo purposes, using mock weather data
      // In production, integrate with weather API
      const mockWeather: WeatherData = {
        id: 'mock-weather',
        tenant_id: profile?.tenant_id || '',
        location: [0, 0], // Replace with farm coordinates
        timestamp: new Date().toISOString(),
        temperature: 28,
        humidity: 65,
        rainfall: 0,
        wind_speed: 12,
        wind_direction: 180,
        pressure: 1013.25,
        uv_index: 6,
        weather_condition: 'Partly Cloudy',
        forecast_data: {
          icon: '⛅',
          description: 'Partly cloudy with light winds'
        },
        created_at: new Date().toISOString()
      };

      setWeather(mockWeather);
    } catch (err) {
      console.error('Error loading weather data:', err);
    }
  };

  const getHealthyPercentage = () => {
    if (crops.length === 0) return 0;
    const healthyCrops = crops.filter(crop => (crop.health_score || 0) >= 80);
    return Math.round((healthyCrops.length / crops.length) * 100);
  };

  const getAverageYield = () => {
    const harvestedCrops = crops.filter(crop => crop.actual_yield_kg && crop.actual_yield_kg > 0);
    if (harvestedCrops.length === 0) return 0;
    const totalYield = harvestedCrops.reduce((sum, crop) => sum + (crop.actual_yield_kg || 0), 0);
    return Math.round(totalYield / harvestedCrops.length);
  };

  const getRecentSensorValue = (sensorType: string) => {
    const recentReading = sensorData
      .filter(reading => reading.sensor_type === sensorType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return recentReading?.value || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass animate-pulse p-8 text-center">
            <div className="text-white text-lg">Loading your farm dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass-danger p-8 text-center">
            <div className="text-white text-lg mb-4">Error loading dashboard</div>
            <div className="text-white/80">{error}</div>
            <button 
              onClick={loadDashboardData}
              className="glass-button glass-button-primary mt-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="glass p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {profile?.full_name}!
              </h1>
              <p className="text-white/80">
                {tenant?.name} • {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="status-badge status-healthy">
              {farms.length} Farm{farms.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Farm Selection */}
        {farms.length > 1 && (
          <div className="glass p-4 mb-6">
            <label className="text-white/80 text-sm font-medium block mb-2">
              Select Farm
            </label>
            <select 
              className="glass-input w-full max-w-xs"
              value={selectedFarm?.id || ''}
              onChange={(e) => {
                const farm = farms.find(f => f.id === e.target.value);
                if (farm) {
                  setSelectedFarm(farm);
                  loadFarmDetails(farm.id);
                }
              }}
            >
              {farms.map(farm => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} ({farm.area_hectares || 0} ha)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="metric-card">
          <div className="metric-card-value text-green-primary">
            {metrics?.active_crops || 0}
          </div>
          <div className="metric-card-label text-white/80">
            Active Crops
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-value text-sky-blue">
            {metrics?.total_fields || 0}
          </div>
          <div className="metric-card-label text-white/80">
            Total Fields
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-value text-warning-amber">
            {getHealthyPercentage()}%
          </div>
          <div className="metric-card-label text-white/80">
            Healthy Crops
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-value text-harvest-gold">
            {getAverageYield()}kg
          </div>
          <div className="metric-card-label text-white/80">
            Avg Yield
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weather Widget */}
        <div className="lg:col-span-1">
          {weather && (
            <div className="weather-widget">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Weather</h3>
                <span className="weather-icon">{weather.forecast_data?.icon || '☀️'}</span>
              </div>
              <div className="weather-temp text-white text-3xl font-bold mb-2">
                {weather.temperature}°C
              </div>
              <div className="weather-condition text-white/90 mb-4">
                {weather.weather_condition}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-white/80 text-sm">
                  <span>Humidity</span>
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex justify-between text-white/80 text-sm">
                  <span>Wind Speed</span>
                  <span>{weather.wind_speed} km/h</span>
                </div>
                <div className="flex justify-between text-white/80 text-sm">
                  <span>UV Index</span>
                  <span>{weather.uv_index}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sensor Data */}
        <div className="lg:col-span-2">
          <div className="sensor-grid">
            <div className="sensor-reading-card">
              <h4 className="text-white/80 text-sm font-medium mb-2">Soil Moisture</h4>
              <div className="sensor-reading-value">
                {getRecentSensorValue('soil_moisture').toFixed(1)}
                <span className="sensor-reading-unit">%</span>
              </div>
              <div className="status-badge status-healthy mt-2">Optimal</div>
            </div>

            <div className="sensor-reading-card">
              <h4 className="text-white/80 text-sm font-medium mb-2">Soil pH</h4>
              <div className="sensor-reading-value">
                {getRecentSensorValue('soil_ph').toFixed(1)}
                <span className="sensor-reading-unit">pH</span>
              </div>
              <div className="status-badge status-healthy mt-2">Good</div>
            </div>

            <div className="sensor-reading-card">
              <h4 className="text-white/80 text-sm font-medium mb-2">Light Level</h4>
              <div className="sensor-reading-value">
                {getRecentSensorValue('light_intensity').toFixed(0)}
                <span className="sensor-reading-unit">lux</span>
              </div>
              <div className="status-badge status-healthy mt-2">Excellent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Monitoring Cards */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-white">Crop Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {crops.slice(0, 6).map((crop) => (
            <div key={crop.id} className="crop-monitoring-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {crop.crop_type} {crop.variety && `(${crop.variety})`}
                </h3>
                <div className={`status-badge ${
                  (crop.health_score || 0) >= 80 ? 'status-healthy' :
                  (crop.health_score || 0) >= 60 ? 'status-warning' : 'status-danger'
                }`}>
                  {crop.status}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-white/80">
                  <span>Health Score</span>
                  <span className="font-semibold">{crop.health_score || 0}/100</span>
                </div>
                
                {crop.planting_date && (
                  <div className="flex justify-between text-white/80">
                    <span>Planted</span>
                    <span>{new Date(crop.planting_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {crop.expected_harvest_date && (
                  <div className="flex justify-between text-white/80">
                    <span>Expected Harvest</span>
                    <span>{new Date(crop.expected_harvest_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {crop.expected_yield_kg && (
                  <div className="flex justify-between text-white/80">
                    <span>Expected Yield</span>
                    <span>{crop.expected_yield_kg} kg</span>
                  </div>
                )}
              </div>

              {/* Progress bar for growth stage */}
              <div className="mt-4">
                <div className="flex justify-between text-white/60 text-xs mb-1">
                  <span>Growth Progress</span>
                  <span>
                    {crop.status === 'harvested' ? '100%' : 
                     crop.status === 'harvesting' ? '90%' :
                     crop.status === 'flowering' ? '70%' :
                     crop.status === 'growing' ? '50%' :
                     crop.status === 'planted' ? '20%' : '0%'}
                  </span>
                </div>
                <div className="glass-progress-bar">
                  <div 
                    className="glass-progress-fill"
                    style={{ 
                      width: `${
                        crop.status === 'harvested' ? 100 : 
                        crop.status === 'harvesting' ? 90 :
                        crop.status === 'flowering' ? 70 :
                        crop.status === 'growing' ? 50 :
                        crop.status === 'planted' ? 20 : 0
                      }%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="glass-button glass-button-primary">
            <span>📱</span>
            <span className="ml-2">Log Activity</span>
          </button>
          <button className="glass-button glass-button-primary">
            <span>📊</span>
            <span className="ml-2">View Reports</span>
          </button>
          <button className="glass-button glass-button-primary">
            <span>🌡️</span>
            <span className="ml-2">Check Sensors</span>
          </button>
          <button className="glass-button glass-button-primary">
            <span>💰</span>
            <span className="ml-2">Marketplace</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;