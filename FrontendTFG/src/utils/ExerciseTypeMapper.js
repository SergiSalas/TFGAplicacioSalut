/**
 * Clase utilitaria para mapear tipos de ejercicio de Health Connect
 * Basado en la documentación oficial:
 * https://developer.android.com/reference/kotlin/androidx/health/connect/client/records/ExerciseSessionRecord
 */

// Constantes de Health Connect para tipos de ejercicio
export const EXERCISE_TYPES = {
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
  EXERCISE_TYPE_FOOTBALL_AUSTRALIAN: 15,
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
  EXERCISE_TYPE_ROCK_CLIMBING: 51,
  EXERCISE_TYPE_ROLLER_HOCKEY: 52,
  EXERCISE_TYPE_ROWING: 53,
  EXERCISE_TYPE_ROWING_MACHINE: 54,
  EXERCISE_TYPE_RUGBY: 55,
  EXERCISE_TYPE_RUNNING: 56,
  EXERCISE_TYPE_RUNNING_TREADMILL: 57,
  EXERCISE_TYPE_SAILING: 58,
  EXERCISE_TYPE_SCUBA_DIVING: 59,
  EXERCISE_TYPE_SKATING: 60,
  EXERCISE_TYPE_SKIING: 61,
  EXERCISE_TYPE_SNOWBOARDING: 62,
  EXERCISE_TYPE_SNOWSHOEING: 63,
  EXERCISE_TYPE_SOCCER: 64,
  EXERCISE_TYPE_SOFTBALL: 65,
  EXERCISE_TYPE_SQUASH: 66,
  EXERCISE_TYPE_STAIR_CLIMBING: 68,
  EXERCISE_TYPE_STAIR_CLIMBING_MACHINE: 69,
  EXERCISE_TYPE_STRENGTH_TRAINING: 70,
  EXERCISE_TYPE_STRETCHING: 71,
  EXERCISE_TYPE_SURFING: 72,
  EXERCISE_TYPE_SWIMMING_OPEN_WATER: 73,
  EXERCISE_TYPE_SWIMMING_POOL: 74,
  EXERCISE_TYPE_TABLE_TENNIS: 75,
  EXERCISE_TYPE_TENNIS: 76,
  EXERCISE_TYPE_VOLLEYBALL: 78,
  EXERCISE_TYPE_WALKING: 79,
  EXERCISE_TYPE_WATER_POLO: 80,
  EXERCISE_TYPE_WEIGHTLIFTING: 81,
  EXERCISE_TYPE_WHEELCHAIR: 82,
  EXERCISE_TYPE_YOGA: 83,
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
    case EXERCISE_TYPES.EXERCISE_TYPE_FOOTBALL_AUSTRALIAN:
      return "Fútbol Australiano";
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
      return "Hockey sobre patines";
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