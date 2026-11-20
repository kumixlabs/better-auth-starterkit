"use client";

import { oauthProviderPlugin } from "@better-auth-ui/core/plugins/oauth-provider";
import { useAuthPlugin } from "@better-auth-ui/react";
import { ShieldCheck } from "lucide-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@kumix/ui/ui/empty";

export function AuthorizedApplicationsEmpty() {
  const { localization } = useAuthPlugin(oauthProviderPlugin);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldCheck />
        </EmptyMedia>
        <EmptyTitle>{localization.noConnectedApplications}</EmptyTitle>
        <EmptyDescription>{localization.connectedApplicationsDescription}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
