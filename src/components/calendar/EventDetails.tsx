//src/components/calendar/EventDetails.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface EventDetailsProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetails = ({ eventId, isOpen, onClose }: EventDetailsProps) => {
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetch(`/api/events/${eventId}`).then(res => res.json()),
    enabled: isOpen,
  });

  const { data: attendees } = useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: () => fetch(`/api/events/${eventId}/attendees`).then(res => res.json()),
    enabled: isOpen,
  });

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event?.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event?.startTime), 'PPPP')}</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {format(new Date(event?.startTime), 'p')} -{' '}
              {format(new Date(event?.endTime), 'p')}
            </span>
          </div>

          {event?.location && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          )}

          {attendees?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>Attendees</span>
              </div>
              <div className="pl-6">
                {attendees.map((attendee: any) => (
                  <div key={attendee.id} className="flex items-center space-x-2">
                    <span>{attendee.user.name}</span>
                    <span className="text-sm text-gray-500">
                      ({attendee.role.toLowerCase()})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event?.description && (
            <div className="mt-4 text-gray-600">
              <p>{event.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};