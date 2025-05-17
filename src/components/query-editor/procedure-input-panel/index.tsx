import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { type IntrospectionData } from '@/types/trpc';
import { type SchemaField } from '../types';
import { parseJsonSchema } from './schema-parser';
import { InputFields } from './input-fields';
import { ProcedureSelector } from './procedure-selector';

interface ProcedureInputPanelProps {
  introspectionData: IntrospectionData | null;
  query: string;
  setQuery: (value: string) => void;
}

export function ProcedureInputPanel({ 
  introspectionData, 
  query, 
  setQuery,
}: ProcedureInputPanelProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [currentProcedure, setCurrentProcedure] = useState<string | null>(null);
  const [isAtomicType, setIsAtomicType] = useState(false);
  const [fields, setFields] = useState<SchemaField[]>([]);

  // Parse the current query and update state
  const updateStateFromQuery = useCallback(() => {
    try {
      const queryObj = JSON.parse(query);
      if (queryObj?.procedure) {
        setCurrentProcedure(queryObj.procedure);
        if (typeof queryObj.input === 'object' && queryObj.input !== null) {
          // For object fields, only include the field inputs
          const fieldInputs: Record<string, string> = {};
          fields.forEach(field => {
            const value = queryObj.input[field.name];
            if (field.isAtomic) {
              fieldInputs[field.name] = String(value || '');
            } else if (value !== undefined && value !== null) {
              fieldInputs[field.name] = typeof value === 'string' ? value : JSON.stringify(value);
            }
          });
          setInputValues(fieldInputs);
          setIsAtomicType(false);
        } else {
          setInputValues({ value: String(queryObj.input || '') });
          setIsAtomicType(true);
        }
      }
    } catch {
      // Invalid JSON, ignore
    }
  }, [query, fields]);

  // Update state when query changes
  useEffect(() => {
    updateStateFromQuery();
  }, [query, updateStateFromQuery]);

  // Update fields and isAtomicType when procedure changes
  useEffect(() => {
    if (!introspectionData || !currentProcedure) {
      setFields([]);
      return;
    }

    const procedure = introspectionData.procedures.find(p => p.path === currentProcedure);
    if (!procedure?.inputSchema) {
      setFields([]);
      return;
    }

    const parsedFields = parseJsonSchema(procedure.inputSchema);
    setFields(parsedFields);
    setIsAtomicType(parsedFields.length === 1 && parsedFields[0].name === 'value');
  }, [introspectionData, currentProcedure]);

  const handleInputChange = useCallback((key: string, value: string) => {
    const newInputValues = { ...inputValues, [key]: value };
    setInputValues(newInputValues);

    try {
      const queryObj = JSON.parse(query);
      const newQuery = {
        ...queryObj,
        input: isAtomicType ? value : {}
      };

      // For object fields, parse the values based on their types
      if (!isAtomicType) {
        fields.forEach(field => {
          const value = newInputValues[field.name];
          if (value !== undefined) {
            try {
              // Try to parse as JSON for object/array types
              newQuery.input[field.name] = JSON.parse(value);
            } catch {
              // If parsing fails, use the string value
              newQuery.input[field.name] = value;
            }
          }
        });
      }

      setQuery(JSON.stringify(newQuery, null, 2));
    } catch {
      // Invalid JSON, ignore
    }
  }, [query, inputValues, isAtomicType, setQuery, fields]);

  const handleProcedureChange = useCallback((value: string) => {
    try {
      const procedure = introspectionData?.procedures.find(p => p.path === value);
      if (!procedure?.inputSchema) {
        setQuery(JSON.stringify({ procedure: value, input: {} }, null, 2));
        return;
      }

      const parsedFields = parseJsonSchema(procedure.inputSchema);
      const isAtomic = parsedFields.length === 1 && parsedFields[0].name === 'value';
      
      if (isAtomic) {
        const defaultValue = parsedFields[0].defaultValue ?? '';
        setQuery(JSON.stringify({ 
          procedure: value, 
          input: defaultValue 
        }, null, 2));
      } else {
        const defaultInput: Record<string, unknown> = {};
        parsedFields.forEach(field => {
          if (field.defaultValue !== undefined) {
            defaultInput[field.name] = field.defaultValue;
          } else {
            // Set type-specific defaults
            switch (field.type) {
              case 'string':
                defaultInput[field.name] = '';
                break;
              case 'number':
              case 'integer':
                defaultInput[field.name] = 0;
                break;
              case 'boolean':
                defaultInput[field.name] = false;
                break;
              case 'array':
                defaultInput[field.name] = [];
                break;
              case 'object':
                defaultInput[field.name] = {};
                break;
              default:
                defaultInput[field.name] = null;
            }
          }
        });
        setQuery(JSON.stringify({ 
          procedure: value, 
          input: defaultInput 
        }, null, 2));
      }
    } catch {
      // Invalid JSON, ignore
      setQuery(JSON.stringify({ procedure: value, input: {} }, null, 2));
    }
  }, [introspectionData, setQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className='flex flex-row gap-2 border-b items-center'>
        <Button
          variant="ghost"
          className="flex items-center justify-between p-2 hover:bg-muted/50 h-10"
        >
          <span className="text-sm font-medium">Procedure Input</span>
        </Button>
        <ProcedureSelector
          introspectionData={introspectionData}
          currentProcedure={currentProcedure}
          onProcedureChange={handleProcedureChange}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            <InputFields
              fields={fields}
              inputValues={inputValues}
              onInputChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 