// /src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, loginUser,verifyToken } from '../service/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        console.log('Stored token:', storedToken);
        console.log('Stored user:', storedUser);
        if (
          storedToken && storedUser &&
          storedToken !== 'null' && storedUser !== 'null'
        ) {
          const isValid = await verifyToken(storedToken);
          console.log('Token valid:', isValid);
          if (isValid === true) { // Aseguramos que sea estrictamente true
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token inválido: se limpian los datos y se fuerza a logear nuevamente
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user data', error);
        setToken(null);
        setUser(null);
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
      setIsNewUser(false);
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
      setIsNewUser(true);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error registrando usuario', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user,token, loading, login, register, logout, isNewUser, setIsNewUser }}>
      {children}
    </AuthContext.Provider>
  );
};
