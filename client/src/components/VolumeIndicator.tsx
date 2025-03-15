import React from "react";
import { Progress } from "./ui/progress";

interface VolumeIndicatorProps {
  volume: number;
  isActive: boolean;
}

export function VolumeIndicator({ volume, isActive }: VolumeIndicatorProps) {
  const volumePercent = Math.min(100, volume * 100);
  
  return (
    <div className="space-y-2">
      <Progress value={isActive ? volumePercent : 0} />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0%</span>
        <span>{volumePercent.toFixed(1)}%</span>
      </div>
    </div>
  );
}