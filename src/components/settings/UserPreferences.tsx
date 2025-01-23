'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { Switch } from '@radix-ui/react-switch';

export const UserPreferences = () => {
  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => fetch('/api/preferences').then(res => res.json()),
  });

  const mutation = useMutation({
    mutationFn: (newPreferences) => 
      fetch('/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify(newPreferences),
      }),
    onSuccess: () => {
      console.log('Preferences updated');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Dark Mode</label>
        <Switch
          checked={preferences?.darkMode}
          onCheckedChange={(checked) => 
            mutation.mutate({ ...preferences, darkMode: checked })
          }
        />
      </div>
      
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Notifications</label>
        <Switch
          checked={preferences?.notifications}
          onCheckedChange={(checked) =>
            mutation.mutate({ ...preferences, notifications: checked })
          }
        />
      </div>
    </div>
  );
};