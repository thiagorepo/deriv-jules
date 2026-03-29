-- supabase/migrations/tables/user_sessions.sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  device TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  location TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + interval '30 days'),
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own sessions
CREATE POLICY "Users can view their own sessions"
  ON user_sessions
  FOR SELECT
  USING (
    user_id = auth.uid() AND tenant_id = get_current_tenant_id()
  );

-- Admins can view sessions across their tenant
CREATE POLICY "Admins can view tenant sessions"
  ON user_sessions
  FOR SELECT
  USING (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );