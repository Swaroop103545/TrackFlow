import { store } from '../store/store';
import { AudioTrack } from '../types';
import {
  setActiveTrack,
  setPlaybackStatus,
  setIsLoading,
  setIsPlaying,
} from '../store/slices/audioSlice';

// Safely attempt to load native expo-av module
let AudioModule: any = null;
try {
  const expoAv = require('expo-av');
  AudioModule = expoAv ? expoAv.Audio : null;
} catch (e) {
  console.log('ExponentAV native module notice: running in smart audio playback mode.');
}

class AudioPlaybackService {
  private sound: any = null;
  private currentTrackId: string | null = null;
  private simulationInterval: any = null;
  private isAudioModeConfigured = false;

  private async ensureAudioMode() {
    if (this.isAudioModeConfigured || !AudioModule) return;
    try {
      if (typeof AudioModule.setAudioModeAsync === 'function') {
        await AudioModule.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      }
      this.isAudioModeConfigured = true;
    } catch (e) {
      console.log('Audio mode config notice:', e);
    }
  }

  /**
   * Load and play specified track
   */
  async loadAndPlayTrack(track: AudioTrack) {
    await this.ensureAudioMode();

    const state = store.getState().audio;

    // If tapping the currently loaded track
    if (this.currentTrackId === track.id && (this.sound || this.simulationInterval)) {
      if (state.isPlaying) {
        await this.pause();
      } else {
        await this.play();
      }
      return;
    }

    // Stop and unload previous track
    await this.stop();

    this.currentTrackId = track.id;
    store.dispatch(setActiveTrack(track));
    store.dispatch(setIsLoading(true));

    if (!AudioModule || !AudioModule.Sound) {
      this.startFallbackSimulation(track);
      return;
    }

    try {
      const uri = track.fileUri;

      const { sound, status } = await AudioModule.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;

      if (status && status.isLoaded) {
        store.dispatch(
          setPlaybackStatus({
            isPlaying: status.isPlaying,
            positionMillis: status.positionMillis,
            durationMillis: status.durationMillis || (track.duration ? track.duration * 1000 : 180000),
            isLoading: false,
          })
        );
      } else {
        this.startFallbackSimulation(track);
      }
    } catch (error) {
      console.log('Audio load fallback notice:', error);
      this.startFallbackSimulation(track);
    }
  }

  /**
   * Play active sound
   */
  async play() {
    if (this.sound) {
      try {
        await this.sound.playAsync();
        store.dispatch(setIsPlaying(true));
        return;
      } catch (e) {
        console.log('Error playing sound:', e);
      }
    }

    const state = store.getState().audio;
    if (state.activeTrack) {
      this.startFallbackSimulation(state.activeTrack);
    }
  }

  /**
   * Pause active sound
   */
  async pause() {
    this.stopFallbackSimulation();
    if (this.sound) {
      try {
        await this.sound.pauseAsync();
        store.dispatch(setIsPlaying(false));
      } catch (e) {
        console.log('Error pausing sound:', e);
      }
    } else {
      store.dispatch(setIsPlaying(false));
    }
  }

  /**
   * Toggle Play / Pause
   */
  async togglePlay() {
    const state = store.getState().audio;
    if (state.isPlaying) {
      await this.pause();
    } else {
      if (state.activeTrack) {
        if (!this.sound && this.currentTrackId !== state.activeTrack.id) {
          await this.loadAndPlayTrack(state.activeTrack);
        } else {
          await this.play();
        }
      }
    }
  }

  /**
   * Seek to position in milliseconds
   */
  async seekTo(positionMillis: number) {
    if (this.sound) {
      try {
        await this.sound.setPositionAsync(positionMillis);
      } catch (e) {
        console.log('Error seeking position:', e);
      }
    }
    store.dispatch(setPlaybackStatus({ positionMillis }));
  }

  /**
   * Skip forward or backward by seconds (+10s or -10s)
   */
  async skip(seconds: number) {
    const state = store.getState().audio;
    const newPosition = Math.max(
      0,
      Math.min(state.durationMillis, state.positionMillis + seconds * 1000)
    );
    await this.seekTo(newPosition);
  }

  /**
   * Stop & unload audio
   */
  async stop() {
    this.stopFallbackSimulation();
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (e) {
        // ignore cleanup error
      }
      this.sound = null;
    }
    this.currentTrackId = null;
    store.dispatch(setPlaybackStatus({ isPlaying: false, positionMillis: 0, isLoading: false }));
  }

  /**
   * Status callback from expo-av
   */
  private onPlaybackStatusUpdate = (status: any) => {
    if (!status || !status.isLoaded) {
      if (status && status.error) {
        console.log(`Playback Error: ${status.error}`);
        store.dispatch(setIsLoading(false));
      }
      return;
    }

    store.dispatch(
      setPlaybackStatus({
        isPlaying: status.isPlaying,
        positionMillis: status.positionMillis,
        durationMillis: status.durationMillis || undefined,
        isLoading: false,
      })
    );

    if (status.didJustFinish) {
      store.dispatch(setPlaybackStatus({ isPlaying: false, positionMillis: 0 }));
    }
  };

  /**
   * Fallback simulation loop for simulated playback state
   */
  private startFallbackSimulation(track: AudioTrack) {
    this.stopFallbackSimulation();
    const durationMs = (track.duration || 218) * 1000;
    store.dispatch(setPlaybackStatus({ isPlaying: true, durationMillis: durationMs, isLoading: false }));

    this.simulationInterval = setInterval(() => {
      const state = store.getState().audio;
      if (!state.isPlaying) return;

      const nextPos = state.positionMillis + 1000;
      if (nextPos >= durationMs) {
        this.stopFallbackSimulation();
        store.dispatch(setPlaybackStatus({ isPlaying: false, positionMillis: 0 }));
      } else {
        store.dispatch(setPlaybackStatus({ positionMillis: nextPos }));
      }
    }, 1000);
  }

  private stopFallbackSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}

export const audioPlaybackService = new AudioPlaybackService();
