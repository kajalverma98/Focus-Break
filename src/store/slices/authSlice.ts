import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthResponse, User } from '../../types';

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = { token: null, user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout() {
      return initialState;
    },
    /** Dispatched by the API layer when the server rejects our token. */
    sessionExpired() {
      return initialState;
    },
  },
});

export const { setCredentials, updateUser, logout, sessionExpired } = authSlice.actions;
export default authSlice.reducer;
