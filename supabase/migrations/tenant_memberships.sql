-- supabase/migrations/tables/tenant_memberships.sql
CREATE TABLE tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user', -- user, admin, super_admin
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, tenant_id)
);

-- Enable RLS
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Users can view their own memberships
CREATE POLICY "Users can read own memberships"
  ON tenant_memberships
  FOR SELECT
  USING (
    user_id = auth.uid() OR is_tenant_admin()
  );

-- Admins can view/manage memberships within their tenant
CREATE POLICY "Admins manage memberships"
  ON tenant_memberships
  FOR ALL
  USING (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

CREATE TRIGGER update_tenant_memberships_modtime
BEFORE UPDATE ON tenant_memberships
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();