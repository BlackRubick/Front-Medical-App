import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas de pacientes
import PatientsScreen from '../screens/patient/PatientsScreen';
import PatientDetailScreen from '../screens/patient/PatientDetailScreen';
import AddPatientScreen from '../screens/patient/AddPatientScreen';

// Importar pantallas de sensores
import SensorsScreen from '../screens/sensors/SensorsScreen';
import SensorDetailScreen from '../screens/sensors/SensorDetailScreen';
import ChartsScreen from '../screens/sensors/ChartsScreen';

// Importar constantes
import { SCREEN_NAMES } from '../utils/constants';
import { Colors } from '../styles/colors';

const Stack = createStackNavigator();

const StackNavigator = ({ route }) => {
  // Determinar qué stack mostrar basado en los parámetros
  const stackType = route?.params?.screen || 'PatientsStack';

  const screenOptions = {
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
  };

  if (stackType === 'SensorsStack') {
    return (
      <Stack.Navigator
        initialRouteName="SensorsMain"
        screenOptions={screenOptions}
      >
        <Stack.Screen 
          name="SensorsMain" 
          component={SensorsScreen}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.SENSOR_DETAIL} 
          component={SensorDetailScreen}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.CHARTS} 
          component={ChartsScreen}
        />
      </Stack.Navigator>
    );
  }

  // Default: PatientsStack
  return (
    <Stack.Navigator
      initialRouteName="PatientsMain"
      screenOptions={screenOptions}
    >
      <Stack.Screen 
        name="PatientsMain" 
        component={PatientsScreen}
      />
      <Stack.Screen 
        name={SCREEN_NAMES.PATIENT_DETAIL} 
        component={PatientDetailScreen}
      />
      <Stack.Screen 
        name={SCREEN_NAMES.ADD_PATIENT} 
        component={AddPatientScreen}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;