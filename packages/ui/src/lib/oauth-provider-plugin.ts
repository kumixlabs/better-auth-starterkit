import { createElement } from "react";
import { createAuthPlugin } from "@better-auth-ui/core";
import {
  oauthProviderPlugin as coreOAuthProviderPlugin,
  type OAuthProviderPluginOptions,
} from "@better-auth-ui/core/plugins/oauth-provider";
import { Code2 } from "lucide-react";

import { AuthorizedApplications } from "../oauth-provider/authorized-applications";
import { OrganizationOAuthClients, UserOAuthClients } from "../oauth-provider/oauth-clients";
import { OAuthConsent } from "../oauth-provider/oauth-consent";
import { OAuthSelectAccount } from "../oauth-provider/oauth-select-account";
import { OAuthSignUp } from "../oauth-provider/oauth-sign-up";

const clientManagementLabel = (label: string) =>
  createElement("span", { className: "flex items-center gap-1" }, createElement(Code2), label);

export const oauthProviderPlugin = createAuthPlugin(
  coreOAuthProviderPlugin.id,
  (options: OAuthProviderPluginOptions = {}) => {
    const core = coreOAuthProviderPlugin(options);

    return {
      ...core,
      views: {
        auth: {
          oauthConsent: OAuthConsent,
          // A route of its own rather than an override of the built-in
          // `signUp` view — ordinary sign-up stays untouched.
          oauthSignUp: OAuthSignUp,
          oauthSelectAccount: OAuthSelectAccount,
        },
      },
      ...(core.showConnectedApplications ? { securityCards: [AuthorizedApplications] } : {}),
      ...(core.clientManagement
        ? {
            settingsTabs: [
              {
                view: "oauthClients" as const,
                label: clientManagementLabel(core.localization.oauthClients),
                component: UserOAuthClients,
              },
            ],
          }
        : {}),
      ...(core.organizationClientManager
        ? {
            organizationTabs: [
              {
                id: "oauthClients",
                path: options.clientManagementPath ?? "oauth-clients",
                label: clientManagementLabel(core.localization.oauthClients),
                component: OrganizationOAuthClients,
              },
            ],
          }
        : {}),
    };
  },
);
