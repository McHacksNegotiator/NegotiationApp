import React from 'react';
import { 
  Box,
  Card,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Select,
  Option,
  Textarea,
  Button
} from '@mui/joy';

export default function ContactPage() {
  const isps = [
    "Bell",
    "Videotron",
    "Rogers",
    "TekSavvy",
    "Virgin Plus",
    "EBOX",
    "Distributel",
    "ColbaNet",
    "VMedia",
    "Fizz"
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #9c27b0, #f06292, #f44336)',
        p: { xs: 2, sm: 4 }
      }}
    >
      <Card
        variant="soft"
        sx={{
          width: '100%',
          maxWidth: '900px',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <form>
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Personal Info */}
            <Grid xs={12} sm={6}>
              <FormControl required>
                <FormLabel>First Name</FormLabel>
                <Input placeholder="Enter your first name" />
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl required>
                <FormLabel>Last Name</FormLabel>
                <Input placeholder="Enter your last name" />
              </FormControl>
            </Grid>

            {/* Contact Info */}
            <Grid xs={12} sm={6}>
              <FormControl required>
                <FormLabel>Email Address</FormLabel>
                <Input type="email" placeholder="Enter your email" />
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl required>
                <FormLabel>Phone Number</FormLabel>
                <Input type="tel" placeholder="Enter your phone number" />
              </FormControl>
            </Grid>

            {/* ISP Info */}
            <Grid xs={12} sm={6}>
              <FormControl required>
                <FormLabel>Internet Service Provider</FormLabel>
                <Select placeholder="Select your ISP">
                  {isps.map((isp) => (
                    <Option key={isp} value={isp.toLowerCase()}>{isp}</Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl required>
                <FormLabel>Account Number</FormLabel>
                <Input placeholder="Enter your account number" />
              </FormControl>
            </Grid>

            {/* Address Section */}
            <Grid xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'background.level1',
                borderRadius: 'sm'
              }}>
                <FormLabel sx={{ fontSize: 'lg', mb: 2 }}>Address Information</FormLabel>
                <Grid container spacing={2}>
                  <Grid xs={12}>
                    <FormControl required>
                      <FormLabel>Street Address</FormLabel>
                      <Input placeholder="Enter your street address" />
                    </FormControl>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <FormControl>
                      <FormLabel>Apartment/Unit (optional)</FormLabel>
                      <Input placeholder="Enter your apartment/unit" />
                    </FormControl>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <FormControl required>
                      <FormLabel>City</FormLabel>
                      <Input placeholder="Enter your city" />
                    </FormControl>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <FormControl required>
                      <FormLabel>Province</FormLabel>
                      <Input placeholder="Enter your province" />
                    </FormControl>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <FormControl required>
                      <FormLabel>Postal Code</FormLabel>
                      <Input placeholder="Enter your postal code" />
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Situation Description */}
            <Grid xs={12}>
              <FormControl required>
                <FormLabel>Describe Your Situation</FormLabel>
                <Textarea
                  minRows={4}
                  placeholder="Please explain what you'd like to negotiate and any relevant details about your situation..."
                />
              </FormControl>
            </Grid>

            {/* Submit Button */}
            <Grid xs={12}>
              <Button
                type="submit"
                variant="solid"
                size="lg"
                fullWidth
                sx={{
                  mt: 2,
                  py: 2,
                  fontSize: 'lg',
                  fontWeight: 'lg',
                  background: 'linear-gradient(to right, #9c27b0, #f06292, #f44336)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #7b1fa2, #ec407a, #d32f2f)',
                    transform: 'scale(1.02)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                Start Negotiation!
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
}