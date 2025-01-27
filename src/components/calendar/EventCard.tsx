// src/components/calendar/EventCard.tsx
import { format, isWithinInterval } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Tag, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { Event } from './EventList';

const CURRENT_DATETIME = '2025-01-27 12:00:56';
const CURRENT_USER = 'parthsharma-git';

interface EventCardProps {
  event: Event;
  onClick?: (e: React.MouseEvent) => void;
  viewMode?: 'list' | 'grid' | 'compact';
  showDetails?: boolean;
}

export function EventCard({ 
  event, 
  onClick, 
  viewMode = 'list',
  showDetails = true 
}: EventCardProps) {
  const isOngoing = isWithinInterval(new Date(CURRENT_DATETIME), {
    start: new Date(event.startTime),
    end: new Date(event.endTime),
  });

  const isCreatedByCurrentUser = event.createdBy === CURRENT_USER;

  if (viewMode === 'compact') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'px-2 py-1 rounded text-xs truncate',
          'hover:opacity-90 transition-opacity cursor-pointer',
          {
            'bg-primary text-white': isOngoing,
            'bg-gray-100': !isOngoing,
          }
        )}
        style={{
          borderLeft: `3px solid ${event.color || '#2196f3'}`,
        }}
      >
        <div className="flex items-center space-x-1">
          <span className="font-medium truncate">{event.title}</span>
          {event.location && (
            <span className="text-xs opacity-75 truncate">• {event.location}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        onClick={onClick}
        className={cn(
          'group p-4 rounded-lg border transition-all duration-200',
          'hover:shadow-md cursor-pointer',
          {
            'bg-white': viewMode === 'list',
            'bg-white hover:scale-102': viewMode === 'grid',
            'border-primary bg-primary/5': isOngoing,
          }
        )}
        style={{
          borderLeft: `4px solid ${event.color || '#2196f3'}`,
        }}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 group-hover:text-primary truncate">
              {event.title}
              {event.googleCalendarEventId && (
                <Tooltip>
                  <TooltipTrigger>
                    <ExternalLink className="inline-block h-3 w-3 ml-1 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Google Calendar Event</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isOngoing && (
                <Badge variant="default" className="bg-primary">
                  Ongoing
                </Badge>
              )}
              {event.category && (
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {event.category}
                </Badge>
              )}
            </div>
          </div>

          {showDetails && (
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(event.startTime), 'MMM d, yyyy')}
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
              </div>

              {event.location && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{event.location}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {event.attendees && event.attendees.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {event.attendees.map((attendee) => (
                        <p key={attendee.email} className="text-xs">
                          {attendee.email}
                          {attendee.status && ` • ${attendee.status}`}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}

              {isCreatedByCurrentUser && viewMode === 'list' && (
                <div className="text-xs text-gray-400 mt-2">
                  Created by you • Last updated {format(new Date(event.updatedAt), 'MMM d, h:mm a')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}