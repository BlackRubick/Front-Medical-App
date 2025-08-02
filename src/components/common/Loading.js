import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/dimensions';

const Loading = ({
  size = 'large',
  color = Colors.primary,
  text,
  overlay = false,
  style,
  ...props
}) => {
  const containerStyle = overlay ? [styles.overlay, style] : [styles.container, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator 
        size={size} 
        color={color} 
        {...props}
      />
      {text && (
        <Text style={[styles.text, { color }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  text: {
    ...Typography.body2,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});

export default Loading;