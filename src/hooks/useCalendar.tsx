'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarState {
  date: Date;
  view: CalendarView;
  setDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
}

export const useCalendar = create<CalendarState>()(
  persist(
    (set) => ({
      date: new Date(),
      view: 'month',
      setDate: (date) => set({ date }),
      setView: (view) => set({ view }),
    }),
    {
      name: 'calendar-storage',
    }
  )
);