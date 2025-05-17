'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Editor, { Monaco } from '@monaco-editor/react';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from '@/server/api/root';
import { ThemeToggle } from '@/components/theme-toggle';
import { getProcedurePaths, getProcedureInputSchema, getProcedureOutputSchema, type ProcedurePath } from '@/lib/trpc-query-builder';
import { Play, ChevronDown, ChevronRight } from 'lucide-react';

interface RequestLog {
  timestamp: number;
  procedure: string;
  input: unknown;
  duration: number;
  status: 'success' | 'error';
  error?: string;
}

export default function Home() {
  const [trpcUrl, setTrpcUrl] = useState('http://localhost:3000/api/trpc');
  const [query, setQuery] = useState(`{
  "procedure": "example.getUsers",
  "input": {
    "query": "john",
    "filters": {
      "ageRange": {
        "min": 20,
        "max": 40
      },
      "tags": ["developer"],
      "hasAddress": true
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "sortBy": "name",
      "sortOrder": "asc"
    }
  }
}`);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<number[]>([]);

  const toggleLog = (index: number) => {
    setExpandedLogs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    // Register a custom language for tRPC queries
    monaco.languages.register({ id: 'trpc-query' });

    // Add completion provider
    monaco.languages.registerCompletionItemProvider('trpc-query', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return { suggestions: [] };

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = getProcedurePaths().map(procedure => ({
          label: procedure,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: procedure,
          detail: `tRPC procedure: ${procedure}`,
          documentation: {
            value: [
              '**Input Schema:**',
              '```json',
              getProcedureInputSchema(procedure as ProcedurePath),
              '```',
              '**Output Schema:**',
              '```json',
              getProcedureOutputSchema(procedure as ProcedurePath),
              '```',
            ].join('\n'),
          },
          range,
        }));

        return {
          suggestions,
        };
      },
    });

    // Add hover provider
    monaco.languages.registerHoverProvider('trpc-query', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const procedure = word.word;
        if (!getProcedurePaths().includes(procedure)) return null;

        return {
          contents: [
            {
              value: [
                '**tRPC Procedure**',
                '',
                '**Input Schema:**',
                '```json',
                getProcedureInputSchema(procedure as ProcedurePath),
                '```',
                '',
                '**Output Schema:**',
                '```json',
                getProcedureOutputSchema(procedure as ProcedurePath),
                '```',
              ].join('\n'),
            },
          ],
        };
      },
    });
  }, []);

  const executeQuery = async (procedure: string, input: unknown) => {
    try {
      setIsLoading(true);
      setError(null);
      const startTime = performance.now();
      
      const client = createTRPCProxyClient<AppRouter>({
        links: [
          httpBatchLink({
            url: trpcUrl,
          }),
        ],
      });

      // Type-safe procedure access with error handling
      if (!(procedure in client)) {
        throw new Error(`Procedure "${procedure}" not found`);
      }

      type ProcedureQuery = {
        query: (input: unknown) => Promise<unknown>;
      };

      const result = await (client[procedure as keyof typeof client] as ProcedureQuery).query(input);
      const endTime = performance.now();
      
      setResult(result);
      setRequestLogs(prev => [{
        timestamp: Date.now(),
        procedure,
        input,
        duration: Math.round(endTime - startTime),
        status: 'success' as const
      }, ...prev].slice(0, 10));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setRequestLogs(prev => [{
        timestamp: Date.now(),
        procedure,
        input,
        duration: 0,
        status: 'error' as const,
        error: errorMessage
      }, ...prev].slice(0, 10));
    } finally {
      setIsLoading(false);
    }
  };

  const runQuery = async () => {
    try {
      const queryObj = JSON.parse(query);
      if (!queryObj || typeof queryObj !== 'object') {
        throw new Error('Invalid query format');
      }
      if (!queryObj.procedure || typeof queryObj.procedure !== 'string') {
        throw new Error('Procedure name is required and must be a string');
      }
      await executeQuery(queryObj.procedure, queryObj.input);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse query';
      setError(errorMessage);
    }
  };

  const replayQuery = async (log: RequestLog) => {
    try {
      if (!log.procedure || !log.input) {
        throw new Error('Invalid log entry');
      }
      setQuery(JSON.stringify({
        procedure: log.procedure,
        input: log.input
      }, null, 2));
      await executeQuery(log.procedure, log.input);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to replay query';
      setError(errorMessage);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-none p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-foreground">
              tRPC Playground
            </h1>
            <p className="text-muted-foreground text-sm">
              Test your tRPC endpoints with ease
            </p>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">URL:</span>
          <Input
            value={trpcUrl}
            onChange={(e) => setTrpcUrl(e.target.value)}
            placeholder="Enter tRPC URL"
            className="font-mono text-sm w-[400px]"
          />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 p-4 min-h-0">
        <div className="col-span-2 grid grid-rows-2 gap-4">
          <Card className="w-full flex flex-col border">
            <CardHeader className="flex-none border-b bg-muted/30 py-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Query</CardTitle>
                <Button 
                  onClick={runQuery} 
                  className="h-7 px-3 text-sm font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Running...' : 'Run Query'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <div className="h-full">
                <Editor
                  height="100%"
                  defaultLanguage="trpc-query"
                  value={query}
                  onChange={(value) => setQuery(value || '')}
                  theme="vs-dark"
                  beforeMount={handleEditorWillMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 12, bottom: 12 },
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full flex flex-col border">
            <CardHeader className="flex-none border-b bg-muted/30 py-2">
              <CardTitle className="text-base font-medium">
                {error ? 'Error' : 'Result'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
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
            </CardContent>
          </Card>
        </div>

        <Card className="w-full flex flex-col border">
          <CardHeader className="flex-none border-b bg-muted/30 py-2">
            <CardTitle className="text-base font-medium">Request History</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 min-h-0 overflow-auto">
            <div className="divide-y divide-border">
              {requestLogs.map((log, index) => (
                <div key={index} className="text-sm">
                  <div 
                    className="p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleLog(index)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {expandedLogs.includes(index) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{log.procedure}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            replayQuery(log);
                          }}
                          disabled={isLoading}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          log.status === 'success' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      {log.duration > 0 && (
                        <span>{log.duration}ms</span>
                      )}
                    </div>
                    {log.error && (
                      <div className="mt-1 text-xs text-red-500">
                        {log.error}
                      </div>
                    )}
                  </div>
                  {expandedLogs.includes(index) && (
                    <div className="px-3 pb-3">
                      <div className="rounded-md bg-muted/30 p-2">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Request Input
                        </div>
                        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                          {JSON.stringify(log.input, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {requestLogs.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  No requests yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
