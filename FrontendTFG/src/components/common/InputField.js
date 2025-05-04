import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  keyboardType = 'default',
  editable = true,
  icon,
  style,
  ...props 
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer, 
        !editable && styles.disabledContainer,
        style
      ]}>
        {icon && (
          <Icon name={icon} size={20} color="#AAAAAA" style={styles.icon} />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A3A',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#3A3A4A',
  },
  disabledContainer: {
    backgroundColor: '#232333',
    borderColor: '#2A2A3A',
    opacity: 0.7,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default InputField;