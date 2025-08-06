import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, Cloud, Sun, Droplets } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Mock data: Each entry is a month with rainfall (mm), temperature (°C), and yield (tons/ha)
const mockWeatherYieldData = [
  { month: 'Jan', rainfall: 80, temperature: 24, yield: 2.1 },
  { month: 'Feb', rainfall: 60, temperature: 26, yield: 2.3 },
  { month: 'Mar', rainfall: 120, temperature: 25, yield: 2.8 },
  { month: 'Apr', rainfall: 200, temperature: 23, yield: 3.2 },
  { month: 'May', rainfall: 180, temperature: 22, yield: 3.0 },
  { month: 'Jun', rainfall: 90, temperature: 21, yield: 2.5 },
  { month: 'Jul', rainfall: 70, temperature: 20, yield: 2.2 },
  { month: 'Aug', rainfall: 60, temperature: 21, yield: 2.0 },
  { month: 'Sep', rainfall: 100, temperature: 23, yield: 2.7 },
  { month: 'Oct', rainfall: 150, temperature: 24, yield: 3.1 },
  { month: 'Nov', rainfall: 170, temperature: 25, yield: 3.3 },
  { month: 'Dec', rainfall: 110, temperature: 26, yield: 2.9 }
];

export const WeatherImpactAnalysis: React.FC = () => {
  // In a real app, fetch data for the selected farm/field
  const [data, setData] = useState(mockWeatherYieldData);

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-500" />
          Weather Impact on Yield
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Yield (tons/ha)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="rainfall" stroke="#38bdf8" name="Rainfall (mm)" activeDot={{ r: 8 }} />
              <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#fbbf24" name="Temperature (°C)" />
              <Line yAxisId="right" type="monotone" dataKey="yield" stroke="#10b981" name="Yield (tons/ha)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <span>This chart shows the relationship between rainfall, temperature, and crop yield over the past year.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherImpactAnalysis;