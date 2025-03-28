import React, { useEffect, useContext } from 'react';
import { AppState } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import healthConnectService from '../service/HealthConnectService';

const AppContent = ({ children }) => {
  const { token } = useContext(AuthContext);

  useEffect(() => {
    let syncInterval;
    
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && token) {
        console.log('App volvió a primer plano, sincronizando...');
        healthConnectService.initialize(token)
          .then(initialized => {
            if (initialized) {
              return healthConnectService.syncWithHealthConnect();
            }
          })
          .catch(error => {
            console.error('Error al sincronizar al volver a primer plano:', error);
          });
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    if (token) {
      syncInterval = setInterval(() => {
        console.log('Ejecutando sincronización programada con Health Connect');
        healthConnectService.initialize(token)
          .then(initialized => {
            if (initialized) {
              return healthConnectService.syncWithHealthConnect();
            }
          })
          .catch(error => {
            console.error('Error en sincronización programada:', error);
          });
      }, 60 * 60 * 1000);
    }
    
    return () => {
      subscription.remove();
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [token]);

  return children;
};

export default AppContent; 