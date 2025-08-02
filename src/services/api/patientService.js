import { apiMethods, mockApiClient } from './apiClient';

// Cambiar a true para usar mock API (desarrollo sin backend)
const USE_MOCK_API = true;

// Datos de ejemplo para desarrollo
const MOCK_PATIENTS = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+52 123 456 7890',
    dateOfBirth: '1985-03-15',
    lastVisit: '2024-01-15T10:30:00Z',
    status: 'active',
    condition: 'Diabetes Tipo 2',
    address: 'Calle 123, Ciudad, Estado',
    emergencyContact: {
      name: 'María Pérez',
      phone: '+52 123 456 7891',
      relationship: 'Esposa',
    },
    medicalHistory: [
      {
        date: '2024-01-15',
        diagnosis: 'Control de diabetes',
        treatment: 'Ajuste de medicación',
      },
    ],
  },
  {
    id: '2',
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+52 098 765 4321',
    dateOfBirth: '1990-07-22',
    lastVisit: '2024-01-20T14:15:00Z',
    status: 'active',
    condition: 'Hipertensión',
    address: 'Avenida 456, Ciudad, Estado',
    emergencyContact: {
      name: 'Carlos González',
      phone: '+52 098 765 4322',
      relationship: 'Esposo',
    },
    medicalHistory: [
      {
        date: '2024-01-20',
        diagnosis: 'Control de presión arterial',
        treatment: 'Medicación antihipertensiva',
      },
    ],
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+52 555 123 4567',
    dateOfBirth: '1978-11-08',
    lastVisit: '2024-01-18T09:45:00Z',
    status: 'inactive',
    condition: 'Cardiopatía',
    address: 'Boulevard 789, Ciudad, Estado',
    emergencyContact: {
      name: 'Ana Rodríguez',
      phone: '+52 555 123 4568',
      relationship: 'Hija',
    },
    medicalHistory: [
      {
        date: '2024-01-18',
        diagnosis: 'Evaluación cardiológica',
        treatment: 'Medicación cardiovascular',
      },
    ],
  },
];

export const patientService = {
  // Obtener todos los pacientes
  getPatients: async () => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1000);
      return mockApiClient.mockSuccess(MOCK_PATIENTS);
    }
    
    try {
      const response = await apiMethods.get('/patients');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener paciente por ID
  getPatientById: async (patientId) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(800);
      const patient = MOCK_PATIENTS.find(p => p.id === patientId);
      if (patient) {
        return mockApiClient.mockSuccess(patient);
      } else {
        throw new Error('Paciente no encontrado');
      }
    }
    
    try {
      const response = await apiMethods.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear nuevo paciente
  createPatient: async (patientData) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1500);
      
      // Simular validación de email existente
      const existingPatient = MOCK_PATIENTS.find(p => p.email === patientData.email);
      if (existingPatient) {
        throw new Error('Ya existe un paciente con este email');
      }
      
      const newPatient = {
        id: Date.now().toString(),
        ...patientData,
        status: 'active',
        lastVisit: null,
        medicalHistory: [],
        createdAt: new Date().toISOString(),
      };
      
      MOCK_PATIENTS.push(newPatient);
      return mockApiClient.mockSuccess(newPatient);
    }
    
    try {
      const response = await apiMethods.post('/patients', patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar paciente
  updatePatient: async (patientId, patientData) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1200);
      
      const patientIndex = MOCK_PATIENTS.findIndex(p => p.id === patientId);
      if (patientIndex === -1) {
        throw new Error('Paciente no encontrado');
      }
      
      const updatedPatient = {
        ...MOCK_PATIENTS[patientIndex],
        ...patientData,
        updatedAt: new Date().toISOString(),
      };
      
      MOCK_PATIENTS[patientIndex] = updatedPatient;
      return mockApiClient.mockSuccess(updatedPatient);
    }
    
    try {
      const response = await apiMethods.put(`/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar paciente
  deletePatient: async (patientId) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1000);
      
      const patientIndex = MOCK_PATIENTS.findIndex(p => p.id === patientId);
      if (patientIndex === -1) {
        throw new Error('Paciente no encontrado');
      }
      
      MOCK_PATIENTS.splice(patientIndex, 1);
      return mockApiClient.mockSuccess({ message: 'Paciente eliminado correctamente' });
    }
    
    try {
      const response = await apiMethods.delete(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar pacientes
  searchPatients: async (query) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(600);
      
      const filteredPatients = MOCK_PATIENTS.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const email = patient.email.toLowerCase();
        const condition = patient.condition.toLowerCase();
        const searchQuery = query.toLowerCase();
        
        return fullName.includes(searchQuery) || 
               email.includes(searchQuery) || 
               condition.includes(searchQuery);
      });
      
      return mockApiClient.mockSuccess(filteredPatients);
    }
    
    try {
      const response = await apiMethods.get(`/patients/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Agregar entrada al historial médico
  addMedicalHistoryEntry: async (patientId, entry) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1000);
      
      const patient = MOCK_PATIENTS.find(p => p.id === patientId);
      if (!patient) {
        throw new Error('Paciente no encontrado');
      }
      
      const newEntry = {
        id: Date.now().toString(),
        ...entry,
        date: entry.date || new Date().toISOString(),
      };
      
      patient.medicalHistory.push(newEntry);
      patient.lastVisit = newEntry.date;
      
      return mockApiClient.mockSuccess(newEntry);
    }
    
    try {
      const response = await apiMethods.post(`/patients/${patientId}/medical-history`, entry);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener historial médico de un paciente
  getMedicalHistory: async (patientId) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(800);
      
      const patient = MOCK_PATIENTS.find(p => p.id === patientId);
      if (!patient) {
        throw new Error('Paciente no encontrado');
      }
      
      return mockApiClient.mockSuccess(patient.medicalHistory || []);
    }
    
    try {
      const response = await apiMethods.get(`/patients/${patientId}/medical-history`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas de pacientes
  getPatientStats: async () => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(500);
      
      const stats = {
        total: MOCK_PATIENTS.length,
        active: MOCK_PATIENTS.filter(p => p.status === 'active').length,
        inactive: MOCK_PATIENTS.filter(p => p.status === 'inactive').length,
        recentVisits: MOCK_PATIENTS.filter(p => {
          if (!p.lastVisit) return false;
          const lastVisit = new Date(p.lastVisit);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastVisit > weekAgo;
        }).length,
      };
      
      return mockApiClient.mockSuccess(stats);
    }
    
    try {
      const response = await apiMethods.get('/patients/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};