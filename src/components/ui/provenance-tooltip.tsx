import React, { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Database,
  Settings,
  Download,
  Hash,
  Info,
  History,
  Calendar,
  Eye
} from "lucide-react";
import { ProvenanceService, FieldProvenance } from '@/lib/provenance';

interface ProvenanceTooltipProps {
  tableName: string;
  recordId: string;
  fieldName: string;
  children: React.ReactNode;
  className?: string;
}

export const ProvenanceTooltip: React.FC<ProvenanceTooltipProps> = ({
  tableName,
  recordId,
  fieldName,
  children,
  className = ""
}) => {
  const [provenance, setProvenance] = useState<FieldProvenance | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProvenance = async () => {
    try {
      setLoading(true);
      const data = await ProvenanceService.getFieldProvenance(tableName, recordId, fieldName);
      if (data.length > 0) {
        setProvenance(data[0]); // Get the latest provenance
      }
    } catch (error) {
      console.error('Failed to load provenance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'user': return <User className="w-3 h-3" />;
      case 'sensor': return <Database className="w-3 h-3" />;
      case 'api': return <Settings className="w-3 h-3" />;
      case 'system': return <Settings className="w-3 h-3" />;
      case 'import': return <Download className="w-3 h-3" />;
      case 'calculation': return <Hash className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
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

  if (!provenance) {
    return <span className={className}>{children}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild onMouseEnter={loadProvenance}>
          <span className={`inline-flex items-center space-x-1 cursor-help ${className}`}>
            {children}
            <History className="w-3 h-3 text-gray-400" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-80 p-0">
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getSourceIcon(provenance.source)}
                <Badge className={`text-xs ${getSourceColor(provenance.source)}`}>
                  {provenance.source}
                </Badge>
                {provenance.transformation && (
                  <Badge variant="outline" className="text-xs">
                    {provenance.transformation}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(provenance.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600">
              <div>Field: <span className="font-medium">{provenance.field_name}</span></div>
              {provenance.entered_by && (
                <div>By: <span className="font-medium">{provenance.entered_by}</span></div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">Last updated</span>
              <span className="text-xs font-medium">
                {new Date(provenance.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 