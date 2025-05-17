import { Button } from '@/components/ui/button';
import { Play, ChevronDown, ChevronRight } from 'lucide-react';
import { type RequestLog } from '@/types/trpc';

interface RequestHistoryProps {
  logs: RequestLog[];
  expandedLogs: number[];
  toggleLog: (index: number) => void;
  replayQuery: (log: RequestLog) => void;
  isLoading: boolean;
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
      {logs.length === 0 && (
        <div className="p-3 text-sm text-muted-foreground text-center">
          No requests yet
        </div>
      )}
    </div>
  );
} 