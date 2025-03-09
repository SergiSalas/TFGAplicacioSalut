// /src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, loginUser } from '../service/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user data', error);
      }
      setLoading(false);
    };
    loadUserData();
  }, []);

  // Simulación de login
  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      setToken(data.token);
      const userData = { name: data.name, email: data.email };
      setUser(userData);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error iniciando sesión', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerUser(name, email, password);
      setToken(data.token);
      const userData = { name: data.name, email: data.email };
      setUser(userData);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error registrando usuario', error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
