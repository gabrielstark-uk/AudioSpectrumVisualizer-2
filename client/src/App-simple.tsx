import React from 'react';
import { AudioAnalyzer } from "./components/AudioAnalyzer-simple";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">Audio Spectrum Visualizer</h1>
      <AudioAnalyzer />
    </div>
  );
}

export default App;