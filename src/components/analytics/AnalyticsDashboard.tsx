'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/multi-tenant-auth';
import { 
  forecastEngine, 
  WeatherForecast, 
  DiseaseRiskForecast, 
  YieldForecast, 
  MarketPriceForecast,
  AnalyticsInsight 
} from '@/services/analytics/ForecastEngine';
import { supabase } from '@/lib/supabase';
import '@/styles/glass-agricultural.css';

export function AnalyticsDashboard() {
  const { profile, tenant } = useAuth();
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [diseaseRisks, setDiseaseRisks] = useState<DiseaseRiskForecast[]>([]);
  const [yieldForecasts, setYieldForecasts] = useState<YieldForecast[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPriceForecast[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weather' | 'disease' | 'yield' | 'market'>('overview');

  useEffect(() => {
    loadInitialData();
  }, [tenant]);

  useEffect(() => {
    if (selectedFarm) {
      loadFarmAnalytics(selectedFarm);
    }
  }, [selectedFarm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load user's farms
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .eq('status', 'active')
        .order('name');

      if (farmsError) throw farmsError;
      setFarms(farmsData || []);

      if (farmsData && farmsData.length > 0) {
        setSelectedFarm(farmsData[0].id);
      }

      // Load general insights
      const generalInsights = await forecastEngine.generateInsights(tenant!.id);
      setInsights(generalInsights);

    } catch (err) {
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFarmAnalytics = async (farmId: string) => {
    try {
      const farm = farms.find(f => f.id === farmId);
      if (!farm) return;

      // Load weather forecast
      if (farm.latitude && farm.longitude) {
        const weather = await forecastEngine.generateWeatherForecast(
          farm.latitude,
          farm.longitude,
          14
        );
        setWeatherForecast(weather);

        // Load disease risk for main crops
        const cropTypes = farm.primary_crops || ['maize'];
        const allDiseaseRisks: DiseaseRiskForecast[] = [];
        
        for (const crop of cropTypes) {
          const risks = await forecastEngine.predictDiseaseRisk(
            crop,
            { latitude: farm.latitude, longitude: farm.longitude },
            farmId
          );
          allDiseaseRisks.push(...risks.map(r => ({ ...r, crop_type: crop })));
        }
        setDiseaseRisks(allDiseaseRisks);
      }

      // Load yield forecasts for active fields
      const { data: activeFields, error: fieldsError } = await supabase
        .from('fields')
        .select(`
          *,
          activities!inner(*)
        `)
        .eq('farm_id', farmId)
        .eq('status', 'active')
        .eq('activities.activity_type', 'planting')
        .gte('activities.date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

      if (!fieldsError && activeFields && activeFields.length > 0) {
        const yieldPromises = activeFields.map(field => {
          const plantingActivity = field.activities[0];
          return forecastEngine.forecastYield(
            farmId,
            field.id,
            plantingActivity.crop_type,
            plantingActivity.date
          );
        });

        const yields = await Promise.all(yieldPromises);
        setYieldForecasts(yields);
      }

      // Load market price forecasts
      const marketLocation = farm.location || 'Nairobi';
      const marketPromises = (farm.primary_crops || ['maize']).map(crop =>
        forecastEngine.forecastMarketPrices(crop, marketLocation)
      );

      const markets = await Promise.all(marketPromises);
      setMarketPrices(markets);

    } catch (error) {
      console.error('Error loading farm analytics:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: tenant?.currency || 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, string> = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      stormy: '⛈️'
    };
    return icons[condition] || '🌤️';
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400'
    };
    return colors[level] || 'text-white';
  };

  const getInsightIcon = (type: string) => {
    const icons: Record<string, string> = {
      opportunity: '💡',
      warning: '⚠️',
      recommendation: '💭',
      trend: '📈'
    };
    return icons[type] || '📊';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-teal-500 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass animate-pulse p-8 text-center">
            <div className="text-white text-lg">Loading analytics...</div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Analytics & Forecasts</h1>
            <p className="text-white/80">AI-powered insights for better farming decisions</p>
          </div>
          
          {farms.length > 0 && (
            <select
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="glass-input"
            >
              {farms.map(farm => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass p-2 mb-6">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'weather', label: '🌤️ Weather', icon: '🌤️' },
            { id: 'disease', label: '🦠 Disease Risk', icon: '🦠' },
            { id: 'yield', label: '🌾 Yield Forecast', icon: '🌾' },
            { id: 'market', label: '💰 Market Prices', icon: '💰' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`glass-button text-sm ${
                activeTab === tab.id ? 'glass-button-primary' : ''
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">🌧️</div>
                <div className="text-blue-primary text-xs font-medium">7-DAY RAINFALL</div>
              </div>
              <div className="text-xl font-bold text-white">
                {weatherForecast.reduce((sum, day) => sum + day.rainfall_mm, 0).toFixed(1)}mm
              </div>
              <div className="text-white/60 text-sm">Expected precipitation</div>
            </div>

            <div className="glass p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">⚠️</div>
                <div className="text-yellow-primary text-xs font-medium">DISEASE RISK</div>
              </div>
              <div className="text-xl font-bold text-white">
                {diseaseRisks.filter(r => r.risk_level === 'high' || r.risk_level === 'critical').length}
              </div>
              <div className="text-white/60 text-sm">High/Critical risks</div>
            </div>

            <div className="glass p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">🌾</div>
                <div className="text-green-primary text-xs font-medium">AVG YIELD</div>
              </div>
              <div className="text-xl font-bold text-white">
                {yieldForecasts.length > 0 
                  ? Math.round(yieldForecasts.reduce((sum, y) => sum + y.yield_per_hectare, 0) / yieldForecasts.length)
                  : 0}kg/ha
              </div>
              <div className="text-white/60 text-sm">Predicted yield</div>
            </div>

            <div className="glass p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">💰</div>
                <div className="text-purple-primary text-xs font-medium">PRICE TREND</div>
              </div>
              <div className="text-xl font-bold text-white">
                {marketPrices.length > 0 && marketPrices[0].forecasted_prices.length > 0
                  ? formatCurrency(marketPrices[0].forecasted_prices[marketPrices[0].forecasted_prices.length - 1].price)
                  : formatCurrency(0)}
              </div>
              <div className="text-white/60 text-sm">90-day forecast</div>
            </div>
          </div>

          {/* Insights */}
          <div className="glass p-6">
            <h2 className="text-xl font-semibold text-white mb-4">AI Insights & Recommendations</h2>
            
            {insights.length === 0 ? (
              <div className="text-center text-white/80 py-8">
                <div className="text-4xl mb-4">🤖</div>
                <div>No insights available</div>
                <div className="text-sm mt-2">Add more farm data to get AI recommendations</div>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.slice(0, 5).map((insight) => (
                  <div key={insight.id} className="glass-agricultural p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-semibold">{insight.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            insight.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {insight.priority.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-white/80 text-sm mb-3">{insight.description}</p>
                        
                        {insight.action_items.length > 0 && (
                          <div className="mb-3">
                            <div className="text-white/60 text-xs mb-1">Action Items:</div>
                            <ul className="list-disc list-inside text-white/80 text-sm space-y-1">
                              {insight.action_items.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>Confidence: {Math.round(insight.confidence_score * 100)}%</span>
                          <span>Potential Impact: {formatCurrency(insight.financial_impact.potential_savings + insight.financial_impact.potential_revenue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weather Tab */}
      {activeTab === 'weather' && (
        <div className="glass p-6">
          <h2 className="text-xl font-semibold text-white mb-6">14-Day Weather Forecast</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weatherForecast.map((day, index) => (
              <div key={day.date} className="glass-agricultural p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-white/80 text-sm mb-1">
                    {index === 0 ? 'Today' : 
                     index === 1 ? 'Tomorrow' :
                     new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  
                  <div className="text-4xl mb-2">{getWeatherIcon(day.weather_condition)}</div>
                  
                  <div className="text-white font-semibold mb-2">
                    {day.temperature_max}° / {day.temperature_min}°
                  </div>
                  
                  <div className="space-y-1 text-xs text-white/80">
                    <div>💧 {day.humidity}% humidity</div>
                    <div>🌧️ {day.rainfall_mm}mm rain</div>
                    <div>💨 {day.wind_speed} km/h wind</div>
                  </div>
                  
                  <div className="mt-2 text-xs text-white/60">
                    {Math.round(day.confidence_score * 100)}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disease Risk Tab */}
      {activeTab === 'disease' && (
        <div className="glass p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Disease Risk Assessment</h2>
          
          {diseaseRisks.length === 0 ? (
            <div className="text-center text-white/80 py-8">
              <div className="text-4xl mb-4">🦠</div>
              <div>No disease risks identified</div>
            </div>
          ) : (
            <div className="space-y-4">
              {diseaseRisks.map((risk, index) => (
                <div key={`${risk.crop_type}-${risk.disease_name}-${index}`} className="glass-agricultural p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{risk.disease_name}</h3>
                        <span className="text-white/60 text-sm">({risk.crop_type})</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(risk.risk_level)}`}>
                          {risk.risk_level.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-white/80 text-sm mb-3">
                        Risk Probability: {Math.round(risk.probability * 100)}%
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-white/60 mb-1">Contributing Factors:</div>
                          <ul className="list-disc list-inside text-white/80 space-y-1">
                            {risk.contributing_factors.map((factor, idx) => (
                              <li key={idx}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <div className="text-white/60 mb-1">Prevention Measures:</div>
                          <ul className="list-disc list-inside text-white/80 space-y-1">
                            {risk.prevention_measures.map((measure, idx) => (
                              <li key={idx}>{measure}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl mb-2">
                        {risk.risk_level === 'critical' ? '🔴' :
                         risk.risk_level === 'high' ? '🟠' :
                         risk.risk_level === 'medium' ? '🟡' : '🟢'}
                      </div>
                      <div className="text-xs text-white/60">
                        {risk.forecast_period_days} day forecast
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Yield Forecast Tab */}
      {activeTab === 'yield' && (
        <div className="glass p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Yield Forecasts</h2>
          
          {yieldForecasts.length === 0 ? (
            <div className="text-center text-white/80 py-8">
              <div className="text-4xl mb-4">🌾</div>
              <div>No active crops to forecast</div>
              <div className="text-sm mt-2">Plant crops to see yield predictions</div>
            </div>
          ) : (
            <div className="space-y-6">
              {yieldForecasts.map((forecast) => (
                <div key={`${forecast.field_id}-${forecast.crop_type}`} className="glass-agricultural p-6 rounded-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-4">
                        {forecast.crop_type} - Field {forecast.field_id.slice(-8)}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/80">Predicted Yield:</span>
                          <span className="text-white font-semibold">{forecast.predicted_yield_kg.toLocaleString()}kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/80">Yield per Hectare:</span>
                          <span className="text-white font-semibold">{forecast.yield_per_hectare.toLocaleString()}kg/ha</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/80">Expected Harvest:</span>
                          <span className="text-white font-semibold">
                            {new Date(forecast.expected_harvest_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/80">Confidence Range:</span>
                          <span className="text-white font-semibold">
                            {forecast.confidence_interval.min.toLocaleString()} - {forecast.confidence_interval.max.toLocaleString()}kg
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-3">Yield Factors</h4>
                      <div className="space-y-2">
                        {Object.entries(forecast.factors_affecting_yield).map(([factor, score]) => (
                          <div key={factor} className="flex items-center justify-between">
                            <span className="text-white/80 text-sm capitalize">
                              {factor.replace('_', ' ')}:
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              <span className="text-white/60 text-xs w-8">{score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Market Prices Tab */}
      {activeTab === 'market' && (
        <div className="glass p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Market Price Forecasts</h2>
          
          {marketPrices.length === 0 ? (
            <div className="text-center text-white/80 py-8">
              <div className="text-4xl mb-4">💰</div>
              <div>No market data available</div>
            </div>
          ) : (
            <div className="space-y-6">
              {marketPrices.map((market) => (
                <div key={`${market.crop_type}-${market.market_location}`} className="glass-agricultural p-6 rounded-lg">
                  <div className="mb-4">
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {market.crop_type} - {market.market_location}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-white/80">Current Price: </span>
                        <span className="text-white font-semibold">{formatCurrency(market.current_price)}/kg</span>
                      </div>
                      <div>
                        <span className="text-white/80">Optimal Sale Date: </span>
                        <span className="text-green-400 font-semibold">
                          {new Date(market.recommendations.optimal_selling_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/80">Expected Price: </span>
                        <span className="text-green-400 font-semibold">
                          {formatCurrency(market.recommendations.expected_price_at_optimal_date)}/kg
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-3">Price Drivers</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-white/60 mb-1">Supply Factors:</div>
                          <ul className="list-disc list-inside text-white/80 space-y-1">
                            {market.price_drivers.supply_factors.map((factor, idx) => (
                              <li key={idx}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-white/60 mb-1">Demand Factors:</div>
                          <ul className="list-disc list-inside text-white/80 space-y-1">
                            {market.price_drivers.demand_factors.map((factor, idx) => (
                              <li key={idx}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-3">Recommendations</h4>
                      <ul className="list-disc list-inside text-white/80 text-sm space-y-1">
                        {market.recommendations.storage_recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;