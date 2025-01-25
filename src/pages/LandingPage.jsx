import React, { useState } from "react";
import { Box, Card, FormControl, FormLabel, Grid, Input, Select, Option, Textarea, Button } from '@mui/joy';
import { LocalUser, RemoteUser, useIsConnected, useJoin, useLocalMicrophoneTrack, usePublish, useRemoteUsers } from "agora-rtc-react";

export default function LandingPage() {
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

  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState(import.meta.env.VITE_AGORA_APP_ID);
  const [channel, setChannel] = useState(import.meta.env.VITE_AGORA_CHANNEL_NAME);
  const [token, setToken] = useState("");
  const [micOn, setMic] = useState(true);

  useJoin({ appid: appId, channel: channel, token: token ? token : null }, calling);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  usePublish([localMicrophoneTrack]);
  const remoteUsers = useRemoteUsers();

  const handleSubmit = (e) => {
    e.preventDefault();
    setCalling(true);
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
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          my: { xs: 2, sm: 3 }
        }}
      >
        <Card
          variant="soft"
          sx={{
            width: { xs: '98%', sm: '85%', md: '75%', lg: '65%' },
            maxWidth: '800px',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)'
          }}
        >
          {isConnected ? (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={1}>
                <Grid xs={12}>
                  <LocalUser audioTrack={localMicrophoneTrack} micOn={micOn} cover="/api/placeholder/48/48">
                    <Box component="span" sx={{ ml: 1 }}>You</Box>
                  </LocalUser>
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
            gap: 1,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            p: 1.5,
            borderRadius: 'xl',
            boxShadow: 'md'
          }}
        >
          <Button
            variant="soft"
            color={micOn ? 'primary' : 'danger'}
            onClick={() => setMic(a => !a)}
          >
            {micOn ? 'Mute' : 'Unmute'}
          </Button>
          <Button
            variant="soft"
            color={calling ? 'danger' : 'success'}
            onClick={() => setCalling(a => !a)}
          >
            {calling ? 'End Call' : 'Start Call'}
          </Button>
        </Box>
      )}
    </Box>
  );
}