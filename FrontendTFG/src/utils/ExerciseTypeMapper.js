/**
 * Clase utilitaria para mapear tipos de ejercicio de Health Connect
 * Basado en la documentación oficial:
 * https://developer.android.com/reference/kotlin/androidx/health/connect/client/records/ExerciseSessionRecord
 */

/**
 * Mapeo completo de tipos de ejercicio basado en la documentación oficial:
 * https://developer.android.com/reference/kotlin/androidx/health/connect/client/records/ExerciseSessionRecord
 */

// Constantes de Health Connect para tipos de ejercicio (completo)
export const EXERCISE_TYPES = {
  EXERCISE_TYPE_OTHER: 0,  // Tipo genérico/desconocido
  EXERCISE_TYPE_AEROBICS: 1,
  EXERCISE_TYPE_BADMINTON: 2,
  EXERCISE_TYPE_BASEBALL: 3,
  EXERCISE_TYPE_BASKETBALL: 4,
  EXERCISE_TYPE_BIKING: 5,
  EXERCISE_TYPE_BIKING_STATIONARY: 6,
  EXERCISE_TYPE_BOOT_CAMP: 7,
  EXERCISE_TYPE_BOXING: 8,
  EXERCISE_TYPE_CALISTHENICS: 9,
  EXERCISE_TYPE_CRICKET: 10,
  EXERCISE_TYPE_DANCING: 11,
  EXERCISE_TYPE_ELLIPTICAL: 12,
  EXERCISE_TYPE_FENCING: 13,
  EXERCISE_TYPE_FOOTBALL_AMERICAN: 14,
  EXERCISE_TYPE_FOOTBALL: 15,
  EXERCISE_TYPE_FRISBEE_DISC: 16,
  EXERCISE_TYPE_GOLF: 17,
  EXERCISE_TYPE_GUIDED_BREATHING: 18,
  EXERCISE_TYPE_GYMNASTICS: 19,
  EXERCISE_TYPE_HANDBALL: 20,
  EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING: 21,
  EXERCISE_TYPE_HIKING: 22,
  EXERCISE_TYPE_ICE_HOCKEY: 23,
  EXERCISE_TYPE_ICE_SKATING: 24,
  EXERCISE_TYPE_MARTIAL_ARTS: 26,
  EXERCISE_TYPE_PADDLING: 27,
  EXERCISE_TYPE_PARAGLIDING: 28,
  EXERCISE_TYPE_PILATES: 29,
  EXERCISE_TYPE_RACQUETBALL: 30,
  EXERCISE_TYPE_ROCK_CLIMBING: 31,
  EXERCISE_TYPE_ROLLER_HOCKEY: 32,
  EXERCISE_TYPE_ROWING: 33,
  EXERCISE_TYPE_ROWING_MACHINE: 34,
  EXERCISE_TYPE_RUGBY: 35,
  EXERCISE_TYPE_RUNNING: 36,
  EXERCISE_TYPE_RUNNING_TREADMILL: 37,
  EXERCISE_TYPE_SAILING: 38,
  EXERCISE_TYPE_SCUBA_DIVING: 39,
  EXERCISE_TYPE_SKATING: 40,
  EXERCISE_TYPE_SKIING: 41,
  EXERCISE_TYPE_SNOWBOARDING: 42,
  EXERCISE_TYPE_SNOWSHOEING: 43,
  EXERCISE_TYPE_SOCCER: 44,
  EXERCISE_TYPE_SOFTBALL: 45,
  EXERCISE_TYPE_SQUASH: 46,
  EXERCISE_TYPE_STAIR_CLIMBING: 47,
  EXERCISE_TYPE_STAIR_CLIMBING_MACHINE: 48,
  EXERCISE_TYPE_STRENGTH_TRAINING: 49,
  EXERCISE_TYPE_STRETCHING: 50,
  EXERCISE_TYPE_SURFING: 51,
  EXERCISE_TYPE_SWIMMING_OPEN_WATER: 52,
  EXERCISE_TYPE_SWIMMING_POOL: 53,
  EXERCISE_TYPE_TABLE_TENNIS: 54,
  EXERCISE_TYPE_TENNIS: 55,
  EXERCISE_TYPE_VOLLEYBALL: 56,
  EXERCISE_TYPE_WALKING: 57,
  EXERCISE_TYPE_WATER_POLO: 58,
  EXERCISE_TYPE_WEIGHTLIFTING: 59,
  EXERCISE_TYPE_WHEELCHAIR: 60,
  EXERCISE_TYPE_YOGA: 61,
  // Agregar otros tipos que puedas necesitar
};

