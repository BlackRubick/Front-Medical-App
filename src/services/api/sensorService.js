import { apiMethods, mockApiClient } from './apiClient';
import { SENSOR_TYPES } from '../../utils/constants';
import { Helpers } from '../../utils/helpers';

// Cambiar a true para usar mock API (desarrollo sin backend)
const USE_MOCK_API = true;

// Generar datos realistas basados en tu Arduino
const generateArduinoHeartRateData = (patientId, days = 7) => {
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    // Generar varias lecturas por día (cada 5 segundos como tu Arduino)
    const readingsPerDay = 20; // Muestras representativas por día
    
    for (let j = 0; j < readingsPerDay; j++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(8 + Math.floor(j * 12 / readingsPerDay)); // Distribuir durante el día
      date.setMinutes(Math.floor(Math.random() * 60));
      date.setSeconds(Math.floor(Math.random() * 60));
      
      // Simular valores realistas como los de tu Arduino
      const bpm1 = 70 + Math.floor(Math.random() * 40); // 70-110 BPM
      const bpm2 = 65 + Math.floor(Math.random() * 45); // 65-110 BPM
      const bpmPromedio = Math.round((bpm1 + bpm2) / 2);
      
      // Determinar estado basado en tu lógica de Arduino
      let status = 'normal';
      if (bpmPromedio > 115) {
        status = 'high';
      } else if (bpmPromedio > 0 && bpmPromedio < 60) {
        status = 'low';
      } else if (bpmPromedio >= 75 && bpmPromedio <= 100) {
        status = 'normal';
      }
      
      const entry = {
        id: `${patientId}_${date.getTime()}_${j}`,
        patientId,
        sensorType: SENSOR_TYPES.HEART_RATE,
        value: bpmPromedio,
        timestamp: date.toISOString(),
        status,
        deviceId: `arduino_hr_${patientId}`,
        // Datos específicos de tu Arduino
        arduinoData: {
          bpm1: bpm1,
          bpm2: bpm2,
          bpmPromedio: bpmPromedio,
          sensor1Reading: 400 + Math.floor(Math.random() * 300), // Simular lectura analógica
          sensor2Reading: 400 + Math.floor(Math.random() * 300),
          ledStatus: status === 'normal' ? 'blue' : 'red',
          rawData: `BPM1: ${bpm1} | BPM2: ${bpm2} | Promedio: ${bpmPromedio}`,
        },
      };
      
      data.push(entry);
    }
  }
  
  return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Datos mock específicos para tu Arduino
const MOCK_ARDUINO_SENSOR_DATA = {
  '1': {
    [SENSOR_TYPES.HEART_RATE]: generateArduinoHeartRateData('1'),
  },
  '2': {
    [SENSOR_TYPES.HEART_RATE]: generateArduinoHeartRateData('2'),
  },
  '3': {
    [SENSOR_TYPES.HEART_RATE]: generateArduinoHeartRateData('3'),
  },
};

