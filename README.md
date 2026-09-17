# Better Auth Starterkit

Kumix monorepo for **[@kumix/better-auth-ui](./packages/ui)** — prebuilt auth UI for [better-auth](https://www.better-auth.com): sign-in/sign-up, organizations, two-factor, passkeys, API keys, admin, settings, and react-email templates, styled with [@kumix/ui](https://www.npmjs.com/package/@kumix/ui) (shadcn/ui, Base UI). Ships as ESM with per-file exports (no barrel).

## Packages

| Package                                  | Path           | Description                                                                                         |
| ---------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| [`@kumix/better-auth-ui`](./packages/ui) | `packages/ui`  | Prebuilt better-auth views, client plugins, and react-email templates                               |
| [`@kumix/mcp`](./packages/mcp)           | `packages/mcp` | Private MCP server: package metadata, component search, source reads, import examples for AI agents |

## Usage

```bash
bun add @kumix/better-auth-ui
```

```tsx
import { AuthProvider } from "@kumix/better-auth-ui/auth-provider";
import { Auth } from "@kumix/better-auth-ui/auth";
import { ToastContainer } from "@kumix/ui/custom/toast";
import { authClient } from "./auth-client";

export function App() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={({ to, replace }) => router.push(to, { replace })}
    >
      <Auth path={pathname} />
      <ToastContainer />
    </AuthProvider>
  );
}
```

Full docs — views, feature folders, plugins, email templates, peers — in [packages/ui/README.md](./packages/ui/README.md).

## Development

Requires bun ≥ 1.4 and Node ≥ 24.

```bash
bun install       # setup
bun run build     # build all packages (turbo)
bun run dev       # watch builds
bun run types:check
bun run lint      # biome
```

Releases go through [Changesets](https://github.com/changesets/changesets) on `main` (`bun run version` → `bun run release`).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Agent instructions live in [AGENTS.md](./AGENTS.md).

## License

[MIT](./LICENSE) © Kumix Labs
