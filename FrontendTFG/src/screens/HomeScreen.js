import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity, AppState, StatusBar } from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from '../styles/screens/HomeScreen.styles';
import healthConnectService from '../service/HealthConnectService';
import { getDailyObjective } from '../service/ActivityService';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeScreen = ({ navigation }) => {
  const { token, user } = useContext(AuthContext);
  const [healthConnectAvailable, setHealthConnectAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todaySteps, setTodaySteps] = useState(0);
  const [heartRate, setHeartRate] = useState(null);
  const [dailyObjective, setDailyObjective] = useState(10000);
  const [objectiveLoaded, setObjectiveLoaded] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeHealthConnect();
    
    // Limpiar el listener cuando el componente se desmonta
    return () => {
      healthConnectService.removeListener(handleHealthConnectUpdate);
    };
  }, []);

  useEffect(() => {
    if (token) {
      getDailyObjective(token)
        .then(objective => {
          setDailyObjective(objective);
          setObjectiveLoaded(true);
        })
        .catch(error => {
          console.error('Error al obtener objetivo diario:', error);
          setObjectiveLoaded(true);
        });
    }
  }, [token]);

  // Nuevo manejador para actualizaciones del servicio
  const handleHealthConnectUpdate = (data) => {
    console.log('HomeScreen: Actualización recibida de Health Connect:', data);
    
    if (data.type === 'today-steps' && data.steps !== undefined) {
      setTodaySteps(data.steps);
    }
    
    if (data.type === 'heart-rate' && data.heartRate !== undefined) {
      console.log('HomeScreen: Actualizando ritmo cardíaco a:', data.heartRate);
      setHeartRate(data.heartRate);
    }
  };

  // Modificar para usar el servicio
  const initializeHealthConnect = async () => {
    try {
      setLoading(true);
      
      // Inicializar el servicio con el token
      const isInitialized = await healthConnectService.initialize(token);
      setHealthConnectAvailable(isInitialized);
      
      if (isInitialized) {
        // Agregar listener para actualizaciones
        healthConnectService.addListener(handleHealthConnectUpdate);
        
        // Obtener datos actuales de Health Connect
        const currentData = await healthConnectService.getCurrentData();
        if (currentData) {
          if (currentData.steps !== undefined) {
            setTodaySteps(currentData.steps);
          }
          if (currentData.heartRate !== undefined) {
            setHeartRate(currentData.heartRate);
          }
        }
      }
    } catch (error) {
      console.error('Error al inicializar Health Connect:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modificar esta función para usar el servicio
  const fetchTodayHealthData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos actuales mediante el servicio
      const currentData = await healthConnectService.getCurrentData();
      if (currentData) {
        if (currentData.steps !== undefined) {
          setTodaySteps(currentData.steps);
        }
        if (currentData.heartRate !== undefined) {
          setHeartRate(currentData.heartRate);
        }
      }
    } catch (error) {
      console.error('Error al obtener datos de salud:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nuevo método para forzar actualización manual
  const refreshHealthData = async () => {
    try {
      setLoading(true);
      // Usar una única llamada al servicio en lugar de múltiples
      const updatedData = await healthConnectService.syncWithHealthConnect(true);
      
      // Actualizar los estados solo si hay cambios reales
      if (updatedData) {
        if (updatedData.steps !== undefined && updatedData.steps !== todaySteps) {
          setTodaySteps(updatedData.steps);
        }
        if (updatedData.heartRate !== undefined && updatedData.heartRate !== heartRate) {
          setHeartRate(updatedData.heartRate);
        }
      }
    } catch (error) {
      console.error('Error refreshing health data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Registro de pantalla activa y actualización continua
  useEffect(() => {
    // 1. Registrar esta pantalla como activa de forma más eficiente
    healthConnectService.registerActiveScreen('HomeScreen');
    
    // 2. Reducir la frecuencia de actualización para mejorar rendimiento
    const updateTimer = setInterval(() => {
      if (healthConnectAvailable && appState === 'active') {
        // Solicitar datos solo si la aplicación está en primer plano
        healthConnectService.getCurrentData()
          .then(data => {
            if (data) {
              // Actualizar estados solo si cambiaron para evitar re-renders
              if (data.steps !== undefined && data.steps !== todaySteps) {
                setTodaySteps(data.steps);
              }
              if (data.heartRate !== undefined && data.heartRate !== heartRate) {
                setHeartRate(data.heartRate);
              }
            }
          })
          .catch(error => {
            console.error('Error en actualización periódica:', error);
          });
      }
    }, 30000); // Cambiar a 30 segundos en lugar de 8 segundos
    
    // 3. Gestionar cambios de estado de la aplicación de forma más eficiente
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      // Solo actualizar el estado cuando realmente cambia para reducir re-renders
      if (appState !== nextAppState) {
        setAppState(nextAppState);
        
        // Actualizar solo cuando la app vuelve a primer plano, no en cada cambio
        if (nextAppState === 'active' && appState !== 'active' && healthConnectAvailable) {
          console.log('App vuelve a primer plano - actualizando datos');
          healthConnectService.requestImmediateUpdate();
        }
      }
    });
    
    // Limpieza al desmontar
    return () => {
      clearInterval(updateTimer);
      appStateSubscription.remove();
      healthConnectService.unregisterActiveScreen('HomeScreen');
    };
  }, [healthConnectAvailable, appState, todaySteps, heartRate]);

  // Componente para el recuadro de Health Connect
  const HealthConnectSummary = () => {
    return (
      <View style={styles.statsCard}>
        <View style={styles.statsContainer}>
          <View style={styles.cardHeader}>
            <Icon name="analytics-outline" size={20} color="#61dafb" />
            <Text style={styles.statsTitle}>Resumen de Actividad</Text>
          </View>
          
          <View style={styles.metricsContainer}>
            {/* Pasos */}
            <View style={[styles.metricCard, { backgroundColor: '#232342' }]}>
              <Icon name="footsteps-outline" size={28} color="#4a69bd" />
              <Text style={styles.metricValue}>{todaySteps}</Text>
              <Text style={styles.metricLabel}>Pasos</Text>
            </View>
            
            {/* Ritmo cardíaco */}
            <View style={[styles.metricCard, { backgroundColor: '#232342' }]}>
              <Icon name="heart-outline" size={28} color="#ff6b6b" />
              <Text style={styles.metricValue}>{heartRate || '--'}</Text>
              <Text style={styles.metricLabel}>BPM</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('ActivityScreen')}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Ver detalles</Text>
              <Icon name="arrow-forward-outline" size={18} color="#fff" style={{marginLeft: 8}} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header con nuevo estilo */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inicio</Text>
        <TouchableOpacity onPress={() => refreshHealthData()} style={styles.refreshButton}>
          <Icon name="refresh-outline" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity 
          style={styles.statsCard} 
          onPress={() => navigation.navigate('ActivityScreen')}
          activeOpacity={0.7}
        >
          <HealthConnectSummary />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, {marginBottom: 20}]} 
          onPress={() => navigation.navigate('ActivityScreen')}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Ir a Actividad Física</Text>
            <Icon name="fitness-outline" size={20} color="#fff" style={{marginLeft: 8}} />
          </View>
        </TouchableOpacity>
        
        {/* Aquí puedes añadir más cards o secciones */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="information-circle-outline" size={20} color="#61dafb" />
            <Text style={styles.cardTitle}>Bienvenido</Text>
          </View>
          <Text style={styles.cardText}>
            Revisa tu actividad física diaria y mantente en forma.
          </Text>
        </Card>
      </ScrollView>
      
      <Footer />
    </View>
  );
};

export default HomeScreen;
