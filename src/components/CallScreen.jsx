import React from 'react';
import { Box, Grid } from '@mui/joy';
import { LocalUser, RemoteUser } from 'agora-rtc-react';

import { CircularAudioWave } from "./CircularAudioWave";

const CallScreen = ({ localMicrophoneTrack, remoteUsers, micOn }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={1}>
        <Grid xs={12}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2 }}>
              <LocalUser audioTrack={localMicrophoneTrack} micOn={micOn} cover="/api/placeholder/48/48">
                <Box component="span" sx={{ ml: 1 }}>You</Box>
              </LocalUser>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <CircularAudioWave audioTrack={localMicrophoneTrack} />
            </Box>
          </Box>
        </Grid>
        {remoteUsers.map((user) => (
          <Grid xs={12} key={user.uid}>
            <RemoteUser cover="/api/placeholder/48/48" user={user}>
              <Box component="span" sx={{ ml: 1 }}>{user.uid}</Box>
            </RemoteUser>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export { CallScreen };