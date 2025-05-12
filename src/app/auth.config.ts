import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/chat');
      if (isOnChat) {
        return isLoggedIn;
      }
      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;
