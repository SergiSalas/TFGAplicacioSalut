import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../styles/components/Footer.styles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const Footer = ({ style, activeScreen = 'home' }) => {
  const navigation = useNavigation();

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={[styles.navButton, activeScreen === 'home' && styles.activeNavButton]} 
        onPress={() => handleNavigation('HomeScreen')}
      >
        <Icon 
          name={activeScreen === 'home' ? "home" : "home-outline"} 
          size={24} 
          color={activeScreen === 'home' ? '#4c6ef5' : '#757575'} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navButton, activeScreen === 'activity' && styles.activeNavButton]} 
        onPress={() => handleNavigation('ActivityScreen')}
      >
        <Icon 
          name={activeScreen === 'activity' ? "fitness" : "fitness-outline"} 
          size={24} 
          color={activeScreen === 'activity' ? '#4c6ef5' : '#757575'} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navButton, activeScreen === 'profile' && styles.activeNavButton]} 
        onPress={() => handleNavigation('UserProfileScreen')}
      >
        <Icon 
          name={activeScreen === 'profile' ? "person" : "person-outline"} 
          size={24} 
          color={activeScreen === 'profile' ? '#4c6ef5' : '#757575'} 
        />
      </TouchableOpacity>
    </View>
  );
};

export default Footer;
