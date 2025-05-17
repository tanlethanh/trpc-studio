import { type IntrospectionData } from '@/types/trpc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProcedureSelectorProps {
  introspectionData: IntrospectionData | null;
  currentProcedure: string | null;
  onProcedureChange: (value: string) => void;
}

export function ProcedureSelector({ 
  introspectionData, 
  currentProcedure, 
  onProcedureChange 
}: ProcedureSelectorProps) {
  return (
    <div className="px-4 py-2 min-w-80">
      <Select
        value={currentProcedure || ''}
        onValueChange={onProcedureChange}
      >
        <SelectTrigger className="w-full h-9">
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