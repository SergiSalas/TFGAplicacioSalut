import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    backgroundColor: '#1a1a2e',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },

  // --- Card de Resumen ---
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    padding: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // reparte espacio
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dateIcon: {
    padding: 4,
  },
  cardText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },

  // --- Botones ---
  button: {
    backgroundColor: '#4c6ef5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // --- Loading ---
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#cccccc',
    marginTop: 12,
  },

  // --- Métricas ---
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  metricCard: {
    borderRadius: 8,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    backgroundColor: '#232342',
  },
  metricIcon: {
    marginBottom: 5,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  metricTitle: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 4,
  },

  // --- Sync Button override ---
  syncButton: {
    marginTop: 10,
    backgroundColor: '#4169E1',
  },

  // --- Badge HealthConnect ---
  healthConnectBadge: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  healthConnectText: {
    fontSize: 10,
    color: '#006064',
    fontWeight: '500',
  },

  // --- Progress ---
  progressContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressBar: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },

  // --- Sección de Actividades ---
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: '#8a8a8a',
    fontSize: 14,
  },

  // --- Item de Actividad ---
  activityItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  activityContent: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a69bd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityTitleContainer: {
    flex: 1,
  },
  activityType: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityDate: {
    color: '#8a8a8a',
    fontSize: 12,
    marginTop: 2,
  },
  activityDetails: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  activityStatText: {
    color: '#cccccc',
    fontSize: 14,
    marginLeft: 4,
  },
  activityDescription: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'rgba(30,30,50,0.8)',
    borderRadius: 12,
  },
  emptyStateText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#8a8a8a',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },

  // --- FAB ---
  fabButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: '70%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a69bd',
    overflow: 'hidden',
    elevation: 8,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  fabText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
