import React from 'react';
import CanvasEditor from './components/CanvasEditor';

function App() {
  const handleExport = (layout) => {
    console.log("📦 Received layout from CanvasEditor:", layout);
    // You can send this JSON to FastAPI backend
  };

  return (
    <div style={{ padding: '20px' }}>
      <CanvasEditor onExport={handleExport} />
    </div>
  );
}

export default App;
