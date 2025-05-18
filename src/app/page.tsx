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
			return `${window.location.origin}/api/trpc`;
		}
		return '/api/trpc';
	});
	const [debouncedUrl, setDebouncedUrl] = useState(trpcUrl);
	const [query, setQuery] = useState('');
	const [activeTab, setActiveTab] = useState<
		'result' | 'history' | 'introspection' | 'headers'
	>('result');
	const { isMobile } = useMedia();

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedUrl(trpcUrl);
		}, 500);

		return () => clearTimeout(timer);
	}, [trpcUrl]);

	const {
		introspectionData,
		fetchIntrospection,
		isLoading: isIntrospectionLoading,
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

	useEffect(() => {
		fetchIntrospection();
	}, [debouncedUrl, fetchIntrospection]);

	useEffect(() => {
		if (introspectionData?.procedures.length && !query) {
			const firstProcedure = introspectionData.procedures[0];
			const exampleQuery = {
				procedure: firstProcedure.path,
				input: getDefaultInputForSchema(firstProcedure.inputSchema),
			};
			setQuery(JSON.stringify(exampleQuery, null, 2));
		}
	}, [introspectionData, query]);

	const runQuery = () => {
		parseAndExecuteQuery(query);
	};

	const handleReplayQuery = async (log: RequestLog) => {
		console.log('replaying query', log);
		setQuery(
			JSON.stringify(
				{
					procedure: log.procedure,
					input: log.input,
				},
				null,
				2,
			),
		);
		await replayQuery(log);
	};

	return (
		<div className="flex flex-col h-screen">
			<Header trpcUrl={trpcUrl} setTrpcUrl={setTrpcUrl} />

			<div className="flex-1 p-4">
				<PanelGroup
					direction={isMobile ? 'vertical' : 'horizontal'}
					autoSaveId="desktop-layout"
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
						<div className="h-full">
							<ResultPanel
								activeTab={activeTab}
								setActiveTab={setActiveTab}
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
								introspectionError={introspectionError}
								headers={headers}
								onHeadersChange={setHeaders}
							/>
						</div>
					</Panel>
				</PanelGroup>
			</div>
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
