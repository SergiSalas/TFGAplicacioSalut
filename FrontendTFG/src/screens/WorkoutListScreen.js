import React from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import styles from '../styles/screens/WorkoutListScreen.styles';

const workoutsData = [
  { id: '1', title: 'Entrenamiento Matutino', duration: '30 min' },
  { id: '2', title: 'Entrenamiento Vespertino', duration: '45 min' },
  { id: '3', title: 'Sesión de Cardio', duration: '25 min' },
];

const WorkoutListScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('WorkoutDetailScreen', { workout: item })
      }
    >
      <Card style={styles.card}>
        <Text style={styles.workoutTitle}>{item.title}</Text>
        <Text style={styles.workoutDuration}>{item.duration}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Historial de Entrenamientos"
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        contentContainerStyle={styles.content}
        data={workoutsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <Footer />
    </View>
  );
};

export default WorkoutListScreen;
