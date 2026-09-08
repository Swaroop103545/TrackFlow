import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, padding: theme.spacing.lg }]}>
      <Card style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
        <Avatar name={user?.name || 'User'} size={80} />
        <Text style={{ color: theme.colors.text, fontSize: theme.typography.size.xxl, fontWeight: theme.typography.weight.bold, marginTop: theme.spacing.md }}>
          {user?.name}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.size.md, marginTop: 4 }}>
          {user?.role}
        </Text>
      </Card>
      
      <View style={{ marginTop: theme.spacing.xl }}>
         <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>TrackFlow MVP 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
