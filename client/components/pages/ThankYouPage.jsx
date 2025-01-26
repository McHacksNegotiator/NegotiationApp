import React from 'react';
import { Box, Typography, Button, Card } from '@mui/joy';

const ThankYouPage = ({ close }) => {
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
          my: { xs: 2, sm: 3 },
          position: 'relative'
        }}
      >
        <Card
          variant="soft"
          sx={{
            width: { xs: '98%', sm: '85%', md: '75%', lg: '65%' },
            maxWidth: '800px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            p: 4,
            textAlign: 'center'
          }}
        >
          <Typography level="h2" sx={{ mb: 2, color: '#9c27b0' }}>
            Thank You for Your Call
          </Typography>
          <Typography sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            We hope to have negotiated a successful deal for you. Please return to the home page to start a new session.
          </Typography>
          <Button
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
            onClick={close}
          >
            Return to Home
          </Button>
        </Card>
      </Box>
    </Box>
  );
};

export default ThankYouPage;