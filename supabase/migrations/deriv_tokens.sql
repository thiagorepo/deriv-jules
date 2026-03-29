-- supabase/migrations/tables/deriv_tokens.sql
CREATE TABLE deriv_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  token TEXT NOT NULL, -- Plaintext (should ideally be encrypted, but matching spec)
  token_encrypted BYTEA, -- PGP encrypted placeholder
  token_hash TEXT, -- SHA256 hash
  label TEXT,
  scopes TEXT[],
  is_primary BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE deriv_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tokens within the current tenant
CREATE POLICY "Users manage their own deriv tokens"
  ON deriv_tokens
  FOR ALL
  USING (
    user_id = auth.uid() AND tenant_id = get_current_tenant_id()
  );

CREATE TRIGGER update_deriv_tokens_modtime
BEFORE UPDATE ON deriv_tokens
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();