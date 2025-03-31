import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import styles from '../styles/screens/SleepScreen.styles';
import healthConnectService, { SLEEP_STAGES } from '../service/HealthConnectService';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSleepData } from '../hooks/useSleepData';
import { FOOTER_SCREENS } from '../constants/navigation';

const SleepScreen = ({ navigation }) => {
  const { sleepData, loading, refreshSleepData } = useSleepData();

  const renderSleepStagesSummary = (summary, hasDetailedStages) => {
    if (!summary) return null;
    
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="moon-outline" size={20} color="#61dafb" />
          <Text style={styles.metricTitle}>Resumen de sueño</Text>
        </View>
        <View style={styles.stagesSummary}>
          <Text style={styles.stageSummaryText}>
            <Icon name="bed-outline" size={16} color="#61dafb" /> Tiempo total: {summary.totalSleep.toFixed(1)}h
          </Text>
          {summary.remSleep > 0 && (
            <Text style={styles.stageSummaryText}>
              <Icon name="eye" size={16} color="#61dafb" /> Tiempo REM: {summary.remSleep.toFixed(1)}h
            </Text>
          )}
        </View>
      </Card>
    );
  };

  const renderSleepStages = (stages) => {
    if (!stages || stages.length === 0) return null;

    return (
      <Card style={styles.card}>
        <Text style={styles.metricTitle}>Detalle de etapas</Text>
        {stages.map((stage, index) => {
          const durationHours = (stage.duration / (1000 * 60 * 60)).toFixed(1);
          const startTime = new Date(stage.startTime).toLocaleTimeString();
          const endTime = new Date(stage.endTime).toLocaleTimeString();
          
          return (
            <View key={index} style={styles.stageContainer}>
              <View style={styles.stageHeader}>
                <Icon 
                  name={getStageIcon(stage.originalType)} 
                  size={16} 
                  color="#61dafb" 
                />
                <Text style={styles.stageText}>
                  {stage.stage}: {durationHours}h
                </Text>
              </View>
              <Text style={styles.stageTimeText}>
                {startTime} - {endTime}
              </Text>
            </View>
          );
        })}
      </Card>
    );
  };

  const getStageIcon = (stageType) => {
    switch (parseInt(stageType, 10)) {
      case SLEEP_STAGES.DEEP:
        return 'moon';
      case SLEEP_STAGES.LIGHT:
        return 'partly-sunny';
      case SLEEP_STAGES.REM:
        return 'eye';
      case SLEEP_STAGES.AWAKE:
      case SLEEP_STAGES.AWAKE_IN_BED:
        return 'sunny';
      case SLEEP_STAGES.OUT_OF_BED:
        return 'walk';
      case SLEEP_STAGES.SLEEPING:
        return 'bed';
      default:
        return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Calidad del Sueño" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Calidad del Sueño" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="bed-outline" size={20} color="#61dafb" />
            <Text style={styles.metricTitle}>Horas de sueño</Text>
          </View>
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <View style={styles.iconContainer}>
                <Icon name="time-outline" size={24} color="#61dafb" />
              </View>
              <Text style={styles.metricValue}>
                {sleepData ? `${sleepData.durationHours}` : '--'}
              </Text>
              <Text style={styles.metricLabel}>Horas</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={styles.iconContainer}>
                <Icon name="star-outline" size={24} color="#61dafb" />
              </View>
              <Text style={styles.metricValue}>
                {sleepData ? `${sleepData.quality}` : '--'}
              </Text>
              <Text style={styles.metricLabel}>Calidad</Text>
            </View>
          </View>
          {sleepData?.title && (
            <Text style={styles.sessionTitle}>{sleepData.title}</Text>
          )}
        </Card>
        
        {sleepData?.stagesSummary && renderSleepStagesSummary(sleepData.stagesSummary, sleepData.hasDetailedStages)}

        {sleepData?.stages && renderSleepStages(sleepData.stages)}

        <Button
          title="Actualizar datos"
          onPress={refreshSleepData}
          style={styles.updateButton}
          textStyle={styles.updateButtonText}
        />
      </ScrollView>
      <Footer 
        activeScreen="sleep"
        navigation={navigation}
        screens={FOOTER_SCREENS}
      />
    </View>
  );
};

export default SleepScreen;
