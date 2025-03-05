import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

export default StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
});
