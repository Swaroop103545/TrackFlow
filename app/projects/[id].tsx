import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import { useTheme } from '../../src/hooks/useTheme';
import { taskService } from '../../src/services/taskService';
import { WorkflowStage } from '../../src/types';
import { Haptics } from '../../src/utils/haptics';
import {
  ArrowLeft,
  Users,
  Settings,
  Disc,
  Play,
  Calendar,
  ArrowRight,
  Check,
  ChevronDown,
  Mic,
  Send,
  Download,
} from 'lucide-react-native';

const CORE_STAGES: WorkflowStage[] = ['Idea', 'Recording', 'Editing', 'Mixing', 'Mastering'];

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();

  const project = useSelector((state: RootState) => state.projects.projects[id]);
  const allTasks = useSelector((state: RootState) => Object.values(state.tasks.tasks));
  const projectTasks = allTasks.filter((t) => t.projectId === id);

  const [activeStage, setActiveStage] = useState<WorkflowStage>(() => {
    return project?.currentStage || 'Mixing';
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  if (!project) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>Project not found.</Text>
      </View>
    );
  }

  // Parse BPM & Key from description if available
  const getAudioSpecs = () => {
    let bpm = '124 BPM';
    let keySig = 'Key: F# Minor';

    if (project.description) {
      const bpmMatch = project.description.match(/BPM:\s*(\d+)/i);
      if (bpmMatch) bpm = `${bpmMatch[1]} BPM`;

      const keyMatch = project.description.match(/Key:\s*([^|\n\]]+)/i);
      if (keyMatch) keySig = `Key: ${keyMatch[1].trim()}`;
    }

    return { bpm, keySig };
  };

  const { bpm, keySig } = getAudioSpecs();

  const stageIndex = CORE_STAGES.indexOf(activeStage) >= 0
    ? CORE_STAGES.indexOf(activeStage) + 1
    : 3;

  const currentStageTasks = projectTasks.filter((t) => t.stage === activeStage);
  const completedCount = currentStageTasks.filter((t) => t.completed).length;
  const totalCount = currentStageTasks.length;

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      Haptics.success();
    } else {
      Haptics.selection();
    }
    await taskService.toggleTask(taskId);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    Haptics.success();
    await taskService.addTask({
      projectId: project.id,
      title: newTaskTitle.trim(),
      stage: activeStage,
      assignedTo: 'Alex',
    });
    setNewTaskTitle('');
  };

  const handleOpenDAW = () => {
    Haptics.selection();
    Alert.alert('DAW Sync', `Connected to Ableton Live / Logic Pro for "${project.name}"`);
  };

  // Generate waveform bars based on progress (0-100%)
  const numBars = 16;
  const activeBarsCount = Math.round((project.progress / 100) * numBars);
  const barHeights = [40, 75, 45, 90, 60, 100, 80, 50, 85, 95, 65, 45, 70, 55, 35, 20];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: '#F6F7FB' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Navigation Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selection();
            router.back();
          }}
          style={styles.circleBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#2D3142" />
        </TouchableOpacity>

        <View style={styles.dawSyncBadge}>
          <View style={styles.dawDot} />
          <Text style={styles.dawSyncText}>DAW SYNC LIVE</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.circleBtn, { marginRight: 8 }]}
            activeOpacity={0.7}
            onPress={() => Haptics.selection()}
          >
            <Users size={18} color="#2D3142" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleBtn}
            activeOpacity={0.7}
            onPress={() => Haptics.selection()}
          >
            <Settings size={18} color="#2D3142" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
      >
        {/* Track Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.stagePill}>
              <View style={styles.stagePillDot} />
              <Text style={styles.stagePillText}>
                Stage {stageIndex} of 5: {activeStage}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                Haptics.selection();
                setIsPlaying(!isPlaying);
              }}
              style={styles.playBtn}
              activeOpacity={0.8}
            >
              <Play size={18} color="#6C63FF" fill={isPlaying ? '#6C63FF' : 'transparent'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.trackTitle}>{project.name}</Text>
          <Text style={styles.trackSubtitle}>
            {project.genre || 'Synthpop'} • {bpm} • {keySig}
          </Text>

          {/* Production Progress & Waveform */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressLabel}>Production Completion</Text>
              <View style={styles.progressPercentPill}>
                <Text style={styles.progressPercentText}>{project.progress}%</Text>
              </View>
            </View>

            {/* Custom Waveform Bar */}
            <View style={styles.waveformRow}>
              {barHeights.map((h, i) => {
                const isActive = i < activeBarsCount;
                return (
                  <View
                    key={i}
                    style={[
                      styles.waveformBar,
                      {
                        height: (h / 100) * 28,
                        backgroundColor: isActive ? '#6C63FF' : '#E8E9F3',
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.heroFooter}>
            <View style={styles.targetDateBox}>
              <Calendar size={15} color="#787C93" style={{ marginRight: 6 }} />
              <Text style={styles.targetDateText}>
                Target: {new Date(project.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleOpenDAW}
              style={styles.openDawBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.openDawText}>Open in DAW</Text>
              <ArrowRight size={15} color="#6C63FF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Workflow Stage */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Workflow Stage</Text>
          <Text style={styles.sectionSubText}>Stage {stageIndex} of 5</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stagesScroll}>
          {CORE_STAGES.map((stg, index) => {
            const isSelected = activeStage === stg;
            const isPast = index < CORE_STAGES.indexOf(project.currentStage);

            return (
              <TouchableOpacity
                key={stg}
                onPress={() => {
                  Haptics.selection();
                  setActiveStage(stg);
                }}
                activeOpacity={0.75}
                style={[
                  styles.stageChip,
                  isSelected
                    ? styles.stageChipActive
                    : isPast
                    ? styles.stageChipCompleted
                    : styles.stageChipInactive,
                ]}
              >
                {isSelected ? (
                  <View style={styles.activeDot} />
                ) : isPast ? (
                  <Check size={14} color="#4CAF50" style={{ marginRight: 5 }} />
                ) : (
                  <Check size={14} color="#B0B3C6" style={{ marginRight: 5 }} />
                )}
                <Text
                  style={[
                    styles.stageChipText,
                    isSelected
                      ? styles.stageChipTextActive
                      : isPast
                      ? styles.stageChipTextCompleted
                      : styles.stageChipTextInactive,
                  ]}
                >
                  {stg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section: Tasks */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.taskTitleGroup}>
            <Text style={styles.sectionTitle}>Tasks: {activeStage}</Text>
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>
                {completedCount} of {totalCount || 4} done
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.filterDropdown} activeOpacity={0.7}>
            <Text style={styles.filterText}>All assignees</Text>
            <ChevronDown size={14} color="#6C63FF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Task Cards List */}
        <View style={styles.tasksList}>
          {currentStageTasks.length === 0 ? (
            // Mock preview fallback tasks if no task created yet
            <>
              <View style={styles.taskCard}>
                <TouchableOpacity
                  onPress={() => Haptics.success()}
                  style={[styles.checkCircle, styles.checkCircleCompleted]}
                >
                  <Check size={12} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>Vocal EQ</Text>
                  <View style={styles.assigneeRow}>
                    <View style={styles.avatarBubble}>
                      <Text style={styles.avatarText}>M</Text>
                    </View>
                    <Text style={styles.assigneeText}>Assigned to Mike</Text>
                  </View>
                </View>

                <View style={styles.taskTagPill}>
                  <Text style={styles.taskTagText}>Stem #02</Text>
                </View>
              </View>

              <View style={styles.taskCard}>
                <TouchableOpacity
                  onPress={() => Haptics.success()}
                  style={[styles.checkCircle, styles.checkCircleCompleted]}
                >
                  <Check size={12} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>
                    Instrument balance
                  </Text>
                  <View style={styles.assigneeRow}>
                    <View style={styles.avatarBubble}>
                      <Text style={styles.avatarText}>M</Text>
                    </View>
                    <Text style={styles.assigneeText}>Assigned to Mike</Text>
                  </View>
                </View>

                <View style={styles.taskTagPill}>
                  <Text style={styles.taskTagText}>Mix Bus</Text>
                </View>
              </View>

              <View style={[styles.taskCard, styles.taskCardActive]}>
                <TouchableOpacity
                  onPress={() => Haptics.success()}
                  style={[styles.checkCircle, styles.checkCirclePurple]}
                />

                <View style={styles.taskContent}>
                  <View style={styles.taskTitleRow}>
                    <Text style={styles.taskTitle}>Final mix review</Text>
                    <View style={styles.priorityPill}>
                      <Text style={styles.priorityText}>High Priority</Text>
                    </View>
                  </View>
                  <View style={styles.assigneeRow}>
                    <View style={[styles.avatarBubble, { backgroundColor: '#E5E4FF' }]}>
                      <Text style={[styles.avatarText, { color: '#6C63FF' }]}>A</Text>
                    </View>
                    <Text style={styles.assigneeText}>Assigned to Alex • Today 11:00 AM</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.reviewBtn} activeOpacity={0.7}>
                  <Text style={styles.reviewBtnText}>Review</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.taskCard}>
                <TouchableOpacity
                  onPress={() => Haptics.success()}
                  style={[styles.checkCircle, styles.checkCirclePending]}
                />

                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>Export WAV</Text>
                  <View style={styles.assigneeRow}>
                    <View style={styles.avatarBubble}>
                      <Text style={styles.avatarText}>M</Text>
                    </View>
                    <Text style={styles.assigneeText}>Assigned to Mike</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.7}>
                  <Download size={18} color="#787C93" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            currentStageTasks.map((t) => (
              <View key={t.id} style={styles.taskCard}>
                <TouchableOpacity
                  onPress={() => handleToggleTask(t.id, t.completed)}
                  style={[
                    styles.checkCircle,
                    t.completed ? styles.checkCircleCompleted : styles.checkCirclePending,
                  ]}
                >
                  {t.completed && <Check size={12} color="#FFFFFF" />}
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskTitle,
                      t.completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {t.title}
                  </Text>
                  <View style={styles.assigneeRow}>
                    <View style={styles.avatarBubble}>
                      <Text style={styles.avatarText}>
                        {(t.assignedTo || 'A').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.assigneeText}>Assigned to {t.assignedTo || 'Alex'}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Add Task Input Bar */}
      <View style={styles.bottomInputBar}>
        <TextInput
          style={styles.bottomInput}
          placeholder={`Add new ${activeStage.toLowerCase()} task...`}
          placeholderTextColor="#B0B3C6"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.micBtn} activeOpacity={0.7}>
          <Mic size={18} color="#787C93" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAddTask}
          style={styles.sendBtn}
          activeOpacity={0.8}
        >
          <Send size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 12,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dawSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dawDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#6C63FF',
    marginRight: 6,
  },
  dawSyncText: {
    color: '#6C63FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  discIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  stagePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
    marginRight: 6,
  },
  stagePillText: {
    color: '#B76E00',
    fontSize: 12,
    fontWeight: '700',
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E2238',
    marginBottom: 4,
  },
  trackSubtitle: {
    fontSize: 13,
    color: '#787C93',
    fontWeight: '500',
    marginBottom: 18,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3142',
  },
  progressPercentPill: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  progressPercentText: {
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: '800',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
    backgroundColor: '#F8F9FD',
    borderRadius: 14,
    paddingHorizontal: 10,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F7',
  },
  targetDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetDateText: {
    fontSize: 12,
    color: '#787C93',
    fontWeight: '600',
  },
  openDawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openDawText: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E2238',
  },
  sectionSubText: {
    fontSize: 13,
    color: '#787C93',
    fontWeight: '600',
  },
  stagesScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
  },
  stageChipActive: {
    backgroundColor: '#6C63FF',
  },
  stageChipCompleted: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E8',
  },
  stageChipInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E8',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  stageChipText: {
    fontSize: 13,
  },
  stageChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stageChipTextCompleted: {
    color: '#2D3142',
    fontWeight: '600',
  },
  stageChipTextInactive: {
    color: '#787C93',
    fontWeight: '500',
  },
  taskTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneBadge: {
    backgroundColor: '#F0F1F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  doneBadgeText: {
    fontSize: 12,
    color: '#787C93',
    fontWeight: '600',
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '600',
  },
  tasksList: {
    gap: 10,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  taskCardActive: {
    borderWidth: 1.5,
    borderColor: '#E5E4FF',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkCircleCompleted: {
    backgroundColor: '#00C853',
  },
  checkCirclePurple: {
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  checkCirclePending: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  taskContent: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3142',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  assigneeText: {
    fontSize: 12,
    color: '#787C93',
    fontWeight: '500',
  },
  taskTagPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  taskTagText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  priorityPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  priorityText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  reviewBtn: {
    backgroundColor: '#E5E4FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  reviewBtnText: {
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionIconBtn: {
    padding: 6,
  },
  bottomInputBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EBEBF2',
  },
  bottomInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3142',
    paddingVertical: 8,
  },
  micBtn: {
    padding: 8,
    marginRight: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
