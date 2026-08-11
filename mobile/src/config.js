import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

/**
 * Where the Express API lives, as seen *from the phone*.
 *
 * `localhost` on a phone means the phone itself, so the dev machine's address
 * is required. Hardcoding an IP breaks every time the router issues a new
 * lease, so it is derived from whatever host is already serving this app —
 * that host is reachable from the device by definition.
 *
 * Sources are tried in order of reliability:
 *   1. EXPO_PUBLIC_API_URL          explicit override, always wins
 *   2. SourceCode.scriptURL         the Metro dev server; set in dev builds
 *   3. Constants.expoConfig.hostUri set in Expo Go, absent in some dev builds
 *   4. localhost                    works only with `adb reverse tcp:5000 tcp:5000`
 */
function hostFromScriptURL() {
  // e.g. "http://10.49.189.252:8081/index.bundle?platform=android"
  const url = NativeModules?.SourceCode?.scriptURL;
  if (!url || !url.startsWith('http')) return null; // file:// in release builds
  const match = url.match(/^https?:\/\/([^/:]+)/);
  return match ? match[1] : null;
}

function hostFromExpoConfig() {
  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  return debuggerHost?.split(':')[0] ?? null;
}

const host = hostFromScriptURL() || hostFromExpoConfig();

export const API_PORT = 5000;

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  `http://${host || 'localhost'}:${API_PORT}/api`;

// Surfaced in error messages so a failure names the address actually tried.
export const API_HOST_SOURCE = process.env.EXPO_PUBLIC_API_URL
  ? 'EXPO_PUBLIC_API_URL'
  : hostFromScriptURL()
    ? 'Metro dev server'
    : hostFromExpoConfig()
      ? 'Expo config'
      : 'localhost fallback (needs adb reverse)';
