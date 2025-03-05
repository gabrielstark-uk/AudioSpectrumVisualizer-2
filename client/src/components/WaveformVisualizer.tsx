import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  data: Float32Array | null;
  isActive: boolean;
}

export function WaveformVisualizer({ data, isActive }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.fillStyle = "hsl(var(--background))";
      ctx.fillRect(0, 0, width, height);

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 2;

      const sliceWidth = width / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        const y = (v + 1) / 2 * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
    };

    if (isActive && data) {
      draw();
    }
  }, [data, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      className="w-full h-[200px] bg-background rounded-lg"
    />
  );
}
