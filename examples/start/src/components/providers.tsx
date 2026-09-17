import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ThemeProvider, useTheme } from "next-themes";

import { AuthProvider } from "@kumix/better-auth-ui/auth-provider";
import { apiKeyPlugin } from "@kumix/better-auth-ui/lib/api-key-plugin";
import { deleteUserPlugin } from "@kumix/better-auth-ui/lib/delete-user-plugin";
import { emailOtpPlugin } from "@kumix/better-auth-ui/lib/email-otp-plugin";
import { magicLinkPlugin } from "@kumix/better-auth-ui/lib/magic-link-plugin";
import { multiSessionPlugin } from "@kumix/better-auth-ui/lib/multi-session-plugin";
import { organizationPlugin } from "@kumix/better-auth-ui/lib/organization-plugin";
import { passkeyPlugin } from "@kumix/better-auth-ui/lib/passkey-plugin";
import { themePlugin } from "@kumix/better-auth-ui/lib/theme-plugin";
import { twoFactorPlugin } from "@kumix/better-auth-ui/lib/two-factor-plugin";
import { usernamePlugin } from "@kumix/better-auth-ui/lib/username-plugin";
import { ToastContainer } from "@kumix/ui/custom/toast";
import { authClient } from "@/lib/auth/client";

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { slug } = useParams({ strict: false });

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider
        authClient={authClient}
        redirectTo="/settings/account"
        socialProviders={["google"]}
        emailAndPassword={{ requireEmailVerification: false }}
        navigate={navigate}
        plugins={[
          usernamePlugin({
            usernamePrefix: "@",
            localization: { usernamePlaceholder: "username" },
          }),
          magicLinkPlugin(),
          emailOtpPlugin({
            emailVerification: true,
            passwordReset: true,
            changeEmail: true,
          }),
          twoFactorPlugin(),
          passkeyPlugin(),
          apiKeyPlugin({
            organization: true,
            configurations: [
              { id: "default", label: "Personal", organization: false },
              { id: "organization", label: "Organization", organization: true },
            ],
          }),
          themePlugin({ useTheme }),
          multiSessionPlugin(),
          deleteUserPlugin(),
          organizationPlugin({
            slugPrefix: "@",
            slug: slug ?? null,
            teams: true,
          }),
        ]}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
      >
        {children}

        <ToastContainer />
      </AuthProvider>
    </ThemeProvider>
  );
}
