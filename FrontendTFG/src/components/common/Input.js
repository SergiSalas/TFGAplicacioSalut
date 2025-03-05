import React from 'react';
import { TextInput } from 'react-native';
import styles from '../../styles/components/Input.styles';

const Input = ({ placeholder, value, onChangeText, style, ...rest }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      {...rest}
    />
  );
};

export default Input;
