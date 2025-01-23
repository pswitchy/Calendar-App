import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/n-auth';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
      accessToken?: string;
    } & DefaultSession['user'];
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            password: true // Assuming password hash and salt are in a separate table
          }
        });

        if (!user || !user.password?.hash || !user.password?.salt) {
          throw new Error('Invalid credentials');
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password.hash,
          user.password.salt
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          ...user,
          role: user.role || undefined,
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.accessToken = token.accessToken as string;
      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);