# Contributing Guide

## Development Setup

### Prerequisites
- Node.js 18+ 
- pnpm 10+

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

## Project Structure

This is an Nx monorepo with multiple tenant apps and shared libraries.

```
├── apps/
│   ├── tenant-app/          # Main tenant application
│   ├── tenant-app-1/        # Tenant 1 app
│   ├── tenant-app-2/        # Tenant 2 app
│   ├── tenant-app-3/        # Tenant 3 app
│   └── tenant-app-4/        # Tenant 4 app
├── libs/shared/
│   ├── core-routes/         # Core routing configuration
│   ├── deriv-api/           # Deriv API integration
│   ├── shared-auth/         # Authentication
│   ├── shared-config/       # Shared configuration
│   ├── supabase/            # Supabase integration
│   ├── theme/               # Design system/theme
│   └── ui/                  # Reusable UI components
├── packages/                # Utility packages
└── e2e/                     # End-to-end tests
```

## Available Scripts

```bash
# Development
pnpm dev                # Start all dev servers
pnpm build             # Build all projects
pnpm test              # Run all tests
pnpm lint              # Run ESLint
pnpm typecheck         # Type check with TypeScript

# Nx commands
pnpm nx build <app>    # Build specific app
pnpm nx dev <app>      # Start specific app
pnpm nx test <app>     # Test specific app
```

## Code Standards

- **Language**: TypeScript 5.9+
- **Framework**: Next.js 16
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4
- **Linter**: ESLint
- **Formatter**: Prettier
- **Package Manager**: pnpm

## Commit Guidelines

We follow conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Code refactoring
test: Add/update tests
chore: Dependencies, config changes
```

## Pull Request Process

1. Create feature branch: `git checkout -b feature/description`
2. Make changes and commit with conventional commits
3. Push to remote: `git push origin feature/description`
4. Create PR with clear description
5. Ensure all checks pass:
   - ESLint
   - TypeScript
   - Tests (if applicable)

## Database Migrations

Supabase migrations are in `supabase/migrations/`. Deploy with:

```bash
supabase db push
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update values with your Supabase and Deriv API credentials.

## Testing

```bash
# Run all tests
pnpm test

# Run tests for specific project
pnpm nx test <project>

# Watch mode
pnpm test -- --watch
```

## Performance

- Use React lazy loading for code splitting
- Leverage Next.js image optimization
- Enable Nx caching for faster builds
- Profile with Lighthouse regularly

## Support

For issues or questions:
1. Check existing issues
2. Create detailed issue with reproduction steps
3. Reference related documentation

## License

MIT - See LICENSE file
