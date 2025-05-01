

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://10.0.2.2:8080";

/**
 * Guarda datos de sueño en el backend
 * @param {string} token - Token de autenticación
 * @param {object} sleepData - Datos de sueño a guardar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
/**
 * Mapea los valores textuales de etapas de sueño a los valores del enum StageType del backend
 * @param {string} stageText - Texto descriptivo de la etapa de sueño
 * @param {number} originalType - Tipo original numérico (si está disponible)
 * @returns {string} - Valor del enum StageType
 */
const mapStageTextToEnum = (stageText, originalType) => {
  // Si tenemos el tipo original numérico, usarlo directamente
  if (originalType !== undefined && originalType !== null) {
    switch (parseInt(originalType, 10)) {
      case 0: return 'UNKNOWN';
      case 1: return 'AWAKE';
      case 2: return 'SLEEPING';
      case 3: return 'OUT_OF_BED';
      case 4: return 'LIGHT';
      case 5: return 'DEEP';
      case 6: return 'REM';
      case 7: return 'AWAKE_IN_BED';
      default: return 'UNKNOWN';
    }
  }
  
  // Si no tenemos el tipo original, intentar mapear desde el texto
  if (typeof stageText === 'string') {
    const text = stageText.toLowerCase();
    if (text.includes('despierto') || text.includes('awake')) {
      return 'AWAKE';
    } else if (text.includes('ligero') || text.includes('light')) {
      return 'LIGHT';
    } else if (text.includes('profundo') || text.includes('deep')) {
      return 'DEEP';
    } else if (text.includes('rem')) {
      return 'REM';
    } else if (text.includes('fuera') || text.includes('out')) {
      return 'OUT_OF_BED';
    } else if (text.includes('cama') && text.includes('despierto')) {
      return 'AWAKE_IN_BED';
    } else if (text.includes('durmiendo') || text.includes('sleeping')) {
      return 'SLEEPING';
    }
  }
  
  return 'UNKNOWN';
};

