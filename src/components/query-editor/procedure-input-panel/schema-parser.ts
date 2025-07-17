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

// Utility functions extracted to prevent duplication
export const getDefaultValue = (field: SchemaField): unknown => {
	if (field.defaultValue !== undefined) {
		return field.defaultValue;
	}

	// Handle nested objects
	if (field.type === 'object' && field.properties) {
		const defaultObject: Record<string, unknown> = {};
		field.properties.forEach((prop) => {
			const value = getDefaultValue(prop);
			if (value !== undefined) {
				defaultObject[prop.name] = value;
			}
		});
		return Object.keys(defaultObject).length > 0
			? defaultObject
			: undefined;
	}

	// Handle arrays
	if (field.type === 'array' && field.items) {
		return [];
	}

	if (!field.required) return undefined;

	// Set type-specific defaults
	switch (field.type) {
		case 'string':
			return '';
		case 'number':
		case 'integer':
			return 0;
		case 'boolean':
			return false;
		case 'object':
			return {};
		case 'array':
			return [];
		default:
			return null;
	}
};

export const createDefaultInput = (
	fields: SchemaField[],
): Record<string, unknown> => {
	const defaultInput: Record<string, unknown> = {};
	fields.forEach((field) => {
		const value = getDefaultValue(field);
		if (value !== undefined) {
			defaultInput[field.name] = value;
		}
	});
	return defaultInput;
};

export const parseInputValues = (
	input: unknown,
	fields: SchemaField[],
	isAtomic: boolean,
): Record<string, string> => {
	if (isAtomic) {
		return { value: String(input || '') };
	}

	if (typeof input === 'object' && input !== null) {
		const fieldInputs: Record<string, string> = {};
		fields.forEach((field) => {
			const value = (input as Record<string, unknown>)[field.name];
			if (field.isAtomic) {
				// For atomic fields, stringify objects and arrays
				if (typeof value === 'object' && value !== null) {
					fieldInputs[field.name] = JSON.stringify(value);
				} else {
					fieldInputs[field.name] = String(value || '');
				}
			} else if (value !== undefined && value !== null) {
				fieldInputs[field.name] =
					typeof value === 'string'
						? value
						: JSON.stringify(value, null, 2);
			}
		});
		return fieldInputs;
	}

	return {};
};

export const buildQueryInput = (
	inputValues: Record<string, string>,
	fields: SchemaField[],
	isAtomic: boolean,
): unknown => {
	if (isAtomic) {
		return inputValues.value || '';
	}

	const queryInput: Record<string, unknown> = {};
	fields.forEach((field) => {
		const value = inputValues[field.name];
		if (value === undefined || value === '') {
			// Use default value or undefined
			const defaultValue = getDefaultValue(field);
			if (defaultValue !== undefined) {
				queryInput[field.name] = defaultValue;
			}
		} else {
			// Try to parse as JSON for object/array types, otherwise use as-is
			try {
				queryInput[field.name] = JSON.parse(value);
			} catch {
				// For primitive types, convert appropriately
				switch (field.type) {
					case 'number':
					case 'integer':
						queryInput[field.name] = Number(value);
						break;
					case 'boolean':
						queryInput[field.name] = value === 'true';
						break;
					default:
						queryInput[field.name] = value;
				}
			}
		}
	});
	return queryInput;
};
