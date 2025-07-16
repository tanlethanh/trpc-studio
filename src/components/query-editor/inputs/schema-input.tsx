import type { SchemaField } from '../types';
import { StringInput } from './string-input';
import { NumberInput } from './number-input';
import { EnumInput } from './enum-input';
import { BooleanInput } from './boolean-input';
import { ArrayInput } from './array-input';
import { ObjectInput } from './object-input';

interface SchemaInputProps {
	field: SchemaField;
	value: string;
	onChange: (value: string) => void;
}

export function SchemaInput({ field, value, onChange }: SchemaInputProps) {
	// Handle enum type
	if (field.metadata?.enum) {
		return <EnumInput field={field} value={value} onChange={onChange} />;
	}

	// Handle array type
	if (typeof field.type === 'string' && field.type.startsWith('array')) {
		return <ArrayInput field={field} value={value} onChange={onChange} />;
	}

	// Handle object type
	if (field.type === 'object') {
		return <ObjectInput field={field} value={value} onChange={onChange} />;
	}

	// Handle boolean type
	if (field.type === 'boolean') {
		return <BooleanInput field={field} value={value} onChange={onChange} />;
	}

	// Handle number type
	if (field.type === 'number' || field.type === 'integer') {
		return <NumberInput field={field} value={value} onChange={onChange} />;
	}

	// Default to string input
	return <StringInput field={field} value={value} onChange={onChange} />;
}
