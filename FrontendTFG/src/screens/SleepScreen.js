import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/SleepScreen.styles';

const SleepScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Calidad del Son" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Horas de sueño</Text>
          <Text style={styles.metricValue}>7.5 hrs</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Calidad del sueño</Text>
          <Text style={styles.metricValue}>85%</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.metricTitle}>Ciclos de sueño</Text>
          <Text style={styles.metricValue}>4 ciclos</Text>
        </Card>
        <Button
          title="Ver Detalles del Son"
          onPress={() => {
            // Lógica para navegar a una pantalla de detalles del son
          }}
        />
      </ScrollView>
      <Footer />
    </View>
  );
};

export default SleepScreen;
