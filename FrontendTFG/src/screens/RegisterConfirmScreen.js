import React, { useState, useContext } from 'react';
import { View, Text, ActivityIndicator, Alert, StatusBar, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Icon from 'react-native-vector-icons/Ionicons';

const RegisterConfirmScreen = ({ route, navigation }) => {
  const { userData } = route.params;
  const { register } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Extraer los datos necesarios para el registro
      const { name, email, password } = userData;
      
      // Llamar a la función de registro del contexto de autenticación
      await register(name, email, password);
      
      // El registro fue exitoso, la navegación se manejará automáticamente
      // por el AuthContext que detectará el nuevo token
    } catch (err) {
      console.error('Error en el registro:', err);
      setError('Error al registrar usuario. Por favor, inténtalo de nuevo.');
      Alert.alert(
        "Error de registro",
        err.message || "Ha ocurrido un error durante el registro. Por favor, inténtalo de nuevo.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confirmar Registro</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <Icon name="information-circle-outline" size={24} color="#61dafb" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Estás a punto de crear una cuenta con los siguientes datos:
          </Text>
        </View>
        
        <View style={styles.dataContainer}>
          <View style={styles.dataRow}>
            <Icon name="person-outline" size={22} color="#ffa94d" />
            <Text style={styles.dataLabel}>Nombre:</Text>
            <Text style={styles.dataValue}>{userData.name}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.dataRow}>
            <Icon name="mail-outline" size={22} color="#74c0fc" />
            <Text style={styles.dataLabel}>Email:</Text>
            <Text style={styles.dataValue}>{userData.email}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.dataRow}>
            <Icon name="document-text-outline" size={22} color="#ff7f50" />
            <Text style={styles.dataLabel}>Términos:</Text>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, userData.acceptedTerms ? styles.acceptedText : styles.notAcceptedText]}>
                {userData.acceptedTerms ? 'Aceptados' : 'No aceptados'}
              </Text>
              {userData.acceptedTerms && (
                <Icon name="checkmark-circle" size={18} color="#4ade80" style={styles.statusIcon} />
              )}
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.dataRow}>
            <Icon name="analytics-outline" size={22} color="#9775fa" />
            <Text style={styles.dataLabel}>Recopilación de datos:</Text>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, userData.acceptedDataCollection ? styles.acceptedText : styles.notAcceptedText]}>
                {userData.acceptedDataCollection ? 'Aceptada' : 'No aceptada'}
              </Text>
              {userData.acceptedDataCollection && (
                <Icon name="checkmark-circle" size={18} color="#4ade80" style={styles.statusIcon} />
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.confirmTextContainer}>
          <Icon name="shield-checkmark-outline" size={20} color="#ff6b6b" style={styles.confirmIcon} />
          <Text style={styles.confirmText}>
            Al pulsar "Registrarse", aceptas nuestros términos y condiciones y nuestra política de privacidad.
          </Text>
        </View>
      
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={20} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      
        <View style={styles.buttonContainer}>
          <Button 
            title="Volver" 
            onPress={() => navigation.goBack()} 
            type="secondary"
            disabled={loading}
          />
          <Button 
            title={loading ? "Registrando..." : "Registrarse"} 
            onPress={handleRegister}
            disabled={loading}
          />
        </View>
      
        {loading && <ActivityIndicator size="large" color="#4c6ef5" style={styles.loader} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(97, 218, 251, 0.3)',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  dataContainer: {
    backgroundColor: '#1a1a2e',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(97, 218, 251, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  dataValue: {
    fontSize: 16,
    color: '#cccccc',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(97, 218, 251, 0.2)',
    marginHorizontal: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  statusText: {
    fontSize: 16,
    marginRight: 5,
  },
  acceptedText: {
    color: '#4ade80',
  },
  notAcceptedText: {
    color: '#ff6b6b',
  },
  statusIcon: {
    marginLeft: 5,
  },
  confirmTextContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 110, 245, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 110, 245, 0.3)',
  },
  confirmIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  confirmText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#cccccc',
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  errorText: {
    color: '#ff6b6b',
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default RegisterConfirmScreen;