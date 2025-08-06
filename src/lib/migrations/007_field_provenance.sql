-- Field-level Data Provenance Table
CREATE TABLE IF NOT EXISTS field_provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL, -- references the main record
  table_name TEXT NOT NULL,
  field_name TEXT NOT NULL,
  value TEXT,
  source TEXT,
  entered_by UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  transformation TEXT,
  previous_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_field_provenance_record ON field_provenance (record_id, table_name);
CREATE INDEX idx_field_provenance_field ON field_provenance (field_name);