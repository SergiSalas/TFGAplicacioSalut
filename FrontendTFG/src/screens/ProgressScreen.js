import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ProgressScreen.styles';

const ProgressScreen = ({ navigation }) => {
  // Datos de ejemplo para mostrar el progreso
  const progressData = {
    activity: 'Incremento del 15% en pasos diarios',
    sleep: 'Mejora del 10% en calidad del sueño',
    hydration: 'Consumo del 90% del objetivo diario',
  };

  return (
    <View style={styles.container}>
      <Header title="Progreso" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Actividad Física</Text>
          <Text style={styles.metricValue}>{progressData.activity}</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Calidad del Sueño</Text>
          <Text style={styles.metricValue}>{progressData.sleep}</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Hidratación</Text>
          <Text style={styles.metricValue}>{progressData.hydration}</Text>
        </Card>
        <Button
          title="Ver Detalles"
          onPress={() => {
            // Lógica para navegar a una pantalla de detalles más avanzados
          }}
        />
      </ScrollView>
      <Footer />
    </View>
  );
};

export default ProgressScreen;
