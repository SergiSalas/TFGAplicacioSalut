import React, { useEffect, useContext } from 'react';
import { AppState } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import healthConnectService from '../service/HealthConnectService';
import ChallengeService from '../service/ChallengeService';

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
    
    // Generar desafíos automáticamente al iniciar la aplicación si el usuario está autenticado
    const generateChallenges = async () => {
      if (token) {
        try {
          console.log('Verificando y generando desafíos automáticamente...');
          // Obtener desafíos actuales
          const userChallenges = await ChallengeService.getUserChallenges(token);
          
          // Si no hay desafíos activos, generar nuevos automáticamente
          if (!userChallenges || userChallenges.length === 0) {
            console.log('No se encontraron desafíos, generando nuevos...');
            await ChallengeService.generateDailyChallenges(token);
            console.log('Desafíos generados correctamente');
          } else {
            console.log('Ya existen desafíos activos');
          }
        } catch (error) {
          console.error('Error al verificar o generar desafíos:', error);
        }
      }
    };
    
    // Ejecutar la generación de desafíos al iniciar
    generateChallenges();
    
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