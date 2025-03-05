import { AlertCircle, AlertTriangle, Activity, Radio, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DetectionResult } from "@/utils/frequencyAnalysis";

interface DetectionDisplayProps {
  soundCannonResult: DetectionResult | null;
  voiceToSkullResult: DetectionResult | null;
  isActive: boolean;
}

function SignalIndicator({ result }: { result: DetectionResult }) {
  const getPatternIcon = () => {
    switch (result.pattern) {
      case 'continuous':
        return <Waves className="h-4 w-4" />;
      case 'pulsed':
        return <Activity className="h-4 w-4" />;
      case 'modulated':
        return <Radio className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <div className="text-sm font-medium">Signal Strength</div>
          <Progress value={result.signalStrength * 100} className="h-2" />
        </div>
        <span className="text-sm font-medium">
          {(result.signalStrength * 100).toFixed(1)}%
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <div className="text-sm font-medium">Confidence</div>
          <Progress value={result.confidence * 100} className="h-2" />
        </div>
        <span className="text-sm font-medium">
          {(result.confidence * 100).toFixed(1)}%
        </span>
      </div>

      {result.detected && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Pattern:</span>
            {getPatternIcon()}
            <span className="capitalize">{result.pattern}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Frequency:</span>{" "}
            {result.frequency.toFixed(1)} Hz
          </div>
        </div>
      )}
    </div>
  );
}

export function DetectionDisplay({ 
  soundCannonResult, 
  voiceToSkullResult, 
  isActive 
}: DetectionDisplayProps) {
  if (!isActive) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={`
        ${soundCannonResult?.detected ? "border-destructive" : ""}
        transition-all duration-300
      `}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className={`h-5 w-5 ${
              soundCannonResult?.detected 
                ? "text-destructive animate-pulse" 
                : "text-muted-foreground"
            }`} />
            <h3 className="font-semibold">Sound Cannon Detection</h3>
          </div>
          {soundCannonResult && (
            <SignalIndicator result={soundCannonResult} />
          )}
        </CardContent>
      </Card>

      <Card className={`
        ${voiceToSkullResult?.detected ? "border-destructive" : ""}
        transition-all duration-300
      `}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className={`h-5 w-5 ${
              voiceToSkullResult?.detected 
                ? "text-destructive animate-pulse" 
                : "text-muted-foreground"
            }`} />
            <h3 className="font-semibold">V2K Signal Detection</h3>
          </div>
          {voiceToSkullResult && (
            <SignalIndicator result={voiceToSkullResult} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}