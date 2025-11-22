import React, { useState, useRef, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import './DiffEditor.css';

const DiffEditorComponent = ({ original, modified, language = 'text', theme = 'vs-dark' }) => {
    const editorRef = useRef(null);
    const [currentChangeIndex, setCurrentChangeIndex] = useState(0);
    const [totalChanges, setTotalChanges] = useState(0);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        // Wait a bit for the diff to be computed, then update change count
        setTimeout(() => {
            updateChangeCount();
        }, 500);

        // Also listen for content changes
        const modifiedEditor = editor.getModifiedEditor();
        const originalEditor = editor.getOriginalEditor();

        modifiedEditor.onDidChangeModelContent(() => {
            setTimeout(updateChangeCount, 100);
        });

        originalEditor.onDidChangeModelContent(() => {
            setTimeout(updateChangeCount, 100);
        });
    };

    const updateChangeCount = () => {
        if (!editorRef.current) return;

        try {
            const lineChanges = editorRef.current.getLineChanges() || [];
            const count = lineChanges.length;

            setTotalChanges(count);

            if (count > 0 && currentChangeIndex === 0) {
                setCurrentChangeIndex(1);
            } else if (count === 0) {
                setCurrentChangeIndex(0);
            } else if (currentChangeIndex > count) {
                setCurrentChangeIndex(count);
            }
        } catch (error) {
            console.error('Error getting line changes:', error);
        }
    };

    const goToNextChange = () => {
        if (!editorRef.current || totalChanges === 0) return;

        const lineChanges = editorRef.current.getLineChanges() || [];
        const nextIndex = currentChangeIndex < totalChanges ? currentChangeIndex + 1 : 1;

        if (lineChanges[nextIndex - 1]) {
            const change = lineChanges[nextIndex - 1];
            const lineNumber = change.modifiedStartLineNumber || change.originalStartLineNumber || 1;

            const modifiedEditor = editorRef.current.getModifiedEditor();
            modifiedEditor.revealLineInCenter(lineNumber);
            modifiedEditor.setPosition({ lineNumber, column: 1 });
            modifiedEditor.focus();

            setCurrentChangeIndex(nextIndex);
        }
    };

    const goToPreviousChange = () => {
        if (!editorRef.current || totalChanges === 0) return;

        const lineChanges = editorRef.current.getLineChanges() || [];
        const prevIndex = currentChangeIndex > 1 ? currentChangeIndex - 1 : totalChanges;

        if (lineChanges[prevIndex - 1]) {
            const change = lineChanges[prevIndex - 1];
            const lineNumber = change.modifiedStartLineNumber || change.originalStartLineNumber || 1;

            const modifiedEditor = editorRef.current.getModifiedEditor();
            modifiedEditor.revealLineInCenter(lineNumber);
            modifiedEditor.setPosition({ lineNumber, column: 1 });
            modifiedEditor.focus();

            setCurrentChangeIndex(prevIndex);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <DiffEditor
                height="100vh"
                width="100vw"
                language={language}
                original={original}
                modified={modified}
                theme={theme}
                onMount={handleEditorDidMount}
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
            {totalChanges > 0 && (
                <div className="diff-navigation-toolbar">
                    <button
                        className="nav-button"
                        onClick={goToPreviousChange}
                        title="Previous Change (↑)"
                    >
                        ↑
                    </button>
                    <span className="change-counter">
                        {currentChangeIndex}/{totalChanges}
                    </span>
                    <button
                        className="nav-button"
                        onClick={goToNextChange}
                        title="Next Change (↓)"
                    >
                        ↓
                    </button>
                </div>
            )}
        </div>
    );
};

export default DiffEditorComponent;
