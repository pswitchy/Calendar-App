'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export const LoginButton = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100"
      >
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        <span>Sign Out</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center space-x-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
    >
      <Image
        src="/google-logo.svg"
        alt="Google"
        width={20}
        height={20}
      />
      <span>Sign in with Google</span>
    </button>
  );
};