import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../../styles/components/Header.styles';

const Header = ({ title, onBackPress, style }) => {
  return (
    <View style={[styles.container, style]}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default Header;
