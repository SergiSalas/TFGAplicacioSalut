import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../contexts/AuthContext';
import { createActivity, getActivityTypes } from '../service/ActivityService';
import { CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../components/common/Card';
import InputField from '../components/common/InputField';
import CustomPicker from '../components/common/CustomPicker';
import CustomAlert from '../components/common/CustomAlert';
import styles from '../styles/screens/CreateActivityScreen.styles';

const CreateActivityScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estados para el CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [alertConfirmText, setAlertConfirmText] = useState('');
  const [alertCancelText, setAlertCancelText] = useState('');
  const [alertConfirmAction, setAlertConfirmAction] = useState(() => {});

  useEffect(() => {
    if (token) {
      getActivityTypes(token)
        .then(data => {
          setTypes(data);
          if(data.length > 0) setSelectedType(data[0].name);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching types:', error);
          setLoading(false);
          showAlert(
            'Error', 
            'No se pudieron cargar los tipos de actividad. Por favor, inténtalo de nuevo.',
            'error',
            'Entendido'
          );
        });
    }
  }, [token]);

  // Función para mostrar alertas personalizadas
  const showAlert = (title, message, type, confirmText, cancelText, confirmAction) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type || 'warning');
    setAlertConfirmText(confirmText || 'Aceptar');
    setAlertCancelText(cancelText || '');
    setAlertConfirmAction(() => confirmAction || (() => setAlertVisible(false)));
    setAlertVisible(true);
  };

  const onSubmit = async () => {
    // Validar que la duración sea un número válido
    const durationValue = parseFloat(duration);
    if (isNaN(durationValue) || durationValue <= 0) {
      showAlert(
        'Valor inválido', 
        'Por favor, introduce una duración válida',
        'warning',
        'Entendido'
      );
      return;
    }

    if (!selectedType) {
      showAlert(
        'Campos incompletos', 
        'Por favor, selecciona un tipo de actividad',
        'warning',
        'Entendido'
      );
      return;
    }

    try {
      const newActivity = {
        duration: durationValue,
        date,
        type: selectedType,
        description,
      };
      
      // Mostrar indicador de carga
      setIsSubmitting(true);
      
      await createActivity(token, newActivity);
      
      // Mostrar mensaje de éxito con CustomAlert
      showAlert(
        'Actividad creada',
        'La actividad se ha guardado correctamente',
        'success',
        'Continuar',
        null,
        () => {
          setAlertVisible(false);
          // Establecer una pila de navegación con HomeScreen y ActivityScreen
          navigation.dispatch(
            CommonActions.reset({
              index: 1, // Índice 1 para que ActivityScreen sea la pantalla activa
              routes: [
                { name: 'HomeScreen' },  // HomeScreen como base
                { name: 'ActivityScreen', params: { activityCreated: true } } // ActivityScreen como pantalla actual
              ],
            })
          );
        }
      );
    } catch (error) {
      console.error('Error creando la actividad', error);
      showAlert(
        'Error', 
        'No se pudo crear la actividad. Inténtalo de nuevo.',
        'error',
        'Entendido'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-back-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Actividad</Text>
          <View style={styles.refreshButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4c6ef5" />
          <Text style={styles.loadingText}>Cargando tipos de actividad...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Actividad</Text>
        <View style={styles.refreshButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="fitness-outline" size={20} color="#ff7f50" />
              <Text style={styles.cardTitle}>Detalles de la Actividad</Text>
            </View>
          </View>
          
          <InputField
            label="Duración (minutos)"
            value={duration}
            onChangeText={setDuration}
            placeholder="Ej. 30"
            keyboardType="numeric"
            icon="time-outline"
          />
          
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <InputField
              label="Fecha"
              value={date.toDateString()}
              editable={false}
              icon="calendar-outline"
              rightIcon="chevron-down-outline"
            />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
          
          <CustomPicker
            label="Tipo de actividad"
            selectedValue={selectedType}
            onValueChange={(itemValue) => setSelectedType(itemValue)}
            items={types.map(type => ({
              label: type.displayName || type.name,
              value: type.name
            }))}
            icon="list-outline"
          />
          
          <InputField
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción de la actividad"
            multiline={true}
            numberOfLines={3}
            icon="create-outline"
          />
        </Card>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            <View style={styles.buttonContent}>
              <Icon name="add-circle-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>{isSubmitting ? "Creando..." : "Crear Actividad"}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleBackPress}
          >
            <View style={styles.buttonContent}>
              <Icon name="close-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>Cancelar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Componente CustomAlert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        confirmText={alertConfirmText}
        cancelText={alertCancelText}
        onConfirm={alertConfirmAction}
        onCancel={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default CreateActivityScreen;