export const saveSleepData = async (token, sleepData) => {
  try {
    if (!sleepData) {
      throw new Error('No hay datos de sueño para guardar');
    }

    console.log('Preparando datos de sueño para enviar al backend:', sleepData);
    
    // Verificar si tenemos un token válido
    if (!token) {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        throw new Error('No authentication token available');
      }
      token = storedToken;
    }
    
    // Calcular valor de sueño REM - típicamente 20-25% del tiempo total de sueño para adultos sanos
    let remSleepValue = 0;
    
    if (sleepData.stagesSummary && sleepData.stagesSummary.remSleep && sleepData.stagesSummary.remSleep > 0) {
      // Si tenemos datos reales de REM, usarlos (convertir de horas a minutos para almacenamiento entero)
      remSleepValue = Math.round(sleepData.stagesSummary.remSleep * 60);
    } else if (sleepData.durationHours > 0) {
      // Si no hay datos de REM pero tenemos duración del sueño, estimar REM como ~20% del sueño total
      remSleepValue = Math.round(sleepData.durationHours * 0.2 * 60);
    }
    
    // Asegurarse de que tenemos una calidad de sueño válida
    const quality = sleepData.quality || 5; // Valor predeterminado si no hay calidad
    
    // Preparar las etapas de sueño si existen
    let sleepStagesDTO = null;
    
    if (sleepData.sleepStages && Array.isArray(sleepData.sleepStages) && sleepData.sleepStages.length > 0) {
      // Si tenemos etapas de sueño en el objeto sleepData, usarlas
      sleepStagesDTO = sleepData.sleepStages.map(stage => ({
        startTime: new Date(stage.startTime),
        endTime: new Date(stage.endTime),
        stageType: stage.stageType
      }));
    } else if (sleepData.sleepStagesDTO && Array.isArray(sleepData.sleepStagesDTO) && sleepData.sleepStagesDTO.length > 0) {
      // Si las etapas están en sleepStagesDTO, usarlas directamente
      sleepStagesDTO = sleepData.sleepStagesDTO.map(stage => ({
        startTime: new Date(stage.startTime),
        endTime: new Date(stage.endTime),
        stageType: stage.stageType
      }));
    } else if (sleepData.stages && Array.isArray(sleepData.stages) && sleepData.stages.length > 0) {
      // Si tenemos etapas en el formato de Health Connect Toolbox
      sleepStagesDTO = sleepData.stages.map(stage => {
        // Verificar si stage es un número o un objeto
        let stageType;
        
        if (typeof stage.stage === 'number') {
          // Si stage es un número, usarlo directamente para mapear
          stageType = mapStageTextToEnum(null, stage.stage);
        } else if (stage.originalType !== undefined) {
          // Si tenemos originalType, usarlo
          stageType = mapStageTextToEnum(stage.stage, stage.originalType);
        } else {
          // Si no, intentar mapear desde el texto
          stageType = mapStageTextToEnum(stage.stage, null);
        }
        
        return {
          startTime: new Date(stage.startTime),
          endTime: new Date(stage.endTime),
          stageType: stageType
        };
      });
    } else if (sleepData.stagesSummary) {
      // Si tenemos un resumen de etapas pero no las etapas individuales, crear etapas aproximadas
      const startTime = new Date(sleepData.startTime);
      const endTime = new Date(sleepData.endTime);
      
      sleepStagesDTO = [];
      let currentTime = new Date(startTime);
      
      // Procesar todas las etapas disponibles en el objeto stages
      if (sleepData.stages) {
        for (const stage of sleepData.stages) {
          const stageStartTime = new Date(stage.startTime || stage.start);
          const stageEndTime = new Date(stage.endTime || stage.end);
          const stageType = stage.stageType || stage.stage;
          
          sleepStagesDTO.push({
            startTime: stageStartTime,
            endTime: stageEndTime,
            stageType: stageType
          });
        }
      } else {
        // Crear etapas basadas en el resumen si está disponible
        if (sleepData.stagesSummary.awake > 0) {
          const awakeEndTime = new Date(currentTime.getTime() + sleepData.stagesSummary.awake * 60 * 60 * 1000);
          sleepStagesDTO.push({
            startTime: new Date(currentTime),
            endTime: awakeEndTime,
            stageType: 'AWAKE_IN_BED'
          });
          currentTime = new Date(awakeEndTime);
        }
        
        if (sleepData.stagesSummary.deepSleep > 0) {
          const deepEndTime = new Date(currentTime.getTime() + sleepData.stagesSummary.deepSleep * 60 * 60 * 1000);
          sleepStagesDTO.push({
            startTime: new Date(currentTime),
            endTime: deepEndTime,
            stageType: 'DEEP'
          });
          currentTime = new Date(deepEndTime);
        }
        
        if (sleepData.stagesSummary.lightSleep > 0) {
          const lightEndTime = new Date(currentTime.getTime() + sleepData.stagesSummary.lightSleep * 60 * 60 * 1000);
          sleepStagesDTO.push({
            startTime: new Date(currentTime),
            endTime: lightEndTime,
            stageType: 'LIGHT'
          });
          currentTime = new Date(lightEndTime);
        }
        
        if (sleepData.stagesSummary.remSleep > 0) {
          const remEndTime = new Date(currentTime.getTime() + sleepData.stagesSummary.remSleep * 60 * 60 * 1000);
          sleepStagesDTO.push({
            startTime: new Date(currentTime),
            endTime: remEndTime,
            stageType: 'REM'
          });
          currentTime = new Date(remEndTime);
        }
        
        // Añadir etapa OUT_OF_BED si hay tiempo restante hasta el final
        if (currentTime < endTime) {
          sleepStagesDTO.push({
            startTime: new Date(currentTime),
            endTime: new Date(endTime),
            stageType: 'OUT_OF_BED'
          });
        }
      }
    }
    
    // Mapear los datos para que coincidan con la estructura DTO del backend
    const sleepDTO = {
      startTime: new Date(sleepData.startTime),
      endTime: new Date(sleepData.endTime),
      hours: sleepData.durationHours,
      quality: quality,
      remSleep: remSleepValue,
      comment: sleepData.comment || null,
      sleepStagesDTO: sleepStagesDTO
    };

    console.log('Enviando datos de sueño al backend:', sleepDTO);

    // Usar axios en lugar de fetch para mantener consistencia con otros servicios
    const response = await axios.post(
      `${API_URL}/sleep/createSleep`,
      sleepDTO,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Datos de sueño guardados correctamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en saveSleepData:', error);
    throw error;
  }
};

