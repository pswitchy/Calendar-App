'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

export const UserInfo = () => {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center space-x-3 p-4">
      {session.user.image && (
        <Image
          src={session.user.image}
          alt={session.user.name || 'User avatar'}
          width={40}
          height={40}
          className="rounded-full"
        />
      )}
      <div>
        <p className="font-medium">{session.user.name}</p>
        <p className="text-sm text-gray-500">{session.user.email}</p>
      </div>
    </div>
  );
};