// src/components/calendar/CurrentDateTime.tsx

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export const CurrentDateTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-sm text-gray-600">
      <span className="font-medium">
        {format(currentTime, 'yyyy-MM-dd HH:mm:ss')} UTC
      </span>
    </div>
  );
};