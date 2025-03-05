import React, { useState } from 'react';
import { View, ScrollView, Text, Switch } from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import styles from '../styles/screens/SettingsScreen.styles';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
  };

  return (
    <View style={styles.container}>
      <Header title="Ajustes" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notificaciones</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </View>
        {/* Puedes agregar más ítems de configuración aquí */}
        <Button
          title="Guardar cambios"
          onPress={() => {
            // Lógica para guardar la configuración
          }}
        />
      </ScrollView>
      <Footer />
    </View>
  );
};

export default SettingsScreen;
