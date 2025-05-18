import type { SchemaField } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface ArrayInputProps {
	field: SchemaField;
	value: string;
	onChange: (value: string) => void;
}

export function ArrayInput({ field, value, onChange }: ArrayInputProps) {
	let values: unknown[] = [];
	try {
		// Handle both string and array values
		const parsed = JSON.parse(value);
		if (Array.isArray(parsed)) {
			values = parsed;
		} else if (typeof parsed === 'string') {
			// Handle case where value is a stringified array
			const innerParsed = JSON.parse(parsed);
			values = Array.isArray(innerParsed) ? innerParsed : [innerParsed];
		} else {
			values = [];
		}
	} catch {
		values = [];
	}

	const minItems = field.metadata?.minItems as number | undefined;
	const maxItems = field.metadata?.maxItems as number | undefined;
	const items = field.fields?.[0];
	const isEnum = items?.metadata?.enum;

	const handleAdd = () => {
		if (maxItems && values.length >= maxItems) return;
		const newValues = [...values, ''];
		onChange(JSON.stringify(newValues));
	};

	const handleRemove = (index: number) => {
		if (minItems && values.length <= minItems) return;
		const newValues = values.filter((_, i) => i !== index);
		onChange(JSON.stringify(newValues));
	};

	const handleValueChange = (index: number, newValue: string) => {
		const newValues = [...values];
		newValues[index] = newValue;
		onChange(JSON.stringify(newValues));
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Label htmlFor={field.name} className="text-sm font-medium whitespace-nowrap">
					{field.name} ({field.type})
					{!field.required && (
						<span className="text-muted-foreground ml-1">(optional)</span>
					)}
				</Label>
				<div className="flex flex-wrap gap-2">
					{values.map((item: unknown, index: number) => (
						<div key={index} className="flex items-center gap-1">
							<div className="w-32">
								{isEnum ? (
									<Select
										value={String(item)}
										onValueChange={value => handleValueChange(index, value)}
									>
										<SelectTrigger className="h-8">
											<SelectValue placeholder="Select value" />
										</SelectTrigger>
										<SelectContent>
											{(items?.metadata?.enum as string[] | undefined)?.map(
												option => (
													<SelectItem key={option} value={option}>
														{option}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								) : (
									<Input
										value={String(item)}
										onChange={e => handleValueChange(index, e.target.value)}
										placeholder="Enter value"
										className="font-mono text-sm h-8"
									/>
								)}
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleRemove(index)}
								disabled={minItems !== undefined && values.length <= minItems}
								className="h-8 w-8 p-0"
							>
								×
							</Button>
						</div>
					))}
				</div>
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
		</div>
	);
}
