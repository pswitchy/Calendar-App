import { prisma } from '@/lib/prisma';

export async function refreshAccessToken(token: any) {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId: token.id,
        provider: 'google',
      },
    });

    if (!account) {
      throw new Error('No account found');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: account.refresh_token!,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    // Update the account with new tokens
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: data.access_token,
        expires_at: Math.floor(Date.now() / 1000 + data.expires_in),
        token_type: data.token_type,
      },
    });

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Math.floor(Date.now() / 1000 + data.expires_in),
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}