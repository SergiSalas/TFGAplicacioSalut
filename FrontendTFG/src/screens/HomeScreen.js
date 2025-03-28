import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
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

// En lugar de useMemo, crear un componente separado
const HealthConnectSummary = ({ todaySteps, heartRate, navigation }) => {
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

  // Usar useCallback para evitar recreaciones de funciones
  const handleHealthConnectUpdate = useCallback((data) => {
    console.log('HomeScreen: Actualización recibida de Health Connect:', data);
    
    if (data.type === 'today-steps' && data.steps !== undefined && data.steps !== todaySteps) {
      setTodaySteps(data.steps);
    }
    
    if (data.type === 'heart-rate' && data.heartRate !== undefined && data.heartRate !== heartRate) {
      console.log('HomeScreen: Actualizando ritmo cardíaco a:', data.heartRate);
      setHeartRate(data.heartRate);
    }
  }, [todaySteps, heartRate]);

  // Inicializar Health Connect solo una vez
  const initializeHealthConnect = useCallback(async () => {
    try {
      setLoading(true);
      
      // Inicializar el servicio con el token una sola vez
      const isInitialized = await healthConnectService.initialize(token);
      setHealthConnectAvailable(isInitialized);
      
      if (isInitialized) {
        // Registrar esta pantalla para recibir actualizaciones push
        healthConnectService.addListener(handleHealthConnectUpdate);
        
        // Solicitar datos iniciales
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
  }, [token, handleHealthConnectUpdate]);

  // Modificar para que sea más eficiente
  const refreshHealthData = useCallback(async () => {
    if (!healthConnectAvailable) return;
    
    try {
      setLoading(true);
      // Indicar al servicio que queremos una actualización completa pero sin forzar sincronización
      await healthConnectService.requestUpdate('HomeScreen');
    } catch (error) {
      console.error('Error refreshing health data:', error);
    } finally {
      setLoading(false);
    }
  }, [healthConnectAvailable]);

  // Efecto de inicialización - una sola vez
  useEffect(() => {
    initializeHealthConnect();
    
    return () => {
      healthConnectService.removeListener(handleHealthConnectUpdate);
    };
  }, [initializeHealthConnect, handleHealthConnectUpdate]);

  // Modificar completamente la gestión de actualizaciones periódicas
  useEffect(() => {
    // Registrar la pantalla como activa con prioridad alta
    healthConnectService.registerActiveScreen('HomeScreen', { priority: 'high' });
    
    // Configurar intervalo con frecuencia adaptativa según el estado de la app
    let updateInterval = appState === 'active' ? 60000 : 180000; // 1 min activo, 3 min en background
    
    const updateTimer = setInterval(() => {
      if (healthConnectAvailable && appState === 'active') {
        // Solicitar actualización silenciosa (sin loading indicator)
        healthConnectService.requestSilentUpdate('HomeScreen');
      }
    }, updateInterval);
    
    // Manejo más eficiente de cambios de estado de app
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App vuelve a primer plano - actualización inmediata
        console.log('App vuelve a primer plano - solicitando actualización');
        setAppState(nextAppState);
        if (healthConnectAvailable) {
          healthConnectService.requestUpdate('HomeScreen');
        }
      } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        // App va a segundo plano
        setAppState(nextAppState);
      }
    });
    
    return () => {
      clearInterval(updateTimer);
      appStateSubscription.remove();
      healthConnectService.unregisterActiveScreen('HomeScreen');
    };
  }, [healthConnectAvailable, appState]);

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
          <HealthConnectSummary 
            todaySteps={todaySteps} 
            heartRate={heartRate} 
            navigation={navigation}
          />
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
