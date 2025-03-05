import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

export default StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,      // Color del borde definido en constantes
    padding: SIZES.padding,          // Espaciado definido en constantes
    borderRadius: SIZES.radius,      // Bordes redondeados
    fontSize: SIZES.font,            // Tamaño de fuente uniforme
    color: COLORS.text,              // Color del texto
    backgroundColor: COLORS.white,   // Fondo blanco para el input
  },
});
