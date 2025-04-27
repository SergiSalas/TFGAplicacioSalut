import React from 'react';
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

const Header = ({ title, navigation, userProfile, userLevel, onRefresh }) => (
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
          {userProfile?.profileImage ? (
            <Image
              source={{ uri: userProfile.profileImage }}
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

export default Header;
