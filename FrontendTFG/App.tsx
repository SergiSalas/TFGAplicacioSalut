import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigation';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
