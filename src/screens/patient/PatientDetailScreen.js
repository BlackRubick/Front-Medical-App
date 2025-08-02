import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// Importar utilidades
import { DateUtils } from '../../utils/dateUtils';
import { Helpers } from '../../utils/helpers';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/dimensions';
import { GlobalStyles } from '../../styles/globalStyles';

const PatientDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { patient } = route.params || {};

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    Alert.alert('Funcionalidad', 'Editar paciente estará disponible próximamente');
  };

  const handleViewSensors = () => {
    Alert.alert('Funcionalidad', 'Ver sensores estará disponible próximamente');
  };

  const handleAddVisit = () => {
    Alert.alert('Funcionalidad', 'Agregar visita estará disponible próximamente');
  };

  if (!patient) {
    return (
      <View style={GlobalStyles.container}>
        <Header 
          title="Error" 
          showBackButton 
          onLeftPress={handleBack}
        />
        <View style={GlobalStyles.centered}>
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorText}>
            No se pudo cargar la información del paciente
          </Text>
          <Button 
            title="Volver" 
            onPress={handleBack}
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'inactive':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <Header 
        title="Detalle del Paciente"
        showBackButton
        onLeftPress={handleBack}

      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Información básica */}
        <Card style={styles.basicInfoCard}>
          <View style={styles.patientHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color={Colors.textOnPrimary} />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>
                {patient.firstName} {patient.lastName}
              </Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(patient.status) }
                ]} />
                <Text style={styles.statusText}>
                  {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.condition}>{patient.condition}</Text>
        </Card>

        {/* Información de contacto */}
        <Card style={styles.contactCard}>
          <Text style={styles.cardTitle}>Información de Contacto</Text>
          
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={20} color={Colors.textSecondary} />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{patient.email}</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="call" size={20} color={Colors.textSecondary} />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Teléfono</Text>
              <Text style={styles.contactValue}>{patient.phone}</Text>
            </View>
          </View>

          {patient.address && (
            <View style={styles.contactRow}>
              <Ionicons name="location" size={20} color={Colors.textSecondary} />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Dirección</Text>
                <Text style={styles.contactValue}>{patient.address}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Información médica */}
        <Card style={styles.medicalCard}>
          <Text style={styles.cardTitle}>Información Médica</Text>
          
          <View style={styles.medicalRow}>
            <Text style={styles.medicalLabel}>Fecha de Nacimiento:</Text>
            <Text style={styles.medicalValue}>
              {DateUtils.formatDate(patient.dateOfBirth)}
            </Text>
          </View>

          <View style={styles.medicalRow}>
            <Text style={styles.medicalLabel}>Condición:</Text>
            <Text style={styles.medicalValue}>{patient.condition}</Text>
          </View>

          <View style={styles.medicalRow}>
            <Text style={styles.medicalLabel}>Última Visita:</Text>
            <Text style={styles.medicalValue}>
              {patient.lastVisit 
                ? DateUtils.formatDateTime(patient.lastVisit)
                : 'Sin visitas registradas'
              }
            </Text>
          </View>
        </Card>

        {/* Contacto de emergencia */}
        {patient.emergencyContact && (
          <Card style={styles.emergencyCard}>
            <Text style={styles.cardTitle}>Contacto de Emergencia</Text>
            
            <View style={styles.emergencyRow}>
              <Text style={styles.emergencyLabel}>Nombre:</Text>
              <Text style={styles.emergencyValue}>
                {patient.emergencyContact.name}
              </Text>
            </View>

            <View style={styles.emergencyRow}>
              <Text style={styles.emergencyLabel}>Teléfono:</Text>
              <Text style={styles.emergencyValue}>
                {patient.emergencyContact.phone}
              </Text>
            </View>

            <View style={styles.emergencyRow}>
              <Text style={styles.emergencyLabel}>Relación:</Text>
              <Text style={styles.emergencyValue}>
                {patient.emergencyContact.relationship}
              </Text>
            </View>
          </Card>
        )}



        {/* Espaciado inferior */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  basicInfoCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  condition: {
    ...Typography.body1,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    textAlign: 'center',
  },
  contactCard: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contactText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  contactLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  contactValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
  },
  medicalCard: {
    marginBottom: Spacing.md,
  },
  medicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  medicalLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    flex: 1,
  },
  medicalValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  emergencyCard: {
    marginBottom: Spacing.md,
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emergencyLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    flex: 1,
  },
  emergencyValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  actionsCard: {
    marginBottom: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  actionText: {
    ...Typography.body1,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
    flex: 1,
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 44,
  },
  errorText: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginTop: Spacing.md,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default PatientDetailScreen;