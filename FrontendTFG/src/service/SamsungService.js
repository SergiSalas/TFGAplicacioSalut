import { NativeModules, Platform } from 'react-native';

const { SamsungHealth } = NativeModules;

export const initSamsungHealth = async () => {
  if (Platform.OS !== 'android') {
    throw new Error('Samsung Health is only available on Android');
  }
  return await SamsungHealth.initialize();
};

export const requestSamsungPermissions = async () => {
  if (Platform.OS !== 'android') {
    throw new Error('Samsung Health is only available on Android');
  }
  return await SamsungHealth.requestPermissions();
};

export const getStepCount = async (startDate, endDate) => {
  if (Platform.OS !== 'android') {
    throw new Error('Samsung Health is only available on Android');
  }
  return await SamsungHealth.getStepCount(startDate.getTime(), endDate.getTime());
};

export const getHeartRate = async (startDate, endDate) => {
  if (Platform.OS !== 'android') {
    throw new Error('Samsung Health is only available on Android');
  }
  return await SamsungHealth.getHeartRate(startDate.getTime(), endDate.getTime());
};