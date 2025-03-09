// /src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { registerUser } from '../service/AuthService';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simular carga inicial (por ejemplo, de AsyncStorage)
  useEffect(() => {
    setTimeout(() => {
      setUser(null); // Por defecto, no autenticado
      setLoading(false);
    }, 1000);
  }, []);

  // Simulación de login
  const login = (email, password) => {
    // Aquí podrías validar credenciales contra una API real
    // Por ahora, asumimos que todo va bien y creamos un usuario de ejemplo
    const fakeUser = { id: '1', name: 'Sergi', email };
    setUser(fakeUser);
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerUser(name, email, password);
      setToken(data.token);
      setUser({ name: data.name, email: data.email }); 
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
