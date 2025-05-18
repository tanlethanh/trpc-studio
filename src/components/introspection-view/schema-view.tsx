import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface SchemaField {
	name: string;
	type: string;
	description?: string;
	required: boolean;
	defaultValue?: unknown;
	metadata?: Record<string, unknown>;
	fields?: SchemaField[];
}

interface ParsedSchema {
	type: string;
	fields: SchemaField[];
}

interface SchemaViewProps {
	schema: unknown;
	viewMode: 'raw' | 'parsed';
}

function parseJsonSchema(schema: unknown): ParsedSchema {
	if (!schema || typeof schema !== 'object') {
		return {
			type: 'unknown',
			fields: [],
		};
	}

	const schemaObj = schema as Record<string, unknown>;

	// Handle atomic types
	if (typeof schemaObj.type === 'string' && !schemaObj.properties) {
		const type = schemaObj.type as string;
		const description = schemaObj.description as string | undefined;
		const defaultValue = schemaObj.default;
		const metadata: Record<string, unknown> = {};

		if (schemaObj.format) metadata.format = schemaObj.format as string;
		if (schemaObj.minimum !== undefined) metadata.min = schemaObj.minimum as number;
		if (schemaObj.maximum !== undefined) metadata.max = schemaObj.maximum as number;
		if (schemaObj.pattern) metadata.pattern = schemaObj.pattern as string;
		if (schemaObj.enum) metadata.enum = schemaObj.enum as unknown[];
		if (schemaObj.examples) metadata.examples = schemaObj.examples as unknown[];

		return {
			type,
			fields: [
				{
					name: 'value',
					type: getJsonSchemaType(schemaObj),
					description,
					required: !schemaObj.nullable,
					defaultValue,
					metadata,
				},
			],
		};
	}

	// Handle object types
	if (schemaObj.type === 'object' && schemaObj.properties) {
		const properties = schemaObj.properties as Record<string, unknown>;
		const required = (schemaObj.required as string[]) || [];

		const fields: SchemaField[] = Object.entries(properties).map(([key, value]) => {
			const field = value as Record<string, unknown>;
			const metadata: Record<string, unknown> = {};
			if (field.format) metadata.format = field.format as string;
			if (field.minimum !== undefined) metadata.min = field.minimum as number;
			if (field.maximum !== undefined) metadata.max = field.maximum as number;
			if (field.pattern) metadata.pattern = field.pattern as string;
			if (field.enum) metadata.enum = field.enum as unknown[];
			if (field.examples) metadata.examples = field.examples as unknown[];

			return {
				name: key,
				type: getJsonSchemaType(field),
				description: field.description as string | undefined,
				required: required.includes(key),
				defaultValue: field.default,
				metadata,
				fields: field.type === 'object' ? parseJsonSchema(field).fields : undefined,
			};
		});

		return {
			type: 'object',
			fields,
		};
	}

	// Handle array types
	if (schemaObj.type === 'array' && schemaObj.items) {
		const items = schemaObj.items as Record<string, unknown>;
		const metadata: Record<string, unknown> = {};
		if (schemaObj.minItems !== undefined) metadata.minItems = schemaObj.minItems as number;
		if (schemaObj.maxItems !== undefined) metadata.maxItems = schemaObj.maxItems as number;
		if (schemaObj.uniqueItems) metadata.uniqueItems = schemaObj.uniqueItems as boolean;

		return {
			type: 'array',
			fields: [
				{
					name: 'items',
					type: getJsonSchemaType(items),
					description: schemaObj.description as string | undefined,
					required: true,
					metadata,
					fields: items.type === 'object' ? parseJsonSchema(items).fields : undefined,
				},
			],
		};
	}

	return {
		type: (schemaObj.type as string) || 'unknown',
		fields: [],
	};
}

function getJsonSchemaType(schema: Record<string, unknown>): string {
	const type = schema.type as string;
	if (!type) return 'unknown';

	if (type === 'array' && schema.items) {
		const items = schema.items as Record<string, unknown>;
		return `array<${getJsonSchemaType(items)}>`;
	}

	if (type === 'object' && schema.properties) {
		return 'object';
	}

	if (schema.enum) {
		return `enum<${(schema.enum as unknown[]).map(v => JSON.stringify(v)).join(' | ')}>`;
	}

	if (schema.format) {
		return `${type}(${schema.format})`;
	}

	return type;
}

function formatMetadata(metadata: Record<string, unknown>): string[] {
	const parts: string[] = [];

	if (metadata.min !== undefined) parts.push(`min: ${metadata.min}`);
	if (metadata.max !== undefined) parts.push(`max: ${metadata.max}`);
	if (metadata.pattern) parts.push(`pattern: ${metadata.pattern}`);
	if (metadata.format) parts.push(`format: ${metadata.format}`);
	if (metadata.minItems !== undefined) parts.push(`min: ${metadata.minItems}`);
	if (metadata.maxItems !== undefined) parts.push(`max: ${metadata.maxItems}`);
	if (metadata.uniqueItems) parts.push('unique');

	return parts;
}

function SchemaFieldView({ field, depth = 0 }: { field: SchemaField; depth?: number }) {
	const metadataParts = formatMetadata(field.metadata || {});
	const hasMetadata = metadataParts.length > 0;
	const hasDefault = field.defaultValue !== undefined;
	const showParens = hasMetadata || hasDefault || !field.required;

	return (
		<div className="space-y-1">
			<div className="flex items-start gap-2">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 text-sm">
						<span className="font-medium">{field.name}</span>
						<span className="text-muted-foreground">{field.type}</span>
						{showParens && (
							<span className="text-muted-foreground">
								(
								{[
									...(hasMetadata ? [metadataParts.join(', ')] : []),
									...(hasDefault
										? [`default: ${JSON.stringify(field.defaultValue)}`]
										: []),
									...(!field.required ? ['optional'] : []),
								].join(', ')}
								)
							</span>
						)}
					</div>
					{field.description && (
						<p className="text-sm text-muted-foreground mt-1">{field.description}</p>
					)}
				</div>
			</div>
			{field.fields && field.fields.length > 0 && (
				<div className="ml-4 mt-2 space-y-2 border-l pl-4">
					{field.fields.map(subField => (
						<SchemaFieldView key={subField.name} field={subField} depth={depth + 1} />
					))}
				</div>
			)}
		</div>
	);
}

export function SchemaView({ schema, viewMode }: SchemaViewProps) {
	const { theme } = useTheme();
	const parsedSchema = parseJsonSchema(schema);

	if (viewMode === 'raw') {
		return (
			<Editor
				height="100%"
				defaultLanguage="json"
				value={JSON.stringify(schema, null, 2)}
				theme={theme === 'dark' ? 'vs-dark' : 'light'}
				options={{
					readOnly: true,
					minimap: { enabled: false },
					scrollBeyondLastLine: false,
					wordWrap: 'on',
					lineNumbers: 'off',
					folding: true,
					fontSize: 13,
				}}
			/>
		);
	}

	return (
		<div className="p-4 space-y-4 overflow-auto h-full">
			{parsedSchema.fields.map(field => (
				<SchemaFieldView key={field.name} field={field} />
			))}
		</div>
	);
}
