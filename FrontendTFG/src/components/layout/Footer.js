import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Footer = ({ activeScreen, navigation, screens }) => {
  const handleNavigation = (screenName) => {
    switch (screenName) {
      case 'home':
        navigation.navigate('HomeScreen');
        break;
      case 'activity':
        navigation.navigate('ActivityScreen');
        break;
      case 'sleep':
        navigation.navigate('SleepScreen');
        break;
      case 'profile':
        navigation.navigate('UserProfileScreen');
        break;
    }
  };

  return (
    <View style={styles.footer}>
      {screens.map((screen) => (
        <TouchableOpacity
          key={screen.name}
          style={styles.footerItem}
          onPress={() => handleNavigation(screen.name)}
        >
          <Icon
            name={screen.icon}
            size={24}
            color={activeScreen === screen.name ? '#61dafb' : '#8e8e93'}
          />
          <Text
            style={[
              styles.footerLabel,
              { color: activeScreen === screen.name ? '#61dafb' : '#8e8e93' }
            ]}
          >
            {screen.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  footerLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Footer;
