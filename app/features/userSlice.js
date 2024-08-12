import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/api';

export const login = createAsyncThunk('user/login', async ({ email, password }) => {
  const response = await loginUser(email, password);
  return response;
});

export const register = createAsyncThunk('user/register', async ({ name, email, password }) => {
  const response = await registerUser(name, email, password);
  return response;
});

export const loadUserData = createAsyncThunk('user/loadUserData', async () => {
  const user = await AsyncStorage.getItem('user');
  if (user) {
    return JSON.parse(user);
  }
  return null;
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    error: null,
    loading: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.error = null;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.error = null;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.user = null;
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
