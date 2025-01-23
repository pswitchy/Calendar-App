import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

export const useDarkMode = () => {
  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => fetch('/api/preferences').then(res => res.json()),
  });

  const mutation = useMutation({
    mutationFn: (darkMode: boolean) =>
      fetch('/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ darkMode }),
      }),
  });

  useEffect(() => {
    if (preferences?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences?.darkMode]);

  return {
    isDarkMode: preferences?.darkMode ?? false,
    toggleDarkMode: () => mutation.mutate(!preferences?.darkMode),
  };
};