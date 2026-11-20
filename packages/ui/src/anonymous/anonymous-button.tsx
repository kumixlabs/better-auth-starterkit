"use client";

import { authMutationKeys } from "@better-auth-ui/core";
import type { AnonymousAuthClient } from "@better-auth-ui/core/plugins/anonymous";
import { anonymousPlugin } from "@better-auth-ui/core/plugins/anonymous";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useSignInAnonymous } from "@better-auth-ui/react/plugins/anonymous";
import { useIsMutating } from "@tanstack/react-query";
import { UserRound } from "lucide-react";

import { Button } from "@kumix/ui/ui/button";
import { Spinner } from "@kumix/ui/ui/spinner";
import { cn } from "@kumix/utils";

/** Sign in with a temporary anonymous account. */
export function AnonymousButton() {
  const { authClient, navigate, redirectTo } = useAuth<AnonymousAuthClient>();
  const { localization } = useAuthPlugin(anonymousPlugin);
  const { mutate: signInAnonymous, isPending: anonymousPending } = useSignInAnonymous(authClient, {
    onSuccess: () => {
      navigate({ to: redirectTo });
    },
  });

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all,
  });
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all,
  });
  const isPending = signInMutating + signUpMutating > 0;

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      className={cn("w-full", isPending && "pointer-events-none")}
      onClick={() => {
        signInAnonymous();
      }}
    >
      {anonymousPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <UserRound data-icon="inline-start" />
      )}
      {localization.continueAsGuest}
    </Button>
  );
}
