import axios from 'axios';
import { API_CONFIG } from '../../utils/constants';
import { storageService } from '../storage/asyncStorage';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storageService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token for request:', error);
    }
    
    // Log de requests en desarrollo
    if (__DEV__) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar responses
apiClient.interceptors.response.use(
  (response) => {
    // Log de responses en desarrollo
    if (__DEV__) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log de errores en desarrollo
    if (__DEV__) {
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // Manejar error 401 (token expirado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Limpiar token expirado
        await storageService.removeToken();
        await storageService.removeUserData();
        
        // Aquí podrías intentar renovar el token si tienes refresh token
        // const newToken = await refreshToken();
        // if (newToken) {
        //   await storageService.saveToken(newToken);
        //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
        //   return apiClient(originalRequest);
        // }
        
        // Si no hay refresh token, redirigir al login
        // Esto se manejará en el AuthContext
        
      } catch (refreshError) {
        console.error('Error handling token refresh:', refreshError);
      }
    }
    
    // Manejar errores de red
    if (!error.response) {
      error.message = 'Error de conexión. Verifica tu internet.';
    }
    
    return Promise.reject(error);
  }
);

// Métodos HTTP helper
export const apiMethods = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

// Métodos para manejar archivos
export const fileUpload = {
  uploadFile: async (url, file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }
    
    return apiClient.post(url, formData, config);
  },
  
  downloadFile: async (url, config = {}) => {
    return apiClient.get(url, {
      ...config,
      responseType: 'blob',
    });
  },
};

// Métodos para modo offline (para desarrollo sin backend)
export const mockApiClient = {
  // Simular delay de red
  delay: (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Simular response exitoso
  mockSuccess: async (data, delay = 1000) => {
    await mockApiClient.delay(delay);
    return {
      data,
      status: 200,
      statusText: 'OK',
    };
  },
  
  // Simular error
  mockError: async (message = 'Error simulado', status = 400, delay = 1000) => {
    await mockApiClient.delay(delay);
    const error = new Error(message);
    error.response = {
      status,
      data: { message },
    };
    throw error;
  },
  
  // Simular login
  mockLogin: async (email, password) => {
    await mockApiClient.delay(1500);
    
    if (email === 'admin@test.com' && password === '123456') {
      return mockApiClient.mockSuccess({
        user: {
          id: '1',
          firstName: 'Admin',
          lastName: 'Test',
          email: 'admin@test.com',
          phone: '+52 123 456 7890',
          role: 'admin',
        },
        token: 'mock_jwt_token_12345',
      });
    }
    
    throw new Error('Credenciales inválidas');
  },
};

export default apiClient;