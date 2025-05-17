import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RequestHistory } from './request-history';
import { IntrospectionView } from './introspection-view';
import { type RequestLog } from '@/types/trpc';
import { type IntrospectionData } from '@/types/trpc';

interface ResultPanelProps {
  activeTab: 'result' | 'history' | 'introspection';
  setActiveTab: (tab: 'result' | 'history' | 'introspection') => void;
  result: unknown;
  error: string | null;
  requestLogs: RequestLog[];
  expandedLogs: number[];
  toggleLog: (index: number) => void;
  replayQuery: (log: RequestLog) => void;
  isLoading: boolean;
  introspectionData: IntrospectionData | null;
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
  introspectionData
}: ResultPanelProps) {
  return (
    <Card className="w-full flex flex-col border h-full">
      <CardHeader className="flex-none border-b bg-muted/30 py-2">
        <div className="flex items-center gap-4">
          <button
            className={`px-4 py-1 rounded-t text-sm font-medium focus:outline-none ${activeTab === 'result' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('result')}
          >
            Result
          </button>
          <button
            className={`px-4 py-1 rounded-t text-sm font-medium focus:outline-none ${activeTab === 'history' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={`px-4 py-1 rounded-t text-sm font-medium focus:outline-none ${activeTab === 'introspection' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('introspection')}
          >
            Introspection
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0 overflow-auto">
        {activeTab === 'result' ? (
          <div className="h-full">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={error ? error : JSON.stringify(result, null, 2)}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        ) : activeTab === 'history' ? (
          <RequestHistory
            logs={requestLogs}
            expandedLogs={expandedLogs}
            toggleLog={toggleLog}
            replayQuery={replayQuery}
            isLoading={isLoading}
          />
        ) : (
          <IntrospectionView data={introspectionData} />
        )}
      </CardContent>
    </Card>
  );
} 