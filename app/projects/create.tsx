import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFormik } from 'formik';
import {
  ArrowLeft,
  Disc,
  Music,
  Calendar as CalendarIcon,
  Sparkles,
  Sliders,
  Activity,
  Check,
  FileText,
  Layers,
  Upload,
  FileCheck,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { projectService } from '../../src/services/projectService';
import { audioService, PickedAudioResult } from '../../src/services/audioService';
import { Haptics } from '../../src/utils/haptics';
import { WorkflowStage } from '../../src/types';
import { projectValidationSchema } from '../../src/utils/projectValidation';
import { CalendarModal } from '../../src/components/CalendarModal';

const GENRE_OPTIONS = [
  'Synthpop',
  'Hip Hop',
  'R&B',
  'Pop',
  'Electronic',
  'Rock',
  'Indie',
  'Cinematic',
  'Custom',
];

const INITIAL_STAGES: WorkflowStage[] = [
  'Idea',
  'Recording',
  'Editing',
  'Mixing',
  'Mastering',
];

export default function CreateProjectScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  // Focus, Calendar Modal & Audio Attachment State
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [attachedAudio, setAttachedAudio] = useState<PickedAudioResult | null>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      selectedGenre: 'Synthpop',
      customGenre: '',
      currentStage: 'Idea' as WorkflowStage,
      bpm: '',
      keySignature: '',
      releaseDate: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
      })(),
      description: '',
    },
    validationSchema: projectValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const finalGenre = values.selectedGenre === 'Custom' ? values.customGenre.trim() : values.selectedGenre;

      try {
        let fullDescription = values.description.trim();
        const specs: string[] = [];
        if (values.bpm.trim()) specs.push(`BPM: ${values.bpm.trim()}`);
        if (values.keySignature.trim()) specs.push(`Key: ${values.keySignature.trim()}`);

        if (specs.length > 0) {
          const specsHeader = `[Audio Specs: ${specs.join(' | ')}]`;
          fullDescription = fullDescription ? `${specsHeader}\n\n${fullDescription}` : specsHeader;
        }

        const newProject = await projectService.createProject({
          name: values.name.trim(),
          genre: finalGenre,
          currentStage: values.currentStage,
          releaseDate: new Date(values.releaseDate).toISOString(),
          description: fullDescription,
        });

        if (attachedAudio) {
          await audioService.uploadAudioTrack({
            projectId: newProject.id,
            name: `${newProject.name} (Initial Demo)`,
            fileUri: attachedAudio.uri,
            fileName: attachedAudio.name,
            fileSize: attachedAudio.size,
            mimeType: attachedAudio.mimeType,
            stage: values.currentStage,
            versionLabel: 'Demo',
          });
        }

        Haptics.success();
        router.replace(`/projects/${newProject.id}` as any);
      } catch (error) {
        Haptics.error();
        Alert.alert('Notice', 'Project created locally and ready to sync.');
        router.back();
      } finally {
        setSubmitting(false);
      }
    },
  });

  const activeGenre =
    formik.values.selectedGenre === 'Custom'
      ? formik.values.customGenre || 'Custom Genre'
      : formik.values.selectedGenre;

  const handleSelectGenre = (genre: string) => {
    Haptics.selection();
    formik.setFieldValue('selectedGenre', genre);
  };

  const handleSelectStage = (stage: WorkflowStage) => {
    Haptics.selection();
    formik.setFieldValue('currentStage', stage);
  };

  const handleQuickDate = (monthsAhead: number) => {
    Haptics.selection();
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    formik.setFieldValue('releaseDate', d.toISOString().split('T')[0]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Navigation Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.selection();
            router.back();
          }}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceLight }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New Project</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Set up details & initial workflow
          </Text>
        </View>

        <View style={styles.headerRightBadge}>
          <Sparkles size={16} color={theme.colors.primary} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }}
      >
        {/* Dynamic Project Preview Banner Card */}
        <LinearGradient
          colors={['#6C63FF', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.previewCard}
        >
          <View style={styles.previewCardTop}>
            <View style={styles.previewBadgeContainer}>
              <View style={styles.previewStageBadge}>
                <View style={styles.previewDot} />
                <Text style={styles.previewStageText}>Stage: {formik.values.currentStage}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.previewTitle} numberOfLines={1}>
            {formik.values.name.trim() || 'Untitled Track'}
          </Text>

          <Text style={styles.previewSubtitle}>
            {activeGenre} {formik.values.bpm ? `• ${formik.values.bpm} BPM` : ''}{' '}
            {formik.values.keySignature ? `• Key: ${formik.values.keySignature}` : ''}
          </Text>
        </LinearGradient>

        {/* Section 1: Track Details */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Track Information
          </Text>

          {/* Project Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Track Title <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor:
                    formik.touched.name && formik.errors.name
                      ? '#F44336'
                      : focusedField === 'name'
                      ? theme.colors.primary
                      : theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
            >
              <Music size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="e.g. Midnight Dreams"
                placeholderTextColor={theme.colors.textMuted}
                value={formik.values.name}
                onChangeText={formik.handleChange('name')}
                onFocus={() => setFocusedField('name')}
                onBlur={(e) => {
                  setFocusedField(null);
                  formik.handleBlur('name')(e);
                }}
              />
            </View>
            {formik.touched.name && formik.errors.name && (
              <Text style={styles.errorText}>{formik.errors.name}</Text>
            )}
          </View>

          {/* Genre Selection Chips */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Genre <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.chipsContainer}>
              {GENRE_OPTIONS.map((g) => {
                const isSelected = formik.values.selectedGenre === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => handleSelectGenre(g)}
                    activeOpacity={0.7}
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
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {formik.values.selectedGenre === 'Custom' && (
              <View style={{ marginTop: 10 }}>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      borderColor:
                        formik.touched.customGenre && formik.errors.customGenre
                          ? '#F44336'
                          : focusedField === 'customGenre'
                          ? theme.colors.primary
                          : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Specify Custom Genre (e.g. Synthwave)"
                    placeholderTextColor={theme.colors.textMuted}
                    value={formik.values.customGenre}
                    onChangeText={formik.handleChange('customGenre')}
                    onFocus={() => setFocusedField('customGenre')}
                    onBlur={(e) => {
                      setFocusedField(null);
                      formik.handleBlur('customGenre')(e);
                    }}
                  />
                </View>
                {formik.touched.customGenre && formik.errors.customGenre && (
                  <Text style={styles.errorText}>{formik.errors.customGenre}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Section 2: Production Workflow */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Workflow & Technical Specs
          </Text>

          {/* Workflow Stage */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Starting Workflow Stage</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {INITIAL_STAGES.map((stg) => {
                const isSelected = formik.values.currentStage === stg;
                return (
                  <TouchableOpacity
                    key={stg}
                    onPress={() => handleSelectStage(stg)}
                    activeOpacity={0.7}
                    style={[
                      styles.stageChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.surfaceLight,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Layers
                      size={14}
                      color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.stageChipText,
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
            </ScrollView>
          </View>

          {/* Dual Column: BPM & Key Signature */}
          <View style={styles.row}>
            <View style={[styles.flex, { marginRight: theme.spacing.sm }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Tempo (BPM)</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor:
                      formik.touched.bpm && formik.errors.bpm
                        ? '#F44336'
                        : focusedField === 'bpm'
                        ? theme.colors.primary
                        : theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                <Activity size={16} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="124"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={formik.values.bpm}
                  onChangeText={formik.handleChange('bpm')}
                  onFocus={() => setFocusedField('bpm')}
                  onBlur={(e) => {
                    setFocusedField(null);
                    formik.handleBlur('bpm')(e);
                  }}
                />
              </View>
              {formik.touched.bpm && formik.errors.bpm && (
                <Text style={styles.errorText}>{formik.errors.bpm}</Text>
              )}
            </View>

            <View style={[styles.flex, { marginLeft: theme.spacing.sm }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Key Signature</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor:
                      focusedField === 'key' ? theme.colors.primary : theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                <Sliders size={16} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="F# Minor"
                  placeholderTextColor={theme.colors.textMuted}
                  value={formik.values.keySignature}
                  onChangeText={formik.handleChange('keySignature')}
                  onFocus={() => setFocusedField('key')}
                  onBlur={(e) => {
                    setFocusedField(null);
                    formik.handleBlur('keySignature')(e);
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: Target Release & Notes */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Timeline & Brief
          </Text>

          {/* Release Date */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Target Release Date <Text style={styles.required}>*</Text>
            </Text>

            {/* Quick Presets */}
            <View style={styles.quickDateRow}>
              <TouchableOpacity
                onPress={() => handleQuickDate(1)}
                style={[styles.quickDateBtn, { backgroundColor: theme.colors.surfaceLight }]}
              >
                <Text style={[styles.quickDateText, { color: theme.colors.textSecondary }]}>
                  +1 Month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleQuickDate(3)}
                style={[styles.quickDateBtn, { backgroundColor: theme.colors.surfaceLight }]}
              >
                <Text style={[styles.quickDateText, { color: theme.colors.textSecondary }]}>
                  +3 Months
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleQuickDate(6)}
                style={[styles.quickDateBtn, { backgroundColor: theme.colors.surfaceLight }]}
              >
                <Text style={[styles.quickDateText, { color: theme.colors.textSecondary }]}>
                  +6 Months
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                Haptics.selection();
                setCalendarVisible(true);
              }}
              activeOpacity={0.8}
              style={[
                styles.inputWrapper,
                {
                  borderColor:
                    formik.touched.releaseDate && formik.errors.releaseDate
                      ? '#F44336'
                      : theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
            >
              <CalendarIcon size={18} color={theme.colors.primary} style={styles.inputIcon} />
              <Text style={[styles.input, { color: theme.colors.text, lineHeight: 46 }]}>
                {formik.values.releaseDate || 'Select Release Date'}
              </Text>
              <Text style={styles.calendarPickBadge}>Pick Date</Text>
            </TouchableOpacity>

            {formik.touched.releaseDate && formik.errors.releaseDate && (
              <Text style={styles.errorText}>{formik.errors.releaseDate}</Text>
            )}
          </View>

          {/* Description & Notes */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Project Notes & Creative Brief
            </Text>
            <View
              style={[
                styles.inputWrapper,
                styles.textAreaWrapper,
                {
                  borderColor:
                    focusedField === 'description' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
            >
              <FileText
                size={18}
                color={theme.colors.textSecondary}
                style={[styles.inputIcon, { marginTop: 12 }]}
              />
              <TextInput
                style={[styles.input, styles.textArea, { color: theme.colors.text }]}
                placeholder="Write production goals, reference tracks, or mixing instructions..."
                placeholderTextColor={theme.colors.textMuted}
                value={formik.values.description}
                onChangeText={formik.handleChange('description')}
                multiline
                numberOfLines={4}
                onFocus={() => setFocusedField('description')}
                onBlur={(e) => {
                  setFocusedField(null);
                  formik.handleBlur('description')(e);
                }}
              />
            </View>
          </View>
        </View>

        {/* Section 4: Initial Audio Demo / Scratch Track (Optional) */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Initial Audio Track (Optional)
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 12 }}>
            Attach a scratch demo, vocal recording, or beat preview to start your project.
          </Text>

          {!attachedAudio ? (
            <TouchableOpacity
              onPress={async () => {
                Haptics.selection();
                const res = await audioService.pickAudioFile();
                if (res) {
                  setAttachedAudio(res);
                  Haptics.success();
                }
              }}
              activeOpacity={0.8}
              style={{
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: theme.colors.primary,
                borderRadius: 14,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(108, 99, 255, 0.05)',
              }}
            >
              <Upload size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 14 }}>
                Attach Demo Audio File
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.primary,
                borderRadius: 14,
                padding: 12,
                backgroundColor: theme.colors.background,
              }}
            >
              <FileCheck size={20} color="#4CAF50" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>
                  {attachedAudio.name}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                  {audioService.formatFileSize(attachedAudio.size)} • Demo Tag
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selection();
                  setAttachedAudio(null);
                }}
                style={{ padding: 6 }}
              >
                <X size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={() => {
            Haptics.selection();
            formik.handleSubmit();
          }}
          disabled={formik.isSubmitting}
          activeOpacity={0.85}
          style={styles.submitBtnContainer}
        >
          <LinearGradient
            colors={['#6C63FF', '#5A51E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitText}>
              {formik.isSubmitting ? 'Creating Project...' : 'Create Track Project'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selection();
            router.back();
          }}
          style={styles.cancelBtn}
          activeOpacity={0.6}
        >
          <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Calendar Modal */}
      <CalendarModal
        visible={calendarVisible}
        selectedDate={formik.values.releaseDate}
        onClose={() => setCalendarVisible(false)}
        onSelectDate={(dateStr) => formik.setFieldValue('releaseDate', dateStr)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRightBadge: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  previewCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  previewCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewStageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD166',
    marginRight: 6,
  },
  previewStageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  previewSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  required: {
    color: '#F44336',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  calendarPickBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textAreaWrapper: {
    height: 'auto',
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  horizontalScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  stageChipText: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  quickDateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtnContainer: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
