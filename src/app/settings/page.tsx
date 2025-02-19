// src/app/settings/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserPreferences } from '@/components/settings/UserPreferences';

export default function SettingsPage() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Please sign in to access settings.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">Preferences</h2>
            <UserPreferences />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Calendar Settings</h2>
            <CalendarSettings />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <NotificationSettings />
          </section>
        </div>
      </div>
    </div>
  );
}

const CalendarSettings = () => {
  const [defaultView, setDefaultView] = useState('month');
  const [weekStartsOn, setWeekStartsOn] = useState(0); // 0 = Sunday

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Default View</label>
        <select 
          value={defaultView}
          onChange={(e) => setDefaultView(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2"
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
          <option value="agenda">Agenda</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Week Starts On</label>
        <select 
          value={weekStartsOn}
          onChange={(e) => setWeekStartsOn(Number(e.target.value))}
          className="w-full rounded-md border border-gray-300 p-2"
        >
          <option value={0}>Sunday</option>
          <option value={1}>Monday</option>
        </select>
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState(15); // minutes

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="font-medium">Email Notifications</label>
          <p className="text-sm text-gray-500">Receive event reminders via email</p>
        </div>
        <input 
          type="checkbox"
          checked={emailNotifications}
          onChange={(e) => setEmailNotifications(e.target.checked)}
          className="h-4 w-4"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="font-medium">Push Notifications</label>
          <p className="text-sm text-gray-500">Receive event reminders via browser notifications</p>
        </div>
        <input 
          type="checkbox"
          checked={pushNotifications}
          onChange={(e) => setPushNotifications(e.target.checked)}
          className="h-4 w-4"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Default Reminder Time</label>
        <select 
          value={reminderTime}
          onChange={(e) => setReminderTime(Number(e.target.value))}
          className="w-full rounded-md border border-gray-300 p-2"
        >
          <option value={5}>5 minutes before</option>
          <option value={10}>10 minutes before</option>
          <option value={15}>15 minutes before</option>
          <option value={30}>30 minutes before</option>
          <option value={60}>1 hour before</option>
        </select>
      </div>
    </div>
  );
};