import { viewPaths } from "@better-auth-ui/core";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { Auth } from "@kumix/better-auth-ui/auth";
import { emailOtpPlugin } from "@kumix/better-auth-ui/lib/email-otp-plugin";
import { magicLinkPlugin } from "@kumix/better-auth-ui/lib/magic-link-plugin";
import { organizationPlugin } from "@kumix/better-auth-ui/lib/organization-plugin";
import { twoFactorPlugin } from "@kumix/better-auth-ui/lib/two-factor-plugin";

const validAuthPathSegments = new Set([
  ...Object.values(viewPaths.auth),
  magicLinkPlugin().viewPaths.auth.magicLink,
  organizationPlugin().viewPaths.auth.acceptInvitation,
  emailOtpPlugin().viewPaths.auth.emailOtp,
  twoFactorPlugin().viewPaths.auth.twoFactor,
]);

export const Route = createFileRoute("/auth/$path")({
  beforeLoad({ params: { path } }) {
    if (!validAuthPathSegments.has(path)) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const { path } = Route.useParams();

  return (
    <div className="my-auto flex justify-center p-4 md:p-6">
      <Auth path={path} />
    </div>
  );
}