// Mapeo directo de código de Health Connect a tipo de actividad del backend
const HEALTH_CONNECT_TO_BACKEND_TYPE = {
  0: 'OTHER',                         // Tipo genérico
  1: 'AEROBICS',
  2: 'BADMINTON',
  3: 'BASEBALL',
  4: 'BASKETBALL',
  5: 'CYCLING',                      // Biking -> Cycling
  6: 'CYCLING',                      // Biking Stationary -> Cycling
  7: 'BOOT_CAMP', 
  8: 'BOXING',
  9: 'CALISTHENICS',
  10: 'CRICKET',
  11: 'DANCE',                        // Dancing -> Dance
  12: 'ELLIPTICAL',
  13: 'FENCING',
  14: 'FOOTBALL_AMERICAN',
  15: 'FOOTBALL',
  16: 'FRISBEE_DISC',
  17: 'GOLF',
  18: 'GUIDED_BREATHING',
  19: 'GYMNASTICS',
  20: 'HANDBALL',
  21: 'HIIT',                        // High Intensity Interval Training -> HIIT
  22: 'HIKING',
  23: 'ICE_HOCKEY',
  24: 'ICE_SKATING',
  26: 'MARTIAL_ARTS',
  27: 'PADDLING',
  28: 'PARAGLIDING',
  29: 'PILATES',
  30: 'RACQUETBALL',
  31: 'CLIMBING',                     // Rock Climbing -> Climbing
  32: 'ROLLER_HOCKEY',                // CORREGIDO: Tipo 32 es ROLLER_HOCKEY, no ROLLER_SKATING
  33: 'ROWING',
  34: 'ROWING_MACHINE',
  35: 'RUGBY',
  36: 'RUNNING',
  37: 'RUNNING',                      // Running Treadmill -> Running
  38: 'SAILING',
  39: 'SCUBA_DIVING',
  40: 'SKATING',
  41: 'SKIING',
  42: 'SNOWBOARDING',
  43: 'SNOWSHOEING',
  44: 'FOOTBALL',                     // Soccer -> Football
  45: 'SOFTBALL',
  46: 'SQUASH',
  47: 'STAIR_CLIMBING',
  48: 'STAIR_CLIMBING_MACHINE',
  49: 'STRENGTH_TRAINING',
  50: 'STRETCHING',
  51: 'SURFING',
  52: 'SWIMMING',                     // Swimming Open Water -> Swimming
  53: 'SWIMMING',                     // Swimming Pool -> Swimming
  54: 'TABLE_TENNIS',
  55: 'TENNIS',
  56: 'VOLLEYBALL',
  57: 'WALKING',
  58: 'WATER_POLO',
  59: 'WEIGHTLIFTING',
  60: 'WHEELCHAIR',
  61: 'YOGA',
};

/**
 * Función robusta para mapear tipos de ejercicio de Health Connect a tipos del backend.
 * Implementa un mecanismo de log para diagnóstico.
 */
export const getBackendActivityType = (exerciseType) => {
  // Conversión y validación
  const typeCode = typeof exerciseType === 'string' 
    ? parseInt(exerciseType, 10) 
    : exerciseType;
  
  console.log(`🔍 Mapeando tipo de ejercicio: ${typeCode} (${typeof exerciseType}) a tipo backend`);
  
  // Si no es un número válido, log y usar tipo genérico
  if (isNaN(typeCode)) {
    console.log(`⚠️ Tipo de ejercicio no reconocido (NaN): ${exerciseType}`);
    return 'OTHER';
  }
  
  // Hacer mapeo directo usando el objeto de mapeo
  const backendType = HEALTH_CONNECT_TO_BACKEND_TYPE[typeCode];
  
  if (backendType) {
    console.log(`✅ Mapeo exitoso: ${typeCode} -> ${backendType}`);
    return backendType;
  }
  
  // Si no hay mapeo directo, intentar búsqueda en EXERCISE_TYPES
  console.log(`⚠️ No se encontró mapeo directo para el tipo: ${typeCode}`);
  
  for (const [keyName, value] of Object.entries(EXERCISE_TYPES)) {
    if (value === typeCode) {
      // Extraer el nombre del tipo sin el prefijo
      const typeName = keyName.replace('EXERCISE_TYPE_', '');
      console.log(`ℹ️ Nombre encontrado para tipo ${typeCode}: ${typeName}`);
      
      // Intentar usar el nombre como tipo (convertido al formato esperado)
      const suggestedType = typeName.replace(/_/g, '');
      console.log(`🧪 Intentando con tipo: ${suggestedType}`);
      return suggestedType;
    }
  }
  
  // Si todo falla, usar tipo genérico
  console.log(`❗ No se pudo identificar el tipo ${typeCode}, usando 'OTHER'`);
  return 'OTHER';
};

