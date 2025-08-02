import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

// Importar componentes
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/dimensions';
import { GlobalStyles } from '../../styles/globalStyles';

const SensorDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={GlobalStyles.container}>
      <Header 
        title="Detalle del Sensor"
        showBackButton
        onLeftPress={handleBack}
      />

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Funcionalidad en Desarrollo</Text>
          <Text style={styles.description}>
            Esta pantalla mostrará información detallada del sensor seleccionado,
            incluyendo gráficos de tendencias, historial de lecturas y configuración.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  card: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  description: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SensorDetailScreen;