/**
 * Obtiene el historial de sueño del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} - Historial de sueño
 */
export const getSleepHistory = async (token) => {
  try {
    if (!token) {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        throw new Error('No authentication token available');
      }
      token = storedToken;
    }

    console.log('Obteniendo historial de sueño...');
    const response = await axios.get(`${API_URL}/sleep/history`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Historial de sueño obtenido: ${response.data.length} registros`);
    return response.data;
  } catch (error) {
    console.error('Error en getSleepHistory:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de sueño del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Estadísticas de sueño
 */
export const getSleepStats = async (token) => {
  try {
    if (!token) {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        throw new Error('No authentication token available');
      }
      token = storedToken;
    }

    console.log('Obteniendo estadísticas de sueño...');
    const response = await axios.get(`${API_URL}/sleep/stats`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Estadísticas de sueño obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en getSleepStats:', error);
    throw error;
  }
};

/**
 * Actualiza un registro de sueño existente
 * @param {string} token - Token de autenticación
 * @param {string} sleepId - ID del registro de sueño
 * @param {object} sleepData - Datos actualizados de sueño
 * @returns {Promise<Object>} - Registro de sueño actualizado
 */
export const updateSleep = async (token, sleepId, sleepData) => {
  try {
    if (!token) {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        throw new Error('No authentication token available');
      }
      token = storedToken;
    }

    if (!sleepId) {
      throw new Error('Se requiere un ID de sueño válido');
    }

    if (!sleepData) {
      throw new Error('No hay datos de sueño para actualizar');
    }

    // Asegurarse de que tenemos una calidad de sueño válida
    const quality = sleepData.quality || 5;
    
    // Mapear los datos para que coincidan con la estructura DTO del backend
    const sleepDTO = {
      id: sleepId,
      startTime: sleepData.startTime,
      endTime: sleepData.endTime,
      hours: sleepData.hours || sleepData.durationHours,
      quality: quality,
      remSleep: sleepData.remSleep,
      comment: sleepData.comment || null
    };

    const response = await axios.put(
      `${API_URL}/sleep/update`,
      sleepDTO,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error al actualizar sueño con ID ${sleepId}:`, error);
    throw error;
  }
};

/**
 * Elimina un registro de sueño
 * @param {string} token - Token de autenticación
 * @param {string} sleepId - ID del registro de sueño
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const deleteSleep = async (token, sleepId) => {
  try {
    if (!token) {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        throw new Error('No authentication token available');
      }
      token = storedToken;
    }

    if (!sleepId) {
      throw new Error('Se requiere un ID de sueño válido');
    }

    const response = await axios.delete(`${API_URL}/sleep/${sleepId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error al eliminar sueño con ID ${sleepId}:`, error);
    throw error;
  }
};

/**
 * Convierte fechas UTC a la zona horaria local del dispositivo
 * @param {Object} sleepData - Datos de sueño con fechas en UTC
 * @returns {Object} - Datos de sueño con fechas en zona horaria local
 */
