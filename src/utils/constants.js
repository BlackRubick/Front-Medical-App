// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://your-api-url.com/api',
  TIMEOUT: 10000,
};

// Almacenamiento local
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  PATIENTS_CACHE: 'patients_cache',
  SENSORS_CACHE: 'sensors_cache',
};

// Tipos de sensores
export const SENSOR_TYPES = {
  HEART_RATE: 'heart_rate',
  BLOOD_PRESSURE: 'blood_pressure',
  TEMPERATURE: 'temperature',
  OXYGEN_SATURATION: 'oxygen_saturation',
  GLUCOSE: 'glucose',
};

// Unidades de medida
export const UNITS = {
  [SENSOR_TYPES.HEART_RATE]: 'bpm',
  [SENSOR_TYPES.BLOOD_PRESSURE]: 'mmHg',
  [SENSOR_TYPES.TEMPERATURE]: '°C',
  [SENSOR_TYPES.OXYGEN_SATURATION]: '%',
  [SENSOR_TYPES.GLUCOSE]: 'mg/dL',
};

// Rangos normales
export const NORMAL_RANGES = {
  [SENSOR_TYPES.HEART_RATE]: { min: 60, max: 100 },
  [SENSOR_TYPES.BLOOD_PRESSURE]: { 
    systolic: { min: 90, max: 120 },
    diastolic: { min: 60, max: 80 }
  },
  [SENSOR_TYPES.TEMPERATURE]: { min: 36.1, max: 37.2 },
  [SENSOR_TYPES.OXYGEN_SATURATION]: { min: 95, max: 100 },
  [SENSOR_TYPES.GLUCOSE]: { min: 70, max: 140 },
};

// Configuración de navegación
export const SCREEN_NAMES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Main Tabs
  PATIENTS: 'Patients',
  SENSORS: 'Sensors',
  PROFILE: 'Profile',
  
  // Patient Screens
  PATIENT_DETAIL: 'PatientDetail',
  ADD_PATIENT: 'AddPatient',
  
  // Sensor Screens
  SENSOR_DETAIL: 'SensorDetail',
  CHARTS: 'Charts',
};

// Configuración de formularios
export const FORM_VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
};

// Mensajes de error
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  AUTHENTICATION_ERROR: 'Credenciales inválidas.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  GENERIC_ERROR: 'Ha ocurrido un error. Intenta nuevamente.',
  REQUIRED_FIELD: 'Este campo es requerido.',
  INVALID_EMAIL: 'Ingresa un email válido.',
  PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} caracteres.`,
};

// Configuración de gráficos
export const CHART_CONFIG = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#2196F3',
  },
};