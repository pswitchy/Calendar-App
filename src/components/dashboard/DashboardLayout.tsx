'use client';

import { CurrentDateTime } from '../calendar/CurrentDateTime';
import { UserInfo } from '../layout/UserInfo';
import { ActivityFeed } from './ActivityFeed';
import { UpcomingEvents } from './UpcomingEvents';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-6">{children}</div>

      {/* Sidebar */}
      <div className="w-80 border-l bg-gray-50 p-6">
        <div className="space-y-6">
          <UserInfo />
          <CurrentDateTime />
          <UpcomingEvents />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};