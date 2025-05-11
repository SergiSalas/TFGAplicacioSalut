import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../service/UserService';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import CustomPicker from '../components/common/CustomPicker';
import styles from '../styles/screens/SetUserProfileScreen.styles';
import CustomAlert from '../components/common/CustomAlert';
import { CommonActions } from '@react-navigation/native';

const SetUserProfileScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
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

  useEffect(() => {
    loadUserProfile();
  }, [token]);

  const loadUserProfile = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const profileData = await getUserProfile(token);
      setProfile({
        name: profileData.name || '',
        email: profileData.email || '',
        weight: profileData.weight ? profileData.weight.toString() : '',
        height: profileData.height ? profileData.height.toString() : '',
        age: profileData.age ? profileData.age.toString() : '',
        gender: profileData.gender || ''
      });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudo cargar la información del perfil',
        type: 'error',
        confirmText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

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
        name: profile.name, // Mantenemos el nombre original
        weight: weight,
        height: height,
        age: age,
        gender: profile.gender
      };
      
      // Llamar al servicio para actualizar el perfil
      await updateUserProfile(token, updatedProfile);
      
      setSaving(false);
      
      // Mostrar mensaje de éxito
      showAlert({
        title: 'Perfil actualizado',
        message: 'Tu perfil ha sido actualizado correctamente',
        type: 'success',
        confirmText: 'Genial',
        onConfirm: () => {
          setAlertVisible(false);
          navigation.goBack(); // Volver a la pantalla de perfil
        }
      });
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
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <TouchableOpacity onPress={loadUserProfile} style={styles.refreshButton}>
            <Icon name="refresh-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4c6ef5" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
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
      <Text style={styles.headerTitle}>Editar Perfil</Text>
      <TouchableOpacity onPress={loadUserProfile} style={styles.refreshButton}>
        <Icon name="refresh-outline" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="person-outline" size={20} color="#ff7f50" />
              <Text style={styles.cardTitle}>Información Personal</Text>
            </View>
          </View>
          
          <InputField
            label="Nombre"
            value={profile.name}
            editable={false} // Nombre no editable
            icon="person-outline"
            style={styles.disabledInput}
          />
          
          <InputField
            label="Email"
            value={profile.email}
            editable={false} // Email no editable
            icon="mail-outline"
            style={styles.disabledInput}
          />
          
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
              <Icon name="save-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>{saving ? "Guardando..." : "Guardar Cambios"}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editProfileButton, {backgroundColor: '#f59c42'}]} 
            onPress={handleBackPress}
          >
            <View style={styles.buttonContent}>
              <Icon name="close-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>Cancelar</Text>
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

export default SetUserProfileScreen;