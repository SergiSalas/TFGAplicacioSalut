import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import styles from '../styles/screens/TrendsScreen.styles';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useSleepData } from '../hooks/useSleepData';
import TrendsService from '../service/TrendsService';
import StatsService from '../service/StatsService';

const screenWidth = Dimensions.get('window').width;

const TrendsScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);
  const [period, setPeriod] = useState('week'); // 'week', 'month', 'year'
  const { sleepData, sleepHistory } = useSleepData(true); // true to include history
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' or 'sleep'
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [token, period]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load real activity data from your API
      const [trendsData, statsData] = await Promise.all([
        TrendsService.getStepsTrends(token, period),
        StatsService.getActivityStatsByPeriod(token, period)
      ]);
      
      // Format the data for the charts
      setActivityData({
        steps: {
          labels: trendsData.labels || [],
          data: trendsData.values || []
        },
        weeklyAverage: statsData.averageSteps || 0,
        monthlyTrend: statsData.trend || '0%',
        bestDay: statsData.bestDay || 'N/A'
      });
    } catch (error) {
      console.error('Error loading trends data:', error);
      setError('No se pudieron cargar los datos. Inténtalo de nuevo.');
      
      // Fallback to placeholder data for development
      setActivityData({
        steps: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          data: [8000, 9500, 7200, 10500, 9800, 12000, 8500]
        },
        weeklyAverage: 9357,
        monthlyTrend: '+12%',
        bestDay: 'Sábado'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const renderTabSelector = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Icon name="fitness-outline" size={20} color={activeTab === 'activity' ? '#61dafb' : '#ffffff'} />
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Actividad</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sleep' && styles.activeTab]}
          onPress={() => setActiveTab('sleep')}
        >
          <Icon name="moon-outline" size={20} color={activeTab === 'sleep' ? '#61dafb' : '#ffffff'} />
          <Text style={[styles.tabText, activeTab === 'sleep' && styles.activeTabText]}>Sueño</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderActivityTrends = () => {
    if (!activityData) return null;

    return (
      <>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="trending-up-outline" size={22} color="#61dafb" />
            <Text style={styles.cardTitle}>Tendencias de Actividad</Text>
          </View>
          
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, period === 'week' && styles.activePeriod]}
              onPress={() => handlePeriodChange('week')}
            >
              <Text style={[styles.periodText, period === 'week' && styles.activePeriodText]}>
                Semana
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, period === 'month' && styles.activePeriod]}
              onPress={() => handlePeriodChange('month')}
            >
              <Text style={[styles.periodText, period === 'month' && styles.activePeriodText]}>
                Mes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, period === 'year' && styles.activePeriod]}
              onPress={() => handlePeriodChange('year')}
            >
              <Text style={[styles.periodText, period === 'year' && styles.activePeriodText]}>
                Año
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activityData.weeklyAverage}</Text>
              <Text style={styles.statLabel}>Promedio semanal de pasos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activityData.monthlyTrend}</Text>
              <Text style={styles.statLabel}>Tendencia mensual</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activityData.bestDay}</Text>
              <Text style={styles.statLabel}>Mejor día</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="bar-chart-outline" size={22} color="#61dafb" />
            <Text style={styles.cardTitle}>Pasos Diarios</Text>
          </View>
          
          {activityData.steps.data.length > 0 ? (
            <LineChart
              data={{
                labels: activityData.steps.labels,
                datasets: [{ data: activityData.steps.data }]
              }}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: '#232342',
                backgroundGradientFrom: '#232342',
                backgroundGradientTo: '#3a3a5a',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(97, 218, 251, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#61dafb'
                }
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No hay datos disponibles para este período</Text>
            </View>
          )}
        </Card>
      </>
    );
  };

  const renderSleepTrends = () => {
    // Implement sleep trends visualization here
    // This would be similar to the activity trends but with sleep data
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="moon-outline" size={22} color="#61dafb" />
          <Text style={styles.cardTitle}>Tendencias de Sueño</Text>
        </View>
        <Text style={styles.noDataText}>Datos de sueño en desarrollo</Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Tendencias" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#61dafb" />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {renderTabSelector()}
          <ScrollView 
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadData} />
            }
          >
            {activeTab === 'activity' ? renderActivityTrends() : renderSleepTrends()}
          </ScrollView>
        </>
      )}
      
      <Footer />
    </View>
  );
};

export default TrendsScreen;