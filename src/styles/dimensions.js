import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Dimensions_Screen = {
  width,
  height,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

export const ButtonSizes = {
  small: {
    height: 36,
    paddingHorizontal: 16,
  },
  medium: {
    height: 44,
    paddingHorizontal: 24,
  },
  large: {
    height: 52,
    paddingHorizontal: 32,
  },
};