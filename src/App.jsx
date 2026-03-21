import React, { useState } from 'react';
import DiffEditorComponent from './components/DiffEditor';
import './App.css';
import './index.css';

function App() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [lastSnapshot, setLastSnapshot] = useState(null);

  const handleClear = () => {
    if (!original && !modified) {
      return;
    }

    const shouldClear = window.confirm('Clear both text panes? You can undo once after clearing.');
    if (!shouldClear) {
      return;
    }

    setLastSnapshot({ original, modified });
    setOriginal('');
    setModified('');
  };

  const handleUndoClear = () => {
    if (!lastSnapshot) return;
    setOriginal(lastSnapshot.original);
    setModified(lastSnapshot.modified);
    setLastSnapshot(null);
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
        onUndoClear={lastSnapshot ? handleUndoClear : null}
      />
    </div>
  );
}

export default App;