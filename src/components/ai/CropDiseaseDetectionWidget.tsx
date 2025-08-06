import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, UploadCloud, Image as ImageIcon, Shield } from 'lucide-react';

interface DetectionResult {
  name: string;
  confidence: number;
  description?: string;
  recommendedTreatment?: string;
}

interface DetectionResponse {
  success: boolean;
  detections: DetectionResult[];
  analysisTimestamp: string;
  fieldId: string;
  fieldName: string;
  metadata: any;
}

export const CropDiseaseDetectionWidget: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DetectionResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    setResults(null);
    setError(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('fieldId', 'demo-field'); // Replace with actual fieldId if available
    formData.append('tenantId', 'demo-tenant'); // Replace with actual tenantId if available

    try {
      const res = await fetch('/api/ai/crop-monitoring/detect-diseases', {
        method: 'POST',
        body: formData,
      });
      const data: DetectionResponse = await res.json();
      if (!data.success) throw new Error('Detection failed');
      setResults(data.detections);
    } catch (err: any) {
      setError(err.message || 'Failed to detect diseases');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-600" />
          <span>AI Crop Disease Detection</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <label htmlFor="disease-image-upload" className="cursor-pointer flex flex-col items-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-48 h-48 object-cover rounded shadow mb-2" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded shadow mb-2">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <span className="text-sm text-gray-600 flex items-center space-x-1">
                <UploadCloud className="w-4 h-4 mr-1" />
                <span>Choose a crop photo</span>
              </span>
              <input
                id="disease-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={!image || loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            {loading ? 'Analyzing...' : 'Analyze Photo'}
          </Button>
        </form>
        {error && (
          <div className="flex items-center space-x-2 text-red-600 mt-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        {results && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Detection Results</h3>
            {results.length === 0 ? (
              <div className="text-gray-500">No diseases detected. Your crop looks healthy!</div>
            ) : (
              <ul className="space-y-3">
                {results.map((result, idx) => (
                  <li key={idx} className="border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className="bg-green-100 text-green-800 text-xs">{result.name}</Badge>
                      <span className="text-xs text-gray-500">Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    {result.description && (
                      <div className="text-sm text-gray-700 mb-1">{result.description}</div>
                    )}
                    {result.recommendedTreatment && (
                      <div className="text-xs text-gray-600">Treatment: {result.recommendedTreatment}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropDiseaseDetectionWidget;