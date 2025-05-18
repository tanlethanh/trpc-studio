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
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

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
  } = useQueryExecution(trpcUrl, introspectionData);

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
            <div className="flex items-center gap-2">
              <a
                href="https://trpc.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_43_39)">
                    <path d="M362 0H150C67.1573 0 0 67.1573 0 150V362C0 444.843 67.1573 512 150 512H362C444.843 512 512 444.843 512 362V150C512 67.1573 444.843 0 362 0Z" fill="#191919"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M255.446 75L326.523 116.008V138.556L412.554 188.238V273.224L435.631 286.546V368.608L364.6 409.615L333.065 391.378L256.392 435.646L180.178 391.634L149.085 409.615L78.0537 368.538V286.546L100.231 273.743V188.238L184.415 139.638L184.462 139.636V116.008L255.446 75ZM326.523 159.879V198.023L255.492 239.031L184.462 198.023V160.936L184.415 160.938L118.692 198.9V263.084L149.085 245.538L220.115 286.546V368.538L198.626 380.965L256.392 414.323L314.618 380.712L293.569 368.538V286.546L364.6 245.538L394.092 262.565V198.9L326.523 159.879ZM312.031 357.969V307.915L355.369 332.931V382.985L312.031 357.969ZM417.169 307.846L373.831 332.862V382.985L417.169 357.9V307.846ZM96.5153 357.9V307.846L139.854 332.862V382.915L96.5153 357.9ZM201.654 307.846L158.315 332.862V382.915L201.654 357.9V307.846ZM321.262 291.923L364.6 266.908L407.938 291.923L364.6 316.962L321.262 291.923ZM149.085 266.838L105.746 291.923L149.085 316.892L192.423 291.923L149.085 266.838ZM202.923 187.362V137.308L246.215 162.346V212.377L202.923 187.362ZM308.015 137.308L264.723 162.346V212.354L308.015 187.362V137.308ZM212.154 121.338L255.446 96.3231L298.785 121.338L255.446 146.354L212.154 121.338Z" fill="#EAEAEA"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_43_39">
                      <rect width="512" height="512" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </a>
              <h1 className="text-2xl font-medium text-foreground">
                tRPC Studio
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Test your tRPC endpoints with ease
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-9 w-9"
            >
              <a
                href="https://github.com/tanlethanh/trpc-studio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
              >
                <Github className="h-[1.2rem] w-[1.2rem]" />
              </a>
            </Button>
            <ThemeToggle />
          </div>
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
