// /src/screens/RegisterScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from '../styles/screens/RegisterScreen.styles';
import { AuthContext } from '../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    register(name, email, password); // Llamada a la función del contexto
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrarse</Text>
      <Input
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Input
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <Input
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Registrarse" onPress={handleRegister} style={styles.button} />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;
