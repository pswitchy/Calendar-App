import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/n-auth';
import { prisma } from '@/lib/prisma';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role?: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
  
  interface Session extends DefaultSession {
    user: User & {
      accessToken?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar"
        }
      }
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
          where: { email: credentials.email },
          include: { password: true }
        });

        if (!user || !user.password?.hash || !user.password?.salt) {
          throw new Error('User not found');
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password.hash,
          user.password.salt
        );

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          image: user.image,
          role: user.role ?? undefined
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) {
          return false;
        }
        // You can add additional verification here
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        // Handle new user registration
        await prisma.userProfile.create({
          data: {
            userId: user.id,
            createdAt: new Date('2025-01-24 15:53:35'),
            createdBy: 'parthsharma-git',
            updatedAt: new Date('2025-01-24 15:53:35'),
            theme: 'system' // Add the missing 'theme' property
          }
        });
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;