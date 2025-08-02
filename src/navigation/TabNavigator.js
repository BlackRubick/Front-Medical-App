import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importar navegadores de stack
import StackNavigator from './StackNavigator';

// Importar pantallas principales
import PatientsScreen from '../screens/patient/PatientsScreen';
import SensorsScreen from '../screens/sensors/SensorsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Importar constantes y estilos
import { SCREEN_NAMES } from '../utils/constants';
import { Colors } from '../styles/colors';
import { Typography } from '../styles/typography';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={SCREEN_NAMES.PATIENTS}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case SCREEN_NAMES.PATIENTS:
              iconName = focused ? 'people' : 'people-outline';
              break;
            case SCREEN_NAMES.SENSORS:
              iconName = focused ? 'pulse' : 'pulse-outline';
              break;
            case SCREEN_NAMES.PROFILE:
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          ...Typography.caption,
          fontWeight: '500',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name={SCREEN_NAMES.PATIENTS} 
        component={StackNavigator}
        options={{
          tabBarLabel: 'Pacientes',
        }}
        initialParams={{ screen: 'PatientsStack' }}
      />
      
      <Tab.Screen 
        name={SCREEN_NAMES.SENSORS} 
        component={StackNavigator}
        options={{
          tabBarLabel: 'Sensores',
        }}
        initialParams={{ screen: 'SensorsStack' }}
      />
      
      <Tab.Screen 
        name={SCREEN_NAMES.PROFILE} 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;