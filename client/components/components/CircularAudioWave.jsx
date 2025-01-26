import React, { useEffect, useRef } from 'react';

const CircularAudioWave = ({ audioTrack }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const analyzerRef = useRef();
  const audioContextRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupAudio = async () => {
      if (!audioTrack) return;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const analyzer = audioContextRef.current.createAnalyser();
      analyzerRef.current = analyzer;
      analyzer.fftSize = 1024;
      analyzer.smoothingTimeConstant = 0.8;

      const mediaStream = new MediaStream([audioTrack]);
      const source = audioContextRef.current.createMediaStreamSource(mediaStream);
      source.connect(analyzer);
    };

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(canvas.width, canvas.height) / 4;

    const drawCircle = () => {
      let scale = 1;
      
      if (analyzerRef.current) {
        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        scale = 1 + (average / 256);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // White circle
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * scale, 0, Math.PI * 2);
      ctx.fill();

      // Blue overlay
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * scale);
      gradient.addColorStop(0, 'rgba(135, 206, 235, 0.6)');
      gradient.addColorStop(1, 'rgba(135, 206, 235, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.filter = 'blur(8px)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.filter = 'none';

      animationRef.current = requestAnimationFrame(drawCircle);
    };

    setupAudio();
    drawCircle();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioTrack]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      style={{
        width: '100%',
        maxWidth: '300px',
        height: 'auto'
      }}
    />
  );
};

export { CircularAudioWave };