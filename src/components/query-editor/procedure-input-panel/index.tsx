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
            if (field.isAtomic) {
              fieldInputs[field.name] = String(queryObj.input[field.name] || '');
            } else if (queryObj.input[field.name] !== '{}') {
              fieldInputs[field.name] = String(queryObj.input[field.name] || '');
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
        input: isAtomicType ? value : newInputValues
      };

      // For object fields, only include the field inputs
      if (typeof newQuery.input === 'object' && newQuery.input !== null) {
        const fieldInputs: Record<string, string> = {};
        fields.forEach(field => {
          if (field.isAtomic) {
            fieldInputs[field.name] = String(newQuery.input[field.name] || '');
          } else if (newQuery.input[field.name] !== '{}') {
            fieldInputs[field.name] = String(newQuery.input[field.name] || '');
          }
        });
        newQuery.input = fieldInputs;
      }

      setQuery(JSON.stringify(newQuery, null, 2));
    } catch {
      // Invalid JSON, ignore
    }
  }, [query, inputValues, isAtomicType, setQuery, fields]);

  const handleProcedureChange = useCallback((value: string) => {
    try {
      const newQuery = {
        procedure: value,
        input: {}
      };
      setQuery(JSON.stringify(newQuery, null, 2));
    } catch {
      // Invalid JSON, ignore
    }
  }, [setQuery]);

  return (
    <div className="flex flex-col h-full">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 h-10"
      >
        <span className="text-sm font-medium">Procedure Input</span>
      </Button>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <ProcedureSelector
            introspectionData={introspectionData}
            currentProcedure={currentProcedure}
            onProcedureChange={handleProcedureChange}
          />
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