import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    color: '#333',
  },
  // Add this to your existing styles
  healthCard: {
    marginBottom: 20,
    backgroundColor: '#e6f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#1890ff',
  },
});


