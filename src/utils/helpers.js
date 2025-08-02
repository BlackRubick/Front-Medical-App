import { SENSOR_TYPES, NORMAL_RANGES } from './constants';

export const Helpers = {
  // Formatear números
  formatNumber: (number, decimals = 1) => {
    return Number(number).toFixed(decimals);
  },

  // Generar ID único
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Validar email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar teléfono
  isValidPhone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  },

  // Capitalizar primera letra
  capitalize: (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  },

  // Truncar texto
  truncateText: (text, maxLength = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },

  // Determinar si un valor de sensor está en rango normal
  isInNormalRange: (sensorType, value, additionalData = {}) => {
    const ranges = NORMAL_RANGES[sensorType];
    
    if (!ranges) return null;
    
    switch (sensorType) {
      case SENSOR_TYPES.HEART_RATE:
      case SENSOR_TYPES.TEMPERATURE:
      case SENSOR_TYPES.OXYGEN_SATURATION:
      case SENSOR_TYPES.GLUCOSE:
        return value >= ranges.min && value <= ranges.max;
      
      case SENSOR_TYPES.BLOOD_PRESSURE:
        const { systolic, diastolic } = additionalData;
        return (
          systolic >= ranges.systolic.min && 
          systolic <= ranges.systolic.max &&
          diastolic >= ranges.diastolic.min && 
          diastolic <= ranges.diastolic.max
        );
      
      default:
        return null;
    }
  },

  // Obtener estado del sensor (normal, alto, bajo)
  getSensorStatus: (sensorType, value, additionalData = {}) => {
    const isNormal = Helpers.isInNormalRange(sensorType, value, additionalData);
    
    if (isNormal === null) return 'unknown';
    if (isNormal) return 'normal';
    
    const ranges = NORMAL_RANGES[sensorType];
    
    switch (sensorType) {
      case SENSOR_TYPES.HEART_RATE:
      case SENSOR_TYPES.TEMPERATURE:
      case SENSOR_TYPES.OXYGEN_SATURATION:
      case SENSOR_TYPES.GLUCOSE:
        return value < ranges.min ? 'low' : 'high';
      
      case SENSOR_TYPES.BLOOD_PRESSURE:
        const { systolic, diastolic } = additionalData;
        if (systolic < ranges.systolic.min || diastolic < ranges.diastolic.min) {
          return 'low';
        }
        return 'high';
      
      default:
        return 'unknown';
    }
  },

  // Obtener color según el estado del sensor
  getStatusColor: (status) => {
    switch (status) {
      case 'normal':
        return '#4CAF50'; // Verde
      case 'high':
        return '#F44336'; // Rojo
      case 'low':
        return '#FF9800'; // Naranja
      default:
        return '#757575'; // Gris
    }
  },

  // Formatear valores de sensores
  formatSensorValue: (sensorType, value, additionalData = {}) => {
    switch (sensorType) {
      case SENSOR_TYPES.HEART_RATE:
        return `${Math.round(value)} bpm`;
      
      case SENSOR_TYPES.BLOOD_PRESSURE:
        const { systolic, diastolic } = additionalData;
        return `${Math.round(systolic)}/${Math.round(diastolic)} mmHg`;
      
      case SENSOR_TYPES.TEMPERATURE:
        return `${Helpers.formatNumber(value, 1)}°C`;
      
      case SENSOR_TYPES.OXYGEN_SATURATION:
        return `${Math.round(value)}%`;
      
      case SENSOR_TYPES.GLUCOSE:
        return `${Math.round(value)} mg/dL`;
      
      default:
        return value.toString();
    }
  },

  // Generar datos de ejemplo para desarrollo
  generateSampleSensorData: (sensorType, days = 7) => {
    const data = [];
    const baseValues = {
      [SENSOR_TYPES.HEART_RATE]: 75,
      [SENSOR_TYPES.TEMPERATURE]: 36.5,
      [SENSOR_TYPES.OXYGEN_SATURATION]: 98,
      [SENSOR_TYPES.GLUCOSE]: 100,
    };

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseValue = baseValues[sensorType] || 50;
      const variation = (Math.random() - 0.5) * 0.2 * baseValue;
      const value = baseValue + variation;
      
      data.push({
        id: Helpers.generateId(),
        date: date.toISOString(),
        value: Math.max(0, value),
        sensorType,
      });
    }
    
    return data;
  },

  // Calcular promedio de un array de valores
  calculateAverage: (values) => {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  },

  // Encontrar valor máximo y mínimo
  findMinMax: (values) => {
    if (!values || values.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  },

  // Debounce function para búsquedas
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};