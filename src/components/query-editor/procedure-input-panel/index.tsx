import { useState, useEffect } from 'react';
import type { SchemaField } from '../types';
import {
	buildQueryInput,
	createDefaultInput,
	parseInputValues,
	parseJsonSchema,
} from './schema-parser';
import { InputFields } from './input-fields';
import { ProcedureSelector } from './procedure-selector';
import type { IntrospectionData } from '@/types/trpc';

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
	const [isAtomic, setIsAtomic] = useState(false);
	const [fields, setFields] = useState<SchemaField[]>([]);

	const setPrettifiedQuery = (data: unknown) => {
		setQuery(JSON.stringify(data, null, 2));
	};

	// Update fields and isAtomicType when procedure changes
	const updateFieldsForProcedure = (procedurePath: string) => {
		if (!introspectionData) {
			setFields([]);
			setIsAtomic(false);
			return;
		}

		const procedure = introspectionData.procedures.find(
			(p) => p.path === procedurePath,
		);

		if (!procedure?.inputSchema) {
			setFields([]);
			setIsAtomic(false);
			return;
		}

		const parsedFields = parseJsonSchema(procedure.inputSchema);
		setFields(parsedFields);
		setIsAtomic(
			parsedFields.length === 1 && parsedFields[0].name === 'value',
		);

		return {
			parsedFields,
			isAtomic:
				parsedFields.length === 1 && parsedFields[0].name === 'value',
		};
	};

	// Parse the current query and update state
	const updateStateFromQuery = () => {
		try {
			const { input, procedure } = JSON.parse(query);

			const procedureChanged = procedure !== currentProcedure;
			setCurrentProcedure(procedure);

			// Update fields if procedure changed
			if (procedureChanged) {
				const result = updateFieldsForProcedure(procedure);
				if (result) {
					const { parsedFields, isAtomic } = result;
					const defaultInput = createDefaultInput(parsedFields);

					setPrettifiedQuery({
						procedure: procedure,
						input: isAtomic
							? defaultInput[parsedFields[0].name]
							: defaultInput,
					});
					return;
				}
			}

			// Update input values from existing query
			const parsedInputValues = parseInputValues(input, fields, isAtomic);
			setInputValues(parsedInputValues);
		} catch {
			// Invalid JSON, ignore
		}
	};

	const handleInputChange = (key: string, value: string) => {
		const newInputValues = { ...inputValues, [key]: value };
		setInputValues(newInputValues);

		try {
			const queryObj = JSON.parse(query);
			const queryInput = buildQueryInput(
				newInputValues,
				fields,
				isAtomic,
			);

			setPrettifiedQuery({ ...queryObj, input: queryInput });
		} catch {
			// Invalid JSON, ignore
		}
	};

	const handleProcedureChange = (procedure: string) => {
		const result = updateFieldsForProcedure(procedure);
		if (!result) {
			setPrettifiedQuery({ procedure: procedure, input: {} });
			return;
		}

		const { parsedFields, isAtomic } = result;
		const defaultValue = isAtomic
			? (parsedFields[0].defaultValue ?? '')
			: createDefaultInput(parsedFields);

		setPrettifiedQuery({ procedure, input: defaultValue });
	};

	// Update state when query changes
	useEffect(() => updateStateFromQuery(), [query]);

	// Update fields when procedure changes
	useEffect(() => {
		if (currentProcedure) updateFieldsForProcedure(currentProcedure);
	}, [currentProcedure]);

	return (
		<div className="flex flex-col h-full min-h-0">
			<div className="flex flex-col sm:flex-row gap-2 border-b px-4 items-center">
				<span className="text-sm font-medium">Procedure Input</span>
				<ProcedureSelector
					introspectionData={introspectionData}
					currentProcedure={currentProcedure}
					onProcedureChange={handleProcedureChange}
				/>
			</div>
			<div className="flex-1 min-h-0 flex flex-col gap-1 px-4 pt-2 pb-10 overflow-y-auto">
				<InputFields
					fields={fields}
					inputValues={inputValues}
					onInputChange={handleInputChange}
				/>
			</div>
		</div>
	);
}
