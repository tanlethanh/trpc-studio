import { useState, useEffect, useCallback } from 'react';
import type { SchemaField } from '../types';
import { parseJsonSchema } from './schema-parser';
import { InputFields } from './input-fields';
import { ProcedureSelector } from './procedure-selector';
import type { IntrospectionData } from '@/types/trpc';
import { Button } from '@/components/ui/button';

interface ProcedureInputPanelProps {
	introspectionData: IntrospectionData | null;
	query: string;
	setQuery: (value: string) => void;
}

export function ProcedureInputPanel({
	introspectionData,
	query,
	setQuery,
}: ProcedureInputPanelProps) {
	const [inputValues, setInputValues] = useState<Record<string, string>>({});
	const [currentProcedure, setCurrentProcedure] = useState<string | null>(
		null,
	);
	const [isAtomicType, setIsAtomicType] = useState(false);
	const [fields, setFields] = useState<SchemaField[]>([]);

	// Parse the current query and update state
	const updateStateFromQuery = useCallback(() => {
		try {
			const queryObj = JSON.parse(query);
			if (queryObj?.procedure) {
				// Check if procedure has changed
				const procedureChanged =
					queryObj.procedure !== currentProcedure;
				setCurrentProcedure(queryObj.procedure);

				// If procedure changed, we need to update the input with default values
				if (procedureChanged && introspectionData) {
					const procedure = introspectionData.procedures.find(
						(p) => p.path === queryObj.procedure,
					);
					if (procedure?.inputSchema) {
						const parsedFields = parseJsonSchema(
							procedure.inputSchema,
						);
						setFields(parsedFields);
						const isAtomic =
							parsedFields.length === 1 &&
							parsedFields[0].name === 'value';
						setIsAtomicType(isAtomic);

						// Function to get default value for a field
						function getDefaultValue(field: SchemaField): unknown {
							if (field.defaultValue !== undefined) {
								return field.defaultValue;
							}

							// Handle nested objects
							if (field.type === 'object' && field.properties) {
								const defaultObject: Record<string, unknown> =
									{};
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
						}

						// Create default input object
						const defaultInput: Record<string, unknown> = {};
						parsedFields.forEach((field) => {
							defaultInput[field.name] = getDefaultValue(field);
						});

						// Update the query with default values
						setQuery(
							JSON.stringify(
								{
									procedure: queryObj.procedure,
									input: isAtomic
										? defaultInput[parsedFields[0].name]
										: defaultInput,
								},
								null,
								2,
							),
						);
						return;
					}
				}

				// Handle normal input updates
				if (
					typeof queryObj.input === 'object' &&
					queryObj.input !== null
				) {
					// For object fields, only include the field inputs
					const fieldInputs: Record<string, string> = {};
					fields.forEach((field) => {
						const value = queryObj.input[field.name];
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
					setInputValues(fieldInputs);
					setIsAtomicType(false);
				} else {
					setInputValues({ value: String(queryObj.input || '') });
					setIsAtomicType(true);
				}
			}
		} catch {
			// Invalid JSON, ignore
		}
	}, [query, fields, currentProcedure, introspectionData, setQuery]);

	// Update state when query changes
	useEffect(() => {
		updateStateFromQuery();
	}, [query, updateStateFromQuery]);

	// Update fields and isAtomicType when procedure changes
	useEffect(() => {
		if (!introspectionData || !currentProcedure) {
			setFields([]);
			return;
		}

		const procedure = introspectionData.procedures.find(
			(p) => p.path === currentProcedure,
		);
		if (!procedure?.inputSchema) {
			setFields([]);
			return;
		}

		const parsedFields = parseJsonSchema(procedure.inputSchema);
		setFields(parsedFields);
		setIsAtomicType(
			parsedFields.length === 1 && parsedFields[0].name === 'value',
		);
	}, [introspectionData, currentProcedure]);

	const handleInputChange = useCallback(
		(key: string, value: string) => {
			const newInputValues = { ...inputValues, [key]: value };
			setInputValues(newInputValues);

			try {
				const queryObj = JSON.parse(query);
				const newQuery = {
					...queryObj,
					input: isAtomicType ? value : {},
				};

				// For object fields, parse the values based on their types
				if (!isAtomicType) {
					fields.forEach((field) => {
						const value = newInputValues[field.name];
						if (value !== undefined) {
							try {
								// Try to parse as JSON for object/array types
								newQuery.input[field.name] = JSON.parse(value);
							} catch {
								// If parsing fails, use the string value
								newQuery.input[field.name] = value;
							}
						}
					});
				}

				setQuery(JSON.stringify(newQuery, null, 2));
			} catch {
				// Invalid JSON, ignore
			}
		},
		[query, inputValues, isAtomicType, setQuery, fields],
	);

	const handleProcedureChange = useCallback(
		(value: string) => {
			try {
				const procedure = introspectionData?.procedures.find(
					(p) => p.path === value,
				);
				if (!procedure?.inputSchema) {
					setQuery(
						JSON.stringify(
							{ procedure: value, input: {} },
							null,
							2,
						),
					);
					return;
				}

				const parsedFields = parseJsonSchema(procedure.inputSchema);
				const isAtomic =
					parsedFields.length === 1 &&
					parsedFields[0].name === 'value';

				if (isAtomic) {
					const defaultValue = parsedFields[0].defaultValue ?? '';
					setQuery(
						JSON.stringify(
							{
								procedure: value,
								input: defaultValue,
							},
							null,
							2,
						),
					);
				} else {
					// Function to recursively set default values for nested objects
					function getDefaultValue(field: SchemaField): unknown {
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
					}

					const defaultInput: Record<string, unknown> = {};
					parsedFields.forEach((field) => {
						defaultInput[field.name] = getDefaultValue(field);
					});

					setQuery(
						JSON.stringify(
							{
								procedure: value,
								input: defaultInput,
							},
							null,
							2,
						),
					);
				}
			} catch {
				// Invalid JSON, ignore
				setQuery(
					JSON.stringify({ procedure: value, input: {} }, null, 2),
				);
			}
		},
		[introspectionData, setQuery],
	);

	return (
		<div className="flex flex-col h-full">
			<div className="flex flex-col sm:flex-row gap-2 border-b p-2">
				<Button
					variant="ghost"
					className="flex items-center justify-between p-2 hover:bg-muted/50 h-10 w-full sm:w-auto"
				>
					<span className="text-sm font-medium">Procedure Input</span>
				</Button>
				<ProcedureSelector
					introspectionData={introspectionData}
					currentProcedure={currentProcedure}
					onProcedureChange={handleProcedureChange}
				/>
			</div>
			<div className="flex-1 min-h-0 overflow-hidden">
				<div className="h-full flex flex-col">
					<div className="flex-1 overflow-auto">
						<InputFields
							fields={fields}
							inputValues={inputValues}
							onInputChange={handleInputChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
