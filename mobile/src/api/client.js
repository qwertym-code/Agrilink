import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, API_HOST_SOURCE } from '../config';

// The OS keychain / keystore, not AsyncStorage — a session token is a
// credential and shouldn't sit in plaintext app storage.
export const TOKEN_KEY = 'agrilink_token';

export const saveToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const readToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Async interceptor: SecureStore reads are promises, unlike localStorage.
api.interceptors.request.use(async (config) => {
  const token = await readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ECONNABORTED') return 'The server took too long to respond.';
  if (err.request) {
    // Name the address and where it came from — "cannot reach localhost" is
    // useless without knowing why localhost was chosen.
    return `Cannot reach the server at ${API_URL} (address from: ${API_HOST_SOURCE}). Check the API is running and the phone is on the same network as the laptop.`;
  }
  return err.message || 'Something went wrong';
}

export function getFieldErrors(err) {
  return err.response?.data?.errors || {};
}

export default api;
