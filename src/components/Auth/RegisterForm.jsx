import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useRegisterUserMutation } from '../../api/usersApi';
import { useLoginMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  username: yup.string().required('Username is required').min(3),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase and number'
    ),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  age: yup.number()
    .min(18, 'You must be at least 18 years old')
    .max(100, 'Invalid age')
    .required('Age is required'),
  gender: yup.string().required('Gender is required')
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();
  const [login] = useLoginMutation();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      gender: '',
      phone: '',
      birthDate: '',
      image: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      
      try {
        // 1. Register a user
        const registerData = {
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email,
          password: values.password,
          age: values.age,
          gender: values.gender,
          phone: values.phone || '',
          birthDate: values.birthDate || '',
          image: values.image || `https://i.pravatar.cc/150?u=${values.username}`
        };
        
        const registrationResult = await registerUser(registerData).unwrap();
        console.log('Registration successful:', registrationResult);
        
        // 2. Log in automatically after registration
        try {
          const loginResult = await login({
            username: values.username,
            password: values.password
          }).unwrap();
          
          // 3. Save data to Redux
          dispatch(setCredentials({
            user: loginResult,
            accessToken: loginResult.accessToken
          }));
          
          // 4. Redirect to the main page
          navigate('/products');
          
        } catch (loginError) {
          // If automatic login fails, please log in manually.
          setError('Registration successful! Please login with your credentials.');
          navigate('/login');
        }
        
      } catch (err) {
        console.error('Registration error:', err);
        setError(err.data?.message || 'Registration failed. Please try again.');
      }
    }
  });

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Create New Account
      </Typography>
      
      {error && (
        <Alert severity={error.includes('successful') ? 'success' : 'error'} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="firstName"
              label="First Name"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="lastName"
              label="Last Name"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="username"
              label="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="age"
              label="Age"
              type="number"
              value={formik.values.age}
              onChange={formik.handleChange}
              error={formik.touched.age && Boolean(formik.errors.age)}
              helperText={formik.touched.age && formik.errors.age}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              name="gender"
              label="Gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              helperText={formik.touched.gender && formik.errors.gender}
              SelectProps={{
                native: true
              }}
            >
              <option value=""></option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="phone"
              label="Phone (Optional)"
              value={formik.values.phone}
              onChange={formik.handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="birthDate"
              label="Birth Date (Optional)"
              type="date"
              value={formik.values.birthDate}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="image"
              label="Profile Image URL (Optional)"
              value={formik.values.image}
              onChange={formik.handleChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isRegistering}
            fullWidth
          >
            {isRegistering ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
          
          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="text" color="primary">
                Sign In
              </Button>
            </Link>
          </Typography>
        </Box>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> DummyJSON is a fake API. Registered users are not actually saved permanently.
            For testing, use these credentials:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • <strong>Admin:</strong> username: "emilys", password: "emilyspass"
            <br />
            • <strong>User:</strong> username: "michaelw", password: "michaelwpass"
          </Typography>
        </Box>
      </form>
    </Paper>
  );
};

export default RegisterForm;