import type { SchemaField } from '../types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BooleanInputProps {
	field: SchemaField;
	value: string;
	onChange: (value: string) => void;
}

export function BooleanInput({ field, value, onChange }: BooleanInputProps) {
	return (
		<div className="space-y-2 flex flex-row gap-2 items-center">
			<div>
				<Label htmlFor={field.name} className="text-sm font-medium">
					{field.name} ({field.type})
					{!field.required && (
						<span className="text-muted-foreground ml-1">(optional)</span>
					)}
				</Label>
				{field.description && (
					<p className="text-sm text-muted-foreground">{field.description}</p>
				)}
			</div>
			<Switch
				id={field.name}
				checked={value === 'true'}
				onCheckedChange={(checked: boolean) => onChange(String(checked))}
			/>
		</div>
	);
}
