import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import { FrequencySpectrum } from "./FrequencySpectrum";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { VolumeIndicator } from "./VolumeIndicator";
import { DetectionDisplay } from "./DetectionDisplay";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";

export function AudioAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { 
    frequencyData, 
    timeData, 
    volume,
    soundCannonResult,
    voiceToSkullResult,
    laserModulationResult,
    startAnalyzing, 
    stopAnalyzing,
    error 
  } = useAudioAnalyzer();

  const toggleAnalyzing = async () => {
    if (isAnalyzing) {
      stopAnalyzing();
      setIsAnalyzing(false);
    } else {
      const success = await startAnalyzing();
      if (success) {
        setIsAnalyzing(true);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          onClick={toggleAnalyzing}
          variant={isAnalyzing ? "destructive" : "default"}
          className="w-40"
        >
          {isAnalyzing ? (
            <>
              <MicOff className="mr-2 h-4 w-4" /> Stop
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" /> Start
            </>
          )}
        </Button>
        {error && (
          <p className="text-destructive">{error}</p>
        )}
      </div>

      <DetectionDisplay
        soundCannonResult={soundCannonResult}
        voiceToSkullResult={voiceToSkullResult}
        laserModulationResult={laserModulationResult}
        isActive={isAnalyzing}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Frequency Spectrum</h2>
            <FrequencySpectrum data={frequencyData} isActive={isAnalyzing} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Waveform</h2>
            <WaveformVisualizer data={timeData} isActive={isAnalyzing} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Volume Level</h2>
          <VolumeIndicator volume={volume} isActive={isAnalyzing} />
        </CardContent>
      </Card>
    </div>
  );
}