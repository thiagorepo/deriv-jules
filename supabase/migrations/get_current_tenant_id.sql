-- supabase/migrations/rpcs/get_current_tenant_id.sql
-- Function to retrieve the active tenant ID for the currently authenticated user
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
  active_tenant_id UUID;
BEGIN
  -- First try to get it from the tenant_memberships where is_default is true
  SELECT tenant_id INTO active_tenant_id
  FROM tenant_memberships
  WHERE user_id = auth.uid() AND is_default = true
  LIMIT 1;

  -- Fallback to the profiles table if no explicit default membership exists
  IF active_tenant_id IS NULL THEN
    SELECT tenant_id INTO active_tenant_id
    FROM profiles
    WHERE id = auth.uid()
    LIMIT 1;
  END IF;

  RETURN active_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the current user is an admin or super_admin for the current tenant
CREATE OR REPLACE FUNCTION is_tenant_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role for the user's active tenant
  SELECT role INTO user_role
  FROM tenant_memberships
  WHERE user_id = auth.uid() AND tenant_id = get_current_tenant_id()
  LIMIT 1;

  IF user_role IS NULL THEN
     SELECT role INTO user_role
     FROM profiles
     WHERE id = auth.uid() AND tenant_id = get_current_tenant_id()
     LIMIT 1;
  END IF;

  RETURN user_role IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;