import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Image, StatusBar } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { AuthContext } from '../contexts/AuthContext';
import { getUserProfile } from '../service/UserService';
import styles from '../styles/screens/UserProfileScreen.styles';
import Icon from 'react-native-vector-icons/Ionicons';
import Footer from '../components/layout/Footer';

const UserProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    loadUserProfile();
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
        <TouchableOpacity onPress={loadUserProfile} style={styles.refreshButton}>
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

        {/* Tarjeta de Información Personal - Estilo similar a HomeScreen */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Icon name="person-outline" size={20} color="#61dafb" />
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
        
        {/* Botón con estilo similar a HomeScreen */}
        <TouchableOpacity 
          style={styles.editProfileButton} 
          onPress={handleEditProfile}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Editar Perfil</Text>
            <Icon name="create-outline" size={20} color="#fff" style={{marginLeft: 8}} />
          </View>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Agregar el Footer */}
      <Footer activeScreen="profile" />
    </View>
  );
};

export default UserProfileScreen; 