import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * redux-persist storage engine backed by the OS keychain / keystore.
 * Used for the auth slice so the access token never sits in plain AsyncStorage.
 * (SecureStore is unavailable on web, so we fall back to AsyncStorage there.)
 */
const safeKey = (key: string) => key.replace(/[^\w.-]/g, '_');
const useSecure = Platform.OS !== 'web';

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (!useSecure) return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(safeKey(key));
  },
  async setItem(key: string, value: string): Promise<void> {
    if (!useSecure) return AsyncStorage.setItem(key, value);
    await SecureStore.setItemAsync(safeKey(key), value);
  },
  async removeItem(key: string): Promise<void> {
    if (!useSecure) return AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(safeKey(key));
  },
};
