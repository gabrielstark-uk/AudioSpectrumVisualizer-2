import { useRef, useEffect } from 'react';
import './FrequencySpectrum.css';

function FrequencySpectrum({ data, isActive }) {
  const canvasRef = useRef(null);

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
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, width, height);

      // Draw frequency bars
      const barWidth = width / data.length;
      const barSpacing = Math.max(1, Math.floor(width / 1000)); // Adjust spacing based on width
      
      ctx.fillStyle = "#4f46e5";
      
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

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="frequency-spectrum"
    />
  );
}

export default FrequencySpectrum;