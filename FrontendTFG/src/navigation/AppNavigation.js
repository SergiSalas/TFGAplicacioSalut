import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../contexts/AuthContext';

// Importación de pantallas para usuarios autenticados
import HomeScreen from '../screens/HomeScreen';
import ActivityScreen from '../screens/ActivityScreen';
import SleepScreen from '../screens/SleepScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import WorkoutListScreen from '../screens/WorkoutListScreen';
import ProgressScreen from '../screens/ProgressScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import CreateActivityScreen from '../screens/CreateActivityScreen';

// Importación de pantallas de autenticación
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { StackActions } from '@react-navigation/native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    // Mostrar indicador de carga mientras se recupera la sesión
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {(user && token) ?(
        // Navegación para usuarios autenticados
        <>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
          <Stack.Screen name="SleepScreen" component={SleepScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="WorkoutDetailScreen" component={WorkoutDetailScreen} />
          <Stack.Screen name="WorkoutListScreen" component={WorkoutListScreen} />
          <Stack.Screen name="ProgressScreen" component={ProgressScreen} />
          <Stack.Screen name="StatisticsScreen" component={StatisticsScreen} />
          <Stack.Screen name="CreateActivityScreen" component={CreateActivityScreen} />
        </>
      ) : (
        // Navegación para usuarios no autenticados
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

