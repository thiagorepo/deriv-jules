# 10-Operations: Deployment Runbook

> **Spec ID:** OPS-DEPLOY-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Deployment Overview

This runbook covers deployment procedures for the Deriv Jules multi-tenant trading platform.

### 1.1 Deployment Targets

| Target | Provider | Environment |
|--------|----------|-------------|
| Primary | Vercel | Production |
| Secondary | Railway | Staging |
| Database | Supabase | All |

### 1.2 Application Matrix

| App | Path | Domain |
|-----|------|--------|
| tenant-app | apps/tenant-app | Primary tenant |
| tenant-app-1 | apps/tenant-app-1 | Tenant 1 |
| tenant-app-2 | apps/tenant-app-2 | Tenant 2 |
| tenant-app-3 | apps/tenant-app-3 | Tenant 3 |
| tenant-app-4 | apps/tenant-app-4 | Tenant 4 |

---

## 2. Pre-Deployment Checklist

- [ ] All tests passing (`pnpm nx run-many -t test`)
- [ ] Lint passing (`pnpm nx run-many -t lint`)
- [ ] Build successful (`pnpm nx run-many -t build`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Supabase RLS policies verified
- [ ] Deriv API credentials valid

---

## 3. Deployment Commands

### 3.1 Build All Applications

```bash
pnpm nx run-many -t build --parallel=2
```

### 3.2 Deploy Single Application

```bash
pnpm nx deploy tenant-app
```

### 3.3 Deploy All Applications

```bash
pnpm nx run-many -t deploy --parallel=1
```

---

## 4. Environment Variables

### 4.1 Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Server only |
| `NEXT_PUBLIC_DERIV_APP_ID` | Deriv API app ID | Yes |
| `DERIV_ENDPOINT` | Deriv WebSocket endpoint | Server only |
| `NX_CLOUD_ACCESS_TOKEN` | Nx Cloud token | CI only |

### 4.2 Tenant-Specific Variables

| Variable | Pattern |
|----------|---------|
| `TENANT_ID` | Unique per deployment |
| `TENANT_THEME` | JSON theme config |

---

## 5. Rollback Procedure

### 5.1 Vercel Rollback

```bash
vercel rollback --token=$VERCEL_TOKEN
```

### 5.2 Database Rollback

```bash
supabase db reset --linked
```

---

## 6. Monitoring

### 6.1 Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/health` | Application health |
| `/api/ready` | Readiness check |

### 6.2 Key Metrics

- Response time (P95 < 200ms)
- Error rate (< 0.1%)
- WebSocket connection stability
- Database connection pool

---

## 7. Incident Response

### 7.1 Severity Levels

| Level | Description | Response |
|-------|-------------|----------|
| P1 | Service down | Immediate |
| P2 | Degraded performance | 30 minutes |
| P3 | Minor issues | 4 hours |

### 7.2 Escalation Contacts

- **On-call Engineer:** [Contact]
- **Tech Lead:** [Contact]
- **Product Owner:** [Contact]

---

*End of Deployment Runbook*
