# OPS: Operations Specification

> **Spec ID:** OPS-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

This specification defines the operational requirements for deploying, monitoring, and maintaining the Deriv Jules multi-tenant trading platform.

---

## 2. Infrastructure

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN (Vercel Edge)                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      Vercel / Railway                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js Applications (5)                    │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │tenant-1 │ │tenant-2 │ │tenant-3 │ │tenant-4 │       │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │    │
│  │  ┌─────────┐                                            │    │
│  │  │tenant-5 │                                            │    │
│  │  └─────────┘                                            │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Supabase     │  │   Deriv WS      │  │   Analytics     │
│   (PostgreSQL)  │  │   (Trading)     │  │   (Optional)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 2.2 Service Dependencies

| Service | Purpose | Tier |
|---------|---------|------|
| Vercel/Railway | Application hosting | Compute |
| Supabase | Database + Auth + Realtime | Data |
| Deriv API | Trading operations | External |
| Nx Cloud | Build cache | CI/CD |

---

## 3. Deployment

### 3.1 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_TOKEN }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm nx run-many -t lint --parallel=4

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm nx run-many -t test --parallel=4

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm nx run-many -t build --parallel=2

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [tenant-app, tenant-app-1, tenant-app-2, tenant-app-3, tenant-app-4]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm nx deploy ${{ matrix.app }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### 3.2 Environment Configuration

| Environment | Branch | Domain | Auto-Deploy |
|-------------|--------|--------|-------------|
| Development | feature/* | PR preview | On PR |
| Staging | develop | staging.deriv-jules.com | On merge |
| Production | main | *.deriv-jules.com | On merge |

### 3.3 Environment Variables

```bash
# Required for all environments
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DERIV_APP_ID=

# Server-only
SUPABASE_SERVICE_ROLE_KEY=
DERIV_ENDPOINT=

# Optional
NEXT_PUBLIC_ANALYTICS_ID=
SENTRY_DSN=
```

---

## 4. Monitoring

### 4.1 Application Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Response Time (p95) | < 500ms | Warning |
| Response Time (p95) | > 2000ms | Critical |
| Error Rate | > 1% | Warning |
| Error Rate | > 5% | Critical |
| Memory Usage | > 80% | Warning |
| CPU Usage | > 80% | Warning |

### 4.2 Database Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Connection Count | > 80% | Warning |
| Query Time (p95) | > 100ms | Warning |
| Storage Usage | > 80% | Warning |
| Replication Lag | > 1s | Warning |

### 4.3 External Service Metrics

| Metric | Service | Threshold |
|--------|---------|-----------|
| WebSocket Latency | Deriv | < 100ms |
| WebSocket Disconnects | Deriv | < 5/min |
| API Response Time | Supabase | < 200ms |

### 4.4 Logging

```typescript
// Structured logging format
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: {
    service: string;
    tenantId?: string;
    userId?: string;
    requestId: string;
    [key: string]: unknown;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Usage
logger.info('Trade placed', {
  service: 'trading',
  userId: 'xxx',
  contractId: 'yyy',
  stake: 100,
  symbol: 'EURUSD'
});
```

---

## 5. Incident Response

### 5.1 Severity Levels

| Level | Description | Response Time | Resolution Target |
|-------|-------------|---------------|-------------------|
| SEV1 | Service down | 15 minutes | 1 hour |
| SEV2 | Major degradation | 30 minutes | 4 hours |
| SEV3 | Minor issues | 2 hours | 24 hours |
| SEV4 | Low impact | 1 day | 1 week |

### 5.2 Runbook Template

```markdown
# Runbook: [Incident Type]

## Symptoms
- What users experience
- Error messages
- Dashboard alerts

## Investigation Steps
1. Check [dashboard]
2. Verify [service status]
3. Review [logs]

## Resolution Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Rollback Procedure
1. [Step 1]
2. [Step 2]

## Contacts
- On-call: [contact]
- Escalation: [contact]
```

### 5.3 Common Issues

#### WebSocket Disconnection
```bash
# Check Deriv API status
curl -s https://deriv.com/status

# Restart WebSocket connection
# Automatic reconnection is handled by DerivAPI class
```

#### Database Connection Pool Exhaustion
```bash
# Check active connections
# Via Supabase dashboard

# Mitigation
# - Reduce connection pool size
# - Check for connection leaks
# - Scale database if needed
```

---

## 6. Backup & Recovery

### 6.1 Database Backups

| Type | Frequency | Retention |
|------|-----------|-----------|
| Full | Daily | 30 days |
| Incremental | Hourly | 7 days |
| PITR | Continuous | 7 days |

### 6.2 Recovery Procedures

```bash
# Restore from backup (Supabase CLI)
supabase db reset --linked

# Point-in-time recovery
supabase db restore --timestamp "2024-01-15T10:00:00Z"
```

### 6.3 Disaster Recovery

| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| App failure | 5 min | 0 | Redeploy from CI/CD |
| DB failure | 15 min | 1 hour | Restore from backup |
| Region failure | 30 min | 1 hour | Failover to backup region |

---

## 7. Security Operations

### 7.1 Secret Rotation

| Secret | Rotation Period | Method |
|--------|-----------------|--------|
| Supabase Keys | 90 days | Manual |
| API Tokens | 30 days | Manual |
| JWT Secret | Never | Automatic |

### 7.2 Access Control

| Role | Access | MFA Required |
|------|--------|--------------|
| Developer | Staging | Optional |
| DevOps | All environments | Required |
| Admin | Production | Required |

### 7.3 Audit Logging

```sql
-- Enable audit logging
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for audited tables
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, entity_type, entity_id,
    old_values, new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 8. Performance Optimization

### 8.1 Caching Strategy

| Layer | Cache Type | TTL |
|-------|------------|-----|
| CDN | Static assets | 1 year |
| Edge | API responses | 5 minutes |
| Client | React Query | 30 seconds |
| Database | Connection pool | Persistent |

### 8.2 Build Optimization

```javascript
// next.config.mjs
export default {
  // Enable experimental features
  experimental: {
    optimizePackageImports: ['@org/ui', '@org/core-routes'],
  },

  // Bundle optimization
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
        },
      },
    };
    return config;
  },
};
```

### 8.3 Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // For above-fold images
/>
```

---

## 9. Scaling

### 9.1 Horizontal Scaling

| Metric | Scale Trigger | Action |
|--------|---------------|--------|
| CPU > 70% | 5 min avg | Add instance |
| Memory > 80% | 5 min avg | Add instance |
| Request Queue > 100 | Instant | Add instance |

### 9.2 Database Scaling

| Metric | Scale Trigger | Action |
|--------|---------------|--------|
| Connections > 80% | Instant | Increase pool |
| Query Time > 100ms | 5 min avg | Optimize queries |
| Storage > 80% | Daily | Add storage |

---

## 10. Maintenance Windows

### 10.1 Scheduled Maintenance

| Window | Frequency | Duration | Notification |
|--------|-----------|----------|--------------|
| Database patching | Monthly | 2 hours | 1 week |
| App updates | Weekly | 30 min | 1 day |
| Security patches | As needed | 1 hour | ASAP |

### 10.2 Zero-Downtime Deployment

```yaml
# Deployment strategy
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
```

---

*End of Operations Specification*
