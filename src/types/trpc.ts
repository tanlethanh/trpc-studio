export interface IntrospectionData {
  procedures: Array<{
    path: string;
    type: 'query' | 'mutation' | 'subscription';
    inputSchema: unknown;
    outputSchema: unknown;
  }>;
}

export interface RequestLog {
  timestamp: number;
  procedure: string;
  input: unknown;
  duration: number;
  status: 'success' | 'error';
  error?: string;
  result?: unknown;
} 