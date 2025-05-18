/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { PlayIcon } from 'lucide-react';
import type { Monaco } from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { MonacoEditor } from '../monaco-editor';
import { EditorSettings } from './editor-settings';
import { setupCompletionProvider } from './completion-provider';
import { ProcedureInputPanel } from './procedure-input-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { IntrospectionData } from '@/types/trpc';
import { useSettings } from '@/hooks/use-settings';

interface QueryEditorProps {
	query: string;
	setQuery: (value: string) => void;
	runQuery: () => void;
	isLoading: boolean;
	introspectionData: IntrospectionData | null;
}

export function QueryEditor({
	query,
	setQuery,
	runQuery,
	isLoading,
	introspectionData,
}: QueryEditorProps) {
	const disposableRef = useRef<any>(null);
	const { settings, updateEditorSettings } = useSettings();
	const editorRef = useRef<any>(null);
	const monacoRef = useRef<Monaco | null>(null);

	const handleEditorMount = (editor: any, monaco: Monaco) => {
		editorRef.current = editor;
		monacoRef.current = monaco;
		const disposable = setupCompletionProvider(monaco, introspectionData);
		if (disposable) {
			disposableRef.current = disposable;
		}
	};

	// Update schema when procedure changes
	useEffect(() => {
		if (editorRef.current && disposableRef.current && monacoRef.current) {
			// Dispose old provider
			disposableRef.current.dispose();
			// Create new provider with updated schema
			const disposable = setupCompletionProvider(monacoRef.current, introspectionData);
			if (disposable) {
				disposableRef.current = disposable;
			}
		}
	}, [introspectionData, query]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (disposableRef.current) {
				disposableRef.current.dispose();
			}
		};
	}, []);

	const handleZoomIn = () => {
		updateEditorSettings({ fontSize: Math.min(settings.editor.fontSize + 2, 24) });
	};

	const handleZoomOut = () => {
		updateEditorSettings({ fontSize: Math.max(settings.editor.fontSize - 2, 8) });
	};

	const handleResetZoom = () => {
		updateEditorSettings({ fontSize: 14 });
	};

	return (
		<Card className="w-full flex flex-col border h-full md:rounded-l-xl md:rounded-r-none rounded-t-xl rounded-b-none">
			<CardHeader className="flex-none border-b bg-muted/30 py-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-medium">Query</CardTitle>
					<div className="flex gap-2">
						<Button
							onClick={runQuery}
							disabled={isLoading}
							className="flex-1"
							size="sm"
						>
							<PlayIcon className="mr-2 h-4 w-4" />
							{isLoading ? 'Running...' : 'Run Query'}
						</Button>
						<EditorSettings
							onZoomIn={handleZoomIn}
							onZoomOut={handleZoomOut}
							onResetZoom={handleResetZoom}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex-1 p-0 min-h-0">
				<PanelGroup direction="vertical" className="h-full">
					<Panel defaultSize={100} minSize={30} className="min-h-[200px]">
						<div className="h-full">
							<MonacoEditor
								key={JSON.stringify(introspectionData)}
								value={query}
								onChange={value => setQuery(value || '')}
								onMount={handleEditorMount}
								fontSize={settings.editor.fontSize}
							/>
						</div>
					</Panel>
					<PanelResizeHandle className="h-1 bg-border hover:bg-primary/50 transition-colors hidden md:block" />
					<Panel defaultSize={30} minSize={20} className="min-h-[200px] hidden md:block">
						<ProcedureInputPanel
							introspectionData={introspectionData}
							query={query}
							setQuery={setQuery}
						/>
					</Panel>
				</PanelGroup>
			</CardContent>
		</Card>
	);
}
