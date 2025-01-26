import React from 'react';
import { Box } from '@mui/joy';
import { CircularAudioWave } from "./CircularAudioWave";

const CallScreen = ({ localMicrophoneTrack, micOn }) => {
  return (
    <Box sx={{ 
      height: '100%',
      minHeight: '300px',
      maxHeight: '300px',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <CircularAudioWave audioTrack={localMicrophoneTrack} />
    </Box>
  );
};

export { CallScreen };