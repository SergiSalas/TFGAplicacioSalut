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
    position: 'relative', // importante para el centrado del título
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 45, // mismo valor que paddingTop
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2, // para estar encima del título
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4c6ef5',
    marginRight: 10,
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  levelBadge: {
    backgroundColor: '#4c6ef5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    zIndex: 2, // para estar encima del título
  },
  content: {
    padding: 16,
    paddingBottom: 80, 
    flexGrow: 1, 
  },
  statsCard: {
    width: '100%',
    marginBottom: 15,
  },
  statsContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(97, 218, 251, 0.5)', 
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: '#cccccc',
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    backgroundColor: '#1a1a2e',
    padding: 16,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  metricCard: {
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#232342',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#4c6ef5', // Mantener este color o cambiarlo si prefieres
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardContent: {
    marginTop: 8,
  },
  metricSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  notificationText: {
    color: '#e0e0e0',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 20,
  },
  hydrationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hydrationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
});
