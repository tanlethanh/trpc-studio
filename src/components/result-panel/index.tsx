import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RequestHistory } from '@/components/result-panel/request-history';
import { IntrospectionView } from '@/components/introspection-view';
import { HeadersPanel } from '@/components/headers-panel';
import { type RequestLog } from '@/types/trpc';
import { type IntrospectionData } from '@/types/trpc';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Code, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

interface Header {
  key: string;
  value: string;
}

interface ResultPanelProps {
  activeTab: 'result' | 'history' | 'introspection' | 'headers';
  setActiveTab: (tab: 'result' | 'history' | 'introspection' | 'headers') => void;
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
  onHeadersChange
}: ResultPanelProps) {
  const { theme } = useTheme();
  const lastLog = requestLogs[requestLogs.length - 1];
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Add resize listener to update line numbers visibility
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.updateOptions({
          lineNumbers: window.innerWidth < 768 ? 'off' : 'on'
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className="w-full flex flex-col border h-full md:rounded-r-xl md:rounded-l-none rounded-b-xl rounded-t-none">
      <CardHeader className="flex-none border-b bg-muted/30 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 my-1">
            <button
              onClick={() => setActiveTab('result')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'result'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="hidden sm:inline">Result</span>
              <CheckCircle2 className="h-4 w-4 sm:hidden" />
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'history'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="hidden sm:inline">History</span>
              <Clock className="h-4 w-4 sm:hidden" />
            </button>
            <button
              onClick={() => setActiveTab('introspection')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'introspection'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="hidden sm:inline">Introspection</span>
              <Code className="h-4 w-4 sm:hidden" />
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'headers'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="hidden sm:inline">Headers</span>
              <FileText className="h-4 w-4 sm:hidden" />
            </button>
          </div>
          {activeTab === 'introspection' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onReloadIntrospection}
              disabled={isIntrospectionLoading}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${isIntrospectionLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 min-h-0 overflow-auto">
        {activeTab === 'result' ? (
          <div className="h-full flex flex-col">
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
            <div className="flex-1">
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
                  lineNumbers: typeof window !== 'undefined' && window.innerWidth < 768 ? 'off' : 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>
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
            error={introspectionError}
          />
        )}
      </CardContent>
    </Card>
  );
} 