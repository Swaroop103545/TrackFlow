import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';

export const Haptics = {
  success: async () => {
    if (Platform.OS !== 'web') {
      try {
        await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not supported on this device');
      }
    }
  },
  error: async () => {
    if (Platform.OS !== 'web') {
      try {
        await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.log('Haptics not supported on this device');
      }
    }
  },
  warning: async () => {
    if (Platform.OS !== 'web') {
      try {
        await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.log('Haptics not supported on this device');
      }
    }
  },
  selection: async () => {
    if (Platform.OS !== 'web') {
      try {
        await ExpoHaptics.selectionAsync();
      } catch (error) {
        console.log('Haptics not supported on this device');
      }
    }
  }
};
