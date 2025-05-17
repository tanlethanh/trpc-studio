import { Label } from '@/components/ui/label';
import { type SchemaField } from '../types';
import { SchemaInput } from './schema-input';

interface ObjectInputProps {
  field: SchemaField;
  value: string;
  onChange: (value: string) => void;
}

export function ObjectInput({ field, value, onChange }: ObjectInputProps) {
  if (!field.fields) return null;

  const values = value ? JSON.parse(value) : {};

  const handleFieldChange = (fieldName: string, fieldValue: string) => {
    const newValues = { ...values, [fieldName]: fieldValue };
    onChange(JSON.stringify(newValues));
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
            value={values[subField.name] || ''}
            onChange={(value) => handleFieldChange(subField.name, value)}
          />
        ))}
      </div>
    </div>
  );
} 