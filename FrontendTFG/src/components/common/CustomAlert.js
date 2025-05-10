import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomAlert = ({ visible, title, message, onCancel, onConfirm, confirmText, cancelText, type }) => {
  // Asegurar que onCancel y onConfirm siempre sean funciones
  const handleCancel = onCancel || (() => {});
  const handleConfirm = onConfirm || (() => {});

  // Determinar si solo hay un botón
  const hasSingleButton = !cancelText;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.iconContainer}>
            {type === 'warning' && <Icon name="warning-outline" size={40} color="#f59c42" />}
            {type === 'error' && <Icon name="close-circle-outline" size={40} color="#e74c3c" />}
            {type === 'success' && <Icon name="checkmark-circle-outline" size={40} color="#2ecc71" />}
          </View>
          
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          
          <View style={[
            styles.buttonContainer, 
            hasSingleButton && styles.singleButtonContainer
          ]}>
            {cancelText && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            {confirmText && (
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.confirmButton,
                  type === 'error' ? styles.deleteButton : null,
                  hasSingleButton && styles.singleButton
                ]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#1e1e2e',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  singleButtonContainer: {
    justifyContent: 'center',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  singleButton: {
    minWidth: '60%',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#555555',
  },
  confirmButton: {
    backgroundColor: '#4c6ef5',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomAlert;