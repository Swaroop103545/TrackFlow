import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioTrack } from '../../types';

interface AudioState {
  tracksByProject: Record<string, AudioTrack[]>;
  activeTrackId: string | null;
  activeTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  positionMillis: number;
  durationMillis: number;
  volume: number;
  isMuted: boolean;
}

const seedAudioTracks: Record<string, AudioTrack[]> = {
  'proj_1': [
    {
      id: 'audio_101',
      projectId: 'proj_1',
      name: 'Midnight Dreams (Mix V2)',
      fileName: 'Midnight_Dreams_Mix_V2.wav',
      fileUri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      fileSize: 34580120, // 34.5 MB
      mimeType: 'audio/mpeg',
      duration: 218, // 3m 38s
      stage: 'Mixing',
      versionLabel: 'Mix V2',
      uploadedAt: Date.now() - 3600000,
    },
    {
      id: 'audio_102',
      projectId: 'proj_1',
      name: 'Lead Vocal Stem (Tuned & Dry)',
      fileName: 'Vocal_Lead_Stem_Dry.wav',
      fileUri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      fileSize: 18420000, // 18.4 MB
      mimeType: 'audio/mpeg',
      duration: 218,
      stage: 'Recording',
      versionLabel: 'Vocal Stem',
      uploadedAt: Date.now() - 86400000,
    },
  ],
  'proj_2': [
    {
      id: 'audio_201',
      projectId: 'proj_2',
      name: 'Summer Nights Acoustic Demo',
      fileName: 'Summer_Nights_Demo.mp3',
      fileUri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      fileSize: 8400000, // 8.4 MB
      mimeType: 'audio/mpeg',
      duration: 195, // 3m 15s
      stage: 'Idea',
      versionLabel: 'Demo',
      uploadedAt: Date.now() - 172800000,
    },
  ],
};

const initialState: AudioState = {
  tracksByProject: seedAudioTracks,
  activeTrackId: 'audio_101',
  activeTrack: seedAudioTracks['proj_1'][0],
  isPlaying: false,
  isLoading: false,
  positionMillis: 0,
  durationMillis: 218000,
  volume: 1.0,
  isMuted: false,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    addAudioTrack: (state, action: PayloadAction<AudioTrack>) => {
      const { projectId } = action.payload;
      if (!state.tracksByProject[projectId]) {
        state.tracksByProject[projectId] = [];
      }
      state.tracksByProject[projectId].unshift(action.payload);
      state.activeTrackId = action.payload.id;
      state.activeTrack = action.payload;
    },
    deleteAudioTrack: (
      state,
      action: PayloadAction<{ projectId: string; trackId: string }>
    ) => {
      const { projectId, trackId } = action.payload;
      if (state.tracksByProject[projectId]) {
        state.tracksByProject[projectId] = state.tracksByProject[projectId].filter(
          (t) => t.id !== trackId
        );
      }
      if (state.activeTrackId === trackId) {
        const remaining = state.tracksByProject[projectId]?.[0] || null;
        state.activeTrackId = remaining?.id || null;
        state.activeTrack = remaining;
      }
    },
    setAudioTracks: (
      state,
      action: PayloadAction<{ projectId: string; tracks: AudioTrack[] }>
    ) => {
      state.tracksByProject[action.payload.projectId] = action.payload.tracks;
    },
    setActiveTrack: (state, action: PayloadAction<AudioTrack | null>) => {
      state.activeTrack = action.payload;
      state.activeTrackId = action.payload?.id || null;
      if (action.payload?.duration) {
        state.durationMillis = action.payload.duration * 1000;
      }
      state.positionMillis = 0;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPlaybackStatus: (
      state,
      action: PayloadAction<{
        isPlaying?: boolean;
        positionMillis?: number;
        durationMillis?: number;
        isLoading?: boolean;
      }>
    ) => {
      if (action.payload.isPlaying !== undefined) state.isPlaying = action.payload.isPlaying;
      if (action.payload.positionMillis !== undefined) state.positionMillis = action.payload.positionMillis;
      if (action.payload.durationMillis !== undefined && action.payload.durationMillis > 0) {
        state.durationMillis = action.payload.durationMillis;
      }
      if (action.payload.isLoading !== undefined) state.isLoading = action.payload.isLoading;
    },
    setPositionMillis: (state, action: PayloadAction<number>) => {
      state.positionMillis = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    closePlayer: (state) => {
      state.activeTrack = null;
      state.activeTrackId = null;
      state.isPlaying = false;
      state.positionMillis = 0;
    },
  },
});

export const {
  addAudioTrack,
  deleteAudioTrack,
  setAudioTracks,
  setActiveTrack,
  setIsPlaying,
  setIsLoading,
  setPlaybackStatus,
  setPositionMillis,
  setVolume,
  toggleMute,
  closePlayer,
} = audioSlice.actions;

export default audioSlice.reducer;
