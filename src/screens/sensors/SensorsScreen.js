import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
  const simulationInterval = useRef(null);
  const connectionCheckInterval = useRef(null);
  
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('simulated');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentReadingId, setCurrentReadingId] = useState(1000);
  const [stats, setStats] = useState({
    total: 0,
    normal: 0,
    high: 0,
    low: 0,
  });

  // Estados de los pacientes virtuales para simulación realista
  const [patientStates, setPatientStates] = useState({
    '1': {
      name: 'Juan Pérez',
      baseHR: 78,
      trend: 'stable', // stable, increasing, decreasing
      condition: 'normal', // normal, exercising, resting, stressed
      lastHR: 78,
      variability: 8,
    },
    '2': {
      name: 'María González',
      baseHR: 85,
      trend: 'stable',
      condition: 'normal',
      lastHR: 85,
      variability: 12,
    },
    '3': {
      name: 'Carlos Rodríguez',
      baseHR: 92,
      trend: 'increasing',
      condition: 'stressed',
      lastHR: 92,
      variability: 15,
    },
  });

  useEffect(() => {
    initializeSimulation();
    return () => {
      stopSimulation();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!isSimulating) {
        startSimulation();
      }
      return () => {
        // No detener cuando se desenfocan para mantener datos dinámicos
      };
    }, [])
  );

  // Inicializar simulación con datos base
  const initializeSimulation = async () => {
    try {
      setLoading(true);
      
      // Generar datos iniciales para los últimos 10 minutos
      const initialData = generateInitialData();
      setSensorData(initialData);
      updateStats(initialData);
      setLastUpdate(new Date());
      setConnectionStatus('simulated');
      
      // Iniciar simulación
      setTimeout(() => {
        startSimulation();
      }, 1000);
      
    } catch (error) {
      console.error('Error initializing simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generar datos iniciales realistas
  const generateInitialData = () => {
    const data = [];
    const now = new Date();
    
    // Generar 30 lecturas distribuidas en los últimos 10 minutos
    for (let i = 29; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 20000)); // Cada 20 segundos
      
      Object.keys(patientStates).forEach(patientId => {
        const patient = patientStates[patientId];
        const reading = generateRealisticReading(patient, timestamp, false);
        data.push({
          ...reading,
          id: `init_${patientId}_${i}`,
          patientId,
          patientName: patient.name,
        });
      });
    }
    
    // Ordenar por timestamp descendente
    return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Generar lectura realista basada en el estado del paciente
  const generateRealisticReading = (patient, timestamp = new Date(), isNew = true) => {
    // Simular variabilidad natural del corazón
    const timeOfDay = timestamp.getHours();
    let multiplier = 1;
    
    // Ajustar por hora del día
    if (timeOfDay >= 6 && timeOfDay <= 10) multiplier = 1.1; // Mañana
    else if (timeOfDay >= 14 && timeOfDay <= 18) multiplier = 1.05; // Tarde
    else if (timeOfDay >= 22 || timeOfDay <= 5) multiplier = 0.9; // Noche
    
    // Ajustar por condición del paciente
    switch (patient.condition) {
      case 'exercising':
        multiplier *= 1.4;
        break;
      case 'resting':
        multiplier *= 0.85;
        break;
      case 'stressed':
        multiplier *= 1.2;
        break;
    }
    
    // Generar BPM con variabilidad natural
    const targetHR = Math.round(patient.baseHR * multiplier);
    const variation1 = (Math.random() - 0.5) * patient.variability;
    const variation2 = (Math.random() - 0.5) * patient.variability;
    
    const bpm1 = Math.max(45, Math.min(180, Math.round(targetHR + variation1)));
    const bpm2 = Math.max(45, Math.min(180, Math.round(targetHR + variation2)));
    const bpmPromedio = Math.round((bpm1 + bpm2) / 2);
    
    // Determinar estado usando lógica del Arduino
    let status = 'normal';
    let ledStatus = 'blue';
    
    if (bpmPromedio >= 75 && bpmPromedio <= 100) {
      status = 'normal';
      ledStatus = 'blue';
    } else if (bpmPromedio > 115) {
      status = 'high';
      ledStatus = 'red';
    } else if (bpmPromedio > 0 && bpmPromedio < 60) {
      status = 'low';
      ledStatus = 'red_blinking';
    }
    
    // Calidad de señal basada en diferencia entre sensores
    const difference = Math.abs(bpm1 - bpm2);
    let signalQuality = 'excellent';
    if (difference > 15) signalQuality = 'poor';
    else if (difference > 10) signalQuality = 'fair';
    else if (difference > 5) signalQuality = 'good';
    
    return {
      sensorType: SENSOR_TYPES.HEART_RATE,
      value: bpmPromedio,
      timestamp: timestamp.toISOString(),
      status,
      deviceId: `arduino_hr_${patient.name.split(' ')[0].toLowerCase()}`,
      isArduinoData: true,
      isNewData: isNew,
      arduinoData: {
        bpm1,
        bpm2,
        bpmPromedio,
        sensor1Reading: 400 + Math.floor(Math.random() * 300),
        sensor2Reading: 450 + Math.floor(Math.random() * 250),
        ledStatus,
        rawData: `BPM1: ${bpm1} | BPM2: ${bpm2} | Promedio: ${bpmPromedio}`,
        umbralPulso: 550,
        intervaloMedicion: 5000,
        timestamp: timestamp.toISOString(),
        signalQuality,
      },
      createdAt: timestamp.toISOString(),
    };
  };

  // Iniciar simulación dinámica
  const startSimulation = () => {
    if (simulationInterval.current) return;
    
    setIsSimulating(true);
    setConnectionStatus('simulated');
    
    simulationInterval.current = setInterval(() => {
      generateNewReading();
      // Ocasionalmente cambiar estado de pacientes
      if (Math.random() < 0.1) { // 10% probabilidad
        updatePatientStates();
      }
    }, 4000); // Nueva lectura cada 4 segundos (similar al Arduino)
    
    console.log('🔄 Simulación dinámica de Arduino iniciada');
  };

  // Detener simulación
  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
      setIsSimulating(false);
      setConnectionStatus('disconnected');
      console.log('⏹️ Simulación detenida');
    }
  };

  // Generar nueva lectura y agregarla
  const generateNewReading = () => {
    const now = new Date();
    const patientIds = Object.keys(patientStates);
    
    // Generar lectura para un paciente aleatorio (o todos)
    const shouldGenerateForAll = Math.random() < 0.7; // 70% probabilidad de generar para todos
    const patientsToGenerate = shouldGenerateForAll 
      ? patientIds 
      : [patientIds[Math.floor(Math.random() * patientIds.length)]];
    
    const newReadings = [];
    
    patientsToGenerate.forEach(patientId => {
      const patient = patientStates[patientId];
      const reading = generateRealisticReading(patient, now, true);
      
      newReadings.push({
        ...reading,
        id: `sim_${currentReadingId}_${patientId}`,
        patientId,
        patientName: patient.name,
      });
      
      // Actualizar último HR del paciente
      setPatientStates(prev => ({
        ...prev,
        [patientId]: {
          ...prev[patientId],
          lastHR: reading.value,
        }
      }));
    });
    
    if (newReadings.length > 0) {
      setSensorData(prevData => {
        const combinedData = [...newReadings, ...prevData];
        // Mantener solo los últimos 100 registros para performance
        const limitedData = combinedData.slice(0, 100);
        updateStats(limitedData);
        setLastUpdate(new Date());
        return limitedData;
      });
      
      setCurrentReadingId(prev => prev + 1);
      
      // Log para debug
      console.log(`📡 Nuevas lecturas generadas: ${newReadings.length}`);
    }
  };

  // Actualizar estados de pacientes dinámicamente
  const updatePatientStates = () => {
    setPatientStates(prev => {
      const updated = { ...prev };
      
      Object.keys(updated).forEach(patientId => {
        const patient = updated[patientId];
        
        // Cambiar condición ocasionalmente
        if (Math.random() < 0.3) {
          const conditions = ['normal', 'resting', 'stressed'];
          if (patientId === '3') conditions.push('exercising'); // Carlos puede hacer ejercicio
          
          patient.condition = conditions[Math.floor(Math.random() * conditions.length)];
        }
        
        // Cambiar tendencia
        if (Math.random() < 0.2) {
          const trends = ['stable', 'increasing', 'decreasing'];
          patient.trend = trends[Math.floor(Math.random() * trends.length)];
          
          // Ajustar baseHR ligeramente según tendencia
          if (patient.trend === 'increasing') {
            patient.baseHR = Math.min(patient.baseHR + 2, 110);
          } else if (patient.trend === 'decreasing') {
            patient.baseHR = Math.max(patient.baseHR - 2, 60);
          }
        }
      });
      
      return updated;
    });
  };

  // Actualizar estadísticas
  const updateStats = (data) => {
    setStats({
      total: data.length,
      normal: data.filter(item => item.status === 'normal').length,
      high: data.filter(item => item.status === 'high').length,
      low: data.filter(item => item.status === 'low').length,
    });
  };

  // Toggle simulación
  const toggleSimulation = () => {
    if (isSimulating) {
      stopSimulation();
      Alert.alert(
        '⏸️ Simulación Pausada', 
        'La generación de datos dinámicos se ha detenido'
      );
    } else {
      startSimulation();
      Alert.alert(
        '▶️ Simulación Iniciada', 
        'Generando nuevas lecturas de Arduino cada 4 segundos'
      );
    }
  };

  // Cambiar modo de simulación
  const changeSimulationMode = () => {
    Alert.alert(
      'Modo de Simulación',
      'Selecciona el escenario que quieres simular:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: '😴 Normal/Reposo', 
          onPress: () => setScenario('normal')
        },
        { 
          text: '🏃‍♂️ Ejercicio', 
          onPress: () => setScenario('exercise')
        },
        { 
          text: '😰 Estrés/Alerta', 
          onPress: () => setScenario('stress')
        },
        { 
          text: '🚨 Emergencia', 
          onPress: () => setScenario('emergency')
        },
      ]
    );
  };

  // Establecer escenario de simulación
  const setScenario = (scenario) => {
    setPatientStates(prev => {
      const updated = { ...prev };
      
      switch (scenario) {
        case 'normal':
          Object.keys(updated).forEach(id => {
            updated[id].condition = 'normal';
            updated[id].baseHR = id === '1' ? 75 : id === '2' ? 80 : 85;
            updated[id].variability = 8;
          });
          break;
          
        case 'exercise':
          Object.keys(updated).forEach(id => {
            updated[id].condition = 'exercising';
            updated[id].baseHR = id === '1' ? 120 : id === '2' ? 115 : 125;
            updated[id].variability = 15;
          });
          break;
          
        case 'stress':
          Object.keys(updated).forEach(id => {
            updated[id].condition = 'stressed';
            updated[id].baseHR = id === '1' ? 95 : id === '2' ? 100 : 105;
            updated[id].variability = 20;
          });
          break;
          
        case 'emergency':
          // Solo Carlos en emergencia
          updated['3'].condition = 'stressed';
          updated['3'].baseHR = 140;
          updated['3'].variability = 25;
          break;
      }
      
      return updated;
    });
    
    Alert.alert('✅ Escenario Aplicado', `Simulación cambiada a modo: ${scenario}`);
  };

  // Refresh manual
  const onRefresh = async () => {
    setRefreshing(true);
    await initializeSimulation();
    setRefreshing(false);
  };

  // Obtener tiempo relativo
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 10) return 'Ahora mismo';
    if (diffInSeconds < 60) return `Hace ${diffInSeconds}s`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  };

  // Obtener color del estado de conexión
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'simulated': return Colors.primary;
      case 'connected': return Colors.success;
      case 'disconnected': return Colors.warning;
      case 'error': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  // Obtener texto del estado de conexión
  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'simulated': return '🎭 Modo Simulación';
      case 'connected': return '✅ Arduino Conectado';
      case 'disconnected': return '⏸️ Simulación Pausada';
      case 'error': return '❌ Error de Conexión';
      default: return 'Verificando...';
    }
  };

  // Navegar a detalle del sensor
  const handleSensorPress = (reading) => {
    const arduinoInfo = reading.arduinoData || {};
    const patient = patientStates[reading.patientId];
    
    Alert.alert(
      '🔬 Detalles del Sensor Arduino (Simulado)',
      `👤 Paciente: ${reading.patientName}\n` +
      `📡 Dispositivo: ${reading.deviceId}\n\n` +
      `💓 BPM Sensor 1: ${arduinoInfo.bpm1 || 'N/A'}\n` +
      `💓 BPM Sensor 2: ${arduinoInfo.bpm2 || 'N/A'}\n` +
      `📊 Promedio: ${reading.value} BPM\n\n` +
      `📈 Estado: ${getStatusText(reading.status)}\n` +
      `💡 LED: ${getLedStatusText(arduinoInfo.ledStatus)}\n` +
      `📶 Calidad: ${arduinoInfo.signalQuality || 'N/A'}\n\n` +
      `👨‍⚕️ Condición: ${patient?.condition || 'Normal'}\n` +
      `📈 Tendencia: ${patient?.trend || 'Stable'}\n` +
      `💗 HR Base: ${patient?.baseHR || 'N/A'} BPM\n\n` +
      `⏰ Timestamp: ${DateUtils.formatDateTime(reading.timestamp)}\n` +
      `🔢 Raw S1: ${arduinoInfo.sensor1Reading || 'N/A'}\n` +
      `🔢 Raw S2: ${arduinoInfo.sensor2Reading || 'N/A'}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        { 
          text: 'Ver Historial', 
          onPress: () => navigation.navigate('PatientDetail', { patientId: reading.patientId })
        }
      ]
    );
  };

  // Obtener texto del estado
  const getStatusText = (status) => {
    const statusMap = {
      'normal': '✅ Normal (75-100 BPM)',
      'high': '🔴 Alto (>115 BPM)',
      'low': '🟡 Bajo (<60 BPM)',
      'critical_high': '🚨 Crítico Alto (>150 BPM)',
      'critical_low': '🚨 Crítico Bajo (<40 BPM)'
    };
    return statusMap[status] || status;
  };

  // Obtener texto del LED
  const getLedStatusText = (ledStatus) => {
    const ledMap = {
      'blue': '🔵 Azul (Normal)',
      'red': '🔴 Rojo (Alerta)',
      'red_blinking': '🔴 Rojo Parpadeante (Crítico)',
      'off': '⚫ Apagado'
    };
    return ledMap[ledStatus] || 'Desconocido';
  };

  // Renderizar item de sensor
  const renderSensorItem = ({ item }) => (
    <Card 
      onPress={() => handleSensorPress(item)} 
      style={[
        styles.sensorCard,
        item.isNewData && styles.newDataCard
      ]}
    >
      <View style={styles.sensorHeader}>
        <View style={[
          styles.sensorIcon,
          { backgroundColor: item.status === 'normal' ? Colors.success + '20' : Colors.error + '20' }
        ]}>
          <Ionicons 
            name="hardware-chip" 
            size={24} 
            color={Helpers.getStatusColor(item.status)} 
          />
          {item.isNewData && (
            <View style={styles.newDataIndicator}>
              <Ionicons name="radio-button-on" size={12} color={Colors.primary} />
            </View>
          )}
        </View>
        
        <View style={styles.sensorInfo}>
          <Text style={styles.sensorName}>
            🎭 Arduino Simulado
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
      {item.arduinoData && (
        <View style={styles.arduinoData}>
          <View style={styles.arduinoRow}>
            <Text style={styles.arduinoLabel}>Sensor 1:</Text>
            <Text style={styles.arduinoValue}>{item.arduinoData.bpm1} BPM</Text>
          </View>
          <View style={styles.arduinoRow}>
            <Text style={styles.arduinoLabel}>Sensor 2:</Text>
            <Text style={styles.arduinoValue}>{item.arduinoData.bpm2} BPM</Text>
          </View>
          <View style={styles.arduinoRow}>
            <Text style={styles.arduinoLabel}>LED:</Text>
            <View style={styles.ledIndicator}>
              <View style={[
                styles.ledDot,
                { 
                  backgroundColor: item.arduinoData.ledStatus === 'blue' ? Colors.primary : Colors.error 
                }
              ]} />
              <Text style={styles.arduinoValue}>
                {getLedStatusText(item.arduinoData.ledStatus)}
              </Text>
            </View>
          </View>
          <View style={styles.arduinoRow}>
            <Text style={styles.arduinoLabel}>Calidad:</Text>
            <Text style={[
              styles.arduinoValue,
              { color: item.arduinoData.signalQuality === 'excellent' ? Colors.success : 
                       item.arduinoData.signalQuality === 'good' ? Colors.primary :
                       item.arduinoData.signalQuality === 'fair' ? Colors.warning : Colors.error }
            ]}>
              {item.arduinoData.signalQuality}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.sensorFooter}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: Helpers.getStatusColor(item.status) }
          ]} />
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
    </Card>
  );

  // Lista vacía
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="hardware-chip-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>Iniciando Simulación...</Text>
      <Text style={styles.emptySubtitle}>
        Generando datos dinámicos de Arduino en tiempo real
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={GlobalStyles.container}>
        <Header title="Arduino Simulado" />
        <Loading text="Inicializando simulación de Arduino..." />
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <Header 
        title="🎭 Arduino Simulado"
        rightIcon={isSimulating ? "pause" : "play"}
        onRightPress={toggleSimulation}
        leftIcon="settings"
        onLeftPress={changeSimulationMode}
      />

      <View style={styles.content}>
        {/* Estado de conexión/simulación */}
        <Card style={[styles.connectionCard, { borderLeftColor: getConnectionColor() }]}>
          <View style={styles.connectionHeader}>
            <View style={styles.connectionInfo}>
              <View style={styles.connectionStatus}>
                <View style={[styles.connectionDot, { backgroundColor: getConnectionColor() }]} />
                <Text style={[styles.connectionText, { color: getConnectionColor() }]}>
                  {getConnectionText()}
                </Text>
              </View>
              {lastUpdate && (
                <Text style={styles.lastUpdateText}>
                  Última generación: {getTimeAgo(lastUpdate)}
                </Text>
              )}
            </View>
            <View style={styles.realtimeIndicator}>
              {isSimulating && (
                <View style={styles.pulseIndicator}>
                  <Ionicons name="radio-button-on" size={16} color={Colors.success} />
                </View>
              )}
              <Text style={[styles.realtimeText, { color: isSimulating ? Colors.success : Colors.textSecondary }]}>
                {isSimulating ? 'SIMULANDO' : 'PAUSADO'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Estadísticas dinámicas */}
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

        {/* Estado de pacientes */}
        <View style={styles.patientsStatus}>
          {Object.entries(patientStates).map(([id, patient]) => (
            <Card key={id} style={styles.patientCard}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientHR}>{patient.lastHR} BPM</Text>
              <Text style={styles.patientCondition}>
                {patient.condition === 'normal' ? '😌' : 
                 patient.condition === 'exercising' ? '🏃‍♂️' : 
                 patient.condition === 'resting' ? '😴' : '😰'} {patient.condition}
              </Text>
            </Card>
          ))}
        </View>

        {/* Lista de lecturas simuladas */}
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
  connectionCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  connectionText: {
    ...Typography.body1,
    fontWeight: '600',
  },
  lastUpdateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseIndicator: {
    marginRight: Spacing.xs,
  },
  realtimeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
  patientsStatus: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  patientCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  patientName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  patientHR: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  patientCondition: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  sensorCard: {
    marginBottom: Spacing.md,
  },
  newDataCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
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
    position: 'relative',
  },
  newDataIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.white,
    borderRadius: 6,
    padding: 1,
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
    marginBottom: Spacing.lg,
  },
});

export default SensorsScreen;