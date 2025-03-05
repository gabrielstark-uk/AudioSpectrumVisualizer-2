import { useEffect, useRef } from "react";

interface FrequencySpectrumProps {
  data: Uint8Array | null;
  isActive: boolean;
}

export function FrequencySpectrum({ data, isActive }: FrequencySpectrumProps) {
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

      // Draw frequency bars
      const barWidth = width / data.length;
      const barSpacing = 1;
      
      ctx.fillStyle = "hsl(var(--primary))";
      
      for (let i = 0; i < data.length; i++) {
        const percent = data[i] / 255;
        const barHeight = height * percent;
        const x = i * (barWidth + barSpacing);
        const y = height - barHeight;
        
        ctx.fillRect(x, y, barWidth, barHeight);
      }
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
