import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const analyzeAudio = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyzer = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Get frequency data
    const frequencyBufferLength = analyzer.frequencyBinCount;
    const frequencyDataArray = new Uint8Array(frequencyBufferLength);
    analyzer.getByteFrequencyData(frequencyDataArray);

    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw frequency bars
    const barWidth = canvas.width / frequencyDataArray.length;
    const barSpacing = 1;
    
    ctx.fillStyle = '#4f46e5';
    
    for (let i = 0; i < frequencyDataArray.length; i++) {
      const percent = frequencyDataArray[i] / 255;
      const barHeight = canvas.height * percent;
      const x = i * (barWidth + barSpacing);
      const y = canvas.height - barHeight;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    // Schedule next frame
    rafIdRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startAnalyzing = async () => {
    try {
      // Reset error state
      setError(null);

      // Stop any existing audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }

      // Create new audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create analyzer node
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserRef.current = analyserNode;

      // Create source from microphone
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);
      sourceRef.current = sourceNode;

      // Set canvas size
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      // Start animation loop
      analyzeAudio();

      return true;
    } catch (err: any) {
      console.error("Error starting analyzer:", err);
      setError(err?.message || "Could not access microphone");
      return false;
    }
  };

  const stopAnalyzing = () => {
    // Cancel animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Disconnect and close audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    // Reset analyzer
    analyserRef.current = null;

    // Clear canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      stopAnalyzing();
    };
  }, []);

  const toggleAnalyzing = async () => {
    if (isAnalyzing) {
      stopAnalyzing();
      setIsAnalyzing(false);
    } else {
      const success = await startAnalyzing();
      if (success) {
        setIsAnalyzing(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">Audio Spectrum Visualizer</h1>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleAnalyzing}
            className={`px-4 py-2 rounded-md ${isAnalyzing ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
          >
            {isAnalyzing ? 'Stop' : 'Start'}
          </button>
          {error && (
            <p className="text-red-500">{error}</p>
          )}
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-4">Frequency Spectrum</h2>
          <canvas
            ref={canvasRef}
            className="w-full h-[300px] bg-gray-100 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default App;import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const analyzeAudio = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyzer = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Get frequency data
    const frequencyBufferLength = analyzer.frequencyBinCount;
    const frequencyDataArray = new Uint8Array(frequencyBufferLength);
    analyzer.getByteFrequencyData(frequencyDataArray);

    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw frequency bars
    const barWidth = canvas.width / frequencyDataArray.length;
    const barSpacing = 1;
    
    ctx.fillStyle = '#4f46e5';
    
    for (let i = 0; i < frequencyDataArray.length; i++) {
      const percent = frequencyDataArray[i] / 255;
      const barHeight = canvas.height * percent;
      const x = i * (barWidth + barSpacing);
      const y = canvas.height - barHeight;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    // Schedule next frame
    rafIdRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startAnalyzing = async () => {
    try {
      // Reset error state
      setError(null);

      // Stop any existing audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }

      // Create new audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create analyzer node
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserRef.current = analyserNode;

      // Create source from microphone
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);
      sourceRef.current = sourceNode;

      // Set canvas size
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      // Start animation loop
      analyzeAudio();

      return true;
    } catch (err: any) {
      console.error("Error starting analyzer:", err);
      setError(err?.message || "Could not access microphone");
      return false;
    }
  };

  const stopAnalyzing = () => {
    // Cancel animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Disconnect and close audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    // Reset analyzer
    analyserRef.current = null;

    // Clear canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      stopAnalyzing();
    };
  }, []);

  const toggleAnalyzing = async () => {
    if (isAnalyzing) {
      stopAnalyzing();
      setIsAnalyzing(false);
    } else {
      const success = await startAnalyzing();
      if (success) {
        setIsAnalyzing(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">Audio Spectrum Visualizer</h1>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleAnalyzing}
            className={`px-4 py-2 rounded-md ${isAnalyzing ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
          >
            {isAnalyzing ? 'Stop' : 'Start'}
          </button>
          {error && (
            <p className="text-red-500">{error}</p>
          )}
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-4">Frequency Spectrum</h2>
          <canvas
            ref={canvasRef}
            className="w-full h-[300px] bg-gray-100 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default App;