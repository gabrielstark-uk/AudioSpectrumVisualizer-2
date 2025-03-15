import React from "react";
import { AudioAnalyzer } from "../components/AudioAnalyzer";

export default function Home() {
  return (
    <div className="space-y-8 p-4">
      <section className="section">
        <h1 className="text-3xl font-bold mb-6">Audio Spectrum Visualizer</h1>
        <AudioAnalyzer />
      </section>

      <section className="section">
        <h1 className="text-3xl font-bold mb-6">Frequency Analysis</h1>
        {/* Frequency analysis components go here */}
      </section>

      <section className="section">
        <h1 className="text-3xl font-bold mb-6">Security Monitoring</h1>
        {/* Security components go here */}
      </section>

      <section className="section">
        <h1 className="text-3xl font-bold mb-6">Visualizations</h1>
        {/* Visualization components go here */}
      </section>
    </div>
  );
}
