import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl,
  StatusBar,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Progress from 'react-native-progress';
import { AuthContext } from '../contexts/AuthContext';
import ChallengeService from '../service/ChallengeService';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/ChallengesScreen.styles';

const ChallengesScreen = ({ navigation }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    loadChallenges();
  }, [token]);

  const loadChallenges = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const challengesData = await ChallengeService.getUserChallenges(token);
      console.log('Desafíos cargados:', challengesData); // Añadir log para depuración
      setChallenges(challengesData);
    } catch (error) {
      console.error('Error al cargar desafíos:', error);
      setError('No se pudieron cargar los desafíos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleGenerateChallenges = async () => {
    try {
      setLoading(true);
      const newChallenges = await ChallengeService.generateDailyChallenges(token);
      console.log('Nuevos desafíos generados:', newChallenges); // Añadir log para depuración
      setChallenges(newChallenges);
      Alert.alert('Éxito', 'Se han generado nuevos desafíos diarios');
    } catch (error) {
      console.error('Error al generar desafíos:', error);
      Alert.alert('Error', 'No se pudieron generar nuevos desafíos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Función para obtener el icono según el tipo de desafío
  const getChallengeIcon = (type) => {
    switch (type) {
      case 'STEPS':
        return 'footsteps-outline';
      case 'ACTIVITY_DURATION':
        return 'fitness-outline';
      case 'SLEEP_HOURS':
        return 'moon-outline';
      default:
        return 'trophy-outline';
    }
  };

  // Función para obtener el nombre legible del tipo de desafío
  const getChallengeTypeName = (type) => {
    switch (type) {
      case 'STEPS':
        return 'Pasos';
      case 'ACTIVITY_DURATION':
        return 'Actividad';
      case 'SLEEP_HOURS':
        return 'Sueño';
      default:
        return 'Desafío';
    }
  };

  // Renderizar un desafío individual
  const renderChallengeItem = (challenge) => {
    const isCompleted = challenge.completed;
    const progressValue = challenge.progress / 100;
    
    return (
      <View 
        key={challenge.id} 
        style={[
          styles.challengeItem, 
          isCompleted ? styles.completedChallenge : styles.pendingChallenge
        ]}
      >
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>{challenge.description}</Text>
          <View style={styles.expReward}>
            <Text style={styles.expText}>+{challenge.expReward} XP</Text>
          </View>
        </View>
        
        <View style={styles.challengeTypeContainer}>
          <Icon 
            name={getChallengeIcon(challenge.type)} 
            size={14} 
            color="#AAAAAA" 
          />
          <Text style={styles.challengeType}>
            {getChallengeTypeName(challenge.type)}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <Progress.Bar 
            progress={progressValue} 
            width={null} 
            height={8}
            color={isCompleted ? "#4cd964" : "#4c6ef5"}
            unfilledColor="#2A2A4A"
            borderWidth={0}
            borderRadius={4}
          />
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {challenge.currentValue} / {challenge.targetValue}
              {challenge.type === 'SLEEP_HOURS' ? ' min' : ''}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(challenge.progress)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-back-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Desafíos</Text>
          <View style={{width: 40}} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4c6ef5" />
          <Text style={styles.loadingText}>Cargando desafíos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Desafíos</Text>
        <TouchableOpacity onPress={loadChallenges} style={styles.refreshButton}>
          <Icon name="refresh-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4c6ef5"]}
            tintColor="#4c6ef5"
          />
        }
      >
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {challenges && challenges.length > 0 ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="trophy-outline" size={20} color="#ffd700" />
                  <Text style={styles.cardTitle}>Desafíos Activos</Text>
                </View>
                
                {challenges.map(challenge => renderChallengeItem(challenge))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="trophy-outline" size={60} color="#4c6ef5" />
                <Text style={styles.emptyText}>
                  No tienes desafíos activos. Genera nuevos desafíos para empezar.
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={handleGenerateChallenges}
            >
              <View style={styles.buttonContent}>
                <Icon name={challenges && challenges.length > 0 ? "refresh-circle-outline" : "add-circle-outline"} size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>
                  {challenges && challenges.length > 0 ? "Generar Nuevos Desafíos" : "Generar Desafíos"}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      
      <Footer />
    </View>
  );
};

export default ChallengesScreen;