import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    verifyRequest: '/login?verify=1',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id;
        const verified = (user as { emailVerified?: Date | null }).emailVerified;
        token.emailVerified = verified ? new Date(verified).toISOString() : null;
      }
      if (profile?.picture) {
        token.picture = profile.picture as string;
      } else if (user?.image) {
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string | null;
        (session.user as { emailVerified?: Date | null }).emailVerified =
          typeof token.emailVerified === 'string' ? new Date(token.emailVerified) : null;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const emailVerified =
        !!(auth?.user as { emailVerified?: Date | string | null } | undefined)?.emailVerified;
      const { pathname } = nextUrl;
      const publicRoutes = ['/login', '/api/auth', '/legal'];
      const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

      if (isPublic) {
        if (isLoggedIn && emailVerified && pathname === '/login') {
          return Response.redirect(new URL('/campaigns', nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) return false;
      if (!emailVerified) {
        return Response.redirect(new URL('/login?verify=1', nextUrl));
      }
      return true;
    },
  },
};
