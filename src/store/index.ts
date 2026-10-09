import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/api';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import statsReducer from './slices/statsSlice';
import themeReducer from './slices/themeSlice';
import timerReducer from './slices/timerSlice';
import { secureStorage } from './secureStorage';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: persistReducer({ key: 'auth', storage: secureStorage }, authReducer),
  settings: persistReducer({ key: 'settings', storage: AsyncStorage }, settingsReducer),
  theme: persistReducer({ key: 'theme', storage: AsyncStorage }, themeReducer),
  stats: persistReducer({ key: 'stats', storage: AsyncStorage }, statsReducer),
  // The timer is intentionally not persisted.
  timer: timerReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
