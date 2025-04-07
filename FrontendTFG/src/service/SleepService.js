

API_URL = "http://10.0.2.2:8080";

export const saveSleepData = async (token, sleepData) => {
  try {
    // Debug the incoming REM sleep value
    console.log('Original REM sleep value:', sleepData.stagesSummary.remSleep);
    
    // Calculate REM sleep value - typically 20-25% of total sleep time for healthy adults
    // If no REM data is available, estimate it based on total sleep duration
    let remSleepValue = 0;
    
    if (sleepData.stagesSummary.remSleep && sleepData.stagesSummary.remSleep > 0) {
      // If we have actual REM data, use it (convert from hours to minutes for integer storage)
      remSleepValue = Math.round(sleepData.stagesSummary.remSleep * 60);
    } else if (sleepData.durationHours > 0) {
      // If no REM data but we have sleep duration, estimate REM as ~20% of total sleep
      // This is a fallback estimation based on typical sleep patterns
      remSleepValue = Math.round(sleepData.durationHours * 0.2 * 60);
    }
    
    // Map the data to match the backend DTO structure
    const sleepDTO = {
      startTime: sleepData.startTime,
      endTime: sleepData.endTime,
      hours: sleepData.durationHours,
      quality: sleepData.quality,
      remSleep: remSleepValue,
      comment: null
    };

    console.log('Sending sleep data to backend:', sleepDTO);

    const response = await fetch(`${API_URL}/sleep/createSleep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sleepDTO)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', errorText);
      throw new Error('Error al guardar los datos de sueño');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en saveSleepData:', error);
    throw error;
  }
};

export const getSleepHistory = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/sleep/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener el historial de sueño');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getSleepHistory:', error);
    throw error;
  }
};