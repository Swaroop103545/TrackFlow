import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../src/store/store';
import { useTheme } from '../../../src/hooks/useTheme';
import { Card } from '../../../src/components/Card';
import { useRouter } from 'expo-router';
import { Haptics } from '../../../src/utils/haptics';
import {
  Plus,
  Search,
  ListFilter,
  Play,
  Calendar,
  ArrowRight,
  Wand2,
  Mic,
  CheckCircle,
  Music,
  X,
} from 'lucide-react-native';
import { EmptyState } from '../../../src/components/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';
import { setSearchQuery, clearSearchQuery } from '../../../src/store/slices/projectSlice';

const Waveform = ({ progress, isCompleted }: { progress: number; isCompleted: boolean }) => {
  const bars = [10, 16, 12, 18, 14, 22, 12, 24, 18, 20, 14, 16, 12, 18, 12, 10, 8];
  const { theme } = useTheme();

  return (
    <View style={styles.waveformContainer}>
      {bars.map((height, index) => {
        const percent = (index / bars.length) * 100;
        const isActive = percent <= progress;
        return (
          <View
            key={index}
            style={[
              styles.waveBar,
              { height },
              isActive
                ? { backgroundColor: isCompleted ? '#10B981' : theme.colors.primary }
                : { backgroundColor: '#EBEBF0' },
            ]}
          />
        );
      })}
    </View>
  );
};

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const [activeFilter, setActiveFilter] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchQuery = useSelector((state: RootState) => state.projects.searchQuery);

  const allProjects = Object.values(
    useSelector((state: RootState) => state.projects.projects)
  ).sort((a, b) => b.updatedAt - a.updatedAt);

  const inProgressCount = allProjects.filter((p) => p.progress < 100).length;
  const releasedCount = allProjects.filter((p) => p.progress === 100).length;

  const projects = allProjects.filter((p) => {
    const matchesStage =
      activeFilter === 'All'
        ? true
        : activeFilter === 'In Progress'
        ? p.progress < 100
        : p.progress === 100;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.genre.toLowerCase().includes(q) ||
      p.currentStage.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q));

    return matchesStage && matchesSearch;
  });

  const getProjectStyle = (stage: string) => {
    switch (stage) {
      case 'Recording':
        return {
          colors: ['#FBBF24', '#F59E0B'] as const,
          Icon: Mic,
          tagColor: '#0284C7',
          tagBg: '#E0F2FE',
          label: 'Stage 2: Recording',
        };
      case 'Mixing':
        return {
          colors: ['#A78BFA', '#7C3AED'] as const,
          Icon: Wand2,
          tagColor: '#D97706',
          tagBg: '#FEF3C7',
          label: 'Stage 3: Mixing',
        };
      case 'Release':
      case 'Released':
        return {
          colors: ['#34D399', '#10B981'] as const,
          Icon: CheckCircle,
          tagColor: '#059669',
          tagBg: '#D1FAE5',
          label: 'Stage 5: Released',
        };
      default:
        return {
          colors: ['#9CA3AF', '#6B7280'] as const,
          Icon: Music,
          tagColor: '#4B5563',
          tagBg: '#F3F4F6',
          label: `Stage: ${stage}`,
        };
    }
  };

  const getMockedAttributes = (id: string, description?: string) => {
    let bpm = '120';
    let key = 'C Major';

    if (description) {
      const bpmMatch = description.match(/BPM:\s*(\d+)/i);
      if (bpmMatch) bpm = bpmMatch[1];
      const keyMatch = description.match(/Key:\s*([^|\n\]]+)/i);
      if (keyMatch) key = keyMatch[1].trim();
    } else {
      if (id === 'proj_1') { bpm = '124'; key = 'F# Minor'; }
      if (id === 'proj_2') { bpm = '118'; key = 'G Major'; }
      if (id === 'proj_3') { bpm = '85'; key = 'C Major'; }
    }

    return { bpm, key };
  };

  const toggleSearch = () => {
    Haptics.selection();
    if (isSearchOpen && searchQuery) {
      dispatch(clearSearchQuery());
    }
    setIsSearchOpen(!isSearchOpen);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isCompleted = item.progress === 100;
    const styleData = getProjectStyle(item.currentStage);
    const { bpm, key } = getMockedAttributes(item.id, item.description);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          Haptics.selection();
          router.push(`/projects/${item.id}` as any);
        }}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={[styles.stageTag, { backgroundColor: styleData.tagBg }]}>
                <View style={[styles.stageDot, { backgroundColor: styleData.tagColor }]} />
                <Text style={[styles.stageText, { color: styleData.tagColor }]}>
                  {styleData.label}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>
                {item.genre} • {bpm} BPM • Key: {key}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.playButton}
              onPress={() => Haptics.selection()}
            >
              <Play size={16} color={theme.colors.primary} fill={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Production Completion</Text>
            <View
              style={[
                styles.progressBadge,
                { backgroundColor: isCompleted ? '#E8F5E9' : '#F0EFFF' },
              ]}
            >
              <Text
                style={[
                  styles.progressBadgeText,
                  { color: isCompleted ? '#10B981' : theme.colors.primary },
                ]}
              >
                {item.progress}%
              </Text>
            </View>
          </View>

          <Waveform progress={item.progress} isCompleted={isCompleted} />

          <View style={styles.cardFooter}>
            <View style={styles.dateContainer}>
              <Calendar size={14} color={theme.colors.textSecondary} />
              <Text style={styles.dateText}>
                {isCompleted ? 'Released:' : 'Release:'}{' '}
                {new Date(item.releaseDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.actionButton}>
              <Text
                style={[
                  styles.actionText,
                  { color: isCompleted ? '#10B981' : theme.colors.primary },
                ]}
              >
                {isCompleted ? 'View Analytics' : 'Open in DAW'}
              </Text>
              <ArrowRight size={14} color={isCompleted ? '#10B981' : theme.colors.primary} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>CREATIVE STUDIO</Text>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>Projects</Text>
            <View style={styles.titleBadge}>
              <Text style={styles.titleBadgeText}>{projects.length} Tracks</Text>
            </View>

            <View style={{ flex: 1 }} />

            <TouchableOpacity style={styles.iconButton} onPress={toggleSearch}>
              {isSearchOpen ? (
                <X size={20} color={theme.colors.text} />
              ) : (
                <Search size={20} color={theme.colors.text} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { marginLeft: 8 }]}
              onPress={() => Haptics.selection()}
            >
              <ListFilter size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Interactive Search Input Bar */}
          {isSearchOpen && (
            <View style={[styles.searchBarWrapper, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Search size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Search tracks, genre, stage..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={(text) => dispatch(setSearchQuery(text))}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => dispatch(clearSearchQuery())}>
                  <X size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {['All', 'In Progress', 'Released'].map((filter) => {
              const isActive = activeFilter === filter;
              const count =
                filter === 'All'
                  ? allProjects.length
                  : filter === 'In Progress'
                  ? inProgressCount
                  : releasedCount;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterPill,
                    isActive ? styles.filterPillActive : styles.filterPillInactive,
                  ]}
                  onPress={() => {
                    Haptics.selection();
                    setActiveFilter(filter);
                  }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isActive ? styles.filterTextActive : styles.filterTextInactive,
                    ]}
                  >
                    {filter} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List */}
        {projects.length === 0 ? (
          <EmptyState
            icon={Music}
            title={searchQuery ? 'No matching tracks' : 'No projects yet'}
            description={
              searchQuery
                ? `No tracks found matching "${searchQuery}".`
                : 'Create your first track and start building your workflow.'
            }
            actionTitle={searchQuery ? 'Clear Search' : 'Create Project'}
            onAction={() => {
              Haptics.success();
              if (searchQuery) {
                dispatch(clearSearchQuery());
              } else {
                router.push('/projects/create');
              }
            }}
          />
        ) : (
          <FlatList
            data={projects}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            Haptics.success();
            router.push('/projects/create');
          }}
        >
          <Plus color="#fff" size={28} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6C63FF',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6C63FF',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  titleBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterWrapper: {
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: '#4B5563',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitleContainer: {
    flex: 1,
  },
  stageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  stageDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  stageText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});
