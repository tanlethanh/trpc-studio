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
  const [trpcUrl, setTrpcUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/trpc`;
    }
    return '/api/trpc';
  });
  const [debouncedUrl, setDebouncedUrl] = useState(trpcUrl);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'result' | 'history' | 'introspection'>('result');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUrl(trpcUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [trpcUrl]);

  const { introspectionData, fetchIntrospection, isLoading: isIntrospectionLoading, error: introspectionError } = useIntrospection(debouncedUrl);
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

  useEffect(() => {
    fetchIntrospection();
  }, [debouncedUrl, fetchIntrospection]);

  useEffect(() => {
    if (introspectionData?.procedures.length && !query) {
      const firstProcedure = introspectionData.procedures[0];
      const exampleQuery = {
        procedure: firstProcedure.path,
        input: getDefaultInputForSchema(firstProcedure.inputSchema)
      };
      setQuery(JSON.stringify(exampleQuery, null, 2));
    }
  }, [introspectionData, query]);

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
            key={JSON.stringify(introspectionData)}
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
            introspectionData={introspectionData}
            onReloadIntrospection={fetchIntrospection}
            isIntrospectionLoading={isIntrospectionLoading}
            introspectionError={introspectionError}
          />
        </div>
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
    return schema.allOf.reduce((acc: any, schema: any) => ({
      ...acc,
      ...getDefaultInputForSchema(schema)
    }), {});
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
