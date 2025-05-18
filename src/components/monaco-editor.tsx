import { type Monaco } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  fontSize?: number;
  vimMode?: boolean;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export function MonacoEditor({ value, onChange, onMount, fontSize = 14, vimMode = false, options }: MonacoEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    monacoRef.current = monaco;
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    onMount?.(editor, monaco);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({...options});
    }
  }, [vimMode, options]);

  // Update theme when it changes
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const currentTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';
      monacoRef.current.editor.setTheme(currentTheme);
    }
  }, [resolvedTheme]);

  const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    fontSize,
    lineNumbers: typeof window !== 'undefined' && window.innerWidth < 768 ? 'off' : 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 12, bottom: 12 },
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    wordBasedSuggestions: 'currentDocument',
    snippetSuggestions: 'inline',
    suggest: {
      showMethods: true,
      showFunctions: true,
      showConstructors: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showKeywords: true,
      showWords: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showSnippets: true,
    },
    ...options
  };

  // Add resize listener to update line numbers visibility
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.updateOptions({
          lineNumbers: window.innerWidth < 768 ? 'off' : 'on'
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Editor
      height="100%"
      defaultLanguage="json"
      value={value}
      onChange={onChange}
      theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
      onMount={handleEditorDidMount}
      beforeMount={handleEditorWillMount}
      loading={null}
      options={editorOptions}
    />
  );
} 