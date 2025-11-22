import React, { useState, useRef, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import './DiffEditor.css';

const DiffEditorComponent = ({ original, modified, language = 'text', theme = 'vs-dark' }) => {
    const editorRef = useRef(null);
    const [currentChangeIndex, setCurrentChangeIndex] = useState(0);
    const [totalChanges, setTotalChanges] = useState(0);

    const updateCurrentIndexFromCursor = () => {
        if (!editorRef.current) return;

        const modifiedEditor = editorRef.current.getModifiedEditor();
        const position = modifiedEditor.getPosition();
        if (!position) return;

        const lineChanges = editorRef.current.getLineChanges() || [];
        let newIndex = 0;

        // Find the change that is closest to or contains the current cursor line
        for (let i = 0; i < lineChanges.length; i++) {
            const change = lineChanges[i];
            const startLine = change.modifiedStartLineNumber;

            if (position.lineNumber < startLine) {
                // Cursor is before this change, so this change is the "next" one effectively,
                // meaning we are currently at the previous index (or 0 if i=0).
                break;
            } else {
                newIndex = i + 1;
            }
        }

        setCurrentChangeIndex(newIndex);
    };

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

        // Listen for cursor changes to update the counter
        modifiedEditor.onDidChangeCursorPosition(() => {
            updateCurrentIndexFromCursor();
        });
    };

    const updateChangeCount = () => {
        if (!editorRef.current) return;

        try {
            const lineChanges = editorRef.current.getLineChanges() || [];
            const count = lineChanges.length;

            setTotalChanges(count);
            // Initial update of index based on cursor (likely at top)
            updateCurrentIndexFromCursor();
        } catch (error) {
            console.error('Error getting line changes:', error);
        }
    };

    const goToNextChange = () => {
        if (!editorRef.current || totalChanges === 0) return;

        const lineChanges = editorRef.current.getLineChanges() || [];
        const modifiedEditor = editorRef.current.getModifiedEditor();
        const position = modifiedEditor.getPosition();
        const currentLine = position ? position.lineNumber : 1;

        let nextIndex = -1;

        // Find the first change that starts AFTER the current cursor line
        for (let i = 0; i < lineChanges.length; i++) {
            if (lineChanges[i].modifiedStartLineNumber > currentLine) {
                nextIndex = i;
                break;
            }
        }

        // If no next change found (we are at or past the last one), wrap to first
        if (nextIndex === -1) {
            nextIndex = 0;
        }

        if (lineChanges[nextIndex]) {
            const change = lineChanges[nextIndex];
            const lineNumber = change.modifiedStartLineNumber || change.originalStartLineNumber || 1;

            modifiedEditor.revealLineInCenter(lineNumber);
            modifiedEditor.setPosition({ lineNumber, column: 1 });
            modifiedEditor.focus();

            // The cursor change listener will update the index, but we can force it for responsiveness
            setCurrentChangeIndex(nextIndex + 1);
        }
    };

    const goToPreviousChange = () => {
        if (!editorRef.current || totalChanges === 0) return;

        const lineChanges = editorRef.current.getLineChanges() || [];
        const modifiedEditor = editorRef.current.getModifiedEditor();
        const position = modifiedEditor.getPosition();
        const currentLine = position ? position.lineNumber : 1;

        let prevIndex = -1;

        // Find the last change that starts BEFORE the current cursor line
        for (let i = lineChanges.length - 1; i >= 0; i--) {
            if (lineChanges[i].modifiedStartLineNumber < currentLine) {
                prevIndex = i;
                break;
            }
        }

        // If no previous change found (we are before the first one), wrap to last
        if (prevIndex === -1) {
            prevIndex = lineChanges.length - 1;
        }

        if (lineChanges[prevIndex]) {
            const change = lineChanges[prevIndex];
            const lineNumber = change.modifiedStartLineNumber || change.originalStartLineNumber || 1;

            modifiedEditor.revealLineInCenter(lineNumber);
            modifiedEditor.setPosition({ lineNumber, column: 1 });
            modifiedEditor.focus();

            // The cursor change listener will update the index
            setCurrentChangeIndex(prevIndex + 1);
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
