import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import NotificationService from './src/services/NotificationService';

function App() {
  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await NotificationService.requestUserPermission();
      if (hasPermission) {
        const token = await NotificationService.getToken();
        
        // Here you would typically send this token to your backend
        // so you can target this device for notifications
        
        // Register handlers
        const unsubscribeForeground = NotificationService.registerForegroundHandler();
        NotificationService.registerBackgroundHandler();
        const unsubscribeOpened = NotificationService.registerNotificationOpenedApp();
        NotificationService.checkInitialNotification();
        
        // Optional: Subscribe to topics if you want to use topic messaging
        // NotificationService.subscribeToTopic('news');
        
        return () => {
          unsubscribeForeground();
          unsubscribeOpened();
        };
      }
    };
    
    setupNotifications();
  }, []);
  
  return (
    <AuthProvider>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;