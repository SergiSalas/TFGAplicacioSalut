import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#232342',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  metricSubtitle: {
    fontSize: 14,
    color: '#61dafb',
    marginTop: 4,
  },
  stagesSummary: {
    marginTop: 12,
    backgroundColor: '#2A2A4A',
    borderRadius: 8,
    padding: 12,
  },
  stageSummaryText: {
    fontSize: 14,
    color: '#ffffff',
    marginVertical: 4,
  },
  stageContainer: {
    backgroundColor: '#2A2A4A',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stageText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
  },
  stageTimeText: {
    fontSize: 12,
    color: '#61dafb',
    marginLeft: 24,
  },
  sessionTitle: {
    fontSize: 14,
    color: '#61dafb',
    fontStyle: 'italic',
    marginTop: 4,
  },
  updateButton: {
    backgroundColor: '#61dafb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  updateButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#2A2A4A',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#61dafb',
    fontSize: 12,
    marginTop: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
});
