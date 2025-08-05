'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { supabase } from '@/lib/supabase';
import '@/styles/glass-agricultural.css';

interface AggregatedData {
  totalFarms: number;
  totalFarmers: number;
  totalAreaHectares: number;
  cropProduction: {
    crop_type: string;
    total_area: number;
    total_production: number;
    average_yield: number;
    farmer_count: number;
  }[];
  regionalDistribution: {
    region: string;
    farm_count: number;
    farmer_count: number;
    total_area: number;
  }[];
  productionTrends: {
    month: string;
    crop_type: string;
    production_kg: number;
    area_hectares: number;
  }[];
  inputUsage: {
    input_type: string;
    total_quantity: number;
    total_cost: number;
    farmer_count: number;
  }[];
  priceData: {
    crop_type: string;
    current_price: number;
    price_change_1m: number;
    price_change_3m: number;
    volume_traded: number;
  }[];
}

interface ReportFilter {
  startDate: string;
  endDate: string;
  region: string;
  cropType: string;
  reportType: 'production' | 'market' | 'farmers' | 'inputs' | 'comprehensive';
}

export function GovernmentReportingPortal() {
  const { profile, tenant, hasPermission } = useAuth();
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
    endDate: new Date().toISOString().split('T')[0],
    region: 'all',
    cropType: 'all',
    reportType: 'comprehensive'
  });
  const [regions, setRegions] = useState<string[]>([]);
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has permission to view government reports
  const hasGovAccess = profile?.role === 'government' || profile?.role === 'ngo' || 
                      profile?.role === 'super_admin' || hasPermission('view_government_reports');

  useEffect(() => {
    if (hasGovAccess) {
      loadInitialData();
    }
  }, [hasGovAccess]);

  useEffect(() => {
    if (hasGovAccess) {
      loadAggregatedData();
    }
  }, [filters, hasGovAccess]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load available regions
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select('location')
        .not('location', 'is', null);

      if (farmsError) throw farmsError;

      const uniqueRegions = [...new Set(farmsData?.map(f => f.location) || [])];
      setRegions(uniqueRegions);

      // Load available crop types
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('crop_type')
        .not('crop_type', 'is', null);

      if (activitiesError) throw activitiesError;

      const uniqueCrops = [...new Set(activitiesData?.map(a => a.crop_type) || [])];
      setCropTypes(uniqueCrops);

    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAggregatedData = async () => {
    try {
      setLoading(true);

      // Build filters for the queries
      let farmQuery = supabase.from('farms').select(`
        id,
        name,
        location,
        size_hectares,
        owner_id,
        status,
        created_at
      `);

      if (filters.region !== 'all') {
        farmQuery = farmQuery.eq('location', filters.region);
      }

      const { data: farms, error: farmsError } = await farmQuery;
      if (farmsError) throw farmsError;

      // Get activities data
      let activitiesQuery = supabase
        .from('activities')
        .select(`
          *,
          field:fields!inner(farm_id, size_hectares)
        `)
        .gte('date', filters.startDate)
        .lte('date', filters.endDate);

      if (filters.cropType !== 'all') {
        activitiesQuery = activitiesQuery.eq('crop_type', filters.cropType);
      }

      const { data: activities, error: activitiesError } = await activitiesQuery;
      if (activitiesError) throw activitiesError;

      // Filter activities to only farms in selected region
      const farmIds = new Set(farms?.map(f => f.id) || []);
      const filteredActivities = activities?.filter(a => farmIds.has(a.field.farm_id)) || [];

      // Get market prices data
      const { data: marketPrices, error: pricesError } = await supabase
        .from('market_prices')
        .select('*')
        .gte('date', filters.startDate)
        .lte('date', filters.endDate);

      if (pricesError) console.error('Error loading market prices:', pricesError);

      // Get input purchases data
      const { data: inputOrders, error: inputError } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders!inner(buyer_id, created_at)
        `)
        .gte('order.created_at', filters.startDate)
        .lte('order.created_at', filters.endDate);

      if (inputError) console.error('Error loading input data:', inputError);

      // Calculate aggregated statistics
      const aggregated = calculateAggregatedData(
        farms || [],
        filteredActivities,
        marketPrices || [],
        inputOrders || []
      );

      setAggregatedData(aggregated);

    } catch (err) {
      console.error('Error loading aggregated data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load aggregated data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAggregatedData = (
    farms: any[],
    activities: any[],
    marketPrices: any[],
    inputOrders: any[]
  ): AggregatedData => {
    // Basic statistics
    const totalFarms = farms.length;
    const uniqueFarmers = new Set(farms.map(f => f.owner_id));
    const totalFarmers = uniqueFarmers.size;
    const totalAreaHectares = farms.reduce((sum, f) => sum + (f.size_hectares || 0), 0);

    // Crop production analysis
    const cropProductionMap = new Map();
    const harvestActivities = activities.filter(a => a.activity_type === 'harvest');
    
    harvestActivities.forEach(activity => {
      const crop = activity.crop_type || 'unknown';
      const yield_kg = activity.yield_kg || 0;
      const area = activity.field?.size_hectares || 0;
      
      if (!cropProductionMap.has(crop)) {
        cropProductionMap.set(crop, {
          crop_type: crop,
          total_area: 0,
          total_production: 0,
          farmer_count: new Set(),
          activities: []
        });
      }
      
      const cropData = cropProductionMap.get(crop);
      cropData.total_area += area;
      cropData.total_production += yield_kg;
      cropData.farmer_count.add(activity.user_id);
      cropData.activities.push(activity);
    });

    const cropProduction = Array.from(cropProductionMap.values()).map(crop => ({
      crop_type: crop.crop_type,
      total_area: Math.round(crop.total_area * 100) / 100,
      total_production: Math.round(crop.total_production),
      average_yield: crop.total_area > 0 ? Math.round((crop.total_production / crop.total_area) * 100) / 100 : 0,
      farmer_count: crop.farmer_count.size
    }));

    // Regional distribution
    const regionMap = new Map();
    farms.forEach(farm => {
      const region = farm.location || 'Unknown';
      if (!regionMap.has(region)) {
        regionMap.set(region, {
          region,
          farm_count: 0,
          farmer_count: new Set(),
          total_area: 0
        });
      }
      
      const regionData = regionMap.get(region);
      regionData.farm_count++;
      regionData.farmer_count.add(farm.owner_id);
      regionData.total_area += farm.size_hectares || 0;
    });

    const regionalDistribution = Array.from(regionMap.values()).map(region => ({
      region: region.region,
      farm_count: region.farm_count,
      farmer_count: region.farmer_count.size,
      total_area: Math.round(region.total_area * 100) / 100
    }));

    // Production trends (monthly)
    const trendMap = new Map();
    harvestActivities.forEach(activity => {
      const date = new Date(activity.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const crop = activity.crop_type || 'unknown';
      const key = `${monthKey}-${crop}`;
      
      if (!trendMap.has(key)) {
        trendMap.set(key, {
          month: monthKey,
          crop_type: crop,
          production_kg: 0,
          area_hectares: 0
        });
      }
      
      const trend = trendMap.get(key);
      trend.production_kg += activity.yield_kg || 0;
      trend.area_hectares += activity.field?.size_hectares || 0;
    });

    const productionTrends = Array.from(trendMap.values())
      .sort((a, b) => a.month.localeCompare(b.month));

    // Input usage analysis
    const inputMap = new Map();
    inputOrders.forEach(order => {
      const inputType = order.product_name?.split(' ')[0] || 'Unknown'; // Simplified categorization
      
      if (!inputMap.has(inputType)) {
        inputMap.set(inputType, {
          input_type: inputType,
          total_quantity: 0,
          total_cost: 0,
          farmer_count: new Set()
        });
      }
      
      const inputData = inputMap.get(inputType);
      inputData.total_quantity += order.quantity || 0;
      inputData.total_cost += order.total_price || 0;
      inputData.farmer_count.add(order.order?.buyer_id);
    });

    const inputUsage = Array.from(inputMap.values()).map(input => ({
      input_type: input.input_type,
      total_quantity: Math.round(input.total_quantity),
      total_cost: Math.round(input.total_cost),
      farmer_count: input.farmer_count.size
    }));

    // Price data analysis
    const priceMap = new Map();
    marketPrices.forEach(price => {
      const crop = price.crop_type;
      
      if (!priceMap.has(crop)) {
        priceMap.set(crop, {
          crop_type: crop,
          prices: [],
          volumes: []
        });
      }
      
      priceMap.get(crop).prices.push({
        date: price.date,
        price: price.price_per_kg,
        volume: price.volume_traded || 0
      });
    });

    const priceData = Array.from(priceMap.values()).map(crop => {
      const sortedPrices = crop.prices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const currentPrice = sortedPrices[0]?.price || 0;
      
      // Calculate price changes (simplified)
      const oneMonthAgo = sortedPrices.find(p => {
        const daysDiff = (new Date().getTime() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 25 && daysDiff <= 35;
      });
      
      const threeMonthsAgo = sortedPrices.find(p => {
        const daysDiff = (new Date().getTime() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 85 && daysDiff <= 95;
      });

      return {
        crop_type: crop.crop_type,
        current_price: currentPrice,
        price_change_1m: oneMonthAgo ? ((currentPrice - oneMonthAgo.price) / oneMonthAgo.price) * 100 : 0,
        price_change_3m: threeMonthsAgo ? ((currentPrice - threeMonthsAgo.price) / threeMonthsAgo.price) * 100 : 0,
        volume_traded: crop.prices.reduce((sum, p) => sum + p.volume, 0)
      };
    });

    return {
      totalFarms,
      totalFarmers,
      totalAreaHectares: Math.round(totalAreaHectares * 100) / 100,
      cropProduction,
      regionalDistribution,
      productionTrends,
      inputUsage,
      priceData
    };
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      setExporting(true);
      
      // This would implement actual export functionality
      // For now, we'll create a simple CSV export
      if (format === 'csv' && aggregatedData) {
        const csvData = generateCSVReport(aggregatedData);
        downloadCSV(csvData, `agricultural_report_${filters.reportType}_${new Date().toISOString().split('T')[0]}.csv`);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const generateCSVReport = (data: AggregatedData): string => {
    let csv = 'Agricultural Report\n\n';
    
    // Summary
    csv += 'Summary\n';
    csv += `Total Farms,${data.totalFarms}\n`;
    csv += `Total Farmers,${data.totalFarmers}\n`;
    csv += `Total Area (Ha),${data.totalAreaHectares}\n\n`;
    
    // Crop Production
    csv += 'Crop Production\n';
    csv += 'Crop Type,Total Area (Ha),Total Production (kg),Average Yield (kg/ha),Farmer Count\n';
    data.cropProduction.forEach(crop => {
      csv += `${crop.crop_type},${crop.total_area},${crop.total_production},${crop.average_yield},${crop.farmer_count}\n`;
    });
    
    return csv;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (!hasGovAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
        <div className="glass p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-white/80 mb-6">
            This portal is only accessible to government officials, NGOs, and authorized personnel.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="glass-button glass-button-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass animate-pulse p-8 text-center">
            <div className="text-white text-lg">Loading government reports...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
      {/* Header */}
      <div className="glass p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Government Reporting Portal</h1>
            <p className="text-white/80">Agricultural statistics and insights for policy makers</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting || !aggregatedData}
              className="glass-button glass-button-primary"
            >
              {exporting ? '⏳ Exporting...' : '📊 Export CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({...prev, startDate: e.target.value}))}
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({...prev, endDate: e.target.value}))}
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Region</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters(prev => ({...prev, region: e.target.value}))}
              className="glass-input w-full"
            >
              <option value="all">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Crop Type</label>
            <select
              value={filters.cropType}
              onChange={(e) => setFilters(prev => ({...prev, cropType: e.target.value}))}
              className="glass-input w-full"
            >
              <option value="all">All Crops</option>
              {cropTypes.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Report Type</label>
            <select
              value={filters.reportType}
              onChange={(e) => setFilters(prev => ({...prev, reportType: e.target.value as any}))}
              className="glass-input w-full"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="production">Production Only</option>
              <option value="market">Market Analysis</option>
              <option value="farmers">Farmer Statistics</option>
              <option value="inputs">Input Usage</option>
            </select>
          </div>
        </div>
      </div>

      {aggregatedData && (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🏪</div>
                <div className="text-green-primary text-sm font-medium">FARMS</div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {aggregatedData.totalFarms.toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Registered farms</div>
            </div>

            <div className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">👨‍🌾</div>
                <div className="text-blue-primary text-sm font-medium">FARMERS</div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {aggregatedData.totalFarmers.toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Active farmers</div>
            </div>

            <div className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🌾</div>
                <div className="text-yellow-primary text-sm font-medium">AREA</div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {aggregatedData.totalAreaHectares.toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Hectares under cultivation</div>
            </div>

            <div className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📈</div>
                <div className="text-purple-primary text-sm font-medium">PRODUCTION</div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {aggregatedData.cropProduction.reduce((sum, crop) => sum + crop.total_production, 0).toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Total kg produced</div>
            </div>
          </div>

          {/* Crop Production */}
          <div className="glass p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Crop Production Analysis</h2>
            
            {aggregatedData.cropProduction.length === 0 ? (
              <div className="text-center text-white/80 py-8">
                <div className="text-4xl mb-4">🌾</div>
                <div>No production data available for selected period</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-3 text-white/80">Crop Type</th>
                      <th className="text-right p-3 text-white/80">Area (Ha)</th>
                      <th className="text-right p-3 text-white/80">Production (kg)</th>
                      <th className="text-right p-3 text-white/80">Avg Yield (kg/ha)</th>
                      <th className="text-right p-3 text-white/80">Farmers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedData.cropProduction.map((crop) => (
                      <tr key={crop.crop_type} className="border-b border-white/10">
                        <td className="p-3 font-medium capitalize">{crop.crop_type}</td>
                        <td className="p-3 text-right">{crop.total_area.toLocaleString()}</td>
                        <td className="p-3 text-right">{crop.total_production.toLocaleString()}</td>
                        <td className="p-3 text-right">{crop.average_yield.toLocaleString()}</td>
                        <td className="p-3 text-right">{crop.farmer_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Regional Distribution */}
          <div className="glass p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Regional Distribution</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aggregatedData.regionalDistribution.map((region) => (
                <div key={region.region} className="glass-agricultural p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">{region.region}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/80">Farms:</span>
                      <span className="text-white font-medium">{region.farm_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Farmers:</span>
                      <span className="text-white font-medium">{region.farmer_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Area:</span>
                      <span className="text-white font-medium">{region.total_area.toLocaleString()} ha</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Price Analysis */}
          {aggregatedData.priceData.length > 0 && (
            <div className="glass p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">Market Price Analysis</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-3 text-white/80">Crop</th>
                      <th className="text-right p-3 text-white/80">Current Price</th>
                      <th className="text-right p-3 text-white/80">1M Change</th>
                      <th className="text-right p-3 text-white/80">3M Change</th>
                      <th className="text-right p-3 text-white/80">Volume Traded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedData.priceData.map((price) => (
                      <tr key={price.crop_type} className="border-b border-white/10">
                        <td className="p-3 font-medium capitalize">{price.crop_type}</td>
                        <td className="p-3 text-right">{formatCurrency(price.current_price)}/kg</td>
                        <td className={`p-3 text-right ${price.price_change_1m >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(price.price_change_1m)}
                        </td>
                        <td className={`p-3 text-right ${price.price_change_3m >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(price.price_change_3m)}
                        </td>
                        <td className="p-3 text-right">{price.volume_traded.toLocaleString()} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Input Usage */}
          {aggregatedData.inputUsage.length > 0 && (
            <div className="glass p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Agricultural Input Usage</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aggregatedData.inputUsage.map((input) => (
                  <div key={input.input_type} className="glass-agricultural p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-3 capitalize">{input.input_type}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/80">Quantity:</span>
                        <span className="text-white font-medium">{input.total_quantity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Total Cost:</span>
                        <span className="text-white font-medium">{formatCurrency(input.total_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Farmers:</span>
                        <span className="text-white font-medium">{input.farmer_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 glass-danger p-4 rounded-lg max-w-sm">
          <p className="text-white text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-white/60 hover:text-white text-xs mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default GovernmentReportingPortal;