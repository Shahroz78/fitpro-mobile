import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import * as services from '../api/services';

const AuthContext = createContext(null);

// Helper — saves token to both AsyncStorage AND axios default headers
const saveToken = async (token) => {
  await AsyncStorage.setItem('fitpro_token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Helper — clears token from both places
const clearToken = async () => {
  await AsyncStorage.multiRemove(['fitpro_token', 'fitpro_user']);
  delete api.defaults.headers.common['Authorization'];
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start — restore session from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('fitpro_token');
        const saved = await AsyncStorage.getItem('fitpro_user');

        if (token && saved) {
          // Re-attach token to axios so all requests are authenticated
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(saved));
        }
      } catch (e) {
        console.log('Session restore failed:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Login ──────────────────────────────────────────
  const login = async (email, password) => {
    const res = await services.login({ email, password });
    const { token, user: u } = res.data;

    await saveToken(token);
    await AsyncStorage.setItem('fitpro_user', JSON.stringify(u));
    setUser(u);

    if (__DEV__) console.log('✅ Login success — token saved:', token.slice(0, 20) + '...');
    return u;
  };

  // ── Register ───────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await services.register({ name, email, password });
    const { token, user: u } = res.data;

    await saveToken(token);
    await AsyncStorage.setItem('fitpro_user', JSON.stringify(u));
    setUser(u);

    if (__DEV__) console.log('✅ Register success — token saved:', token.slice(0, 20) + '...');
    return u;
  };

  // ── Logout ─────────────────────────────────────────
  const logout = async () => {
    await clearToken();
    setUser(null);
    if (__DEV__) console.log('✅ Logged out — token cleared');
  };

  // ── Refresh user profile ───────────────────────────
  const refreshUser = async () => {
    try {
      const res = await services.getMe();
      const u   = res.data.user;
      await AsyncStorage.setItem('fitpro_user', JSON.stringify(u));
      setUser(u);
    } catch (e) {
      console.log('refreshUser failed:', e.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};




/*import React, { createContext, useContext, useState, useEffect } from 'react';
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
};*/
