import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing, IconSizes } from '../../styles/dimensions';

const Header = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  backgroundColor = Colors.primary,
  textColor = Colors.textOnPrimary,
  showBackButton = false,
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor,
        paddingTop: insets.top + Spacing.sm,
      },
      style
    ]}>
      <StatusBar 
        backgroundColor={backgroundColor} 
        barStyle="light-content" 
      />
      
      <View style={styles.content}>
        {/* Botón izquierdo */}
        <View style={styles.leftSection}>
          {(showBackButton || leftIcon || onLeftPress) && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onLeftPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={leftIcon || (showBackButton ? 'arrow-back' : 'menu')}
                size={IconSizes.md}
                color={textColor}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Título y subtítulo */}
        <View style={styles.centerSection}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Botón derecho */}
        <View style={styles.rightSection}>
          {(rightIcon || onRightPress) && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={rightIcon || 'ellipsis-vertical'}
                size={IconSizes.md}
                color={textColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    minHeight: 56,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: Spacing.xs,
    borderRadius: 20,
  },
  title: {
    ...Typography.h5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 2,
  },
});

export default Header;