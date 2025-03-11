import React, { useEffect, useState ,useContext} from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ActivityScreen.styles';
import { getActivities } from '../service/ActivityService';
import { AuthContext } from '../contexts/AuthContext';

const ActivityScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      getActivities(token)
        .then(data => {
          setActivities(data);
        })
        .catch(error => {
          console.error('Error fetching activities:', error);
        });
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <Header title="Actividad Física" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
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
      </ScrollView>
      <Footer />
    </View>
  );
};

export default ActivityScreen;

