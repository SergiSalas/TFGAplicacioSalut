import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import healthConnectService from '../service/HealthConnectService';

export function useHealthConnect() {
  const { token } = useContext(AuthContext);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [healthData, setHealthData] = useState({
    steps: 0,
    heartRate: null
  });

  useEffect(() => {
    let isMounted = true;

    const initializeHealthConnect = async () => {
      try {
        setIsLoading(true);
        const initialized = await healthConnectService.initialize(token);
        
        if (isMounted) {
          setIsAvailable(initialized);
          
          if (initialized) {
            // Registrar listener
            healthConnectService.addListener(handleDataUpdate);
            
            // Cargar datos iniciales
            const initialData = await healthConnectService.getCurrentData();
            updateHealthData(initialData);
          }
        }
      } catch (error) {
        console.error('Error al inicializar Health Connect:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeHealthConnect();

    // Limpiar al desmontar
    return () => {
      isMounted = false;
      healthConnectService.removeListener(handleDataUpdate);
    };
  }, [token]);

  // Manejador de actualizaciones
  const handleDataUpdate = (data) => {
    updateHealthData(data);
  };

  // Actualizar datos de salud
  const updateHealthData = (data) => {
    if (!data) return;

    setHealthData(prevData => {
      const newData = { ...prevData };
      
      // Actualizar pasos si están disponibles
      if (data.steps !== undefined) {
        newData.steps = data.steps;
      } else if (data.type === 'today-steps' && data.steps !== undefined) {
        newData.steps = data.steps;
      }
      
      // Actualizar ritmo cardíaco si está disponible
      if (data.heartRate !== undefined) {
        newData.heartRate = data.heartRate;
      } else if (data.type === 'heart-rate' && data.heartRate !== undefined) {
        newData.heartRate = data.heartRate;
      }
      
      return newData;
    });
  };

  // Forzar actualización de datos
  const refreshHealthData = async () => {
    try {
      setIsLoading(true);
      await healthConnectService.syncWithHealthConnect(true);
      const freshData = await healthConnectService.getCurrentData();
      updateHealthData(freshData);
    } catch (error) {
      console.error('Error al actualizar datos de salud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAvailable,
    isLoading,
    healthData,
    refreshHealthData
  };
} 