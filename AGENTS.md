# AGENTS.md

Guidance for coding agents working in this repo. This file is the single source of truth for agent instructions (`CLAUDE.md` points here) — read it before making changes.

## Repository

Kumix monorepo publishing **`@kumix/better-auth-ui`**: prebuilt better-auth views, client plugins, and react-email templates styled with `@kumix/ui` (shadcn/ui, Base UI).

| Path           | Package                 | Notes                                                                                                                                         |
| -------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui`  | `@kumix/better-auth-ui` | The product. Public on npm. Built with tsdown, linted with publint/attw.                                                                      |
| `packages/mcp` | `@kumix/mcp`            | Private MCP server indexing workspace packages for AI agents (metadata, component search, source reads, import examples). Changesets-ignored. |
| `apps/*`       | —                       | Empty for now.                                                                                                                                |

Upstream foundations: [better-auth](https://www.better-auth.com) and [better-auth-ui](https://github.com/better-auth-ui/better-auth-ui); UI primitives from `@kumix/ui`.

## Commands

Run from repo root (bun + turborepo):

| Command               | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `bun install`         | Install dependencies                             |
| `bun run build`       | Build all packages (turbo, respects `^build`)    |
| `bun run types:check` | `tsc --noEmit` per package                       |
| `bun run lint`        | `biome check`                                    |
| `bun run lint:fix`    | `biome check --write --unsafe`                   |
| `bun run format`      | `biome format --write`                           |
| `bun run dev`         | Watch builds                                     |
| `bun run version`     | `changeset version` + `bun update`               |
| `bun run release`     | `scripts/publish.sh` (skips private, idempotent) |

Per-package scripts: `cd packages/<name> && bun run <script>` (`build`, `types:check`, `dev`, …).

## Conventions

- **Runtime**: bun ≥ 1.4, Node ≥ 24. ESM only.
- **Lint/format**: Biome (`@kumix/biome-config`) for ts/tsx/json, import order via `organizeImports`. Prettier only for `*.md`/`*.yml`/`*.yaml` (lint-staged).
- **Commits**: Conventional Commits (commitlint + husky enforce).
- **Publishing**: Changesets on `main`; `@kumix/mcp` is private and ignored.

### `@kumix/better-auth-ui` rules

- Per-file ESM exports, **no root barrel**: consumers import `@kumix/better-auth-ui/sign-in`, `…/lib/organization-plugin`, `…/email/email-verification`.
- UI primitives come from `@kumix/ui` (`import { Button } from "@kumix/ui/ui/button"`); utilities from `@kumix/utils` (`cn`).
- Toasts use `@kumix/ui/custom/toast` (`toastSuccess` / `toastError`, object arg `{ message }`); never `sonner`.
- Internal imports are **relative** (`../lib/organization-plugin`), never `@/` aliases.
- Layout: root `src/*.tsx` = auth views; feature folders (`organization/`, `settings/`, `two-factor/`, `passkey/`, `api-key/`, `admin/`, `oauth-provider/`, `multi-session/`, `email-otp/`, `siwe/`, `anonymous/`, `agent-auth/`, `dash/`, `billing/`, `delete-user/`, `device-authorization/`, `last-login-method/`, `username/`, `theme/`, `user/`); `src/lib/` = client plugins; `src/email/` = react-email templates.

## Verification gates

Before finishing any change, from repo root:

```bash
bun run types:check
bun run build
bun run lint
```

All three must pass. `packages/ui`'s build also runs publint and attw. For MCP changes, additionally run `cd packages/mcp && bun run build`.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
