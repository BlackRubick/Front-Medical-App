import { FORM_VALIDATION, ERROR_MESSAGES } from '../../utils/constants';

export const FormValidation = {
  // Validaciones básicas
  required: (value, fieldName = 'Campo') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} es requerido`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null; // Solo validar si hay valor
    
    if (!FORM_VALIDATION.EMAIL_REGEX.test(value)) {
      return ERROR_MESSAGES.INVALID_EMAIL;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    
    if (value.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
      return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    
    if (!FORM_VALIDATION.PHONE_REGEX.test(value)) {
      return 'Ingresa un número de teléfono válido';
    }
    return null;
  },

  minLength: (value, minLength, fieldName = 'Campo') => {
    if (!value) return null;
    
    if (value.length < minLength) {
      return `${fieldName} debe tener al menos ${minLength} caracteres`;
    }
    return null;
  },

  maxLength: (value, maxLength, fieldName = 'Campo') => {
    if (!value) return null;
    
    if (value.length > maxLength) {
      return `${fieldName} no puede tener más de ${maxLength} caracteres`;
    }
    return null;
  },

  numeric: (value, fieldName = 'Campo') => {
    if (!value) return null;
    
    if (isNaN(value) || isNaN(parseFloat(value))) {
      return `${fieldName} debe ser un número válido`;
    }
    return null;
  },

  range: (value, min, max, fieldName = 'Campo') => {
    if (!value) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return `${fieldName} debe ser un número válido`;
    }
    
    if (numValue < min || numValue > max) {
      return `${fieldName} debe estar entre ${min} y ${max}`;
    }
    return null;
  },

  date: (value, fieldName = 'Fecha') => {
    if (!value) return null;
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName} no es válida`;
    }
    return null;
  },

  pastDate: (value, fieldName = 'Fecha') => {
    if (!value) return null;
    
    const date = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Final del día
    
    if (date > today) {
      return `${fieldName} no puede ser en el futuro`;
    }
    return null;
  },

  futureDate: (value, fieldName = 'Fecha') => {
    if (!value) return null;
    
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día
    
    if (date < today) {
      return `${fieldName} no puede ser en el pasado`;
    }
    return null;
  },

  matchPassword: (password, confirmPassword) => {
    if (!password || !confirmPassword) return null;
    
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  },

  // Validaciones específicas para el dominio médico
  heartRate: (value) => {
    const error = FormValidation.numeric(value, 'Frecuencia cardíaca');
    if (error) return error;
    
    return FormValidation.range(value, 30, 220, 'Frecuencia cardíaca');
  },

  bloodPressure: (systolic, diastolic) => {
    const systolicError = FormValidation.numeric(systolic, 'Presión sistólica');
    if (systolicError) return systolicError;
    
    const diastolicError = FormValidation.numeric(diastolic, 'Presión diastólica');
    if (diastolicError) return diastolicError;
    
    const systolicRangeError = FormValidation.range(systolic, 60, 250, 'Presión sistólica');
    if (systolicRangeError) return systolicRangeError;
    
    const diastolicRangeError = FormValidation.range(diastolic, 40, 150, 'Presión diastólica');
    if (diastolicRangeError) return diastolicRangeError;
    
    if (parseFloat(systolic) <= parseFloat(diastolic)) {
      return 'La presión sistólica debe ser mayor que la diastólica';
    }
    
    return null;
  },

  temperature: (value) => {
    const error = FormValidation.numeric(value, 'Temperatura');
    if (error) return error;
    
    return FormValidation.range(value, 32, 45, 'Temperatura');
  },

  oxygenSaturation: (value) => {
    const error = FormValidation.numeric(value, 'Saturación de oxígeno');
    if (error) return error;
    
    return FormValidation.range(value, 0, 100, 'Saturación de oxígeno');
  },

  glucose: (value) => {
    const error = FormValidation.numeric(value, 'Glucosa');
    if (error) return error;
    
    return FormValidation.range(value, 20, 600, 'Glucosa');
  },

  // Validador de formularios completos
  validateForm: (formData, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(fieldName => {
      const fieldRules = rules[fieldName];
      const fieldValue = formData[fieldName];
      
      for (const rule of fieldRules) {
        let error = null;
        
        if (typeof rule === 'function') {
          error = rule(fieldValue);
        } else if (typeof rule === 'object') {
          const { validator, params = [], message } = rule;
          error = validator(fieldValue, ...params);
          
          if (error && message) {
            error = message;
          }
        }
        
        if (error) {
          errors[fieldName] = error;
          break; // Solo mostrar el primer error por campo
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Esquemas de validación predefinidos
  schemas: {
    login: {
      email: [
        FormValidation.required,
        FormValidation.email,
      ],
      password: [
        FormValidation.required,
      ],
    },

    register: {
      firstName: [
        FormValidation.required,
        (value) => FormValidation.minLength(value, FORM_VALIDATION.NAME_MIN_LENGTH, 'Nombre'),
      ],
      lastName: [
        FormValidation.required,
        (value) => FormValidation.minLength(value, FORM_VALIDATION.NAME_MIN_LENGTH, 'Apellido'),
      ],
      email: [
        FormValidation.required,
        FormValidation.email,
      ],
      phone: [
        FormValidation.required,
        FormValidation.phone,
      ],
      password: [
        FormValidation.required,
        FormValidation.password,
      ],
      confirmPassword: [
        FormValidation.required,
      ],
    },

    patient: {
      firstName: [
        FormValidation.required,
        (value) => FormValidation.minLength(value, 2, 'Nombre'),
      ],
      lastName: [
        FormValidation.required,
        (value) => FormValidation.minLength(value, 2, 'Apellido'),
      ],
      email: [
        FormValidation.required,
        FormValidation.email,
      ],
      phone: [
        FormValidation.required,
        FormValidation.phone,
      ],
      dateOfBirth: [
        FormValidation.required,
        FormValidation.date,
        FormValidation.pastDate,
      ],
    },

    sensorReading: {
      sensorType: [
        FormValidation.required,
      ],
      value: [
        FormValidation.required,
        FormValidation.numeric,
      ],
    },
  },
};

// Funciones de ayuda para validación en tiempo real
export const validateField = (fieldName, value, schema) => {
  const rules = schema[fieldName];
  if (!rules) return null;
  
  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : rule.validator(value);
    if (error) return error;
  }
  
  return null;
};

export const validateFormData = (formData, schemaName) => {
  const schema = FormValidation.schemas[schemaName];
  if (!schema) {
    console.error(`Schema '${schemaName}' not found`);
    return { isValid: false, errors: {} };
  }
  
  return FormValidation.validateForm(formData, schema);
};