import { AudioTrack, WorkflowStage } from '../types';
import { store } from '../store/store';
import { addAudioTrack, deleteAudioTrack } from '../store/slices/audioSlice';
import { addActivity } from '../store/slices/notificationSlice';

let DocumentPickerModule: any = null;
try {
  DocumentPickerModule = require('expo-document-picker');
} catch (e) {
  console.log('DocumentPicker native module notice.');
}

export interface PickedAudioResult {
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
}

export const audioService = {
  /**
   * Pick an audio file from the user's device storage
   */
  pickAudioFile: async (): Promise<PickedAudioResult | null> => {
    try {
      if (!DocumentPickerModule || typeof DocumentPickerModule.getDocumentAsync !== 'function') {
        return {
          uri: 'mock_demo_track.wav',
          name: 'Demo_Track_Recording.wav',
          size: 14500000,
          mimeType: 'audio/wav',
        };
      }

      const result = await DocumentPickerModule.getDocumentAsync({
        type: [
          'audio/*',
          'audio/mpeg',
          'audio/mp3',
          'audio/wav',
          'audio/x-wav',
          'audio/m4a',
          'audio/aac',
          'audio/flac',
          'audio/aiff',
          'audio/x-aiff',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.name || 'audio_file',
          size: asset.size || 0,
          mimeType: asset.mimeType || 'audio/wav',
        };
      }
      return null;
    } catch (error) {
      console.error('Error picking audio document:', error);
      return null;
    }
  },

  /**
   * Upload / attach an audio track to a project
   */
  uploadAudioTrack: async (params: {
    projectId: string;
    name: string;
    fileUri: string;
    fileName: string;
    fileSize: number;
    mimeType?: string;
    stage?: WorkflowStage;
    versionLabel?: string;
    duration?: number;
  }): Promise<AudioTrack> => {
    const newTrack: AudioTrack = {
      id: `audio_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      projectId: params.projectId,
      name: params.name || params.fileName.replace(/\.[^/.]+$/, ''),
      fileUri: params.fileUri,
      fileName: params.fileName,
      fileSize: params.fileSize,
      mimeType: params.mimeType || 'audio/wav',
      duration: params.duration || 180 + Math.floor(Math.random() * 60), // mock estimated duration if undefined
      stage: params.stage || 'Mixing',
      versionLabel: params.versionLabel || 'V1',
      uploadedAt: Date.now(),
    };

    // Save into Redux state
    store.dispatch(addAudioTrack(newTrack));

    // Log Activity
    store.dispatch(
      addActivity({
        id: `act_${Date.now()}`,
        projectId: params.projectId,
        userId: 'user_1',
        type: 'COMMENT_ADDED',
        message: `Uploaded new audio track "${newTrack.name}" (${newTrack.versionLabel})`,
        createdAt: Date.now(),
      })
    );

    return newTrack;
  },

  /**
   * Delete an audio track
   */
  removeAudioTrack: async (projectId: string, trackId: string) => {
    store.dispatch(deleteAudioTrack({ projectId, trackId }));
  },

  /**
   * Format bytes to human readable string (e.g. 14.5 MB)
   */
  formatFileSize: (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  /**
   * Format seconds to M:SS (e.g. 3:38)
   */
  formatDuration: (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  },
};
