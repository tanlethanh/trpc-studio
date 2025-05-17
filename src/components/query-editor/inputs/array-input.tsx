import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { type SchemaField } from '../types';
import { SchemaInput } from './schema-input';

interface ArrayInputProps {
  field: SchemaField;
  value: string;
  onChange: (value: string) => void;
}

export function ArrayInput({ field, value, onChange }: ArrayInputProps) {
  const items = field.fields?.[0];
  if (!items) return null;

  const values = value ? JSON.parse(value) : [];
  const minItems = field.metadata?.minItems as number | undefined;
  const maxItems = field.metadata?.maxItems as number | undefined;

  const handleAdd = () => {
    if (maxItems && values.length >= maxItems) return;
    const newValues = [...values, ''];
    onChange(JSON.stringify(newValues));
  };

  const handleRemove = (index: number) => {
    if (minItems && values.length <= minItems) return;
    const newValues = values.filter((_: unknown, i: number) => i !== index);
    onChange(JSON.stringify(newValues));
  };

  const handleItemChange = (index: number, newValue: string) => {
    const newValues = [...values];
    newValues[index] = newValue;
    onChange(JSON.stringify(newValues));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={field.name} className="text-sm font-medium">
          {field.name} ({field.type})
          {!field.required && <span className="text-muted-foreground ml-1">(optional)</span>}
        </Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={maxItems !== undefined && values.length >= maxItems}
          >
            +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRemove(values.length - 1)}
            disabled={minItems !== undefined && values.length <= minItems}
          >
            -
          </Button>
        </div>
      </div>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <div className="space-y-2">
        {values.map((item: string, index: number) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              <SchemaInput
                field={items}
                value={item}
                onChange={(value) => handleItemChange(index, value)}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(index)}
              disabled={minItems !== undefined && values.length <= minItems}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 