'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatInTimeZone } from 'date-fns-tz';

export const TimeZoneSelector = () => {
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const mutation = useMutation({
    mutationFn: (newTimeZone: string) =>
      fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeZone: newTimeZone }),
      }),
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Time Zone</label>
      <select
        value={timeZone}
        onChange={(e) => {
          setTimeZone(e.target.value);
          mutation.mutate(e.target.value);
        }}
        className="w-full rounded-md border border-gray-300 p-2"
      >
        {Intl.supportedValuesOf('timeZone').map((zone) => (
          <option key={zone} value={zone}>
            {zone} ({formatInTimeZone(new Date('2025-01-21T11:05:06Z'), zone, 'PPp')})
          </option>
        ))}
      </select>
    </div>
  );
};