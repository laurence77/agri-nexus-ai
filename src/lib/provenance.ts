import { supabase } from '@/lib/supabase';

export interface FieldProvenance {
  id: string;
  record_id: string;
  table_name: string;
  field_name: string;
  value: string;
  source: string;
  entered_by?: string;
  timestamp: string;
  transformation?: string;
  previous_value?: string;
  created_at: string;
}

export interface ProvenanceMetadata {
  source: 'user' | 'sensor' | 'import' | 'api' | 'system' | 'calculation' | string;
  entered_by?: string;
  transformation?: string;
  timestamp?: string;
}

export class ProvenanceService {
  private static supabase = supabase;

  /**
   * Record provenance for a single field change
   */
  static async recordFieldChange(
    tableName: string,
    recordId: string,
    fieldName: string,
    newValue: any,
    metadata: ProvenanceMetadata,
    previousValue?: any
  ): Promise<void> {
    try {
      const provenanceRecord: Omit<FieldProvenance, 'id' | 'created_at'> = {
        record_id: recordId,
        table_name: tableName,
        field_name: fieldName,
        value: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
        source: metadata.source,
        entered_by: metadata.entered_by,
        timestamp: metadata.timestamp || new Date().toISOString(),
        transformation: metadata.transformation,
        previous_value: previousValue ? 
          (typeof previousValue === 'object' ? JSON.stringify(previousValue) : String(previousValue)) : 
          undefined
      };

      await this.supabase
        .from('field_provenance')
        .insert(provenanceRecord);

    } catch (error) {
      console.error('Failed to record field provenance:', error);
      // Don't throw - provenance failure shouldn't break main operations
    }
  }

  /**
   * Record provenance for multiple field changes in a single record
   */
  static async recordRecordChanges(
    tableName: string,
    recordId: string,
    changes: Record<string, { newValue: any; previousValue?: any }>,
    metadata: ProvenanceMetadata
  ): Promise<void> {
    const promises = Object.entries(changes).map(([fieldName, { newValue, previousValue }]) =>
      this.recordFieldChange(tableName, recordId, fieldName, newValue, metadata, previousValue)
    );

    await Promise.all(promises);
  }

  /**
   * Get provenance history for a specific field
   */
  static async getFieldProvenance(
    tableName: string,
    recordId: string,
    fieldName: string
  ): Promise<FieldProvenance[]> {
    try {
      const { data, error } = await this.supabase
        .from('field_provenance')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .eq('field_name', fieldName)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Failed to get field provenance:', error);
      return [];
    }
  }

  /**
   * Get provenance history for an entire record
   */
  static async getRecordProvenance(
    tableName: string,
    recordId: string
  ): Promise<FieldProvenance[]> {
    try {
      const { data, error } = await this.supabase
        .from('field_provenance')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Failed to get record provenance:', error);
      return [];
    }
  }

  /**
   * Get current field values with their latest provenance
   */
  static async getCurrentFieldValues(
    tableName: string,
    recordId: string
  ): Promise<Record<string, { value: any; provenance: FieldProvenance }>> {
    try {
      const { data, error } = await this.supabase
        .from('field_provenance')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const result: Record<string, { value: any; provenance: FieldProvenance }> = {};
      
      // Group by field_name and take the latest entry for each
      const fieldMap = new Map<string, FieldProvenance>();
      data?.forEach(provenance => {
        if (!fieldMap.has(provenance.field_name)) {
          fieldMap.set(provenance.field_name, provenance);
        }
      });

      fieldMap.forEach((provenance, fieldName) => {
        // Try to parse JSON values back to objects
        let value: any = provenance.value;
        try {
          const parsed = JSON.parse(provenance.value);
          value = parsed;
        } catch {
          // Keep as string if not valid JSON
        }

        result[fieldName] = { value, provenance };
      });

      return result;

    } catch (error) {
      console.error('Failed to get current field values:', error);
      return {};
    }
  }

  /**
   * Audit trail: Get all changes made by a specific user
   */
  static async getUserChanges(
    userId: string,
    tableName?: string,
    limit: number = 100
  ): Promise<FieldProvenance[]> {
    try {
      let query = this.supabase
        .from('field_provenance')
        .select('*')
        .eq('entered_by', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (tableName) {
        query = query.eq('table_name', tableName);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Failed to get user changes:', error);
      return [];
    }
  }

  /**
   * Audit trail: Get all changes from a specific source
   */
  static async getSourceChanges(
    source: string,
    tableName?: string,
    limit: number = 100
  ): Promise<FieldProvenance[]> {
    try {
      let query = this.supabase
        .from('field_provenance')
        .select('*')
        .eq('source', source)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (tableName) {
        query = query.eq('table_name', tableName);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Failed to get source changes:', error);
      return [];
    }
  }
} 
