import { type Monaco } from '@monaco-editor/react';
import { type IntrospectionData } from '@/types/trpc';

export function setupCompletionProvider(monaco: Monaco, introspectionData: IntrospectionData | null) {
  // Remove existing providers
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: true,
    schemas: [],
  });

  // Only register provider if we have introspection data
  if (!introspectionData) {
    return null;
  }

  // Add our custom completion provider
  return monaco.languages.registerCompletionItemProvider('json', {
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

        return { suggestions };
      }

      if (isInInputField) {
        // Find the current procedure
        const procedureMatch = model.getValue().match(/"procedure"\s*:\s*"([^"]+)"/);
        if (procedureMatch) {
          const procedurePath = procedureMatch[1];
          const procedure = introspectionData.procedures.find(p => p.path === procedurePath);
          
          if (procedure?.inputSchema) {
            const schema = procedure.inputSchema as Record<string, unknown>;
            const def = schema._def as Record<string, unknown>;
            
            if ('shape' in def) {
              const shape = def.shape as Record<string, unknown>;
              const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word?.startColumn ?? position.column,
                endColumn: word?.endColumn ?? position.column,
              };

              const suggestions = Object.entries(shape).map(([key, value]) => {
                const field = value as Record<string, unknown>;
                const fieldDef = field._def as Record<string, unknown>;
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

              return { suggestions };
            }
          }
        }
      }

      return { suggestions: [] };
    },
  });
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