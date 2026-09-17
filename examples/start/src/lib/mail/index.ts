import { MagicLinkEmail } from "@kumix/better-auth-ui/email/magic-link";
import { OtpEmail } from "@kumix/better-auth-ui/email/otp-email";
import { ResetPasswordEmail } from "@kumix/better-auth-ui/email/reset-password";
import { createEmail } from "@kumix/email";
import { renderEmailTemplate } from "@kumix/email/helpers";

const APP_NAME = "Better Auth UI";

const MAGIC_LINK_EXPIRES_SECONDS = 300;
const OTP_EXPIRES_SECONDS = 300;

const otpSubjects = {
  "sign-in": "Your sign-in code",
  "email-verification": "Verify your email",
  "forget-password": "Reset your password",
  "change-email": "Confirm your new email",
} as const;

let _email: ReturnType<typeof createEmail> | null = null;

function getEmail() {
  if (!_email) {
    _email = createEmail();
  }
  return _email;
}

export { MAGIC_LINK_EXPIRES_SECONDS, OTP_EXPIRES_SECONDS };

export async function sendOtpEmail({
  to,
  otp,
  type,
}: {
  to: string;
  otp: string;
  type: keyof typeof otpSubjects;
}) {
  const html = await renderEmailTemplate(OtpEmail, {
    verificationCode: otp,
    appName: APP_NAME,
    email: to,
    expirationMinutes: OTP_EXPIRES_SECONDS / 60,
    poweredBy: true,
  });

  await getEmail().sendEmail({
    to,
    subject: otpSubjects[type],
    html,
    text: `Your code is ${otp}. It expires in ${String(OTP_EXPIRES_SECONDS / 60)} minutes.`,
  });
}

export async function sendResetPasswordEmail({ to, url }: { to: string; url: string }) {
  const html = await renderEmailTemplate(ResetPasswordEmail, {
    url,
    appName: APP_NAME,
    email: to,
    poweredBy: true,
  });

  await getEmail().sendEmail({
    to,
    subject: "Reset your password",
    html,
    text: `Click the link to reset your password: ${url}`,
  });
}

export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  const html = await renderEmailTemplate(MagicLinkEmail, {
    url,
    appName: APP_NAME,
    email: to,
    expirationMinutes: MAGIC_LINK_EXPIRES_SECONDS / 60,
    poweredBy: true,
  });

  await getEmail().sendEmail({
    to,
    subject: `Sign in to ${APP_NAME}`,
    html,
    text: `Sign in with this link (expires in ${String(MAGIC_LINK_EXPIRES_SECONDS / 60)} minutes): ${url}`,
  });
}
