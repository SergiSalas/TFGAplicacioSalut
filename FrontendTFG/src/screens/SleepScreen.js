import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  AppState
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/SleepScreen.styles';
import healthConnectService, { SLEEP_STAGES } from '../service/HealthConnectService';
import { AuthContext } from '../contexts/AuthContext';
import * as Progress from 'react-native-progress';
import { useSleepData } from '../hooks/useSleepData';
import { FOOTER_SCREENS } from '../constants/navigation';
import { saveSleepData, getSleepsByDate } from '../service/SleepService';
import { getUserProfile, getUserLevel } from '../service/UserService';
import DateTimePicker from '@react-native-community/datetimepicker';


function getCurrentDateFormatted() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}


const SleepScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthConnectAvailable, setHealthConnectAvailable] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getCurrentDateFormatted());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Add the onRefresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSleepData().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const loadUserProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await getUserProfile(token);
      setUserProfile(profile);
    } catch (err) {
      console.error('Error cargando perfil:', err);
    }
  }, [token]);
  
  const loadUserLevel = useCallback(async () => {
    if (!token) return;
    try {
      const level = await getUserLevel(token);
      console.log("Nivel recibido del servidor:", level);
      setUserLevel(level);
    } catch (err) {
      console.error('Error cargando nivel:', err);
    }
  }, [token]);

  useEffect(() => {
    loadUserProfile();
    loadUserLevel();
  }, [loadUserProfile, loadUserLevel]);

  // Añadir un nuevo useEffect para monitorear cambios en userLevel
  

  useEffect(() => {
    if (token && !initialLoadDone) {
      initializeHealthConnectService();
      setTimeout(() => {
        loadSleepData();
        setInitialLoadDone(true);
      }, 100);
    }
  }, [token, initialLoadDone]);

  const initializeHealthConnectService = async () => {
    try {
      const isInitialized = await healthConnectService.initialize(token);
      setHealthConnectAvailable(isInitialized);
      if (isInitialized) {
        const sleepData = await healthConnectService.readSleepData();
        if (sleepData) {
          setSleepData(sleepData);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al inicializar Health Connect:', error);
      setLoading(false);
    }
  };

  
  
  const loadSleepData = useCallback(async (forceRefresh = false, dateParam = null) => {
    const dateToFetch = dateParam || selectedDate;
    console.log('Obteniendo datos de sueño para la fecha:', dateToFetch);
    setLoading(true);
    try {
      const sleepRecords = await getSleepsByDate(token, dateToFetch);
      if (sleepRecords.length > 0) {
        const record = sleepRecords[0];
        const startTime = new Date(record.startTime).toISOString();
        const endTime   = new Date(record.endTime).toISOString();
        setSleepData({
          date: dateToFetch,
          quality: record.quality / 10,
          durationHours: record.hours,
          startTime,
          endTime,
          stagesSummary: calculateStagesSummary(record.sleepStagesDTO),
          sleepStages: record.sleepStagesDTO
        });
        console.log('Datos de sueño cargados del backend:', {
          date: dateToFetch,
          quality: record.quality / 10,
          durationHours: record.hours
        });
      } else {
        setSleepData(null);
      }
    } catch (error) {
      console.error('Error al cargar datos de sueño:', error);
      setSleepData(null);
    } finally {
      setLoading(false);
    }
  }, [token, selectedDate]);

  
  // Función para calcular el resumen de etapas de sueño
  const calculateStagesSummary = (stages) => {
    if (!stages || stages.length === 0) return null;
    
    let totalSleep = 0;
    let deepSleep = 0;
    let lightSleep = 0;
    let remSleep = 0;
    let awake = 0;
    
    stages.forEach(stage => {
      const start = new Date(stage.startTime);
      const end = new Date(stage.endTime);
      const durationHours = (end - start) / (1000 * 60 * 60);
      
      switch (stage.stageType) {
        case 'DEEP':
          deepSleep += durationHours;
          totalSleep += durationHours;
          break;
        case 'LIGHT':
          lightSleep += durationHours;
          totalSleep += durationHours;
          break;
        case 'REM':
          remSleep += durationHours;
          totalSleep += durationHours;
          break;
        case 'AWAKE':
        case 'AWAKE_IN_BED':
          awake += durationHours;
          break;
        default:
          // Otros tipos se consideran como sueño total
          totalSleep += durationHours;
      }
    });
    
    return {
      totalSleep,
      deepSleep,
      lightSleep,
      remSleep,
      awake
    };
  };
  
// 2) onDateChange: misma firma que en ActivityScreen, llama a loadSleepData(true, fecha)
  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${y}-${m}-${d}`;
      setSelectedDate(formattedDate);
      // ¡Aquí está lo clave! fuerza la carga con la nueva fecha:
      loadSleepData(true, formattedDate);
    }
  };

  
  // Función para guardar los datos de sueño en el nuevo formato
  const handleSaveSleepData = async () => {
    try {
      if (!sleepData) {
        Alert.alert('Error', 'No hay datos de sueño para guardar');
        return;
      }
      
      // Convertir los datos al formato esperado por el backend
      const sleepDataToSave = {
        startTime: new Date(sleepData.startTime),
        endTime: new Date(sleepData.endTime),
        hours: sleepData.durationHours,
        quality: sleepData.quality * 10, // Convertir de escala 0-10 a 0-100
        sleepStagesDTO: sleepData.sleepStages.map(stage => ({
          startTime: new Date(stage.startTime),
          endTime: new Date(stage.endTime),
          stageType: stage.stageType
        })),
        comment: "Datos registrados desde la aplicación"
      };
      
      // Enviar al backend
      await saveSleepData(token, sleepDataToSave);
      
      Alert.alert('Éxito', 'Datos de sueño guardados correctamente');
      
      // Recargar los datos para mostrar los cambios
      loadSleepData();
    } catch (error) {
      console.error('Error al guardar datos de sueño:', error);
      Alert.alert('Error', 'No se pudieron guardar los datos de sueño');
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
      if (nextAppState === 'active' && healthConnectAvailable) {
        loadSleepData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [healthConnectAvailable]);

  useFocusEffect(
    useCallback(() => {
      if (healthConnectAvailable) {
        loadSleepData();
      }
      return () => {};
    }, [healthConnectAvailable])
  );

  // Actualizar para usar el nuevo mapeo de etapas
  // Función para obtener el icono de cada etapa
  const getStageIcon = (stageType) => {
    switch (stageType) {
      case 'DEEP':
        return 'moon-outline';
      case 'LIGHT':
        return 'cloudy-outline';
      case 'REM':
        return 'eye-outline';
      case 'AWAKE':
      case 'AWAKE_IN_BED':
        return 'sunny-outline';
      case 'OUT_OF_BED':
        return 'walk-outline';
      case 'SLEEPING':
        return 'bed-outline';
      case 'UNKNOWN':
        return 'help-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  // Función para obtener el nombre de cada etapa
  const getStageName = (stageType) => {
    switch (stageType) {
      case 'DEEP':
        return 'Sueño Profundo';
      case 'LIGHT':
        return 'Sueño Ligero';
      case 'REM':
        return 'REM';
      case 'AWAKE':
      case 'AWAKE_IN_BED':
        return 'Despierto';
      case 'OUT_OF_BED':
        return 'Fuera de cama';
      case 'SLEEPING':
        return 'Durmiendo';
      case 'UNKNOWN':
        return 'No especificado';
      default:
        return 'Fase de sueño';
    }
  };

  // Función para obtener el color de cada etapa
const getStageColor = (stageType) => {
  switch (stageType) {
    case 'DEEP':
      return '#4a69bd';
    case 'LIGHT':
      return '#f7b731';
    case 'REM':
      return '#61dafb';
    case 'AWAKE':
    case 'AWAKE_IN_BED':
      return '#ff6b6b';
    case 'OUT_OF_BED':
      return '#a55eea';
    case 'SLEEPING':
      return '#26de81';
    case 'UNKNOWN':
      return '#778ca3';
    default:
      return '#778ca3';
  }
};

// Función para obtener la descripción de cada etapa
const getStageDescription = (stageType) => {
  switch (stageType) {
    case 'DEEP':
      return 'Fase de recuperación física';
    case 'LIGHT':
      return 'Fase de transición del sueño';
    case 'REM':
      return 'Fase de sueños y memoria';
    case 'AWAKE':
      return 'Tiempo despierto durante la noche';
    case 'AWAKE_IN_BED':
      return 'Tiempo despierto en la cama';
    case 'OUT_OF_BED':
      return 'Tiempo fuera de la cama';
    case 'SLEEPING':
      return 'Fase general de sueño';
    case 'UNKNOWN':
      return 'Fase no identificada';
    default:
      return 'Fase de sueño';
  }
};

const renderSleepQualityCard = () => {
  if (!sleepData) return null;
  
  const qualityPercentage = sleepData.quality / 10;
  
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Icon name="star-outline" size={22} color="#61dafb" />
          <Text style={styles.cardTitle}>Calidad del Sueño</Text>
        </View>
      </View>
      
      <View style={styles.qualityContainer}>
        <View style={styles.circleProgressWrapper}>
          <Progress.Circle
            size={120}
            thickness={12}
            progress={qualityPercentage}
            color="#61dafb"
            unfilledColor="#2A2A4A"
            borderWidth={0}
            showsText={true}
            formatText={() => `${sleepData.quality}/10`}
            textStyle={styles.progressText}
          />
        </View>
        <View style={styles.qualityInfoContainer}>
          <Text style={styles.qualityLabel}>
            {qualityPercentage >= 0.8 ? 'Excelente' : 
             qualityPercentage >= 0.6 ? 'Bueno' : 
             qualityPercentage >= 0.4 ? 'Regular' : 'Mejorable'}
          </Text>
          <Text style={styles.qualityDescription}>
            {qualityPercentage >= 0.8 ? 'Has tenido un sueño reparador' : 
             qualityPercentage >= 0.6 ? 'Tu sueño ha sido bastante bueno' : 
             qualityPercentage >= 0.4 ? 'Tu sueño podría mejorar' : 'Intenta mejorar tus hábitos de sueño'}
          </Text>
        </View>
      </View>
    </Card>
  );
};

  const renderSleepDurationCard = () => {
    if (!sleepData) return null;
    
    // Recomendación general de 7-9 horas para adultos
    const recommendedHours = 8;
    const durationPercentage = Math.min(sleepData.durationHours / recommendedHours, 1);
    
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Icon name="time-outline" size={22} color="#61dafb" />
            <Text style={styles.cardTitle}>Duración del Sueño</Text>
          </View>
        </View>
        
        <View style={styles.durationContainer}>
          <View style={styles.durationValueContainer}>
            <Text style={styles.durationValue}>{sleepData.durationHours.toFixed(1)}</Text>
            <Text style={styles.durationUnit}>horas</Text>
          </View>
          
          <View style={styles.timeInfoContainer}>
            <View style={styles.timeInfo}>
              <Icon name="bed-outline" size={22} color="#61dafb" />
              <View style={styles.timeTextContainer}>
                <Text style={styles.timeLabel}>Hora de acostarse</Text>
                <Text style={styles.timeValue}>
                  {sleepData.startTime ? new Date(sleepData.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                </Text>
              </View>
            </View>
            
            <View style={styles.timeInfo}>
              <Icon name="sunny-outline" size={22} color="#f7b731" />
              <View style={styles.timeTextContainer}>
                <Text style={styles.timeLabel}>Hora de despertar</Text>
                <Text style={styles.timeValue}>
                  {sleepData.endTime ? new Date(sleepData.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Objetivo: {recommendedHours}h</Text>
              <Text style={styles.progressPercentage}>{Math.round(durationPercentage * 100)}%</Text>
            </View>
            <Progress.Bar 
              progress={durationPercentage} 
              width={null} 
              height={10}
              color="#61dafb"
              unfilledColor="#2A2A4A"
              borderWidth={0}
              borderRadius={5}
            />
          </View>
        </View>
      </Card>
    );
  };

  const renderSleepStagesCard = () => {
    if (!sleepData || !sleepData.sleepStages || sleepData.sleepStages.length === 0) return null;
    
    // Agrupar etapas por tipo para mostrar la duración total de cada tipo
    const stageGroups = {};
    
    sleepData.sleepStages.forEach(stage => {
      const startTime = new Date(stage.startTime);
      const endTime = new Date(stage.endTime);
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      
      if (!stageGroups[stage.stageType]) {
        stageGroups[stage.stageType] = {
          stageType: stage.stageType,
          totalDuration: 0,
          color: getStageColor(stage.stageType)
        };
      }
      
      stageGroups[stage.stageType].totalDuration += durationHours;
    });
    
    // Convertir a array y ordenar por duración (de mayor a menor)
    const sortedStages = Object.values(stageGroups)
      .sort((a, b) => b.totalDuration - a.totalDuration);
    
    // Asegurarse de que stagesSummary existe
    const stagesSummary = sleepData.stagesSummary || {
      deepSleep: 0,
      lightSleep: 0,
      remSleep: 0,
      awake: 0,
      totalSleep: sleepData.durationHours || 0
    };
    
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Icon name="analytics-outline" size={22} color="#61dafb" />
            <Text style={styles.cardTitle}>Etapas del Sueño</Text>
          </View>
        </View>
        
        <View style={styles.stagesContainer}>
          <View style={styles.stagesChartContainer}>
            <View style={styles.stagesChart}>
              {sortedStages.map((stageGroup, index) => (
                <View 
                  key={index}
                  style={[
                    styles.stageBar, 
                    { 
                      backgroundColor: stageGroup.color,
                      flex: stageGroup.totalDuration / sleepData.durationHours
                    }
                  ]} 
                />
              ))}
            </View>
          </View>
          
          {sortedStages.map((stageGroup, index) => {
            // Solo mostrar etapas con duración > 0
            if (stageGroup.totalDuration <= 0) return null;
            
            return (
              <View key={index} style={styles.stageItem}>
                <View 
                  style={[
                    styles.stageIconContainer, 
                    { backgroundColor: stageGroup.color }
                  ]}
                >
                  <Icon name={getStageIcon(stageGroup.stageType)} size={20} color="#ffffff" />
                </View>
                
                <View style={styles.stageInfo}>
                  <View style={styles.stageNameContainer}>
                    <Text style={styles.stageName}>{getStageName(stageGroup.stageType)}</Text>
                    <Text style={styles.stageDuration}>{stageGroup.totalDuration.toFixed(1)}h</Text>
                  </View>
                  <Text style={styles.stageDescription}>
                    {getStageDescription(stageGroup.stageType)}
                  </Text>
                  <View style={styles.stageProgressBar}>
                    <View 
                      style={[
                        styles.stageProgress, 
                        { 
                          backgroundColor: stageGroup.color,
                          width: `${(stageGroup.totalDuration / sleepData.durationHours) * 100}%`
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    );
  };

  const renderNoDataMessage = () => {
    return (
      <Card style={styles.card}>
        <View style={styles.noDataContainer}>
          <Icon name="alert-circle-outline" size={50} color="#61dafb" />
          <Text style={styles.noDataText}>No hay datos de sueño disponibles para esta fecha</Text>
          <Text style={styles.noDataSubText}>Selecciona otra fecha o registra nuevos datos</Text>
        </View>
      </Card>
    );
  };

  const renderSleepTipsCard = () => {
    if (!sleepData) return null;
    
    const qualityPercentage = sleepData.quality / 10;
    let tips = [];
    
    if (qualityPercentage < 0.6) {
      tips = [
        "Mantén un horario regular de sueño",
        "Evita la cafeína y el alcohol antes de dormir",
        "Crea un ambiente tranquilo y oscuro para dormir",
        "Evita las pantallas al menos 1 hora antes de acostarte"
      ];
    } else if (qualityPercentage < 0.8) {
      tips = [
        "Considera hacer ejercicio regularmente",
        "Practica técnicas de relajación antes de dormir",
        "Mantén una temperatura adecuada en tu habitación"
      ];
    } else {
      tips = [
        "¡Sigue así! Estás manteniendo buenos hábitos de sueño",
        "Comparte tus buenos hábitos con amigos y familiares"
      ];
    }
    
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Icon name="bulb-outline" size={22} color="#61dafb" />
            <Text style={styles.cardTitle}>Consejos para Mejorar</Text>
          </View>
        </View>
        
        <View style={styles.tipsContainer}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Icon name="checkmark-circle-outline" size={20} color="#61dafb" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <Header 
          title="Sueño" 
          navigation={navigation}
          userProfile={userProfile}
          userLevel={userLevel}
          onRefresh={onRefresh}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#61dafb" />
          <Text style={styles.loadingText}>Cargando datos de sueño...</Text>
        </View>
        <Footer 
          activeScreen="sleep"
          navigation={navigation}
          screens={FOOTER_SCREENS}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      <Header 
        title="Sueño" 
        navigation={navigation}
        userProfile={userProfile}
        userLevel={userLevel}
        onRefresh={onRefresh}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#61dafb"]}
            tintColor="#61dafb"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#61dafb" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(selectedDate)}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
            
            <View style={styles.datePickerContainer}>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <Icon name="calendar-outline" size={20} color="#61dafb" />
                <Text style={styles.datePickerText}>{selectedDate}</Text>
              </TouchableOpacity>
            </View>
            
            {sleepData ? (
              <>
                {renderSleepQualityCard()}
                {renderSleepDurationCard()}
                {renderSleepStagesCard()}
                {renderSleepTipsCard()}
                
                <View style={styles.buttonContainer}>
                  <Button 
                    title="Guardar Datos" 
                    onPress={handleSaveSleepData} 
                    style={styles.button}
                  />
                </View>
              </>
            ) : (
              renderNoDataMessage()
            )}
          </>
        )}
      </ScrollView>
      
      <Footer 
        activeScreen={FOOTER_SCREENS.SLEEP} 
        navigation={navigation} 
      />
    </View>
  );
};

export default SleepScreen;



