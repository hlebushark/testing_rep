import React from 'react';
import { Container, Box, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage = () => {
  return (
    <Container maxWidth="sm">
      <LoginForm />
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Don't have an account?{' '}
          <MuiLink component={Link} to="/register" sx={{ textDecoration: 'none' }}>
            <strong>Create one here</strong>
          </MuiLink>
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Need test credentials?
          <br />
          Admin: <strong>emilys / emilyspass</strong>
          <br />
          User: <strong>michaelw / michaelwpass</strong>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;