export const convertToLocalTimezone = (sleepData) => {
  if (!sleepData) return null;
  
  // Crear una copia profunda para no modificar el objeto original
  const localData = JSON.parse(JSON.stringify(sleepData));
  
  // Convertir fechas principales
  if (localData.startTime) {
    const startDate = new Date(localData.startTime);
    localData.startTime = startDate.toISOString();
    // También podemos guardar versiones formateadas para mostrar
    localData.formattedStartTime = startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  
  if (localData.endTime) {
    const endDate = new Date(localData.endTime);
    localData.endTime = endDate.toISOString();
    localData.formattedEndTime = endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  
  // Convertir fechas de etapas de sueño si existen
  if (localData.sleepStagesDTO && Array.isArray(localData.sleepStagesDTO)) {
    localData.sleepStagesDTO = localData.sleepStagesDTO.map(stage => {
      const newStage = {...stage};
      if (newStage.startTime) {
        const stageStartDate = new Date(newStage.startTime);
        newStage.startTime = stageStartDate.toISOString();
      }
      if (newStage.endTime) {
        const stageEndDate = new Date(newStage.endTime);
        newStage.endTime = stageEndDate.toISOString();
      }
      return newStage;
    });
  }
  
  return localData;
};

/**
 * Obtiene los datos de sueño para una fecha específica
 * @param {string} token - Token de autenticación
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Array>} - Datos de sueño para la fecha especificada
 */
export const getSleepsByDate = async (token, date) => {
  try {
    if (!token) {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        throw new Error('No authentication token available');
      }
      token = storedToken;
    }

    if (!date) {
      throw new Error('Se requiere una fecha válida');
    }

    console.log(`Obteniendo datos de sueño para la fecha: ${date}`);
    const response = await axios.get(`${API_URL}/sleep/getSleeps?date=${date}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Datos de sueño obtenidos: ${response.data.length} registros`);
    
    // Convertir fechas a zona horaria local si hay datos
    if (response.data && response.data.length > 0) {
      response.data = response.data.map(sleepRecord => convertToLocalTimezone(sleepRecord));
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos de sueño para la fecha ${date}:`, error);
    throw error;
  }
};

// Actualizar el export default para incluir la nueva función
export default {
  saveSleepData,
  getSleepHistory,
  getSleepStats,
  updateSleep,
  deleteSleep,
  getSleepsByDate,
  convertToLocalTimezone
};


/**
 * Análisis de los Datos de Sueño de Health Connect
 *
 * Veo que estás recibiendo datos de sueño desde Health Connect en un formato específico. Vamos a analizar estos datos y ver cómo se están procesando en tu aplicación.
 *
 * ## Datos recibidos de Health Connect
 *
 * Los datos que recibes tienen esta estructura:
 * - Un objeto `Sleep Response` con un array de `records`
 * - Cada registro tiene:
 *   - Tiempo de inicio y fin
 *   - Un array de `stages` (etapas de sueño)
 *   - Notas, título y metadatos
 *
 * ## Etapas de sueño recibidas
 *
 * Las etapas de sueño vienen con valores numéricos:
 * 1. Etapa 7: 08:01 - 10:08 (2.1h) - Corresponde a `AWAKE_IN_BED`
 * 2. Etapa 4: 10:08 - 12:16 (2.1h) - Corresponde a `LIGHT`
 * 3. Etapa 3: 12:16 - 14:23 (2.1h) - Corresponde a `OUT_OF_BED`
 * 4. Etapa 0: 14:23 - 16:31 (2.1h) - Corresponde a `UNKNOWN`
 *
 * ## Problema identificado
 *
 * En tu código actual, estás mapeando correctamente los valores numéricos a los tipos de etapa en la función `mapStageTextToEnum`, pero hay un problema en cómo se están procesando las etapas en la función `saveSleepData`.
 *
 * El problema principal es que los datos que recibes de Health Connect tienen las etapas con valores numéricos (`stage: 7`, `stage: 4`, etc.), pero tu código está esperando que estos valores estén en la propiedad `originalType` y no en `stage`.
 *
 * ## Solución propuesta
 *
 * Necesitas modificar la función `saveSleepData` para manejar correctamente las etapas cuando vienen directamente de Health Connect:
```javascript
// ... existing code ...

else if (sleepData.stages && Array.isArray(sleepData.stages) && sleepData.stages.length > 0) {
  // Si tenemos etapas en el formato de Health Connect Toolbox
  sleepStagesDTO = sleepData.stages.map(stage => {
    // Verificar si stage es un número o un objeto
    let stageType;
    
    if (typeof stage.stage === 'number') {
      // Si stage es un número, usarlo directamente para mapear
      stageType = mapStageTextToEnum(null, stage.stage);
    } else if (stage.originalType !== undefined) {
      // Si tenemos originalType, usarlo
      stageType = mapStageTextToEnum(stage.stage, stage.originalType);
    } else {
      // Si no, intentar mapear desde el texto
      stageType = mapStageTextToEnum(stage.stage, null);
    }
    
    return {
      startTime: new Date(stage.startTime),
      endTime: new Date(stage.endTime),
      stageType: stageType
    };
  });
}

// ... existing code ...*/