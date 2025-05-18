import { Editor } from '@monaco-editor/react';
import { CheckCircle2, Clock, Code, XCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import type { RequestLog } from '@/types/trpc';

type Props = {
	lastLog: RequestLog;
	error: string | null;
	result: unknown;
};

export function QueryResult({ lastLog, error, result }: Props) {
	const { theme } = useTheme();
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

	useEffect(() => {
		// Trigger editor resize when lastLog changes
		if (editorRef.current) {
			editorRef.current.layout({
				width: undefined as never,
				height: undefined as never,
			});
		}
	}, [lastLog]);

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{lastLog && (
				<div className="flex-none border-b bg-muted/30 p-2">
					<div className="flex items-center gap-4 text-sm">
						<div className="flex items-center gap-1">
							{error ? (
								<XCircle className="h-4 w-4 text-destructive" />
							) : (
								<CheckCircle2 className="h-4 w-4 text-green-500" />
							)}
							<span className="font-medium">
								{error ? 'Error' : 'Success'}
							</span>
						</div>
						<div className="flex items-center gap-1 text-muted-foreground">
							<Clock className="h-4 w-4" />
							<span>{lastLog.duration}ms</span>
						</div>
						<div className="flex items-center gap-1 text-muted-foreground">
							<Code className="h-4 w-4" />
							<span>{lastLog.procedure}</span>
						</div>
						<div className="text-muted-foreground">
							{new Date(lastLog.timestamp).toLocaleTimeString()}
						</div>
					</div>
				</div>
			)}
			<div className="flex-1 min-h-0">
				<Editor
					height="100%"
					defaultLanguage="json"
					value={error ? error : JSON.stringify(result, null, 2)}
					theme={theme === 'dark' ? 'vs-dark' : 'light'}
					loading={null}
					onMount={(editor) => {
						editorRef.current = editor;
					}}
					options={{
						readOnly: true,
						minimap: { enabled: false },
						fontSize: 13,
						lineNumbers:
							typeof window !== 'undefined' &&
							window.innerWidth < 768
								? 'off'
								: 'on',
						roundedSelection: false,
						scrollBeyondLastLine: false,
						automaticLayout: true,
						padding: { top: 12, bottom: 12 },
					}}
				/>
			</div>
		</div>
	);
}
