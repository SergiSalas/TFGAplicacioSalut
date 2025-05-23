import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { CheckBox } from 'react-native-elements';
import Button from '../components/common/Button';
import CustomAlert from '../components/common/CustomAlert';
import Icon from 'react-native-vector-icons/Ionicons';

const TermsAndPermissionsScreen = ({ route, navigation }) => {
  const { userData } = route.params;
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataCollection, setAcceptedDataCollection] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const showAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const handleContinue = () => {
    if (!acceptedTerms || !acceptedDataCollection) {
      showAlert({
        title: "Aceptación requerida",
        message: "Debes aceptar los términos y condiciones y la política de recopilación de datos para continuar.",
        type: "warning",
        confirmText: "Entendido",
        onConfirm: () => setAlertVisible(false)
      });
      return;
    }

    // Navegar a la pantalla de registro con los datos y las preferencias
    navigation.navigate('RegisterConfirmScreen', {
      userData: {
        ...userData,
        acceptedTerms,
        acceptedDataCollection
      }
    });
  };

  const handleCancel = () => {
    showAlert({
      title: "Cancelar registro",
      message: "¿Estás seguro de que deseas cancelar el registro? Todos los datos ingresados se perderán.",
      type: "warning",
      confirmText: "Sí, cancelar",
      cancelText: "No, continuar",
      onConfirm: () => navigation.navigate('LoginScreen'),
      onCancel: () => setAlertVisible(false)
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Términos y Permisos</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.termsContainer}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="document-text-outline" size={22} color="#ff7f50" />
            <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
          </View>
          <Text style={styles.termsText}>
            Al utilizar nuestra aplicación, aceptas los siguientes términos y condiciones:
          </Text>
          
          <View style={styles.termItem}>
            <Icon name="checkmark-circle-outline" size={18} color="#4ade80" style={styles.bulletIcon} />
            <Text style={styles.termItemText}>
              La aplicación recopila datos de salud y actividad física con el único propósito de proporcionarte estadísticas y seguimiento personalizado.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="checkmark-circle-outline" size={18} color="#4ade80" style={styles.bulletIcon} />
            <Text style={styles.termItemText}>
              Tus datos personales serán tratados de acuerdo con nuestra política de privacidad y la legislación vigente.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="checkmark-circle-outline" size={18} color="#4ade80" style={styles.bulletIcon} />
            <Text style={styles.termItemText}>
              No compartiremos tus datos con terceros sin tu consentimiento explícito.
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="checkmark-circle-outline" size={18} color="#4ade80" style={styles.bulletIcon} />
            <Text style={styles.termItemText}>
              Puedes solicitar la eliminación de tu cuenta y todos tus datos en cualquier momento.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionTitleContainer}>
            <Icon name="analytics-outline" size={22} color="#61dafb" />
            <Text style={styles.sectionTitle}>Política de Recopilación de Datos</Text>
          </View>
          <Text style={styles.termsText}>
            Nuestra aplicación recopila los siguientes tipos de datos:
          </Text>
          
          <View style={styles.termItem}>
            <Icon name="fitness-outline" size={18} color="#ff6b6b" style={styles.bulletIcon} />
            <Text style={styles.termItemText}>Datos de actividad física (pasos, ejercicios, etc.)</Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="bed-outline" size={18} color="#9775fa" style={styles.bulletIcon} />
            <Text style={styles.termItemText}>Datos de sueño</Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="water-outline" size={18} color="#74c0fc" style={styles.bulletIcon} />
            <Text style={styles.termItemText}>Datos de hidratación</Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="person-outline" size={18} color="#ffa94d" style={styles.bulletIcon} />
            <Text style={styles.termItemText}>Información básica del perfil</Text>
          </View>
          
          <Text style={[styles.termsText, styles.purposeText]}>
            Estos datos se utilizan exclusivamente para proporcionarte estadísticas, recomendaciones personalizadas y seguimiento de tu progreso.
          </Text>
        </View>

        <View style={styles.checkboxContainer}>
          <CheckBox
            title="Acepto los términos y condiciones"
            checked={acceptedTerms}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            containerStyle={styles.checkbox}
            textStyle={styles.checkboxText}
            checkedColor="#4c6ef5"
            uncheckedColor="#666"
            checkedIcon="check-square"
            uncheckedIcon="square-o"
          />
          
          <CheckBox
            title="Acepto la política de recopilación de datos"
            checked={acceptedDataCollection}
            onPress={() => setAcceptedDataCollection(!acceptedDataCollection)}
            containerStyle={styles.checkbox}
            textStyle={styles.checkboxText}
            checkedColor="#4c6ef5"
            uncheckedColor="#666"
            checkedIcon="check-square"
            uncheckedIcon="square-o"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Cancelar" onPress={handleCancel} type="secondary" />
          <Button title="Continuar" onPress={handleContinue} />
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onCancel={alertConfig.onCancel}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        type={alertConfig.type}
      />
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
    flex: 1,
    padding: 20,
  },
  termsContainer: {
    marginBottom: 20,
    padding: 18,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(97, 218, 251, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    color: '#cccccc',
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 5,
  },
  bulletIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  termItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#cccccc',
  },
  purposeText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#a0a0a0',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(97, 218, 251, 0.3)',
    marginVertical: 15,
  },
  checkboxContainer: {
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(97, 218, 251, 0.3)',
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 10,
    paddingVertical: 10,
  },
  checkboxText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
});

export default TermsAndPermissionsScreen;