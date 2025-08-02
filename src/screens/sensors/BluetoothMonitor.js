import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Card from '../common/Card';

// Importar servicios
import { sensorService } from '../../services/api/sensorService';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/dimensions';

const BluetoothMonitor = ({ patientId, onNewReading }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastReading, setLastReading] = useState(null);
  const [connectionInterval, setConnectionInterval] = useState(null);

  useEffect(() => {
    return () => {
      // Limpiar intervalo al desmontar
      if (connectionInterval) {
        clearInterval(connectionInterval);
      }
    };
  }, [connectionInterval]);

  // Simular conexión Bluetooth
  const handleConnect = async () => {
    if (isConnected) {
      handleDisconnect();
      return;
    }

    setIsConnecting(true);
    
    try {
      // Simular conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const connection = await sensorService.simulateBluetoothConnection(patientId);
      
      if (connection.connected) {
        setIsConnected(true);
        Alert.alert('Conectado', `Conectado a ${connection.deviceName}`);
        
        // Simular datos llegando cada 5 segundos
        const interval = setInterval(() => {
          simulateArduinoData();
        }, connection.interval);
        
        setConnectionInterval(interval);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al dispositivo Arduino');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    if (connectionInterval) {
      clearInterval(connectionInterval);
      setConnectionInterval(null);
    }
    setLastReading(null);
    Alert.alert('Desconectado', 'Dispositivo Arduino desconectado');
  };

  // Simular datos del Arduino llegando por Bluetooth
  const simulateArduinoData = async () => {
    try {
      // Generar datos realistas como los de tu Arduino
      const bpm1 = 65 + Math.floor(Math.random() * 40); // 65-105 BPM
      const bpm2 = 70 + Math.floor(Math.random() * 35); // 70-105 BPM
      const bpmPromedio = Math.round((bmp1 + bpm2) / 2);
      
      const arduinoData = {
        bmp1,
        bpm2,
        bpmPromedio,
        rawData: `BPM1: ${bmp1} | BPM2: ${bpm2} | Promedio: ${bpmPromedio}`,
      };
      
      // Agregar la lectura
      const response = await sensorService.addArduinoReading(patientId, arduinoData);
      
      if (response && response.data) {
        setLastReading(response.data);
        
        // Notificar al componente padre
        if (onNewReading) {
          onNewReading(response.data);
        }
      }
    } catch (error) {
      console.error('Error processing Arduino data:', error);
    }
  };

  // Obtener color del estado de conexión
  const getConnectionColor = () => {
    if (isConnecting) return Colors.warning;
    if (isConnected) return Colors.success;
    return Colors.textSecondary;
  };

  // Obtener icono del estado de conexión
  const getConnectionIcon = () => {
    if (isConnecting) return 'sync';
    if (isConnected) return 'bluetooth';
    return 'bluetooth-outline';
  };

  // Obtener texto del estado
  const getConnectionText = () => {
    if (isConnecting) return 'Conectando...';
    if (isConnected) return 'Conectado';
    return 'Desconectado';
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name="hardware-chip" 
            size={20} 
            color={Colors.primary} 
          />
          <Text style={styles.title}>Monitor Arduino</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.connectionButton,
            { 
              backgroundColor: isConnected ? Colors.error : Colors.primary,
              opacity: isConnecting ? 0.6 : 1,
            }
          ]}
          onPress={handleConnect}
          disabled={isConnecting}
        >
          <Ionicons 
            name={getConnectionIcon()} 
            size={16} 
            color={Colors.textOnPrimary} 
          />
          <Text style={styles.connectionButtonText}>
            {isConnected ? 'Desconectar' : 'Conectar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estado de conexión */}
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusDot,
            { backgroundColor: getConnectionColor() }
          ]} />
          <Text style={[
            styles.statusText,
            { color: getConnectionColor() }
          ]}>
            {getConnectionText()}
          </Text>
        </View>
        
        {isConnected && (
          <Text style={styles.deviceText}>
            Arduino-HR-{patientId}
          </Text>
        )}
      </View>

      {/* Última lectura */}
      {lastReading && isConnected && (
        <View style={styles.readingContainer}>
          <Text style={styles.readingTitle}>Última Lectura:</Text>
          
          <View style={styles.readingData}>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Sensor 1:</Text>
              <Text style={styles.readingValue}>
                {lastReading.arduinoData?.bmp1} BPM
              </Text>
            </View>
            
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Sensor 2:</Text>
              <Text style={styles.readingValue}>
                {lastReading.arduinoData?.bpm2} BPM
              </Text>
            </View>
            
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Promedio:</Text>
              <Text style={[
                styles.readingValue,
                styles.averageValue,
                { color: getStatusColor(lastReading.status) }
              ]}>
                {lastReading.value} BPM
              </Text>
            </View>
            
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>LED:</Text>
              <View style={styles.ledStatus}>
                <View style={[
                  styles.ledDot,
                  { 
                    backgroundColor: lastReading.arduinoData?.ledStatus === 'blue' 
                      ? Colors.primary 
                      : Colors.error 
                  }
                ]} />
                <Text style={styles.readingValue}>
                  {lastReading.arduinoData?.ledStatus === 'blue' ? 'Azul' : 'Rojo'}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.rawData}>
            {lastReading.arduinoData?.rawData}
          </Text>
        </View>
      )}

      {/* Información cuando no está conectado */}
      {!isConnected && !isConnecting && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Presiona "Conectar" para simular la conexión con tu Arduino y recibir datos cada 5 segundos
          </Text>
        </View>
      )}
    </Card>
  );
};

// Función helper para obtener color del estado
const getStatusColor = (status) => {
  switch (status) {
    case 'normal':
      return Colors.success;
    case 'high':
    case 'low':
      return Colors.error;
    default:
      return Colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  connectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  connectionButtonText: {
    ...Typography.body2,
    color: Colors.textOnPrimary,
    fontWeight: '500',
  },
  statusContainer: {
    marginBottom: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusText: {
    ...Typography.body2,
    fontWeight: '500',
  },
  deviceText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    marginLeft: Spacing.lg,
  },
  readingContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  readingTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  readingData: {
    marginBottom: Spacing.md,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  readingLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  readingValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  averageValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  ledStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ledDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  rawData: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    textAlign: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  infoText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BluetoothMonitor;