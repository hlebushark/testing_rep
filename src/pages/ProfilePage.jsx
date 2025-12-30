import React from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person,
  Email,
  CalendarToday,
  Phone,
  VerifiedUser,
  Edit
} from '@mui/icons-material';
import { selectCurrentUser, selectIsAdmin } from '../features/auth/authSlice';

const ProfilePage = () => {
  const user = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);

  if (!user) {
    return (
      <Container>
        <Typography>Please login to view profile</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={user.image}
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Avatar>
          
          <Box>
            <Typography variant="h4">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              @{user.username}
            </Typography>
            {isAdmin && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <VerifiedUser color="primary" fontSize="small" />
                <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
                  Administrator
                </Typography>
              </Box>
            )}
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<Edit />}
            sx={{ ml: 'auto' }}
          >
            Edit Profile
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText
                  primary="Full Name"
                  secondary={`${user.firstName} ${user.lastName}`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={user.email}
                />
              </ListItem>
              
              {user.phone && (
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={user.phone}
                  />
                </ListItem>
              )}
              
              {user.birthDate && (
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Birth Date"
                    secondary={new Date(user.birthDate).toLocaleDateString()}
                  />
                </ListItem>
              )}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="User ID"
                  secondary={user.id}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Member Since"
                  secondary={user.createdAt ? 
                    new Date(user.createdAt).toLocaleDateString() : 
                    'Recently'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Account Type"
                  secondary={isAdmin ? 'Administrator' : 'Regular User'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Permissions"
                  secondary={isAdmin ? 
                    'Full access (Create, Read, Update, Delete)' : 
                    'Read-only access'}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">
            Change Password
          </Button>
          <Button variant="outlined" color="secondary">
            Account Settings
          </Button>
          {isAdmin && (
            <Button variant="outlined" color="error">
              Admin Panel
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;