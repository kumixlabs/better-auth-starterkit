---
"@kumix/better-auth-ui": patch
---

Sync upstream auth features and update dependencies:

- Add Empty state UI when 2FA is disabled in `TwoFactorSettings`.
- Support `baseURL` and `callbackURL` in `SignUp`.
- Add null-safety for Bowser user agent parsing in `ActiveSession`.
- Update `InviteMemberDialog` to use `onCheckedChange` for role selection.
- Bump `@kumix/ui` to `^0.4.0` and `better-auth` to `^1.7.7`.
