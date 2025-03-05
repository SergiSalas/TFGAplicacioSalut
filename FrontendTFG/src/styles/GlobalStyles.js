import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../src/utils/constants';

export default StyleSheet.create({
  // Contenedor base para las pantallas
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
  },
  // Estilo para centrar contenidos
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilo para textos globales
  globalText: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
});
