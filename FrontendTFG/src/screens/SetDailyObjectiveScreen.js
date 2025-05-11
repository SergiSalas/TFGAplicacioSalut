import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { addDailyObjective, getDailyObjective } from '../service/ActivityService';
import SleepService from '../service/SleepService';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../components/common/Card';
import InputField from '../components/common/InputField';
import styles from '../styles/screens/SetDailyObjectiveScreen.styles';
import CustomAlert from '../components/common/CustomAlert';
import { CommonActions } from '@react-navigation/native';

const SetDailyObjectiveScreen = ({ navigation, route }) => {
  const { token, setIsNewUser } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState({
    dailySteps: '10000',
    dailySleep: '8'
  });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => setAlertVisible(false),
    confirmText: '',
    cancelText: '',
    type: 'warning'
  });
  
  // Determinar si estamos editando (desde perfil) o configurando por primera vez
  const isEditing = route?.params?.isEditing || false;

  // Cargar objetivos actuales si estamos editando
  useEffect(() => {
    if (isEditing && token) {
      loadCurrentObjectives();
    } else {
      setLoading(false);
    }
  }, [token, isEditing]);

  const loadCurrentObjectives = async () => {
    try {
      setLoading(true);
      
      // Cargar objetivo de pasos
      const stepsObj = await getDailyObjective(token);
      
      // Cargar objetivo de sueño
      const sleepObj = await SleepService.getSleepObjective(token);
      
      setObjectives({
        dailySteps: stepsObj ? stepsObj.toString() : '10000',
        dailySleep: sleepObj ? sleepObj.toString() : '8'
      });
    } catch (error) {
      console.error('Error al cargar objetivos actuales:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudieron cargar tus objetivos actuales. Se mostrarán valores predeterminados.',
        type: 'error',
        confirmText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setObjectives(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showAlert = (config) => {
    setAlertConfig({
      ...config,
      onCancel: config.onCancel || (() => setAlertVisible(false))
    });
    setAlertVisible(true);
  };

  const handleSaveObjectives = async () => {
    // Validar objetivo de pasos
    const stepsObjective = parseInt(objectives.dailySteps, 10);
    const sleepObjective = parseFloat(objectives.dailySleep);

    if (isNaN(stepsObjective) || stepsObjective <= 0) {
      showAlert({
        title: 'Valor inválido',
        message: 'Por favor, introduce un objetivo válido de pasos diarios',
        type: 'warning',
        confirmText: 'Entendido'
      });
      return;
    }

    if (isNaN(sleepObjective) || sleepObjective <= 0) {
      showAlert({
        title: 'Valor inválido',
        message: 'Por favor, introduce un objetivo válido de horas de sueño',
        type: 'warning',
        confirmText: 'Entendido'
      });
      return;
    }

    try {
      setSaving(true);
      
      // Guardar objetivo de pasos
      await addDailyObjective(token, stepsObjective);
      
      // Guardar objetivo de sueño
      await SleepService.addSleepObjective(token, sleepObjective);
      
      // Solo actualizar isNewUser si estamos en el flujo de registro
      if (!isEditing) {
        setIsNewUser(false);
      }
      
      setSaving(false);
      
      showAlert({
        title: 'Objetivos establecidos',
        message: `Has establecido un objetivo de ${stepsObjective} pasos diarios y ${sleepObjective} horas de sueño.`,
        type: 'success',
        confirmText: 'Continuar',
        onConfirm: () => {
          if (isEditing) {
            // Si estamos editando, volver a la pantalla anterior
            navigation.goBack();
          } else {
            // Si es usuario nuevo, ir a la pantalla principal
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'HomeScreen' }],
              })
            );
          }
        }
      });
    } catch (error) {
      console.error('Error al guardar objetivos:', error);
      setSaving(false);
      showAlert({
        title: 'Error',
        message: 'No se pudieron guardar los objetivos. Inténtalo de nuevo.',
        type: 'error',
        confirmText: 'Entendido'
      });
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        {isEditing && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-back-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar objetivos diarios' : 'Establece tus objetivos diarios'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>
          {isEditing 
            ? 'Actualiza tus objetivos diarios para mantener un estilo de vida saludable.'
            : 'Establece tus objetivos diarios para mantener un estilo de vida saludable.'}
        </Text>
        
        {/* Tarjeta para objetivo de pasos */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="footsteps-outline" size={20} color="#4c6ef5" />
              <Text style={styles.cardTitle}>Objetivo de Pasos Diarios</Text>
            </View>
          </View>
          
          <Text style={styles.cardDescription}>
            La OMS recomienda al menos 10,000 pasos diarios para una vida saludable.
          </Text>
          
          <InputField
            label="Pasos diarios"
            value={objectives.dailySteps}
            onChangeText={(text) => handleInputChange('dailySteps', text)}
            placeholder="Ej: 10000"
            keyboardType="numeric"
            icon="walk-outline"
          />
          
          <View style={styles.presetContainer}>
            <TouchableOpacity 
              style={styles.presetButton} 
              onPress={() => handleInputChange('dailySteps', '5000')}
            >
              <Text style={styles.presetButtonText}>5,000</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.presetButton} 
              onPress={() => handleInputChange('dailySteps', '7500')}
            >
              <Text style={styles.presetButtonText}>7,500</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.presetButton} 
              onPress={() => handleInputChange('dailySteps', '10000')}
            >
              <Text style={styles.presetButtonText}>10,000</Text>
            </TouchableOpacity>
          </View>
        </Card>
        
        {/* Tarjeta para objetivo de sueño */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="bed-outline" size={20} color="#ff7f50" />
              <Text style={styles.cardTitle}>Objetivo de Sueño Diario</Text>
            </View>
          </View>
          
          <Text style={styles.cardDescription}>
            Los expertos recomiendan entre 7 y 9 horas de sueño para adultos.
          </Text>
          
          <InputField
            label="Horas de sueño"
            value={objectives.dailySleep}
            onChangeText={(text) => handleInputChange('dailySleep', text)}
            placeholder="Ej: 8"
            keyboardType="numeric"
            icon="moon-outline"
          />
          
          <View style={styles.presetContainer}>
            <TouchableOpacity 
              style={styles.presetButton} 
              onPress={() => handleInputChange('dailySleep', '7')}
            >
              <Text style={styles.presetButtonText}>7 h</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.presetButton} 
              onPress={() => handleInputChange('dailySleep', '8')}
            >
              <Text style={styles.presetButtonText}>8 h</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.presetButton} 
              onPress={() => handleInputChange('dailySleep', '9')}
            >
              <Text style={styles.presetButtonText}>9 h</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.editProfileButton} 
            onPress={handleSaveObjectives}
            disabled={saving}
          >
            <View style={styles.buttonContent}>
              <Icon name="checkmark-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>{saving ? "Guardando..." : "Guardar Objetivos"}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onCancel={alertConfig.onCancel}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        type={alertConfig.type}
      />
    </View>
  );
};

export default SetDailyObjectiveScreen;