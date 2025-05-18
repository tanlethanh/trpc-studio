import type { SchemaField } from '../types';

export function parseJsonSchema(schema: unknown): SchemaField[] {
	if (!schema || typeof schema !== 'object') {
		return [];
	}

	const schemaObj = schema as Record<string, unknown>;

	// Handle atomic types
	if (typeof schemaObj.type === 'string' && !schemaObj.properties) {
		const description = schemaObj.description as string | undefined;
		const defaultValue = schemaObj.default;
		const metadata: Record<string, unknown> = {};

		if (schemaObj.format) metadata.format = schemaObj.format as string;
		if (schemaObj.minimum !== undefined)
			metadata.min = schemaObj.minimum as number;
		if (schemaObj.maximum !== undefined)
			metadata.max = schemaObj.maximum as number;
		if (schemaObj.pattern) metadata.pattern = schemaObj.pattern as string;
		if (schemaObj.enum) metadata.enum = schemaObj.enum as unknown[];
		if (schemaObj.examples)
			metadata.examples = schemaObj.examples as unknown[];

		return [
			{
				name: 'value',
				type: getJsonSchemaType(schemaObj),
				description,
				required: !schemaObj.nullable,
				defaultValue,
				metadata,
				isAtomic: true,
			},
		];
	}

	// Handle object types
	if (schemaObj.type === 'object') {
		// If it's an empty object or has additionalProperties, treat it as atomic
		if (
			!schemaObj.properties ||
			(schemaObj.additionalProperties && !schemaObj.properties)
		) {
			return [
				{
					name: 'value',
					type: 'object',
					description: schemaObj.description as string | undefined,
					required: !schemaObj.nullable,
					defaultValue: schemaObj.default ?? {},
					metadata: {},
					isAtomic: true,
				},
			];
		}

		const properties = schemaObj.properties as Record<string, unknown>;
		const required = (schemaObj.required as string[]) || [];

		return Object.entries(properties).map(([key, value]) => {
			const field = value as Record<string, unknown>;
			const metadata: Record<string, unknown> = {};
			if (field.format) metadata.format = field.format as string;
			if (field.minimum !== undefined)
				metadata.min = field.minimum as number;
			if (field.maximum !== undefined)
				metadata.max = field.maximum as number;
			if (field.pattern) metadata.pattern = field.pattern as string;
			if (field.enum) metadata.enum = field.enum as unknown[];
			if (field.examples) metadata.examples = field.examples as unknown[];

			const isAtomic = Boolean(
				field.type === 'string' ||
					field.type === 'number' ||
					field.type === 'boolean' ||
					field.type === 'array' ||
					(field.type === 'object' &&
						(!field.properties || field.additionalProperties)),
			);
			const parsedFields =
				field.type === 'object' && field.properties
					? parseJsonSchema(field)
					: undefined;

			return {
				name: key,
				type: getJsonSchemaType(field),
				description: field.description as string | undefined,
				required: required.includes(key),
				defaultValue: field.default,
				metadata,
				fields: parsedFields,
				properties: parsedFields,
				isAtomic,
			};
		});
	}

	// Handle array types
	if (schemaObj.type === 'array' && schemaObj.items) {
		const items = schemaObj.items as Record<string, unknown>;
		const metadata: Record<string, unknown> = {};
		if (schemaObj.minItems !== undefined)
			metadata.minItems = schemaObj.minItems as number;
		if (schemaObj.maxItems !== undefined)
			metadata.maxItems = schemaObj.maxItems as number;
		if (schemaObj.uniqueItems)
			metadata.uniqueItems = schemaObj.uniqueItems as boolean;

		return [
			{
				name: 'items',
				type: getJsonSchemaType(items),
				description: schemaObj.description as string | undefined,
				required: true,
				defaultValue: schemaObj.default ?? [],
				metadata,
				fields:
					items.type === 'object'
						? parseJsonSchema(items)
						: undefined,
				isAtomic: true,
			},
		];
	}

	return [];
}

export function getJsonSchemaType(schema: Record<string, unknown>): string {
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
		return `enum<${(schema.enum as unknown[]).map((v) => JSON.stringify(v)).join(' | ')}>`;
	}

	if (schema.format) {
		return `${type}(${schema.format})`;
	}

	return type;
}
