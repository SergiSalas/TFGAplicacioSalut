import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { AuthContext } from '../contexts/AuthContext';
import styles from '../styles/screens/SetUserProfileScreen.styles';
import { CommonActions } from '@react-navigation/native';
import { updateUserProfile } from '../service/UserService'; // Necesitarás crear este servicio

const SetUserProfileScreen = ({ navigation }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, setIsNewUser } = useContext(AuthContext);

  const validateInputs = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseInt(height);
    const ageNum = parseInt(age);

    if (!weight || !height || !age || isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      Alert.alert('Error', 'Por favor, introduce valores válidos para todos los campos');
      return false;
    }

    if (weightNum < 30 || weightNum > 300) {
      Alert.alert('Error', 'Por favor, introduce un peso válido entre 30 y 300 kg');
      return false;
    }

    if (heightNum < 100 || heightNum > 250) {
      Alert.alert('Error', 'Por favor, introduce una altura válida entre 100 y 250 cm');
      return false;
    }

    if (ageNum < 12 || ageNum > 120) {
      Alert.alert('Error', 'Por favor, introduce una edad válida entre 12 y 120 años');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      setIsSubmitting(true);
      await updateUserProfile(token, {
        height: parseInt(height),
        weight: parseFloat(weight),
        age: parseInt(age)
      });

      Alert.alert(
        'Perfil actualizado',
        'Tus datos han sido guardados correctamente',
        [{ 
          text: 'Continuar', 
          onPress: () => {
            navigation.navigate('SetDailyObjectiveScreen');
          }
        }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los datos. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Perfil de Usuario" />
      
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Completa tu perfil</Text>
          <Text style={styles.subtitle}>
            Estos datos nos ayudarán a calcular mejor tus métricas de actividad
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Altura (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
              placeholder="Ej: 175"
              maxLength={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="Ej: 70.5"
              maxLength={5}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Edad</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="Ej: 25"
              maxLength={3}
            />
          </View>

          <Button
            title="Guardar y Continuar"
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </Card>
      </View>
    </View>
  );
};

export default SetUserProfileScreen; 