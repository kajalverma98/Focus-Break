import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '../../types';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'system' as ThemeMode },
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const { setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
