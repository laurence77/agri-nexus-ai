import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface RecommendationResponse {
  success: boolean;
  analytics: {
    recommendations: string[];
    predictionType: string;
    accuracy: number;
  };
  fieldId: string;
  fieldName: string;
  generatedTimestamp: string;
}

const predictionTypes = [
  { value: 'yield_forecast', label: 'Yield Optimization' },
  { value: 'disease_risk', label: 'Disease Prevention' },
  { value: 'optimal_harvest', label: 'Optimal Harvest Timing' },
  { value: 'irrigation_schedule', label: 'Irrigation Scheduling' }
];

export const PersonalizedRecommendationsWidget: React.FC = () => {
  const [inputs, setInputs] = useState({
    fieldId: 'demo-field',
    tenantId: 'demo-tenant',
    predictionType: 'yield_forecast'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
          predictionType: inputs.predictionType,
          historicalData: [] // Optionally pass user/field data
        })
      });
      const data: RecommendationResponse = await res.json();
      if (!data.success) throw new Error('Failed to get recommendations');
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Personalized AI Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Recommendation Type</label>
            <select name="predictionType" value={inputs.predictionType} onChange={handleChange} className="glass-input w-full">
              {predictionTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
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
            <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
            {result.analytics.recommendations.length === 0 ? (
              <div className="text-gray-500">No recommendations available.</div>
            ) : (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                {result.analytics.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            )}
            <div className="mt-4 text-xs text-gray-500">
              <span>Type: {predictionTypes.find(t => t.value === result.analytics.predictionType)?.label || result.analytics.predictionType}</span>
              <span className="ml-4">Model Accuracy: {(result.analytics.accuracy * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizedRecommendationsWidget;