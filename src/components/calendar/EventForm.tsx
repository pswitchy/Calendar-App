// src/components/calendar/EventForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  location: z.string().optional(),
  category: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

interface EventFormProps {
  onSubmit: (data: any) => void;
  initialData?: {
    title?: string;
    description?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    location?: string;
    category?: string;
    color?: string;
  };
}

export const EventForm: React.FC<EventFormProps> = ({ onSubmit, initialData = {} }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          {...register('title')}
          className="w-full rounded-md border p-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full rounded-md border p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="time"
            {...register('startTime')}
            className="w-full rounded-md border p-2"
          />
        </div>
      </div>

      {/* Similar fields for end date/time, location, category, etc. */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white rounded-md py-2 hover:bg-primary-dark
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : 'Save Event'}
      </button>
    </form>
  );
};