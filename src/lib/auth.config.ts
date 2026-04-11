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
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const publicRoutes = ['/login', '/api/auth'];
      const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

      if (isPublic) {
        if (isLoggedIn && pathname === '/login') {
          return Response.redirect(new URL('/campaigns', nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
  },
};
