// src/components/calendar/RecurringEventForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { generateRecurringDates } from '@/lib/utils';

interface RecurringEventFormProps {
  onSubmit: (dates: Date[]) => void;
}

export const RecurringEventForm = ({ onSubmit }: RecurringEventFormProps) => {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [count, setCount] = useState(5);
  const [startDate, setStartDate] = useState(new Date('2025-01-21T11:12:32Z'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dates = generateRecurringDates(startDate, frequency, count);
    onSubmit(dates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as any)}
          className="w-full rounded-md border border-gray-300 p-2"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Number of Events</label>
        <Input
          type="number"
          min={1}
          max={30}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </div>

      <Button type="submit">Generate Dates</Button>
    </form>
  );
};