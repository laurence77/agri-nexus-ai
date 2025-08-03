import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface YieldData {
  month: string;
  actual: number;
  predicted: number;
  target: number;
  crop: string;
}

interface YieldTrendChartProps {
  timeframe?: '6months' | '1year' | '2years';
  cropType?: string;
}

const YieldTrendChart = ({ timeframe = '1year', cropType = 'maize' }: YieldTrendChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [animationProgress, setAnimationProgress] = useState(0);

  const yieldData: YieldData[] = [
    { month: 'Jan', actual: 2.1, predicted: 2.3, target: 2.5, crop: 'Maize' },
    { month: 'Feb', actual: 2.4, predicted: 2.5, target: 2.5, crop: 'Maize' },
    { month: 'Mar', actual: 2.8, predicted: 2.7, target: 2.5, crop: 'Maize' },
    { month: 'Apr', actual: 3.1, predicted: 3.0, target: 2.5, crop: 'Maize' },
    { month: 'May', actual: 3.5, predicted: 3.2, target: 2.5, crop: 'Maize' },
    { month: 'Jun', actual: 3.2, predicted: 3.4, target: 2.5, crop: 'Maize' },
    { month: 'Jul', actual: 2.9, predicted: 3.1, target: 2.5, crop: 'Maize' },
    { month: 'Aug', actual: 3.3, predicted: 3.3, target: 2.5, crop: 'Maize' },
    { month: 'Sep', actual: 3.6, predicted: 3.5, target: 2.5, crop: 'Maize' },
    { month: 'Oct', actual: 3.4, predicted: 3.7, target: 2.5, crop: 'Maize' },
    { month: 'Nov', actual: 3.8, predicted: 3.8, target: 2.5, crop: 'Maize' },
    { month: 'Dec', actual: 4.1, predicted: 4.0, target: 2.5, crop: 'Maize' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev < 100 ? prev + 2 : 100));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const maxValue = Math.max(...yieldData.map(d => Math.max(d.actual, d.predicted, d.target)));
  const minValue = Math.min(...yieldData.map(d => Math.min(d.actual, d.predicted, d.target)));
  const range = maxValue - minValue;

  const getBarHeight = (value: number) => {
    return ((value - minValue) / range) * 200; // 200px max height
  };

  const currentYield = yieldData[yieldData.length - 1].actual;
  const lastYield = yieldData[yieldData.length - 2].actual;
  const growthRate = ((currentYield - lastYield) / lastYield * 100);
  const targetAchievement = (currentYield / yieldData[yieldData.length - 1].target * 100);

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Yield Trend Analysis</h3>
            <p className="text-sm text-gray-600">Tons per acre • {cropType.charAt(0).toUpperCase() + cropType.slice(1)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="glass-input !padding-2 text-sm border-0"
          >
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
            <option value="2years">2 Years</option>
          </select>
          <Badge className="glass-badge success">
            Live Data
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-emerald-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <span className="text-2xl font-bold text-emerald-600">{currentYield}</span>
            <span className="text-sm text-gray-600">tons/acre</span>
          </div>
          <p className="text-sm text-emerald-700">Current Yield</p>
          <div className="flex items-center justify-center space-x-1 mt-1">
            {growthRate > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
            <span className={`text-xs ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <span className="text-2xl font-bold text-blue-600">{yieldData[yieldData.length - 1].predicted}</span>
            <span className="text-sm text-gray-600">tons/acre</span>
          </div>
          <p className="text-sm text-blue-700">AI Prediction</p>
          <div className="flex items-center justify-center space-x-1 mt-1">
            <Activity className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-blue-600">Next month</span>
          </div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <span className="text-2xl font-bold text-purple-600">{targetAchievement.toFixed(0)}%</span>
          </div>
          <p className="text-sm text-purple-700">Target Achievement</p>
          <div className="flex items-center justify-center space-x-1 mt-1">
            {targetAchievement >= 100 ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Target className="w-3 h-3 text-orange-500" />}
            <span className={`text-xs ${targetAchievement >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {targetAchievement >= 100 ? 'Exceeded' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative bg-white/50 rounded-xl p-6" style={{ height: '280px' }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-6 bottom-6 flex flex-col justify-between text-xs text-gray-500 w-8">
          <span>{maxValue.toFixed(1)}</span>
          <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
          <span>{minValue.toFixed(1)}</span>
        </div>

        {/* Chart content */}
        <div className="ml-10 mr-4 h-full flex items-end justify-between space-x-1">
          {yieldData.map((data, index) => {
            const actualHeight = getBarHeight(data.actual);
            const predictedHeight = getBarHeight(data.predicted);
            const targetHeight = getBarHeight(data.target);
            const animatedHeight = (actualHeight * animationProgress) / 100;
            
            return (
              <div key={index} className="flex flex-col items-center space-y-2" style={{ width: '40px' }}>
                {/* Bars */}
                <div className="relative flex items-end space-x-1" style={{ height: '200px' }}>
                  {/* Target line */}
                  <div 
                    className="absolute w-full border-t-2 border-dashed border-gray-400"
                    style={{ bottom: `${targetHeight}px` }}
                  ></div>
                  
                  {/* Actual yield bar */}
                  <div 
                    className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm transition-all duration-1000 ease-out"
                    style={{ 
                      width: '12px', 
                      height: `${animatedHeight}px`,
                      opacity: animationProgress / 100
                    }}
                  ></div>
                  
                  {/* Predicted yield bar */}
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-1000 ease-out border border-blue-300"
                    style={{ 
                      width: '12px', 
                      height: `${(predictedHeight * animationProgress) / 100}px`,
                      opacity: (animationProgress / 100) * 0.7
                    }}
                  ></div>
                </div>
                
                {/* Month label */}
                <span className="text-xs text-gray-600 font-medium">{data.month}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 right-4 flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
            <span className="text-gray-600">Actual</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm border border-blue-300"></div>
            <span className="text-gray-600">AI Predicted</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-1 border-t-2 border-dashed border-gray-400"></div>
            <span className="text-gray-600">Target</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-6 space-y-3">
        <div className="glass-notification success">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Yield Performance Excellent</p>
              <p className="text-sm text-green-700">
                Current yield of {currentYield} tons/acre exceeds target by {((currentYield / yieldData[yieldData.length - 1].target - 1) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="glass-notification info">
          <div className="flex items-center space-x-3">
            <Activity className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">AI Recommendation</p>
              <p className="text-sm text-blue-700">
                Maintain current fertilization schedule. Weather conditions favor continued growth in coming weeks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldTrendChart;