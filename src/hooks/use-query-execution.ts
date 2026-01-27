import { useState, useEffect } from 'react';
import { createTRPCProxyClient, httpBatchLink, TRPCLink } from '@trpc/client';
import * as devalue from 'devalue';
import superjson from 'superjson';
import type { RequestLog, IntrospectionData } from '@/types/trpc';

interface Header {
	key: string;
	value: string;
}

export function useQueryExecution(
	trpcUrl: string,
	introspectionData: IntrospectionData | null,
) {
	const [result, setResult] = useState<unknown>(null);
	const [error, setError] = useState<string | null>(null);
	const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [expandedLogs, setExpandedLogs] = useState<number[]>([]);
	const [headers, setHeaders] = useState<Header[]>(() => {
		if (typeof window === 'undefined') return [];
		const stored = localStorage.getItem('trpc-playground-headers');
		if (!stored)
			return [
				{ key: 'Authorization', value: '' },
				{ key: 'Content-Type', value: 'application/json' },
			];
		try {
			return JSON.parse(stored);
		} catch {
			return [
				{ key: 'Authorization', value: '' },
				{ key: 'Content-Type', value: 'application/json' },
			];
		}
	});

	const appendLog = (log: RequestLog) => {
		setRequestLogs((prev) => [...prev, log]);
	};

	const executeQuery = async (procedure: string, input: unknown) => {
		setIsLoading(true);
		setError(null);
		setResult(null);
		const startTime = performance.now();

		if (!introspectionData) {
			setError('No introspection data available');
			return;
		}

		try {
			// Convert headers array to object for tRPC client
			const headerObject = headers.reduce(
				(acc, { key, value }) => {
					if (key && value) acc[key] = value;
					return acc;
				},
				{} as Record<string, string>,
			);

			// Use the transformer detected from introspection response
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let link: TRPCLink<any>;
			switch (introspectionData.transformer) {
				case 'superjson':
					link = httpBatchLink({
						url: trpcUrl,
						headers: headerObject,
						transformer: superjson,
					});
					break;
				case 'devalue':
					link = httpBatchLink({
						url: trpcUrl,
						headers: headerObject,
						transformer: {
							serialize: devalue.stringify,
							deserialize: devalue.parse,
						},
					});
					break;
				default:
					link = httpBatchLink({
						url: trpcUrl,
						headers: headerObject,
					});
					break;
			}

			const client = createTRPCProxyClient({
				links: [link],
			});

			// Get the procedure type from introspection data
			const procedureInfo = introspectionData.procedures.find(
				(p) => p.path === procedure,
			);
			const isMutation = procedureInfo?.type === 'mutation';

			// Access the procedure first, then call the appropriate method
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const procedureClient = (client as any)[procedure];
			const result = await (isMutation
				? procedureClient.mutate(input)
				: procedureClient.query(input));

			const endTime = performance.now();
			setResult(result);
			appendLog({
				timestamp: startTime,
				procedure,
				input,
				duration: Math.round(endTime - startTime),
				status: 'success' as const,
				result,
			});
		} catch (error) {
			const endTime = performance.now();
			const message = (error as Error).message ?? 'An error occurred';
			setError(message);
			appendLog({
				timestamp: startTime,
				procedure,
				input,
				duration: Math.round(endTime - startTime),
				status: 'error' as const,
				error: message,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const parseAndExecuteQuery = async (queryString: string) => {
		try {
			const queryObj = JSON.parse(queryString);
			if (!queryObj || typeof queryObj !== 'object') {
				throw new Error('Invalid query format');
			}
			if (!queryObj.procedure || typeof queryObj.procedure !== 'string') {
				throw new Error(
					'Procedure name is required and must be a string',
				);
			}
			await executeQuery(queryObj.procedure, queryObj.input);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to parse query';
			setError(errorMessage);
		}
	};

	const replayQuery = async (log: RequestLog) => {
		try {
			if (!log.procedure || typeof log.input === 'undefined') {
				throw new Error('Invalid log entry');
			}
			await executeQuery(log.procedure, log.input);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to replay query';
			setError(errorMessage);
		}
	};

	const toggleLog = (index: number) => {
		setExpandedLogs((prev) =>
			prev.includes(index)
				? prev.filter((i) => i !== index)
				: [...prev, index],
		);
	};

	// Save headers to localStorage whenever they change
	useEffect(() => {
		localStorage.setItem(
			'trpc-playground-headers',
			JSON.stringify(headers),
		);
	}, [headers]);

	return {
		result,
		error,
		requestLogs,
		isLoading,
		expandedLogs,
		headers,
		executeQuery,
		parseAndExecuteQuery,
		replayQuery,
		toggleLog,
		setHeaders,
	};
}
