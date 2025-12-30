import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useLoginMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    
    console.log('Attempting login with:', { username, password });
    
    try {
      const result = await login({ username, password }).unwrap();
      console.log('Login successful:', result);
      
      setDebugInfo(`User: ${result.username}, ID: ${result.id}, Token: ${result.accessToken?.substring(0, 20)}...`);
      
      // Dispatch to Redux
      dispatch(setCredentials({
        user: result,
        accessToken: result.accessToken || result.token
      }));
      
      // Redirect
      navigate('/products');
      
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.data?.message || 'Login failed. Check console for details.');
      
      setDebugInfo('Try: emilys/emilyspass or michaelw/michaelwpass or sophiab/sophiabpass');
    }
  };

  const handleTestLogin = (testUser) => {
    setUsername(testUser.username);
    setPassword(testUser.password);
    
    // Automatically send the form in a second
    setTimeout(() => {
      document.getElementById('login-form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 100);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Login
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {debugInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {debugInfo}
        </Alert>
      )}
      
      <form id="login-form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          required
          autoFocus
        />
        
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </form>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick test logins:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}> 
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleTestLogin({ username: 'emilys', password: 'emilyspass' })}
          >
            Login as Emily (Admin)
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleTestLogin({ username: 'michaelw', password: 'michaelwpass' })}
          >
            Login as Michael 
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => handleTestLogin({ username: 'sophiab', password: 'sophiabpass' })}
          >
            Login as Sophia  
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> Check browser console (F12) for login details.
          DummyJSON requires exact usernames/passwords.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;