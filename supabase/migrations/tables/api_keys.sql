-- supabase/migrations/tables/api_keys.sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  label TEXT,
  permissions TEXT[],
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can manage their own API keys within their current tenant
CREATE POLICY "Users manage their own api keys"
  ON api_keys
  FOR ALL
  USING (
    user_id = auth.uid() AND tenant_id = get_current_tenant_id()
  );

CREATE TRIGGER update_api_keys_modtime
BEFORE UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();