import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LayoutGrid, LayoutList } from 'lucide-react';
import { type IntrospectionData } from '@/types/trpc';
import { ProcedureList } from './procedure-list';
import { SchemaView } from './schema-view';
import { useTheme } from 'next-themes';

interface IntrospectionViewProps {
  data: IntrospectionData | null;
}

type ViewMode = 'list' | 'detail';
type ProcedureType = 'query' | 'mutation' | 'subscription';
type SchemaViewMode = 'raw' | 'parsed';
type LayoutMode = 'horizontal' | 'vertical';

export function IntrospectionView({ data }: IntrospectionViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProcedure, setSelectedProcedure] = useState<IntrospectionData['procedures'][0] | null>(null);
  const [selectedType, setSelectedType] = useState<ProcedureType | 'all'>('all');
  const [schemaViewMode, setSchemaViewMode] = useState<SchemaViewMode>('parsed');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
  const { theme } = useTheme();

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
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              {schemaViewMode === 'parsed' && (
                <>
                  <Button
                    variant={layoutMode === 'horizontal' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7"
                    onClick={() => setLayoutMode('horizontal')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={layoutMode === 'vertical' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7"
                    onClick={() => setLayoutMode('vertical')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant={schemaViewMode === 'parsed' ? 'default' : 'ghost'}
                size="sm"
                className="h-7"
                onClick={() => setSchemaViewMode('parsed')}
              >
                Parsed
              </Button>
              <Button
                variant={schemaViewMode === 'raw' ? 'default' : 'ghost'}
                size="sm"
                className="h-7"
                onClick={() => setSchemaViewMode('raw')}
              >
                Raw
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0">
          {schemaViewMode === 'raw' ? (
            <SchemaView 
              schema={selectedProcedure} 
              viewMode="raw"
            />
          ) : (
            <div className={`h-full ${layoutMode === 'horizontal' ? 'grid grid-cols-2 divide-x' : 'flex flex-col divide-y'}`}>
              <div className={`h-full flex flex-col ${layoutMode === 'vertical' ? 'flex-1' : ''}`}>
                <div className="flex-none border-b bg-muted/30 py-2 px-4">
                  <h3 className="text-sm font-medium">Input Schema</h3>
                </div>
                <div className="flex-1 min-h-0">
                  <SchemaView 
                    schema={selectedProcedure.inputSchema} 
                    viewMode="parsed"
                    layoutMode={layoutMode}
                  />
                </div>
              </div>
              <div className={`h-full flex flex-col ${layoutMode === 'vertical' ? 'flex-1' : ''}`}>
                <div className="flex-none border-b bg-muted/30 py-2 px-4">
                  <h3 className="text-sm font-medium">Output Schema</h3>
                </div>
                <div className="flex-1 min-h-0">
                  <SchemaView 
                    schema={selectedProcedure.outputSchema} 
                    viewMode="parsed"
                    layoutMode={layoutMode}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    );
  }

  return (
    <ProcedureList
      data={data}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      onProcedureClick={handleProcedureClick}
    />
  );
} 