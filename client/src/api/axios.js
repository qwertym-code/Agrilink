import axios from 'axios';

export const TOKEN_KEY = 'agrilink_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Read the token per request rather than at module load, so a login or logout
// takes effect immediately without a page refresh.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Pulls a displayable message out of an axios failure. A network error has no
 * response at all, which would otherwise surface as a blank alert.
 */
export function getErrorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.request) return 'Cannot reach the server. Is the API running on port 5000?';
  return err.message || 'Something went wrong';
}

/** Per-field validation messages, keyed by field name. */
export function getFieldErrors(err) {
  return err.response?.data?.errors || {};
}

export default api;
