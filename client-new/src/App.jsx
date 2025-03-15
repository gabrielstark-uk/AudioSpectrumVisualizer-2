import { useState } from 'react'
import AudioAnalyzer from './components/AudioAnalyzer'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Audio Spectrum Visualizer</h1>
        <p>Analyze audio frequencies and detect harmful patterns</p>
      </header>
      <main className="app-main">
        <AudioAnalyzer />
      </main>
      <footer className="app-footer">
        <p>© 2023 Audio Spectrum Visualizer</p>
      </footer>
    </div>
  )
}

export default App