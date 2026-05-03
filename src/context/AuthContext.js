import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import * as services from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('fitpro_token');
        const saved = await AsyncStorage.getItem('fitpro_user');
        if (token && saved) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(saved));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const res = await services.login({ email, password });
    const { token, user: u } = res.data;
    await AsyncStorage.setItem('fitpro_token', token);
    await AsyncStorage.setItem('fitpro_user', JSON.stringify(u));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await services.register({ name, email, password });
    const { token, user: u } = res.data;
    await AsyncStorage.setItem('fitpro_token', token);
    await AsyncStorage.setItem('fitpro_user', JSON.stringify(u));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(u);
    return u;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['fitpro_token', 'fitpro_user']);
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await services.getMe();
      const u = res.data.user;
      await AsyncStorage.setItem('fitpro_user', JSON.stringify(u));
      setUser(u);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
