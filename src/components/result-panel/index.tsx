import { RefreshCw } from 'lucide-react';
import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { Tabs } from './tabs';
import { QueryResult } from './query-result';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RequestHistory } from '@/components/result-panel/request-history';
import { IntrospectionView } from '@/components/introspection-view';
import { HeadersPanel } from '@/components/headers-panel';
import type { RequestLog } from '@/types/trpc';
import type { IntrospectionData } from '@/types/trpc';
import { Button } from '@/components/ui/button';

interface Header {
	key: string;
	value: string;
}

interface ResultPanelProps {
	activeTab: 'result' | 'history' | 'introspection' | 'headers';
	setActiveTab: (
		tab: 'result' | 'history' | 'introspection' | 'headers',
	) => void;
	result: unknown;
	error: string | null;
	requestLogs: RequestLog[];
	expandedLogs: number[];
	toggleLog: (index: number) => void;
	replayQuery: (log: RequestLog) => void;
	isLoading: boolean;
	introspectionData: IntrospectionData | null;
	onReloadIntrospection: () => void;
	isIntrospectionLoading: boolean;
	isIntrospectionReFetching: boolean;
	introspectionError: string | null;
	headers: Header[];
	onHeadersChange: (headers: Header[]) => void;
}

export function ResultPanel({
	activeTab,
	setActiveTab,
	result,
	error,
	requestLogs,
	expandedLogs,
	toggleLog,
	replayQuery,
	isLoading,
	introspectionData,
	onReloadIntrospection,
	isIntrospectionLoading,
	introspectionError,
	headers,
	onHeadersChange,
	isIntrospectionReFetching,
}: ResultPanelProps) {
	const lastLog = requestLogs[requestLogs.length - 1];
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

	// Add resize listener to update line numbers visibility
	useEffect(() => {
		const handleResize = () => {
			if (editorRef.current) {
				editorRef.current.updateOptions({
					lineNumbers: window.innerWidth < 768 ? 'off' : 'on',
				});
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<Card className="w-full flex flex-col border h-full md:rounded-r-xl md:rounded-l-none rounded-b-xl rounded-t-none">
			<CardHeader className="flex-row items-center border-b bg-muted/30 py-2 h-[52px]">
				<Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

				{activeTab === 'introspection' && (
					<Button
						variant="ghost"
						size="icon"
						onClick={onReloadIntrospection}
						disabled={isIntrospectionLoading}
						className="h-8 w-8"
					>
						<RefreshCw
							className={`h-4 w-4 ${isIntrospectionLoading ? 'animate-spin' : ''}`}
						/>
					</Button>
				)}
			</CardHeader>

			<CardContent className="flex-1 p-0 min-h-0 overflow-auto">
				{activeTab === 'result' ? (
					<QueryResult
						lastLog={lastLog}
						error={error}
						result={result}
					/>
				) : activeTab === 'history' ? (
					<RequestHistory
						logs={requestLogs}
						expandedLogs={expandedLogs}
						toggleLog={toggleLog}
						replayQuery={replayQuery}
						isLoading={isLoading}
					/>
				) : activeTab === 'headers' ? (
					<HeadersPanel
						headers={headers}
						onChange={onHeadersChange}
					/>
				) : (
					<IntrospectionView
						data={introspectionData}
						isLoading={isIntrospectionLoading}
						isReFetching={isIntrospectionReFetching}
						error={introspectionError}
					/>
				)}
			</CardContent>
		</Card>
	);
}
