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
import styles from '../styles/screens/RegisterScreen.styles';
import { AuthContext } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import Icon from 'react-native-vector-icons/Ionicons';

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
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

  const handleRegister = async () => {
    // Validación básica
    if (!name.trim() || !email.trim() || !password.trim()) {
      showAlert('Error', 'Por favor, completa todos los campos');
      return;
    }
    navigation.navigate('TermsAndPermissionsScreen', {
      userData: {
        name,
        email,
        password
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para comenzar tu viaje de salud</Text>

        <InputField
          label="Nombre"
          placeholder="Ingresa tu nombre"
          value={name}
          onChangeText={setName}
          icon="person-outline"
        />
        
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
          placeholder="Crea una contraseña"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          icon="lock-closed-outline"
          maxLength={10}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TouchableOpacity 
          onPress={handleRegister} 
          style={styles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.loginLink}
        >
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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

export default RegisterScreen;