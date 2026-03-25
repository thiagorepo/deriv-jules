-- supabase/seed.sql
-- Default seed data for local development

-- 1. Create a Default Tenant
INSERT INTO public.tenants (id, name, domain, plan)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'DerivOpus Alpha',
    'alpha.derivopus.local',
    'enterprise'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Default Feature Flags for the Alpha tenant
INSERT INTO public.feature_flags (tenant_id, flag_key, enabled, description)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'TRADING', true, 'Enable trading features'),
    ('11111111-1111-1111-1111-111111111111', 'AUTOMATION', true, 'Enable strategy automation'),
    ('11111111-1111-1111-1111-111111111111', 'COPY_TRADING', true, 'Enable copy trading')
ON CONFLICT (tenant_id, flag_key) DO NOTHING;

-- 3. Insert Base Subscription Plans for Alpha tenant
INSERT INTO public.subscription_plans (id, tenant_id, name, description, price, features)
VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Free', 'Basic trading', 0, '["basic_trading"]'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Starter', 'Full trading, 5 strategies', 29.00, '["full_trading", "5_strategies"]')
ON CONFLICT DO NOTHING;

-- Note: User profiles, Auth, and memberships will typically be seeded using the Auth GoTrue APIs during tests,
-- or by creating an auth.users record manually here. For simplicity, we just establish the core tenant space.
