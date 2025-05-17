'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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

interface IntrospectionData {
  procedures: Array<{
    path: string;
    type: 'query' | 'mutation' | 'subscription';
    inputSchema: unknown;
    outputSchema: unknown;
  }>;
}

export default function Home() {
  const [trpcUrl, setTrpcUrl] = useState('http://localhost:3000/api/trpc');
  const [query, setQuery] = useState(`{
  "procedure": "complex.getProducts",
  "input": {
    "search": "laptop",
    "categories": ["electronics"],
    "minPrice": 500,
    "maxPrice": 1000,
    "inStock": true,
    "sortBy": "price",
    "sortOrder": "asc"
  }
}`);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<number[]>([]);
  const [introspectionData, setIntrospectionData] = useState<IntrospectionData | null>(null);
  const [activeTab, setActiveTab] = useState<'result' | 'history'>('result');
  const [leftWidth, setLeftWidth] = useState(60); // percent (3/5)
  const dragging = useRef(false);

  useEffect(() => {
    const fetchIntrospection = async () => {
      try {
        const response = await fetch(`${trpcUrl}/introspection`);
        const data = await response.json();
        setIntrospectionData(data);
      } catch (err) {
        console.error('Failed to fetch introspection data:', err);
      }
    };

    fetchIntrospection();
  }, [trpcUrl]);

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

        const suggestions = introspectionData?.procedures.map(procedure => ({
          label: procedure.path,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: procedure.path,
          detail: `tRPC ${procedure.type}: ${procedure.path}`,
          documentation: {
            value: [
              `**${procedure.type.toUpperCase()} Procedure**`,
              '',
              '**Input Schema:**',
              '```json',
              JSON.stringify(procedure.inputSchema, null, 2),
              '```',
              '',
              '**Output Schema:**',
              '```json',
              JSON.stringify(procedure.outputSchema, null, 2),
              '```',
            ].join('\n'),
          },
          range,
        })) ?? [];

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

        const procedure = introspectionData?.procedures.find(p => p.path === word.word);
        if (!procedure) return null;

        return {
          contents: [
            {
              value: [
                `**${procedure.type.toUpperCase()} Procedure**`,
                '',
                '**Input Schema:**',
                '```json',
                JSON.stringify(procedure.inputSchema, null, 2),
                '```',
                '',
                '**Output Schema:**',
                '```json',
                JSON.stringify(procedure.outputSchema, null, 2),
                '```',
              ].join('\n'),
            },
          ],
        };
      },
    });
  }, [introspectionData]);

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

  // Handle drag events for the divider
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
  };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const container = document.getElementById('main-panels');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let percent = ((e.clientX - rect.left) / rect.width) * 100;
      percent = Math.max(20, Math.min(80, percent)); // clamp between 20% and 80%
      setLeftWidth(percent);
    };
    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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

      {/* Main panels with resizable divider */}
      <div id="main-panels" className="flex flex-1 min-h-0 p-4 gap-0" style={{ position: 'relative' }}>
        {/* Left Panel: Query Editor */}
        <div style={{ width: `${leftWidth}%` }} className="h-full flex flex-col">
          <Card className="w-full flex flex-col border h-full">
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
        </div>

        {/* Divider (scale indicator) */}
        <div
          onMouseDown={handleMouseDown}
          style={{ cursor: 'col-resize', width: 8, zIndex: 10 }}
          className="flex-shrink-0 flex flex-col justify-center items-center select-none hover:bg-primary/20 transition-colors rounded"
        >
          <div className="w-1 h-16 bg-border rounded-full" />
        </div>

        {/* Right Panel: Tabs for Result/History */}
        <div style={{ width: `${100 - leftWidth}%` }} className="h-full flex flex-col">
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
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
