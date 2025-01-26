import React, { useState, useEffect, useRef } from "react";
import { Box, Card, FormControl, FormLabel, Grid, Input, Select, Option, Textarea, Button } from '@mui/joy';
import { LocalUser, RemoteUser, useIsConnected, useJoin, useLocalMicrophoneTrack, usePublish, useRemoteUsers } from "agora-rtc-react";
import { useNavigate } from 'react-router-dom';

const CircularAudioWave = ({ audioTrack }) => {
  const [audioData, setAudioData] = useState(new Uint8Array(32).fill(0));
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

const LandingPage = () => {
  const isps = ["Bell", "Videotron", "Rogers", "TekSavvy", "Virgin Plus", "EBOX", "Distributel", "ColbaNet", "VMedia", "Fizz"];

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "(514) 555-0123",
    isp: "bell",
    accountNumber: "12345678",
    streetAddress: "123 Main Street",
    apartment: "4A",
    city: "Montreal",
    province: "Quebec",
    postalCode: "H2X 1Y6",
    situation: "I'd like to negotiate a better rate for my internet service package."
  });

  const navigate = useNavigate()
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId] = useState(import.meta.env.VITE_AGORA_APP_ID);
  const [channel] = useState(import.meta.env.VITE_AGORA_CHANNEL_NAME);
  const [token] = useState("");
  const [micOn, setMic] = useState(true);

  const handleApiCall = async () => {
    const url = `https://api.agora.io/v1/projects/${appId}/rtsc/speech-to-text/builderTokens`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `agora token="${import.meta.env.VITE_AGORA_TOKEN}"`
      },
      body: JSON.stringify({
        instanceId: channel,
      }),
    };

    try {
      const res = await fetch(url, options);
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useJoin({ appid: appId, channel: channel, token: import.meta.env.VITE_AGORA_TOKEN }, calling);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  usePublish([localMicrophoneTrack]);
  const remoteUsers = useRemoteUsers();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleApiCall();
    setCalling(true);
  };

  const handleEndCall = (e) => {
    //setCalling(false);
    e.preventDefault()
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
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <FormControl required>
                    <FormLabel>First Name</FormLabel>
                    <Input defaultValue={formData.firstName} />
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl required>
                    <FormLabel>Last Name</FormLabel>
                    <Input defaultValue={formData.lastName} />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl required>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" defaultValue={formData.email} />
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl required>
                    <FormLabel>Phone</FormLabel>
                    <Input type="tel" defaultValue={formData.phone} />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl required>
                    <FormLabel>Internet Provider</FormLabel>
                    <Select defaultValue={formData.isp}>
                      {isps.map((isp) => (
                        <Option key={isp} value={isp.toLowerCase()}>{isp}</Option>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl required>
                    <FormLabel>Account Number</FormLabel>
                    <Input defaultValue={formData.accountNumber} />
                  </FormControl>
                </Grid>

                <Grid xs={12}>
                  <Box sx={{ p: 1 }}>
                    <FormLabel sx={{ fontSize: 'lg', mb: 1 }}>Address</FormLabel>
                    <Grid container spacing={2}>
                      <Grid xs={12}>
                        <FormControl required>
                          <FormLabel>Street Address</FormLabel>
                          <Input defaultValue={formData.streetAddress} />
                        </FormControl>
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <FormControl>
                          <FormLabel>Apartment (optional)</FormLabel>
                          <Input defaultValue={formData.apartment} />
                        </FormControl>
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <FormControl required>
                          <FormLabel>City</FormLabel>
                          <Input defaultValue={formData.city} />
                        </FormControl>
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <FormControl required>
                          <FormLabel>Province</FormLabel>
                          <Input defaultValue={formData.province} />
                        </FormControl>
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <FormControl required>
                          <FormLabel>Postal Code</FormLabel>
                          <Input defaultValue={formData.postalCode} />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid xs={12}>
                  <FormControl required>
                    <FormLabel>Your Situation</FormLabel>
                    <Textarea
                      minRows={3}
                      defaultValue={formData.situation}
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12}>
                  <Button
                    type="submit"
                    variant="solid"
                    size="lg"
                    fullWidth
                    sx={{
                      mt: 1,
                      py: 1.5,
                      fontSize: 'lg',
                      background: 'linear-gradient(to right, #9c27b0, #f06292, #f44336)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #7b1fa2, #ec407a, #d32f2f)',
                        transform: 'scale(1.02)'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    Start Negotiation
                  </Button>
                </Grid>
              </Grid>
            </Box>
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