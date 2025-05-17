import { useState } from 'react';
import { type IntrospectionData } from '@/types/trpc';

export function useIntrospection(trpcUrl: string) {
  const [introspectionData, setIntrospectionData] = useState<IntrospectionData | null>(null);

  const fetchIntrospection = async () => {
    try {
      const response = await fetch(`${trpcUrl}/introspection`);
      const data = await response.json();
      setIntrospectionData(data);
    } catch (err) {
      console.error('Failed to fetch introspection data:', err);
    }
  };

  return { introspectionData, fetchIntrospection };
} 