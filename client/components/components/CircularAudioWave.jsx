import React, { useEffect, useRef } from 'react';

const CircularAudioWave = ({ audioTrack }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const analyzerRef = useRef();
  const sourceRef = useRef();

  useEffect(() => {
    if (!audioTrack?.mediaStreamTrack) return;
    
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    analyzerRef.current = analyzer;
    analyzer.fftSize = 64;
    analyzer.smoothingTimeConstant = 0.8;
    
    const mediaStream = new MediaStream([audioTrack.mediaStreamTrack]);
    const source = audioContext.createMediaStreamSource(mediaStream);
    sourceRef.current = source;
    source.connect(analyzer);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = canvas.width * 0.3;

    const animate = () => {
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      analyzer.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const scale = 1 + (average / 255) * 0.6;
      const radius = baseRadius * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw white background circle
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Apply blue gradient overlay
      const gradient = ctx.createLinearGradient(centerX, centerY - radius, centerX, centerY + radius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(173, 216, 230, 0.4)');
      gradient.addColorStop(1, 'rgba(135, 206, 235, 0.6)');

      ctx.fillStyle = gradient;
      ctx.filter = 'blur(15px)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.filter = 'none';

      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      source?.disconnect();
      audioContext?.close();
    };
  }, [audioTrack]);

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
      <canvas 
        ref={canvasRef} 
        width={256} 
        height={256} 
        className="w-full h-full"
      />
    </div>
  );
};

export { CircularAudioWave };