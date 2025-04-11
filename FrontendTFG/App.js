import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, Alert } from 'react-native';
import AppNavigator from './src/navigation/AppNavigation';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import NotificationService from './src/services/NotificationService';
// Import Firebase
import firebase from '@react-native-firebase/app';

function App() {
  const [fcmToken, setFcmToken] = useState(null);
  
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Explicitly provide Firebase configuration
        const firebaseConfig = {
          apiKey: "AIzaSyDuJkksoyPB_jAdXFw5oD9BRNZRYI1HKaY",
          projectId: "tfgaplicaciosaludsergi",
          appId: "1:931102378335:android:b07e8cec7a94ed08db8eea",
          storageBucket: "tfgaplicaciosaludsergi.firebasestorage.app",
          messagingSenderId: "931102378335",
        };

        // Ensure Firebase is initialized with explicit config
        if (!firebase.apps.length) {
          console.log('Initializing Firebase from App.js with explicit config');
          await firebase.initializeApp(firebaseConfig);
          console.log('Firebase initialized successfully');
        } else {
          console.log('Firebase already initialized');
        }
        
        // Now that Firebase is initialized, we can request permissions
        const hasPermission = await NotificationService.requestUserPermission();
        console.log('Notification permission granted:', hasPermission);
        
        if (hasPermission) {
          const token = await NotificationService.getToken();
          console.log('FCM Token:', token);
          setFcmToken(token);
          
          // Register handlers
          const unsubscribeForeground = NotificationService.registerForegroundHandler();
          NotificationService.registerBackgroundHandler();
          const unsubscribeOpened = NotificationService.registerNotificationOpenedApp();
          NotificationService.checkInitialNotification();
          
          return () => {
            if (unsubscribeForeground) unsubscribeForeground();
            if (unsubscribeOpened) unsubscribeOpened();
          };
        }
      } catch (error) {
        console.error('Notification setup error:', error);
      }
    };
    
    setupNotifications();
    
    // Programar verificación de objetivos de pasos a las 2 PM
    NotificationService.scheduleStepGoalCheck('14:00');
    
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