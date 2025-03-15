import { useRef, useEffect } from 'react';
import './WaveformVisualizer.css';

function WaveformVisualizer({ data, isActive }) {
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

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = "#4f46e5";
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

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="waveform-visualizer"
    />
  );
}

export default WaveformVisualizer;