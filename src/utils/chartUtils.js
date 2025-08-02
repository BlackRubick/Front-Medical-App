import { Colors } from '../styles/colors';
import { SENSOR_TYPES } from './constants';
import { DateUtils } from './dateUtils';

export const ChartUtils = {
  // Configuración base para gráficos
  getBaseChartConfig: () => ({
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  }),

  // Obtener color específico para cada tipo de sensor
  getSensorColor: (sensorType) => {
    switch (sensorType) {
      case SENSOR_TYPES.HEART_RATE:
        return Colors.medical.heartRate;
      case SENSOR_TYPES.BLOOD_PRESSURE:
        return Colors.medical.bloodPressure;
      case SENSOR_TYPES.TEMPERATURE:
        return Colors.medical.temperature;
      case SENSOR_TYPES.OXYGEN_SATURATION:
        return Colors.medical.oxygen;
      case SENSOR_TYPES.GLUCOSE:
        return Colors.medical.glucose;
      default:
        return Colors.primary;
    }
  },

  // Configuración específica para cada tipo de sensor
  getSensorChartConfig: (sensorType) => {
    const baseConfig = ChartUtils.getBaseChartConfig();
    const sensorColor = ChartUtils.getSensorColor(sensorType);
    
    return {
      ...baseConfig,
      color: (opacity = 1) => sensorColor.replace('rgb', 'rgba').replace(')', `, ${opacity})`),
      propsForDots: {
        ...baseConfig.propsForDots,
        stroke: sensorColor,
      },
    };
  },

  // Procesar datos para gráfico de líneas
  processLineChartData: (rawData, sensorType) => {
    if (!rawData || rawData.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          color: () => ChartUtils.getSensorColor(sensorType),
        }],
      };
    }

    const sortedData = rawData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      labels: sortedData.map(item => DateUtils.formatDate(item.date, 'DD/MM')),
      datasets: [{
        data: sortedData.map(item => parseFloat(item.value)),
        color: () => ChartUtils.getSensorColor(sensorType),
        strokeWidth: 2,
      }],
    };
  },

  // Procesar datos para gráfico de barras
  processBarChartData: (rawData, sensorType) => {
    if (!rawData || rawData.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
        }],
      };
    }

    const sortedData = rawData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      labels: sortedData.map(item => DateUtils.formatDate(item.date, 'DD/MM')),
      datasets: [{
        data: sortedData.map(item => parseFloat(item.value)),
      }],
    };
  },

  // Agrupar datos por período (día, semana, mes)
  groupDataByPeriod: (data, period = 'day') => {
    if (!data || data.length === 0) return [];

    const grouped = {};
    
    data.forEach(item => {
      let key;
      const date = new Date(item.date);
      
      switch (period) {
        case 'hour':
          key = DateUtils.formatDateTime(date, 'YYYY-MM-DD HH:00');
          break;
        case 'day':
          key = DateUtils.formatDate(date, 'YYYY-MM-DD');
          break;
        case 'week':
          key = DateUtils.formatDate(date, 'YYYY-[W]WW');
          break;
        case 'month':
          key = DateUtils.formatDate(date, 'YYYY-MM');
          break;
        default:
          key = DateUtils.formatDate(date, 'YYYY-MM-DD');
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return Object.keys(grouped).map(key => ({
      period: key,
      data: grouped[key],
      average: grouped[key].reduce((sum, item) => sum + parseFloat(item.value), 0) / grouped[key].length,
      count: grouped[key].length,
    }));
  },

  // Obtener estadísticas de un dataset
  getDatasetStats: (data) => {
    if (!data || data.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        count: 0,
      };
    }

    const values = data.map(item => parseFloat(item.value));
    const sum = values.reduce((acc, val) => acc + val, 0);
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      average: sum / values.length,
      count: values.length,
    };
  },

  // Generar gradiente para gráficos
  generateGradient: (startColor, endColor) => ({
    backgroundGradientFrom: startColor,
    backgroundGradientTo: endColor,
    backgroundGradientFromOpacity: 0.8,
    backgroundGradientToOpacity: 0.2,
  }),

  // Configuración para gráfico multi-línea
  getMultiLineChartData: (datasets) => {
    if (!datasets || datasets.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Asumir que todos los datasets tienen las mismas fechas
    const firstDataset = datasets[0];
    const labels = firstDataset.data.map(item => 
      DateUtils.formatDate(item.date, 'DD/MM')
    );

    const chartDatasets = datasets.map((dataset, index) => ({
      data: dataset.data.map(item => parseFloat(item.value)),
      color: () => ChartUtils.getSensorColor(dataset.sensorType),
      strokeWidth: 2,
    }));

    return {
      labels,
      datasets: chartDatasets,
    };
  },

  // Obtener configuración de tooltips
  getTooltipConfig: (sensorType) => ({
    enabled: true,
    displayColors: true,
    backgroundColor: Colors.surface,
    titleColor: Colors.textPrimary,
    bodyColor: Colors.textSecondary,
    borderColor: ChartUtils.getSensorColor(sensorType),
    borderWidth: 1,
  }),
};