import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  Satellite,
  TrendingUp,
  TrendingDown,
  Activity,
  Leaf,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  BarChart3,
  RefreshCw,
  Loader2,
  Eye,
  Target,
  Zap
} from 'lucide-react';
import { SatelliteAnalysis } from '@/services/ai/crop-monitoring-service';

interface SatelliteImageryAnalyzerProps {
  fieldId: string;
  fieldName?: string;
  onAnalysisComplete?: (analysis: SatelliteAnalysis) => void;
  className?: string;
}

interface NDVIHistoryPoint {
  date: Date;
  ndvi: number;
  health: string;
}

/**
 * Satellite Imagery Analyzer Component
 * Provides NDVI analysis, vegetation health monitoring, and growth stage tracking
 */
export function SatelliteImageryAnalyzer({ 
  fieldId, 
  fieldName,
  onAnalysisComplete,
  className 
}: SatelliteImageryAnalyzerProps) {
  const [analysis, setAnalysis] = useState<SatelliteAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ndviHistory, setNdviHistory] = useState<NDVIHistoryPoint[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'season' | 'year'>('month');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (fieldId) {
      loadAnalysis();
      loadNDVIHistory();
    }
  }, [fieldId, selectedTimeRange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadAnalysis();
      }, 5 * 60 * 1000); // Refresh every 5 minutes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fieldId]);

  const loadAnalysis = async () => {
    if (!fieldId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/crop-monitoring/analyze-satellite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldId, tenantId: 'current' }) // In real app, get from auth
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze satellite imagery');
      }

      setAnalysis(data.analysis);
      onAnalysisComplete?.(data.analysis);
    } catch (error) {
      console.error('Satellite analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const loadNDVIHistory = async () => {
    // Mock NDVI history data - in production, fetch from database
    try {
      const mockHistory: NDVIHistoryPoint[] = [];
      const now = new Date();
      const days = selectedTimeRange === 'week' ? 7 : 
                   selectedTimeRange === 'month' ? 30 :
                   selectedTimeRange === 'season' ? 90 : 365;

      for (let i = days; i >= 0; i -= Math.ceil(days / 10)) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Generate realistic NDVI progression
        const baseNDVI = 0.3 + (Math.sin((i / days) * Math.PI) * 0.4);
        const ndvi = Math.max(0, Math.min(1, baseNDVI + (Math.random() - 0.5) * 0.1));
        
        const health = ndvi > 0.7 ? 'excellent' :
                      ndvi > 0.5 ? 'good' :
                      ndvi > 0.3 ? 'fair' :
                      ndvi > 0.1 ? 'poor' : 'critical';

        mockHistory.push({ date, ndvi, health });
      }

      setNdviHistory(mockHistory.reverse());
    } catch (error) {
      console.error('Error loading NDVI history:', error);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-green-300';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthBgColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-400';
      case 'good': return 'bg-green-300';
      case 'fair': return 'bg-yellow-400';
      case 'poor': return 'bg-orange-400';
      case 'critical': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getGrowthStageIcon = (stage: string) => {
    switch (stage) {
      case 'early_growth': return <Leaf className="h-4 w-4 text-green-300" />;
      case 'vegetative': return <Leaf className="h-4 w-4 text-green-400" />;
      case 'reproductive': return <Target className="h-4 w-4 text-yellow-400" />;
      case 'maturity': return <CheckCircle2 className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'stable': return <Activity className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };

  const calculateNDVITrend = () => {
    if (ndviHistory.length < 2) return null;
    
    const recent = ndviHistory.slice(-3).reduce((sum, point) => sum + point.ndvi, 0) / 3;
    const older = ndviHistory.slice(-6, -3).reduce((sum, point) => sum + point.ndvi, 0) / 3;
    
    if (recent > older + 0.05) return 'improving';
    if (recent < older - 0.05) return 'declining';
    return 'stable';
  };

  const getRecommendations = () => {
    if (!analysis) return [];
    
    const recommendations: string[] = [];
    
    // NDVI-based recommendations
    if (analysis.ndviScore < 0.3) {
      recommendations.push('Consider irrigation - vegetation shows signs of stress');
      recommendations.push('Check for pest or disease issues');
    } else if (analysis.ndviScore > 0.7) {
      recommendations.push('Excellent vegetation health - maintain current practices');
    }
    
    // Stress indicator recommendations
    if (analysis.stressIndicators.waterStress > 0.6) {
      recommendations.push('High water stress detected - increase irrigation frequency');
    }
    
    if (analysis.stressIndicators.nutrientDeficiency > 0.5) {
      recommendations.push('Nutrient deficiency indicators present - consider fertilization');
    }
    
    if (analysis.stressIndicators.diseaseRisk > 0.4) {
      recommendations.push('Elevated disease risk - increase monitoring and consider preventive treatment');
    }
    
    // Growth stage recommendations
    switch (analysis.growthStage) {
      case 'early_growth':
        recommendations.push('Early growth stage - ensure adequate water and nutrients');
        break;
      case 'vegetative':
        recommendations.push('Vegetative stage - optimize nitrogen application');
        break;
      case 'reproductive':
        recommendations.push('Reproductive stage - maintain consistent water supply');
        break;
      case 'maturity':
        recommendations.push('Approaching maturity - prepare for harvest planning');
        break;
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  };

  return (
    <div className={cn('satellite-imagery-analyzer space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-3">
            <Satellite className="h-6 w-6 text-blue-400" />
            <span>Satellite Analysis</span>
          </h3>
          {fieldName && (
            <p className="text-gray-300 mt-1">{fieldName}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="week" className="bg-gray-800">Last Week</option>
            <option value="month" className="bg-gray-800">Last Month</option>
            <option value="season" className="bg-gray-800">This Season</option>
            <option value="year" className="bg-gray-800">This Year</option>
          </select>
          
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-500/20 text-green-400' : ''}
          >
            <RefreshCw className={cn('h-4 w-4', autoRefresh && 'animate-spin')} />
          </GlassButton>
          
          <GlassButton
            variant="primary"
            size="sm"
            onClick={loadAnalysis}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </GlassButton>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <GlassCard className="p-4 bg-red-500/20 border border-red-500/30">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </GlassCard>
      )}

      {/* Main Analysis */}
      {analysis && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {analysis.ndviScore.toFixed(3)}
              </div>
              <div className="text-xs text-gray-300">NDVI Score</div>
              <div className="w-full bg-gray-600/30 rounded-full h-1 mt-2">
                <div 
                  className="h-1 bg-blue-400 rounded-full transition-all duration-1000"
                  style={{ width: `${(analysis.ndviScore + 1) * 50}%` }}
                />
              </div>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <div className={cn('text-lg font-bold mb-1 capitalize', getHealthColor(analysis.vegetationHealth))}>
                {analysis.vegetationHealth}
              </div>
              <div className="text-xs text-gray-300">Vegetation Health</div>
              <div className="flex justify-center mt-2">
                <div className={cn('w-3 h-3 rounded-full', getHealthBgColor(analysis.vegetationHealth))} />
              </div>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <div className="text-lg font-bold text-green-400 mb-1 flex items-center justify-center space-x-1">
                {getGrowthStageIcon(analysis.growthStage)}
                <span className="capitalize text-sm">
                  {analysis.growthStage.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-gray-300">Growth Stage</div>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <div className="text-lg font-bold text-yellow-400 mb-1">
                {analysis.yieldPrediction.estimatedYield.toLocaleString()}
              </div>
              <div className="text-xs text-gray-300">
                Predicted Yield ({analysis.yieldPrediction.unit})
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {(analysis.yieldPrediction.confidence * 100).toFixed(0)}% confidence
              </div>
            </GlassCard>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stress Indicators */}
            <GlassCard className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span>Stress Indicators</span>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">Water Stress</span>
                    </div>
                    <span className={cn(
                      'font-medium',
                      analysis.stressIndicators.waterStress > 0.6 ? 'text-red-400' :
                      analysis.stressIndicators.waterStress > 0.3 ? 'text-yellow-400' :
                      'text-green-400'
                    )}>
                      {(analysis.stressIndicators.waterStress * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600/30 rounded-full h-2">
                    <div 
                      className={cn(
                        'h-2 rounded-full transition-all duration-1000',
                        analysis.stressIndicators.waterStress > 0.6 ? 'bg-red-400' :
                        analysis.stressIndicators.waterStress > 0.3 ? 'bg-yellow-400' :
                        'bg-green-400'
                      )}
                      style={{ width: `${analysis.stressIndicators.waterStress * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-300">Nutrient Deficiency</span>
                    </div>
                    <span className={cn(
                      'font-medium',
                      analysis.stressIndicators.nutrientDeficiency > 0.5 ? 'text-red-400' :
                      analysis.stressIndicators.nutrientDeficiency > 0.25 ? 'text-yellow-400' :
                      'text-green-400'
                    )}>
                      {(analysis.stressIndicators.nutrientDeficiency * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600/30 rounded-full h-2">
                    <div 
                      className={cn(
                        'h-2 rounded-full transition-all duration-1000',
                        analysis.stressIndicators.nutrientDeficiency > 0.5 ? 'bg-red-400' :
                        analysis.stressIndicators.nutrientDeficiency > 0.25 ? 'bg-yellow-400' :
                        'bg-green-400'
                      )}
                      style={{ width: `${analysis.stressIndicators.nutrientDeficiency * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-gray-300">Disease Risk</span>
                    </div>
                    <span className={cn(
                      'font-medium',
                      analysis.stressIndicators.diseaseRisk > 0.4 ? 'text-red-400' :
                      analysis.stressIndicators.diseaseRisk > 0.2 ? 'text-yellow-400' :
                      'text-green-400'
                    )}>
                      {(analysis.stressIndicators.diseaseRisk * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600/30 rounded-full h-2">
                    <div 
                      className={cn(
                        'h-2 rounded-full transition-all duration-1000',
                        analysis.stressIndicators.diseaseRisk > 0.4 ? 'bg-red-400' :
                        analysis.stressIndicators.diseaseRisk > 0.2 ? 'bg-yellow-400' :
                        'bg-green-400'
                      )}
                      style={{ width: `${analysis.stressIndicators.diseaseRisk * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* NDVI Trend */}
            <GlassCard className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                <span>NDVI Trend</span>
                {getTrendIcon(calculateNDVITrend() || undefined)}
              </h4>
              
              <div className="space-y-3">
                {ndviHistory.slice(-5).map((point, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn('w-2 h-2 rounded-full', getHealthBgColor(point.health))} />
                      <span className="text-gray-300 text-sm">
                        {point.date.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-medium">
                        {point.ndvi.toFixed(3)}
                      </span>
                      <span className={cn('text-xs capitalize', getHealthColor(point.health))}>
                        {point.health}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Change from Previous */}
              {analysis.changeFromPrevious && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">
                      Change ({analysis.changeFromPrevious.daysCompared} days)
                    </span>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(analysis.changeFromPrevious.healthTrend)}
                      <span className={cn(
                        'font-medium text-sm',
                        analysis.changeFromPrevious.ndviChange > 0 ? 'text-green-400' :
                        analysis.changeFromPrevious.ndviChange < 0 ? 'text-red-400' :
                        'text-gray-400'
                      )}>
                        {analysis.changeFromPrevious.ndviChange > 0 ? '+' : ''}
                        {analysis.changeFromPrevious.ndviChange.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Recommendations */}
          <GlassCard className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-400" />
              <span>AI Recommendations</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getRecommendations().map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
            
            {getRecommendations().length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No specific recommendations at this time</p>
                <p className="text-sm mt-1">Continue monitoring field conditions</p>
              </div>
            )}
          </GlassCard>

          {/* Analysis Metadata */}
          <div className="text-center text-gray-400 text-sm space-y-1">
            <p>Analysis Date: {analysis.date.toLocaleString()}</p>
            <p>Crop Density: {(analysis.cropDensity * 100).toFixed(0)}%</p>
          </div>
        </>
      )}

      {/* Loading State */}
      {loading && !analysis && (
        <GlassCard className="p-12 text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-400 animate-spin" />
          <p className="text-white text-lg">Analyzing satellite imagery...</p>
          <p className="text-gray-400 text-sm mt-2">Processing NDVI and vegetation health data</p>
        </GlassCard>
      )}

      {/* Empty State */}
      {!loading && !analysis && !error && (
        <GlassCard className="p-12 text-center">
          <Satellite className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-white text-lg">No satellite analysis available</p>
          <p className="text-gray-400 text-sm mt-2">Click analyze to get current vegetation health data</p>
        </GlassCard>
      )}
    </div>
  );
}

export default SatelliteImageryAnalyzer;