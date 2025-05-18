import { Button } from '@/components/ui/button';
import { Play, ChevronDown, ChevronRight, Clock, Code, CheckCircle2, XCircle } from 'lucide-react';
import { type RequestLog } from '@/types/trpc';

interface RequestHistoryProps {
  logs: RequestLog[];
  expandedLogs: number[];
  toggleLog: (index: number) => void;
  replayQuery: (log: RequestLog) => void;
  isLoading: boolean;
}

function JsonViewer({ data }: { data: unknown }) {
  let jsonString: string;
  
  try {
    // Handle null or undefined
    if (data == null) {
      jsonString = String(data);
      return (
        <pre className="text-xs font-mono whitespace-pre-wrap break-all bg-muted/50 p-2 rounded-md overflow-auto max-h-[150px]">
          {jsonString}
        </pre>
      );
    }

    // Handle string that might be JSON
    if (typeof data === 'string') {
      try {
        const trimmed = data.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          const parsed = JSON.parse(data);
          jsonString = JSON.stringify(parsed, null, 2);
        } else {
          jsonString = data;
        }
      } catch {
        // If JSON parsing fails, use the original string
        jsonString = data;
      }
    } else {
      // Handle other types by converting to JSON
      try {
        jsonString = JSON.stringify(data, null, 2);
      } catch {
        // If JSON stringify fails, use String conversion
        jsonString = String(data);
      }
    }
  } catch {
    // Final fallback for any unexpected errors
    jsonString = String(data);
  }

  return (
    <pre className="text-xs font-mono whitespace-pre-wrap break-all bg-muted/50 p-2 rounded-md overflow-auto max-h-[150px]">
      {jsonString}
    </pre>
  );
}

export function RequestHistory({ 
  logs, 
  expandedLogs, 
  toggleLog, 
  replayQuery, 
  isLoading 
}: RequestHistoryProps) {
  return (
    <div className="divide-y divide-border">
      {logs.map((log, index) => (
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
            <div className="flex items-center gap-4 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{log.duration}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                <span>{log.procedure}</span>
              </div>
              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            {log.error && (
              <div className="mt-1 text-xs text-red-500">
                {log.error}
              </div>
            )}
          </div>
          {expandedLogs.includes(index) && (
            <div className="px-3 pb-3 space-y-3">
              <div className="rounded-md bg-muted/30 p-2">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Request
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{log.duration}ms</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Code className="h-3 w-3" />
                    <span>{log.procedure}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Input
                </div>
                <JsonViewer data={log.input} />
              </div>
              <div className="rounded-md bg-muted/30 p-2">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Response
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {log.status === 'error' ? (
                      <XCircle className="h-3 w-3 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-xs font-medium">
                      {log.status === 'error' ? 'Error' : 'Success'}
                    </span>
                  </div>
                </div>
                <JsonViewer data={log.error ? log.error : log.result} />
              </div>
            </div>
          )}
        </div>
      ))}
      {logs.length === 0 && (
        <div className="p-3 text-sm text-muted-foreground text-center">
          No requests yet
        </div>
      )}
    </div>
  );
} 