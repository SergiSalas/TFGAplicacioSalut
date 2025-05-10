import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import InputField from '../components/common/InputField';
import CustomAlert from '../components/common/CustomAlert';
import styles from '../styles/screens/LoginScreen.styles';
import { AuthContext } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: '',
    confirmText: '',
  });

  const handleEmailChange = (text) => {
    if (text.length <= 20) {
      setEmail(text);
      setEmailError('');
    } else {
      setEmailError('El email no puede exceder los 20 caracteres');
    }
  };

  const handlePasswordChange = (text) => {
    if (text.length <= 10) {
      setPassword(text);
      setPasswordError('');
    } else {
      setPasswordError('La contraseña no puede exceder los 10 caracteres');
    }
  };

  const showAlert = (title, message, type = 'error', confirmText = 'Entendido') => {
    setAlertConfig({
      title,
      message,
      type,
      confirmText,
    });
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    // Validación básica
    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Por favor, completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      showAlert(
        'Error',
        'No se pudo iniciar sesión. ' + (error.message || 'Verifica tus credenciales')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Bienvenido de nuevo a tu asistente de salud</Text>

        <InputField
          label="Correo electrónico"
          placeholder="Ingresa tu email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          icon="mail-outline"
          maxLength={20}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        
        <InputField
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          icon="lock-closed-outline"
          maxLength={10}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TouchableOpacity 
          onPress={handleLogin} 
          style={styles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('RegisterScreen')}
          style={styles.registerLink}
        >
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        onConfirm={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;