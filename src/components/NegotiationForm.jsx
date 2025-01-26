import React, { useState } from 'react';
import { Box, FormControl, FormLabel, Grid, Input, Select, Option, Textarea, Button } from '@mui/joy';

const isps = ["Bell", "Videotron", "Rogers", "TekSavvy", "Virgin Plus", "EBOX", "Distributel", "ColbaNet", "VMedia", "Fizz"];

const NegotiationForm = ({ onSubmit }) => {
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

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ p: 2 }}>
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
  );
};

export { NegotiationForm };