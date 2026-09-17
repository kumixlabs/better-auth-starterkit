# @kumix/better-auth-ui

Prebuilt auth UI for Kumix products, on top of [better-auth](https://better-auth.com) and [@better-auth-ui](https://github.com/better-auth-ui). Views, client plugins, and react-email templates — styled with [@kumix/ui](https://www.npmjs.com/package/@kumix/ui) (shadcn/ui, Base UI). Ships as ESM with per-file exports (no barrel).

## What's inside

| Path                    | Contents                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `auth.tsx`              | Auth router view (renders the right screen per route/mode)                                        |
| `sign-*.tsx`            | Sign in / sign up / sign out, verify email, forgot & reset password, magic link, reauthentication |
| `organization/`         | Organizations: members, invitations, teams, roles, switcher, settings, invitations                |
| `settings/`             | Account settings (profile, avatar, email) and security (sessions, password, linked accounts)      |
| `two-factor/`           | 2FA challenge, settings, backup codes                                                             |
| `passkey/` `api-key/`   | Passkey management, API keys (create/edit/delete, org keys)                                       |
| `admin/`                | Admin users table, impersonation, stop-impersonating                                              |
| `oauth-provider/`       | OAuth provider screens: consent, clients, authorized apps, device sessions                        |
| `multi-session/`        | Account switcher, manage accounts                                                                 |
| `email-otp/`            | OTP flows: sign-in, verify email, reset password, change email                                    |
| `siwe/` `anonymous/`    | Sign in with Ethereum, anonymous sessions                                                         |
| `agent-auth/`           | AI agent approval and authorizations                                                              |
| `dash/` `billing/`      | Dashboard activity, billing settings                                                              |
| `delete-user/`          | Danger zone, delete account                                                                       |
| `device-authorization/` | Device authorization screens                                                                      |
| `last-login-method/`    | Last-used login method badge                                                                      |
| `theme/`                | Appearance settings, theme toggle                                                                 |
| `user/`                 | User avatar, user button, user view                                                               |
| `email/`                | react-email templates (verification, reset, OTP, invitation, magic link, new device, …)           |
| `lib/`                  | Client plugins per feature: `organizationPlugin`, `adminPlugin`, `twoFactorPlugin`, …             |

Toast feedback uses `@kumix/ui/custom/toast` (`toastSuccess` / `toastError`) — render `<ToastContainer />` once in your app.

## Install

```bash
bun add @kumix/better-auth-ui
```

Install peers (see `package.json` → `peerDependencies`): `react`, `better-auth`, `@better-auth-ui/core`, `@better-auth-ui/react`, `@kumix/ui`, `@kumix/utils`, `@tanstack/react-query`, plus the peers of the components you use (`@tanstack/react-form`, `react-email`, `date-fns`, …).

## Import paths

Per-file exports (no root barrel):

```tsx
// provider + error handling
import { AuthProvider } from "@kumix/better-auth-ui/auth-provider";
import { ErrorToaster } from "@kumix/better-auth-ui/error-toaster";

// views
import { Auth } from "@kumix/better-auth-ui/auth";
import { SignIn } from "@kumix/better-auth-ui/sign-in";
import { SignUp } from "@kumix/better-auth-ui/sign-up";

// feature client plugins
import { organizationPlugin } from "@kumix/better-auth-ui/lib/organization-plugin";
import { adminPlugin } from "@kumix/better-auth-ui/lib/admin-plugin";

// email templates (react-email)
import { EmailVerification } from "@kumix/better-auth-ui/email/email-verification";
```

## Quick start

`AuthProvider` requires your `authClient` and a `navigate` handler (wire it to your router), and `Auth` needs the current `path` (or an explicit `view`):

```tsx
import { AuthProvider } from "@kumix/better-auth-ui/auth-provider";
import { Auth } from "@kumix/better-auth-ui/auth";
import { ToastContainer } from "@kumix/ui/custom/toast";
import { authClient } from "./auth-client";
import { useRouter, usePathname } from "./router"; // your router

export function App() {
  const router = useRouter();
  const pathname = usePathname();

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

This package is a maintained distribution of the [better-auth-ui](https://github.com/better-auth-ui) shadcn components: imports rewritten for the Kumix monorepo (`@kumix/ui/ui/*`, `@kumix/utils`, relative paths), Kumix toast integration, Biome/TypeScript clean, published via npm.
