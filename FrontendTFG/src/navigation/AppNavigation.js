import React, { useContext, useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import AppContent from '../components/AppContent';

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
import ChallengesScreen from '../screens/ChallengesScreen';

// Importación de pantallas de autenticación
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { StackActions } from '@react-navigation/native';

// Añadir la importación de la nueva pantalla
import SetDailyObjectiveScreen from '../screens/SetDailyObjectiveScreen';
import SetUserProfileScreen from '../screens/SetUserProfileScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import TrendsScreen from '../screens/TrendsScreen';

const Stack = createStackNavigator();

// Separar la definición del navegador de su uso
const StackNavigator = ({ isAuthenticated, isNewUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Navegación para usuarios autenticados
        <>
          {isNewUser ? (
            // Para usuarios nuevos, primero configurar el perfil
            <>
              <Stack.Screen name="SetUserProfileScreen" component={SetUserProfileScreen} />
              <Stack.Screen name="SetDailyObjectiveScreen" component={SetDailyObjectiveScreen} />
            </>
          ) : (
            // Para usuarios existentes, mostrar la estructura normal de navegación
            <>
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
              <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
              <Stack.Screen name="SleepScreen" component={SleepScreen} />
              <Stack.Screen name="ProfileScreen" component={UserProfileScreen} />
              <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
              <Stack.Screen name="WorkoutDetailScreen" component={WorkoutDetailScreen} />
              <Stack.Screen name="WorkoutListScreen" component={WorkoutListScreen} />
              <Stack.Screen name="ProgressScreen" component={ProgressScreen} />
              <Stack.Screen name="StatisticsScreen" component={StatisticsScreen} />
              <Stack.Screen name="CreateActivityScreen" component={CreateActivityScreen} />
              <Stack.Screen name="SetDailyObjectiveScreen" component={SetDailyObjectiveScreen} />
              <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{ headerShown: false }} />
              <Stack.Screen name="TrendsScreen" component={TrendsScreen}/>
              <Stack.Screen name="ChallengesScreen" component={ChallengesScreen} />
            </>
          )}
        </>
      ) : (
        // Navegación para usuarios NO autenticados
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        </>
      )}
      {/* Remove this line: <Stack.Screen name="TrendsScreen" component={TrendsScreen} /> */}
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { token, loading, isNewUser, registerNavigation } = useContext(AuthContext);
  const isAuthenticated = !!token;
  const navigationRef = useRef(null);

  useEffect(() => {
    if (navigationRef.current) {
      registerNavigation(navigationRef.current);
    }
  }, [navigationRef.current, registerNavigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <AppContent>
        <StackNavigator 
          isAuthenticated={isAuthenticated} 
          isNewUser={isNewUser} 
        />
      </AppContent>
    </NavigationContainer>
  );
};

export default AppNavigator;

