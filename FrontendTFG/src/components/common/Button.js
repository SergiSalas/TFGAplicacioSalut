import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/components/Button.styles';

const Button = ({ title, onPress, style, textStyle, loading, disabled, icon }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <Icon name={icon} size={18} color="#FFFFFF" style={styles.buttonIcon} />
          )}
          <Text style={[styles.buttonText, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
