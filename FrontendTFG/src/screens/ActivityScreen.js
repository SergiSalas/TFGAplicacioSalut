import React, { useEffect, useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ActivityScreen.styles';
import { getActivities } from '../service/ActivityService';
import { AuthContext } from '../contexts/AuthContext';
import { initSamsungHealth, requestSamsungPermissions, getStepCount, getHeartRate } from '../service/SamsungHealthService';

const ActivityScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [healthData, setHealthData] = useState({ steps: 0, heartRate: 0 });
  const { token } = useContext(AuthContext);

  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        getActivities(token)
          .then(data => {
            setActivities(data);
          })
          .catch(error => {
            console.error('Error fetching activities:', error);
          });
      }
    }, [token])
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Initialize Samsung Health integration
      initSamsungHealth()
        .then(() => {
          console.log('Samsung Health initialized');
          return requestSamsungPermissions();
        })
        .then(() => {
          console.log('Samsung Health permissions granted');
          // Get today's data
          const today = new Date();
          const startOfDay = new Date(today);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);
          
          return Promise.all([
            getStepCount(startOfDay, endOfDay),
            getHeartRate(startOfDay, endOfDay)
          ]);
        })
        .then(([stepData, heartRateData]) => {
          console.log('Health data retrieved:', stepData, heartRateData);
          
          // Process step count data
          let totalSteps = 0;
          if (stepData && stepData.length > 0) {
            stepData.forEach(step => {
              totalSteps += step.count;
            });
          }
          
          // Get latest heart rate
          let latestHeartRate = 0;
          if (heartRateData && heartRateData.length > 0) {
            // Sort by time descending to get latest
            heartRateData.sort((a, b) => b.time - a.time);
            latestHeartRate = heartRateData[0].rate;
          }
          
          setHealthData({
            steps: totalSteps,
            heartRate: latestHeartRate
          });
        })
        .catch(error => {
          console.error('Samsung Health error:', error);
          Alert.alert(
            'Samsung Health Error', 
            'No se pudo conectar con Samsung Health. Asegúrate de tener la aplicación instalada y haber dado los permisos necesarios.'
          );
        });
    }
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Actividad Física" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {Platform.OS === 'android' && (
          <Card style={styles.healthCard}>
            <Text style={styles.metricTitle}>Samsung Health</Text>
            <Text style={styles.metricValue}>Pasos hoy: {healthData.steps}</Text>
            <Text style={styles.metricValue}>Frec. cardíaca: {healthData.heartRate} bpm</Text>
          </Card>
        )}
        
        {activities.map((activity, index) => (
          <Card style={styles.card} key={index}>
            <Text style={styles.metricTitle}>{activity.type}</Text>
            <Text style={styles.metricValue}>Duración: {activity.duration} min</Text>
            <Text>Fecha: {activity.date}</Text>
            <Text>Descripción: {activity.description}</Text>
          </Card>
        ))}
        
        <Button
          title="Ver Detalles de Entrenamiento"
          onPress={() => {
            // Lógica para navegar a otra pantalla con más detalles
          }}
        />
        <Button
          title="Crear Nueva Actividad"
          onPress={() => navigation.navigate('CreateActivityScreen')}
        />
      </ScrollView>
      <Footer />
    </View>
  );
};

export default ActivityScreen;