import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from '../styles/screens/HomeScreen.styles';
import { 
  initialize, 
  requestPermission,
  readRecords
} from 'react-native-health-connect';
import { getDailyObjective } from '../service/ActivityService';
import { AuthContext } from '../contexts/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [healthConnectAvailable, setHealthConnectAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todaySteps, setTodaySteps] = useState(0);
  const [heartRate, setHeartRate] = useState(null);
  const [dailyObjective, setDailyObjective] = useState(10000);
  const [objectiveLoaded, setObjectiveLoaded] = useState(false);

  useEffect(() => {
    initializeHealthConnect();
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

  const initializeHealthConnect = async () => {
    try {
      setLoading(true);
      const isInitialized = await initialize();
      setHealthConnectAvailable(isInitialized);
      
      if (isInitialized) {
        // Solicitar permisos necesarios para la Home
        const permissions = await requestPermission([
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'HeartRate' }
        ]);
        
        if (permissions.length > 0) {
          // Obtener datos para el día actual
          fetchTodayHealthData();
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al inicializar Health Connect:', error);
      setLoading(false);
    }
  };

  const fetchTodayHealthData = async () => {
    try {
      // Definir periodo para hoy (desde las 00:00 hasta ahora)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const timeFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: today.toISOString(),
          endTime: now.toISOString(),
        }
      };
      
      // Leer pasos de hoy
      try {
        const stepsData = await readRecords('Steps', timeFilter);
        if (stepsData && stepsData.records) {
          // Sumar todos los pasos del día
          const totalSteps = stepsData.records.reduce(
            (total, step) => total + step.count, 0
          );
          setTodaySteps(totalSteps);
        }
      } catch (error) {
        console.log('Error al leer pasos:', error);
      }
      
      // Leer frecuencia cardíaca más reciente
      try {
        const heartRateData = await readRecords('HeartRate', {
          ...timeFilter,
          limit: 1,
          ascendingOrder: false // Para obtener el más reciente primero
        });
        
        if (heartRateData && heartRateData.records && heartRateData.records.length > 0) {
          // Obtener el valor más reciente
          setHeartRate(heartRateData.records[0].samples[0].beatsPerMinute);
        }
      } catch (error) {
        console.log('Error al leer frecuencia cardíaca:', error);
      }
      
    } catch (error) {
      console.error('Error al obtener datos de salud:', error);
    } finally {
      setLoading(false);
    }
  };

  // Componente para el recuadro de Health Connect
  const HealthConnectSummary = () => {
    if (!healthConnectAvailable) {
      return (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Monitoreo de Salud</Text>
          <Text style={styles.cardText}>
            Para ver tus datos de actividad, instala Health Connect desde Google Play.
          </Text>
          <Button
            title="Ver Detalles"
            onPress={() => navigation.navigate('ActivityScreen')}
          />
        </Card>
      );
    }

    if (loading) {
      return (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Cargando datos de salud</Text>
          <ActivityIndicator size="large" color="#0000ff" style={{marginVertical: 20}} />
        </Card>
      );
    }

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('ActivityScreen')}
        activeOpacity={0.7}
      >
        <Card style={styles.healthCard}>
          <Text style={styles.cardTitle}>Resumen de Actividad Hoy</Text>
          
          <View style={styles.healthMetricsContainer}>
            <View style={styles.healthMetric}>
              <Text style={styles.metricValue}>{todaySteps}</Text>
              <Text style={styles.metricTitle}>Pasos</Text>
              {objectiveLoaded && (
                <Text style={styles.metricSubtitle}>
                  {Math.round((todaySteps / dailyObjective) * 100)}% de {dailyObjective}
                </Text>
              )}
            </View>
            
            {heartRate && (
              <View style={styles.healthMetric}>
                <Text style={styles.metricValue}>{heartRate}</Text>
                <Text style={styles.metricTitle}>Pulso</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.cardText}>
            Toca para ver todos tus datos de actividad física
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Inicio" />
      <ScrollView contentContainerStyle={styles.content}>
        <HealthConnectSummary />
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Bienvenido a la App de Salud</Text>
          <Text style={styles.cardText}>
            Aquí podrás monitorizar tu actividad física, calidad del sueño y tu hidratación.
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              title="Actividad"
              onPress={() => navigation.navigate('ActivityScreen')}
            />
            <Button
              title="Sueño"
              onPress={() => navigation.navigate('SleepScreen')}
            />
          </View>
        </Card>
      </ScrollView>
      <Footer />
    </View>
  );
};

export default HomeScreen;
