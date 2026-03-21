import React, { useState } from 'react';
import DiffEditorComponent from './components/DiffEditor';
import './App.css';
import './index.css';

function App() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');

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
        theme="vs-dark"
        onOriginalChange={setOriginal}
        onModifiedChange={setModified}
        onClear={handleClear}
      />
    </div>
  );
}

export default App;
