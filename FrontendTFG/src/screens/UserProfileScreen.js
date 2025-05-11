import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Image, StatusBar } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { AuthContext } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  getUserLevel, 
  getProfileImage, 
  uploadProfileImage,
} from '../service/UserService';
import styles from '../styles/screens/UserProfileScreen.styles';
import Icon from 'react-native-vector-icons/Ionicons';
import Footer from '../components/layout/Footer';
import { FOOTER_SCREENS } from '../constants/navigation';
import * as Progress from 'react-native-progress';
import axios from 'axios';
import { API_URL } from '../config/api';
import { logoutUser, deleteUserAccount } from '../service/AuthService';
import CustomAlert from '../components/common/CustomAlert';
import { ProfileImageCache } from '../cache/ProfileImageCache';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { getDailyObjective } from '../service/ActivityService';
import { getSleepObjective } from '../service/SleepService';
import { getHydrationStatus } from '../service/HydrationService';




const UserProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout: contextLogout } = useContext(AuthContext);
  const [alertVisible, setAlertVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => setAlertVisible(false),
    confirmText: '',
    cancelText: '',
    type: 'warning'
  });
  const [stepsObjective, setStepsObjective] = useState(null);
  const [sleepObjective, setSleepObjective] = useState(null);
  const [hydrationObjective, setHydrationObjective] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
      loadUserLevel();
      loadProfileImage();
      loadDailyObjectives();
    }, [token])
  );


  const loadUserProfile = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile(token);
      console.log('Género recibido:', profileData.gender); // Añadir esta línea
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setError('No se pudo cargar la información del perfil');
      Alert.alert('Error', 'No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadUserLevel = async () => {
    if (!token) return;
    
    try {
      const levelData = await getUserLevel(token);
      setUserLevel(levelData);
    } catch (error) {
      console.error('Error al cargar nivel del usuario:', error);
    }
  };

  const loadProfileImage = async () => {
    try {
      // Solo cargar imagen si hay un token válido
      if (!token) {
        setProfileImage(null);
        return;
      }
      
      // Intentar cargar desde caché primero
      const cachedImage = await ProfileImageCache.getImageFromCache();
      if (cachedImage) {
        setProfileImage(cachedImage);
      }
      
      // Si hay token, intentar obtener del servidor (actualización en segundo plano)
      if (token) {
        const imageUrl = await getProfileImage(token);
        if (imageUrl) {
          setProfileImage(imageUrl);
          // Actualizar la caché con la imagen más reciente
          await ProfileImageCache.saveImageToCache(imageUrl);
        }
      }
    } catch (error) {
      console.log('Error al cargar imagen de perfil:', error);
      // No mostramos error al usuario si no hay imagen
    }
  };
  

  const handleUploadProfileImage = async (imageFile) => {
    try {
      setLoading(true);
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
  
      await uploadProfileImage(token, imageFile);
      
      // Actualizar la imagen en la UI
      setProfileImage(imageFile.uri);
      
      // Guardar en caché
      await ProfileImageCache.saveImageToCache(imageFile.uri);
      
      // Desactivar el loading antes de mostrar la alerta
      setLoading(false);
      
      // Definir una función específica para manejar el cierre de la alerta
      const handleConfirm = () => {
        console.log('Cerrando alerta de éxito');
        setAlertVisible(false);
      };
      
      // Configurar la alerta con la función específica
      setAlertConfig({
        title: 'Éxito',
        message: 'Imagen de perfil actualizada correctamente.',
        onConfirm: handleConfirm,
        onCancel: null,
        confirmText: 'Genial',
        cancelText: null,
        type: 'success'
      });
      
      // Mostrar la alerta
      setAlertVisible(true);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      
      setLoading(false); // Importante: desactivar el loading antes de mostrar la alerta
      
      setAlertConfig({
        title: 'Error',
        message: 'No se pudo subir la imagen de perfil.',
        onConfirm: () => setAlertVisible(false),
        onCancel: null,
        confirmText: 'Entendido',
        cancelText: null,
        type: 'error'
      });
      setAlertVisible(true);
    }
  };

  const pickImage = async () => {
    try {
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.7,
      };
  
      const result = await launchImageLibrary(options);
      
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        handleUploadProfileImage(selectedImage);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudo seleccionar la imagen. Inténtalo de nuevo.',
        type: 'error',
        confirmText: 'Entendido'
      });
    }
  };

   // Añadir función para cargar los objetivos diarios
  const loadDailyObjectives = async () => {
    if (!token) return;
    
    try {
      // Cargar objetivo de pasos
      const stepsObj = await getDailyObjective(token);
      setStepsObjective(stepsObj);
      
      // Cargar objetivo de sueño
      const sleepObj = await getSleepObjective(token);
      setSleepObjective(sleepObj);
      
      // Cargar objetivo de hidratación
      const hydrationStatus = await getHydrationStatus(token);
      setHydrationObjective(hydrationStatus.dailyTarget);
    } catch (error) {
      console.error('Error al cargar objetivos diarios:', error);
    }
  };

  const showAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  // Helper function to translate gender
  const translateGender = (gender) => {
    switch (gender) {
      case 'MALE':
        return 'Masculino';
      case 'FEMALE':
        return 'Femenino';
      case 'OTHER':
        return 'Otro';
      default:
        return 'No especificado';
    }
  };

  const handleLogout = () => {
    showAlert({
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      type: 'warning',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar',
      onConfirm: () => {
        contextLogout();
        setAlertVisible(false);
      }
    });
  };

  const handleDeleteAccount = () => {
    showAlert({
      title: 'Eliminar cuenta',
      message: '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      type: 'error',
      confirmText: 'Sí, eliminar cuenta',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteUserAccount(token);
          contextLogout();
          setAlertVisible(false);
        } catch (error) {
          console.error('Error al eliminar cuenta:', error);
          setLoading(false);
          showAlert({
            title: 'Error',
            message: 'No se pudo eliminar la cuenta. Inténtalo de nuevo.',
            type: 'error',
            confirmText: 'Entendido'
          });
        }
      }
    });
  };

  const handleEditProfile = () => {
    navigation.navigate('SetUserProfileScreen');
  };

  const handleSetDailyObjective = () => {
    navigation.navigate('SetDailyObjectiveScreen', { isEditing: true });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <Header 
          title="Mi Perfil" 
          navigation={navigation} 
          userProfile={userProfile}
          userLevel={userLevel}
          onRefresh={loadUserProfile}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4c6ef5" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <Header 
          title="Mi Perfil" 
          navigation={navigation} 
          userProfile={userProfile}
          userLevel={userLevel}
          onRefresh={loadUserProfile}
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            title="Reintentar" 
            onPress={loadUserProfile} 
            style={styles.retryButton}
          />
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <Header 
        title="Mi Perfil" 
        navigation={navigation} 
        userProfile={userProfile}
        userLevel={userLevel}
        onRefresh={loadUserProfile}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tarjeta de perfil */}
        <Card style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={pickImage}>
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.profileImage}>
                  <Icon name="person" size={40} color="#CCCCCC" />
                </View>
              )}
              <View style={styles.editPhotoButton}>
                <Icon name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{userProfile?.name || 'Usuario Demo'}</Text>
          <Text style={styles.userEmail}>{userProfile?.email || 'usuario@example.com'}</Text>
          
          {userLevel && (
            <View style={styles.levelContainer}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{userLevel.currentLevel}</Text>
              </View>
              <View style={styles.levelInfoContainer}>
                <View style={styles.levelProgressContainer}>
                  <Progress.Bar 
                    progress={userLevel.currentExp / userLevel.expToNextLevel} 
                    width={null} 
                    height={8}
                    color="#4c6ef5"
                    unfilledColor="#2A2A4A"
                    borderWidth={0}
                    borderRadius={4}
                    style={styles.progressBar}
                  />
                </View>
                <View style={styles.expInfoContainer}>
                  <Text style={styles.expText}>Nivel {userLevel.currentLevel}</Text>
                  <Text style={styles.progressText}>{userLevel.currentExp} / {userLevel.expToNextLevel} XP</Text>
                </View>
              </View>
            </View>
          )}
        </Card>
        
        {/* Tarjeta de información personal */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="person-outline" size={20} color="#ff7f50" />
              <Text style={styles.cardTitle}>Información Personal</Text>
            </View>
            <TouchableOpacity onPress={handleEditProfile}>
              <Icon name="create-outline" size={20} color="#4c6ef5" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Edad</Text>
            <Text style={styles.infoValue}>{userProfile?.age || 'No especificado'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Género</Text>
            <Text style={styles.infoValue}>{userProfile?.gender ? translateGender(userProfile.gender) : 'No especificado'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Peso</Text>
            <Text style={styles.infoValue}>{userProfile?.weight ? `${userProfile.weight} kg` : 'No especificado'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Altura</Text>
            <Text style={styles.infoValue}>{userProfile?.height ? `${userProfile.height} cm` : 'No especificado'}</Text>
          </View>
        </Card>
        
        {/* Tarjeta de objetivos diarios */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="flag-outline" size={20} color="#4cd964" />
              <Text style={styles.cardTitle}>Objetivos Diarios</Text>
            </View>
            <TouchableOpacity onPress={handleSetDailyObjective}>
              <Icon name="create-outline" size={20} color="#4c6ef5" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.objectiveLabel}>Pasos:</Text>
            <Text style={styles.objectiveValue}>{stepsObjective || '--'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.objectiveLabel}>Sueño:</Text>
            <Text style={styles.objectiveValue}>{sleepObjective || '--'} horas</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.objectiveLabel}>Hidratación:</Text>
            <Text style={styles.objectiveValue}>{hydrationObjective || '--'} ml</Text>
          </View>
        </Card>
        
        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <Button 
            title="Cerrar Sesión" 
            onPress={handleLogout}
            icon="log-out-outline"
            style={styles.logoutButton}
          />
          
          <Button 
            title="Eliminar Cuenta" 
            onPress={handleDeleteAccount}
            icon="trash-outline"
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        </View>
      </ScrollView>
      
      <Footer />
      
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel || (() => setAlertVisible(false))}
      />
    </View>
  );
};

export default UserProfileScreen;