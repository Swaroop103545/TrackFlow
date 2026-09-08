import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Music,
  Check,
  Tag,
  Layers,
  Sparkles,
  FileCheck,
  RefreshCw,
  Upload,
} from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { WorkflowStage } from '../types';
import { audioService, PickedAudioResult } from '../services/audioService';
import { Haptics } from '../utils/haptics';

interface AudioUploadModalProps {
  visible: boolean;
  projectId: string;
  initialStage?: WorkflowStage;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

const VERSION_PRESETS = ['Demo', 'Rough Mix', 'Vocal Stem', 'Mix V1', 'Mix V2', 'Master WAV'];
const STAGE_PRESETS: WorkflowStage[] = ['Idea', 'Recording', 'Editing', 'Mixing', 'Mastering'];

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  visible,
  projectId,
  initialStage = 'Mixing',
  onClose,
  onUploadSuccess,
}) => {
  const { theme } = useTheme();

  const [selectedFile, setSelectedFile] = useState<PickedAudioResult | null>(null);
  const [trackName, setTrackName] = useState('');
  const [versionLabel, setVersionLabel] = useState('Mix V1');
  const [stage, setStage] = useState<WorkflowStage>(initialStage);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      setStage(initialStage);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [visible, initialStage]);

  const handlePickFile = async () => {
    Haptics.selection();
    const result = await audioService.pickAudioFile();
    if (result) {
      setSelectedFile(result);
      // Auto pre-fill track name if empty
      const cleanName = result.name.replace(/\.[^/.]+$/, '').replace(/[_]/g, ' ');
      if (!trackName) {
        setTrackName(cleanName);
      }
      Haptics.success();
    }
  };

  const handleResetFile = () => {
    Haptics.selection();
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Audio File Required', 'Please select an audio file to upload.');
      return;
    }

    if (!trackName.trim()) {
      Alert.alert('Track Name Required', 'Please enter a name for this audio track.');
      return;
    }

    Haptics.selection();
    setIsUploading(true);
    setUploadProgress(15);

    // Simulate smooth upload progress
    const timer1 = setTimeout(() => setUploadProgress(50), 300);
    const timer2 = setTimeout(() => setUploadProgress(85), 600);

    setTimeout(async () => {
      setUploadProgress(100);
      try {
        await audioService.uploadAudioTrack({
          projectId,
          name: trackName.trim(),
          fileUri: selectedFile.uri,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.mimeType,
          stage,
          versionLabel,
        });

        Haptics.success();
        setIsUploading(false);
        // Reset modal state
        setSelectedFile(null);
        setTrackName('');
        onUploadSuccess?.();
        onClose();
      } catch (error) {
        Haptics.error();
        setIsUploading(false);
        Alert.alert('Upload Failed', 'Could not process audio track. Please try again.');
      }
    }, 900);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.headerIconBox, { backgroundColor: 'rgba(108, 99, 255, 0.12)' }]}>
                <Upload size={20} color={theme.colors.primary} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Upload Audio Track</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Add stems, demos, or mixes to project
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isUploading}
              style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceLight }]}
            >
              <X size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            {/* Step 1: File Selector Box */}
            <View style={styles.sectionGroup}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
                1. Select Audio File <Text style={styles.required}>*</Text>
              </Text>

              {!selectedFile ? (
                <TouchableOpacity
                  onPress={handlePickFile}
                  activeOpacity={0.8}
                  style={[
                    styles.dropZone,
                    {
                      borderColor: theme.colors.primary,
                      backgroundColor: 'rgba(108, 99, 255, 0.04)',
                    },
                  ]}
                >
                  <View style={styles.dropZoneIconCircle}>
                    <Music size={26} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.dropZoneTitle, { color: theme.colors.text }]}>
                    Choose Audio File
                  </Text>
                  <Text style={[styles.dropZoneSub, { color: theme.colors.textMuted }]}>
                    WAV, MP3, M4A, FLAC, AIFF up to 100MB
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.selectedFileBox,
                    {
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                >
                  <View style={styles.fileIconBadge}>
                    <FileCheck size={22} color="#4CAF50" />
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <Text style={[styles.fileMeta, { color: theme.colors.textSecondary }]}>
                      {audioService.formatFileSize(selectedFile.size)} • {selectedFile.mimeType || 'Audio'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleResetFile}
                    style={styles.changeFileBtn}
                    activeOpacity={0.7}
                  >
                    <RefreshCw size={16} color={theme.colors.primary} />
                    <Text style={[styles.changeFileText, { color: theme.colors.primary }]}>Change</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Step 2: Track Details */}
            <View style={styles.sectionGroup}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
                2. Track Title <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                <Music size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="e.g. Midnight Dreams Mix V2"
                  placeholderTextColor={theme.colors.textMuted}
                  value={trackName}
                  onChangeText={setTrackName}
                />
              </View>
            </View>

            {/* Step 3: Version Label */}
            <View style={styles.sectionGroup}>
              <View style={styles.labelWithIcon}>
                <Tag size={15} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Version Tag</Text>
              </View>
              <View style={styles.chipsRow}>
                {VERSION_PRESETS.map((ver) => {
                  const isSelected = versionLabel === ver;
                  return (
                    <TouchableOpacity
                      key={ver}
                      onPress={() => {
                        Haptics.selection();
                        setVersionLabel(ver);
                      }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surfaceLight,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary },
                        ]}
                      >
                        {ver}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Step 4: Workflow Stage */}
            <View style={styles.sectionGroup}>
              <View style={styles.labelWithIcon}>
                <Layers size={15} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
                  Associated Stage
                </Text>
              </View>
              <View style={styles.chipsRow}>
                {STAGE_PRESETS.map((stg) => {
                  const isSelected = stage === stg;
                  return (
                    <TouchableOpacity
                      key={stg}
                      onPress={() => {
                        Haptics.selection();
                        setStage(stg);
                      }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(108, 99, 255, 0.15)'
                            : theme.colors.surfaceLight,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {stg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Simulated Upload Progress Bar */}
            {isUploading && (
              <View style={styles.progressBox}>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressText, { color: theme.colors.text }]}>
                    Processing & Uploading Track...
                  </Text>
                  <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>
                    {uploadProgress}%
                  </Text>
                </View>
                <View style={[styles.progressBarTrack, { backgroundColor: theme.colors.surfaceLight }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${uploadProgress}%`, backgroundColor: theme.colors.primary },
                    ]}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleUpload}
              disabled={isUploading}
              activeOpacity={0.85}
              style={styles.submitBtn}
            >
              <LinearGradient
                colors={['#6C63FF', '#5A51E6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Check size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>Upload Track</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionGroup: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  required: {
    color: '#F44336',
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dropZoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  dropZoneSub: {
    fontSize: 12,
  },
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  fileIconBadge: {
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  fileMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  changeFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
  },
  changeFileText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.06)',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradientBtn: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
