import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassButton } from '@/components/glass';
import { 
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  Merge,
  User,
  Server,
  Calendar,
  Info,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { OfflineData, ConflictResolution } from '@/services/pwa/offline-service';

interface SyncConflictResolverProps {
  conflicts: OfflineData[];
  onResolveConflict: (itemId: string, resolution: ConflictResolution) => Promise<boolean>;
  onClose: () => void;
  className?: string;
}

interface ConflictItem extends OfflineData {
  conflictData: {
    server: any;
    client: any;
  };
}

/**
 * Sync Conflict Resolver Component
 * Helps users resolve data conflicts when syncing offline changes
 */
export function SyncConflictResolver({ 
  conflicts, 
  onResolveConflict, 
  onClose,
  className 
}: SyncConflictResolverProps) {
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (conflicts.length > 0 && !selectedConflict) {
      setSelectedConflict(conflicts[0] as ConflictItem);
    }
  }, [conflicts, selectedConflict]);

  const handleResolveConflict = async (resolution: ConflictResolution) => {
    if (!selectedConflict) return;

    setResolving(selectedConflict.id);
    try {
      const success = await onResolveConflict(selectedConflict.id, resolution);
      if (success) {
        // Move to next conflict or close if none left
        const currentIndex = conflicts.findIndex(c => c.id === selectedConflict.id);
        const nextConflict = conflicts[currentIndex + 1];
        
        if (nextConflict) {
          setSelectedConflict(nextConflict as ConflictItem);
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setResolving(null);
    }
  };

  const toggleFieldExpansion = (field: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(field)) {
      newExpanded.delete(field);
    } else {
      newExpanded.add(field);
    }
    setExpandedFields(newExpanded);
  };

  const renderConflictComparison = (conflict: ConflictItem) => {
    const clientData = conflict.data;
    const serverData = conflict.conflictData.server;
    
    const allFields = new Set([
      ...Object.keys(clientData || {}),
      ...Object.keys(serverData || {})
    ]);

    const systemFields = ['id', 'created_at', 'updated_at', 'tenant_id'];
    const userFields = Array.from(allFields).filter(field => !systemFields.includes(field));

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-4 border-blue-500/30">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Your Changes</span>
            </div>
            <div className="text-sm text-gray-300">
              <p>Modified: {new Date(clientData.updated_at || conflict.timestamp).toLocaleString()}</p>
              <p>Device: Local changes</p>
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-green-500/30">
            <div className="flex items-center space-x-2 mb-3">
              <Server className="h-4 w-4 text-green-400" />
              <span className="text-green-400 font-medium">Server Version</span>
            </div>
            <div className="text-sm text-gray-300">
              <p>Modified: {new Date(serverData.updated_at).toLocaleString()}</p>
              <p>Source: Server database</p>
            </div>
          </GlassCard>
        </div>

        {/* Field-by-field comparison */}
        <div className="space-y-3">
          <h4 className="text-white font-medium flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>Field Changes</span>
          </h4>

          {userFields.map((field) => {
            const clientValue = clientData[field];
            const serverValue = serverData[field];
            const hasConflict = JSON.stringify(clientValue) !== JSON.stringify(serverValue);
            const isExpanded = expandedFields.has(field);

            return (
              <div 
                key={field}
                className={cn(
                  'border rounded-lg p-3',
                  hasConflict ? 'border-red-500/30 bg-red-500/5' : 'border-gray-600/30'
                )}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleFieldExpansion(field)}
                >
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-white font-medium capitalize">
                      {field.replace(/_/g, ' ')}
                    </span>
                    {hasConflict && (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  
                  {!hasConflict && (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                      <div className="text-xs text-blue-400 mb-1">Your Version</div>
                      <div className="text-white text-sm font-mono break-all">
                        {typeof clientValue === 'object' 
                          ? JSON.stringify(clientValue, null, 2)
                          : String(clientValue || 'null')
                        }
                      </div>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                      <div className="text-xs text-green-400 mb-1">Server Version</div>
                      <div className="text-white text-sm font-mono break-all">
                        {typeof serverValue === 'object' 
                          ? JSON.stringify(serverValue, null, 2)
                          : String(serverValue || 'null')
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className={cn('fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4', className)}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <GlassCard className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                <span>Sync Conflicts</span>
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} need{conflicts.length === 1 ? 's' : ''} resolution
              </p>
            </div>
            
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </GlassButton>
          </div>

          {/* Conflict Navigation */}
          {conflicts.length > 1 && (
            <div className="flex items-center justify-between mb-6 p-3 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">
                  Conflict {conflicts.findIndex(c => c.id === selectedConflict?.id) + 1} of {conflicts.length}
                </span>
                
                <div className="flex space-x-2">
                  {conflicts.map((conflict, index) => (
                    <button
                      key={conflict.id}
                      onClick={() => setSelectedConflict(conflict as ConflictItem)}
                      className={cn(
                        'w-2 h-2 rounded-full',
                        conflict.id === selectedConflict?.id ? 'bg-blue-400' : 'bg-gray-600'
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const currentIndex = conflicts.findIndex(c => c.id === selectedConflict?.id);
                    const prevConflict = conflicts[currentIndex - 1];
                    if (prevConflict) {
                      setSelectedConflict(prevConflict as ConflictItem);
                    }
                  }}
                  disabled={conflicts.findIndex(c => c.id === selectedConflict?.id) === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const currentIndex = conflicts.findIndex(c => c.id === selectedConflict?.id);
                    const nextConflict = conflicts[currentIndex + 1];
                    if (nextConflict) {
                      setSelectedConflict(nextConflict as ConflictItem);
                    }
                  }}
                  disabled={conflicts.findIndex(c => c.id === selectedConflict?.id) === conflicts.length - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                </GlassButton>
              </div>
            </div>
          )}

          {/* Conflict Details */}
          <div className="flex-1 overflow-y-auto mb-6">
            {selectedConflict && (
              <div className="space-y-6">
                {/* Conflict Info */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h3 className="text-yellow-400 font-medium">
                        Data Conflict Detected
                      </h3>
                      <p className="text-gray-300 text-sm mt-1">
                        Your offline changes conflict with server data. 
                        Choose how to resolve this conflict:
                      </p>
                    </div>
                  </div>
                </div>

                {renderConflictComparison(selectedConflict)}
              </div>
            )}
          </div>

          {/* Resolution Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <GlassButton
              variant="primary"
              onClick={() => handleResolveConflict({ strategy: 'client_wins' })}
              disabled={!!resolving}
              className="flex-1"
            >
              {resolving === selectedConflict?.id ? (
                'Resolving...'
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Use My Changes
                </>
              )}
            </GlassButton>

            <GlassButton
              variant="secondary"
              onClick={() => handleResolveConflict({ strategy: 'server_wins' })}
              disabled={!!resolving}
              className="flex-1"
            >
              <Server className="h-4 w-4 mr-2" />
              Use Server Version
            </GlassButton>

            <GlassButton
              variant="secondary"
              onClick={() => handleResolveConflict({ strategy: 'merge' })}
              disabled={!!resolving}
              className="flex-1"
            >
              <Merge className="h-4 w-4 mr-2" />
              Auto Merge
            </GlassButton>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <p>• <strong>Use My Changes:</strong> Keep your offline modifications</p>
            <p>• <strong>Use Server Version:</strong> Discard your changes and use server data</p>
            <p>• <strong>Auto Merge:</strong> Automatically combine both versions (recommended for most cases)</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default SyncConflictResolver;