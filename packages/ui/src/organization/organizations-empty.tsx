"use client";

import { organizationPlugin } from "@better-auth-ui/core/plugins/organization";
import { useAuthPlugin } from "@better-auth-ui/react";
import { Briefcase } from "lucide-react";

import { Button } from "@kumix/ui/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@kumix/ui/ui/empty";

export type OrganizationsEmptyProps = {
  onCreatePress: () => void;
  canCreate?: boolean;
};

export function OrganizationsEmpty({ onCreatePress, canCreate = true }: OrganizationsEmptyProps) {
  const { localization: organizationLocalization } = useAuthPlugin(organizationPlugin);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Briefcase />
        </EmptyMedia>
        <EmptyTitle>{organizationLocalization.noOrganizations}</EmptyTitle>
        <EmptyDescription>{organizationLocalization.organizationsDescription}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" disabled={!canCreate} onClick={onCreatePress}>
          {organizationLocalization.createOrganization}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
