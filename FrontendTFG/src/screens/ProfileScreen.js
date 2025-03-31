import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, Text } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ProfileScreen.styles';
import healthConnectService from '../service/HealthConnectService';
import { AuthContext } from '../contexts/AuthContext';
import { FOOTER_SCREENS } from '../constants/navigation';

const ProfileScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    const initHealth = async () => {
      try {
        const isInitialized = await healthConnectService.initialize(token);
        if (isInitialized) {
          healthConnectService.addListener(handleHealthUpdate);
          const currentData = await healthConnectService.getCurrentData();
          updateHealthData(currentData);
        }
      } catch (error) {
        console.error('Error al inicializar Health Connect:', error);
      }
    };
    
    initHealth();
    
    return () => {
      healthConnectService.removeListener(handleHealthUpdate);
    };
  }, [token]);
  
  const handleHealthUpdate = (data) => {
    if (data.type === 'today-steps' || data.type === 'heart-rate') {
      updateHealthData(data);
    }
  };
  
  const updateHealthData = (data) => {
    setHealthData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  return (
    <View style={styles.container}>
      <Header title="Perfil" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Mi Perfil</Text>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>Juan Pérez</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>juan.perez@example.com</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.label}>Edad:</Text>
          <Text style={styles.value}>29</Text>
        </Card>
        <Button
          title="Editar Perfil"
          onPress={() => {
            // Lógica para editar el perfil
          }}
        />
      </ScrollView>
      <Footer 
        activeScreen="profile"
        navigation={navigation}
        screens={FOOTER_SCREENS}
      />
    </View>
  );
};

export default ProfileScreen;
