import { useRef, useEffect } from 'react';

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

    // Set canvas dimensions to match its display size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    // Update canvas size initially and on window resize
    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvas);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.fillStyle = "hsl(var(--muted))";
      ctx.fillRect(0, 0, width, height);

      // Draw frequency bars
      const barWidth = width / data.length;
      const barSpacing = Math.max(1, Math.floor(width / 1000)); // Adjust spacing based on width
      
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
    } else {
      // Clear canvas when not active
      ctx.fillStyle = "hsl(var(--muted))";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[200px] bg-muted rounded-md"
    />
  );
}