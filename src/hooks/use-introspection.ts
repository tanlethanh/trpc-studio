import { useState, useCallback, useEffect, useRef } from 'react';
import * as devalue from 'devalue';
import type { IntrospectionData } from '@/types/trpc';

const RE_FETCH_INTERVAL = 3_000;

export function useIntrospection(trpcUrl: string) {
	const [introspectionData, setIntrospectionData] =
		useState<IntrospectionData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isReFetching, setIsReFetching] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	const extractIntrospection = (data: unknown): IntrospectionData => {
		if (typeof data === 'string') {
			return {
				transformer: 'devalue',
				procedures: devalue.parse(data).procedures,
			};
		}

		if (typeof data === 'object' && data !== null && 'json' in data) {
			return {
				transformer: 'superjson',
				procedures: (data.json as never)['procedures'],
			};
		}

		if (typeof data === 'object' && data !== null && 'procedures' in data) {
			return {
				transformer: 'json',
				procedures: data.procedures as IntrospectionData['procedures'],
			};
		}

		throw new Error('Invalid introspection data format');
	};

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
			if (!response.ok) return;

			const data = await response.json();

			setIntrospectionData(extractIntrospection(data.result['data']));
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
