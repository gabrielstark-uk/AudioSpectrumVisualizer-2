import { AudioAnalyzer } from "@/components/AudioAnalyzer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Audio Frequency Analyzer</h1>
        <AudioAnalyzer />
      </div>
    </div>
  );
}
