import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Image, StatusBar } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { AuthContext } from '../contexts/AuthContext';
import { getUserProfile, getUserLevel } from '../service/UserService';
import styles from '../styles/screens/UserProfileScreen.styles';
import Icon from 'react-native-vector-icons/Ionicons';
import Footer from '../components/layout/Footer';
import { FOOTER_SCREENS } from '../constants/navigation';
import * as Progress from 'react-native-progress';
import axios from 'axios';
import { API_URL } from '../config/api';
import { logoutUser, deleteUserAccount } from '../service/AuthService';
import CustomAlert from '../components/common/CustomAlert';

const UserProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout: contextLogout } = useContext(AuthContext);
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

  useEffect(() => {
    loadUserProfile();
    loadUserLevel();
  }, [token]);

  const loadUserProfile = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile(token);
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

  // Helper function to translate gender
  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'MALE':
        return 'Masculino';
      case 'FEMALE':
        return 'Femenino';
      case 'OTHER':
        return 'Otro';
      default:
        return gender;
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('SetUserProfileScreen');
  };

  const handleChallenges = () => {
    navigation.navigate('ChallengesScreen');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    setAlertConfig({
      title: "Cerrar sesión",
      message: "¿Estás seguro de que quieres cerrar sesión?",
      onCancel: () => setAlertVisible(false),
      onConfirm: async () => {
        try {
          setAlertVisible(false);
          const result = await logoutUser(token);
          if (result) {
            contextLogout();
          }
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
          showErrorAlert('No se pudo cerrar sesión. Inténtalo de nuevo.');
        }
      },
      confirmText: "Cerrar sesión",
      cancelText: "Cancelar",
      type: "warning"
    });
    setAlertVisible(true);
  };

  const handleDeleteAccount = async () => {
    setAlertConfig({
      title: "Eliminar cuenta",
      message: "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.",
      onCancel: () => setAlertVisible(false),
      onConfirm: () => {
        setAlertVisible(false);
        // Segunda confirmación
        setAlertConfig({
          title: "Confirmación final",
          message: "Esta acción eliminará permanentemente tu cuenta y todos tus datos. ¿Estás completamente seguro?",
          onCancel: () => setAlertVisible(false),
          onConfirm: async () => {
            try {
              setAlertVisible(false);
              const result = await deleteUserAccount(token);
              if (result) {
                showSuccessAlert("Cuenta eliminada", "Tu cuenta ha sido eliminada correctamente.", () => contextLogout());
              }
            } catch (error) {
              console.error('Error al eliminar cuenta:', error);
              showErrorAlert('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
            }
          },
          confirmText: "Sí, eliminar mi cuenta",
          cancelText: "No, cancelar",
          type: "error"
        });
        setAlertVisible(true);
      },
      confirmText: "Eliminar cuenta",
      cancelText: "Cancelar",
      type: "warning"
    });
    setAlertVisible(true);
  };

  const showErrorAlert = (message, onConfirm = () => setAlertVisible(false)) => {
    setAlertConfig({
      title: "Error",
      message: message,
      onCancel: null,
      onConfirm: onConfirm,
      confirmText: "Aceptar",
      cancelText: null,
      type: "error"
    });
    setAlertVisible(true);
  };

  const showSuccessAlert = (title, message, onConfirm = () => setAlertVisible(false)) => {
    setAlertConfig({
      title: title,
      message: message,
      onCancel: null,
      onConfirm: onConfirm,
      confirmText: "Aceptar",
      cancelText: null,
      type: "success"
    });
    setAlertVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-back-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
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
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity onPress={() => {
          loadUserProfile();
          loadUserLevel();
        }} style={styles.refreshButton}>
          <Icon name="refresh-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Sección de Foto de Perfil */}
        <Card style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Icon name="person" size={60} color="#CCCCCC" />
              {/* Aquí se cargará la imagen cuando se implemente */}
            </View>
            <TouchableOpacity style={styles.editPhotoButton}>
              <Icon name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {userProfile && (
            <Text style={styles.userName}>{userProfile.name}</Text>
          )}
        </Card>

        {/* Tarjeta de Nivel de Usuario */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Icon name="trophy-outline" size={20} color="#ffd700" />
            <Text style={styles.cardTitle}>Nivel de Usuario</Text>
          </View>
          
          {userLevel ? (
            <View style={styles.levelContainer}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{userLevel.currentLevel}</Text>
              </View>
              <View style={styles.levelInfoContainer}>
                <View style={styles.levelProgressContainer}>
                  <Progress.Bar 
                    progress={userLevel.progressPercentage / 100} 
                    width={null} 
                    height={12}
                    color="#4c6ef5"
                    unfilledColor="#232342"
                    borderWidth={0}
                    borderRadius={6}
                    style={styles.progressBar}
                  />
                </View>
                <View style={styles.expInfoContainer}>
                  <Text style={styles.expText}>
                    {userLevel.currentExp} / {userLevel.expToNextLevel} XP
                  </Text>
                  <Text style={styles.progressText}>
                    {Math.round(userLevel.progressPercentage)}% completado
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.levelLoadingContainer}>
              <ActivityIndicator size="small" color="#4c6ef5" />
              <Text style={styles.levelLoadingText}>Cargando nivel...</Text>
            </View>
          )}
        </Card>

        {/* Tarjeta de Información Personal - Estilo similar a HomeScreen */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Icon name="person-outline" size={20} color="#ff7f50" />
            <Text style={styles.cardTitle}>Información Personal</Text>
          </View>
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : userProfile ? (
            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{userProfile.email}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Peso</Text>
                <Text style={styles.value}>{userProfile.weight} kg</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Altura</Text>
                <Text style={styles.value}>{userProfile.height} cm</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Edad</Text>
                <Text style={styles.value}>{userProfile.age} años</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Género</Text>
                <Text style={styles.value}>{getGenderLabel(userProfile.gender)}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>No hay información de perfil disponible</Text>
          )}
        </Card>

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <View style={styles.buttonContent}>
              <Icon name="create-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>Editar Perfil</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.editProfileButton} onPress={handleChallenges}>
            <View style={styles.buttonContent}>
              <Icon name="trophy-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>Mis Desafíos</Text>
            </View>
          </TouchableOpacity>
          
          {/* Nuevos botones para logout y eliminar cuenta */}
          <TouchableOpacity 
            style={[styles.editProfileButton, {backgroundColor: '#f59c42'}]} 
            onPress={handleLogout}
          >
            <View style={styles.buttonContent}>
              <Icon name="log-out-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editProfileButton, {backgroundColor: '#e74c3c'}]} 
            onPress={handleDeleteAccount}
          >
            <View style={styles.buttonContent}>
              <Icon name="trash-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>Eliminar Cuenta</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer />
      
      {/* Alerta personalizada */}
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

export default UserProfileScreen;