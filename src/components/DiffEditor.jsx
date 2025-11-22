import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

const DiffEditorComponent = ({ original, modified, language = 'text', theme = 'vs-dark' }) => {
    return (
        <DiffEditor
            height="100vh"
            width="100vw"
            language={language}
            original={original}
            modified={modified}
            theme={theme}
            options={{
                renderSideBySide: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: false,
                originalEditable: true,
                wordWrap: 'on',
            }}
        />
    );
};

export default DiffEditorComponent;
