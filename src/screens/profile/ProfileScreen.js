import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

// Importar contexto
import { useAuth } from '../../store/context/AuthContext';

// Importar estilos
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/dimensions';
import { GlobalStyles } from '../../styles/globalStyles';

const ProfileScreen = () => {
  const { user, logout, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Funcionalidad', 'Editar perfil estará disponible próximamente');
  };

  const handleChangePassword = () => {
    Alert.alert('Funcionalidad', 'Cambiar contraseña estará disponible próximamente');
  };

  const handleSettings = () => {
    Alert.alert('Funcionalidad', 'Configuración estará disponible próximamente');
  };

  const handleAbout = () => {
    Alert.alert(
      'Medical App',
      'Aplicación para monitoreo de pacientes y sensores médicos.\n\nVersión: 1.0.0\nDesarrollado con React Native y Expo'
    );
  };

  if (loading) {
    return (
      <View style={GlobalStyles.container}>
        <Header title="Perfil" />
        <Loading text="Cargando perfil..." />
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <Header title="Perfil" />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Información del usuario */}
        <Card style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons 
                name="person" 
                size={48} 
                color={Colors.textOnPrimary} 
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email}
              </Text>
              <Text style={styles.userRole}>
                {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Información de contacto */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información de Contacto</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{user?.phone || 'No registrado'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Miembro desde</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'No disponible'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Opciones del perfil */}
        <Card style={styles.optionsCard}>
          <Text style={styles.cardTitle}>Opciones</Text>

          <TouchableOpacity 
            style={styles.optionRow}
            onPress={handleEditProfile}
          >
            <Ionicons name="create" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.optionRow}
            onPress={handleChangePassword}
          >
            <Ionicons name="lock-closed" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Cambiar Contraseña</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.optionRow}
            onPress={handleSettings}
          >
            <Ionicons name="settings" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Configuración</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.optionRow}
            onPress={handleAbout}
          >
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Acerca de</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Botón de cerrar sesión */}
        <Button
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="outline"
          loading={loggingOut}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />

        {/* Espaciado inferior */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  userCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body1,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  userRole: {
    ...Typography.caption,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
  },
  optionsCard: {
    marginBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  optionText: {
    ...Typography.body1,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 44, // Alinear con el texto
  },
  logoutButton: {
    marginTop: Spacing.md,
    borderColor: Colors.error,
  },
  logoutButtonText: {
    color: Colors.error,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ProfileScreen;