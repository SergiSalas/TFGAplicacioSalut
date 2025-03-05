import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/WorkoutDetailScreen.styles';

const WorkoutDetailScreen = ({ navigation, route }) => {
  // Se espera que se pasen los datos del entrenamiento mediante route.params
  const { workout } = route.params || {
    duration: '30 min',
    distance: '5 km',
    calories: '250 kcal',
    heartRate: '140 bpm',
  };

  return (
    <View style={styles.container}>
      <Header
        title="Detalle de Entrenamiento"
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Duración</Text>
          <Text style={styles.metricValue}>{workout.duration}</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Distancia</Text>
          <Text style={styles.metricValue}>{workout.distance}</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Calorías</Text>
          <Text style={styles.metricValue}>{workout.calories}</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Frecuencia Cardíaca</Text>
          <Text style={styles.metricValue}>{workout.heartRate}</Text>
        </Card>
      </ScrollView>
      <Footer />
    </View>
  );
};

export default WorkoutDetailScreen;
