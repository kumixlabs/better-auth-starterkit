# @kumix/mcp

Private MCP server for exploring **`@kumix/better-auth-ui`** (and other `@kumix/*` workspace packages): metadata, source, and usage hints.

## What it indexes

Scans `packages/**/package.json` at runtime (skips `@kumix/mcp`, `node_modules`, `dist`).

| Package                 | Layout                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@kumix/better-auth-ui` | `src/*.tsx` (auth views), feature folders (`src/organization`, `src/settings`, `src/two-factor`, `src/api-key`, …), `src/lib` (client plugins), `src/email` (react-email templates) |

**Categories** on each component entry = top-level `src/` segment:

| `category`                  | Source                                   | Docs / previews |
| --------------------------- | ---------------------------------------- | --------------- |
| `views`                     | root-level views (auth, sign-in, …)      | package README  |
| `organization` … `username` | feature folders                          | package README  |
| `lib`                       | client plugins (`organizationPlugin`, …) | package README  |
| `email`                     | react-email templates                    | package README  |

**Import paths** (per-file, no barrel):

```ts
@kumix/better-auth-ui/auth-provider
@kumix/better-auth-ui/sign-in
@kumix/better-auth-ui/organization/organization-settings
@kumix/better-auth-ui/lib/organization-plugin
@kumix/better-auth-ui/email/email-verification
@kumix/better-auth-ui/css
```

Same names can exist in multiple categories (e.g. `passkey`, `magic-link`, `reset-password`). `find_component` and `get_usage_example` return **all** matches (`matches[]` + `importPath` per entry).

## Setup

```bash
cd packages/mcp
bun run build
```

## MCP client

```json
{
  "mcpServers": {
    "Kumix Better Auth UI": {
      "command": "node",
      "args": [
        "/absolute/path/to/better-auth-starterkit/packages/mcp/dist/index.js"
      ],
      "cwd": "/absolute/path/to/better-auth-starterkit"
    }
  }
}
```

## Tools

| Tool                  | Purpose                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `list_packages`       | Indexed packages + category counts for `@kumix/better-auth-ui`                                              |
| `get_package_info`    | Exports, peers, sample imports, doc links                                                                   |
| `find_component`      | Search by name/path; filter by category (`views` \| feature folder \| `lib` \| `email`) or package fragment |
| `read_component_code` | Read `src/`-relative file; returns `importPath`                                                             |
| `get_usage_example`   | Per-file import snippet + package README                                                                    |

### Examples

```text
find_component  component_name=sign-in  package_filter=views
find_component  component_name=organization  package_filter=organization
find_component  component_name=organization-plugin  package_filter=lib
find_component  component_name=email-verification  package_filter=email
read_component_code  package_name=@kumix/better-auth-ui  component_path=sign-in.tsx
read_component_code  package_name=@kumix/better-auth-ui  component_path=organization/organization-settings.tsx
read_component_code  package_name=@kumix/better-auth-ui  component_path=lib/organization-plugin.tsx
read_component_code  package_name=@kumix/better-auth-ui  component_path=email/email-verification.tsx
get_usage_example  package_name=@kumix/better-auth-ui
get_usage_example  package_name=@kumix/better-auth-ui  component_name=sign-in
```

## Dev

```bash
bun run dev      # bun src/index.ts
bun run build    # tsc → dist/
bun run types:check
```

Private package (Changesets `ignore`). Not published to npm.
