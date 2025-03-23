import React, { useEffect, useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ActivityScreen.styles';
import { getActivities, getDailyObjective } from '../service/ActivityService';
import { AuthContext } from '../contexts/AuthContext';
import { 
  initialize, 
  requestPermission,
  readRecords
} from 'react-native-health-connect';
import * as Progress from 'react-native-progress';
import { 
  getExerciseTypeName, 
  getExerciseTypeIcon, 
  getExerciseTypeColor 
} from '../utils/ExerciseTypeMapper';

const ActivityScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [healthConnectData, setHealthConnectData] = useState({
    steps: [],
    calories: [],
    exercises: []
  });
  const [healthConnectAvailable, setHealthConnectAvailable] = useState(false);
  const [isLoadingHealthData, setIsLoadingHealthData] = useState(false);
  const [dailyObjective, setDailyObjective] = useState(10000);
  const [objectiveLoaded, setObjectiveLoaded] = useState(false);
  const [todaySteps, setTodaySteps] = useState(0);
  const { token } = useContext(AuthContext);
  
  useEffect(() => {
    initializeHealthConnect();
    fetchDailyObjective();
  }, []);

  // Función para obtener el objetivo diario
  const fetchDailyObjective = async () => {
    try {
      if (token) {
        const objective = await getDailyObjective(token);
        if (objective) {
          setDailyObjective(objective);
          setObjectiveLoaded(true);
        }
      }
    } catch (error) {
      console.error('Error al obtener el objetivo diario:', error);
    }
  };

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

  // Función para obtener datos de Health Connect
  const fetchHealthData = async () => {
    try {
      setIsLoadingHealthData(true);
      
      // Definir periodo (últimos 30 días)
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      // Periodo para hoy (para pasos de hoy)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const timeFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: thirtyDaysAgo.toISOString(),
          endTime: now.toISOString(),
        }
      };
      
      const todayFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: today.toISOString(),
          endTime: now.toISOString(),
        }
      };
      
      // Leer sesiones de ejercicio
      const exerciseSessions = await readRecords('ExerciseSession', timeFilter);
      
      // Leer pasos (total)
      const stepsData = await readRecords('Steps', timeFilter);
      
      // Leer pasos de hoy
      const todayStepsData = await readRecords('Steps', todayFilter);
      
      // Calcular pasos totales de hoy
      const stepsToday = todayStepsData && todayStepsData.records 
        ? todayStepsData.records.reduce((sum, step) => sum + step.count, 0) 
        : 0;
      
      setTodaySteps(stepsToday);
      
      // Actualizar datos de Health Connect
      if (exerciseSessions && exerciseSessions.records) {
        setHealthConnectData(prevData => ({
          ...prevData,
          exercises: exerciseSessions.records
        }));
      }
      
      if (stepsData && stepsData.records) {
        setHealthConnectData(prevData => ({
          ...prevData,
          steps: stepsData.records
        }));
      }
    } catch (error) {
      console.error('Error al obtener datos de Health Connect:', error);
    } finally {
      setIsLoadingHealthData(false);
    }
  };

  // Renderiza el contenido de Health Connect
  const renderHealthConnectDataCard = () => {
    if (!healthConnectAvailable) {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="fitness-outline" size={24} color="#61dafb" />
            <Text style={styles.cardTitle}>Health Connect</Text>
          </View>
          <Text style={styles.cardText}>
            Para ver tus datos de actividad, instala Health Connect desde Google Play.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => {/* Código para abrir Google Play */}}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Abrir Google Play</Text>
              <Icon name="arrow-forward-outline" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="pulse-outline" size={24} color="#61dafb" />
          <Text style={styles.cardTitle}>Resumen de Salud</Text>
        </View>
        
        {isLoadingHealthData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#61dafb" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Icon name="footsteps-outline" size={30} color="#4a69bd" />
              <Text style={styles.metricValue}>
                {todaySteps}
              </Text>
              <Text style={styles.metricLabel}>Pasos hoy</Text>
              
              {objectiveLoaded && (
                <View style={styles.progressContainer}>
                  <Progress.Bar
                    progress={Math.min(todaySteps / dailyObjective, 1)}
                    width={null}
                    height={8}
                    borderRadius={4}
                    color="#4a69bd"
                    unfilledColor="rgba(255,255,255,0.2)"
                    borderWidth={0}
                    animated={true}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressText}>
                    {Math.round((todaySteps / dailyObjective) * 100)}% de {dailyObjective}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.metricItem}>
              <Icon name="flame-outline" size={30} color="#ff6b6b" />
              <Text style={styles.metricValue}>
                {healthConnectData.calories.length > 0 ? 
                  Math.round(healthConnectData.calories.reduce((sum, cal) => sum + cal.energy.inKilocalories, 0)) : 
                  '--'}
              </Text>
              <Text style={styles.metricLabel}>Calorías</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Icon name="bicycle-outline" size={30} color="#1dd1a1" />
              <Text style={styles.metricValue}>
                {allActivities.length || '--'}
              </Text>
              <Text style={styles.metricLabel}>Ejercicios</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Combina actividades manuales y sesiones de ejercicio de Health Connect
  const allActivities = [...activities];
  
  // Convierte los ejercicios de Health Connect al formato de actividades
  if (healthConnectData.exercises && healthConnectData.exercises.length > 0) {
    const healthConnectActivities = healthConnectData.exercises.map(exercise => {
      // Siempre usar tipo de ejercicio como título prioritario
      let activityTitle = "Ejercicio";
      
      // Intentar obtener y formatear el tipo de ejercicio
      if (exercise.exerciseType && typeof exercise.exerciseType === 'number') {
        // Usar nuestro nuevo mapper para obtener el nombre en español
        activityTitle = getExerciseTypeName(exercise.exerciseType);
      } 
      // SOLO si no hay tipo de ejercicio, verificar si hay información en el campo title
      else if (exercise.title && exercise.title.trim() !== '') {
        // Intentar determinar el tipo de ejercicio basado en el título
        const lowerTitle = exercise.title.toLowerCase();
        
        if (lowerTitle.includes('correr') || lowerTitle.includes('running')) {
          activityTitle = 'Carrera';
        } else if (lowerTitle.includes('caminar') || lowerTitle.includes('walking')) {
          activityTitle = 'Caminata';
        } else if (lowerTitle.includes('ciclismo') || lowerTitle.includes('cycling') || lowerTitle.includes('bici')) {
          activityTitle = 'Ciclismo';
        } else if (lowerTitle.includes('natación') || lowerTitle.includes('swimming')) {
          activityTitle = 'Natación';
        } else if (lowerTitle.includes('fútbol') || lowerTitle.includes('football') || lowerTitle.includes('soccer')) {
          activityTitle = 'Fútbol';
        } else {
          // Si no podemos determinar el tipo, usar el título tal cual
          activityTitle = exercise.title;
        }
      }
      
      // Calcular duración en minutos a partir de startTime y endTime si duration no es válida
      let durationMinutes = null;
      if (exercise.duration && !isNaN(exercise.duration)) {
        durationMinutes = Math.round(exercise.duration / 60000000); // nanosegundos a minutos
      } else if (exercise.startTime && exercise.endTime) {
        const start = new Date(exercise.startTime);
        const end = new Date(exercise.endTime);
        durationMinutes = Math.round((end - start) / 60000); // milisegundos a minutos
      }
      
      // Usar las notas como descripción si están disponibles
      const description = exercise.notes && exercise.notes.trim() !== '' 
        ? exercise.notes 
        : `Sesión de ${activityTitle.toLowerCase()} registrada con Health Connect`;
      
      return {
        id: exercise.metadata ? exercise.metadata.id : `hc-${Date.now()}-${Math.random()}`,
        type: activityTitle,
        duration: durationMinutes,
        date: exercise.startTime,
        description: description,
        source: "Health Connect",
        calories: exercise.calories ? Math.round(exercise.calories) : null,
      };
    });
    
    allActivities.push(...healthConnectActivities);
  }
  
  // Ordena todas las actividades por fecha (más recientes primero)
  allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Obtener el icono correcto para cada tipo de actividad
  const getActivityIcon = (type) => {
    return getExerciseTypeIcon(type);
  };

  // Obtener un color para cada tipo de actividad
  const getActivityColor = (type) => {
    return getExerciseTypeColor(type);
  };

  // Renderizar cada actividad
  const renderActivityItem = (activity, index) => {
    const activityIcon = getActivityIcon(activity.type);
    const activityColor = getActivityColor(activity.type);
    const date = new Date(activity.date);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View 
        key={activity.id || index}
        style={styles.activityItem}
      >
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <View style={[styles.iconContainer, {backgroundColor: activityColor}]}>
              <Icon name={activityIcon} size={24} color="#fff" />
            </View>
            <View style={styles.activityTitleContainer}>
              <Text style={styles.activityType}>{activity.type}</Text>
              <Text style={styles.activityDate}>
                {formattedDate} • {formattedTime}
              </Text>
            </View>
          </View>
          
          <View style={styles.activityDetails}>
            <View style={styles.activityStat}>
              <Icon name="time-outline" size={16} color="#61dafb" />
              <Text style={styles.activityStatText}>
                {activity.duration ? `${activity.duration} min` : 'No disponible'}
              </Text>
            </View>
            
            {activity.calories && (
              <View style={styles.activityStat}>
                <Icon name="flame-outline" size={16} color="#ff6b6b" />
                <Text style={styles.activityStatText}>
                  {activity.calories} kcal
                </Text>
              </View>
            )}
            
            {activity.source && (
              <View style={styles.activityStat}>
                <Icon name="cloud-outline" size={16} color="#feca57" />
                <Text style={styles.activityStatText}>
                  {activity.source}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.activityDescription}>
            {activity.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header con nuevo estilo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Actividad Física</Text>
        <TouchableOpacity onPress={fetchHealthData} style={styles.refreshButton}>
          <Icon name="refresh-outline" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderHealthConnectDataCard()}
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Icon name="fitness-outline" size={20} color="#61dafb" /> Mis Actividades
            </Text>
            <Text style={styles.sectionSubtitle}>
              {allActivities.length} registros
            </Text>
          </View>
          
          {allActivities.length > 0 ? (
            allActivities.map(renderActivityItem)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="fitness-outline" size={50} color="#4a69bd" />
              <Text style={styles.emptyStateText}>
                No hay actividades registradas
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Comienza creando tu primera actividad
              </Text>
            </View>
          )}
        </View>
        
        {/* Botón para crear nueva actividad */}
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => navigation.navigate('CreateActivityScreen')}
          activeOpacity={0.8}
        >
          <View style={styles.fabContent}>
            <Icon name="add-outline" size={24} color="#ffffff" />
            <Text style={styles.fabText}>Nueva Actividad</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ActivityScreen;

