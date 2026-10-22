"use client";

import { useState } from "react";
import type { OAuthProviderAuthClient } from "@better-auth-ui/core/plugins/oauth-provider";
import {
  type AuthorizedOAuthApplication,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl,
} from "@better-auth-ui/core/plugins/oauth-provider";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { usePublicOAuthClient } from "@better-auth-ui/react/plugins/oauth-provider";
import { Check, ChevronRight, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@kumix/ui/ui/avatar";
import { Button } from "@kumix/ui/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@kumix/ui/ui/item";
import { Skeleton } from "@kumix/ui/ui/skeleton";
import { oauthProviderPlugin } from "../lib/oauth-provider-plugin";
import { RemoveAuthorizationDialog } from "./remove-authorization-dialog";

export type AuthorizedApplicationProps = {
  /** @remarks `AuthorizedOAuthApplication` */
  application: AuthorizedOAuthApplication;
};

/**
 * A single authorized application row.
 *
 * Each row loads its own public client metadata so one slow or missing
 * application never blocks the rest of the card.
 */
export function AuthorizedApplication({ application }: AuthorizedApplicationProps) {
  const { authClient } = useAuth();
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin);
  const [removeOpen, setRemoveOpen] = useState(false);

  const publicClient = usePublicOAuthClient(
    authClient as OAuthProviderAuthClient,
    application.clientId,
  );

  const client = publicClient.data;
  const clientName = client?.client_name || application.clientId;
  const logoUrl = sanitizeOAuthClientUrl(client?.logo_uri);
  const websiteUrl = sanitizeOAuthClientUrl(client?.client_uri);

  return (
    <Item className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <ItemMedia variant="image">
        {publicClient.isPending ? (
          <Skeleton className="size-10 shrink-0 rounded-md" />
        ) : (
          <Avatar className="size-10 shrink-0 rounded-md">
            <AvatarImage alt={clientName} referrerPolicy="no-referrer" src={logoUrl} />
            <AvatarFallback className="rounded-md">
              <ShieldCheck className="size-4.5" />
            </AvatarFallback>
          </Avatar>
        )}
      </ItemMedia>
      <ItemContent className="min-w-0">
        {publicClient.isPending ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <ItemTitle>{clientName}</ItemTitle>
        )}

        {websiteUrl ? (
          <ItemDescription>
            <a
              className="text-muted-foreground truncate text-xs underline-offset-4 hover:underline"
              href={websiteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {websiteUrl}
            </a>
          </ItemDescription>
        ) : null}

        {application.updatedAt ? (
          <ItemDescription>
            {`${localization.lastAuthorized} ${application.updatedAt.toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}`}
          </ItemDescription>
        ) : null}
      </ItemContent>
      <ItemActions className="col-start-2 sm:col-start-3 sm:row-start-1">
        <Button size="sm" variant="outline" onClick={() => setRemoveOpen(true)}>
          {localization.removeAuthorization}
        </Button>

        <RemoveAuthorizationDialog
          application={application}
          clientName={clientName}
          open={removeOpen}
          onOpenChange={setRemoveOpen}
        />
      </ItemActions>
      {application.scopes.length > 0 ? (
        <details className="group/permissions col-span-full sm:col-span-2 sm:col-start-2">
          <summary className="text-muted-foreground focus-visible:outline-ring flex w-fit cursor-pointer list-none items-center gap-2 rounded-sm text-sm focus-visible:outline-2 [&::-webkit-details-marker]:hidden">
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 group-open/permissions:rotate-90"
            />
            {localization.permissions} <span>({application.scopes.length})</span>
          </summary>
          <ul className="bg-muted/50 mt-3 grid gap-3 rounded-lg p-4">
            {application.scopes.map((scope) => {
              const details = resolveOAuthScopeMetadata(scopeMetadata, scope, {
                clientId: application.clientId,
                requestedScopes: application.scopes,
              });
              return (
                <li key={scope} className="flex gap-3">
                  <Check
                    aria-hidden="true"
                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                  />
                  <div className="grid min-w-0 gap-1">
                    <p className="text-sm font-medium break-words">{details.label}</p>
                    {details.description ? (
                      <p className="text-muted-foreground text-sm leading-5">
                        {details.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </details>
      ) : null}
    </Item>
  );
}
