import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
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
      await createActivity(token, newActivity);
      navigation.goBack();
    } catch (error) {
      console.error('Error creando la actividad', error);
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