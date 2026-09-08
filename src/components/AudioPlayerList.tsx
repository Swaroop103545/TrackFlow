import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Play,
  Pause,
  Music,
  Trash2,
  Share2,
  Upload,
  Layers,
  Sparkles,
  FileAudio,
} from 'lucide-react-native';
import { RootState } from '../store/store';
import { audioPlaybackService } from '../services/audioPlaybackService';
import { audioService } from '../services/audioService';
import { Haptics } from '../utils/haptics';
import { useTheme } from '../hooks/useTheme';
import { AudioTrack } from '../types';

interface AudioPlayerListProps {
  projectId: string;
  onOpenUploadModal: () => void;
}

export const AudioPlayerList: React.FC<AudioPlayerListProps> = ({
  projectId,
  onOpenUploadModal,
}) => {
  const { theme } = useTheme();

  const tracks = useSelector(
    (state: RootState) => state.audio.tracksByProject[projectId] || []
  );
  const activeTrackId = useSelector((state: RootState) => state.audio.activeTrackId);
  const isPlaying = useSelector((state: RootState) => state.audio.isPlaying);
  const positionMillis = useSelector((state: RootState) => state.audio.positionMillis);
  const durationMillis = useSelector((state: RootState) => state.audio.durationMillis || 218000);

  const handleTogglePlay = async (track: AudioTrack) => {
    Haptics.selection();
    await audioPlaybackService.loadAndPlayTrack(track);
  };

  const handleDelete = (track: AudioTrack) => {
    Haptics.selection();
    Alert.alert(
      'Delete Audio Track',
      `Are you sure you want to remove "${track.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.success();
            await audioService.removeAudioTrack(projectId, track.id);
          },
        },
      ]
    );
  };

  const numBars = 18;
  const barHeights = [30, 75, 45, 90, 60, 100, 80, 50, 85, 95, 65, 45, 70, 55, 35, 60, 40, 25];

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Audio Tracks & Stems
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{tracks.length}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onOpenUploadModal}
          style={styles.addTrackBtn}
          activeOpacity={0.8}
        >
          <Upload size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
          <Text style={styles.addTrackBtnText}>Upload Audio</Text>
        </TouchableOpacity>
      </View>

      {/* Track List */}
      {tracks.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.emptyIconCircle}>
            <FileAudio size={28} color={theme.colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Audio Tracks Uploaded
          </Text>
          <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
            Upload scratch demos, vocal stems, or mix revisions for collaboration.
          </Text>
          <TouchableOpacity
            onPress={onOpenUploadModal}
            style={styles.emptyActionBtn}
            activeOpacity={0.8}
          >
            <Upload size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyActionText}>Upload First Track</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {tracks.map((track) => {
            const isActive = activeTrackId === track.id;
            const isThisPlaying = isActive && isPlaying;
            const progressRatio = durationMillis > 0 ? Math.max(0, Math.min(1, positionMillis / durationMillis)) : 0;
            const activeBars = Math.round(progressRatio * numBars);

            return (
              <View
                key={track.id}
                style={[
                  styles.trackCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                {/* Play Button */}
                <TouchableOpacity
                  onPress={() => handleTogglePlay(track)}
                  style={[
                    styles.playBtn,
                    {
                      backgroundColor: isThisPlaying
                        ? theme.colors.primary
                        : 'rgba(108, 99, 255, 0.1)',
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  {isThisPlaying ? (
                    <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play
                      size={18}
                      color={theme.colors.primary}
                      fill={isActive ? theme.colors.primary : 'transparent'}
                    />
                  )}
                </TouchableOpacity>

                {/* Track Details */}
                <View style={styles.trackContent}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[styles.trackName, { color: theme.colors.text }]}
                      numberOfLines={1}
                    >
                      {track.name}
                    </Text>

                    {track.versionLabel && (
                      <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>{track.versionLabel}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.trackMeta, { color: theme.colors.textSecondary }]}>
                    {track.stage} • {audioService.formatDuration(track.duration)} •{' '}
                    {audioService.formatFileSize(track.fileSize)}
                  </Text>

                  {/* Dynamic Waveform Visualizer */}
                  {isActive && (
                    <View style={styles.waveformContainer}>
                      <View style={styles.waveformRow}>
                        {barHeights.map((h, idx) => {
                          const isBarActive = idx < activeBars;
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.waveformBar,
                                {
                                  height: (h / 100) * 18,
                                  backgroundColor: isBarActive
                                    ? theme.colors.primary
                                    : '#E2E4E9',
                                },
                              ]}
                            />
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsColumn}>
                  <TouchableOpacity
                    onPress={() => handleDelete(track)}
                    style={styles.iconBtn}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#FF4D4F" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
  },
  addTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  addTrackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    gap: 10,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  versionBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6C63FF',
  },
  trackMeta: {
    fontSize: 12,
    marginTop: 3,
  },
  waveformContainer: {
    marginTop: 8,
    height: 22,
    justifyContent: 'center',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  actionsColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconBtn: {
    padding: 6,
  },
});
