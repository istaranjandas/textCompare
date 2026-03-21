import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import './DiffEditor.css';
import { getChangeLineNumber } from './diffNavigation';

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);

const UpIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6" />
    </svg>
);

const DownIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const SunIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
);

const MoonIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
);

const DiffEditorComponent = ({
    original,
    modified,
    language = 'text',
    theme = 'dark',
    toggleTheme,
    onOriginalChange,
    onModifiedChange,
    onDiffStatsChange,
    onClear
}) => {
    const editorRef = useRef(null);
    const editorContainerRef = useRef(null);
    const searchInputRef = useRef(null);
    const disposablesRef = useRef([]);
    const searchDecorationsRef = useRef({ original: null, modified: null });
    const syncTimeoutRef = useRef(null);

    const [currentChangeIndex, setCurrentChangeIndex] = useState(0);
    const [totalChanges, setTotalChanges] = useState(0);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMatches, setSearchMatches] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

    const [initialValues] = useState({ original, modified });

    const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';

    const clearSearchDecorations = useCallback(() => {
        if (searchDecorationsRef.current.original) {
            searchDecorationsRef.current.original.clear();
        }
        if (searchDecorationsRef.current.modified) {
            searchDecorationsRef.current.modified.clear();
        }
    }, []);

    const focusMatch = useCallback((match) => {
        if (!match || !match.editor) return;
        const editor = match.editor;
        editor.revealRangeInCenter(match.range);
        editor.setSelection(match.range);
    }, []);

    const performSearch = useCallback((query) => {
        if (!editorRef.current) return;
        const originalEditor = editorRef.current.getOriginalEditor();
        const modifiedEditor = editorRef.current.getModifiedEditor();
        
        const originalModel = originalEditor.getModel();
        const modifiedModel = modifiedEditor.getModel();

        if (!query) {
            clearSearchDecorations();
            setSearchMatches([]);
            setCurrentSearchIndex(-1);
            return;
        }

        const matchesOrig = originalModel ? originalModel.findMatches(query, false, false, false, null, true) : [];
        const matchesMod = modifiedModel ? modifiedModel.findMatches(query, false, false, false, null, true) : [];

        const allMatches = [
            ...matchesOrig.map(m => ({ ...m, editorType: 'original', editor: originalEditor })),
            ...matchesMod.map(m => ({ ...m, editorType: 'modified', editor: modifiedEditor }))
        ];

        setSearchMatches(allMatches);

        const createDecorations = (matches) => matches.map(m => ({
            range: m.range,
            options: {
                className: 'custom-search-match-highlight',
                overviewRuler: { color: 'rgba(255, 165, 0, 0.8)', position: 1 }
            }
        }));

        if (!searchDecorationsRef.current.original) searchDecorationsRef.current.original = originalEditor.createDecorationsCollection();
        if (!searchDecorationsRef.current.modified) searchDecorationsRef.current.modified = modifiedEditor.createDecorationsCollection();

        searchDecorationsRef.current.original.set(createDecorations(matchesOrig));
        searchDecorationsRef.current.modified.set(createDecorations(matchesMod));

        if (allMatches.length > 0) {
            setCurrentSearchIndex(0);
            focusMatch(allMatches[0]);
        } else {
            setCurrentSearchIndex(-1);
        }
    }, [clearSearchDecorations, focusMatch]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        performSearch(e.target.value);
    };

    const goToNextSearchMatch = useCallback(() => {
        if (searchMatches.length === 0) return;
        const nextIndex = (currentSearchIndex + 1) % searchMatches.length;
        setCurrentSearchIndex(nextIndex);
        focusMatch(searchMatches[nextIndex]);
    }, [currentSearchIndex, searchMatches, focusMatch]);

    const goToPrevSearchMatch = useCallback(() => {
        if (searchMatches.length === 0) return;
        const prevIndex = (currentSearchIndex - 1 + searchMatches.length) % searchMatches.length;
        setCurrentSearchIndex(prevIndex);
        focusMatch(searchMatches[prevIndex]);
    }, [currentSearchIndex, searchMatches, focusMatch]);

    const closeSearch = useCallback(() => {
        setIsSearchOpen(false);
        setSearchQuery('');
        clearSearchDecorations();
        setSearchMatches([]);
        setCurrentSearchIndex(-1);
        if (editorRef.current) {
            editorRef.current.getModifiedEditor().focus();
        }
    }, [clearSearchDecorations]);

    const openSearch = useCallback(() => {
        setIsSearchOpen(true);
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
                searchInputRef.current.select();
            }
        }, 10);
    }, []);

    const updateCurrentIndexFromCursor = useCallback(() => {
        if (!editorRef.current) return;

        const modifiedEditor = editorRef.current.getModifiedEditor();
        const position = modifiedEditor.getPosition();
        if (!position) return;

        const lineChanges = editorRef.current.getLineChanges() || [];
        let newIndex = 0;

        for (let i = 0; i < lineChanges.length; i++) {
            const change = lineChanges[i];
            const startLine = getChangeLineNumber(change);

            if (position.lineNumber < startLine) {
                break;
            } else {
                newIndex = i + 1;
            }
        }

        setCurrentChangeIndex(newIndex);
    }, []);

    const updateChangeCount = useCallback(() => {
        if (!editorRef.current) return;

        try {
            const lineChanges = editorRef.current.getLineChanges() || [];
            const count = lineChanges.length;

            setTotalChanges(count);
            updateCurrentIndexFromCursor();
        } catch (error) {
            console.error('Error getting line changes:', error);
        }
    }, [updateCurrentIndexFromCursor]);

    const navigateToChange = useCallback((targetIndex) => {
        if (!editorRef.current) return;

        const lineChanges = editorRef.current.getLineChanges() || [];
        const modifiedEditor = editorRef.current.getModifiedEditor();
        const targetChange = lineChanges[targetIndex];
        if (!targetChange) return;

        const lineNumber = getChangeLineNumber(targetChange);
        const activeElement = document.activeElement;
        const shouldKeepEditorFocus =
            Boolean(activeElement) && editorContainerRef.current?.contains(activeElement);

        modifiedEditor.revealLineInCenter(lineNumber);
        if (shouldKeepEditorFocus) {
            modifiedEditor.setPosition({ lineNumber, column: 1 });
            modifiedEditor.focus();
        }

        setCurrentChangeIndex(targetIndex + 1);
    }, []);

    const goToNextChange = useCallback(() => {
        if (!editorRef.current) return;

        const lineChanges = editorRef.current.getLineChanges() || [];
        if (lineChanges.length === 0) return;
        const nextIndex = currentChangeIndex <= 0 || currentChangeIndex >= lineChanges.length
            ? 0
            : currentChangeIndex;
        navigateToChange(nextIndex);
    }, [currentChangeIndex, navigateToChange]);

    const goToPreviousChange = useCallback(() => {
        if (!editorRef.current) return;

        const lineChanges = editorRef.current.getLineChanges() || [];
        if (lineChanges.length === 0) return;
        const previousIndex = currentChangeIndex <= 1
            ? lineChanges.length - 1
            : currentChangeIndex - 2;
        navigateToChange(previousIndex);
    }, [currentChangeIndex, navigateToChange]);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        disposablesRef.current = [];

        const modifiedEditor = editor.getModifiedEditor();
        const originalEditor = editor.getOriginalEditor();
        const register = (disposable) => {
            if (disposable) {
                disposablesRef.current.push(disposable);
            }
        };

        register(editor.onDidUpdateDiff(() => {
            updateChangeCount();
        }));

        // Debounced state update to handle 30k+ lines smoothly
        const debounceUpdate = () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
                if (onModifiedChange) onModifiedChange(modifiedEditor.getValue());
                if (onOriginalChange) onOriginalChange(originalEditor.getValue());
            }, 250);
        };

        register(modifiedEditor.onDidChangeModelContent(() => {
            debounceUpdate();
        }));

        register(originalEditor.onDidChangeModelContent(() => {
            debounceUpdate();
        }));

        register(modifiedEditor.onDidChangeCursorPosition(() => {
            updateCurrentIndexFromCursor();
        }));

        const customFindBinding = monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF;
        
        modifiedEditor.addAction({
            id: 'custom-search-action',
            label: 'Custom Search',
            keybindings: [customFindBinding],
            run: () => openSearch()
        });

        originalEditor.addAction({
            id: 'custom-search-action-orig',
            label: 'Custom Search',
            keybindings: [customFindBinding],
            run: () => openSearch()
        });

        register({
            dispose: () => {
                clearSearchDecorations();
                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            }
        });

        modifiedEditor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
            goToNextChange();
        });
        modifiedEditor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
            goToPreviousChange();
        });
        originalEditor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
            goToNextChange();
        });
        originalEditor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
            goToPreviousChange();
        });

        requestAnimationFrame(updateChangeCount);
    };

    useEffect(() => {
        if (!editorRef.current) return;

        const originalEditor = editorRef.current.getOriginalEditor();
        if (originalEditor && originalEditor.getValue() !== original) {
            originalEditor.setValue(original);
        }
    }, [original]);

    useEffect(() => {
        if (!editorRef.current) return;

        const modifiedEditor = editorRef.current.getModifiedEditor();
        if (modifiedEditor && modifiedEditor.getValue() !== modified) {
            modifiedEditor.setValue(modified);
        }
    }, [modified]);

    useEffect(() => {
        if (isSearchOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            performSearch(searchQuery);
        }
    }, [original, modified, searchQuery, isSearchOpen, performSearch]);

    useEffect(() => {
        onDiffStatsChange?.({
            totalChanges,
            currentChangeIndex
        });
    }, [currentChangeIndex, onDiffStatsChange, totalChanges]);

    useEffect(() => {
        return () => {
            disposablesRef.current.forEach((disposable) => {
                disposable?.dispose?.();
            });
            disposablesRef.current = [];
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, []);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeSearch();
        } else if (e.key === 'Enter') {
            if (e.shiftKey) {
                goToPrevSearchMatch();
            } else {
                goToNextSearchMatch();
            }
        }
    };

    return (
        <section className="diff-editor-shell" ref={editorContainerRef} aria-label="Text comparison editor">
            <div className="diff-status-panel" aria-live="polite">
                {isSearchOpen ? (
                    <div className="toolbar-group full-width">
                        <div className="toolbar-actions-group">
                            <button className="nav-button primary" onClick={onClear}>Clear All</button>
                        </div>

                        <div className="spacer" />

                        <div className="toolbar-nav-group">
                            <div className="toolbar-search-container">
                                <span className="search-icon-wrapper"><SearchIcon /></span>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="search-input"
                                    placeholder="Find..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchKeyDown}
                                    aria-label="Search text"
                                />
                            </div>
                            <span className="change-counter-pill" role="status">
                                {searchMatches.length > 0 ? `${currentSearchIndex + 1} of ${searchMatches.length}` : 'No results'}
                            </span>
                            <button className="icon-button" onClick={goToPrevSearchMatch} title="Previous Match (Shift+Enter)"><UpIcon /></button>
                            <button className="icon-button" onClick={goToNextSearchMatch} title="Next Match (Enter)"><DownIcon /></button>
                            <button className="icon-button close-btn" onClick={closeSearch} title="Close Search (Esc)"><CloseIcon /></button>
                            <div className="toolbar-separator" />
                            <button className="icon-button theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="toolbar-group full-width">
                        <div className="toolbar-actions-group">
                            <button className="nav-button primary" onClick={onClear}>Clear All</button>
                        </div>

                        <div className="spacer" />

                        <div className="toolbar-nav-group">
                            {totalChanges === 0 && (
                                <p className="empty-diff-state">No differences detected.</p>
                            )}
                            {totalChanges > 0 && (
                                <>
                                    <button
                                        className="icon-button"
                                        onClick={goToPreviousChange}
                                        title="Previous difference (Alt+Up)"
                                        aria-label="Go to previous difference"
                                    >
                                        <UpIcon />
                                    </button>
                                    <span className="change-counter-pill" role="status">
                                        {currentChangeIndex || 1} of {totalChanges}
                                    </span>
                                    <button
                                        className="icon-button"
                                        onClick={goToNextChange}
                                        title="Next difference (Alt+Down)"
                                        aria-label="Go to next difference"
                                    >
                                        <DownIcon />
                                    </button>
                                    <div className="toolbar-separator" />
                                </>
                            )}
                            <button
                                className="icon-button"
                                onClick={openSearch}
                                title="Search (Ctrl+F)"
                                aria-label="Search"
                            >
                                <SearchIcon />
                            </button>
                            <div className="toolbar-separator" />
                            <button className="icon-button theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <DiffEditor
                height="100%"
                width="100%"
                language={language}
                original={initialValues.original}
                modified={initialValues.modified}
                theme={monacoTheme}
                onMount={handleEditorDidMount}
                options={{
                    renderSideBySide: true,
                    minimap: { enabled: false }, // Disable minimap for 30k+ line performance
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    readOnly: false,
                    originalEditable: true,
                    wordWrap: 'on',
                    fontSize: 12,
                    fixedOverflowWidgets: true,
                    renderMarginRevertIcon: false,
                    maxComputationTime: 5000, // Increase diff timeout for large files
                    fastDiff: true, // Use fast diffing for large files
                    folding: false, // Disable folding for large file performance
                    links: false, // Disable link detection for performance
                    renderValidationDecorations: 'off' // Reduce background work
                }}
            />
        </section>
    );
};

export default DiffEditorComponent;