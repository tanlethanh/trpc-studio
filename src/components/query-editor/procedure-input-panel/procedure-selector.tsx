import type { IntrospectionData } from '@/types/trpc';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface ProcedureSelectorProps {
	introspectionData: IntrospectionData | null;
	currentProcedure: string | null;
	onProcedureChange: (value: string) => void;
}

export function ProcedureSelector({
	introspectionData,
	currentProcedure,
	onProcedureChange,
}: ProcedureSelectorProps) {
	return (
		<div className="flex-1 px-2 py-2">
			<Select
				value={currentProcedure || ''}
				onValueChange={onProcedureChange}
			>
				<SelectTrigger className="h-8 w-52">
					<SelectValue placeholder="Select a procedure" />
				</SelectTrigger>
				<SelectContent>
					{introspectionData?.procedures.map((procedure) => (
						<SelectItem key={procedure.path} value={procedure.path}>
							{procedure.path}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
