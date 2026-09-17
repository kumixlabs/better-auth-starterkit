"use client";

import type { TwoFactorAuthClient } from "@better-auth-ui/core/plugins/two-factor";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useDisableTwoFactor } from "@better-auth-ui/react/plugins/two-factor";
import { ShieldAlert } from "lucide-react";

import { toastSuccess } from "@kumix/ui/custom/toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@kumix/ui/ui/alert-dialog";
import { Field, FieldError, FieldLabel } from "@kumix/ui/ui/field";
import { Input } from "@kumix/ui/ui/input";
import { useAuthForm } from "../auth-form";
import { twoFactorPlugin } from "../lib/two-factor-plugin";
import { useTwoFactorPasswordRequirement } from "../lib/use-two-factor-password";

export type DisableTwoFactorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Confirm turning two-factor off.
 *
 * @param open - Whether the dialog is open.
 * @param onOpenChange - Called when the dialog requests an open state change.
 */
export function DisableTwoFactorDialog({ open, onOpenChange }: DisableTwoFactorDialogProps) {
  const { authClient, localization } = useAuth();
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin);
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement();

  const { mutateAsync: disableTwoFactor, isPending: isDisabling } = useDisableTwoFactor(
    authClient as TwoFactorAuthClient,
    {
      onSuccess: () => {
        toastSuccess({ message: twoFactorLocalization.twoFactorDisabled });
        onOpenChange(false);
      },
    },
  );

  const isPending = isDisabling || isResolvingPasswordRequirement;

  const form = useAuthForm({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) =>
      await disableTwoFactor(requiresPassword ? { password: value.password } : {}),
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-6">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <ShieldAlert />
              </AlertDialogMedia>

              <AlertDialogTitle>{twoFactorLocalization.disableTwoFactor}</AlertDialogTitle>

              <AlertDialogDescription>
                {requiresPassword
                  ? twoFactorLocalization.passwordConfirmation
                  : twoFactorLocalization.twoFactorDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {requiresPassword && (
              <form.AppField name="password">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="disable-two-factor-password">
                      {localization.auth.password}
                    </FieldLabel>

                    <Input
                      id="disable-two-factor-password"
                      name={field.name}
                      type="password"
                      autoComplete="current-password"
                      autoFocus
                      required
                      placeholder={localization.auth.passwordPlaceholder}
                      disabled={isPending}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />

                    <FieldError />
                  </Field>
                )}
              </form.AppField>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                {localization.settings.cancel}
              </AlertDialogCancel>

              <form.AuthFormSubmitButton
                isPending={isPending}
                variant="destructive"
                disabled={isPending}
              >
                {twoFactorLocalization.disableTwoFactor}
              </form.AuthFormSubmitButton>
            </AlertDialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}
