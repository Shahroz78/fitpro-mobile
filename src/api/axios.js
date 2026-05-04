import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Set your backend URL here ──────────────────────────
// Deployed backend (Render/Railway) — best for APK testing:
// const BASE_URL = 'https://your-app.onrender.com/api';
//
// Local network (phone + PC on same WiFi):
// const BASE_URL = 'http://192.168.1.11:5000/api';  ← your PC LAN IP
//
// Android emulator only:
// const BASE_URL = 'http://10.0.2.2:5000/api';

const BASE_URL = 'http://192.168.1.108:5000/api'; // ← change this to your IP

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ────────────────────────────────
// Reads token from AsyncStorage on EVERY request
// This ensures token is always fresh even after app restart
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('fitpro_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // AsyncStorage read failed — continue without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────
// DO NOT clear token here — only log the error
// Token clearing should only happen on explicit logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      const url    = error.config?.url;
      const status = error.response?.status;
      const msg    = error.response?.data?.message;
      console.log(`❌ API Error [${status}] ${url} — ${msg}`);
    }
    return Promise.reject(error);
  }
);

export default api;



/*import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.11:5000/api'; // Android emulator → localhost
// For physical device: use your machine's LAN IP e.g. 'http://192.168.1.10:5000/api'
// For iOS simulator: 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('fitpro_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['fitpro_token', 'fitpro_user']);
    }
    return Promise.reject(error);
  }
);

export default api;*/
