import React, { useEffect, useRef, useState } from 'react';

const CircularAudioWave = ({ audioTrack }) => {
  const [audioData, setAudioData] = useState(new Uint8Array(128).fill(0));
  const animationRef = useRef();
  const analyzerRef = useRef();
  const sourceRef = useRef();

  useEffect(() => {
    if (!audioTrack?.mediaStreamTrack) return;
    
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    analyzerRef.current = analyzer;
    analyzer.fftSize = 256;
    
    const mediaStream = new MediaStream([audioTrack.mediaStreamTrack]);
    const source = audioContext.createMediaStreamSource(mediaStream);
    sourceRef.current = source;
    source.connect(analyzer);

    const animate = () => {
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      analyzer.getByteFrequencyData(dataArray);
      setAudioData(dataArray);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      source?.disconnect();
      audioContext?.close();
    };
  }, [audioTrack]);

  const svgSize = 300;
  const center = svgSize / 2;
  const radius = 100;
  const points = audioData.reduce((acc, val, i) => {
    if (i % 4 !== 0) return acc;
    const angle = (i * Math.PI * 2) / audioData.length;
    const ampl = (val / 255) * 30;
    const r = radius + ampl;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${acc} ${x},${y}`;
  }, '');

  return (
    <div className="w-full h-64 flex items-center justify-center bg-white">
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full h-full">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(135, 206, 235, 0.7)" />
            <stop offset="50%" stopColor="rgba(100, 149, 237, 0.7)" />
            <stop offset="100%" stopColor="rgba(0, 105, 148, 0.7)" />
          </linearGradient>
        </defs>
        <path
          d={`M ${points} Z`}
          fill="url(#waveGradient)"
          stroke="rgba(100, 149, 237, 0.8)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default CircularAudioWave;