'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { QueryEditor } from '@/components/query-editor';
import { ResultPanel } from '@/components/result-panel';
import { ResizableDivider } from '@/components/resizable-divider';
import { useIntrospection } from '@/hooks/use-introspection';
import { useQueryExecution } from '@/hooks/use-query-execution';
import { type RequestLog } from '@/types/trpc';
import { usePanelResize } from '@/hooks/use-panel-resize';

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
  const [activeTab, setActiveTab] = useState<'result' | 'history'>('result');

  const { introspectionData, fetchIntrospection } = useIntrospection(trpcUrl);
  const { 
    result, 
    error, 
    requestLogs, 
    isLoading, 
    expandedLogs, 
    parseAndExecuteQuery, 
    replayQuery,
    toggleLog 
  } = useQueryExecution(trpcUrl);
  const { 
    leftWidth, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp 
  } = usePanelResize();

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    fetchIntrospection();
  }, [trpcUrl, fetchIntrospection]);

  const runQuery = () => {
    parseAndExecuteQuery(query);
  };

  const handleReplayQuery = async (log: RequestLog) => {
    setQuery(JSON.stringify({
      procedure: log.procedure,
      input: log.input
    }, null, 2));
    await replayQuery(log);
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

      <div id="main-panels" className="flex flex-1 min-h-0 p-4 gap-0" style={{ position: 'relative' }}>
        <div style={{ width: `${leftWidth}%` }} className="h-full flex flex-col">
          <QueryEditor
            query={query}
            setQuery={setQuery}
            runQuery={runQuery}
            isLoading={isLoading}
            introspectionData={introspectionData}
          />
        </div>

        <ResizableDivider onMouseDown={handleMouseDown} />

        <div style={{ width: `${100 - leftWidth}%` }} className="h-full flex flex-col">
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
          />
        </div>
      </div>
    </div>
  );
}
