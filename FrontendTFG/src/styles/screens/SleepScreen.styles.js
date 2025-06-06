import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#cccccc',
    marginTop: 12,
  },
  card: {
    marginBottom: 24, 
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(97, 218, 251, 0.5)', 
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  
  // Calidad del sueño
  qualityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  circleProgressWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  qualityInfoContainer: {
    width: '55%',
    paddingLeft: 10,
  },
  qualityLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#61dafb',
    marginBottom: 8,
  },
  qualityDescription: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  
  // Duración del sueño
  durationContainer: {
    marginTop: 10,
  },
  durationValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  durationValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  durationUnit: {
    fontSize: 16,
    color: '#aaaaaa',
    marginLeft: 8,
  },
  timeInfoContainer: {
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeTextContainer: {
    marginLeft: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#aaaaaa',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: '#aaaaaa',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#61dafb',
  },
  
  // Etapas del sueño
  stagesContainer: {
    marginTop: 10,
  },
  stagesChartContainer: {
    marginBottom: 20,
  },
  stagesChart: {
    height: 24,
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  stageBar: {
    height: '100%',
  },
  stageProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  stageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageInfo: {
    flex: 1,
  },
  stageNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  stageDuration: {
    color: '#61dafb',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stageDescription: {
    color: '#aaaaaa',
    fontSize: 12,
    marginVertical: 4,
    marginBottom: 8,
  },
  
  // Consejos
  tipsContainer: {
    marginTop: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  
  // Botón de sincronización
  syncButton: {
    backgroundColor: '#4c6ef5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  syncButtonIcon: {
    marginRight: 10,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Badge de Health Connect
  healthConnectBadge: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthConnectText: {
    fontSize: 12,
    color: '#006064',
    fontWeight: '500',
  },
  // Añadir estos estilos
  sleepStagesCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  sleepStagesList: {
    marginTop: 8,
  },
  sleepStageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  stageIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(97, 218, 251, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stageDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 2,
  },
  stageDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#61dafb',
  },
  stageDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    marginTop: 10,
  },
  datePickerContainer: {
    marginVertical: 16,
    width: '100%',
    paddingHorizontal: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    width: '100%',
    justifyContent: 'space-between',
  },
  datePickerText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#61dafb',
    borderRadius: 10,
  },
  // ... existing code ...
  datePickerContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});
