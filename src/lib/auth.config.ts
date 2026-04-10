import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    verifyRequest: '/login?verify=1',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
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
