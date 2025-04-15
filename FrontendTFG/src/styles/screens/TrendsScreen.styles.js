import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#AAAAAA',
  },
  card: {
    backgroundColor: '#1a1a2e',
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
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#61dafb',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#cccccc',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    backgroundColor: '#232342',
  },
  tabText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
  },
  activeTabText: {
    color: '#61dafb',
    fontWeight: 'bold',
  },
  qualityContainer: {
    marginVertical: 8,
  },
  qualityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  qualityIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  qualityLabel: {
    color: '#ffffff',
    flex: 1,
  },
  qualityValue: {
    color: '#61dafb',
    fontWeight: 'bold',
  },
});