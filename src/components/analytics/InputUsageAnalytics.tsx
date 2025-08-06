import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, Droplets, Leaf, Shield } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const mockInputUsageData = [
  { month: 'Jan', fertilizer: 120, water: 800, pesticide: 15 },
  { month: 'Feb', fertilizer: 100, water: 700, pesticide: 12 },
  { month: 'Mar', fertilizer: 140, water: 900, pesticide: 18 },
  { month: 'Apr', fertilizer: 160, water: 1100, pesticide: 20 },
  { month: 'May', fertilizer: 150, water: 1050, pesticide: 17 },
  { month: 'Jun', fertilizer: 130, water: 950, pesticide: 14 },
  { month: 'Jul', fertilizer: 110, water: 800, pesticide: 10 },
  { month: 'Aug', fertilizer: 100, water: 750, pesticide: 9 },
  { month: 'Sep', fertilizer: 120, water: 850, pesticide: 13 },
  { month: 'Oct', fertilizer: 140, water: 950, pesticide: 16 },
  { month: 'Nov', fertilizer: 150, water: 1000, pesticide: 18 },
  { month: 'Dec', fertilizer: 130, water: 900, pesticide: 15 }
];

export const InputUsageAnalytics: React.FC = () => {
  const [data] = useState(mockInputUsageData);

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-500" />
          Input Usage Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Usage', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="fertilizer" stackId="a" fill="#84cc16" name="Fertilizer (kg)" icon={<Leaf />} />
              <Bar dataKey="water" stackId="a" fill="#38bdf8" name="Water (L)" icon={<Droplets />} />
              <Bar dataKey="pesticide" stackId="a" fill="#f59e42" name="Pesticide (L)" icon={<Shield />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <span>This chart shows the monthly usage of fertilizer, water, and pesticide over the past year.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default InputUsageAnalytics;