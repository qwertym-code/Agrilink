import Constants from 'expo-constants';

/**
 * Where the Express API lives, as seen *from the phone*.
 *
 * `localhost` on a phone means the phone itself, so the dev machine's LAN
 * address is required. Rather than hardcode an IP that breaks every time the
 * router hands out a new lease, derive it from the host already serving this
 * bundle — Expo knows it, and it is by definition reachable from the device.
 *
 * Override with EXPO_PUBLIC_API_URL when the API runs somewhere else.
 */
const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
const lanIp = debuggerHost?.split(':')[0];

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (lanIp ? `http://${lanIp}:5000/api` : 'http://localhost:5000/api');

export const API_PORT = 5000;
