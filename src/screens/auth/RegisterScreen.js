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
import Header from '../../components/common/Header';

// Importar contexto y utilidades
import { useAuth } from '../../store/context/AuthContext';
import { SCREEN_NAMES, FORM_VALIDATION } from '../../utils/constants';
import { Helpers } from '../../utils/helpers';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/dimensions';
import { GlobalStyles } from '../../styles/globalStyles';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
  }, []);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    } else if (formData.firstName.length < FORM_VALIDATION.NAME_MIN_LENGTH) {
      newErrors.firstName = `El nombre debe tener al menos ${FORM_VALIDATION.NAME_MIN_LENGTH} caracteres`;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    } else if (formData.lastName.length < FORM_VALIDATION.NAME_MIN_LENGTH) {
      newErrors.lastName = `El apellido debe tener al menos ${FORM_VALIDATION.NAME_MIN_LENGTH} caracteres`;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!Helpers.isValidEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!Helpers.isValidPhone(formData.phone)) {
      newErrors.phone = 'Ingresa un teléfono válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = `La contraseña debe tener al menos ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} caracteres`;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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

  // Manejar registro
  const handleRegister = async () => {
    if (!validateForm()) return;

    const userData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    };

    const result = await register(userData);
    
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  // Volver al login
  const handleGoToLogin = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Crear Cuenta"
        showBackButton
        onLeftPress={handleGoToLogin}
      />

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Info */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Registrarse</Text>
            <Text style={styles.subtitle}>
              Crea tu cuenta para acceder a la aplicación
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Input
              label="Nombre"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Ingresa tu nombre"
              leftIcon="person-outline"
              error={errors.firstName}
            />

            <Input
              label="Apellido"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Ingresa tu apellido"
              leftIcon="person-outline"
              error={errors.lastName}
            />

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
              label="Teléfono"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="+52 123 456 7890"
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={errors.phone}
            />

            <Input
              label="Contraseña"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Crea una contraseña"
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <Input
              label="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirma tu contraseña"
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Button
              title="Crear Cuenta"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            {/* Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta? 
              </Text>
              <TouchableOpacity onPress={handleGoToLogin}>
                <Text style={styles.loginLink}>
                  Inicia sesión aquí
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Loading overlay */}
        {loading && (
          <Loading overlay text="Creando cuenta..." />
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  registerButton: {
    marginTop: Spacing.lg,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  loginLink: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default RegisterScreen;