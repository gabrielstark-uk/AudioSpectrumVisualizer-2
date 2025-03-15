import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Shield, AlertTriangle, Zap, Radio } from "lucide-react";
import { DetectionResult } from "../utils/frequencyAnalysis";

interface DetectionDisplayProps {
  soundCannonResult: DetectionResult | null;
  voiceToSkullResult: DetectionResult | null;
  laserModulationResult: DetectionResult | null;
  rfChipResult: DetectionResult | null;
  isActive: boolean;
}

export function DetectionDisplay({
  soundCannonResult,
  voiceToSkullResult,
  laserModulationResult,
  rfChipResult,
  isActive
}: DetectionDisplayProps) {
  const hasDetections = soundCannonResult || voiceToSkullResult || laserModulationResult || rfChipResult;
  
  if (!isActive || !hasDetections) {
    return null;
  }
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Harmful Frequency Detection</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {soundCannonResult && (
          <DetectionCard
            title="Sound Cannon"
            icon={<Zap className="h-4 w-4" />}
            result={soundCannonResult}
            color="destructive"
          />
        )}
        
        {voiceToSkullResult && (
          <DetectionCard
            title="Voice-to-Skull (V2K)"
            icon={<AlertTriangle className="h-4 w-4" />}
            result={voiceToSkullResult}
            color="orange"
          />
        )}
        
        {laserModulationResult && (
          <DetectionCard
            title="Laser Modulation"
            icon={<Zap className="h-4 w-4" />}
            result={laserModulationResult}
            color="green"
          />
        )}
        
        {rfChipResult && (
          <DetectionCard
            title="RF Chip Signal"
            icon={<Radio className="h-4 w-4" />}
            result={rfChipResult}
            color="blue"
          />
        )}
      </div>
    </div>
  );
}

interface DetectionCardProps {
  title: string;
  icon: React.ReactNode;
  result: DetectionResult;
  color: "destructive" | "orange" | "green" | "blue";
}

function DetectionCard({ title, icon, result, color }: DetectionCardProps) {
  const confidencePercent = result.confidence * 100;
  const colorClasses = {
    destructive: "border-destructive bg-destructive/10",
    orange: "border-orange-500 bg-orange-500/10",
    green: "border-green-500 bg-green-500/10",
    blue: "border-blue-500 bg-blue-500/10"
  };
  
  const progressColors = {
    destructive: "bg-destructive",
    orange: "bg-orange-500",
    green: "bg-green-500",
    blue: "bg-blue-500"
  };
  
  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Confidence:</span>
            <span className="font-medium">{confidencePercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all ${progressColors[color]}`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Frequency:</span>
            <div className="font-medium">
              {formatFrequency(result.frequency)}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Pattern:</span>
            <div className="font-medium capitalize">
              {result.pattern || 'Unknown'}
            </div>
          </div>
        </div>
        
        {result.confidence > 0.9 && (
          <Alert variant="destructive" className="py-2">
            <AlertTitle className="text-xs font-medium flex items-center gap-1">
              <Shield className="h-3 w-3" /> Countermeasure Activated
            </AlertTitle>
            <AlertDescription className="text-xs">
              Tarkan's Şımarık playing at MAXIMUM VOLUME
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function formatFrequency(frequency: number): string {
  if (frequency >= 1000000) {
    return `${(frequency / 1000000).toFixed(2)} MHz`;
  } else if (frequency >= 1000) {
    return `${(frequency / 1000).toFixed(2)} kHz`;
  } else {
    return `${frequency.toFixed(2)} Hz`;
  }
}
