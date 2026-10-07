# @kumix/better-auth-ui

## 0.1.2

### Patch Changes

- [`8d039b5`](https://github.com/kumixlabs/better-auth-starterkit/commit/8d039b5d3ae7e5f590972cf9e312543e348b8660) Thanks [@kumixio](https://github.com/kumixio)! - Sync upstream auth features and update dependencies:

  - Add Empty state UI when 2FA is disabled in `TwoFactorSettings`.
  - Support `baseURL` and `callbackURL` in `SignUp`.
  - Add null-safety for Bowser user agent parsing in `ActiveSession`.
  - Update `InviteMemberDialog` to use `onCheckedChange` for role selection.
  - Bump `@kumix/ui` to `^0.4.0` and `better-auth` to `^1.7.7`.

## 0.1.1

### Patch Changes

- [`00f005c`](https://github.com/kumixlabs/better-auth-starterkit/commit/00f005c554ba9392c09be0b6dda21cc442d0edcb) Thanks [@kumixio](https://github.com/kumixio)! - Refactor error handling to use localized messages via `getAuthErrorMessage` and `getAuthErrorCode` from `@better-auth-ui/core`. Copy, image upload/delete, and linked account errors now use localization keys instead of raw error strings. User profile section is hidden when avatar is disabled and no profile fields are configured.

## 0.1.0

### Minor Changes

- [`c2d2574`](https://github.com/kumixlabs/better-auth-starterkit/commit/c2d2574f6f08fc22086d46e95d22b9cdc7cb272f) Thanks [@kumixio](https://github.com/kumixio)! - Initial release of the Kumix Better Auth UI component package.
