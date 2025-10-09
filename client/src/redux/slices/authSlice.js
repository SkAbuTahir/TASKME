import { createSlice } from "@reduxjs/toolkit";

// Load user from localStorage if available
const loadUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data from localStorage', error);
    return null;
  }
};

const initialState = {
  user: loadUserFromStorage(),
  isSidebarOpen: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      // Store user data without the token (handled by HTTP-only cookie)
      const { token, ...userData } = payload;
      state.user = userData;
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
    setOpenSidebar: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setCredentials, logout, setOpenSidebar } = authSlice.actions;

export default authSlice.reducer;
