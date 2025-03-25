import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { AuthContext } from '../contexts/AuthContext';
import { addDailyObjective } from '../service/ActivityService';
import styles from '../styles/screens/SetDailyObjectiveScreen.styles';
import { CommonActions } from '@react-navigation/native';

const SetDailyObjectiveScreen = ({ navigation }) => {
  const [dailyStepsObjective, setDailyStepsObjective] = useState('10000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, setIsNewUser } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!dailyStepsObjective || isNaN(dailyStepsObjective) || parseInt(dailyStepsObjective) <= 0) {
      Alert.alert('Error', 'Por favor, introduce un objetivo válido de pasos diarios');
      return;
    }

    try {
      setIsSubmitting(true);
      await addDailyObjective(token, parseInt(dailyStepsObjective));
      
      setIsNewUser(false);
      
      Alert.alert(
        'Objetivo establecido',
        `Has establecido un objetivo de ${dailyStepsObjective} pasos diarios`,
        [{ 
          text: 'Continuar', 
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'HomeScreen' }],
              })
            );
          } 
        }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el objetivo. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Establece tu objetivo diario" />
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>¿Cuántos pasos quieres dar cada día?</Text>
          <Text style={styles.cardText}>
            Establece un objetivo realista que te ayude a mantenerte activo. 
            La OMS recomienda al menos 10,000 pasos diarios para una vida saludable.
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={dailyStepsObjective}
              onChangeText={setDailyStepsObjective}
              keyboardType="numeric"
              placeholder="Ej: 10000"
            />
            <Text style={styles.inputLabel}>pasos</Text>
          </View>
          
          <View style={styles.presetContainer}>
            <Button 
              title="5,000" 
              onPress={() => setDailyStepsObjective('5000')} 
              style={styles.presetButton}
            />
            <Button 
              title="7,500" 
              onPress={() => setDailyStepsObjective('7500')} 
              style={styles.presetButton}
            />
            <Button 
              title="10,000" 
              onPress={() => setDailyStepsObjective('10000')} 
              style={styles.presetButton}
            />
          </View>

          <Button
            title={isSubmitting ? "Guardando..." : "Guardar Objetivo"}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </Card>
      </View>
      <Footer />
    </View>
  );
};

export default SetDailyObjectiveScreen; 