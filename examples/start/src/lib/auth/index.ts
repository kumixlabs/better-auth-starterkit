import { apiKey } from "@better-auth/api-key";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import {
  emailOTP,
  magicLink,
  multiSession,
  organization,
  twoFactor,
  username,
} from "better-auth/plugins";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  MAGIC_LINK_EXPIRES_SECONDS,
  OTP_EXPIRES_SECONDS,
  sendMagicLinkEmail,
  sendOtpEmail,
  sendResetPasswordEmail,
} from "@/lib/mail";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ to: user.email, url });
    },
  },
  secret: process.env.BETTER_AUTH_SECRET as string,
  plugins: [
    multiSession(),
    twoFactor({
      issuer: "Better Auth UI",
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendOtpEmail({
            to: user.email,
            otp,
            type: "sign-in",
          });
        },
      },
    }),
    emailOTP({
      expiresIn: OTP_EXPIRES_SECONDS,
      // Sign-up stays on the password and magic-link paths, matching
      // `emailOtpPlugin({ disableSignUp: true })` on the client.
      disableSignUp: true,
      overrideDefaultEmailVerification: true,
      changeEmail: { enabled: true },
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendOtpEmail({ to: email, otp, type });
      },
    }),
    passkey(),
    username(),
    apiKey([
      { configId: "default", references: "user" },
      { configId: "organization", references: "organization" },
    ]),
    organization({ teams: { enabled: true } }),
    magicLink({
      expiresIn: MAGIC_LINK_EXPIRES_SECONDS,
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: false,
      maxAge: 5 * 60,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
