import React, { useState, useEffect } from 'react';
import { Box } from '@mui/joy';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <Box sx={{
      position: 'absolute',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(0,0,0,0.3)'
    }}>
      {formatTime(seconds)}
    </Box>
  );
};

export { Timer };