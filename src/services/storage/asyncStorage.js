import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../utils/constants';

export const storageService = {
  // Método helper para validar datos antes de guardar
  _validateData: (data, dataName = 'data') => {
    if (data === null || data === undefined) {
      throw new Error(`${dataName} cannot be null or undefined`);
    }
    return data;
  },

  // Métodos para token (almacenamiento seguro)
  saveToken: async (token) => {
    try {
      // Validar y limpiar token
      storageService._validateData(token, 'Token');
      const tokenString = typeof token === 'string' ? token : String(token);
      
      if (!tokenString.trim()) {
        throw new Error('Token cannot be empty');
      }
      
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, tokenString);
    } catch (error) {
      console.error('Error saving token to SecureStore:', error);
      // Fallback a AsyncStorage si SecureStore falla
      try {
        const tokenString = typeof token === 'string' ? token : String(token);
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokenString);
      } catch (fallbackError) {
        console.error('Error saving token to AsyncStorage:', fallbackError);
        throw fallbackError;
      }
    }
  },

  getToken: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      return token;
    } catch (error) {
      console.error('Error getting token from SecureStore:', error);
      // Fallback a AsyncStorage
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        return token;
      } catch (fallbackError) {
        console.error('Error getting token from AsyncStorage:', fallbackError);
        return null;
      }
    }
  },

  removeToken: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token from SecureStore:', error);
    }
    
    // También intentar remover de AsyncStorage por si acaso
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (fallbackError) {
      console.error('Error removing token from AsyncStorage:', fallbackError);
    }
  },

  // Métodos para datos de usuario
  saveUserData: async (userData) => {
    try {
      // Validar datos de usuario
      storageService._validateData(userData, 'User data');
      
      if (typeof userData !== 'object') {
        throw new Error('User data must be an object');
      }

      // Limpiar datos undefined/null del objeto
      const cleanUserData = {};
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
          cleanUserData[key] = userData[key];
        }
      });

      const jsonValue = JSON.stringify(cleanUserData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  getUserData: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (jsonValue !== null) {
        const userData = JSON.parse(jsonValue);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  removeUserData: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  },

  // Métodos para caché de pacientes
  savePatientsCache: async (patients) => {
    try {
      if (!patients) {
        console.warn('Patients data is null/undefined, skipping cache save');
        return;
      }

      const cacheData = {
        data: patients,
        timestamp: new Date().getTime(),
      };

      const jsonValue = JSON.stringify(cacheData);
      await AsyncStorage.setItem(STORAGE_KEYS.PATIENTS_CACHE, jsonValue);
    } catch (error) {
      console.error('Error saving patients cache:', error);
    }
  },

  getPatientsCache: async (maxAge = 5 * 60 * 1000) => { // 5 minutos por defecto
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PATIENTS_CACHE);
      if (jsonValue != null) {
        const { data, timestamp } = JSON.parse(jsonValue);
        const now = new Date().getTime();
        
        // Verificar si el caché no ha expirado
        if (now - timestamp < maxAge) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting patients cache:', error);
      return null;
    }
  },

  removePatientsCache: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PATIENTS_CACHE);
    } catch (error) {
      console.error('Error removing patients cache:', error);
    }
  },

  // Métodos para caché de sensores
  saveSensorsCache: async (sensors) => {
    try {
      if (!sensors) {
        console.warn('Sensors data is null/undefined, skipping cache save');
        return;
      }

      const cacheData = {
        data: sensors,
        timestamp: new Date().getTime(),
      };

      const jsonValue = JSON.stringify(cacheData);
      await AsyncStorage.setItem(STORAGE_KEYS.SENSORS_CACHE, jsonValue);
    } catch (error) {
      console.error('Error saving sensors cache:', error);
    }
  },

  getSensorsCache: async (maxAge = 2 * 60 * 1000) => { // 2 minutos para datos de sensores
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SENSORS_CACHE);
      if (jsonValue != null) {
        const { data, timestamp } = JSON.parse(jsonValue);
        const now = new Date().getTime();
        
        if (now - timestamp < maxAge) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting sensors cache:', error);
      return null;
    }
  },

  removeSensorsCache: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SENSORS_CACHE);
    } catch (error) {
      console.error('Error removing sensors cache:', error);
    }
  },

  // Método genérico para guardar cualquier dato
  saveData: async (key, data) => {
    try {
      storageService._validateData(data, `Data for key ${key}`);
      
      // Limpiar datos undefined/null si es un objeto
      let cleanData = data;
      if (typeof data === 'object' && data !== null) {
        cleanData = {};
        Object.keys(data).forEach(objKey => {
          if (data[objKey] !== undefined && data[objKey] !== null) {
            cleanData[objKey] = data[objKey];
          }
        });
      }

      const jsonValue = JSON.stringify(cleanData);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw error;
    }
  },

  getData: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  },

  removeData: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
    }
  },

  // Limpiar todo el almacenamiento
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      // Intentar limpiar SecureStore también
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      } catch (secureError) {
        console.log('SecureStore clear error (normal if no data):', secureError.message);
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Obtener información del almacenamiento
  getStorageInfo: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      
      let totalSize = 0;
      const items = values.map(([key, value]) => {
        const size = new Blob([value || '']).size;
        totalSize += size;
        return { key, size };
      });

      return {
        totalItems: keys.length,
        totalSize,
        items,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  },
};