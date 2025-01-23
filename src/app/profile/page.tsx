'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Settings, Bell, Calendar, Clock, Globe, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCustomToast } from '@/components/ui/toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  timezone: z.string(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  timeFormat: z.enum(['12', '24']),
  weekStart: z.enum(['sunday', 'monday']),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    eventReminders: z.boolean(),
    weeklyDigest: z.boolean(),
  }),
  calendar: z.object({
    defaultView: z.enum(['month', 'week', 'day']),
    showWeekends: z.boolean(),
    showDeclinedEvents: z.boolean(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const toast = useCustomToast();
  const [isLoading, setIsLoading] = useState(true);
  const currentDateTime = new Date('2025-01-22T09:07:43Z');
  const userId = 'parthsharma-git';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      notifications: {
        email: true,
        push: true,
        eventReminders: true,
        weeklyDigest: false,
      },
      calendar: {
        defaultView: 'month',
        showWeekends: true,
        showDeclinedEvents: false,
      },
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        
        Object.entries(data).forEach(([key, value]) => {
          setValue(key as any, value);
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setValue, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (status === 'loading' || isLoading) {
    return <ProfileSkeleton />;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="w-96 text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
            <Button onClick={() => signIn()}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <User className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">General Settings</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  </div>
                  
                  <div className="grid gap-4">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      {...register('email')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  </div>

                  <div className="grid gap-4">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={watch('timezone')}
                      onValueChange={(value) => setValue('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        {/* Add more timezones as needed */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Notification Preferences</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={watch('notifications.email')}
                      onCheckedChange={(checked) =>
                        setValue('notifications.email', checked, { shouldDirty: true })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <Switch
                      id="push-notifications"
                      checked={watch('notifications.push')}
                      onCheckedChange={(checked) =>
                        setValue('notifications.push', checked, { shouldDirty: true })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="event-reminders">Event Reminders</Label>
                    <Switch
                      id="event-reminders"
                      checked={watch('notifications.eventReminders')}
                      onCheckedChange={(checked) =>
                        setValue('notifications.eventReminders', checked, { shouldDirty: true })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Calendar Settings</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <Label htmlFor="defaultView">Default View</Label>
                    <Select
                      value={watch('calendar.defaultView')}
                      onValueChange={(value: any) =>
                        setValue('calendar.defaultView', value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select default view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-weekends">Show Weekends</Label>
                    <Switch
                      id="show-weekends"
                      checked={watch('calendar.showWeekends')}
                      onCheckedChange={(checked) =>
                        setValue('calendar.showWeekends', checked, { shouldDirty: true })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => reset()}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty}>
              Save Changes
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container max-w-4xl py-8">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}