export const sensorService = {
  // Obtener datos de sensores por paciente
  getSensorDataByPatient: async (patientId, sensorType = null, limit = 100) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(800);
      
      const patientData = MOCK_ARDUINO_SENSOR_DATA[patientId] || {};
      
      if (sensorType) {
        const data = patientData[sensorType] || [];
        return mockApiClient.mockSuccess(data.slice(0, limit));
      }
      
      // Retornar todos los tipos de sensores para el paciente
      const allData = [];
      Object.keys(patientData).forEach(type => {
        allData.push(...patientData[type].slice(0, limit));
      });
      
      // Ordenar por timestamp descendente
      allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return mockApiClient.mockSuccess(allData.slice(0, limit));
    }
    
    try {
      const params = new URLSearchParams();
      if (sensorType) params.append('type', sensorType);
      if (limit) params.append('limit', limit.toString());
      
      const response = await apiMethods.get(`/sensors/patient/${patientId}?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener últimas lecturas de todos los sensores de un paciente
  getLatestReadings: async (patientId) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(500);
      
      const patientData = MOCK_ARDUINO_SENSOR_DATA[patientId] || {};
      const latestReadings = {};
      
      Object.keys(patientData).forEach(sensorType => {
        const data = patientData[sensorType];
        if (data.length > 0) {
          latestReadings[sensorType] = data[0]; // El más reciente
        }
      });
      
      return mockApiClient.mockSuccess(latestReadings);
    }
    
    try {
      const response = await apiMethods.get(`/sensors/patient/${patientId}/latest`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Agregar nueva lectura de sensor (desde Arduino)
  addArduinoReading: async (patientId, arduinoData) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(300);
      
      // Parsear datos del Arduino (formato: "BPM1: 75 | BPM2: 80 | Promedio: 77")
      const { bpm1, bpm2, bpmPromedio } = arduinoData;
      
      // Determinar estado basado en tu lógica
      let status = 'normal';
      if (bpmPromedio > 115) {
        status = 'high';
      } else if (bpmPromedio > 0 && bpmPromedio < 60) {
        status = 'low';
      } else if (bpmPromedio >= 75 && bpmPromedio <= 100) {
        status = 'normal';
      }
      
      const newReading = {
        id: `${patientId}_${Date.now()}`,
        patientId,
        sensorType: SENSOR_TYPES.HEART_RATE,
        value: bpmPromedio,
        timestamp: new Date().toISOString(),
        status,
        deviceId: `arduino_hr_${patientId}`,
        arduinoData: {
          bmp1,
          bpm2,
          bpmPromedio,
          ledStatus: status === 'normal' ? 'blue' : 'red',
          rawData: `BPM1: ${bpm1} | BPM2: ${bpm2} | Promedio: ${bpmPromedio}`,
        },
      };
      
      // Agregar a los datos mock
      if (!MOCK_ARDUINO_SENSOR_DATA[patientId]) {
        MOCK_ARDUINO_SENSOR_DATA[patientId] = {};
      }
      if (!MOCK_ARDUINO_SENSOR_DATA[patientId][SENSOR_TYPES.HEART_RATE]) {
        MOCK_ARDUINO_SENSOR_DATA[patientId][SENSOR_TYPES.HEART_RATE] = [];
      }
      
      MOCK_ARDUINO_SENSOR_DATA[patientId][SENSOR_TYPES.HEART_RATE].unshift(newReading);
      
      return mockApiClient.mockSuccess(newReading);
    }
    
    try {
      const response = await apiMethods.post(`/sensors/patient/${patientId}/arduino`, arduinoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Parsear datos del Arduino desde Bluetooth
  parseArduinoData: (rawData) => {
    try {
      // Parsear formato: "BPM1: 75 | BPM2: 80 | Promedio: 77"
      const bpm1Match = rawData.match(/BPM1:\s*(\d+)/);
      const bpm2Match = rawData.match(/BPM2:\s*(\d+)/);
      const promedioMatch = rawData.match(/Promedio:\s*(\d+)/);
      
      if (bmp1Match && bpm2Match && promedioMatch) {
        return {
          bmp1: parseInt(bpm1Match[1]),
          bpm2: parseInt(bpm2Match[1]),
          bpmPromedio: parseInt(promedioMatch[1]),
          timestamp: new Date().toISOString(),
          rawData: rawData.trim(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing Arduino data:', error);
      return null;
    }
  },

  // Obtener estadísticas de frecuencia cardíaca
  getHeartRateStats: async (patientId, period = '7d') => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(600);
      
      const patientData = MOCK_ARDUINO_SENSOR_DATA[patientId] || {};
      const heartRateData = patientData[SENSOR_TYPES.HEART_RATE] || [];
      
      if (heartRateData.length === 0) {
        return mockApiClient.mockSuccess({
          average: 0,
          min: 0,
          max: 0,
          count: 0,
          normalReadings: 0,
          highReadings: 0,
          lowReadings: 0,
        });
      }
      
      // Filtrar por período
      const days = parseInt(period.replace('d', ''));
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const periodData = heartRateData.filter(reading => 
        new Date(reading.timestamp) >= cutoffDate
      );
      
      const values = periodData.map(r => r.value);
      const normalReadings = periodData.filter(r => r.status === 'normal').length;
      const highReadings = periodData.filter(r => r.status === 'high').length;
      const lowReadings = periodData.filter(r => r.status === 'low').length;
      
      const stats = {
        average: Helpers.calculateAverage(values),
        min: Math.min(...values),
        max: Math.max(...values),
        count: periodData.length,
        normalReadings,
        highReadings,
        lowReadings,
        period,
        // Estadísticas específicas del Arduino
        sensor1Average: Helpers.calculateAverage(
          periodData.map(r => r.arduinoData?.bpm1).filter(Boolean)
        ),
        sensor2Average: Helpers.calculateAverage(
          periodData.map(r => r.arduinoData?.bpm2).filter(Boolean)
        ),
      };
      
      return mockApiClient.mockSuccess(stats);
    }
    
    try {
      const response = await apiMethods.get(
        `/sensors/patient/${patientId}/heart-rate/stats?period=${period}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener datos para gráficos de tiempo real
  getRealtimeData: async (patientId, lastTimestamp = null) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(200);
      
      const patientData = MOCK_ARDUINO_SENSOR_DATA[patientId] || {};
      const heartRateData = patientData[SENSOR_TYPES.HEART_RATE] || [];
      
      let newData = heartRateData;
      
      if (lastTimestamp) {
        newData = heartRateData.filter(reading => 
          new Date(reading.timestamp) > new Date(lastTimestamp)
        );
      }
      
      return mockApiClient.mockSuccess(newData.slice(0, 10)); // Últimas 10 lecturas
    }
    
    try {
      const params = new URLSearchParams();
      if (lastTimestamp) params.append('since', lastTimestamp);
      
      const response = await apiMethods.get(
        `/sensors/patient/${patientId}/realtime?${params}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Simular conexión Bluetooth (para desarrollo)
  simulateBluetoothConnection: async (patientId) => {
    if (USE_MOCK_API) {
      // Simular datos llegando cada 5 segundos como tu Arduino
      return {
        connected: true,
        deviceName: `Arduino-HR-${patientId}`,
        interval: 5000, // 5 segundos
        sampleData: {
          bpm1: 75,
          bpm2: 80,
          bpmPromedio: 77,
          rawData: "BPM1: 75 | BPM2: 80 | Promedio: 77"
        }
      };
    }
    
    try {
      const response = await apiMethods.post(`/bluetooth/connect/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};