import React, { useEffect, useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ActivityScreen.styles';
import { getActivities } from '../service/ActivityService';
import { AuthContext } from '../contexts/AuthContext';
// Añadimos requestPermission
import { 
  initialize, 
  requestPermission,
  readRecords,
  getSupportedHealthConnectDataTypes,
  writeRecords
} from 'react-native-health-connect';

const ActivityScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [healthConnectData, setHealthConnectData] = useState({
    steps: [],
    calories: [],
    exercises: []
  });
  const [healthConnectAvailable, setHealthConnectAvailable] = useState(false);
  const [isLoadingHealthData, setIsLoadingHealthData] = useState(false);
  const { token } = useContext(AuthContext);

  // Inicializar Health Connect y solicitar permisos
  useEffect(() => {
    initializeHealthConnect();
  }, []);

  // Obtener actividades del backend
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        getActivities(token)
          .then(data => {
            setActivities(data);
          })
          .catch(error => {
            console.error('Error fetching activities:', error);
          });
      }
    }, [token])
  );

  // Inicializar Health Connect
  const initializeHealthConnect = async () => {
    try {
      const isInitialized = await initialize();
      setHealthConnectAvailable(isInitialized);
      
      if (isInitialized) {
        // Solicitar todos los permisos necesarios
        const permissions = await requestPermission([
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
          { accessType: 'read', recordType: 'ExerciseSession' },
          { accessType: 'write', recordType: 'ExerciseSession' }
        ]);
        
        if (permissions.length > 0) {
          // Si tenemos permisos, leer datos
          fetchHealthData();
        }
      }
    } catch (error) {
      console.error('Error al inicializar Health Connect:', error);
      setHealthConnectAvailable(false);
    }
  };

  // Obtener datos de Health Connect
  const fetchHealthData = async () => {
    try {
      setIsLoadingHealthData(true);
      
      // Definir periodo de tiempo (últimos 30 días)
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const timeFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime,
          endTime,
        }
      };
      
      // Leer pasos
      try {
        const stepsData = await readRecords('Steps', timeFilter);
        if (stepsData && stepsData.records) {
          setHealthConnectData(prev => ({...prev, steps: stepsData.records}));
        }
      } catch (error) {
        console.log('Error al leer pasos:', error);
      }
      
      // Leer calorías
      try {
        const caloriesData = await readRecords('ActiveCaloriesBurned', timeFilter);
        if (caloriesData && caloriesData.records) {
          setHealthConnectData(prev => ({...prev, calories: caloriesData.records}));
        }
      } catch (error) {
        console.log('Error al leer calorías:', error);
      }
      
      // Leer ejercicios
      try {
        const exerciseData = await readRecords('ExerciseSession', timeFilter);
        if (exerciseData && exerciseData.records) {
          setHealthConnectData(prev => ({...prev, exercises: exerciseData.records}));
        }
      } catch (error) {
        console.log('Error al leer ejercicios:', error);
      }
      
    } catch (error) {
      console.error('Error al obtener datos de salud:', error);
    } finally {
      setIsLoadingHealthData(false);
    }
  };

  // Crear una nueva sesión de ejercicio
  const createExerciseSession = async () => {
    try {
      // Crear datos de ejercicio
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      const exerciseData = {
        recordType: 'ExerciseSession',
        startTime: thirtyMinutesAgo.toISOString(),
        endTime: now.toISOString(),
        exerciseType: 'RUNNING',
        title: 'Carrera de prueba',
        notes: 'Creado desde mi aplicación'
      };
      
      // Escribir el registro
      await writeRecords([exerciseData]);
      
      // Actualizar datos
      fetchHealthData();
      
      Alert.alert(
        "Ejercicio registrado", 
        "Se ha registrado correctamente tu sesión de ejercicio"
      );
    } catch (error) {
      console.error('Error al crear ejercicio:', error);
      Alert.alert("Error", "No se pudo registrar el ejercicio");
    }
  };

  // Renderizar tarjeta de datos de Health Connect
  const renderHealthConnectDataCard = () => {
    if (!healthConnectAvailable) {
      return (
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Health Connect</Text>
          <Text style={styles.metricValue}>No disponible</Text>
          <Text>Para usar esta función, necesitas instalar Health Connect desde Google Play.</Text>
        </Card>
      );
    }
    
    if (isLoadingHealthData) {
      return (
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Health Connect</Text>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Cargando datos de salud...</Text>
        </Card>
      );
    }
    
    return (
      <>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Resumen de Health Connect</Text>
          <Text style={styles.metricValue}>Datos de los últimos 30 días</Text>
          <Button 
            title="Actualizar datos" 
            onPress={fetchHealthData} 
          />
        </Card>
        
        {healthConnectData.steps.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.metricTitle}>Pasos</Text>
            <Text style={styles.metricValue}>
              {healthConnectData.steps.reduce((total, step) => total + step.count, 0)} pasos totales
            </Text>
            <Text>Registros: {healthConnectData.steps.length}</Text>
          </Card>
        )}
        
        {healthConnectData.calories.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.metricTitle}>Calorías Activas</Text>
            <Text style={styles.metricValue}>
              {healthConnectData.calories.reduce((total, cal) => 
                total + (cal.energy?.inKilocalories || 0), 0).toFixed(0)} kcal
            </Text>
            <Text>Registros: {healthConnectData.calories.length}</Text>
          </Card>
        )}
        
        {healthConnectData.exercises.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.metricTitle}>Ejercicios</Text>
            <Text style={styles.metricValue}>{healthConnectData.exercises.length} sesiones</Text>
            {healthConnectData.exercises.slice(0, 3).map((exercise, index) => (
              <Text key={index}>
                {exercise.title || exercise.exerciseType}: {formatDuration(exercise.startTime, exercise.endTime)}
              </Text>
            ))}
            {healthConnectData.exercises.length > 3 && (
              <Text>Y {healthConnectData.exercises.length - 3} más...</Text>
            )}
          </Card>
        )}
        
        <Button
          title="Registrar nueva sesión de ejercicio"
          onPress={createExerciseSession}
        />
      </>
    );
  };

  // Función auxiliar para formatear la duración
  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    return `${minutes} min`;
  };

  return (
    <View style={styles.container}>
      <Header title="Actividad Física" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {renderHealthConnectDataCard()}
        
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Mis Actividades</Text>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.activityType}>{activity.type}</Text>
                <Text>Duración: {activity.duration} min</Text>
                <Text>Fecha: {new Date(activity.date).toLocaleDateString()}</Text>
                <Text>Descripción: {activity.description}</Text>
              </View>
            ))
          ) : (
            <Text>No hay actividades registradas.</Text>
          )}
        </Card>
        
        <Button
          title="Crear nueva actividad manualmente"
          onPress={() => navigation.navigate('CreateActivityScreen')}
        />
      </ScrollView>
      <Footer />
    </View>
  );
};

export default ActivityScreen;