// Mapeo de tipo de ejercicio a nombre en español
export const getExerciseTypeName = (exerciseType) => {
  // Si recibimos un string, intentamos convertirlo a número
  const typeCode = typeof exerciseType === 'string' 
    ? parseInt(exerciseType, 10) 
    : exerciseType;
    
  // Si no es un número válido, devolvemos un valor predeterminado
  if (isNaN(typeCode)) {
    return "Ejercicio";
  }
  
  // Mapeo de código a nombre en español
  switch (typeCode) {
    case EXERCISE_TYPES.EXERCISE_TYPE_AEROBICS:
      return "Aeróbicos";
    case EXERCISE_TYPES.EXERCISE_TYPE_BADMINTON:
      return "Bádminton";
    case EXERCISE_TYPES.EXERCISE_TYPE_BASEBALL:
      return "Béisbol";
    case EXERCISE_TYPES.EXERCISE_TYPE_BASKETBALL:
      return "Baloncesto";
    case EXERCISE_TYPES.EXERCISE_TYPE_BIKING:
      return "Ciclismo";
    case EXERCISE_TYPES.EXERCISE_TYPE_BIKING_STATIONARY:
      return "Bicicleta estática";
    case EXERCISE_TYPES.EXERCISE_TYPE_BOOT_CAMP:
      return "Boot Camp";
    case EXERCISE_TYPES.EXERCISE_TYPE_BOXING:
      return "Boxeo";
    case EXERCISE_TYPES.EXERCISE_TYPE_CALISTHENICS:
      return "Calistenia";
    case EXERCISE_TYPES.EXERCISE_TYPE_CRICKET:
      return "Críquet";
    case EXERCISE_TYPES.EXERCISE_TYPE_DANCING:
      return "Baile";
    case EXERCISE_TYPES.EXERCISE_TYPE_ELLIPTICAL:
      return "Elíptica";
    case EXERCISE_TYPES.EXERCISE_TYPE_FENCING:
      return "Esgrima";
    case EXERCISE_TYPES.EXERCISE_TYPE_FOOTBALL_AMERICAN:
      return "Fútbol Americano";
    case EXERCISE_TYPES.EXERCISE_TYPE_FOOTBALL:
      return "Fútbol";
    case EXERCISE_TYPES.EXERCISE_TYPE_FRISBEE_DISC:
      return "Frisbee";
    case EXERCISE_TYPES.EXERCISE_TYPE_GOLF:
      return "Golf";
    case EXERCISE_TYPES.EXERCISE_TYPE_GUIDED_BREATHING:
      return "Respiración guiada";
    case EXERCISE_TYPES.EXERCISE_TYPE_GYMNASTICS:
      return "Gimnasia";
    case EXERCISE_TYPES.EXERCISE_TYPE_HANDBALL:
      return "Balonmano";
    case EXERCISE_TYPES.EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING:
      return "HIIT";
    case EXERCISE_TYPES.EXERCISE_TYPE_HIKING:
      return "Senderismo";
    case EXERCISE_TYPES.EXERCISE_TYPE_ICE_HOCKEY:
      return "Hockey sobre hielo";
    case EXERCISE_TYPES.EXERCISE_TYPE_ICE_SKATING:
      return "Patinaje sobre hielo";
    case EXERCISE_TYPES.EXERCISE_TYPE_MARTIAL_ARTS:
      return "Artes marciales";
    case EXERCISE_TYPES.EXERCISE_TYPE_PADDLING:
      return "Remo";
    case EXERCISE_TYPES.EXERCISE_TYPE_PARAGLIDING:
      return "Parapente";
    case EXERCISE_TYPES.EXERCISE_TYPE_PILATES:
      return "Pilates";
    case EXERCISE_TYPES.EXERCISE_TYPE_RACQUETBALL:
      return "Racquetball";
    case EXERCISE_TYPES.EXERCISE_TYPE_ROCK_CLIMBING:
      return "Escalada";
    case EXERCISE_TYPES.EXERCISE_TYPE_ROLLER_HOCKEY:
      return "Roller Skating";
    case EXERCISE_TYPES.EXERCISE_TYPE_ROWING:
      return "Remo";
    case EXERCISE_TYPES.EXERCISE_TYPE_ROWING_MACHINE:
      return "Máquina de remo";
    case EXERCISE_TYPES.EXERCISE_TYPE_RUGBY:
      return "Rugby";
    case EXERCISE_TYPES.EXERCISE_TYPE_RUNNING:
      return "Carrera";
    case EXERCISE_TYPES.EXERCISE_TYPE_RUNNING_TREADMILL:
      return "Carrera en cinta";
    case EXERCISE_TYPES.EXERCISE_TYPE_SAILING:
      return "Navegación";
    case EXERCISE_TYPES.EXERCISE_TYPE_SCUBA_DIVING:
      return "Buceo";
    case EXERCISE_TYPES.EXERCISE_TYPE_SKATING:
      return "Patinaje";
    case EXERCISE_TYPES.EXERCISE_TYPE_SKIING:
      return "Esquí";
    case EXERCISE_TYPES.EXERCISE_TYPE_SNOWBOARDING:
      return "Snowboard";
    case EXERCISE_TYPES.EXERCISE_TYPE_SNOWSHOEING:
      return "Raquetas de nieve";
    case EXERCISE_TYPES.EXERCISE_TYPE_SOCCER:
      return "Fútbol";
    case EXERCISE_TYPES.EXERCISE_TYPE_SOFTBALL:
      return "Sóftbol";
    case EXERCISE_TYPES.EXERCISE_TYPE_SQUASH:
      return "Squash";
    case EXERCISE_TYPES.EXERCISE_TYPE_STAIR_CLIMBING:
      return "Subir escaleras";
    case EXERCISE_TYPES.EXERCISE_TYPE_STAIR_CLIMBING_MACHINE:
      return "Máquina de escaleras";
    case EXERCISE_TYPES.EXERCISE_TYPE_STRENGTH_TRAINING:
      return "Entrenamiento de fuerza";
    case EXERCISE_TYPES.EXERCISE_TYPE_STRETCHING:
      return "Estiramientos";
    case EXERCISE_TYPES.EXERCISE_TYPE_SURFING:
      return "Surf";
    case EXERCISE_TYPES.EXERCISE_TYPE_SWIMMING_OPEN_WATER:
      return "Natación en aguas abiertas";
    case EXERCISE_TYPES.EXERCISE_TYPE_SWIMMING_POOL:
      return "Natación en piscina";
    case EXERCISE_TYPES.EXERCISE_TYPE_TABLE_TENNIS:
      return "Ping-pong";
    case EXERCISE_TYPES.EXERCISE_TYPE_TENNIS:
      return "Tenis";
    case EXERCISE_TYPES.EXERCISE_TYPE_VOLLEYBALL:
      return "Voleibol";
    case EXERCISE_TYPES.EXERCISE_TYPE_WALKING:
      return "Caminata";
    case EXERCISE_TYPES.EXERCISE_TYPE_WATER_POLO:
      return "Waterpolo";
    case EXERCISE_TYPES.EXERCISE_TYPE_WEIGHTLIFTING:
      return "Levantamiento de pesas";
    case EXERCISE_TYPES.EXERCISE_TYPE_WHEELCHAIR:
      return "Silla de ruedas";
    case EXERCISE_TYPES.EXERCISE_TYPE_YOGA:
      return "Yoga";
    default:
      return "Ejercicio";
  }
};


