import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import styles from '../styles/screens/TrendsScreen.styles';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useSleepData } from '../hooks/useSleepData';
import { FOOTER_SCREENS } from '../constants/navigation';

const screenWidth = Dimensions.get('window').width;

const TrendsScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);
  const { sleepData, sleepHistory } = useSleepData(true); // true to include history
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' or 'sleep'

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Here we'll load activity data from your API
      // For now using placeholder data
      setActivityData({
        steps: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          data: [8000, 9500, 7200, 10500, 9800, 12000, 8500]
        },
        weeklyAverage: 9357,
        monthlyTrend: '+12%',
        bestDay: 'Sábado'
      });
    } catch (error) {
      console.error('Error loading trends data:', error);
    } finally {
      setLoading(false);
    }
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
        </Card>
      </>
    );
  };

  const renderSleepTrends = () => {
    // Placeholder sleep data - you'll replace with real data
    const sleepTrendsData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      data: [7.2, 6.8, 7.5, 8.1, 6.5, 8.5, 7.8]
    };

    return (
      <>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="moon-outline" size={22} color="#61dafb" />
            <Text style={styles.cardTitle}>Tendencias de Sueño</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>7.5h</Text>
              <Text style={styles.statLabel}>Promedio semanal</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>+5%</Text>
              <Text style={styles.statLabel}>Tendencia mensual</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Sábado</Text>
              <Text style={styles.statLabel}>Mejor día</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="bar-chart-outline" size={22} color="#61dafb" />
            <Text style={styles.cardTitle}>Horas de Sueño</Text>
          </View>
          
          <BarChart
            data={{
              labels: sleepTrendsData.labels,
              datasets: [{ data: sleepTrendsData.data }]
            }}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              backgroundColor: '#232342',
              backgroundGradientFrom: '#232342',
              backgroundGradientTo: '#3a3a5a',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(97, 218, 251, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={styles.chart}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="pie-chart-outline" size={22} color="#61dafb" />
            <Text style={styles.cardTitle}>Calidad del Sueño</Text>
          </View>
          
          <View style={styles.qualityContainer}>
            <View style={styles.qualityItem}>
              <View style={[styles.qualityIndicator, { backgroundColor: '#61dafb' }]} />
              <Text style={styles.qualityLabel}>Sueño Profundo</Text>
              <Text style={styles.qualityValue}>25%</Text>
            </View>
            <View style={styles.qualityItem}>
              <View style={[styles.qualityIndicator, { backgroundColor: '#a061fb' }]} />
              <Text style={styles.qualityLabel}>Sueño REM</Text>
              <Text style={styles.qualityValue}>20%</Text>
            </View>
            <View style={styles.qualityItem}>
              <View style={[styles.qualityIndicator, { backgroundColor: '#fb61a0' }]} />
              <Text style={styles.qualityLabel}>Sueño Ligero</Text>
              <Text style={styles.qualityValue}>55%</Text>
            </View>
          </View>
        </Card>
      </>
    );
  };

  const renderTabSelector = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Icon 
            name="fitness-outline" 
            size={20} 
            color={activeTab === 'activity' ? '#61dafb' : '#ffffff'} 
          />
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
            Actividad
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sleep' && styles.activeTab]}
          onPress={() => setActiveTab('sleep')}
        >
          <Icon 
            name="bed-outline" 
            size={20} 
            color={activeTab === 'sleep' ? '#61dafb' : '#ffffff'} 
          />
          <Text style={[styles.tabText, activeTab === 'sleep' && styles.activeTabText]}>
            Sueño
          </Text>
        </TouchableOpacity>
      </View>
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
      ) : (
        <>
          {renderTabSelector()}
          <ScrollView contentContainerStyle={styles.content}>
            {activeTab === 'activity' ? renderActivityTrends() : renderSleepTrends()}
          </ScrollView>
        </>
      )}
      
      <Footer />
    </View>
  );
};

export default TrendsScreen;