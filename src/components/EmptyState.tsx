import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionTitle,
  onAction,
}: EmptyStateProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { padding: theme.spacing.xl }]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.colors.surfaceLight,
            padding: theme.spacing.lg,
            borderRadius: theme.radius.full,
            marginBottom: theme.spacing.lg,
          },
        ]}
      >
        <Icon color={theme.colors.primary} size={48} />
      </View>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weight.bold,
            marginBottom: theme.spacing.sm,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.size.md,
            lineHeight: theme.typography.lineHeight.md,
            marginBottom: theme.spacing.xl,
          },
        ]}
      >
        {description}
      </Text>
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} size="lg" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});
