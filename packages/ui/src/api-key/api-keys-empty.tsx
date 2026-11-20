"use client";

import { apiKeyPlugin } from "@better-auth-ui/core/plugins/api-key";
import { useAuthPlugin } from "@better-auth-ui/react";
import { Key } from "lucide-react";

import { Button } from "@kumix/ui/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@kumix/ui/ui/empty";

export type ApiKeysEmptyProps = {
  onCreatePress: () => void;
  hideCreate?: boolean;
};

export function ApiKeysEmpty({ onCreatePress, hideCreate }: ApiKeysEmptyProps) {
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Key />
        </EmptyMedia>
        <EmptyTitle>{apiKeyLocalization.noApiKeys}</EmptyTitle>
        <EmptyDescription>{apiKeyLocalization.apiKeysDescription}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {!hideCreate && (
          <Button size="sm" onClick={onCreatePress}>
            {apiKeyLocalization.createApiKey}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
