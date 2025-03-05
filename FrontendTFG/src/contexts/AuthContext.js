// /src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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

  // Simulación de registro
  const register = (name, email, password) => {
    // En un proyecto real, harías una llamada a tu backend para crear el usuario
    // Suponemos que se creó exitosamente, y autenticamos al instante
    const newUser = { id: '2', name, email };
    setUser(newUser);
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
