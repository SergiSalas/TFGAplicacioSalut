import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../../styles/components/Footer.styles';
import { FOOTER_SCREENS } from '../../constants/navigation';

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const getScreenName = (name) => {
    return `${name.charAt(0).toUpperCase()}${name.slice(1)}Screen`;
  };

  const isActive = (name) => {
    const screenName = getScreenName(name);
    return route.name === screenName;
  };

  const navigateTo = (name) => {
    const screenName = getScreenName(name);
    console.log(`Navigating to: ${screenName}`);
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.footer}>
      {FOOTER_SCREENS.map((screen) => (
        <TouchableOpacity
          key={screen.name}
          style={styles.footerItem}
          onPress={() => navigateTo(screen.name)}
        >
          <Icon
            name={isActive(screen.name) ? screen.icon.replace('-outline', '') : screen.icon}
            size={24}
            color={isActive(screen.name) ? '#61dafb' : '#ffffff'}
          />
          <Text
            style={[
              styles.footerText,
              isActive(screen.name) && styles.footerTextActive,
            ]}
          >
            {screen.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Footer;