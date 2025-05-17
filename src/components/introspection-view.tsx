import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type IntrospectionData } from '@/types/trpc';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface IntrospectionViewProps {
  data: IntrospectionData | null;
}

type ViewMode = 'list' | 'detail';
type ProcedureType = 'query' | 'mutation' | 'subscription';

export function IntrospectionView({ data }: IntrospectionViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProcedure, setSelectedProcedure] = useState<IntrospectionData['procedures'][0] | null>(null);
  const [selectedType, setSelectedType] = useState<ProcedureType | 'all'>('all');
  const { theme } = useTheme();

  const filteredProcedures = (data?.procedures ?? []).filter(p => 
    selectedType === 'all' ? true : p.type === selectedType
  );

  const handleProcedureClick = (procedure: IntrospectionData['procedures'][0]) => {
    setSelectedProcedure(procedure);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedProcedure(null);
  };

  if (!data) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No introspection data available
      </div>
    );
  }

  if (viewMode === 'detail' && selectedProcedure) {
    return (
      <div className="h-full flex flex-col">
        <CardHeader className="flex-none border-b bg-muted/30 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={handleBack}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <span className="text-sm font-medium">
              {selectedProcedure.path}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              selectedProcedure.type === 'query' 
                ? 'bg-blue-500/10 text-blue-500'
                : selectedProcedure.type === 'mutation'
                ? 'bg-purple-500/10 text-purple-500'
                : 'bg-green-500/10 text-green-500'
            }`}>
              {selectedProcedure.type}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0">
          <div className="h-full">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={JSON.stringify({
                path: selectedProcedure.path,
                type: selectedProcedure.type,
                inputSchema: selectedProcedure.inputSchema,
                outputSchema: selectedProcedure.outputSchema,
              }, null, 2)}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="flex-none border-b bg-muted/30 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'ghost'}
            size="sm"
            className="h-7"
            onClick={() => setSelectedType('all')}
          >
            All
          </Button>
          <Button
            variant={selectedType === 'query' ? 'default' : 'ghost'}
            size="sm"
            className="h-7"
            onClick={() => setSelectedType('query')}
          >
            Queries
          </Button>
          <Button
            variant={selectedType === 'mutation' ? 'default' : 'ghost'}
            size="sm"
            className="h-7"
            onClick={() => setSelectedType('mutation')}
          >
            Mutations
          </Button>
          <Button
            variant={selectedType === 'subscription' ? 'default' : 'ghost'}
            size="sm"
            className="h-7"
            onClick={() => setSelectedType('subscription')}
          >
            Subscriptions
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0 overflow-auto">
        <div className="divide-y divide-border">
          {filteredProcedures.map((procedure, index) => (
            <div
              key={index}
              className="p-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => handleProcedureClick(procedure)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{procedure.path}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    procedure.type === 'query' 
                      ? 'bg-blue-500/10 text-blue-500'
                      : procedure.type === 'mutation'
                      ? 'bg-purple-500/10 text-purple-500'
                      : 'bg-green-500/10 text-green-500'
                  }`}>
                    {procedure.type}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
          {filteredProcedures.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No procedures found
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
} 