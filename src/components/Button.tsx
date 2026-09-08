import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceLight;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.surfaceLight;
      case 'danger': return theme.colors.danger;
      case 'outline': return 'transparent';
      default: return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textMuted;
    if (variant === 'outline') return theme.colors.primary;
    return theme.colors.text;
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.md };
      case 'lg': return { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl };
      case 'md':
      default: return { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg };
    }
  };

  const borderStyle = variant === 'outline' ? {
    borderWidth: 1,
    borderColor: disabled ? theme.colors.border : theme.colors.primary,
  } : {};

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.radius.md,
          ...getPadding(),
          ...borderStyle,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: theme.typography.size[size],
                fontWeight: theme.typography.weight.medium,
                marginLeft: icon ? theme.spacing.xs : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
