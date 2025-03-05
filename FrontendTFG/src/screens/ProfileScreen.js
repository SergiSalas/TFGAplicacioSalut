import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ProfileScreen.styles';

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Perfil" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
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
      <Footer />
    </View>
  );
};

export default ProfileScreen;
