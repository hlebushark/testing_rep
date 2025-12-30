import { createSlice } from '@reduxjs/toolkit';

// Function to check if a user is an admin
const checkIsAdmin = (user) => {
  if (!user) return false;
  
  // Checking different options
  const adminUsernames = ['admin', 'emilys'];
  const adminEmails = ['admin@example.com', 'emily.johnson@x.dummyjson.com'];
  
  return (
    adminUsernames.includes(user.username?.toLowerCase()) ||
    adminEmails.includes(user.email?.toLowerCase()) ||
    user.role === 'admin' ||
    user.isAdmin === true
  );
};

const loadAuthFromStorage = () => {
  try {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        accessToken: token,
        isAdmin: checkIsAdmin(user)
      };
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
  }
  
  return {
    user: null,
    accessToken: null,
    isAdmin: false
  };
};

const initialState = loadAuthFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAdmin = checkIsAdmin(user);
      
      // Save to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      console.log('User set:', user.username, 'isAdmin:', state.isAdmin);
    },
    
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAdmin = false;
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth_user');
    },
    
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        state.isAdmin = checkIsAdmin(state.user);
        localStorage.setItem('auth_user', JSON.stringify(state.user));
      }
    }
  }
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAdmin = (state) => state.auth.isAdmin;
export const selectToken = (state) => state.auth.accessToken;