import { StyleSheet } from 'react-native';
import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing, BorderRadius } from './dimensions';

export const GlobalStyles = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  
  // Padding y márgenes
  padding: {
    padding: Spacing.md,
  },
  paddingHorizontal: {
    paddingHorizontal: Spacing.md,
  },
  paddingVertical: {
    paddingVertical: Spacing.md,
  },
  margin: {
    margin: Spacing.md,
  },
  marginHorizontal: {
    marginHorizontal: Spacing.md,
  },
  marginVertical: {
    marginVertical: Spacing.md,
  },
  
  // Sombras
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lightShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  
  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Texto
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  
  // Colores de texto comunes
  textPrimary: {
    color: Colors.textPrimary,
  },
  textSecondary: {
    color: Colors.textSecondary,
  },
  textSuccess: {
    color: Colors.success,
  },
  textError: {
    color: Colors.error,
  },
  textWarning: {
    color: Colors.warning,
  },
  
  // Separadores
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  
  // Input común
  inputContainer: {
    marginVertical: Spacing.sm,
  },
  
  // Botones
  buttonContainer: {
    marginVertical: Spacing.sm,
  },
});