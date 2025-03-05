import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,  // Color de fondo definido en constantes
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
  },
  backButton: {
    marginRight: SIZES.padding,
    padding: SIZES.padding / 2,
  },
  backText: {
    color: COLORS.white,
    fontSize: SIZES.font,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: SIZES.font * 1.2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
