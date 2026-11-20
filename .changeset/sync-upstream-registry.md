---
"@kumix/better-auth-ui": patch
---

Sync latest upstream registry updates: refreshed admin users, API keys, delete-user, email-OTP, organization (profile, roles, teams, invitations, members, dialogs), settings (avatar, email, profile, password, sessions), two-factor dialogs, passkey, multi-session, OAuth provider views; add `email/email-colors.ts`, `lib/theme-plugin-base.ts`, and `organization/sanitize-slug.ts` helpers. Rewrite all imports to Kumix conventions (`@kumix/ui/ui/*`, `@kumix/utils`, `@kumix/ui/custom/toast` replacing `sonner`, relative lib/view paths, `useHydrated`) and substitute `getAuthErrorBodyMessage` with `getAuthErrorMessage` for current `@better-auth-ui/core`.
