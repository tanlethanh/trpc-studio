import { useState, useCallback } from 'react';
import { type IntrospectionData } from '@/types/trpc';

export function useIntrospection(trpcUrl: string) {
  const [introspectionData, setIntrospectionData] = useState<IntrospectionData | null>(null);

  const fetchIntrospection = useCallback(async () => {
    try {
      const response = await fetch(`${trpcUrl}/introspection`);
      const data = await response.json();
      // Handle the nested structure of the response
      setIntrospectionData({
        procedures: data.result.data.procedures
      });
    } catch (err) {
      console.error('Failed to fetch introspection data:', err);
    }
  }, [trpcUrl]);

  return { introspectionData, fetchIntrospection };
} 