import { useState, useCallback } from 'react';
import { type IntrospectionData } from '@/types/trpc';

export function useIntrospection(trpcUrl: string) {
  const [introspectionData, setIntrospectionData] = useState<IntrospectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntrospection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${trpcUrl}/introspection`);
      const data = await response.json();
      // Handle the nested structure of the response
      setIntrospectionData({
        procedures: data.result.data.procedures
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch introspection data');
    } finally {
      setIsLoading(false);
    }
  }, [trpcUrl]);

  return { introspectionData, fetchIntrospection, isLoading, error };
} 