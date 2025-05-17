import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type IntrospectionData } from '@/types/trpc';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { PlayIcon } from 'lucide-react';
import { MonacoEditor } from '../monaco-editor';
import { type Monaco } from '@monaco-editor/react';
import { EditorSettings } from './editor-settings';
import { setupCompletionProvider } from './completion-provider';

interface QueryEditorProps {
  query: string;
  setQuery: (value: string) => void;
  runQuery: () => void;
  isLoading: boolean;
  introspectionData: IntrospectionData | null;
}

export function QueryEditor({ 
  query, 
  setQuery, 
  runQuery, 
  isLoading, 
  introspectionData 
}: QueryEditorProps) {
  const { theme } = useTheme();
  const disposableRef = useRef<any>(null);
  const [fontSize, setFontSize] = useState(14);
  const [editor, setEditor] = useState<any>(null);

  const handleEditorMount = (editor: any, monaco: Monaco) => {
    setEditor(editor);
    const disposable = setupCompletionProvider(monaco, introspectionData);
    if (disposable) {
      disposableRef.current = disposable;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (disposableRef.current) {
        disposableRef.current.dispose();
      }
    };
  }, []);

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 2, 8));
  };

  const handleResetZoom = () => {
    setFontSize(14);
  };

  return (
    <Card className="w-full flex flex-col border h-full">
      <CardHeader className="flex-none border-b bg-muted/30 py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Query</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              onClick={runQuery} 
              disabled={isLoading}
              className="flex-1"
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              {isLoading ? 'Running...' : 'Run Query'}
            </Button>
            <EditorSettings
              fontSize={fontSize}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <div className="h-full">
          <MonacoEditor
            key={JSON.stringify(introspectionData)}
            value={query}
            onChange={(value) => setQuery(value || '')}
            onMount={handleEditorMount}
            fontSize={fontSize}
          />
        </div>
      </CardContent>
    </Card>
  );
} 