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
        
        // Try to initialize with error handling for missing methods
        try {
          // Check if the method exists before calling it
          if (typeof NotificationService.initialize === 'function') {
            const initialized = await NotificationService.initialize();
            console.log('Notification service initialized:', initialized ? 'success' : 'failed');
            
            if (initialized) {
              const token = await NotificationService.getToken();
              console.log('FCM Token:', token);
              setFcmToken(token);
            }
          } else {
            console.log('NotificationService.initialize is not a function');
            
            // Fallback: Try to request permissions and get token directly
            if (typeof NotificationService.requestUserPermission === 'function') {
              const hasPermission = await NotificationService.requestUserPermission();
              if (hasPermission && typeof NotificationService.getToken === 'function') {
                const token = await NotificationService.getToken();
                console.log('FCM Token (fallback):', token);
                setFcmToken(token);
              }
            }
          }
        } catch (notificationError) {
          console.error('Notification initialization error:', notificationError);
        }
      } catch (error) {
        console.error('Firebase setup error:', error);
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