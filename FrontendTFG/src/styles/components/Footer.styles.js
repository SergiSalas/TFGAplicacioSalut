import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    paddingHorizontal: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    elevation: 8,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 10, // Reduced from 12
    marginTop: 2, // Reduced from 4
  },
  footerTextActive: {
    color: '#61dafb',
    fontWeight: 'bold',
  },
});
