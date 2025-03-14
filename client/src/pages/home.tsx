import { AudioAnalyzer } from "@/components/AudioAnalyzer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-3xl font-bold mb-8">Audio Spectrum Visualizer</h1>
      <AudioAnalyzer />
    </div>
  );
}
