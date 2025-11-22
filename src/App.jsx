import React, { useState } from 'react';
import DiffEditorComponent from './components/DiffEditor';
import './index.css';

function App() {
  // Default text for demonstration
  const [original, setOriginal] = useState(`Line 1
Line 2
Line 3
Line 4
Line 5
Line 6
Line 7
Line 8
Line 9
Line 10`);
  const [modified, setModified] = useState(`Line 1
Modified Line 2
Line 3
Changed Line 4
Modified Line 5
Line 6
Altered Line 7
Line 8
Line 9
Different Line 10`);

  return (
    <div className="app-container">
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
