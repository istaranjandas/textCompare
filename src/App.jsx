import React, { useState, useEffect } from 'react';
import DiffEditorComponent from './components/DiffEditor';
import './App.css';
import './index.css';

function App() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('text-compare-theme');
    return saved || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('text-compare-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleClear = () => {
    if (!original && !modified) {
      return;
    }

    const shouldClear = window.confirm('Clear both text panes?');
    if (!shouldClear) {
      return;
    }

    setOriginal('');
    setModified('');
  };

  return (
    <div className="app-container">
      <DiffEditorComponent
        original={original}
        modified={modified}
        language="text"
        theme={theme}
        toggleTheme={toggleTheme}
        onOriginalChange={setOriginal}
        onModifiedChange={setModified}
        onClear={handleClear}
      />
    </div>
  );
}

export default App;
