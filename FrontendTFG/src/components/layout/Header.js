import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import headerStyles from '../../styles/components/Header.styles';
import { ProfileImageCache } from '../../cache/ProfileImageCache';
import { AuthContext } from '../../contexts/AuthContext';

const Header = ({ title, navigation, userProfile, userLevel, onRefresh }) => {
  const [profileImage, setProfileImage] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    // Intentar cargar la imagen desde la caché solo si hay un usuario autenticado
    const loadProfileImage = async () => {
      try {
        // Solo cargar imagen si hay un token válido
        if (!token) {
          setProfileImage(null);
          return;
        }
        
        // Primero intentamos obtener la imagen desde la caché
        const cachedImage = await ProfileImageCache.getImageFromCache();
        if (cachedImage) {
          setProfileImage(cachedImage);
        } else if (userProfile?.profileImage) {
          // Si no hay imagen en caché pero sí en el perfil, la usamos y guardamos en caché
          setProfileImage(userProfile.profileImage);
          await ProfileImageCache.saveImageToCache(userProfile.profileImage);
        }
      } catch (error) {
        console.error('Error al cargar imagen de perfil en Header:', error);
      }
    };

    loadProfileImage();
  }, [userProfile, token]);

  return (
    <SafeAreaView
      style={[
        headerStyles.container,
        Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight }
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#121212"
        translucent={false}
      />
      <View style={headerStyles.header}>
        {/* Perfil */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileScreen')}
          style={headerStyles.profileContainer}
        >
          <View style={headerStyles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={headerStyles.profileImage}
              />
            ) : (
              <Icon name="person" size={24} color="#CCCCCC" />
            )}
          </View>
          {userLevel && (
            <View style={headerStyles.levelBadge}>
              <Text style={headerStyles.levelText}>
                Nv. {userLevel.currentLevel}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Título centrado */}
        <View style={headerStyles.titleContainer}>
          <Text style={headerStyles.title}>{title}</Text>
        </View>

        {/* Refresh */}
        <TouchableOpacity onPress={onRefresh} style={headerStyles.refreshButton}>
          <Icon name="refresh-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;