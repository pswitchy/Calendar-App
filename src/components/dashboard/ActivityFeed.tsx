'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Edit, Trash, UserPlus } from 'lucide-react';

const activityIcons = {
  CREATE: Calendar,
  UPDATE: Edit,
  DELETE: Trash,
  INVITE: UserPlus,
};

export const ActivityFeed = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['user-activity'],
    queryFn: () => fetch('/api/user/activity').then(res => res.json()),
  });

  if (isLoading) {
    return <div>Loading activity...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Activity</h2>
      <div className="space-y-2">
        {activities?.map((activity: { id: string; type: 'CREATE' | 'UPDATE' | 'DELETE' | 'INVITE'; description: string; createdAt: string }) => {
          const Icon = activityIcons[activity.type] || Calendar;
          
          return (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm"
            >
              <Icon className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(activity.createdAt), 'PPp')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};