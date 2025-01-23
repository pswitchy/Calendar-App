// src/components/calendar/EventSearch.tsx
'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { Search } from 'lucide-react';
import { format } from 'date-fns/format';

export const EventSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['events', 'search', searchQuery],
    queryFn: () => 
      fetch(`/api/events/search?q=${encodeURIComponent(searchQuery)}`).then(res => 
        res.json()
      ),
    enabled: searchQuery.length > 2,
  });

  const debouncedSearch = useCallback(
    debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search events..."
          className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </div>
      
      {isLoading && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg">
          Loading...
        </div>
      )}
      
      {searchResults?.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg max-h-96 overflow-auto">
          {searchResults.map((event: { id: string; title: string; startTime: string }) => (
            <SearchResult key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

const SearchResult = ({ event }: { event: { id: string; title: string; startTime: string } }) => (
  <div className="p-3 hover:bg-gray-50 cursor-pointer">
    <h4 className="font-medium">{event.title}</h4>
    <p className="text-sm text-gray-500">
      {format(new Date(event.startTime), 'PPP p')}
    </p>
  </div>
);