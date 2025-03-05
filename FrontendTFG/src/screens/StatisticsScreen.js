import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { LineChart } from 'react-native-chart-kit';
import styles from '../styles/screens/StatisticsScreen.styles';

const screenWidth = Dimensions.get('window').width;

const StatisticsScreen = ({ navigation }) => {
  const data = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [8000, 9000, 10000, 7500, 11000, 9500, 12000],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Header title="Estadísticas" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <LineChart
          data={data}
          width={screenWidth - 32}
          height={220}
          chartConfig={styles.chartConfig}
          bezier
          style={styles.chart}
        />
      </ScrollView>
      <Footer />
    </View>
  );
};

export default StatisticsScreen;
