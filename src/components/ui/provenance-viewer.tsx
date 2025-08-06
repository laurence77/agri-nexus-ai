import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  User,
  Database,
  History,
  Eye,
  EyeOff,
  Calendar,
  Hash,
  ArrowRight,
  Info,
  AlertCircle,
  CheckCircle,
  Settings,
  Download
} from "lucide-react";
import { ProvenanceService, FieldProvenance } from '@/lib/provenance';

interface ProvenanceViewerProps {
  tableName: string;
  recordId: string;
  fieldName?: string; // If provided, shows only this field's provenance
  showValue?: boolean; // Whether to show the actual field values
  maxHistory?: number;
  className?: string;
}

interface ProvenanceDisplayProps {
  provenance: FieldProvenance;
  showValue?: boolean;
}

const ProvenanceDisplay: React.FC<ProvenanceDisplayProps> = ({ provenance, showValue = true }) => {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'user': return <User className="w-4 h-4" />;
      case 'sensor': return <Database className="w-4 h-4" />;
      case 'api': return <Settings className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'import': return <Download className="w-4 h-4" />;
      case 'calculation': return <Hash className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'sensor': return 'bg-green-100 text-green-800';
      case 'api': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'import': return 'bg-orange-100 text-orange-800';
      case 'calculation': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : parsed;
    } catch {
      return value;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getSourceIcon(provenance.source)}
          <Badge className={getSourceColor(provenance.source)}>
            {provenance.source}
          </Badge>
          {provenance.transformation && (
            <Badge variant="outline" className="text-xs">
              {provenance.transformation}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date(provenance.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {showValue && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Current Value:</div>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono break-all">
            {formatValue(provenance.value)}
          </div>
        </div>
      )}

      {provenance.previous_value && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Previous Value:</div>
          <div className="bg-red-50 p-3 rounded text-sm font-mono break-all border-l-4 border-red-200">
            {formatValue(provenance.previous_value)}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Field: {provenance.field_name}</span>
        {provenance.entered_by && (
          <span>By: {provenance.entered_by}</span>
        )}
      </div>
    </div>
  );
};

export const ProvenanceViewer: React.FC<ProvenanceViewerProps> = ({
  tableName,
  recordId,
  fieldName,
  showValue = true,
  maxHistory = 10,
  className = ""
}) => {
  const [provenanceData, setProvenanceData] = useState<FieldProvenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showValues, setShowValues] = useState(showValue);

  useEffect(() => {
    loadProvenance();
  }, [tableName, recordId, fieldName]);

  const loadProvenance = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: FieldProvenance[];
      if (fieldName) {
        data = await ProvenanceService.getFieldProvenance(tableName, recordId, fieldName);
      } else {
        data = await ProvenanceService.getRecordProvenance(tableName, recordId);
      }

      // Limit the history
      data = data.slice(0, maxHistory);
      setProvenanceData(data);

    } catch (err) {
      setError('Failed to load provenance data');
      console.error('Provenance loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupByField = (data: FieldProvenance[]) => {
    const groups: Record<string, FieldProvenance[]> = {};
    data.forEach(item => {
      if (!groups[item.field_name]) {
        groups[item.field_name] = [];
      }
      groups[item.field_name].push(item);
    });
    return groups;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Data Provenance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>Data Provenance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (provenanceData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Data Provenance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No provenance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fieldGroups = groupByField(provenanceData);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Data Provenance</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValues(!showValues)}
              className="flex items-center space-x-1"
            >
              {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showValues ? 'Hide' : 'Show'} Values</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {fieldName ? (
          // Single field view
          <div className="space-y-4">
            {provenanceData.map((provenance, index) => (
              <ProvenanceDisplay
                key={provenance.id}
                provenance={provenance}
                showValue={showValues}
              />
            ))}
          </div>
        ) : (
          // Multi-field view with tabs
          <Tabs defaultValue={Object.keys(fieldGroups)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              {Object.keys(fieldGroups).map((fieldName) => (
                <TabsTrigger key={fieldName} value={fieldName} className="text-xs">
                  {fieldName}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(fieldGroups).map(([fieldName, provenances]) => (
              <TabsContent key={fieldName} value={fieldName} className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">{fieldName}</span>
                  <Badge variant="outline">{provenances.length} changes</Badge>
                </div>
                {provenances.map((provenance) => (
                  <ProvenanceDisplay
                    key={provenance.id}
                    provenance={provenance}
                    showValue={showValues}
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}; 