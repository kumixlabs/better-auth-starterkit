import { createAuthPlugin } from "@better-auth-ui/core";
import {
  type AnonymousPluginOptions,
  anonymousPlugin as coreAnonymousPlugin,
} from "@better-auth-ui/core/plugins/anonymous";

import { AnonymousButton } from "../anonymous/anonymous-button";

export const anonymousPlugin = createAuthPlugin(
  coreAnonymousPlugin.id,
  (options: AnonymousPluginOptions = {}) => ({
    ...coreAnonymousPlugin(options),
    authButtons: [AnonymousButton],
  }),
);
