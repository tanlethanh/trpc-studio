import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { type IntrospectionData } from '@/types/trpc';

interface SchemaField {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  metadata?: Record<string, unknown>;
  fields?: SchemaField[];
}

interface ParsedSchema {
  type: string;
  fields: SchemaField[];
}

interface SchemaViewProps {
  schema: unknown;
  viewMode: 'raw' | 'parsed';
  layoutMode?: 'horizontal' | 'vertical';
}

function parseZodSchema(schema: unknown): ParsedSchema {
  if (!schema || typeof schema !== 'object') {
    return {
      type: 'unknown',
      fields: []
    };
  }

  const schemaObj = schema as Record<string, unknown>;
  console.log('Parsing schema:', schemaObj);

  // Handle non-object schemas
  if (!('_def' in schemaObj)) {
    if (Array.isArray(schemaObj)) {
      return {
        type: 'array',
        fields: []
      };
    }
    return {
      type: typeof schemaObj,
      fields: []
    };
  }

  const def = schemaObj._def as Record<string, unknown>;
  const typeName = def.typeName as string;
  console.log('Schema type:', typeName);

  if (typeName === 'ZodObject') {
    const shape = def.shape as Record<string, unknown>;
    const fields: SchemaField[] = Object.entries(shape).map(([key, value]) => {
      const field = value as Record<string, unknown>;
      const fieldDef = field._def as Record<string, unknown>;
      const isOptional = fieldDef.typeName === 'ZodOptional';
      const innerType = isOptional ? (fieldDef.innerType as Record<string, unknown>) : field;
      const innerDef = innerType._def as Record<string, unknown>;
      const description = innerDef.description as string | undefined;
      const defaultValue = innerDef.defaultValue as unknown;
      const metadata = innerDef.metadata as Record<string, unknown> | undefined;

      return {
        name: key,
        type: getZodType(innerType),
        description,
        required: !isOptional,
        defaultValue,
        metadata,
        fields: innerDef.typeName === 'ZodObject' ? parseZodSchema(innerType).fields : undefined
      };
    });

    return {
      type: 'object',
      fields
    };
  }

  return {
    type: typeName,
    fields: []
  };
}

function getZodType(schema: unknown): string {
  if (!schema || typeof schema !== 'object') return 'unknown';
  const def = (schema as Record<string, unknown>)._def as Record<string, unknown>;
  const typeName = def.typeName as string;

  switch (typeName) {
    case 'ZodString':
      return 'string';
    case 'ZodNumber':
      return 'number';
    case 'ZodBoolean':
      return 'boolean';
    case 'ZodArray':
      const arrayType = getZodType(def.type as unknown);
      return `array<${arrayType}>`;
    case 'ZodObject':
      return 'object';
    case 'ZodOptional':
      return getZodType(def.innerType as unknown);
    default:
      return typeName;
  }
}

function SchemaFieldView({ field, depth = 0 }: { field: SchemaField; depth?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{field.name}</span>
            <span className="text-sm text-muted-foreground">{field.type}</span>
            {!field.required && (
              <span className="text-xs text-muted-foreground">(optional)</span>
            )}
            {field.defaultValue !== undefined && (
              <span className="text-xs text-muted-foreground">
                (default: {JSON.stringify(field.defaultValue)})
              </span>
            )}
          </div>
          {field.description && (
            <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
          )}
          {field.metadata && Object.keys(field.metadata).length > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              {Object.entries(field.metadata).map(([key, value]) => (
                <div key={key}>
                  {key}: {JSON.stringify(value)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {field.fields && field.fields.length > 0 && (
        <div className="ml-4 mt-2 space-y-2 border-l pl-4">
          {field.fields.map((subField) => (
            <SchemaFieldView key={subField.name} field={subField} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SchemaView({ schema, viewMode, layoutMode = 'horizontal' }: SchemaViewProps) {
  const { theme } = useTheme();
  const parsedSchema = parseZodSchema(schema);

  if (viewMode === 'raw') {
    return (
      <Editor
        height="100%"
        defaultLanguage="json"
        value={JSON.stringify(schema, null, 2)}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'off',
          folding: true,
          fontSize: 13,
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-auto h-full">
      {parsedSchema.fields.map((field) => (
        <SchemaFieldView key={field.name} field={field} />
      ))}
    </div>
  );
} 