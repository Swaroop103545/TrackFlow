import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play,
  Pause,
  X,
  Disc,
  RotateCcw,
  RotateCw,
  Sparkles,
  Music,
} from 'lucide-react-native';
import { RootState } from '../store/store';
import { closePlayer } from '../store/slices/audioSlice';
import { audioPlaybackService } from '../services/audioPlaybackService';
import { audioService } from '../services/audioService';
import { useTheme } from '../hooks/useTheme';
import { Haptics } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GlobalAudioPlayerBar: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const activeTrack = useSelector((state: RootState) => state.audio.activeTrack);
  const isPlaying = useSelector((state: RootState) => state.audio.isPlaying);
  const isLoading = useSelector((state: RootState) => state.audio.isLoading);
  const positionMillis = useSelector((state: RootState) => state.audio.positionMillis);
  const durationMillis = useSelector((state: RootState) => state.audio.durationMillis || 218000);
  const projects = useSelector((state: RootState) => state.projects.projects);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Spin animation when playing
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isPlaying) {
      animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      rotateAnim.stopAnimation();
    }
    return () => {
      animation?.stop();
    };
  }, [isPlaying]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!activeTrack) return null;

  const project = projects[activeTrack.projectId];
  const progressPercent = durationMillis > 0 ? Math.min(100, Math.max(0, (positionMillis / durationMillis) * 100)) : 0;

  const handleTogglePlay = () => {
    Haptics.selection();
    audioPlaybackService.togglePlay();
  };

  const handleSkipBack = () => {
    Haptics.selection();
    audioPlaybackService.skip(-10);
  };

  const handleSkipForward = () => {
    Haptics.selection();
    audioPlaybackService.skip(10);
  };

  const handleClose = async () => {
    Haptics.selection();
    await audioPlaybackService.stop();
    dispatch(closePlayer());
  };

  const handleScrub = (event: any) => {
    const touchX = event.nativeEvent.locationX;
    const barWidth = SCREEN_WIDTH - 32; // padding margin
    if (barWidth > 0 && durationMillis > 0) {
      const ratio = Math.max(0, Math.min(1, touchX / barWidth));
      const targetMillis = ratio * durationMillis;
      Haptics.selection();
      audioPlaybackService.seekTo(targetMillis);
    }
  };

  return (
    <View style={styles.floatingContainer}>
      <LinearGradient
        colors={['#1E1C38', '#2A2652']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.playerCard}
      >
        {/* Scrubber Progress Bar */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleScrub}
          style={styles.scrubberContainer}
        >
          <View style={styles.scrubberBackground}>
            <View style={[styles.scrubberFill, { width: `${progressPercent}%` }]} />
            <View style={[styles.scrubberKnob, { left: `${progressPercent}%` }]} />
          </View>
        </TouchableOpacity>

        {/* Main Player Row */}
        <View style={styles.mainRow}>
          {/* Rotating Artwork Disc */}
          <View style={styles.discContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <LinearGradient
                colors={['#6C63FF', '#8B5CF6']}
                style={styles.discGradient}
              >
                <Disc size={20} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Track Info */}
          <View style={styles.infoContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {activeTrack.name}
              </Text>
              {activeTrack.versionLabel && (
                <View style={styles.versionTag}>
                  <Text style={styles.versionText}>{activeTrack.versionLabel}</Text>
                </View>
              )}
            </View>
            <View style={styles.subRow}>
              <Text style={styles.projectName} numberOfLines={1}>
                {project?.name || 'TrackFlow Project'}
              </Text>
              <Text style={styles.timestampText}>
                {audioService.formatDuration(positionMillis / 1000)} / {audioService.formatDuration(durationMillis / 1000)}
              </Text>
            </View>
          </View>

          {/* Playback Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              onPress={handleSkipBack}
              style={styles.controlBtn}
              activeOpacity={0.7}
            >
              <RotateCcw size={16} color="rgba(255, 255, 255, 0.85)" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTogglePlay}
              style={styles.playPauseBtn}
              activeOpacity={0.8}
            >
              {isPlaying ? (
                <Pause size={18} color="#1E1C38" fill="#1E1C38" />
              ) : (
                <Play size={18} color="#1E1C38" fill="#1E1C38" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkipForward}
              style={styles.controlBtn}
              activeOpacity={0.7}
            >
              <RotateCw size={16} color="rgba(255, 255, 255, 0.85)" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={16} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 70,
    left: 12,
    right: 12,
    zIndex: 999,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  playerCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  scrubberContainer: {
    height: 12,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  scrubberBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
  },
  scrubberKnob: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginLeft: -6,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  discContainer: {
    marginRight: 10,
  },
  discGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  versionTag: {
    backgroundColor: 'rgba(108, 99, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  versionText: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '800',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  projectName: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    flexShrink: 1,
    marginRight: 6,
  },
  timestampText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    padding: 4,
  },
  playPauseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 4,
  },
});
