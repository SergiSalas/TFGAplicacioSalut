import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  AppState,
  StatusBar,
  Alert,
  Image
} from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from '../styles/screens/HomeScreen.styles';
import healthConnectService from '../service/HealthConnectService';
import { getDailyObjective } from '../service/ActivityService';
import { getUserProfile, getUserLevel } from '../service/UserService';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSleepData } from '../hooks/useSleepData';
import NotificationService from '../services/NotificationService';

const HealthConnectSummary = ({ todaySteps, heartRate, navigation }) => (
  <View style={styles.statsCard}>
    <View style={styles.statsContainer}>
      <View style={styles.cardHeader}>
        <Icon name="analytics-outline" size={20} color="#61dafb" />
        <Text style={styles.statsTitle}>Resumen de Actividad</Text>
      </View>

      <View style={styles.metricsContainer}>
        <View style={[styles.metricCard, { backgroundColor: '#232342' }]}>
          <Icon name="footsteps-outline" size={28} color="#4a69bd" />
          <Text style={styles.metricValue}>{todaySteps}</Text>
          <Text style={styles.metricLabel}>Pasos</Text>
        </View>

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
          <Icon
            name="arrow-forward-outline"
            size={18}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [healthConnectAvailable, setHealthConnectAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todaySteps, setTodaySteps] = useState(0);
  const [heartRate, setHeartRate] = useState(null);
  const [dailyObjective, setDailyObjective] = useState(10000);
  const [appState, setAppState] = useState(AppState.currentState);
  const [healthData, setHealthData] = useState(null);
  const { sleepData, loading: sleepLoading } = useSleepData();
  const [userProfile, setUserProfile] = useState(null);
  const [userLevel, setUserLevel] = useState(null);

  const handleHealthConnectUpdate = useCallback((data) => {
    if (data.type === 'today-steps' && data.steps !== undefined) {
      setTodaySteps(data.steps);
    }
    if (data.type === 'heart-rate' && data.heartRate !== undefined) {
      setHeartRate(data.heartRate);
    }
    if (data) {
      setHealthData(prev => ({
        ...prev,
        steps: data.steps,
        heartRate: data.heartRate,
        sleep: data.sleep,
      }));
    }
  }, []);

  const initializeHealthConnect = useCallback(async () => {
    try {
      setLoading(true);
      const isInitialized = await healthConnectService.initialize(token);
      setHealthConnectAvailable(isInitialized);
      if (isInitialized) {
        healthConnectService.addListener(handleHealthConnectUpdate);
        const currentData = await healthConnectService.getCurrentData();
        if (currentData?.steps !== undefined) setTodaySteps(currentData.steps);
        if (currentData?.heartRate !== undefined) setHeartRate(currentData.heartRate);
        if (currentData?.sleep !== undefined) {
          setHealthData(prev => ({ ...prev, sleep: currentData.sleep }));
        }
      }
    } catch (e) {
      console.error('Error al inicializar Health Connect:', e);
    } finally {
      setLoading(false);
    }
  }, [token, handleHealthConnectUpdate]);

  const refreshHealthData = useCallback(async () => {
    if (!healthConnectAvailable) return;
    try {
      setLoading(true);
      await healthConnectService.requestUpdate('HomeScreen');
    } catch (e) {
      console.error('Error refreshing health data:', e);
    } finally {
      setLoading(false);
    }
  }, [healthConnectAvailable]);

  useEffect(() => {
    initializeHealthConnect();
    return () => {
      healthConnectService.removeListener(handleHealthConnectUpdate);
    };
  }, [initializeHealthConnect, handleHealthConnectUpdate]);

  useEffect(() => {
    healthConnectService.registerActiveScreen('HomeScreen', { priority: 'high' });

    const interval = appState === 'active' ? 60000 : 180000;
    const timer = setInterval(() => {
      if (healthConnectAvailable && appState === 'active') {
        healthConnectService.requestSilentUpdate('HomeScreen');
      }
    }, interval);

    const sub = AppState.addEventListener('change', next => {
      if (appState.match(/inactive|background/) && next === 'active') {
        setAppState(next);
        if (healthConnectAvailable) {
          healthConnectService.requestUpdate('HomeScreen');
        }
      } else if (appState === 'active' && next.match(/inactive|background/)) {
        setAppState(next);
      }
    });

    return () => {
      clearInterval(timer);
      sub.remove();
      healthConnectService.unregisterActiveScreen('HomeScreen');
    };
  }, [healthConnectAvailable, appState]);

  const loadUserProfile = async () => {
    if (!token) return;
    try {
      const profile = await getUserProfile(token);
      setUserProfile(profile);
    } catch (e) {
      console.error('Error al cargar perfil:', e);
    }
  };

  const loadUserLevel = async () => {
    if (!token) return;
    try {
      const level = await getUserLevel(token);
      setUserLevel(level);
    } catch (e) {
      console.error('Error al cargar nivel del usuario:', e);
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadUserLevel();
  }, [token]);

  const handleRefresh = () => {
    refreshHealthData();
    loadUserProfile();
    loadUserLevel();
  };

  const renderSleepCard = () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('SleepScreen')}
      style={styles.statsCard}
      activeOpacity={0.7}
    >
      <View style={styles.statsContainer}>
        <View style={styles.cardHeader}>
          <Icon name="bed-outline" size={20} color="#61dafb" />
          <Text style={styles.statsTitle}>Calidad del Sueño</Text>
        </View>

        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, { backgroundColor: '#232342' }]}>
            <Icon name="moon-outline" size={28} color="#4a69bd" />
            <Text style={styles.metricValue}>
              {sleepLoading ? '...' : (sleepData?.durationHours || '--')}
            </Text>
            <Text style={styles.metricLabel}>Horas</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#232342' }]}>
            <Icon name="star-outline" size={28} color="#ff6b6b" />
            <Text style={styles.metricValue}>
              {sleepLoading ? '...' : (sleepData?.quality || '--')}
            </Text>
            <Text style={styles.metricLabel}>Calidad</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SleepScreen')}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Ver detalles</Text>
            <Icon
              name="arrow-forward-outline"
              size={18}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Reemplazamos el header inline por nuestro componente */}
      <Header
        title="Mi Salud"
        navigation={navigation}
        userProfile={userProfile}
        userLevel={userLevel}
        onRefresh={handleRefresh}
      />

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <HealthConnectSummary
          todaySteps={todaySteps}
          heartRate={heartRate}
          navigation={navigation}
        />
        {renderSleepCard()}
      </ScrollView>

      {/* Footer */}
      <Footer
        activeScreen="home"
        navigation={navigation}
        screens={[
          { name: 'home', icon: 'home-outline', label: 'Inicio' },
          { name: 'activity', icon: 'fitness-outline', label: 'Actividad' },
          { name: 'sleep', icon: 'bed-outline', label: 'Sueño' },
          { name: 'profile', icon: 'person-outline', label: 'Perfil' }
        ]}
      />
    </View>
  );
};

export default HomeScreen;
