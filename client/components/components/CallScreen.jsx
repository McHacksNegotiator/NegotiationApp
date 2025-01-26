import React from 'react';
import { Box, Grid } from '@mui/joy';

import { CircularAudioWave } from "./CircularAudioWave";

const CallScreen = ({ localMicrophoneTrack, remoteUsers, micOn }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={1}>
        <Grid xs={12}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2 }}>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <CircularAudioWave audioTrack={localMicrophoneTrack} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export { CallScreen };