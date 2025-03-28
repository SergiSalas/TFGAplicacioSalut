import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navButton: {
    padding: 10,
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNavButton: {
    backgroundColor: 'rgba(76, 110, 245, 0.2)',
    transform: [{ translateY: -4 }],
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  navText: {
    color: '#757575',
    marginTop: 4,
    fontSize: 12,
  },
  activeNavText: {
    color: '#4c6ef5',
    fontWeight: 'bold',
  },
});
