import type { SchemaField } from '../types';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface EnumInputProps {
	field: SchemaField;
	value: string;
	onChange: (value: string) => void;
}

export function EnumInput({ field, value, onChange }: EnumInputProps) {
	const options = (field.metadata?.enum as string[]) || [];

	return (
		<div className="flex flex-row gap-2 items-center">
			<Label htmlFor={field.name} className="text-sm font-medium w-1/4">
				{field.name}
				{!field.required && (
					<span className="text-muted-foreground ml-1">
						(optional)
					</span>
				)}
			</Label>
			{field.description && (
				<p className="text-sm text-muted-foreground">
					{field.description}
				</p>
			)}
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					id={field.name}
					className="font-mono text-sm h-9"
				>
					<SelectValue placeholder={`Select ${field.name}`} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option} value={option}>
							{option}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
