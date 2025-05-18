import type { SchemaField } from '../types';
import { SchemaInput } from '../inputs/schema-input';

interface InputFieldsProps {
	fields: SchemaField[];
	inputValues: Record<string, string>;
	onInputChange: (key: string, value: string) => void;
}

export function InputFields({ fields, inputValues, onInputChange }: InputFieldsProps) {
	if (fields.length === 0) return null;

	return (
		<div className="space-y-1 p-4">
			{fields.map(field => (
				<SchemaInput
					key={field.name}
					field={field}
					value={inputValues[field.name] || ''}
					onChange={value => onInputChange(field.name, value)}
				/>
			))}
		</div>
	);
}
