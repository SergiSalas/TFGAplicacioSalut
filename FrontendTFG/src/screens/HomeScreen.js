import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from '../styles/screens/HomeScreen.styles';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Inicio" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Bienvenido a la App de Salud</Text>
          <Text style={styles.cardText}>
            Aquí podrás monitorizar tu actividad física, calidad del son y tu hidratación.
          </Text>
          <Button
            title="Ver Detalles"
            onPress={() => navigation.navigate('ActivityScreen')}
          />
        </Card>
        {/* Puedes agregar más Cards o secciones según necesites */}
      </ScrollView>
      <Footer />
    </View>
  );
};

export default HomeScreen;
