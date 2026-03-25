-- supabase/migrations/tables/feature_flags.sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  flag_key TEXT NOT NULL, -- e.g. TRADING, AUTOMATION, COPY_TRADING
  enabled BOOLEAN DEFAULT true,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, flag_key)
);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone in the tenant can read the flags
CREATE POLICY "Users can read tenant flags"
  ON feature_flags
  FOR SELECT
  USING (
    tenant_id = get_current_tenant_id()
  );

-- Only tenant admins can modify feature flags
CREATE POLICY "Admins can manage feature flags"
  ON feature_flags
  FOR ALL
  USING (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

CREATE TRIGGER update_feature_flags_modtime
BEFORE UPDATE ON feature_flags
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();