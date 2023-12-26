'use client';

import React, { useEffect, useRef, useState } from 'react';
import SampleJSONSchema from '@/types/SampleJSONSchema';
import { useTheme } from 'antd-style';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

interface MonacoJSONEditorProps {
  readonly?: boolean;
  value: string;
  onChange?: (value: string) => void;
  jsonSchema?: SampleJSONSchema;
}

export default function MonacoJSONEditor(props: MonacoJSONEditorProps) {
  const theme = useTheme();
  const monacoRef = useRef<Monaco>();
  const [editorValue, setEditorValue] = useState<string>(props.value);

  function setMonacoJSONDiagnosticsOptions(monaco: Monaco, jsonSchema?: SampleJSONSchema) {
    if (jsonSchema) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        schemaValidation: 'error',
        schemas: [
          {
            uri: 'http://myserver/schema.json',
            fileMatch: ['*'],
            schema: jsonSchema,
          },
        ],
      });
    } else {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        schemaValidation: 'ignore',
        schemas: [],
      });
    }
  }

  function handleEditorWillMount(monaco: Monaco) {
    setMonacoJSONDiagnosticsOptions(monaco, props.jsonSchema);
  }

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    monacoRef.current = monaco;
  }

  useEffect(() => {
    if (monacoRef.current) {
      setMonacoJSONDiagnosticsOptions(monacoRef.current, props.jsonSchema);
    }
  }, [props.jsonSchema]);

  useEffect(() => {
    setEditorValue(props.value);
  }, [props.value]);

  return (
    <Editor
      height="90vh"
      defaultLanguage="json"
      theme={theme.appearance === 'dark' ? 'vs-dark' : 'default'}
      value={editorValue}
      options={{
        readOnly: !!props.readonly,
        minimap: {
          enabled: true,
        },
        wordWrap: 'on',
      }}
      onChange={(value) => {
        setEditorValue(value || '');
      }}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
    />
  );
}
