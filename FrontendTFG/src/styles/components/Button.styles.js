import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

export default StyleSheet.create({
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  text: {
    color: '#fff',
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
});
