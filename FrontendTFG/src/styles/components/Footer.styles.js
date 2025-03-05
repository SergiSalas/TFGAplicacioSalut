import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: SIZES.font * 0.9,
  },
});
