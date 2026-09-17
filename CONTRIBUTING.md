# Contributing to Better Auth Starterkit

Thank you for your interest in contributing! This repo publishes **`@kumix/better-auth-ui`** — prebuilt better-auth views, client plugins, and react-email templates styled with `@kumix/ui`.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold that code. Please report unacceptable behavior to [hai@kumix.io](mailto:hai@kumix.io).

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.4.0 or higher
- Node.js 24 or higher
- Git

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/better-auth-starterkit.git
   cd better-auth-starterkit
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Create a new branch for your changes:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development Workflow

### Commands

Run from the repo root:

```bash
bun run dev           # watch builds
bun run build         # build all packages (turbo)
bun run types:check   # tsc --noEmit per package
bun run lint          # biome check
bun run lint:fix      # biome check --write --unsafe
bun run format        # biome format --write
```

Per-package: `cd packages/<name> && bun run <script>`.

### Working on `@kumix/better-auth-ui`

See [AGENTS.md](./AGENTS.md) for the full conventions. The short version:

- Per-file ESM exports, no root barrel (`@kumix/better-auth-ui/sign-in`, `…/lib/organization-plugin`).
- UI primitives from `@kumix/ui`, utilities from `@kumix/utils` (`cn`), toasts from `@kumix/ui/custom/toast` — never `sonner`.
- Internal imports are relative (`../lib/organization-plugin`), never `@/` aliases.

## Making Changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) — commitlint enforces:

```
feat(ui): add passkey enrollment view
fix(mcp): resolve import path for email templates
docs(readme): clarify peer dependencies
refactor(workspace): simplify outputs in turbo.json
```

Allowed types: `feat`, `feature`, `fix`, `refactor`, `docs`, `build`, `test`, `ci`, `chore`.

### Verification

All changes must pass these checks before submitting:

```bash
bun run types:check
bun run build
bun run lint
```

## Submitting Changes

1. Update your branch with the latest changes from main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. Push your changes and open a Pull Request targeting `main`
3. Fill in the PR template — clear title, description, breaking changes, related issues, and screenshots for UI changes

Keep PRs focused: one feature or fix per PR is much easier to review.

## Releasing (Maintainers Only)

This project uses [Changesets](https://github.com/changesets/changesets):

1. **Create a changeset** on your branch:
   ```bash
   bunx changeset
   ```
2. Merge to `main` — CI opens a "version packages" PR
3. Merging that PR publishes to npm via `scripts/publish.sh` (skips private packages, idempotent)

## Security

If you discover a security vulnerability, please report it privately as described in [SECURITY.md](./SECURITY.md) — do not open a public issue.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
