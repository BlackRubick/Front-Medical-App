import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Input from '../../components/common/Input';

// Importar constantes y utilidades
import { SCREEN_NAMES } from '../../utils/constants';
import { Helpers } from '../../utils/helpers';
import { DateUtils } from '../../utils/dateUtils';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/dimensions';
import { GlobalStyles } from '../../styles/globalStyles';

// Datos de ejemplo (más tarde vendrán del Context/API)
const SAMPLE_PATIENTS = [
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
  },
];

const PatientsScreen = () => {
  const navigation = useNavigation();
  
  const [patients, setPatients] = useState(SAMPLE_PATIENTS);
  const [filteredPatients, setFilteredPatients] = useState(SAMPLE_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filtrar pacientes por búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const email = patient.email.toLowerCase();
        const condition = patient.condition.toLowerCase();
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || 
               email.includes(query) || 
               condition.includes(query);
      });
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  // Cargar pacientes
  const loadPatients = async () => {
    setLoading(true);
    try {
      // Aquí iría la llamada a la API
      // const response = await patientService.getPatients();
      // setPatients(response.data);
      
      // Simulamos carga
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  // Navegar a detalle del paciente
  const handlePatientPress = (patient) => {
    navigation.navigate(SCREEN_NAMES.PATIENT_DETAIL, { patient });
  };

  // Navegar a agregar paciente
  const handleAddPatient = () => {
    navigation.navigate(SCREEN_NAMES.ADD_PATIENT);
  };

  // Obtener color del estado
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

  // Renderizar item de paciente
  const renderPatientItem = ({ item }) => (
    <Card onPress={() => handlePatientPress(item)} style={styles.patientCard}>
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.firstName} {item.lastName}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: getStatusColor(item.status) }
            ]} />
            <Text style={styles.statusText}>
              {item.status === 'active' ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={Colors.textSecondary} 
        />
      </View>

      <View style={styles.patientDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="medical" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.condition}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            Última visita: {DateUtils.formatDateTime(item.lastVisit)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="mail" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
      </View>
    </Card>
  );

  // Lista vacía
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>No hay pacientes</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'No se encontraron pacientes con ese criterio' : 'Agrega tu primer paciente'}
      </Text>
    </View>
  );

  if (loading && patients.length === 0) {
    return (
      <View style={GlobalStyles.container}>
        <Header title="Pacientes" />
        <Loading text="Cargando pacientes..." />
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <Header 
        title="Pacientes"
        rightIcon="add"
        onRightPress={handleAddPatient}
      />

      <View style={styles.content}>
        {/* Búsqueda */}
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar pacientes..."
          leftIcon="search"
          style={styles.searchInput}
        />

        {/* Lista de pacientes */}
        <FlatList
          data={filteredPatients}
          keyExtractor={item => item.id}
          renderItem={renderPatientItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Botón flotante para agregar */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddPatient}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={Colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listContainer: {
    paddingBottom: 80, // Espacio para el FAB
  },
  patientCard: {
    marginBottom: Spacing.sm,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    ...Typography.h5,
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
  patientDetails: {
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default PatientsScreen;