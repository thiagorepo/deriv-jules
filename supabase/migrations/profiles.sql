-- supabase/migrations/tables/profiles.sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- user, admin, super_admin
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  kyc_level INTEGER DEFAULT 0, -- 0, 1, 2, 3
  kyc_verified_at TIMESTAMPTZ,
  compliance_status TEXT DEFAULT 'pending', -- pending, verified, suspended, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Standard user access: users can read their own profile, or admins can read anyone within their tenant
CREATE POLICY "Users can read own profile or admins can read tenant profiles"
  ON profiles
  FOR SELECT
  USING (
    (id = auth.uid()) OR
    (tenant_id = get_current_tenant_id() AND is_tenant_admin())
  );

-- Users can update their own profile (name, avatar), admins can update profiles in their tenant (roles, etc)
CREATE POLICY "Users can update own profile or admins can update tenant profiles"
  ON profiles
  FOR UPDATE
  USING (
    (id = auth.uid()) OR
    (tenant_id = get_current_tenant_id() AND is_tenant_admin())
  );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles in their tenant"
  ON profiles
  FOR INSERT
  WITH CHECK (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles in their tenant"
  ON profiles
  FOR DELETE
  USING (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();