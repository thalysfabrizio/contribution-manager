import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { authConfig } from './auth.config';
import { CURRENT_CONSENT_VERSION } from './consent';
import { recordConsentIfMissing } from './consent-service';
import { env } from './env';
import type { AdapterUser } from 'next-auth/adapters';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // OAuth providers verificam email pela autenticação OIDC; marcamos
      // como verificado para evitar o "verifique seu email" que NextAuth
      // dispara por default mesmo após Google/etc.
      const adapterUser = user as AdapterUser;
      const isOAuthProvider = account?.type === 'oauth' || account?.type === 'oidc';
      const oauthVerified = (profile as { email_verified?: boolean } | undefined)?.email_verified;
      if (!isOAuthProvider || !oauthVerified || adapterUser.emailVerified) return true;

      const now = new Date();
      adapterUser.emailVerified = now;
      if (adapterUser.id) {
        await prisma.user.updateMany({
          where: { id: adapterUser.id },
          data: { emailVerified: now },
        });
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // O PrismaAdapter oficial não recebe emailVerified no createUser;
      // backfill aqui pra fluxo magic-link (que cria + verifica em sequência)
      // continuar idempotente.
      const adapterUser = user as AdapterUser;
      if (adapterUser.id && !adapterUser.emailVerified) {
        await prisma.user.update({
          where: { id: adapterUser.id },
          data: { emailVerified: new Date() },
        });
      }
    },
    async signIn({ user }) {
      if (!user?.id) return;
      await recordConsentIfMissing(prisma, user.id, CURRENT_CONSENT_VERSION);
    },
  },
});
