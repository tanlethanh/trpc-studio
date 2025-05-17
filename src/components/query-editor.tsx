import { Monaco } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type IntrospectionData } from '@/types/trpc';

interface QueryEditorProps {
  query: string;
  setQuery: (value: string) => void;
  runQuery: () => void;
  isLoading: boolean;
  introspectionData: IntrospectionData | null;
}

export function QueryEditor({ 
  query, 
  setQuery, 
  runQuery, 
  isLoading, 
  introspectionData 
}: QueryEditorProps) {
  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.register({ id: 'trpc-query' });

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

        return { suggestions };
      },
    });

    monaco.languages.registerHoverProvider('trpc-query', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const procedure = introspectionData?.procedures.find(p => p.path === word.word);
        if (!procedure) return null;

        return {
          contents: [{
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
          }],
        };
      },
    });
  };

  return (
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
  );
} 