import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../contexts/AuthContext';
import { createActivity, getActivityTypes } from '../service/ActivityService';

const CreateActivityScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      getActivityTypes(token)
        .then(data => {
          setTypes(data);
          if(data.length > 0) setSelectedType(data[0].name);
        })
        .catch(error => console.error('Error fetching types:', error));
    }
  }, [token]);

  const onSubmit = async () => {
    try {
      const newActivity = {
        duration: parseFloat(duration),
        date,
        type: selectedType,
        description,
      };
      
      // Mostrar indicador de carga
      setIsSubmitting(true);
      
      await createActivity(token, newActivity);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Actividad creada',
        'La actividad se ha guardado correctamente',
        [{ 
          text: 'OK', 
          onPress: () => {
            // Navegar de vuelta con un parámetro para actualizar calorías
            navigation.navigate('ActivityScreen', { 
              activityCreated: true,
              timestamp: Date.now() // Para asegurar que el parámetro siempre cambia
            });
          } 
        }]
      );
    } catch (error) {
      console.error('Error creando la actividad', error);
      Alert.alert('Error', 'No se pudo crear la actividad. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Duración (minutos):</Text>
      <TextInput 
        value={duration} 
        onChangeText={setDuration} 
        keyboardType="numeric" 
        placeholder="Ej. 30" 
      />

      <Text>Fecha:</Text>
      <Button title={date.toDateString()} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text>Tipo de actividad:</Text>
      <Picker
        selectedValue={selectedType}
        onValueChange={(itemValue) => setSelectedType(itemValue)}>
        {types.map(type => (
          <Picker.Item 
            key={type.name} 
            label={type.displayName || type.name} 
            value={type.name}
          />
        ))}
      </Picker>

      <Text>Descripción:</Text>
      <TextInput 
        value={description} 
        onChangeText={setDescription} 
        placeholder="Descripción de la actividad" 
        multiline 
      />

      <Button title="Crear Actividad" onPress={onSubmit} />
    </View>
  );
};

export default CreateActivityScreen;