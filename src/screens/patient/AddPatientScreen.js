import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Importar componentes
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

// Importar utilidades
import { Helpers } from '../../utils/helpers';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/dimensions';
import { GlobalStyles } from '../../styles/globalStyles';

const AddPatientScreen = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    condition: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
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

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
    }

    if (!formData.condition.trim()) {
      newErrors.condition = 'La condición médica es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Éxito',
        'Paciente agregado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <Header 
        title="Agregar Paciente"
        showBackButton
        onLeftPress={handleBack}
      />

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Información básica */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <Input
              label="Nombre *"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Ingresa el nombre"
              error={errors.firstName}
            />

            <Input
              label="Apellido *"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Ingresa el apellido"
              error={errors.lastName}
            />

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Teléfono *"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="+52 123 456 7890"
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <Input
              label="Fecha de Nacimiento *"
              value={formData.dateOfBirth}
              onChangeText={(value) => handleInputChange('dateOfBirth', value)}
              placeholder="DD/MM/AAAA"
              error={errors.dateOfBirth}
            />
          </Card>

          {/* Información médica */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Información Médica</Text>
            
            <Input
              label="Condición Médica *"
              value={formData.condition}
              onChangeText={(value) => handleInputChange('condition', value)}
              placeholder="Ej: Diabetes, Hipertensión, etc."
              error={errors.condition}
            />

            <Input
              label="Dirección"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Dirección completa"
              multiline
              numberOfLines={3}
            />
          </Card>

          {/* Contacto de emergencia */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>
            
            <Input
              label="Nombre del Contacto"
              value={formData.emergencyContactName}
              onChangeText={(value) => handleInputChange('emergencyContactName', value)}
              placeholder="Nombre completo"
            />

            <Input
              label="Teléfono del Contacto"
              value={formData.emergencyContactPhone}
              onChangeText={(value) => handleInputChange('emergencyContactPhone', value)}
              placeholder="+52 123 456 7890"
              keyboardType="phone-pad"
            />

            <Input
              label="Relación"
              value={formData.emergencyContactRelationship}
              onChangeText={(value) => handleInputChange('emergencyContactRelationship', value)}
              placeholder="Ej: Esposo/a, Hijo/a, Padre/Madre"
            />
          </Card>

          {/* Nota */}
          <Text style={styles.noteText}>
            * Campos obligatorios
          </Text>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <Button
              title="Cancelar"
              onPress={handleBack}
              variant="outline"
              style={[styles.button, styles.cancelButton]}
            />
            
            <Button
              title="Guardar Paciente"
              onPress={handleSave}
              loading={loading}
              style={[styles.button, styles.saveButton]}
            />
          </View>

          {/* Espaciado inferior */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  formCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  noteText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: Colors.textSecondary,
  },
  saveButton: {
    // Usar estilos por defecto del botón primario
  },
  bottomSpacing: {
    height: 40,
  },
});

export default AddPatientScreen;