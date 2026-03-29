-- supabase/migrations/rpcs/switch_active_tenant.sql
-- Atomically switches the active tenant for the currently authenticated user
CREATE OR REPLACE FUNCTION switch_active_tenant(target_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_membership BOOLEAN;
BEGIN
  -- Verify the user actually belongs to the target tenant
  SELECT EXISTS(
    SELECT 1
    FROM tenant_memberships
    WHERE user_id = auth.uid() AND tenant_id = target_id
  ) INTO has_membership;

  IF NOT has_membership THEN
    -- Or fallback to profile's tenant_id if membership record doesn't exist
    SELECT EXISTS(
      SELECT 1
      FROM profiles
      WHERE id = auth.uid() AND tenant_id = target_id
    ) INTO has_membership;
  END IF;

  IF NOT has_membership THEN
    RETURN FALSE;
  END IF;

  -- Remove 'is_default' from all other memberships for this user
  UPDATE tenant_memberships
  SET is_default = false
  WHERE user_id = auth.uid();

  -- Set 'is_default' true for the target tenant
  UPDATE tenant_memberships
  SET is_default = true
  WHERE user_id = auth.uid() AND tenant_id = target_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;