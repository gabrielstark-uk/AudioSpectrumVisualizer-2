import { Progress } from "@/components/ui/progress";

interface VolumeIndicatorProps {
  volume: number;
  isActive: boolean;
}

export function VolumeIndicator({ volume, isActive }: VolumeIndicatorProps) {
  const volumePercent = Math.min(100, Math.max(0, volume * 100));
  
  return (
    <div className="space-y-2">
      <Progress 
        value={isActive ? volumePercent : 0} 
        className="h-4"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0 dB</span>
        <span>{volumePercent.toFixed(1)} dB</span>
      </div>
    </div>
  );
}
