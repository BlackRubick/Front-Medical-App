import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authReducer, initialAuthState } from '../reducers/authReducer';
import { authService } from '../../services/api/authService';
import { storageService } from '../../services/storage/asyncStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Verificar si hay un usuario logueado al iniciar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = await storageService.getToken();
      const userData = await storageService.getUserData();
      
      if (token && userData) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData, token } });
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
      // Limpiar datos corruptos si los hay
      await storageService.removeToken();
      await storageService.removeUserData();
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.login(email, password);
      
      // Validar que tenemos los datos necesarios
      if (!response || !response.user || !response.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Limpiar cualquier dato undefined
      const cleanUser = {
        id: response.user.id || '',
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        email: response.user.email || '',
        phone: response.user.phone || '',
        role: response.user.role || 'user',
        createdAt: response.user.createdAt || new Date().toISOString(),
        updatedAt: response.user.updatedAt || new Date().toISOString(),
      };

      const cleanToken = response.token || '';
      
      // Guardar en almacenamiento
      await storageService.saveToken(cleanToken);
      await storageService.saveUserData(cleanUser);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: cleanUser, token: cleanToken } 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Error al iniciar sesión';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Limpiar datos de entrada
      const cleanUserData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        password: userData.password || '',
      };

      const response = await authService.register(cleanUserData);
      
      // Validar respuesta
      if (!response || !response.user || !response.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Limpiar datos de respuesta
      const cleanUser = {
        id: response.user.id || '',
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        email: response.user.email || '',
        phone: response.user.phone || '',
        role: response.user.role || 'user',
        createdAt: response.user.createdAt || new Date().toISOString(),
        updatedAt: response.user.updatedAt || new Date().toISOString(),
      };

      const cleanToken = response.token || '';
      
      await storageService.saveToken(cleanToken);
      await storageService.saveUserData(cleanUser);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: cleanUser, token: cleanToken } 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.message || 'Error al registrarse';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      // Intentar logout en el servidor (opcional)
      try {
        await authService.logout();
      } catch (serverError) {
        console.log('Server logout error (non-critical):', serverError);
      }
      
      // Limpiar almacenamiento local
      await storageService.removeToken();
      await storageService.removeUserData();
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Forzar logout local incluso si hay errores
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Limpiar datos de entrada
      const cleanUserData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
      };

      const response = await authService.updateProfile(cleanUserData);
      
      if (!response || !response.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Limpiar datos de respuesta
      const cleanUser = {
        ...state.user,
        firstName: response.user.firstName || state.user.firstName,
        lastName: response.user.lastName || state.user.lastName,
        email: response.user.email || state.user.email,
        phone: response.user.phone || state.user.phone,
        updatedAt: response.user.updatedAt || new Date().toISOString(),
      };

      await storageService.saveUserData(cleanUser);
      dispatch({ type: 'UPDATE_USER', payload: cleanUser });
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.message || 'Error al actualizar perfil';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    // Estado
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    
    // Acciones
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};