'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { QueryEditor } from '@/components/query-editor';
import { ResultPanel } from '@/components/result-panel';
import { useIntrospection } from '@/hooks/use-introspection';
import { useQueryExecution } from '@/hooks/use-query-execution';
import type { RequestLog } from '@/types/trpc';
import { Header } from '@/components/header';
import { useMedia } from '@/components/use-media';

export default function Home() {
	const [trpcUrl, setTrpcUrl] = useState(() => {
		if (typeof window !== 'undefined') {
			return (
				localStorage.getItem('trpc-url') ||
				`${window.location.origin}/api/trpc`
			);
		}
		return '/api/trpc';
	});
	const [debouncedUrl, setDebouncedUrl] = useState(trpcUrl);
	const [query, setQuery] = useState('');
	const { isMobile } = useMedia();

	const {
		introspectionData,
		fetchIntrospection,
		isLoading: isIntrospectionLoading,
		isReFetching: isIntrospectionReFetching,
		error: introspectionError,
	} = useIntrospection(debouncedUrl);

	const {
		result,
		error,
		requestLogs,
		isLoading,
		expandedLogs,
		parseAndExecuteQuery,
		replayQuery,
		toggleLog,
		headers,
		setHeaders,
	} = useQueryExecution(trpcUrl, introspectionData);

	const runQuery = () => {
		parseAndExecuteQuery(query);
	};

	const handleReplayQuery = async (log: RequestLog) => {
		console.log('replaying query', log);
		setQuery(
			JSON.stringify(
				{ procedure: log.procedure, input: log.input },
				null,
				2,
			),
		);
		await replayQuery(log);
	};

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedUrl(trpcUrl), 500);
		return () => clearTimeout(timer);
	}, [trpcUrl]);

	useEffect(() => {
		localStorage.setItem('trpc-url', trpcUrl);
	}, [trpcUrl]);

	useEffect(() => {
		fetchIntrospection();
	}, [debouncedUrl, fetchIntrospection]);

	useEffect(() => {
		if (introspectionData?.procedures.length) {
			let parsed: { procedure?: string } | null;

			try {
				parsed = JSON.parse(query);
			} catch {
				parsed = null;
			}

			const validProcedure = introspectionData.procedures.find(
				(p) => p.path === parsed?.procedure,
			);

			if (!validProcedure) {
				const firstProcedure = introspectionData.procedures[0];
				const exampleQuery = {
					procedure: firstProcedure.path,
					input: getDefaultInputForSchema(firstProcedure.inputSchema),
				};
				setQuery(JSON.stringify(exampleQuery, null, 2));
			}
		}
	}, [introspectionData, query]);

	return (
		<div className="flex flex-col h-screen min-h-0">
			<Header trpcUrl={trpcUrl} setTrpcUrl={setTrpcUrl} />

			<PanelGroup
				className="flex-1 min-h-0 px-4 py-3"
				direction={isMobile ? 'vertical' : 'horizontal'}
			>
				<Panel defaultSize={60} minSize={30}>
					<QueryEditor
						key={JSON.stringify(introspectionData)}
						query={query}
						setQuery={setQuery}
						runQuery={runQuery}
						isLoading={isLoading}
						introspectionData={introspectionData}
					/>
				</Panel>

				<PanelResizeHandle
					className="bg-border hover:bg-primary/50 transition-colors"
					style={{ width: isMobile ? '100%' : '1px' }}
				/>

				<Panel defaultSize={40} minSize={30}>
					<ResultPanel
						result={result}
						error={error}
						requestLogs={requestLogs}
						expandedLogs={expandedLogs}
						toggleLog={toggleLog}
						replayQuery={handleReplayQuery}
						isLoading={isLoading}
						introspectionData={introspectionData}
						onReloadIntrospection={fetchIntrospection}
						isIntrospectionLoading={isIntrospectionLoading}
						isIntrospectionReFetching={isIntrospectionReFetching}
						introspectionError={introspectionError}
						headers={headers}
						onHeadersChange={setHeaders}
					/>
				</Panel>
			</PanelGroup>
		</div>
	);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function getDefaultInputForSchema(schema: any): any {
	if (!schema || typeof schema !== 'object') {
		return null;
	}

	// Handle primitive types
	if (schema.type === 'string') {
		return '';
	}
	if (schema.type === 'number' || schema.type === 'integer') {
		return 0;
	}
	if (schema.type === 'boolean') {
		return false;
	}
	if (schema.type === 'array') {
		return [];
	}
	if (schema.type === 'object') {
		const result: Record<string, any> = {};
		if (schema.properties) {
			for (const [key, value] of Object.entries(schema.properties)) {
				const property = value as any;
				const required = schema.required?.includes(key) ?? false;

				if (property.default !== undefined) {
					result[key] = property.default;
				} else {
					result[key] = getDefaultInputForSchema(property);
				}

				// If not required and no default value, remove the property
				if (!required && result[key] === null) {
					delete result[key];
				}
			}
		}
		return result;
	}

	// Handle special cases
	if (schema.enum) {
		return schema.enum[0];
	}
	if (schema.oneOf) {
		return getDefaultInputForSchema(schema.oneOf[0]);
	}
	if (schema.anyOf) {
		return getDefaultInputForSchema(schema.anyOf[0]);
	}
	if (schema.allOf) {
		return schema.allOf.reduce(
			(acc: any, schema: any) => ({
				...acc,
				...getDefaultInputForSchema(schema),
			}),
			{},
		);
	}
	if (schema.items) {
		return [getDefaultInputForSchema(schema.items)];
	}
	if (schema.additionalProperties) {
		return {};
	}
	if (schema.const !== undefined) {
		return schema.const;
	}

	return null;
}
