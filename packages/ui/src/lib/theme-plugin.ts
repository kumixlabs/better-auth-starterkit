import { createAuthPlugin } from "@better-auth-ui/core";

import { Appearance } from "../theme/appearance";
import { ThemeToggleItem } from "../theme/theme-toggle-item";
import { type ThemePluginOptions, themePluginBase } from "./theme-plugin-base";

export type { ThemePluginOptions, UseThemeHook } from "./theme-plugin-base";

export const themePlugin = createAuthPlugin(themePluginBase.id, (options: ThemePluginOptions) => ({
  ...themePluginBase(options),
  userMenuItems: [ThemeToggleItem],
  accountCards: [Appearance],
}));
