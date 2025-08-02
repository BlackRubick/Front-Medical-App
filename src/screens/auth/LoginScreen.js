import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

// Importar contexto y utilidades
import { useAuth } from '../../store/context/AuthContext';
import { SCREEN_NAMES, FORM_VALIDATION } from '../../utils/constants';
import { Helpers } from '../../utils/helpers';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/dimensions';
import { GlobalStyles } from '../../styles/globalStyles';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
  }, []);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!Helpers.isValidEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = `La contraseña debe tener al menos ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Manejar login
  const handleLogin = async () => {
    if (!validateForm()) return;

    const result = await login(formData.email.trim(), formData.password);
    
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  // Navegar a registro
  const handleGoToRegister = () => {
    navigation.navigate(SCREEN_NAMES.REGISTER);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="medical" size={64} color={Colors.textOnPrimary} />
            </View>
            <Text style={styles.title}>Tamyen</Text>
            <Text style={styles.subtitle}>
              Monitoreo de pacientes y sensores médicos
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Contraseña"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Ingresa tu contraseña"
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            {/* Registro */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta? 
              </Text>
              <TouchableOpacity onPress={handleGoToRegister}>
                <Text style={styles.registerLink}>
                  Regístrate aquí
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Loading overlay */}
        {loading && (
          <Loading overlay text="Iniciando sesión..." />
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.textOnPrimary,
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  formTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  registerText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  registerLink: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LoginScreen;