#!/usr/bin/env node

/**
 * DerivOpus Compliance Evaluator
 * Scores the gap between codebase and specifications
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface EvalScore {
  category: string;
  checks: CheckResult[];
  categoryScore: number;
  weight: number;
}

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
  message: string;
  evidence?: string;
}

interface FinalScores {
  timestamp: string;
  overallScore: number;
  averageScore: number;
  categories: EvalScore[];
  criticalIssues: string[];
  warnings: string[];
}

const WORKSPACE_ROOT = process.cwd();

function fileExists(filepath: string): boolean {
  try {
    return fs.statSync(filepath).isFile();
  } catch {
    return false;
  }
}

function dirExists(dirpath: string): boolean {
  try {
    return fs.statSync(dirpath).isDirectory();
  } catch {
    return false;
  }
}

function findPackagePath(packageName: string): string | null {
  const locations = [
    path.join(WORKSPACE_ROOT, `libs/shared/${packageName}/src`),
    path.join(WORKSPACE_ROOT, `libs/${packageName}/src`),
    path.join(WORKSPACE_ROOT, `packages/${packageName}/src`),
    path.join(WORKSPACE_ROOT, `${packageName}/src`),
  ];
  return locations.find((loc) => dirExists(loc)) || null;
}

function searchFiles(pattern: RegExp, dir: string, maxDepth = 5): string[] {
  const results: string[] = [];
  function recurse(current: string, depth: number) {
    if (depth > maxDepth || !dirExists(current)) return;
    try {
      const files = fs.readdirSync(current);
      for (const file of files) {
        if (file.startsWith('.')) continue;
        const full = path.join(current, file);
        if (dirExists(full)) {
          recurse(full, depth + 1);
        } else if (pattern.test(file)) {
          results.push(full);
        }
      }
    } catch {
      // Suppress errors for ignored patterns
    }
  }
  recurse(dir, 0);
  return results;
}

function readFile(filepath: string): string {
  try {
    return fs.readFileSync(filepath, 'utf-8');
  } catch {
    return '';
  }
}

function countMatches(content: string, pattern: RegExp): number {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

// ============================================================================
// EVALUATION CATEGORIES
// ============================================================================

function checkMonorepoStructure(): EvalScore {
  const checks: CheckResult[] = [];

  // Check apps/
  const appsExist = dirExists(path.join(WORKSPACE_ROOT, 'apps'));
  checks.push({
    name: 'apps/ directory exists',
    status: appsExist ? 'PASS' : 'FAIL',
    message: appsExist ? 'apps/ found' : 'apps/ missing',
  });

  // Check core app
  const coreExists = dirExists(path.join(WORKSPACE_ROOT, 'apps/core'));
  checks.push({
    name: 'apps/core (main app) exists',
    status: coreExists ? 'PASS' : 'FAIL',
    message: coreExists ? 'apps/core found' : 'apps/core missing - CRITICAL',
  });

  // Check tenant apps
  const tenantDirs = [
    'tenant-alpha',
    'tenant-test',
    'tenant-app',
    'tenant-app-1',
  ].map((t) => dirExists(path.join(WORKSPACE_ROOT, `apps/${t}`)));
  const tenantScore = tenantDirs.filter(Boolean).length;
  checks.push({
    name: 'Tenant apps exist',
    status: tenantScore >= 2 ? 'PASS' : tenantScore >= 1 ? 'WARN' : 'FAIL',
    message: `${tenantScore}+ tenant apps found`,
  });

  // Check libs/shared for shared packages
  const libsSharedPath = path.join(WORKSPACE_ROOT, 'libs/shared');
  const libsSharedExists = dirExists(libsSharedPath);
  checks.push({
    name: 'libs/shared directory (Nx pattern)',
    status: libsSharedExists ? 'PASS' : 'WARN',
    message: libsSharedExists
      ? 'libs/shared found (Nx structure)'
      : 'Using packages/ instead',
  });

  // Check shared packages in libs/shared
  const sharedPackages = [
    'shared-supabase',
    'shared-auth',
    'shared-config',
    'shared-types',
    'deriv-api',
  ];
  const foundPackages = sharedPackages.filter(
    (pkg) => findPackagePath(pkg) !== null,
  );
  checks.push({
    name: 'All required shared packages exist',
    status: foundPackages.length === sharedPackages.length ? 'PASS' : 'WARN',
    message: `${foundPackages.length}/${sharedPackages.length} found: ${foundPackages.join(', ')}`,
  });

  // Check supabase/
  const supabaseExists = dirExists(path.join(WORKSPACE_ROOT, 'supabase'));
  checks.push({
    name: 'supabase/ directory exists',
    status: supabaseExists ? 'PASS' : 'FAIL',
    message: supabaseExists
      ? 'supabase/ found'
      : 'supabase/ missing - needed for migrations',
  });

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '📁 Monorepo Structure',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.15,
  };
}

function checkTechStack(): EvalScore {
  const checks: CheckResult[] = [];

  // Check package.json
  const pkgPath = path.join(WORKSPACE_ROOT, 'package.json');
  const pkg = fileExists(pkgPath) ? JSON.parse(readFile(pkgPath)) : {};

  // Check key dependencies
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const keyDeps = [
    { name: 'next', minVersion: '14' },
    { name: 'react', minVersion: '19' },
    { name: 'typescript', minVersion: '5' },
    { name: 'tailwindcss', minVersion: '4' },
    { name: '@hookform/resolvers' },
    { name: 'react-hook-form' },
    { name: 'zod' },
    { name: '@supabase/supabase-js' },
    { name: 'nx', minVersion: 'latest' },
  ];

  for (const dep of keyDeps) {
    const version = deps[dep.name];
    const exists = !!version;
    checks.push({
      name: `${dep.name} dependency`,
      status: exists ? 'PASS' : 'FAIL',
      message: exists ? `v${version}` : `missing - REQUIRED`,
    });
  }

  // Check TypeScript config
  const tsConfigExists = fileExists(path.join(WORKSPACE_ROOT, 'tsconfig.json'));
  checks.push({
    name: 'tsconfig.json exists',
    status: tsConfigExists ? 'PASS' : 'FAIL',
    message: tsConfigExists
      ? 'tsconfig.json found'
      : 'TypeScript config missing',
  });

  // Check Tailwind config
  const tailwindExists = fileExists(
    path.join(WORKSPACE_ROOT, 'tailwind.config.ts'),
  );
  checks.push({
    name: 'tailwind.config.ts exists',
    status: tailwindExists ? 'PASS' : 'WARN',
    message: tailwindExists
      ? 'Tailwind config found'
      : 'Check if using Tailwind v4',
  });

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '🔧 Tech Stack & Dependencies',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.12,
  };
}

function checkAuthSystem(): EvalScore {
  const checks: CheckResult[] = [];

  // Check shared-auth package
  const authPkgPath_use = findPackagePath('shared-auth');
  const authExists = authPkgPath_use !== null;
  checks.push({
    name: 'shared-auth package exists',
    status: authExists ? 'PASS' : 'FAIL',
    message: authExists
      ? 'Auth package found'
      : 'Auth package missing - CRITICAL',
  });

  // Check auth helpers
  const authHelpersPath = authPkgPath_use
    ? path.join(authPkgPath_use, 'lib/helpers')
    : '';
  const authHelpersExist = authHelpersPath && dirExists(authHelpersPath);
  checks.push({
    name: 'Auth helpers directory exists',
    status: authHelpersExist ? 'PASS' : 'FAIL',
    message: authHelpersExist ? 'Auth helpers found' : 'Auth helpers missing',
  });

  // Check for withAuth, withAdmin functions
  const authContent = authPkgPath_use
    ? readFile(path.join(authPkgPath_use, 'lib/shared-auth.ts'))
    : '';
  const hasWithAuth = authContent.includes('withAuth');
  const hasWithAdmin = authContent.includes('withAdmin');
  const hasWithTenant = authContent.includes('withTenant');

  checks.push({
    name: 'withAuth guard implemented',
    status: hasWithAuth ? 'PASS' : 'FAIL',
    message: hasWithAuth ? 'withAuth found' : 'withAuth missing',
  });

  checks.push({
    name: 'withAdmin guard implemented',
    status: hasWithAdmin ? 'PASS' : 'FAIL',
    message: hasWithAdmin ? 'withAdmin found' : 'withAdmin missing',
  });

  checks.push({
    name: 'withTenant guard implemented',
    status: hasWithTenant ? 'PASS' : 'FAIL',
    message: hasWithTenant ? 'withTenant found' : 'withTenant missing',
  });

  // Check for MFA endpoints
  const coreApiPath = path.join(WORKSPACE_ROOT, 'apps/core/src/app/api');
  const mfaFiles = searchFiles(/mfa/i, coreApiPath, 3);
  checks.push({
    name: 'MFA endpoints exist',
    status: mfaFiles.length > 0 ? 'PASS' : 'WARN',
    message: `${mfaFiles.length} MFA files found`,
  });

  // Check middleware
  const middlewarePath = path.join(
    WORKSPACE_ROOT,
    'apps/core/src/middleware.ts',
  );
  const middlewareExists = fileExists(middlewarePath);
  checks.push({
    name: 'middleware.ts exists',
    status: middlewareExists ? 'PASS' : 'FAIL',
    message: middlewareExists
      ? 'Middleware found'
      : 'Middleware missing - CRITICAL',
  });

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '🔐 Authentication & Security',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.15,
  };
}

function checkDatabaseSchema(): EvalScore {
  const checks: CheckResult[] = [];

  const migrationPath = path.join(WORKSPACE_ROOT, 'supabase/migrations');
  const migrationsExist = dirExists(migrationPath);
  checks.push({
    name: 'supabase/migrations/ exists',
    status: migrationsExist ? 'PASS' : 'FAIL',
    message: migrationsExist
      ? 'Migrations found'
      : 'Migrations missing - CRITICAL',
  });

  if (migrationsExist) {
    const migrationFiles = fs
      .readdirSync(migrationPath)
      .filter((f) => f.endsWith('.sql'));
    checks.push({
      name: 'SQL migration files exist',
      status: migrationFiles.length > 0 ? 'PASS' : 'FAIL',
      message: `${migrationFiles.length} migration files found`,
    });

    // Check for critical tables
    const allMigrationContent = migrationFiles
      .map((f) => readFile(path.join(migrationPath, f)))
      .join('\n');

    const requiredTables = [
      'tenants',
      'profiles',
      'tenant_memberships',
      'deriv_tokens',
      'feature_flags',
      'subscription_plans',
    ];
    const foundTables = requiredTables.filter((table) =>
      new RegExp(`CREATE TABLE.*${table}`, 'i').test(allMigrationContent),
    );

    checks.push({
      name: 'Required tables exist in migrations',
      status: foundTables.length === requiredTables.length ? 'PASS' : 'WARN',
      message: `${foundTables.length}/${requiredTables.length} tables: ${foundTables.join(', ')}`,
    });

    // Check for RLS policies
    const hasRLS = allMigrationContent.includes('CREATE POLICY');
    checks.push({
      name: 'RLS policies defined',
      status: hasRLS ? 'PASS' : 'FAIL',
      message: hasRLS
        ? 'RLS policies found'
        : 'RLS missing - CRITICAL for multi-tenancy',
    });

    // Check for RPC functions
    const rpcPath = path.join(migrationPath, 'rpcs');
    const rpcExists =
      dirExists(rpcPath) || allMigrationContent.includes('CREATE FUNCTION');
    checks.push({
      name: 'RPC functions defined',
      status: rpcExists ? 'PASS' : 'WARN',
      message: rpcExists ? 'RPC functions found' : 'RPCs may be missing',
    });
  }

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '🗄️ Database Schema',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.15,
  };
}

function checkAPIs(): EvalScore {
  const checks: CheckResult[] = [];

  const apiPath = path.join(WORKSPACE_ROOT, 'apps/core/src/app/api');
  const apiExists = dirExists(apiPath);
  checks.push({
    name: 'API routes directory exists',
    status: apiExists ? 'PASS' : 'FAIL',
    message: apiExists ? 'API routes found' : 'API routes missing',
  });

  if (apiExists) {
    const apiFiles = searchFiles(/route\.(ts|tsx)$/, apiPath, 4);
    checks.push({
      name: 'API route files exist',
      status: apiFiles.length > 0 ? 'PASS' : 'FAIL',
      message: `${apiFiles.length} route handlers found`,
    });

    // Check for specific endpoint categories
    const allApiContent = apiFiles.map((f) => readFile(f)).join('\n');

    const endpoints = [
      {
        pattern: /trading.*execute|POST.*trading/i,
        name: 'Trading execute endpoint',
      },
      {
        pattern: /webhook.*stripe|POST.*stripe/i,
        name: 'Stripe webhook endpoint',
      },
      { pattern: /checkout.*session/i, name: 'Stripe checkout endpoint' },
      { pattern: /auth.*mfa/i, name: 'MFA endpoints' },
    ];

    for (const endpoint of endpoints) {
      const exists = endpoint.pattern.test(allApiContent);
      checks.push({
        name: endpoint.name,
        status: exists ? 'PASS' : 'WARN',
        message: exists ? 'Found' : 'Not implemented yet',
      });
    }
  }

  // Check for error handling utilities
  const libPath = path.join(WORKSPACE_ROOT, 'apps/core/src/lib');
  const hasErrorHandler = fileExists(path.join(libPath, 'error-response.ts'));
  const hasErrorLogger = fileExists(path.join(libPath, 'error-logger.ts'));

  checks.push({
    name: 'Error response utility',
    status: hasErrorHandler ? 'PASS' : 'WARN',
    message: hasErrorHandler
      ? 'error-response.ts found'
      : 'error handling utilities',
  });

  checks.push({
    name: 'Error logger utility',
    status: hasErrorLogger ? 'PASS' : 'WARN',
    message: hasErrorLogger ? 'error-logger.ts found' : 'logging utilities',
  });

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '🔌 API Endpoints & Handlers',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.12,
  };
}

function checkUIComponents(): EvalScore {
  const checks: CheckResult[] = [];

  const uiPath = path.join(WORKSPACE_ROOT, 'apps/core/src/components/ui');
  const uiExists = dirExists(uiPath);
  checks.push({
    name: 'UI components directory exists',
    status: uiExists ? 'PASS' : 'FAIL',
    message: uiExists ? 'UI components found' : 'shadcn/ui not installed',
  });

  if (uiExists) {
    const uiFiles = fs.readdirSync(uiPath).filter((f) => f.endsWith('.tsx'));
    checks.push({
      name: 'shadcn/ui primitives installed',
      status: uiFiles.length >= 20 ? 'PASS' : 'WARN',
      message: `${uiFiles.length} component files found (spec: 47+)`,
    });
  }

  // Check layout components
  const layoutPath = path.join(
    WORKSPACE_ROOT,
    'apps/core/src/components/layout',
  );
  const layoutExists = dirExists(layoutPath);
  checks.push({
    name: 'Layout components exist',
    status: layoutExists ? 'PASS' : 'WARN',
    message: layoutExists
      ? 'Layout components found'
      : 'AppSidebar, Header, etc missing',
  });

  // Check form components
  const formsPath = path.join(WORKSPACE_ROOT, 'apps/core/src/components/forms');
  const formsExist = dirExists(formsPath);
  checks.push({
    name: 'Form field wrappers exist',
    status: formsExist ? 'PASS' : 'WARN',
    message: formsExist ? 'Form components found' : 'Form wrappers missing',
  });

  // Check feature components
  const featuresPath = path.join(
    WORKSPACE_ROOT,
    'apps/core/src/components/features',
  );
  const featuresExist = dirExists(featuresPath);
  checks.push({
    name: 'Feature components exist',
    status: featuresExist ? 'PASS' : 'WARN',
    message: featuresExist
      ? 'Domain-specific components found'
      : 'Feature modules missing',
  });

  // Check theme system
  const globalCssPath = path.join(
    WORKSPACE_ROOT,
    'apps/core/src/app/globals.css',
  );
  const globalCssExists = fileExists(globalCssPath);
  const globalCssContent = readFile(globalCssPath);
  const hasThemeVariables =
    globalCssContent.includes('--primary') ||
    globalCssContent.includes('data-theme');

  checks.push({
    name: 'Theme CSS variables defined',
    status: globalCssExists && hasThemeVariables ? 'PASS' : 'WARN',
    message: hasThemeVariables
      ? 'Theme variables found'
      : 'CSS theme system missing',
  });

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '🎨 UI Components & Theme',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.12,
  };
}

function checkPages(): EvalScore {
  const checks: CheckResult[] = [];

  const appPath = path.join(WORKSPACE_ROOT, 'apps/core/src/app');
  const appExists = dirExists(appPath);
  checks.push({
    name: 'app/ directory (Next.js App Router) exists',
    status: appExists ? 'PASS' : 'FAIL',
    message: appExists ? 'App Router found' : 'Next.js app/ missing',
  });

  if (appExists) {
    // Check for key routes
    const routes = [
      { path: 'auth', name: 'Auth routes' },
      { path: '(app)', name: 'Protected app routes' },
      { path: 'overview', name: 'Dashboard page' },
    ];

    for (const route of routes) {
      const exists = dirExists(path.join(appPath, route.path));
      checks.push({
        name: `${route.name} (${route.path})`,
        status: exists ? 'PASS' : 'WARN',
        message: exists ? `${route.path}/ found` : `${route.path}/ missing`,
      });
    }

    // Count page files
    const pageFiles = searchFiles(/page\.(tsx?|jsx?)$/, appPath, 3);
    checks.push({
      name: 'Page files implemented',
      status: pageFiles.length > 5 ? 'PASS' : 'WARN',
      message: `${pageFiles.length} pages found`,
    });
  }

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '📄 Pages & Routes',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.1,
  };
}

function checkIntegrations(): EvalScore {
  const checks: CheckResult[] = [];

  // Check Deriv API integration
  const derivApiPath_use = findPackagePath('deriv-api');
  const derivExists = derivApiPath_use !== null;
  checks.push({
    name: 'deriv-api package exists',
    status: derivExists ? 'PASS' : 'FAIL',
    message: derivExists
      ? 'Deriv API package found'
      : 'Deriv integration missing - CRITICAL',
  });

  if (derivExists && derivApiPath_use) {
    const derivContent = readFile(path.join(derivApiPath_use, 'index.ts'));
    const hasHooks =
      derivContent.includes('useDerivConnection') ||
      derivContent.includes('hook');
    checks.push({
      name: 'Deriv React hooks',
      status: hasHooks ? 'PASS' : 'WARN',
      message: hasHooks ? 'Custom hooks found' : 'Hooks not implemented',
    });
  }

  // Check Stripe integration
  const coreLibPath = path.join(WORKSPACE_ROOT, 'apps/core/src/lib');
  const stripeFiles = searchFiles(/stripe/i, coreLibPath, 2);
  checks.push({
    name: 'Stripe integration code',
    status: stripeFiles.length > 0 ? 'PASS' : 'WARN',
    message: `${stripeFiles.length} Stripe files found`,
  });

  // Check for config files
  const configPath_use = findPackagePath('shared-config');
  const configExists = configPath_use !== null;
  checks.push({
    name: 'shared-config package exists',
    status: configExists ? 'PASS' : 'FAIL',
    message: configExists ? 'Config package found' : 'shared-config missing',
  });

  // Check for Supabase client factories
  const supabasePkgPath_use = findPackagePath('shared-supabase');
  const supabaseExists = supabasePkgPath_use !== null;
  const supabaseContent = supabasePkgPath_use
    ? readFile(path.join(supabasePkgPath_use, 'index.ts'))
    : '';
  const hasFactories =
    supabaseContent.includes('createBrowserClient') ||
    supabaseContent.includes('createServerClient');

  checks.push({
    name: 'Supabase client factories',
    status: hasFactories ? 'PASS' : 'WARN',
    message: hasFactories
      ? 'Client factories found'
      : 'Factory pattern missing',
  });

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '🔗 External Integrations',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.12,
  };
}

function checkDocumentation(): EvalScore {
  const checks: CheckResult[] = [];

  const docsPath = path.join(WORKSPACE_ROOT, 'docs');
  const docsExists = dirExists(docsPath);
  checks.push({
    name: 'docs/ directory exists',
    status: docsExists ? 'PASS' : 'FAIL',
    message: docsExists ? 'docs/ found' : 'docs/ missing',
  });

  // Check key documentation files
  const docFiles = [
    {
      name: 'specifications.md',
      path: path.join(docsPath, 'specifications.md'),
    },
    {
      name: 'implementation-plan.md',
      path: path.join(docsPath, 'implementation-plan.md'),
    },
    {
      name: 'project-documentation.md',
      path: path.join(docsPath, 'project-documentation.md'),
    },
  ];

  for (const doc of docFiles) {
    const exists = fileExists(doc.path);
    checks.push({
      name: `${doc.name} exists`,
      status: exists ? 'PASS' : 'WARN',
      message: exists ? `${doc.name} found` : `${doc.name} missing`,
    });
  }

  // Check CLAUDE.md
  const claudePath = path.join(WORKSPACE_ROOT, 'CLAUDE.md');
  const claudeExists = fileExists(claudePath);
  checks.push({
    name: 'CLAUDE.md exists',
    status: claudeExists ? 'PASS' : 'FAIL',
    message: claudeExists ? 'CLAUDE.md found' : 'Project memory missing',
  });

  // Check README.md
  const readmePath = path.join(WORKSPACE_ROOT, 'README.md');
  const readmeExists = fileExists(readmePath);
  checks.push({
    name: 'README.md exists',
    status: readmeExists ? 'PASS' : 'WARN',
    message: readmeExists ? 'README found' : 'README missing',
  });

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '📚 Documentation',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.1,
  };
}

function checkTesting(): EvalScore {
  const checks: CheckResult[] = [];

  // Check test setup
  const jestConfigExists = fileExists(
    path.join(WORKSPACE_ROOT, 'jest.config.ts'),
  );
  const vitestFiles = searchFiles(/vitest\.config/, WORKSPACE_ROOT, 3);

  checks.push({
    name: 'Jest or Vitest configured',
    status: jestConfigExists || vitestFiles.length > 0 ? 'PASS' : 'WARN',
    message: `Jest: ${jestConfigExists}, Vitest files: ${vitestFiles.length}`,
  });

  // Check for test files
  const testFiles = searchFiles(
    /\.test\.(ts|tsx|js)$/,
    path.join(WORKSPACE_ROOT, 'apps'),
    4,
  );
  checks.push({
    name: 'Test files exist',
    status: testFiles.length > 0 ? 'PASS' : 'WARN',
    message: `${testFiles.length} test files found`,
  });

  // Check E2E tests
  const e2ePath = path.join(WORKSPACE_ROOT, 'e2e');
  const e2eExists = dirExists(e2ePath);
  const e2eFiles = e2eExists
    ? searchFiles(/\.spec\.(ts|tsx)$/, e2ePath, 2)
    : [];

  checks.push({
    name: 'E2E tests configured (Playwright)',
    status: e2eExists ? 'PASS' : 'WARN',
    message: `E2E directory: ${e2eExists}, spec files: ${e2eFiles.length}`,
  });

  const categoryScore =
    (checks.filter((c) => c.status === 'PASS').length / checks.length) * 100;

  return {
    category: '✅ Testing & Quality',
    checks,
    categoryScore: Math.round(categoryScore),
    weight: 0.08,
  };
}

// ============================================================================
// MAIN EVAL FUNCTION
// ============================================================================

function runEval(): FinalScores {
  console.log('🔍 DerivOpus Compliance Evaluator\n');

  const categories: EvalScore[] = [
    checkMonorepoStructure(),
    checkTechStack(),
    checkAuthSystem(),
    checkDatabaseSchema(),
    checkAPIs(),
    checkUIComponents(),
    checkPages(),
    checkIntegrations(),
    checkDocumentation(),
    checkTesting(),
  ];

  // Calculate scores
  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
  const overallScore = Math.round(
    categories.reduce((sum, cat) => sum + cat.categoryScore * cat.weight, 0) /
      totalWeight,
  );

  const averageScore = Math.round(
    categories.reduce((sum, cat) => sum + cat.categoryScore, 0) /
      categories.length,
  );

  // Collect critical issues
  const criticalIssues = categories.flatMap((cat) =>
    cat.checks
      .filter((c) => c.status === 'FAIL' && c.message.includes('CRITICAL'))
      .map((c) => `[${cat.category}] ${c.name}: ${c.message}`),
  );

  const warnings = categories.flatMap((cat) =>
    cat.checks
      .filter((c) => c.status === 'FAIL' || c.status === 'WARN')
      .map((c) => `[${cat.category}] ${c.name}: ${c.message}`),
  );

  const result: FinalScores = {
    timestamp: new Date().toISOString(),
    overallScore,
    averageScore,
    categories,
    criticalIssues,
    warnings,
  };

  return result;
}

// ============================================================================
// OUTPUT FORMATTING
// ============================================================================

function formatOutput(scores: FinalScores): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 EVALUATION RESULTS');
  console.log('='.repeat(80) + '\n');

  console.log(`Timestamp: ${scores.timestamp}\n`);

  console.log('🎯 OVERALL SCORES');
  console.log('-'.repeat(80));
  console.log(`Overall Score (weighted): ${scores.overallScore}%`);
  console.log(`Average Score (unweighted): ${scores.averageScore}%\n`);

  console.log('📋 CATEGORY BREAKDOWN');
  console.log('-'.repeat(80));

  for (const cat of scores.categories) {
    const bar =
      '█'.repeat(Math.round(cat.categoryScore / 5)) +
      '░'.repeat(20 - Math.round(cat.categoryScore / 5));
    console.log(`\n${cat.category}`);
    console.log(`${bar} ${cat.categoryScore}%`);

    for (const check of cat.checks) {
      const icon =
        check.status === 'PASS'
          ? '✅'
          : check.status === 'FAIL'
            ? '❌'
            : check.status === 'WARN'
              ? '⚠️'
              : '⏭️';

      const msg = `  ${icon} ${check.name}: ${check.message}`;
      console.log(msg);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('⚠️  CRITICAL ISSUES');
  console.log('='.repeat(80));

  if (scores.criticalIssues.length === 0) {
    console.log('✅ No critical issues found\n');
  } else {
    for (const issue of scores.criticalIssues) {
      console.log(`❌ ${issue}`);
    }
    console.log('');
  }

  console.log('⚠️  ALL WARNINGS & FAILURES');
  console.log('='.repeat(80));

  if (scores.warnings.length === 0) {
    console.log('✅ No warnings found\n');
  } else {
    const grouped = scores.warnings.reduce(
      (acc, w) => {
        const category = w.split(']')[0].slice(1);
        if (!acc[category]) acc[category] = [];
        acc[category].push(w);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    for (const [category, items] of Object.entries(grouped)) {
      console.log(`\n${category}:`);
      for (const item of items) {
        console.log(`  ${item}`);
      }
    }
    console.log('');
  }

  console.log('='.repeat(80));
  console.log(`Evaluation complete. Scores saved to EVAL_RESULTS.json\n`);
}

// Save results to file
function saveResults(scores: FinalScores): void {
  const resultsPath = path.join(WORKSPACE_ROOT, 'EVAL_RESULTS.json');
  fs.writeFileSync(resultsPath, JSON.stringify(scores, null, 2));
}

// Main execution
const scores = runEval();
formatOutput(scores);
saveResults(scores);

// Export for external use
export { runEval, FinalScores };
