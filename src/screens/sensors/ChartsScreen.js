import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Importar componentes
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/dimensions';
import { GlobalStyles } from '../../styles/globalStyles';

const ChartsScreen = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={GlobalStyles.container}>
      <Header 
        title="Gráficos"
        showBackButton
        onLeftPress={handleBack}
      />

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Gráficos en Desarrollo</Text>
          <Text style={styles.description}>
            Esta pantalla mostrará gráficos interactivos de los datos de sensores,
            incluyendo tendencias temporales, comparaciones y análisis estadísticos.
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

export default ChartsScreen;