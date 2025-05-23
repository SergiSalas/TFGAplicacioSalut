// /src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { registerUser, loginUser, verifyToken } from '../service/AuthService';
import { ActivityCache } from '../cache/ActivityCache';
import { appStorage, STORAGE_KEYS } from '../storage/AppStorage';
import { CommonActions } from '@react-navigation/native';
import { ProfileImageCache } from '../cache/ProfileImageCache';
import { SleepCache } from '../cache/SleepCache'; 

/**
 * Contexto de autenticación para gestionar el estado de la sesión del usuario.
 * Proporciona funciones para iniciar sesión, registrarse, cerrar sesión y gestionar el token.
 */
export const AuthContext = createContext();

/**
 * Proveedor del contexto de autenticación que encapsula la lógica de gestión de sesiones.
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [navigation, setNavigation] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  /**
   * Carga los datos de autenticación almacenados localmente.
   * Verifica la validez del token con el servidor y establece el estado de la sesión.
   */
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

  /**
   * Inicia sesión con email y contraseña.
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise} - Promesa que se resuelve cuando se completa el inicio de sesión.
   * @throws {Error} - Error si falla el inicio de sesión.
   */
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

  /**
   * Registra un nuevo usuario en el sistema.
   * @param {string} name - Nombre del usuario.
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<Object>} - Datos del usuario registrado.
   * @throws {Error} - Error si falla el registro.
   */
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

  /**
   * Cierra la sesión del usuario actual y limpia todas las cachés y datos almacenados.
   */
  const logout = () => {
    try {

      ProfileImageCache.clearCache();

      ActivityCache.clearAllCache();
      ActivityCache.clearSavedExerciseIds();
      ActivityCache.clearSavedStepIds();

      SleepCache.clearSavedSleepIds();
      SleepCache.clearSleepData();
      
      appStorage.delete(STORAGE_KEYS.AUTH_TOKEN);
      appStorage.delete(STORAGE_KEYS.USER_DATA);
      
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  /**
   * Maneja la expiración del token de autenticación.
   * Limpia los datos de sesión y redirige al usuario a la pantalla de inicio de sesión.
   */
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

  /**
   * Actualiza el estado de usuario nuevo.
   * @param {boolean} value - Nuevo valor para el estado de usuario nuevo.
   */
  const updateIsNewUser = (value) => {
    try {
      appStorage.set(STORAGE_KEYS.IS_NEW_USER, value.toString());
      setIsNewUser(value);
    } catch (error) {
      console.error('Error al guardar estado de usuario nuevo:', error);
    }
  };

  /**
   * Limpia por completo todos los datos de autenticación almacenados.
   * Útil para resolver problemas de sesión o forzar un cierre de sesión completo.
   */
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
      
      // Actualizar estado
      setToken(null);
      setUser(null);
      setIsNewUser(false);
      
      console.log('✅ Limpieza de autenticación completada');
    } catch (error) {
      console.error('Error durante la limpieza forzada:', error);
    }
  };

  /**
   * Registra el objeto de navegación para poder utilizarlo en redirecciones.
   * @param {Object} nav - Objeto de navegación de React Navigation.
   */
  const registerNavigation = (nav) => {
    console.log('Navegación registrada correctamente');
    setNavigation(nav);
  };

  /**
   * Comprueba y devuelve el estado actual del almacenamiento relacionado con la autenticación.
   * @returns {Object} - Objeto con el estado del almacenamiento (hasToken, hasUserData, isNewUser).
   */
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