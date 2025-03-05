import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/components/Footer.styles';

const Footer = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>© 2025 Mi App</Text>
    </View>
  );
};

export default Footer;
