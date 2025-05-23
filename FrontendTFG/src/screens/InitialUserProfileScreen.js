import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { updateUserProfile } from '../service/UserService';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../components/common/Card';
import InputField from '../components/common/InputField';
import CustomPicker from '../components/common/CustomPicker';
import styles from '../styles/screens/InitialUserProfileScreen.styles';
import CustomAlert from '../components/common/CustomAlert';

const InitialUserProfileScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    weight: '',
    height: '',
    age: '',
    gender: ''
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

  // Opciones para el selector de género
  const genderOptions = [
    { label: 'Masculino', value: 'MALE' },
    { label: 'Femenino', value: 'FEMALE' },
    { label: 'Otro', value: 'OTHER' }
  ];

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
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

  // ... existing code ...

  const handleSaveProfile = async () => {
    // Validar que peso, altura y edad sean números válidos
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    const age = parseInt(profile.age, 10);

    if (isNaN(weight) || weight <= 0) {
      showAlert({
        title: 'Valor inválido',
        message: 'Por favor, introduce un peso válido',
        type: 'warning',
        confirmText: 'Entendido'
      });
      return;
    }

    if (isNaN(height) || height <= 0) {
      showAlert({
        title: 'Valor inválido',
        message: 'Por favor, introduce una altura válida',
        type: 'warning',
        confirmText: 'Entendido'
      });
      return;
    }

    if (isNaN(age) || age <= 0) {
      showAlert({
        title: 'Valor inválido',
        message: 'Por favor, introduce una edad válida',
        type: 'warning',
        confirmText: 'Entendido'
      });
      return;
    }

    if (!profile.gender) {
      showAlert({
        title: 'Campos incompletos',
        message: 'Por favor, selecciona tu género',
        type: 'warning',
        confirmText: 'Entendido'
      });
      return;
    }

    try {
      setSaving(true);
      
      // Preparar datos para enviar al servidor
      const updatedProfile = {
        weight: weight,
        height: parseInt(height), // Convertir a entero para coincidir con el DTO
        age: age,
        gender: profile.gender // Ya está en formato correcto (MALE, FEMALE, OTHER)
      };
      
      // Llamar al servicio para actualizar el perfil
      await updateUserProfile(token, updatedProfile);
      
      setSaving(false);
      
      // Continuar al siguiente paso de configuración
      navigation.navigate('SetDailyObjectiveScreen');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      setSaving(false);
      showAlert({
        title: 'Error',
        message: 'No se pudo actualizar el perfil. Inténtalo de nuevo.',
        type: 'error',
        confirmText: 'Entendido'
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configura tu Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>
          ¡Bienvenido! Para personalizar tu experiencia, necesitamos algunos datos básicos.
        </Text>
        
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="person-outline" size={20} color="#ff7f50" />
              <Text style={styles.cardTitle}>Información Personal</Text>
            </View>
          </View>
          
          <View style={styles.rowContainer}>
            <View style={styles.halfField}>
              <InputField
                label="Peso (kg)"
                value={profile.weight}
                onChangeText={(text) => handleInputChange('weight', text)}
                placeholder="Peso"
                keyboardType="numeric"
                icon="fitness-outline"
              />
            </View>
            <View style={styles.halfField}>
              <InputField
                label="Altura (cm)"
                value={profile.height}
                onChangeText={(text) => handleInputChange('height', text)}
                placeholder="Altura"
                keyboardType="numeric"
                icon="resize-outline"
              />
            </View>
          </View>
          
          <View style={styles.rowContainer}>
            <View style={styles.halfField}>
              <InputField
                label="Edad"
                value={profile.age}
                onChangeText={(text) => handleInputChange('age', text)}
                placeholder="Edad"
                keyboardType="numeric"
                icon="calendar-outline"
              />
            </View>
            <View style={styles.halfField}>
              <CustomPicker
                label="Género"
                selectedValue={profile.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                items={genderOptions}
                icon="people-outline"
              />
            </View>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.editProfileButton} 
            onPress={handleSaveProfile}
            disabled={saving}
          >
            <View style={styles.buttonContent}>
              <Icon name="arrow-forward-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>{saving ? "Guardando..." : "Continuar"}</Text>
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

export default InitialUserProfileScreen;