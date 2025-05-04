// /src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { registerUser, loginUser, verifyToken } from '../service/AuthService';
import { ActivityCache } from '../cache/ActivityCache';
import { appStorage, STORAGE_KEYS } from '../storage/AppStorage';
import { CommonActions } from '@react-navigation/native';
import { ProfileImageCache } from '../cache/ProfileImageCache';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [navigation, setNavigation] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carga de datos almacenados...');
      
      // IMPORTANTE: Comenzar siempre con estados limpios
      setToken(null);
      setUser(null);
      setIsNewUser(false);
      
      // Imprimir todas las claves para diagnóstico
      console.log('TODAS LAS CLAVES EN STORAGE:', appStorage.getAllKeys());
      
      // Obtener el token almacenado
      const storedToken = appStorage.getString(STORAGE_KEYS.AUTH_TOKEN);
      console.log('Token encontrado:', storedToken ? 'Sí ('+storedToken.substring(0,15)+'...)' : 'No');
      
      if (!storedToken) {
        console.log('No hay token almacenado');
        setLoading(false);
        return;
      }
      
      // Si hay token, verificar también los datos del usuario
      const userData = appStorage.getString(STORAGE_KEYS.USER_DATA);
      console.log('Datos de usuario encontrados:', userData ? 'Sí' : 'No');
      
      if (!userData) {
        console.log('Token existe pero no hay datos de usuario, limpiando...');
        forceCleanAuth();
        setLoading(false);
        return;
      }
      
      try {
        // Intentar parsear los datos del usuario
        const parsedUserData = JSON.parse(userData);
        if (!parsedUserData || !parsedUserData.email) {
          console.log('Datos de usuario no válidos, limpiando...');
          forceCleanAuth();
        } else {
          // Todo parece correcto, ahora verificar con el backend si el token es válido
          console.log('Verificando validez del token con el servidor...');
          try {
            // Asegurar que se envía el token correctamente al verificarlo
            const isValid = await verifyToken(storedToken);
            console.log('Resultado de verificación de token:', isValid);
            
            if (isValid) {
              // Token válido, establecer estados
              setToken(storedToken);
              setUser(parsedUserData);
              
              // Obtener estado de usuario nuevo
              const newUserFlag = appStorage.getString(STORAGE_KEYS.IS_NEW_USER);
              setIsNewUser(newUserFlag === 'true');
              
              console.log('Usuario autenticado correctamente:', parsedUserData.email);
            } else {
              console.log('Token almacenado no válido, limpiando...');
              forceCleanAuth();
            }
          } catch (verifyError) {
            console.error('Error al verificar token con el servidor:', verifyError);
            forceCleanAuth();
          }
        }
      } catch (parseError) {
        console.error('Error al parsear datos de usuario:', parseError);
        forceCleanAuth();
      }
    } catch (error) {
      console.error('Error en loadStoredData:', error);
      forceCleanAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      
      appStorage.set(STORAGE_KEYS.AUTH_TOKEN, data.token);
      appStorage.set(STORAGE_KEYS.USER_DATA, JSON.stringify({
        name: data.name, 
        email: data.email
      }));
      appStorage.set(STORAGE_KEYS.IS_NEW_USER, false);
      
      setToken(data.token);
      setUser({ name: data.name, email: data.email });
      setIsNewUser(false);
    } catch (error) {
      console.error('Error iniciando sesión', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerUser(name, email, password);
      
      console.log('Registro exitoso, guardando token:', data.token ? 'Sí' : 'No');
      
      // Asegurar que los datos existen antes de guardarlos
      if (!data.token) {
        throw new Error('No se recibió token del servidor');
      }
      
      // Guardar datos en almacenamiento
      appStorage.set(STORAGE_KEYS.AUTH_TOKEN, data.token);
      appStorage.set(STORAGE_KEYS.USER_DATA, JSON.stringify({
        name: data.name, 
        email: data.email
      }));
      appStorage.set(STORAGE_KEYS.IS_NEW_USER, 'true');
      
      // Verificar que se guardaron correctamente
      const savedToken = appStorage.getString(STORAGE_KEYS.AUTH_TOKEN);
      console.log('Token guardado correctamente:', savedToken === data.token);
      
      // Actualizar estado
      setToken(data.token);
      setUser({ name: data.name, email: data.email });
      setIsNewUser(true);
      
      return data;
    } catch (error) {
      console.error('Error registrando usuario', error);
      throw error;
    }
  };

  const logout = () => {
    try {

      ProfileImageCache.clearCache();

      appStorage.delete(STORAGE_KEYS.AUTH_TOKEN);
      appStorage.delete(STORAGE_KEYS.USER_DATA);
      
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleTokenExpiration = () => {
    try {
      console.log('Sesión expirada, limpiando todas las cachés y datos guardados');
      

      ProfileImageCache.clearCache();

      ActivityCache.clearAllCache();
      
      appStorage.delete(STORAGE_KEYS.AUTH_TOKEN);
      appStorage.delete(STORAGE_KEYS.USER_DATA);
      
      setToken(null);
      setUser(null);
      
      // Redirigir a la pantalla de login si tenemos navegación disponible
      if (navigation) {
        // Usar navigate o reset según sea apropiado
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
        
        // Mostrar alerta después de la redirección
        setTimeout(() => {
          Alert.alert(
            "Sesión expirada",
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            [{ text: "OK" }]
          );
        }, 100);
      } else {
        // Si no hay navegación, solo mostrar la alerta
        Alert.alert(
          "Sesión expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error al manejar expiración de token:', error);
    }
  };

  const updateIsNewUser = (value) => {
    try {
      appStorage.set(STORAGE_KEYS.IS_NEW_USER, value.toString());
      setIsNewUser(value);
    } catch (error) {
      console.error('Error al guardar estado de usuario nuevo:', error);
    }
  };

  // Función para limpiar por completo cualquier dato de autenticación
  const forceCleanAuth = () => {
    console.log('⚠️ Forzando limpieza de todos los datos de autenticación');
    
    try {
      // Limpiar todas las claves conocidas que podrían tener tokens
      appStorage.delete(STORAGE_KEYS.AUTH_TOKEN);
      appStorage.delete(STORAGE_KEYS.TOKEN);
      appStorage.delete('auth_token');
      appStorage.delete('token');
      appStorage.delete(STORAGE_KEYS.USER_DATA);
      appStorage.delete(STORAGE_KEYS.IS_NEW_USER);

      ProfileImageCache.clearCache();
      
      // Limpiar también en el módulo CacheService si existe
      try {
        const { CacheService } = require('../services/CacheService');
        if (CacheService && CacheService.clearAuthData) {
          CacheService.clearAuthData();
        }
      } catch (e) {
        // Ignorar si no existe
      }
      
      // Actualizar estado
      setToken(null);
      setUser(null);
      setIsNewUser(false);
      
      console.log('✅ Limpieza de autenticación completada');
    } catch (error) {
      console.error('Error durante la limpieza forzada:', error);
    }
  };

  // Añadir método para registrar la navegación
  const registerNavigation = (nav) => {
    console.log('Navegación registrada correctamente');
    setNavigation(nav);
  };

  // Añadir este método para comprobar el estado del almacenamiento
  const checkStorageStatus = () => {
    const allKeys = appStorage.getAllKeys();
    const storedToken = appStorage.getString(STORAGE_KEYS.AUTH_TOKEN);
    const userData = appStorage.getString(STORAGE_KEYS.USER_DATA);
    const isNewUserFlag = appStorage.getString(STORAGE_KEYS.IS_NEW_USER);
    
    console.log('=== ESTADO DEL ALMACENAMIENTO ===');
    console.log('Todas las claves:', allKeys);
    console.log('Token almacenado:', storedToken ? `${storedToken.substring(0,15)}...` : 'No');
    console.log('Datos de usuario:', userData);
    console.log('Es usuario nuevo:', isNewUserFlag);
    console.log('================================');
    
    return {
      hasToken: !!storedToken,
      hasUserData: !!userData,
      isNewUser: isNewUserFlag === 'true'
    };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      forceCleanAuth,
      isNewUser, 
      setIsNewUser: updateIsNewUser,
      handleTokenExpiration,
      registerNavigation,
      checkStorageStatus // Exponemos el nuevo método
    }}>
      {children}
    </AuthContext.Provider>
  );
};
