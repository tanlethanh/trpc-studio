import { useState, useCallback, useEffect, useRef } from 'react';
import type { IntrospectionData } from '@/types/trpc';

const RE_FETCH_INTERVAL = 3_000;

export function useIntrospection(trpcUrl: string) {
	const [introspectionData, setIntrospectionData] =
		useState<IntrospectionData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isReFetching, setIsReFetching] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	const fetchIntrospection = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		abortControllerRef.current = new AbortController();
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${trpcUrl}/introspection`, {
				signal: abortControllerRef.current.signal,
				headers: { 'Cache-Control': 'no-cache' },
			});
			const data = await response.json();
			const newProcedures = data.result.data.procedures;
			setIntrospectionData({ procedures: newProcedures });
		} catch (err) {
			if (err instanceof Error && err.name !== 'AbortError') {
				setError(err.message || 'Failed to fetch introspection data');
			}
		} finally {
			setIsLoading(false);
		}
	}, [trpcUrl]);

	useEffect(() => {
		fetchIntrospection();

		const interval = setInterval(async () => {
			if (!isLoading) {
				setIsReFetching(true);
				await fetchIntrospection();
				setIsReFetching(false);
			}
		}, RE_FETCH_INTERVAL);

		return () => {
			clearInterval(interval);
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [fetchIntrospection]);

	return {
		introspectionData,
		fetchIntrospection,
		isLoading,
		error,
		isReFetching,
	};
}
