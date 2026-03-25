-- supabase/migrations/tables/tenants.sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tenants (e.g. for landing pages/auth)
CREATE POLICY "Public can view tenants"
  ON tenants
  FOR SELECT
  USING (true);

-- Allow tenant admins to update their own tenant
CREATE POLICY "Admins can update their tenant"
  ON tenants
  FOR UPDATE
  USING (
    id = get_current_tenant_id()
    AND is_tenant_admin()
  );

-- Function to auto-update 'updated_at' on modify
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_modtime
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();