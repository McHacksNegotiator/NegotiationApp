import React, { useState, useRef } from 'react';
import { Box, Card, Button, Typography } from '@mui/joy';
import { CallScreen } from '../components/CallScreen';
import { NegotiationForm } from '../components/NegotiationForm';
import { Timer } from '../components/Timer';
import ThankYouPage from '../pages/ThankYouPage';

const LandingPage = () => {
  const [isDone, setIsDone] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  async function startSession(formData) {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(ms);
      setIsConnected(true);

      const queryParams = new URLSearchParams(formData).toString();
      const tokenResponse = await fetch(`/token?${queryParams}`);
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      const pc = new RTCPeerConnection();
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

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

      const answer = { type: "answer", sdp: await sdpResponse.text() };
      await pc.setRemoteDescription(answer);
      peerConnection.current = pc;
    } catch (error) {
      console.error("Error starting session:", error);
    }
  }

  function stopSession() {
    if (dataChannel) dataChannel.close();
    if (peerConnection.current) peerConnection.current.close();
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setDataChannel(null);
    setMediaStream(null);
    peerConnection.current = null;
  }

  const handleEndCall = (e) => {
    e.preventDefault();
    stopSession();
    setIsDone(true);
  };

  function closeThankYou() {
    setIsDone(false);
    setIsConnected(false);
  }

  return (
    isDone ? <ThankYouPage close={closeThankYou} /> :
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(to bottom right, #9c27b0, #f06292, #f44336)',
          p: 0
        }}
      >
        <Typography
          level="h1"
          sx={{
            textAlign: 'center',
            mt: 4,
            mb: 2,
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(0,0,0,0.3)',
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' }
          }}
        >
          Bargain Bot
        </Typography>

        {isConnected && <Timer />}

        <Box
          sx={{
            flex: '1 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: { xs: 2, sm: 3 }
          }}
        >
          <Card
            variant={isConnected ? "plain" : "soft"}
            sx={{
              width: isConnected ? '100%' : { xs: '100%', sm: '85%', md: '75%', lg: '65%' },
              maxWidth: isConnected ? 'none' : '700px',
              background: isConnected ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: isConnected ? 'none' : 'blur(8px)',
              boxShadow: isConnected ? 'none' : undefined
            }}
          >
            {isConnected ? (
              <CallScreen
                micOn={micOn}
                localMicrophoneTrack={mediaStream?.getTracks()[0]}
              />
            ) : (
              <NegotiationForm startSession={startSession} />
            )}
          </Card>
        </Box>

        {isConnected && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              p: 2,
              borderRadius: 'xl',
              boxShadow: 'md',
              mx: 'auto',
              mb: 4,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            <Button
              variant="soft"
              color={micOn ? 'primary' : 'warning'}
              onClick={() => {
                setMicOn(prev => !prev);
                if (mediaStream) {
                  mediaStream.getTracks()[0].enabled = !micOn;
                }
              }}
              sx={{
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                width: { xs: '100%', sm: 'auto' }
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
                py: 1.5,
                width: { xs: '100%', sm: 'auto' }
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