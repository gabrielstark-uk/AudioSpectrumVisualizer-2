import { AlertCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DetectionResult } from "@/utils/frequencyAnalysis";

interface DetectionDisplayProps {
  soundCannonResult: DetectionResult | null;
  voiceToSkullResult: DetectionResult | null;
  isActive: boolean;
}

export function DetectionDisplay({ 
  soundCannonResult, 
  voiceToSkullResult, 
  isActive 
}: DetectionDisplayProps) {
  if (!isActive) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={soundCannonResult?.detected ? "border-destructive" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className={`h-5 w-5 ${soundCannonResult?.detected ? "text-destructive" : "text-muted-foreground"}`} />
            <h3 className="font-semibold">Sound Cannon Detection</h3>
          </div>
          {soundCannonResult && (
            <div className="space-y-2">
              <Progress value={soundCannonResult.confidence * 100} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className={soundCannonResult.detected ? "text-destructive font-medium" : "text-muted-foreground"}>
                  {(soundCannonResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
              {soundCannonResult.detected && (
                <p className="text-sm text-destructive mt-2">
                  Detected at {soundCannonResult.frequency.toFixed(1)} Hz
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={voiceToSkullResult?.detected ? "border-destructive" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className={`h-5 w-5 ${voiceToSkullResult?.detected ? "text-destructive" : "text-muted-foreground"}`} />
            <h3 className="font-semibold">V2K Signal Detection</h3>
          </div>
          {voiceToSkullResult && (
            <div className="space-y-2">
              <Progress value={voiceToSkullResult.confidence * 100} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className={voiceToSkullResult.detected ? "text-destructive font-medium" : "text-muted-foreground"}>
                  {(voiceToSkullResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
              {voiceToSkullResult.detected && (
                <p className="text-sm text-destructive mt-2">
                  Detected at {voiceToSkullResult.frequency.toFixed(1)} Hz
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
