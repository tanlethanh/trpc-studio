import type { SchemaField } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumberInputProps {
	field: SchemaField;
	value: string;
	onChange: (value: string) => void;
}

export function NumberInput({ field, value, onChange }: NumberInputProps) {
	const min = field.metadata?.min as number | undefined;
	const max = field.metadata?.max as number | undefined;

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
				type="number"
				value={value}
				onChange={e => onChange(e.target.value)}
				placeholder={`Enter ${field.name}`}
				className="font-mono text-sm"
				min={min}
				max={max}
			/>
		</div>
	);
}
