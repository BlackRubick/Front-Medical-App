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

// Importar servicios
import { sensorService } from '../../services/api/sensorService';

// Importar constantes y utilidades
import { SENSOR_TYPES } from '../../utils/constants';
import { Helpers } from '../../utils/helpers';
import { DateUtils } from '../../utils/dateUtils';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/dimensions';
import { GlobalStyles } from '../../styles/globalStyles';

const SensorsScreen = () => {
  const navigation = useNavigation();
  
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    normal: 0,
    high: 0,
    low: 0,
  });

  useEffect(() => {
    loadSensorData();
  }, []);

  // Cargar datos de sensores de todos los pacientes
  const loadSensorData = async () => {
    try {
      setLoading(true);
      const allData = [];
      
      // Cargar datos de todos los pacientes (1, 2, 3)
      for (const patientId of ['1', '2', '3']) {
        try {
          const response = await sensorService.getSensorDataByPatient(patientId, SENSOR_TYPES.HEART_RATE, 10);
          const patientSensorData = response.data || [];
          
          // Agregar nombre del paciente
          const enrichedData = patientSensorData.map(reading => ({
            ...reading,
            patientName: getPatientName(patientId),
          }));
          
          allData.push(...enrichedData);
        } catch (error) {
          console.error(`Error loading data for patient ${patientId}:`, error);
        }
      }
      
      // Ordenar por timestamp descendente
      allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setSensorData(allData);
      
      // Calcular estadísticas
      setStats({
        total: allData.length,
        normal: allData.filter(item => item.status === 'normal').length,
        high: allData.filter(item => item.status === 'high').length,
        low: allData.filter(item => item.status === 'low').length,
      });
      
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos de sensores');
      console.error('Error loading sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombre del paciente
  const getPatientName = (patientId) => {
    const names = {
      '1': 'Juan Pérez',
      '2': 'María González', 
      '3': 'Carlos Rodríguez',
    };
    return names[patientId] || `Paciente ${patientId}`;
  };

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSensorData();
    setRefreshing(false);
  };

  // Obtener tiempo relativo
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  };

  // Navegar a detalle del sensor
  const handleSensorPress = (reading) => {
    Alert.alert(
      'Detalles del Sensor Arduino',
      `Paciente: ${reading.patientName}\n` +
      `BPM Sensor 1: ${reading.arduinoData?.bmp1 || 'N/A'}\n` +
      `BPM Sensor 2: ${reading.arduinoData?.bpm2 || 'N/A'}\n` +
      `Promedio: ${reading.value} BPM\n` +
      `Estado: ${reading.status === 'normal' ? 'Normal' : reading.status === 'high' ? 'Alto' : 'Bajo'}\n` +
      `LED: ${reading.arduinoData?.ledStatus === 'blue' ? 'Azul (Normal)' : 'Rojo (Alerta)'}\n` +
      `Timestamp: ${DateUtils.formatDateTime(reading.timestamp)}\n` +
      `Dispositivo: ${reading.deviceId}`
    );
  };

  // Simular nueva lectura de Arduino
  const handleSimulateReading = async () => {
    try {
      const patientId = '1'; // Paciente de prueba
      const mockArduinoData = {
        bpm1: 70 + Math.floor(Math.random() * 30),
        bpm2: 75 + Math.floor(Math.random() * 25),
        bpmPromedio: 75 + Math.floor(Math.random() * 25),
      };
      
      await sensorService.addArduinoReading(patientId, mockArduinoData);
      Alert.alert('Éxito', 'Nueva lectura simulada agregada');
      loadSensorData(); // Recargar datos
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la lectura');
    }
  };

  // Renderizar item de sensor
  const renderSensorItem = ({ item }) => (
    <Card onPress={() => handleSensorPress(item)} style={styles.sensorCard}>
      <View style={styles.sensorHeader}>
        <View style={[
          styles.sensorIcon,
          { backgroundColor: item.status === 'normal' ? Colors.success + '20' : Colors.error + '20' }
        ]}>
          <Ionicons 
            name="heart" 
            size={24} 
            color={Helpers.getStatusColor(item.status)} 
          />
        </View>
        <View style={styles.sensorInfo}>
          <Text style={styles.sensorName}>
            Frecuencia Cardíaca Arduino
          </Text>
          <Text style={styles.patientName}>
            {item.patientName}
          </Text>
          <Text style={styles.deviceName}>
            {item.deviceId}
          </Text>
        </View>
        <View style={styles.sensorValue}>
          <Text style={[
            styles.valueText,
            { color: Helpers.getStatusColor(item.status) }
          ]}>
            {item.value} BPM
          </Text>
          <Text style={styles.timeText}>
            {getTimeAgo(item.timestamp)}
          </Text>
        </View>
      </View>

      {/* Datos específicos del Arduino */}
      <View style={styles.arduinoData}>
        <View style={styles.arduinoRow}>
          <Text style={styles.arduinoLabel}>Sensor 1:</Text>
          <Text style={styles.arduinoValue}>{item.arduinoData?.bmp1 || 'N/A'} BPM</Text>
        </View>
        <View style={styles.arduinoRow}>
          <Text style={styles.arduinoLabel}>Sensor 2:</Text>
          <Text style={styles.arduinoValue}>{item.arduinoData?.bpm2 || 'N/A'} BPM</Text>
        </View>
        <View style={styles.arduinoRow}>
          <Text style={styles.arduinoLabel}>LED:</Text>
          <View style={styles.ledIndicator}>
            <View style={[
              styles.ledDot,
              { 
                backgroundColor: item.arduinoData?.ledStatus === 'blue' ? Colors.primary : Colors.error 
              }
            ]} />
            <Text style={styles.arduinoValue}>
              {item.arduinoData?.ledStatus === 'blue' ? 'Azul (Normal)' : 'Rojo (Alerta)'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sensorFooter}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: Helpers.getStatusColor(item.status) }
          ]} />
          <Text style={styles.statusText}>
            {item.status === 'normal' ? 'Normal' : 
             item.status === 'high' ? 'Alto (>115 BPM)' : 
             'Bajo (<60 BPM)'}
          </Text>
        </View>
      </View>
    </Card>
  );

  // Lista vacía
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>No hay datos de Arduino</Text>
      <Text style={styles.emptySubtitle}>
        Conecta tu Arduino y espera las lecturas de frecuencia cardíaca
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={GlobalStyles.container}>
        <Header title="Sensores Arduino" />
        <Loading text="Cargando datos del Arduino..." />
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <Header 
        title="Sensores Arduino"
        rightIcon="add-circle"
        onRightPress={handleSimulateReading}
      />

      <View style={styles.content}>
        {/* Estadísticas de Arduino */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Lecturas</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>
              {stats.normal}
            </Text>
            <Text style={styles.statLabel}>Normales</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.error }]}>
              {stats.high + stats.low}
            </Text>
            <Text style={styles.statLabel}>Alertas</Text>
          </Card>
        </View>

        {/* Lista de lecturas del Arduino */}
        <FlatList
          data={sensorData}
          keyExtractor={item => item.id}
          renderItem={renderSensorItem}
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
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  sensorCard: {
    marginBottom: Spacing.md,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sensorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  patientName: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  deviceName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  sensorValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    ...Typography.h4,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  arduinoData: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  arduinoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  arduinoLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  arduinoValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
  },
  ledIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ledDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  sensorFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
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
    ...Typography.body2,
    color: Colors.textSecondary,
    fontWeight: '500',
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
    paddingHorizontal: Spacing.lg,
  },
});

export default SensorsScreen;