// Mapeo de tipo de ejercicio a icono (usando Ionicons)
export const getExerciseTypeIcon = (exerciseType) => {
  const typeName = typeof exerciseType === 'number' 
    ? getExerciseTypeName(exerciseType)
    : exerciseType;
  
  const iconsMap = {
    'Carrera': 'speedometer-outline',
    'Running': 'speedometer-outline',
    'Caminata': 'walk-outline', 
    'Walking': 'walk-outline',
    'Ciclismo': 'bicycle-outline',
    'Cycling': 'bicycle-outline',
    'Bicicleta estática': 'bicycle-outline',
    'Natación': 'water-outline',
    'Natación en piscina': 'water-outline',
    'Natación en aguas abiertas': 'water-outline',
    'Swimming': 'water-outline',
    'Fútbol': 'football-outline',
    'Soccer': 'football-outline',
    'Baloncesto': 'basketball-outline',
    'Basketball': 'basketball-outline',
    'Tenis': 'tennisball-outline',
    'Tennis': 'tennisball-outline',
    'Boxeo': 'fitness-outline',
    'Boxing': 'fitness-outline',
    'Entrenamiento': 'barbell-outline',
    'Entrenamiento de fuerza': 'barbell-outline',
    'Levantamiento de pesas': 'barbell-outline',
    'Workout': 'barbell-outline',
    'Yoga': 'body-outline',
    'Pilates': 'body-outline',
    'HIIT': 'timer-outline',
    'Hiit': 'timer-outline',
    'Baile': 'musical-notes-outline',
    'Dance': 'musical-notes-outline',
    'Senderismo': 'trail-sign-outline',
    'Remo': 'boat-outline',
    'Máquina de remo': 'boat-outline',
    'Golf': 'golf-outline',
    'Escalada': 'trending-up-outline',
    'Esquí': 'snow-outline',
    'Snowboard': 'snow-outline',
    'Patinaje': 'snow-outline',
    'Patinaje sobre hielo': 'snow-outline',
    'Hockey sobre hielo': 'snow-outline',
    'Frisbee': 'disc-outline',
    'Voleibol': 'american-football-outline',
    'Rugby': 'american-football-outline',
    'Fútbol Americano': 'american-football-outline',
  };
  
  return iconsMap[typeName] || 'fitness-outline';
};

