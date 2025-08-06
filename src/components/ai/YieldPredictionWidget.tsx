import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

interface YieldPrediction {
  value: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

interface PredictionResponse {
  success: boolean;
  analytics: {
    predictions: Array<{
      date: string;
      value: number;
      confidence: number;
      factors: string[];
    }>;
    recommendations: string[];
    accuracy: number;
  };
  fieldId: string;
  fieldName: string;
  generatedTimestamp: string;
}

export const YieldPredictionWidget: React.FC = () => {
  // Simple state for demo; in production, use form libraries and validation
  const [inputs, setInputs] = useState({
    fieldId: 'demo-field',
    tenantId: 'demo-tenant',
    cropType: 'maize',
    rainfall: 800,
    temperature: 25,
    soilPh: 6.5,
    nitrogen: 40,
    phosphorus: 20,
    potassium: 100,
    irrigation: 2,
    fertilizer: 2,
    pest: 1,
    weeding: 2
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/ai/crop-monitoring/generate-predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId: inputs.fieldId,
          tenantId: inputs.tenantId,
          predictionType: 'yield_forecast',
          historicalData: [{
            cropType: inputs.cropType,
            rainfall: Number(inputs.rainfall),
            temperature: Number(inputs.temperature),
            soilPh: Number(inputs.soilPh),
            nitrogen: Number(inputs.nitrogen),
            phosphorus: Number(inputs.phosphorus),
            potassium: Number(inputs.potassium),
            irrigation: Number(inputs.irrigation),
            fertilizer: Number(inputs.fertilizer),
            pest: Number(inputs.pest),
            weeding: Number(inputs.weeding)
          }]
        })
      });
      const data: PredictionResponse = await res.json();
      if (!data.success) throw new Error('Prediction failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to predict yield');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>AI Yield Prediction</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Crop Type</label>
              <select name="cropType" value={inputs.cropType} onChange={handleChange} className="glass-input w-full">
                <option value="maize">Maize</option>
                <option value="beans">Beans</option>
                <option value="tomatoes">Tomatoes</option>
                <option value="onions">Onions</option>
                <option value="potatoes">Potatoes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rainfall (mm)</label>
              <input type="number" name="rainfall" value={inputs.rainfall} onChange={handleChange} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Temperature (°C)</label>
              <input type="number" name="temperature" value={inputs.temperature} onChange={handleChange} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Soil pH</label>
              <input type="number" name="soilPh" value={inputs.soilPh} onChange={handleChange} className="glass-input w-full" step="0.1" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nitrogen (mg/kg)</label>
              <input type="number" name="nitrogen" value={inputs.nitrogen} onChange={handleChange} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phosphorus (mg/kg)</label>
              <input type="number" name="phosphorus" value={inputs.phosphorus} onChange={handleChange} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Potassium (mg/kg)</label>
              <input type="number" name="potassium" value={inputs.potassium} onChange={handleChange} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Irrigation (per month)</label>
              <input type="number" name="irrigation" value={inputs.irrigation} onChange={handleChange} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fertilizer Applications</label>
              <input type="number" name="fertilizer" value={inputs.fertilizer} onChange={handleChange} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pest Applications</label>
              <input type="number" name="pest" value={inputs.pest} onChange={handleChange} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Weeding Frequency</label>
              <input type="number" name="weeding" value={inputs.weeding} onChange={handleChange} className="glass-input w-full" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            {loading ? 'Predicting...' : 'Predict Yield'}
          </Button>
        </form>
        {error && (
          <div className="flex items-center space-x-2 text-red-600 mt-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        {result && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Yield Prediction</h3>
            {result.analytics.predictions.length === 0 ? (
              <div className="text-gray-500">No prediction available.</div>
            ) : (
              <ul className="space-y-3">
                {result.analytics.predictions.map((pred, idx) => (
                  <li key={idx} className="border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">{inputs.cropType}</Badge>
                      <span className="text-xs text-gray-500">Predicted Yield: <span className="font-semibold">{pred.value.toFixed(2)} tons/ha</span></span>
                      <span className="text-xs text-gray-500">Confidence: {(pred.confidence * 100).toFixed(1)}%</span>
                    </div>
                    {pred.factors && pred.factors.length > 0 && (
                      <div className="text-xs text-gray-600">Factors: {pred.factors.join(', ')}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {result.analytics.recommendations && result.analytics.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-1">Recommendations</h4>
                <ul className="list-disc list-inside text-xs text-gray-700">
                  {result.analytics.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YieldPredictionWidget;