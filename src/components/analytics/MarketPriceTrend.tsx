import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign } from 'lucide-react';
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

const crops = ['Maize', 'Beans', 'Tomatoes', 'Onions', 'Potatoes'];

const mockPriceData: Record<string, { month: string; price: number }[]> = {
  Maize: [
    { month: 'Jan', price: 180 }, { month: 'Feb', price: 185 }, { month: 'Mar', price: 190 },
    { month: 'Apr', price: 200 }, { month: 'May', price: 210 }, { month: 'Jun', price: 220 },
    { month: 'Jul', price: 215 }, { month: 'Aug', price: 210 }, { month: 'Sep', price: 205 },
    { month: 'Oct', price: 210 }, { month: 'Nov', price: 220 }, { month: 'Dec', price: 225 }
  ],
  Beans: [
    { month: 'Jan', price: 300 }, { month: 'Feb', price: 310 }, { month: 'Mar', price: 320 },
    { month: 'Apr', price: 330 }, { month: 'May', price: 340 }, { month: 'Jun', price: 350 },
    { month: 'Jul', price: 345 }, { month: 'Aug', price: 340 }, { month: 'Sep', price: 335 },
    { month: 'Oct', price: 340 }, { month: 'Nov', price: 350 }, { month: 'Dec', price: 355 }
  ],
  Tomatoes: [
    { month: 'Jan', price: 120 }, { month: 'Feb', price: 130 }, { month: 'Mar', price: 140 },
    { month: 'Apr', price: 160 }, { month: 'May', price: 180 }, { month: 'Jun', price: 200 },
    { month: 'Jul', price: 190 }, { month: 'Aug', price: 180 }, { month: 'Sep', price: 170 },
    { month: 'Oct', price: 180 }, { month: 'Nov', price: 200 }, { month: 'Dec', price: 210 }
  ],
  Onions: [
    { month: 'Jan', price: 90 }, { month: 'Feb', price: 95 }, { month: 'Mar', price: 100 },
    { month: 'Apr', price: 110 }, { month: 'May', price: 120 }, { month: 'Jun', price: 130 },
    { month: 'Jul', price: 125 }, { month: 'Aug', price: 120 }, { month: 'Sep', price: 115 },
    { month: 'Oct', price: 120 }, { month: 'Nov', price: 130 }, { month: 'Dec', price: 135 }
  ],
  Potatoes: [
    { month: 'Jan', price: 150 }, { month: 'Feb', price: 155 }, { month: 'Mar', price: 160 },
    { month: 'Apr', price: 170 }, { month: 'May', price: 180 }, { month: 'Jun', price: 190 },
    { month: 'Jul', price: 185 }, { month: 'Aug', price: 180 }, { month: 'Sep', price: 175 },
    { month: 'Oct', price: 180 }, { month: 'Nov', price: 190 }, { month: 'Dec', price: 195 }
  ]
};

export const MarketPriceTrend: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('Maize');
  const data = mockPriceData[selectedCrop];

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          Market Price Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Select Crop</label>
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            className="glass-input w-48"
          >
            {crops.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Price (KES)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, '']} />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#a21caf" name="Price (KES)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <span>This chart shows the market price trend for the selected crop over the past year.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketPriceTrend;