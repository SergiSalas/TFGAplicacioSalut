import { useHealthConnect } from '../hooks/useHealthConnect';

const AnyScreen = () => {
  const { isAvailable, isLoading, healthData, refreshHealthData } = useHealthConnect();
  
  return (
    <View>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {isAvailable ? (
            <View>
              <Text>Pasos de hoy: {healthData.steps}</Text>
              {healthData.heartRate && (
                <Text>Ritmo cardíaco: {healthData.heartRate} BPM</Text>
              )}
              <Button title="Actualizar" onPress={refreshHealthData} />
            </View>
          ) : (
            <Text>Health Connect no disponible</Text>
          )}
        </>
      )}
    </View>
  );
}; 