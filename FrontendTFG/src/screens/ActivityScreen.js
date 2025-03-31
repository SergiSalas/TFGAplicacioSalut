import React, { useEffect, useState, useContext, useCallback } from 'react';
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
  RefreshControl,
  AppState
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ActivityScreen.styles';
import { getActivities, getDailyObjective, createActivity, getTotalCalories } from '../service/ActivityService';
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
  getExerciseTypeColor,
  getBackendActivityType
} from '../utils/ExerciseTypeMapper';
import { ActivityCache } from '../cache/ActivityCache';
import { appStorage, activityStorage, STORAGE_KEYS } from '../storage/AppStorage';
import DateTimePicker from '@react-native-community/datetimepicker';
import healthConnectService from '../service/HealthConnectService';

// Las declaraciones de función son "elevadas" (hoisted)
function getCurrentDateFormatted() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const ActivityScreen = ({ navigation, route }) => {
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
  const { token, handleTokenExpiration } = useContext(AuthContext);

  // Agregar un nuevo estado para rastrear las actividades ya guardadas de Health Connect
  const [savedHealthConnectIds, setSavedHealthConnectIds] = useState([]);
  
  const [refreshing, setRefreshing] = useState(false);
  const [savedStepIds, setSavedStepIds] = useState([]);
  const [savedExerciseIds, setSavedExerciseIds] = useState([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Ahora la función getCurrentDateFormatted ya está definida cuando se usa aquí
  const [selectedDate, setSelectedDate] = useState(getCurrentDateFormatted());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Añadir esta variable de estado para el ritmo cardíaco
  const [heartRate, setHeartRate] = useState(null);

  const [appState, setAppState] = useState(AppState.currentState);

  // Añadir un nuevo estado para calorías
  const [calories, setCalories] = useState(0);

  // Añadir estos estados al inicio del componente
  const [totalCalories, setTotalCalories] = useState(0);
  const [isLoadingCalories, setIsLoadingCalories] = useState(false);

  useEffect(() => {
    if (token && !initialLoadDone) {
      // Cargar Health Connect primero (es más rápido) para tener datos básicos
      initializeHealthConnectService();
      
      // Cargar actividades en segundo plano (no bloqueante)
      setTimeout(() => {
        loadActivities();
        setInitialLoadDone(true);
      }, 100);
    }
  }, [token, initialLoadDone]);

  // Añadir este nuevo useEffect para el enfoque
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Si Health Connect está disponible, actualizar datos en tiempo real
      if (healthConnectAvailable) {
        console.log('ActivityScreen recibió foco - Actualizando datos de salud');
        
        // Obtener datos actualizados sin mostrar UI de carga
        healthConnectService.getCurrentData()
          .then(data => {
            if (data) {
              if (data.steps !== undefined) {
                setTodaySteps(data.steps);
              }
              if (data.heartRate !== undefined) {
                setHeartRate(data.heartRate);
              }
            }
          })
          .catch(error => {
            console.error('Error al actualizar datos de salud:', error);
          });
      }
    });

    return unsubscribe;
  }, [navigation, healthConnectAvailable]);

  // Registro de pantalla activa y actualización continua
  useEffect(() => {
    // 1. Registrar esta pantalla como activa
    healthConnectService.registerActiveScreen('ActivityScreen');
    
    // 2. Configurar actualizador en primer plano (más frecuente)
    const updateTimer = setInterval(() => {
      if (healthConnectAvailable && appState === 'active') {
        console.log('Actualización por intervalo (ActivityScreen activa)');
        healthConnectService.getCurrentData()
          .then(data => {
            if (data) {
              if (data.steps !== undefined) {
                setTodaySteps(data.steps);
              }
              if (data.heartRate !== undefined) {
                setHeartRate(data.heartRate);
              }
            }
          })
          .catch(error => {
            console.error('Error en actualización periódica:', error);
          });
      }
    }, 8000); // Actualizar cada 8 segundos mientras la pantalla está visible
    
    // 3. Gestionar cambios de estado de la aplicación
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
      
      // Al volver a primer plano, actualizar inmediatamente
      if (nextAppState === 'active' && healthConnectAvailable) {
        healthConnectService.requestUpdate('ActivityScreen')
          .then(data => {
            if (data) {
              if (data.steps !== undefined) {
                setTodaySteps(data.steps);
              }
              if (data.heartRate !== undefined) {
                setHeartRate(data.heartRate);
              }
            }
          })
          .catch(error => {
            console.error('Error al actualizar al volver a primer plano:', error);
          });
      }
    });
    
    // Limpieza al desmontar
    return () => {
      clearInterval(updateTimer);
      appStateSubscription.remove();
      healthConnectService.unregisterActiveScreen('ActivityScreen');
    };
  }, [healthConnectAvailable, appState]);

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

  // Añadir esta función auxiliar (después de otros métodos auxiliares)
  const loadSavedIds = async () => {
    try {
      // Cargar tanto IDs de ejercicios como de pasos
      const exerciseIds = await ActivityCache.getSavedExerciseIds();
      const stepIds = await ActivityCache.getSavedStepIds();
      
      console.log(`Cargados ${exerciseIds.length} IDs de ejercicios guardados`);
      console.log(`Cargados ${stepIds.length} IDs de pasos guardados`);
      
      setSavedExerciseIds(exerciseIds);
      setSavedStepIds(stepIds);
      
      return { exerciseIds, stepIds };
    } catch (error) {
      console.error('Error al cargar IDs guardados:', error);
      return { exerciseIds: [], stepIds: [] };
    }
  };

  // Modificar la función loadActivities para asegurar que se cargan los IDs guardados
  const loadActivities = useCallback(async (forceRefresh = false, date = null) => {
    if (!token) {
      console.log('No hay token, posible sesión expirada');
      await handleTokenExpiration();
      return;
    }
    
    try {
      setRefreshing(true);
      
      // IMPORTANTE: Cargar IDs guardados ANTES de hacer cualquier petición
      await loadSavedIds();
      
      // Obtener la fecha actual en formato YYYY-MM-DD
      const today = date || getCurrentDateFormatted();
      
      // Cargar solo las actividades de hoy
      const data = await getActivities(token, forceRefresh, today);
      setActivities(data || []);
      setInitialLoadDone(true);
      
      // Registrar tiempo de carga
      ActivityCache.setLastLoadTime();
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      
      // Verificar si es un error de token
      if (
        !token || 
        error.message?.includes('expirada') || 
        error.message?.includes('inicia sesión') ||
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.response?.data?.message?.includes('token')
      ) {
        console.log('Detectado error de token en loadActivities:', 
          error.message || error.response?.data?.message);
        await handleTokenExpiration();
        // No es necesario hacer nada más, el handleTokenExpiration nos llevará a login
        return;
      }
      
      // Otro tipo de error
      Alert.alert("Error", "No se pudieron cargar las actividades.");
    } finally {
      setRefreshing(false);
    }
  }, [token, handleTokenExpiration]);
  
  // Obtener actividades iniciales solo una vez al montar el componente
  useEffect(() => {
    if (!initialLoadDone) {
      loadActivities();
    }
  }, [initialLoadDone, loadActivities]);
  
  // Modificar useFocusEffect para solo recargar si venimos de crear una actividad
  useFocusEffect(
    React.useCallback(() => {
      // Solo recargar si ya completamos la carga inicial
      if (initialLoadDone) {
        // Verificar si la caché ha sido invalidada (por ejemplo, después de crear una actividad)
        const isValid = ActivityCache.isCacheValid(selectedDate);
        if (!isValid) {
          // La caché fue invalidada, recargar
          loadActivities(false, selectedDate);
        }
      }
    }, [initialLoadDone, loadActivities, selectedDate])
  );
  
  // Función para manejar el refresh manual (Pull to refresh)
  const handleRefresh = () => {
    // Evitar iniciar otro refresh si ya está en progreso
    if (!refreshing) {
      loadActivities(true);
    }
  };

  // Reemplazar la función initializeHealthConnect con esta versión simplificada que usa el servicio
  const initializeHealthConnectService = async () => {
    try {
      setIsLoadingHealthData(true);
      
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
        
        // Iniciar sincronización en segundo plano
        await healthConnectService.syncWithHealthConnect();
      }
    } catch (error) {
      console.error('Error al inicializar Health Connect Service:', error);
    } finally {
      setIsLoadingHealthData(false);
    }
  };
  
  // Modificar forceRefreshExercises para eliminar la alerta
  const forceRefreshExercises = async () => {
    try {
      setIsLoadingHealthData(true);
      
      // Iniciar Health Connect si no está inicializado
      await initializeHealthConnectService();
      
      if (healthConnectAvailable) {
        // Sincronizar con Health Connect
        await healthConnectService.syncWithHealthConnect(true);
        
        // Actualizar datos locales
        const currentData = await healthConnectService.getCurrentData();
        if (currentData) {
          if (currentData.steps !== undefined) {
            setTodaySteps(currentData.steps);
          }
          if (currentData.heartRate !== undefined) {
            setHeartRate(currentData.heartRate);
          }
        }
        
        // Recargar actividades y calorías desde el backend
        await loadActivities(true);
        await loadTotalCalories();
      }
    } catch (error) {
      console.error('Error al sincronizar con Health Connect:', error);
      // Mantenemos la alerta de error para informar al usuario
      Alert.alert('Error', 'No se pudieron sincronizar los datos');
    } finally {
      setIsLoadingHealthData(false);
    }
  };

  // Modificar el manejador de actualizaciones para incluir el ritmo cardíaco
  const handleHealthConnectUpdate = useCallback((data) => {
    console.log('Actualización recibida de Health Connect Service:', data);
    
    if (data.type === 'today-steps') {
      setTodaySteps(data.steps);
    } else if (data.type === 'heart-rate') {
      setHeartRate(data.heartRate);
    } else if (data.type === 'calories') {
      // Las calorías de Health Connect se mostrarán como complementarias
      // Las calorías totales del backend siguen siendo la fuente primaria
    } else if (data.type === 'new-activities') {
      // Recargar actividades y calorías cuando se creen nuevas actividades
      loadActivities(true);
      loadTotalCalories();
    }
  }, [loadActivities, loadTotalCalories]);

  // Asegurar limpieza del listener al desmontar
  useEffect(() => {
    return () => {
      // Eliminar el listener cuando el componente se desmonta
      if (healthConnectAvailable) {
        healthConnectService.removeListener(handleHealthConnectUpdate);
      }
    };
  }, [healthConnectAvailable]);

  // Añadir función para cargar calorías totales
  const loadTotalCalories = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoadingCalories(true);
      const today = getCurrentDateFormatted();
      const calories = await getTotalCalories(token, today);
      setTotalCalories(calories);
    } catch (error) {
      console.error('Error al cargar calorías totales:', error);
      // Manejar errores de token similar a otras funciones
      if (error.message?.includes('expirado') || error.response?.status === 401) {
        await handleTokenExpiration();
      }
    } finally {
      setIsLoadingCalories(false);
    }
  }, [token, handleTokenExpiration]);

  // Añadir llamada a loadTotalCalories junto con loadActivities
  useEffect(() => {
    if (!initialLoadDone) {
      loadActivities();
      loadTotalCalories();
    }
  }, [initialLoadDone, loadActivities, loadTotalCalories]);

  // Añadir este useEffect para manejar la navegación desde CreateActivityScreen
  useEffect(() => {
    if (route.params?.activityCreated) {
      console.log('Actualizando después de crear una actividad');
      loadActivities(true);
      loadTotalCalories();
      // Limpiar el parámetro para evitar actualizaciones adicionales
      navigation.setParams({ activityCreated: undefined });
    }
  }, [route.params?.activityCreated, loadActivities, loadTotalCalories]);

  // Renderiza el contenido de Health Connect
  const renderHealthConnectDataCard = () => {
    if (!healthConnectAvailable) {
      return (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Health Connect</Text>
          <Text style={styles.cardText}>
            Para sincronizar automáticamente tus actividades, activa Health Connect desde los ajustes de tu dispositivo.
          </Text>
          <Button
            title="Entendido"
            onPress={() => setHealthConnectAvailable(false)}
          />
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="analytics-outline" size={20} color="#61dafb" />
          <Text style={styles.cardTitle}>Resumen de Actividad</Text>
        </View>
        
        {/* Sección de métricas principales */}
        <View style={styles.metricsContainer}>
          {/* Pasos */}
          <View style={[styles.metricCard, { backgroundColor: '#232342' }]}>
            <Icon name="footsteps-outline" size={28} color="#4a69bd" />
            <Text style={[styles.metricValue, { color: '#ffffff' }]}>{todaySteps}</Text>
            <Text style={[styles.metricLabel, { color: '#cccccc' }]}>Pasos</Text>
            {objectiveLoaded && (
              <View style={styles.progressContainer}>
                <Progress.Bar
                  progress={Math.min(todaySteps / dailyObjective, 1)}
                  width={null}
                  height={6}
                  borderRadius={3}
                  color="#4a69bd"
                  unfilledColor="rgba(255,255,255,0.1)"
                  borderWidth={0}
                  animated={true}
                  style={styles.progressBar}
                />
                <Text style={[styles.progressText, { color: '#8a8a8a' }]}>
                  {Math.round((todaySteps / dailyObjective) * 100)}% de {dailyObjective}
                </Text>
              </View>
            )}
          </View>

          {/* Calorías */}
          <View style={[styles.metricCard, { backgroundColor: '#232342' }]}>
            <Icon name="flame-outline" size={28} color="#ff6b6b" />
            <Text style={[styles.metricValue, { color: '#ffffff' }]}>
              {isLoadingCalories ? '...' : totalCalories}
            </Text>
            <Text style={[styles.metricLabel, { color: '#cccccc' }]}>Calorías</Text>
          </View>
          
          {/* Actividades */}
          <View style={[styles.metricCard, { backgroundColor: '#232342' }]}>
            <Icon name="bicycle-outline" size={28} color="#1dd1a1" />
            <Text style={[styles.metricValue, { color: '#ffffff' }]}>
              {activities.length || '0'}
            </Text>
            <Text style={[styles.metricLabel, { color: '#cccccc' }]}>Ejercicios</Text>
          </View>
        </View>
        
        {/* Botón de sincronización */}
        <TouchableOpacity 
          style={[styles.button, { marginTop: 16 }]}
          onPress={forceRefreshExercises}
          disabled={isLoadingHealthData}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>
              {isLoadingHealthData ? 'Sincronizando...' : 'Actualizar datos de actividad'}
            </Text>
            {isLoadingHealthData ? (
              <ActivityIndicator size="small" color="#fff" style={{marginLeft: 8}} />
            ) : (
              <Icon name="refresh-outline" size={18} color="#fff" style={{marginLeft: 8}} />
            )}
          </View>
        </TouchableOpacity>
      </Card>
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
        externalId: exercise.metadata ? exercise.metadata.id : null,
        type: activityTitle,
        duration: durationMinutes,
        date: exercise.startTime,
        description: description,
        source: "Health Connect",
        calories: exercise.calories ? Math.round(exercise.calories) : null
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

    // Determinar si proviene de Health Connect
    const isFromHealthConnect = 
      activity.source === 'Health Connect' || 
      activity.externalId !== undefined;

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
            
            {/* Indicador de origen */}
            {isFromHealthConnect && (
              <View style={styles.healthConnectBadge}>
                <Text style={styles.healthConnectText}>Health Connect</Text>
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

  const renderLoadingState = () => {
    // Eliminar esta función por completo o simplemente retornar null
    // Ya que el RefreshControl es suficiente feedback visual
    return null;
    
    // Alternativa: Solo mostrar en carga inicial, nunca en refreshes
    // if (initialLoadDone || refreshing) return null;
    // 
    // return (
    //   <View style={styles.loadingContainer}>
    //     <ActivityIndicator size="large" color="#61dafb" />
    //     <Text style={styles.loadingText}>Cargando actividades...</Text>
    //   </View>
    // );
  };

  // Función para cambiar la fecha seleccionada
  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      setSelectedDate(formattedDate);
      // Cargar actividades de la nueva fecha
      loadActivities(true, formattedDate);
    }
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
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Icon name="refresh-outline" size={22} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Icon name="calendar-outline" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(selectedDate)}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
      
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#61dafb"]}
            tintColor="#61dafb"
          />
        }
      >
        {renderLoadingState()}
        {renderHealthConnectDataCard()}
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Icon name="fitness-outline" size={20} color="#61dafb" /> Mis Actividades
            </Text>
            <Text style={styles.sectionSubtitle}>
              {activities.length} registros
            </Text>
          </View>
          
          {activities.length > 0 ? (
            activities.map(renderActivityItem)
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
      
      {/* Agregar el Footer */}
      <Footer 
        activeScreen="activity"
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

export default ActivityScreen;