// src/screens/TrendsScreen.js

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import styles from '../styles/screens/TrendsScreen.styles';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import TrendsService from '../service/TrendsService';
import StatsService from '../service/StatsService';
import { getUserProfile, getUserLevel } from '../service/UserService';
import Header from '../components/layout/Header';   

const screenWidth = Dimensions.get('window').width;

const TrendsScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState('activity'); // 'activity' | 'sleep' | 'hydration'
  const [period, setPeriod] = useState('week'); // 'week' | 'month' | 'year'

  const [activityData, setActivityData] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  // Añade el estado para los datos de hidratación
  const [hydrationData, setHydrationData] = useState(null);

  const [userProfile, setUserProfile] = useState(null);
  const [userLevel,   setUserLevel]   = useState(null);

  useEffect(() => {
    loadData();
  }, [token, activeTab, period]);
  
  useEffect(() => {
    if (!token) return;
    getUserProfile(token)
      .then(setUserProfile)
      .catch(console.error);
    getUserLevel(token)
      .then(setUserLevel)
      .catch(console.error);
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'activity') {
        // Llamamos a ambos endpoints
        const [actTrends, stepsTrends, stats] = await Promise.all([
          TrendsService.getActivityTrends(token, period),
          TrendsService.getStepsTrends(token, period),
          StatsService.getActivityStatsByPeriod(token, period),
        ]);

        setActivityData({
          duration: {
            labels: actTrends.labels,
            values: actTrends.values,
          },
          steps: {
            labels: stepsTrends.labels,
            values: stepsTrends.values,
          },
          weeklyAverage: stats.averageSteps,
          trend: stats.trend,
          bestDay: stats.bestDay,
        });
      } else if (activeTab === 'sleep') {
        const [durTrends, qualTrends, stageTrends, stats] = await Promise.all([
          TrendsService.getSleepTrends(token, period),
          TrendsService.getSleepQualityTrends(token, period),
          TrendsService.getSleepStagesTrends(token, period),
          StatsService.getSleepStatsByPeriod(token, period),
        ]);
        
        // Add null checks to prevent TypeError
        if (!stageTrends || !stageTrends.datasets) {
          console.warn('Sleep stage trends data is missing or incomplete');
          // Set default empty values
          setSleepData({
            labels: durTrends.labels || [],
            durationValues: durTrends.values?.map(value => value / 10) || [],
            qualityValues: qualTrends.values || [],
            stageData: {
              labels: [],
              datasets: [],
              unit: 'minutos',
            },
            remValues: [],
            deepValues: [],
            lightValues: [],
            awakeValues: [],
            remAverage: 0,
            deepAverage: 0,
            lightAverage: 0,
            awakeAverage: 0,
            averageDuration: stats.averageSleepDuration || 0,
            averageQuality: stats.averageQuality || 0,
            bestDay: stats.bestSleepDay || 'N/A',
          });
          return;
        }
        
        // Extraer los datos de todas las etapas del sueño
        const remDataset = stageTrends.datasets.find(dataset => dataset.label === "REM");
        const deepDataset = stageTrends.datasets.find(dataset => dataset.label === "DEEP");
        const lightDataset = stageTrends.datasets.find(dataset => dataset.label === "LIGHT");
        const awakeDataset = stageTrends.datasets.find(dataset => dataset.label === "AWAKE_IN_BED");
        
        // Obtener valores para cada etapa
        const remValues = remDataset ? remDataset.values : [];
        const deepValues = deepDataset ? deepDataset.values : [];
        const lightValues = lightDataset ? lightDataset.values : [];
        const awakeValues = awakeDataset ? awakeDataset.values : [];
        
        // Calcular promedios para cada etapa (solo de valores > 0)
        const calculateAverage = (values) => {
          const validValues = values.filter(value => value > 0);
          return validValues.length > 0 
            ? Math.round(validValues.reduce((sum, value) => sum + value, 0) / validValues.length) 
            : 0;
        };
        
        const remAverage = calculateAverage(remValues);
        const deepAverage = calculateAverage(deepValues);
        const lightAverage = calculateAverage(lightValues);
        const awakeAverage = calculateAverage(awakeValues);

        setSleepData({
          labels: stageTrends.labels,
          durationValues: durTrends.values.map(value => value / 10), // Dividir entre 10
          qualityValues: qualTrends.values,
          // Añadir todos los datos de etapas
          stageData: {
            labels: stageTrends.labels,
            datasets: stageTrends.datasets,
            unit: stageTrends.unit || 'minutos',
          },
          // Añadir valores individuales para cada etapa
          remValues: remValues,
          deepValues: deepValues,
          lightValues: lightValues,
          awakeValues: awakeValues,
          // Añadir promedios
          remAverage: remAverage,
          deepAverage: deepAverage,
          lightAverage: lightAverage,
          awakeAverage: awakeAverage,
          // Mantener datos existentes
          averageDuration: stats.averageSleepDuration,
          averageQuality: stats.averageQuality,
          bestDay: stats.bestSleepDay,
        });
      
      } else if (activeTab === 'hydration') {
        // Cargar datos de hidratación
        const [hydrationTrends, stats] = await Promise.all([
          TrendsService.getHydrationTrends(token, period),
          StatsService.getHydrationStatsByPeriod(token, period),
        ]);

        // Obtener también las estadísticas de hidratación
        const hydrationStats = await StatsService.getHydrationStats(token);

        setHydrationData({
          labels: hydrationTrends.labels,
          values: hydrationTrends.values,
          averageConsumption: stats.average,
          completionRate: stats.percentageCurrent,
          bestDay: stats.daysAboveObjective > 0 ? hydrationTrends.labels[hydrationTrends.values.indexOf(Math.max(...hydrationTrends.values))] : 'N/A',
          // Añadir los datos de estadísticas
          today: hydrationStats.today,
          yesterday: hydrationStats.yesterday,
          weekAverage: hydrationStats.weekAverage,
          monthAverage: hydrationStats.monthAverage,
          objective: hydrationStats.objective,
          percentageToday: hydrationStats.percentageToday,
          streak: hydrationStats.streak
        });
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudieron cargar los datos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatLabels = (labels) => {
    if (!labels || !labels.length) return [];
    
    if (period === 'month') {
      // Para el mes, mostrar solo algunas etiquetas pero con mejor formato
      return labels.map((label, index) => {
        // Mostrar día 1, 5, 10, 15, 20, 25, 30
        if (index % 5 === 0 || index === labels.length - 1) {
          return label;
        }
        return '';
      });
    } else if (period === 'year') {
      // Para el año, mostrar solo algunos meses
      return labels.map((label, index) => index % 3 === 0 ? label : '');
    }
    return labels;
  };

  // Configuración personalizada para cada gráfico
  const durationChartConfig = {
    ...styles.chartConfig,
    propsForLabels: {
      fontSize: period === 'month' ? 12 : 10,
      fontWeight: 'bold',
      fill: '#ffffff',
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    formatYLabel: (value) => `${value}h`,
    horizontalLabelRotation: period === 'month' ? 45 : 0,
    // Aumentar el espacio entre las etiquetas y el gráfico
    yAxisSuffix: ' h',
  };

  const qualityChartConfig = {
    ...styles.chartConfig,
    propsForLabels: {
      fontSize: period === 'month' ? 12 : 10,
      fontWeight: 'bold',
      fill: '#ffffff',
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    formatYLabel: (value) => `${value}`, // Quitar el % aquí
    horizontalLabelRotation: period === 'month' ? 45 : 0,
    // Mantener solo un símbolo de porcentaje
    yAxisSuffix: '%',
  };

  // Configuración para el gráfico de sueño REM
  const sleepChartConfig = {
    ...styles.chartConfig,
    propsForLabels: {
      fontSize: period === 'month' ? 12 : 10,
      fontWeight: 'bold',
      fill: '#ffffff',
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    formatYLabel: (value) => `${value}`,
    horizontalLabelRotation: period === 'month' ? 45 : 0,
    // Especificar claramente que son minutos
    yAxisSuffix: ' min',
  };

  const stageColors = {
    REM: '#61dafb',      // Azul claro
    DEEP: '#4c6ef5',     // Azul oscuro
    LIGHT: '#a3a1fb',    // Púrpura claro
    AWAKE_IN_BED: '#ff6b6b' // Rojo
  };

  const hydrationChartConfig = {
    ...styles.chartConfig,
    color: (opacity = 1) => `rgba(97, 218, 251, ${opacity})`,
    horizontalLabelRotation: period === 'month' ? 45 : 0,
    propsForLabels: {
      fontSize: period === 'month' ? 12 : 10,
      fontWeight: 'bold',
      fill: '#ffffff',
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    yAxisSuffix: ' ml',
    formatYLabel: (value) => `${value}`,
  };

  const activityChartConfig = {
    ...styles.chartConfig,
    horizontalLabelRotation: period === 'month' ? 45 : 0,
    propsForLabels: {
      fontSize: period === 'month' ? 12 : 10,
      fontWeight: 'bold',
      fill: '#ffffff',
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    // Aumentar el espacio entre las etiquetas y el gráfico
    yAxisSuffix: ' min', // Añadir unidades de minutos
    formatYLabel: (value) => `${value}`,
  };


  const chartWidth = period === 'month' 
      ? Math.max(
          screenWidth * 2, 
          (activeTab === 'sleep' && sleepData?.labels?.length) 
            ? sleepData.labels.length * 35 
            : (activeTab === 'activity' && activityData?.duration?.labels?.length)
              ? activityData.duration.labels.length * 35
              : (activeTab === 'hydration' && hydrationData?.labels?.length)
                ? hydrationData.labels.length * 35
                : screenWidth * 2
        ) 
      : screenWidth - 40;


  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {['activity', 'sleep', 'hydration'].map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab===tab && styles.activeTab]}
          onPress={()=>setActiveTab(tab)}>
          <Icon
            name={
              tab==='activity' ? 'fitness-outline' : 
              tab==='sleep' ? 'moon-outline' : 
              'water-outline'
            }
            size={20}
            color={activeTab===tab ? '#61dafb':'#cccccc'}
          />
          <Text style={[styles.tabText,activeTab===tab&&styles.activeTabText]}>
            {tab==='activity' ? 'Actividad' : 
             tab==='sleep' ? 'Sueño' : 
             'Hidratación'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['week','month','year'].map(p=>(
        <TouchableOpacity
          key={p}
          style={[styles.periodButton,period===p&&styles.activePeriod]}
          onPress={()=>setPeriod(p)}>
          <Text style={[styles.periodText,period===p&&styles.activePeriodText]}>
            {p==='week'?'Semana':p==='month'?'Mes':'Año'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActivityCharts = () => {
    if (!activityData) return null;
    return (
      <View>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#3498db' }]}>
              <Icon name="time-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Duración de actividad</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <LineChart
                data={{
                  labels: formatLabels(activityData.duration.labels),
                  datasets: [{ 
                    data: activityData.duration.values,
                    color: (opacity = 1) => "#3498db", 
                    strokeWidth: 2
                  }]
                }}
                width={chartWidth}
                height={200}
                chartConfig={activityChartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                yAxisInterval={2}
                yAxisSuffix=" min"
              />
            </ScrollView>
          </View>
        </Card>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#2ecc71' }]}>
              <Icon name="footsteps-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Pasos</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: formatLabels(activityData.steps.labels),
                  datasets: [{ 
                    data: activityData.steps.values, 
                    color: (opacity = 1) => "#2ecc71", 
                    strokeWidth: 2
                  }]
                }}
                width={chartWidth}
                height={200}
                chartConfig={activityChartConfig}
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                showValuesOnTopOfBars={true}
                showBarTops={true}
              />
            </ScrollView>
          </View>
        </Card>
      </View>
    );
  };

  const renderSleepCharts = () => {
    if (!sleepData || !sleepData.stageData || !sleepData.stageData.datasets) return null;
      
    return (
      <View>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#6a5acd' }]}>
              <Icon name="bed-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Duración del sueño</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <LineChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [{ 
                    data: sleepData.durationValues,
                    color: (opacity = 1) => "#6a5acd", 
                    strokeWidth: 2 
                  }]
                }}
                width={chartWidth}
                height={220}
                chartConfig={durationChartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                yAxisInterval={2}
                yAxisSuffix="h"
              />
            </ScrollView>
          </View>
        </Card>
        
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#9b59b6' }]}>
              <Icon name="star-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Calidad del sueño</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [{ 
                    data: sleepData.qualityValues.map(value => value / 10), 
                    color: (opacity = 1) => "#9b59b6", 
                    strokeWidth: 2 
                  }]
                }}
                width={chartWidth}
                height={220}
                chartConfig={qualityChartConfig}
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                yAxisInterval={20}
                yAxisSuffix="%"
                showValuesOnTopOfBars={true}
                showBarTops={true}
              />
            </ScrollView>
          </View>
        </Card>
        
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#6a5acd' }]}>
              <Icon name="pulse-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Sueño REM</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <LineChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [{ 
                    data: sleepData.remValues,
                    color: (opacity = 1) => "#6a5acd", 
                  }]
                }}
                width={chartWidth}
                height={220}
                chartConfig={sleepChartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                yAxisInterval={5}
                yAxisSuffix=" min"
              />
            </ScrollView>
          </View>
        </Card>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#4c6ef5' }]}>
              <Icon name="moon-outline" size={20} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Fase DEEP</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [
                    {
                      data: sleepData.deepValues,
                      color: (opacity = 1) => stageColors.DEEP,
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
                chartConfig={sleepChartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                yAxisInterval={5}
                yAxisSuffix=" min"
              />
            </ScrollView>
          </View>
        </Card>

        {/* Nuevo gráfico para fase LIGHT */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#a3a1fb' }]}>
              <Icon name="partly-sunny-outline" size={20} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Fase LIGHT</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [
                    {
                      data: sleepData.lightValues,
                      color: (opacity = 1) => stageColors.LIGHT,
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
                chartConfig={sleepChartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                yAxisInterval={5}
                yAxisSuffix=" min"
              />
            </ScrollView>
          </View>
        </Card>

        {/* Nuevo gráfico para fase AWAKE_IN_BED */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#ff6b6b' }]}>
              <Icon name="eye-outline" size={20} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Fase AWAKE</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [
                    {
                      data: sleepData.awakeValues,
                      color: (opacity = 1) => stageColors.AWAKE_IN_BED,
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
                chartConfig={sleepChartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                yAxisInterval={5}
                yAxisSuffix=" min"
              />
            </ScrollView>
          </View>
        </Card>
      </View>
    );
  };


  // También mejorar los resúmenes con iconos
  const renderActivitySummary = () => {
    if (!activityData) return null;
    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#2ecc71' }]}>
                <Icon name="stats-chart-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {activityData.weeklyAverage}
              </Text>
              <Text style={styles.summaryLabel}>Prom. pasos</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#e74c3c' }]}>
                <Icon name="trending-up-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {activityData.trend}
              </Text>
              <Text style={styles.summaryLabel}>Tendencia</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#f1c40f' }]}>
                <Icon name="trophy-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {activityData.bestDay}
              </Text>
              <Text style={styles.summaryLabel}>Mejor día</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSleepSummary = () => {
    if (!sleepData) return null;
    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#3498db' }]}>
                <Icon name="time-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {sleepData.averageDuration}h
              </Text>
              <Text style={styles.summaryLabel}>Prom. sueño</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#9b59b6' }]}>
                <Icon name="star-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {sleepData.averageQuality}%
              </Text>
              <Text style={styles.summaryLabel}>Calidad</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#6a5acd' }]}>
                <Icon name="pulse-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {sleepData.remAverage}
              </Text>
              <Text style={styles.summaryLabel}>REM (min)</Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#4c6ef5' }]}>
                <Icon name="moon-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {sleepData.deepAverage}
              </Text>
              <Text style={styles.summaryLabel}>Profundo (min)</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#a3a1fb' }]}>
                <Icon name="partly-sunny-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {sleepData.lightAverage}
              </Text>
              <Text style={styles.summaryLabel}>Ligero (min)</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#ff6b6b' }]}>
                <Icon name="eye-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {sleepData.awakeAverage}
              </Text>
              <Text style={styles.summaryLabel}>Despierto (min)</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderHydrationCharts = () => {
    if (!hydrationData) return null;
    return (
      <View>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, {backgroundColor: '#3498db'}]}>
              <Icon name="water-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Consumo de agua</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: formatLabels(hydrationData.labels),
                  datasets: [{ 
                    data: hydrationData.values,
                    color: (opacity = 1) => "#3498db", 
                  }]
                }}
                width={chartWidth}
                height={220}
                chartConfig={hydrationChartConfig}
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                showValuesOnTopOfBars={true}
                showBarTops={true}
                yAxisSuffix=" ml"
              />
            </ScrollView>
          </View>
        </Card>
      </View>
    );
  };
  
  const renderHydrationSummary = () => {
    if (!hydrationData) return null;
    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, {backgroundColor: '#3498db'}]}>
                <Icon name="water-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {hydrationData.weekAverage || 0}
              </Text>
              <Text style={styles.summaryLabel}>Prom. diario</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, {backgroundColor: '#4cd964'}]}>
                <Icon name="pie-chart-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {hydrationData.percentageToday || 0}%
              </Text>
              <Text style={styles.summaryLabel}>Cumplimiento</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, {backgroundColor: '#f1c40f'}]}>
                <Icon name="flame-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.summaryValue}>
                {hydrationData.streak || 0}
              </Text>
              <Text style={styles.summaryLabel}>Racha</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Tendencias" 
        navigation={navigation} 
        userProfile={userProfile} 
        userLevel={userLevel} 
        onRefresh={onRefresh} 
      />
      
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
        {renderTabs()}
        {renderPeriodSelector()}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4c6ef5" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {activeTab === 'activity' && (
              <>
                {renderActivitySummary()}
                {renderActivityCharts()}
              </>
            )}
            
            {activeTab === 'sleep' && (
              <>
                {renderSleepSummary()}
                {renderSleepCharts()}
              </>
            )}
            
            {activeTab === 'hydration' && (
              <>
                {renderHydrationSummary()}
                {renderHydrationCharts()}
              </>
            )}
          </>
        )}
      </ScrollView>
      
      <Footer />
    </View>
  );
};

export default TrendsScreen;