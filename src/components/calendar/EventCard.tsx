// src/components/calendar/EventCard.tsx

import { format } from 'date-fns';
import { Event } from './EventList';
import { CalendarIcon, MapPinIcon, ClockIcon } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div 
      onClick={() => onClick?.(event)}
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderLeft: `4px solid ${event.color || '#2196f3'}` }}
    >
      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
      
      {event.description && (
        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4 mr-2" />
          {format(new Date(event.startTime), 'PPP')}
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="w-4 h-4 mr-2" />
          {format(new Date(event.startTime), 'p')} - {format(new Date(event.endTime), 'p')}
        </div>
        
        {event.location && (
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="w-4 h-4 mr-2" />
            {event.location}
          </div>
        )}
      </div>
    </div>
  );
};