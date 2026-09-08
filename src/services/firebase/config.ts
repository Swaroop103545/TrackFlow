// In a real app, this would use import { initializeApp } from 'firebase/app';
// For this MVP, we will mock the Firebase behavior if config is missing.

export const firebaseConfig = {
  // Add your config here
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const hasFirebaseConfig = !!firebaseConfig.projectId;

// Mock implementations for offline MVP
import AsyncStorage from '@react-native-async-storage/async-storage';

export const mockDb = {
  async set(collection: string, id: string, data: any) {
    const key = `@mock_${collection}_${id}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  },
  async get(collection: string, id: string) {
    const key = `@mock_${collection}_${id}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
};
