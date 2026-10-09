import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NewSession, StatsRange } from '../../types';

interface StatsState {
  range: StatsRange;
  /** Sessions that failed to upload (offline / API error). Retried later. */
  pending: NewSession[];
}

const initialState: StatsState = { range: 'today', pending: [] };

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setRange(state, action: PayloadAction<StatsRange>) {
      state.range = action.payload;
    },
    queueSession(state, action: PayloadAction<NewSession>) {
      state.pending.push(action.payload);
    },
    clearPending(state) {
      state.pending = [];
    },
    setPending(state, action: PayloadAction<NewSession[]>) {
      state.pending = action.payload;
    },
  },
});

export const { setRange, queueSession, clearPending, setPending } = statsSlice.actions;
export default statsSlice.reducer;
