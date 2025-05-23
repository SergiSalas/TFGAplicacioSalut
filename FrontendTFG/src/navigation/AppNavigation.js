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
import CreateActivityScreen from '../screens/CreateActivityScreen';
import ChallengesScreen from '../screens/ChallengesScreen';

// Importación de pantallas de autenticación
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TermsAndPermissionsScreen from '../screens/TermsAndPermissionsScreen';
import RegisterConfirmScreen from '../screens/RegisterConfirmScreen';

// Importación de pantallas extra
import SetDailyObjectiveScreen from '../screens/SetDailyObjectiveScreen';
import SetUserProfileScreen from '../screens/SetUserProfileScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import TrendsScreen from '../screens/TrendsScreen';
import InitialUserProfileScreen from '../screens/InitialUserProfileScreen';

const Stack = createStackNavigator();

const StackNavigator = ({ isAuthenticated, isNewUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          {isNewUser ? (
            <>
              <Stack.Screen name="InitialUserProfileScreen" component={InitialUserProfileScreen} />
              <Stack.Screen name="SetDailyObjectiveScreen" component={SetDailyObjectiveScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
              <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
              <Stack.Screen name="SleepScreen" component={SleepScreen} />
              <Stack.Screen name="ProfileScreen" component={UserProfileScreen} />
              <Stack.Screen name="CreateActivityScreen" component={CreateActivityScreen} />
              <Stack.Screen name="SetDailyObjectiveScreen" component={SetDailyObjectiveScreen} />
              <Stack.Screen name="SetUserProfileScreen" component={SetUserProfileScreen} />
              <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{ headerShown: false }} />
              <Stack.Screen name="TrendsScreen" component={TrendsScreen}/>
              <Stack.Screen name="ChallengesScreen" component={ChallengesScreen} />
            </>
          )}
        </>
      ) : (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="TermsAndPermissionsScreen" component={TermsAndPermissionsScreen} />
          <Stack.Screen name="RegisterConfirmScreen" component={RegisterConfirmScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { token, loading, isNewUser, registerNavigation } = useContext(AuthContext);
  const isAuthenticated = !!token;
  const navigationRef = useRef(null);

  // Ref para guardar el valor anterior de isNewUser
  const prevIsNewUser = useRef(isNewUser);

  useEffect(() => {
    if (navigationRef.current) {
      registerNavigation(navigationRef.current);
    }
  }, [navigationRef.current, registerNavigation]);

  // Efecto para detectar el cambio de isNewUser y navegar correctamente
  useEffect(() => {
    if (
      prevIsNewUser.current === true &&
      isNewUser === false &&
      navigationRef.current
    ) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    }
    prevIsNewUser.current = isNewUser;
  }, [isNewUser]);

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