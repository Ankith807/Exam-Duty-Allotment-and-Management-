import { Dimensions, Platform, StatusBar } from 'react-native';

// Get device dimensions
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Check if device is tablet
export const isTablet = () => {
  const { width, height } = getScreenDimensions();
  const aspectRatio = height / width;
  return Math.min(width, height) >= 600 && (aspectRatio < 1.6);
};

// Check if device is phone
export const isPhone = () => !isTablet();

// Get safe area dimensions
export const getSafeAreaDimensions = () => {
  const { width, height } = getScreenDimensions();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  
  return {
    width,
    height: height - statusBarHeight,
    statusBarHeight,
  };
};

// Responsive font size
export const responsiveFontSize = (size) => {
  const { width } = getScreenDimensions();
  const baseWidth = 375; // iPhone X width as base
  const scale = width / baseWidth;
  return Math.round(size * scale);
};

// Responsive spacing
export const responsiveSpacing = (size) => {
  const { width } = getScreenDimensions();
  if (width < 375) return size * 0.9; // Small phones
  if (width > 414) return size * 1.1; // Large phones/tablets
  return size;
};

// Check if landscape mode
export const isLandscape = () => {
  const { width, height } = getScreenDimensions();
  return width > height;
};

// Get responsive padding for containers
export const getContainerPadding = () => {
  const { width } = getScreenDimensions();
  if (width < 375) return 12; // Small phones
  if (width > 768) return 24; // Tablets
  return 16; // Default phones
};

// Get responsive card margins
export const getCardMargin = () => {
  const { width } = getScreenDimensions();
  if (width < 375) return 8; // Small phones
  if (width > 768) return 16; // Tablets
  return 12; // Default phones
};

// Touch target size (minimum 44px for accessibility)
export const getTouchTargetSize = () => {
  return Math.max(44, responsiveSpacing(44));
};

// Haptic feedback utility
export const triggerHapticFeedback = (type = 'light') => {
  if (Platform.OS === 'ios') {
    const { HapticFeedback } = require('react-native');
    if (HapticFeedback) {
      switch (type) {
        case 'light':
          HapticFeedback.trigger('impactLight');
          break;
        case 'medium':
          HapticFeedback.trigger('impactMedium');
          break;
        case 'heavy':
          HapticFeedback.trigger('impactHeavy');
          break;
        case 'success':
          HapticFeedback.trigger('notificationSuccess');
          break;
        case 'warning':
          HapticFeedback.trigger('notificationWarning');
          break;
        case 'error':
          HapticFeedback.trigger('notificationError');
          break;
        default:
          HapticFeedback.trigger('selection');
      }
    }
  }
};

// Device orientation utilities
export const getOrientation = () => {
  const { width, height } = getScreenDimensions();
  return width > height ? 'landscape' : 'portrait';
};

// Responsive grid columns
export const getGridColumns = () => {
  const { width } = getScreenDimensions();
  if (width < 375) return 1; // Small phones - single column
  if (width < 768) return 2; // Phones - two columns
  if (width < 1024) return 3; // Small tablets - three columns
  return 4; // Large tablets - four columns
};

// Platform-specific styles
export const getPlatformStyles = () => {
  return {
    shadow: Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {
      elevation: 4,
    },
    borderRadius: Platform.OS === 'ios' ? 12 : 8,
  };
};

// Keyboard height utilities
export const getKeyboardHeight = () => {
  // This would typically be used with KeyboardAvoidingView
  return Platform.OS === 'ios' ? 0 : 24;
};

// Safe area insets (for devices with notches)
export const getSafeAreaInsets = () => {
  // This is a simplified version - in production, use react-native-safe-area-context
  return {
    top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
    bottom: Platform.OS === 'ios' ? 34 : 0,
    left: 0,
    right: 0,
  };
};

// Responsive breakpoints
export const breakpoints = {
  small: 375,
  medium: 768,
  large: 1024,
  xlarge: 1440,
};

// Check breakpoint
export const isBreakpoint = (breakpoint) => {
  const { width } = getScreenDimensions();
  return width >= breakpoints[breakpoint];
};

// Get responsive value based on breakpoints
export const getResponsiveValue = (values) => {
  const { width } = getScreenDimensions();
  
  if (width >= breakpoints.xlarge && values.xlarge !== undefined) return values.xlarge;
  if (width >= breakpoints.large && values.large !== undefined) return values.large;
  if (width >= breakpoints.medium && values.medium !== undefined) return values.medium;
  if (width >= breakpoints.small && values.small !== undefined) return values.small;
  
  return values.default || values.small || 0;
};

export default {
  getScreenDimensions,
  isTablet,
  isPhone,
  getSafeAreaDimensions,
  responsiveFontSize,
  responsiveSpacing,
  isLandscape,
  getContainerPadding,
  getCardMargin,
  getTouchTargetSize,
  triggerHapticFeedback,
  getOrientation,
  getGridColumns,
  getPlatformStyles,
  getKeyboardHeight,
  getSafeAreaInsets,
  breakpoints,
  isBreakpoint,
  getResponsiveValue,
};