// Mapeo de tipo de ejercicio a color
export const getExerciseTypeColor = (exerciseType) => {
  const typeName = typeof exerciseType === 'number' 
    ? getExerciseTypeName(exerciseType)
    : exerciseType;

  const colorsMap = {
    'Carrera': '#ff6b6b',
    'Running': '#ff6b6b',
    'Caminata': '#54a0ff',
    'Walking': '#54a0ff',
    'Ciclismo': '#5f27cd',
    'Cycling': '#5f27cd',
    'Bicicleta estática': '#5f27cd',
    'Natación': '#00d2d3',
    'Natación en piscina': '#00d2d3',
    'Natación en aguas abiertas': '#00d2d3',
    'Swimming': '#00d2d3',
    'Fútbol': '#1dd1a1',
    'Soccer': '#1dd1a1',
    'Baloncesto': '#ff9f43',
    'Basketball': '#ff9f43',
    'Tenis': '#feca57',
    'Tennis': '#feca57',
    'Boxeo': '#ff6b6b',
    'Boxing': '#ff6b6b',
    'Entrenamiento': '#5f27cd',
    'Entrenamiento de fuerza': '#5f27cd',
    'Levantamiento de pesas': '#5f27cd',
    'Workout': '#5f27cd',
    'Yoga': '#1dd1a1',
    'Pilates': '#1dd1a1',
    'HIIT': '#ff6b6b',
    'Hiit': '#ff6b6b',
    'Baile': '#ff9ff3',
    'Dance': '#ff9ff3',
    'Senderismo': '#78e08f',
    'Remo': '#38ada9',
    'Máquina de remo': '#38ada9',
    'Golf': '#78e08f',
    'Escalada': '#fa983a',
    'Esquí': '#54a0ff',
    'Snowboard': '#54a0ff',
    'Patinaje': '#54a0ff',
    'Patinaje sobre hielo': '#54a0ff',
    'Hockey sobre hielo': '#ff6b6b',
    'Frisbee': '#1dd1a1',
    'Voleibol': '#ffbe76',
    'Rugby': '#ff6b6b',
    'Fútbol Americano': '#ff6b6b',
  };
  
  return colorsMap[typeName] || '#4a69bd';
}; 