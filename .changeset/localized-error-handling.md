---
"@kumix/better-auth-ui": patch
---

Refactor error handling to use localized messages via `getAuthErrorMessage` and `getAuthErrorCode` from `@better-auth-ui/core`. Copy, image upload/delete, and linked account errors now use localization keys instead of raw error strings. User profile section is hidden when avatar is disabled and no profile fields are configured.
