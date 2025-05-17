import { type Monaco } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  fontSize?: number;
}

export function MonacoEditor({ value, onChange, onMount, fontSize = 14 }: MonacoEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    monacoRef.current = monaco;
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    onMount?.(editor, monaco);
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="json"
      value={value}
      onChange={onChange}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      onMount={handleEditorDidMount}
      beforeMount={handleEditorWillMount}
      options={{
        minimap: { enabled: false },
        fontSize,
        lineNumbers: 'on',
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
      }}
    />
  );
} 