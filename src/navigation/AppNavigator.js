import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../store/context/AuthContext';

// Importar navegadores
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

// Importar componentes
import Loading from '../components/common/Loading';

// Importar estilos
import { GlobalStyles } from '../styles/globalStyles';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <View style={GlobalStyles.centered}>
        <Loading 
          text="Cargando..." 
          size="large" 
        />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {isAuthenticated ? (
        // Usuario autenticado - Mostrar aplicación principal
        <Stack.Screen 
          name="Main" 
          component={TabNavigator} 
        />
      ) : (
        // Usuario no autenticado - Mostrar pantallas de auth
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;