import React, { useState } from 'react';
import DiffEditorComponent from './components/DiffEditor';
import './index.css';

function App() {
  // Default text for demonstration
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');

  const handleClear = () => {
    setOriginal('');
    setModified('');
  };

  return (
    <div className="app-container">
      <button className="floating-clear-btn" onClick={handleClear}>
        Clear Screen
      </button>
      <DiffEditorComponent
        original={original}
        modified={modified}
        language="text"
        theme="vs-dark"
        onOriginalChange={setOriginal}
        onModifiedChange={setModified}
      />
    </div>
  );
}

export default App;
