import React, { useState } from 'react';
import DiffEditorComponent from './components/DiffEditor';
import './index.css';

function App() {
  // Default text for demonstration
  const [original, setOriginal] = useState('// Paste original text or code here\n');
  const [modified, setModified] = useState('// Paste modified text or code here\n');

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#1e1e1e' }}>
      <DiffEditorComponent
        original={original}
        modified={modified}
        language="text"
        theme="vs-dark"
      />
    </div>
  );
}

export default App;
