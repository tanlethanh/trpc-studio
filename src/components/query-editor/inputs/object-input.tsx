import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { type SchemaField } from '../types';
import { SchemaInput } from './schema-input';

interface ObjectInputProps {
  field: SchemaField;
  value: string;
  onChange: (value: string) => void;
}

export function ObjectInput({ field, value, onChange }: ObjectInputProps) {
  // If no fields or is atomic, show a textbox
  if (!field.fields || field.isAtomic) {
    let displayValue = value;
    try {
      // If value is an object, stringify it
      if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value);
      }
      // If value is empty, use default
      if (!displayValue) {
        displayValue = '{}';
      }
    } catch {
      displayValue = '{}';
    }

    return (
      <div className="flex flex-row gap-2 items-center">
        <Label htmlFor={field.name} className="text-sm font-medium w-1/4">
          {field.name} ({field.type})
          {!field.required && <span className="text-muted-foreground ml-1">(optional)</span>}
        </Label>
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}
        <Input
          id={field.name}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="{}"
          className="font-mono text-sm"
        />
      </div>
    );
  }

  let values: Record<string, unknown>;
  try {
    values = typeof value === 'string' ? JSON.parse(value) : (value || {});
  } catch {
    values = {};
  }

  const handleFieldChange = (fieldName: string, fieldValue: string) => {
    try {
      // Try to parse the value as JSON first
      const parsedValue = JSON.parse(fieldValue);
      const newValues = { ...values, [fieldName]: parsedValue };
      onChange(JSON.stringify(newValues));
    } catch {
      // If parsing fails, use the string value
      const newValues = { ...values, [fieldName]: fieldValue };
      onChange(JSON.stringify(newValues));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.name} ({field.type})
        {!field.required && <span className="text-muted-foreground ml-1">(optional)</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <div className="ml-4 mt-2 space-y-1 border-l pl-4">
        {field.fields.map((subField) => (
          <SchemaInput
            key={subField.name}
            field={subField}
            value={values[subField.name] !== undefined ? String(values[subField.name]) : ''}
            onChange={(value) => handleFieldChange(subField.name, value)}
          />
        ))}
      </div>
    </div>
  );
} 