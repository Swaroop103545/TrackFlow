import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar = ({ name, size = 40 }: AvatarProps) => {
  const { theme } = useTheme();
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.primaryLight,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: theme.colors.background,
            fontSize: size * 0.4,
            fontWeight: theme.typography.weight.bold,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
