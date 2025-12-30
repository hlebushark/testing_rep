import React from 'react';
import { Container } from '@mui/material';
import RegisterForm from '../components/Auth/RegisterForm';

const RegisterPage = () => {
  return (
    <Container maxWidth="md">
      <RegisterForm />
    </Container>
  );
};

export default RegisterPage;