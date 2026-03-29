-- supabase/migrations/tables/subscription_plans.sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'month', -- month/year
  features JSONB,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone in the tenant can view the plans
CREATE POLICY "Users can view subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (
    tenant_id = get_current_tenant_id()
  );

-- Only tenant admins can manage plans
CREATE POLICY "Admins manage plans"
  ON subscription_plans
  FOR ALL
  USING (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

CREATE TRIGGER update_subscription_plans_modtime
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();