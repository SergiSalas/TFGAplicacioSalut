// src/screens/TrendsScreen.js

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
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

        // Extraer los datos de REM del objeto stageTrends
        const remDataset = stageTrends.datasets.find(dataset => dataset.label === "REM");
        const remValues = remDataset ? remDataset.values : [20, 22, 25, 23, 24, 26, 28]; // Valores por defecto si no hay datos

        // Calcular el promedio de REM
        const validRemValues = remValues.filter(value => value > 0);
        const remAverage = validRemValues.length > 0 
          ? Math.round(validRemValues.reduce((sum, value) => sum + value, 0) / validRemValues.length) 
          : 0;

        setSleepData({
          labels: durTrends.labels,
          durationValues: durTrends.values.map(value => value / 10), // Dividir entre 10
          qualityValues: qualTrends.values,
          remValues: remValues,
          remAverage: remAverage,
          remUnit: stageTrends.unit || 'minutos',
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

  const handleBackPress = () => {
    navigation.goBack();
  };

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
    
    // Función auxiliar para formatear las etiquetas en el eje X
    const formatLabels = (labels) => {
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
    
    // Configuración personalizada para los gráficos
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
    
    // Calcular el ancho del gráfico basado en el período
    const chartWidth = period === 'month' 
      ? Math.max(screenWidth * 2, activityData.duration.labels.length * 35) 
      : screenWidth - 40;
    
    return (
      <View>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, styles.timeIconContainer]}>
              <Icon name="time-outline" size={24} color="#3498db" />
            </View>
            <Text style={styles.cardTitle}>Duración de actividad</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <LineChart
                data={{
                  labels: formatLabels(activityData.duration.labels),
                  datasets: [{ data: activityData.duration.values }]
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
            <View style={[styles.cardIcon, styles.stepsIconContainer]}>
              <Icon name="footsteps-outline" size={24} color="#2ecc71" />
            </View>
            <Text style={styles.cardTitle}>Pasos</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: formatLabels(activityData.steps.labels),
                  datasets: [{ data: activityData.steps.values }]
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
    if (!sleepData) return null;
    
    // Función auxiliar para formatear las etiquetas en el eje X
    const formatLabels = (labels) => {
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
    const remChartConfig = {
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
  
    // Calcular el ancho del gráfico basado en el período
    const chartWidth = period === 'month' 
      ? Math.max(screenWidth * 2, sleepData.labels.length * 35) 
      : screenWidth - 40;
  
    return (
      <View>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, styles.sleepIconContainer]}>
              <Icon name="bed-outline" size={24} color="#6a5acd" />
            </View>
            <Text style={styles.cardTitle}>Duración del sueño</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <LineChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [{ data: sleepData.durationValues }]
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
            <View style={[styles.cardIcon, styles.starIconContainer]}>
              <Icon name="star-outline" size={24} color="#9b59b6" />
            </View>
            <Text style={styles.cardTitle}>Calidad del sueño</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [{ data: sleepData.qualityValues }]
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
            <View style={[styles.cardIcon, styles.sleepIconContainer]}>
              <Icon name="pulse-outline" size={24} color="#6a5acd" />
            </View>
            <Text style={styles.cardTitle}>Sueño REM</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <LineChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [{ data: sleepData.remValues || [20, 22, 25, 23, 24, 26, 28] }]
                }}
                width={chartWidth}
                height={220}
                chartConfig={remChartConfig}
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
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.stepsIconContainer]}>
              <Icon name="stats-chart-outline" size={20} color="#2ecc71" />
            </View>
            <Text style={styles.summaryValue}>
              {activityData.weeklyAverage}
            </Text>
            <Text style={styles.summaryLabel}>Prom. pasos</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.trendIconContainer]}>
              <Icon name="trending-up-outline" size={20} color="#e74c3c" />
            </View>
            <Text style={styles.summaryValue}>
              {activityData.trend}
            </Text>
            <Text style={styles.summaryLabel}>Tendencia</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.trophyIconContainer]}>
              <Icon name="trophy-outline" size={20} color="#f1c40f" />
            </View>
            <Text style={styles.summaryValue}>
              {activityData.bestDay}
            </Text>
            <Text style={styles.summaryLabel}>Mejor día</Text>
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
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.timeIconContainer]}>
              <Icon name="time-outline" size={20} color="#3498db" />
            </View>
            <Text style={styles.summaryValue}>
              {sleepData.averageDuration}h
            </Text>
            <Text style={styles.summaryLabel}>Prom. sueño</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.starIconContainer]}>
              <Icon name="star-outline" size={20} color="#9b59b6" />
            </View>
            <Text style={styles.summaryValue}>
              {sleepData.averageQuality}%
            </Text>
            <Text style={styles.summaryLabel}>Calidad</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.sleepIconContainer]}>
              <Icon name="pulse-outline" size={20} color="#6a5acd" />
            </View>
            <Text style={styles.summaryValue}>
              {sleepData.remAverage}
            </Text>
            <Text style={styles.summaryLabel}>REM (min)</Text>
          </View>
        </View>
        
        {/* Se ha eliminado todo el contenedor remContainer */}
      </View>
    );
  };

  const renderHydrationCharts = () => {
    if (!hydrationData) return null;
    
    // Función auxiliar para formatear las etiquetas en el eje X
    const formatLabels = (labels) => {
      if (period === 'month') {
        return labels.map((label, index) => {
          if (index % 5 === 0 || index === labels.length - 1) {
            return label;
          }
          return '';
        });
      } else if (period === 'year') {
        return labels.map((label, index) => index % 3 === 0 ? label : '');
      }
      return labels;
    };
    
    // Configuración personalizada para los gráficos
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
    
    // Calcular el ancho del gráfico basado en el período
    const chartWidth = period === 'month' 
      ? Math.max(screenWidth * 2, hydrationData.labels.length * 35) 
      : screenWidth - 40;
    
    return (
      <View>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, styles.waterIconContainer]}>
              <Icon name="water-outline" size={24} color="#3498db" />
            </View>
            <Text style={styles.cardTitle}>Consumo de agua</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: formatLabels(hydrationData.labels),
                  datasets: [{ data: hydrationData.values }]
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
  
  const renderHydrationContent = () => {
    if (!hydrationData) return null;
    return (
      <View style={styles.contentContainer}>
        {renderHydrationCharts()}
        {renderHydrationSummary()}
      </View>
    );
  };

  const renderHydrationSummary = () => {
    if (!hydrationData) return null;
    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.waterIconContainer]}>
              <Icon name="water-outline" size={20} color="#61dafb" />
            </View>
            <Text style={styles.summaryValue}>
              {hydrationData.weekAverage || 0}
            </Text>
            <Text style={styles.summaryLabel}>Prom. diario</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.percentIconContainer]}>
              <Icon name="pie-chart-outline" size={20} color="#4cd964" />
            </View>
            <Text style={styles.summaryValue}>
              {hydrationData.percentageToday || 0}%
            </Text>
            <Text style={styles.summaryLabel}>Cumplimiento</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.streakIconContainer]}>
              <Icon name="flame-outline" size={20} color="#f1c40f" />
            </View>
            <Text style={styles.summaryValue}>
              {hydrationData.streak || 0}
            </Text>
            <Text style={styles.summaryLabel}>Racha</Text>
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

        // Extraer los datos de REM del objeto stageTrends
        const remDataset = stageTrends.datasets.find(dataset => dataset.label === "REM");
        const remValues = remDataset ? remDataset.values : [20, 22, 25, 23, 24, 26, 28]; // Valores por defecto si no hay datos

        // Calcular el promedio de REM
        const validRemValues = remValues.filter(value => value > 0);
        const remAverage = validRemValues.length > 0 
          ? Math.round(validRemValues.reduce((sum, value) => sum + value, 0) / validRemValues.length) 
          : 0;

        setSleepData({
          labels: durTrends.labels,
          durationValues: durTrends.values.map(value => value / 10), // Dividir entre 10
          qualityValues: qualTrends.values,
          remValues: remValues,
          remAverage: remAverage,
          remUnit: stageTrends.unit || 'minutos',
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

  const handleBackPress = () => {
    navigation.goBack();
  };

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
    
    // Función auxiliar para formatear las etiquetas en el eje X
    const formatLabels = (labels) => {
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
    
    // Configuración personalizada para los gráficos
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
    
    // Calcular el ancho del gráfico basado en el período
    const chartWidth = period === 'month' 
      ? Math.max(screenWidth * 2, activityData.duration.labels.length * 35) 
      : screenWidth - 40;
    
    return (
      <View>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, styles.timeIconContainer]}>
              <Icon name="time-outline" size={24} color="#3498db" />
            </View>
            <Text style={styles.cardTitle}>Duración de actividad</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <LineChart
                data={{
                  labels: formatLabels(activityData.duration.labels),
                  datasets: [{ data: activityData.duration.values }]
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
            <View style={[styles.cardIcon, styles.stepsIconContainer]}>
              <Icon name="footsteps-outline" size={24} color="#2ecc71" />
            </View>
            <Text style={styles.cardTitle}>Pasos</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: formatLabels(activityData.steps.labels),
                  datasets: [{ data: activityData.steps.values }]
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
    if (!sleepData) return null;
    
    // Función auxiliar para formatear las etiquetas en el eje X
    const formatLabels = (labels) => {
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
    const remChartConfig = {
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
  
    // Calcular el ancho del gráfico basado en el período
    const chartWidth = period === 'month' 
      ? Math.max(screenWidth * 2, sleepData.labels.length * 35) 
      : screenWidth - 40;
  
    return (
      <View>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, styles.sleepIconContainer]}>
              <Icon name="bed-outline" size={24} color="#6a5acd" />
            </View>
            <Text style={styles.cardTitle}>Duración del sueño</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <LineChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [{ data: sleepData.durationValues }]
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
            <View style={[styles.cardIcon, styles.starIconContainer]}>
              <Icon name="star-outline" size={24} color="#9b59b6" />
            </View>
            <Text style={styles.cardTitle}>Calidad del sueño</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [{ data: sleepData.qualityValues }]
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
            <View style={[styles.cardIcon, styles.sleepIconContainer]}>
              <Icon name="pulse-outline" size={24} color="#6a5acd" />
            </View>
            <Text style={styles.cardTitle}>Sueño REM</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <LineChart
                data={{
                  labels: formatLabels(sleepData.labels),
                  datasets: [{ data: sleepData.remValues || [20, 22, 25, 23, 24, 26, 28] }]
                }}
                width={chartWidth}
                height={220}
                chartConfig={remChartConfig}
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
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.stepsIconContainer]}>
              <Icon name="stats-chart-outline" size={20} color="#2ecc71" />
            </View>
            <Text style={styles.summaryValue}>
              {activityData.weeklyAverage}
            </Text>
            <Text style={styles.summaryLabel}>Prom. pasos</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.trendIconContainer]}>
              <Icon name="trending-up-outline" size={20} color="#e74c3c" />
            </View>
            <Text style={styles.summaryValue}>
              {activityData.trend}
            </Text>
            <Text style={styles.summaryLabel}>Tendencia</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.trophyIconContainer]}>
              <Icon name="trophy-outline" size={20} color="#f1c40f" />
            </View>
            <Text style={styles.summaryValue}>
              {activityData.bestDay}
            </Text>
            <Text style={styles.summaryLabel}>Mejor día</Text>
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
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.timeIconContainer]}>
              <Icon name="time-outline" size={20} color="#3498db" />
            </View>
            <Text style={styles.summaryValue}>
              {sleepData.averageDuration}h
            </Text>
            <Text style={styles.summaryLabel}>Prom. sueño</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.starIconContainer]}>
              <Icon name="star-outline" size={20} color="#9b59b6" />
            </View>
            <Text style={styles.summaryValue}>
              {sleepData.averageQuality}%
            </Text>
            <Text style={styles.summaryLabel}>Calidad</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.sleepIconContainer]}>
              <Icon name="pulse-outline" size={20} color="#6a5acd" />
            </View>
            <Text style={styles.summaryValue}>
              {sleepData.remAverage}
            </Text>
            <Text style={styles.summaryLabel}>REM (min)</Text>
          </View>
        </View>
        
        {/* Se ha eliminado todo el contenedor remContainer */}
      </View>
    );
  };

  const renderHydrationCharts = () => {
    if (!hydrationData) return null;
    
    // Función auxiliar para formatear las etiquetas en el eje X
    const formatLabels = (labels) => {
      if (period === 'month') {
        return labels.map((label, index) => {
          if (index % 5 === 0 || index === labels.length - 1) {
            return label;
          }
          return '';
        });
      } else if (period === 'year') {
        return labels.map((label, index) => index % 3 === 0 ? label : '');
      }
      return labels;
    };
    
    // Configuración personalizada para los gráficos
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
    
    // Calcular el ancho del gráfico basado en el período
    const chartWidth = period === 'month' 
      ? Math.max(screenWidth * 2, hydrationData.labels.length * 35) 
      : screenWidth - 40;
    
    return (
      <View>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, styles.waterIconContainer]}>
              <Icon name="water-outline" size={24} color="#3498db" />
            </View>
            <Text style={styles.cardTitle}>Consumo de agua</Text>
          </View>
          <View style={styles.scrollableChartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={{
                  labels: formatLabels(hydrationData.labels),
                  datasets: [{ data: hydrationData.values }]
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
  
  const renderHydrationContent = () => {
    if (!hydrationData) return null;
    return (
      <View style={styles.contentContainer}>
        {renderHydrationCharts()}
        {renderHydrationSummary()}
      </View>
    );
  };

  const renderHydrationSummary = () => {
    if (!hydrationData) return null;
    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.waterIconContainer]}>
              <Icon name="water-outline" size={20} color="#61dafb" />
            </View>
            <Text style={styles.summaryValue}>
              {hydrationData.weekAverage || 0}
            </Text>
            <Text style={styles.summaryLabel}>Prom. diario</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.percentIconContainer]}>
              <Icon name="pie-chart-outline" size={20} color="#4cd964" />
            </View>
            <Text style={styles.summaryValue}>
              {hydrationData.percentageToday || 0}%
            </Text>
            <Text style={styles.summaryLabel}>Cumplimiento</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.streakIconContainer]}>
              <Icon name="flame-outline" size={20} color="#f1c40f" />
            </View>
            <Text style={styles.summaryValue}>
              {hydrationData.streak || 0}
            </Text>
            <Text style={styles.summaryLabel}>Racha</Text>
          </View>
        </View>
      </View>
    );
  };


 