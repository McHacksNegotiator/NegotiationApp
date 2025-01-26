import React, { useState } from 'react';
import { Box, Card, Button } from '@mui/joy';
import { useNavigate } from 'react-router-dom';
import { useIsConnected, useJoin, useLocalMicrophoneTrack, usePublish, useRemoteUsers } from 'agora-rtc-react';

import { CallScreen } from '../components/CallScreen';
import { NegotiationForm } from '../components/NegotiationForm';
import { Timer } from '../components/Timer';

const LandingPage = () => {
  const navigate = useNavigate();
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId] = useState(import.meta.env.VITE_AGORA_APP_ID);
  const [channel] = useState(import.meta.env.VITE_AGORA_CHANNEL_NAME);
  const [token] = useState("");
  const [micOn, setMic] = useState(true);

  useJoin({ appid: appId, channel: channel, token: import.meta.env.VITE_AGORA_TOKEN }, calling);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  usePublish([localMicrophoneTrack]);
  const remoteUsers = useRemoteUsers();

  const handleSubmit = (e) => {
    e.preventDefault();
    setCalling(true);
  };

  const handleEndCall = (e) => {
    e.preventDefault();
    navigate('/thank-you');
  };

  return (
    <Box
      component="main"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom right, #9c27b0, #f06292, #f44336)',
        overflowY: 'auto',
        p: { xs: 1, sm: 2 }
      }}
    >
      {isConnected && <Timer />}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          my: { xs: 2, sm: 3 },
          position: 'relative'
        }}
      >
        <Card
          variant={isConnected ? "plain" : "soft"}
          sx={{
            width: isConnected ? '100%' : { xs: '98%', sm: '85%', md: '75%', lg: '65%' },
            maxWidth: isConnected ? 'none' : '800px',
            background: isConnected ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: isConnected ? 'none' : 'blur(8px)',
            boxShadow: isConnected ? 'none' : undefined,
            position: 'relative',
            zIndex: 1
          }}
        >
          {isConnected ? (
            <CallScreen 
              localMicrophoneTrack={localMicrophoneTrack}
              remoteUsers={remoteUsers}
              micOn={micOn}
            />
          ) : (
            <NegotiationForm onSubmit={handleSubmit} />
          )}
        </Card>
      </Box>

      {isConnected && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            p: 2,
            borderRadius: 'xl',
            boxShadow: 'md'
          }}
        >
          <Button
            variant="soft"
            color={micOn ? 'primary' : 'warning'}
            onClick={() => setMic(a => !a)}
            sx={{
              fontSize: '1.1rem',
              px: 4,
              py: 1.5
            }}
          >
            {micOn ? 'Talk to AI Agent' : 'Return to Call'}
          </Button>
          <Button
            variant="soft"
            color="danger"
            onClick={handleEndCall}
            sx={{
              fontSize: '1.1rem',
              px: 4,
              py: 1.5
            }}
          >
            End Call
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LandingPage;