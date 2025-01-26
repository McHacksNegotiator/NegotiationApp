import React, { useState, useRef } from 'react';
import { Box, Card, Button } from '@mui/joy';
import { CallScreen } from '../components/CallScreen';
import { NegotiationForm } from '../components/NegotiationForm';
import { Timer } from '../components/Timer';
import ThankYouPage from '../pages/ThankYouPage'

const LandingPage = () => {
  const [isDone, setIsDone] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [micOn, setIsMicOn] = useState(false);

  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setDataChannel(null);
    peerConnection.current = null;
  }

  const handleEndCall = (e) => {
    e.preventDefault();
    stopSession()
    setIsDone(true)
  };

  function closeThankYou() {
    setIsDone(false)
    setIsConnected(false)
  }

  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  async function startSession() {
    setIsConnected(true);

    const tokenResponse = await fetch("/token");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;

    const pc = new RTCPeerConnection();

    audioElement.current = document.createElement("audio");
    audioElement.current.autoplay = true;
    pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  }

  return (
    isDone ? <ThankYouPage close={closeThankYou} /> : 
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
              micOn={micOn}
            />
          ) : (
            <NegotiationForm startSession={startSession} />
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
    </Box>);
};

export default LandingPage;