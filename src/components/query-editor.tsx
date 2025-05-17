import { Monaco } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type IntrospectionData } from '@/types/trpc';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

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
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const disposableRef = useRef<any>(null);

  const setupCompletionProvider = (monaco: Monaco) => {
    // Remove existing providers
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [],
    });

    // Dispose of previous provider if it exists
    if (disposableRef.current) {
      disposableRef.current.dispose();
    }

    // Only register provider if we have introspection data
    if (!introspectionData) {
      console.log('No introspection data available, skipping provider registration');
      return;
    }

    console.log('Registering completion provider with introspection data:', introspectionData);

    // Add our custom completion provider
    const disposable = monaco.languages.registerCompletionItemProvider('json', {
      triggerCharacters: ['"', '.', ':'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordAtPosition(position);
        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);
        
        // Check if we're in the procedure field
        const isInProcedureField = beforeCursor.includes('"procedure"') && 
          !beforeCursor.includes('"input"') &&
          !beforeCursor.includes('"output"') &&
          beforeCursor.includes(':');

        // Check if we're in the input field
        const isInInputField = beforeCursor.includes('"input"') && 
          beforeCursor.includes(':');

        if (isInProcedureField) {
          console.log('In procedure field, introspection data:', introspectionData);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word?.startColumn ?? position.column,
            endColumn: word?.endColumn ?? position.column,
          };

          const suggestions = introspectionData.procedures.map(procedure => ({
            label: procedure.path,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: `"${procedure.path}"`,
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
          }));

          console.log('Procedure suggestions:', suggestions);
          return { suggestions };
        }

        if (isInInputField) {
          // Find the current procedure
          const procedureMatch = model.getValue().match(/"procedure"\s*:\s*"([^"]+)"/);
          if (procedureMatch) {
            const procedurePath = procedureMatch[1];
            console.log('Found procedure path:', procedurePath);
            const procedure = introspectionData.procedures.find(p => p.path === procedurePath);
            console.log('Found procedure:', procedure);
            
            if (procedure?.inputSchema) {
              console.log('Input schema:', procedure.inputSchema);
              const schema = procedure.inputSchema as Record<string, unknown>;
              const def = schema._def as Record<string, unknown>;
              console.log('Schema def:', def);
              
              if ('shape' in def) {
                const shape = def.shape as Record<string, unknown>;
                console.log('Schema shape:', shape);
                const range = {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: word?.startColumn ?? position.column,
                  endColumn: word?.endColumn ?? position.column,
                };

                const suggestions = Object.entries(shape).map(([key, value]) => {
                  const field = value as Record<string, unknown>;
                  const fieldDef = field._def as Record<string, unknown>;
                  console.log('Field def:', fieldDef);
                  const type = fieldDef.typeName as string;
                  const description = fieldDef.description as string | undefined;
                  const defaultValue = fieldDef.defaultValue as unknown;
                  const isOptional = fieldDef.typeName === 'ZodOptional';

                  return {
                    label: key,
                    kind: monaco.languages.CompletionItemKind.Property,
                    insertText: `"${key}": ${getDefaultValueForType(type)}`,
                    detail: `${type}${isOptional ? ' (optional)' : ''}`,
                    documentation: {
                      value: [
                        description ? `**Description:** ${description}` : '',
                        defaultValue !== undefined ? `**Default:** ${JSON.stringify(defaultValue)}` : '',
                      ].filter(Boolean).join('\n\n'),
                    },
                    range,
                  };
                });

                console.log('Input field suggestions:', suggestions);
                return { suggestions };
              }
            }
          }
        }

        return { suggestions: [] };
      },
    });

    disposableRef.current = disposable;
    return disposable;
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setupCompletionProvider(monaco);
  };

  // Update completion provider when introspection data changes
  useEffect(() => {
    if (monacoRef.current) {
      console.log('Introspection data changed, updating completion provider');
      setupCompletionProvider(monacoRef.current);
    }
  }, [introspectionData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (disposableRef.current) {
        disposableRef.current.dispose();
      }
    };
  }, []);

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
            defaultLanguage="json"
            value={query}
            onChange={(value) => setQuery(value || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              suggestOnTriggerCharacters: true,
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true
              },
              wordBasedSuggestions: 'currentDocument',
              snippetSuggestions: 'inline',
              suggest: {
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showSnippets: true,
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function getDefaultValueForType(type: string): string {
  switch (type) {
    case 'ZodString':
      return '""';
    case 'ZodNumber':
      return '0';
    case 'ZodBoolean':
      return 'false';
    case 'ZodArray':
      return '[]';
    case 'ZodObject':
      return '{}';
    default:
      return 'null';
  }
} 