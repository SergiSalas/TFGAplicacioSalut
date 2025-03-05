import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ActivityScreen.styles';

const ActivityScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Actividad Física" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Pasos diarios</Text>
          <Text style={styles.metricValue}>10,000</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Calorías quemadas</Text>
          <Text style={styles.metricValue}>500 kcal</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Distancia recorrida</Text>
          <Text style={styles.metricValue}>7 km</Text>
        </Card>
        <Button
          title="Ver Detalles de Entrenamiento"
          onPress={() => {
            // Agrega la lógica para navegar a otra pantalla con más detalles
          }}
        />
      </ScrollView>
      <Footer />
    </View>
  );
};

export default ActivityScreen;
