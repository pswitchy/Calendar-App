// src/components/calendar/CreateEventModal.tsx

'use client';

import { FormEvent, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateEventModalProps {
    initialDate: Date;
    isOpen: boolean;
    onClose: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ initialDate, isOpen, onClose }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: (eventData) => {
      return fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setOpen(false);
    }
  });

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        throw new Error('Function not implemented.');
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>Create Event</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          {/* Event form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
};