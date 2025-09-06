import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'goji_device_id';

export const getDeviceId = async (): Promise<string> => {
  try {
    // Try to get existing device ID
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate a new device ID if none exists
      deviceId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `device_${Platform.OS}_${Date.now()}_${Math.random()}`,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      // Store it for future use
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback to a simple device ID
    return `device_${Platform.OS}_${Date.now()}`;
  }
};

export const getDeviceInfo = async () => {
  const deviceId = await getDeviceId();
  
  return {
    platform: Platform.OS,
    deviceId: deviceId,
    deviceName: `${Platform.OS} Device`,
  };
};
