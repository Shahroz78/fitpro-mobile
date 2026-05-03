import axios from 'axios';
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

export default api;
