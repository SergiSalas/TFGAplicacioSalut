import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 40,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
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
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#1a1a2e',
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#FFFFFF',
  },
  challengeItem: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#232342',
    padding: 16,
    borderLeftWidth: 4,
  },
  completedChallenge: {
    borderLeftColor: '#4cd964',
  },
  pendingChallenge: {
    borderLeftColor: '#4c6ef5',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  expReward: {
    backgroundColor: '#4c6ef5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2A2A4A',
    marginVertical: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeType: {
    color: '#AAAAAA',
    fontSize: 12,
    marginLeft: 4,
  },
  generateButton: {
    backgroundColor: '#4c6ef5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});