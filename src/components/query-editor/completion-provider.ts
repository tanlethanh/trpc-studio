import type { Monaco } from '@monaco-editor/react';
import type { IntrospectionData } from '@/types/trpc';

interface JsonSchema {
	type?: string;
	properties?: Record<string, JsonSchema>;
	required?: string[];
	description?: string;
	default?: unknown;
	enum?: unknown[];
	oneOf?: JsonSchema[];
	if?: JsonSchema;
	then?: JsonSchema;
	const?: unknown;
	format?: string;
	minimum?: number;
	maximum?: number;
	pattern?: string;
	examples?: unknown[];
	minItems?: number;
	maxItems?: number;
	uniqueItems?: boolean;
	items?: JsonSchema;
	additionalProperties?: boolean | JsonSchema;
	nullable?: boolean;
	readOnly?: boolean;
	writeOnly?: boolean;
	deprecated?: boolean;
	title?: string;
	multipleOf?: number;
	exclusiveMinimum?: number;
	exclusiveMaximum?: number;
	minLength?: number;
	maxLength?: number;
	minProperties?: number;
	maxProperties?: number;
	dependencies?: Record<string, string[] | JsonSchema>;
	allOf?: JsonSchema[];
	anyOf?: JsonSchema[];
	not?: JsonSchema;
	definitions?: Record<string, JsonSchema>;
	$ref?: string;
	$schema?: string;
	optional?: boolean;
}

export function setupCompletionProvider(
	monaco: Monaco,
	introspectionData: IntrospectionData | null,
) {
	if (!introspectionData) {
		return null;
	}

	// Create a base schema for the query format
	const baseSchema: JsonSchema = {
		type: 'object',
		required: ['procedure', 'input'],
		properties: {
			procedure: {
				type: 'string',
				enum: introspectionData.procedures.map(p => p.path),
				description: 'The tRPC procedure to call',
			},
			input: {
				oneOf: [
					{ type: 'object', additionalProperties: true },
					{ type: 'string' },
					{ type: 'number' },
					{ type: 'boolean' },
					{ type: 'array' },
					{ type: 'null' },
				],
			},
		},
	};

	// Function to update the schema based on the selected procedure
	function updateSchema(model: ReturnType<Monaco['editor']['createModel']>) {
		const content = model.getValue();
		const procedureMatch = content.match(/"procedure"\s*:\s*"([^"]+)"/);
		if (!procedureMatch) return;

		const procedurePath = procedureMatch[1];
		const procedure = introspectionData?.procedures.find(p => p.path === procedurePath);
		if (!procedure) return;

		const inputSchema = procedure.inputSchema as JsonSchema;

		// Process the schema to add default values for all fields that have them
		function processSchema(schema: JsonSchema): JsonSchema {
			if (!schema) return schema;

			// Handle object type
			if (schema.type === 'object' && schema.properties) {
				const processedProperties: Record<string, JsonSchema> = {};
				let hasDefaultValues = false;
				const defaultObject: Record<string, unknown> = {};

				for (const [key, prop] of Object.entries(schema.properties)) {
					// Process nested schema
					processedProperties[key] = processSchema(prop);

					// If the property has a default value, add it to the default object
					if (prop.default !== undefined) {
						hasDefaultValues = true;
						defaultObject[key] = prop.default;
					}
				}

				// If any properties have default values, add a default for the entire object
				if (hasDefaultValues) {
					return {
						...schema,
						properties: processedProperties,
						default: defaultObject,
					};
				}

				return {
					...schema,
					properties: processedProperties,
				};
			}

			// Handle array type
			if (schema.type === 'array' && schema.items) {
				return {
					...schema,
					items: processSchema(schema.items),
				};
			}

			return schema;
		}

		const processedSchema = processSchema(inputSchema);
		const schema = {
			...baseSchema,
			properties: {
				...baseSchema.properties,
				input: processedSchema,
			},
		};

		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			validate: true,
			allowComments: true,
			schemas: [
				{
					uri: 'trpc-query-schema',
					fileMatch: ['*'],
					schema,
				},
			],
		});
	}

	// Initial schema setup
	monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
		validate: true,
		allowComments: true,
		schemas: [
			{
				uri: 'trpc-query-schema',
				fileMatch: ['*'],
				schema: baseSchema,
			},
		],
	});

	// Add our custom completion provider for procedure suggestions and schema updates
	return monaco.languages.registerCompletionItemProvider('json', {
		triggerCharacters: ['"'],
		provideCompletionItems: (model, position) => {
			const word = model.getWordAtPosition(position);
			const lineContent = model.getLineContent(position.lineNumber);
			const beforeCursor = lineContent.substring(0, position.column - 1);

			// Update schema when procedure changes
			updateSchema(model);

			// Only provide custom completions for the procedure field
			if (
				beforeCursor.includes('"procedure"') &&
				!beforeCursor.includes('"input"') &&
				!beforeCursor.includes('"output"') &&
				beforeCursor.includes(':')
			) {
				const range = {
					startLineNumber: position.lineNumber,
					endLineNumber: position.lineNumber,
					startColumn: word?.startColumn ?? position.column,
					endColumn: word?.endColumn ?? position.column,
				};

				const suggestions = introspectionData.procedures.map(procedure => ({
					label: procedure.path,
					kind: monaco.languages.CompletionItemKind.Function,
					insertText: `"${procedure.path}"`,
					detail: `tRPC ${procedure.type}: ${procedure.path}`,
					documentation: {
						value: [
							`**${procedure.type.toUpperCase()} Procedure**`,
							'',
							'**Input Schema:**',
							'```json',
							JSON.stringify(procedure.inputSchema, null, 2),
							'```',
							'',
							'**Output Schema:**',
							'```json',
							JSON.stringify(procedure.outputSchema, null, 2),
							'```',
						].join('\n'),
					},
					range,
				}));

				return { suggestions };
			}

			return { suggestions: [] };
		},
	});
}
