import { apiMethods, mockApiClient } from './apiClient';

// Cambiar a true para usar mock API (desarrollo sin backend)
const USE_MOCK_API = true;

export const authService = {
  // Login
  login: async (email, password) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1500);
      
      if (email === 'admin@test.com' && password === '123456') {
        const response = {
          user: {
            id: '1',
            firstName: 'Admin',
            lastName: 'Test',
            email: 'admin@test.com',
            phone: '+52 123 456 7890',
            role: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'mock_jwt_token_12345',
        };
        return response;
      }
      
      throw new Error('Credenciales inválidas');
    }
    
    try {
      const response = await apiMethods.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registro
  register: async (userData) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(2000);
      
      // Simular validación de email existente
      if (userData.email === 'existing@test.com') {
        throw new Error('Este email ya está registrado');
      }
      
      const response = {
        user: {
          id: Date.now().toString(),
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock_jwt_token_new_user',
      };
      
      return response;
    }
    
    try {
      const response = await apiMethods.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar token
  verifyToken: async () => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(500);
      
      const response = {
        valid: true,
        user: {
          id: '1',
          firstName: 'Admin',
          lastName: 'Test',
          email: 'admin@test.com',
          phone: '+52 123 456 7890',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      
      return response;
    }
    
    try {
      const response = await apiMethods.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1500);
      
      const response = {
        user: {
          id: '1',
          firstName: userData.firstName || 'Admin',
          lastName: userData.lastName || 'Test',
          email: userData.email || 'admin@test.com',
          phone: userData.phone || '+52 123 456 7890',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      
      return response;
    }
    
    try {
      const response = await apiMethods.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1500);
      
      // Simular validación de contraseña actual
      if (currentPassword !== '123456') {
        throw new Error('La contraseña actual no es correcta');
      }
      
      const response = {
        message: 'Contraseña actualizada correctamente',
      };
      
      return response;
    }
    
    try {
      const response = await apiMethods.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Recuperar contraseña
  forgotPassword: async (email) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(2000);
      
      const response = {
        message: 'Se ha enviado un enlace de recuperación a tu email',
      };
      
      return response;
    }
    
    try {
      const response = await apiMethods.post('/auth/forgot-password', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Resetear contraseña
  resetPassword: async (token, newPassword) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1500);
      
      const response = {
        message: 'Contraseña restablecida correctamente',
      };
      
      return response;
    }
    
    try {
      const response = await apiMethods.post('/auth/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout (invalidar token en el servidor)
  logout: async () => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(500);
      
      const response = {
        message: 'Sesión cerrada correctamente',
      };
      
      return response;
    }
    
    try {
      const response = await apiMethods.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    if (USE_MOCK_API) {
      await mockApiClient.delay(1000);
      
      const response = {
        token: 'new_mock_jwt_token',
        refreshToken: 'new_mock_refresh_token',
      };
      
      return response;
    }
    
    try {
      const response = await apiMethods.post('/auth/refresh', {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};