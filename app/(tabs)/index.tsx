import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import { useTheme } from '../../src/hooks/useTheme';
import { useRouter } from 'expo-router';
import { Haptics } from '../../src/utils/haptics';
import { Bell, ChevronRight, Play, CalendarDays, ArrowRight, Music, MessageCircle, Circle, Plus, Rocket, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const projects = useSelector((state: RootState) => Object.values(state.projects.projects));
  const tasks = useSelector((state: RootState) => Object.values(state.tasks.tasks));
  const pendingTasks = tasks.filter((t) => !t.completed);
  const featuredProject = projects.find((p) => p.id === 'proj_1') || projects[0];
  
  const userName = user?.name || "Alex";

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Waveform progress mock array (24 bars)
  const waveBars = Array.from({ length: 24 }).map((_, i) => {
    const height = 10 + Math.random() * 20; // Random height between 10 and 30
    const isActive = i < 10; // 40% active (10 out of 24)
    return { id: i, height, isActive };
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F9F9FB' }]} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], paddingHorizontal: 24, paddingTop: 20 }}>
        
        {/* Header */}
        <View style={styles.headerTop}>
          <View style={styles.creativePill}>
            <Text style={styles.creativePillText}>CREATIVE STUDIO</Text>
            <View style={styles.creativeDot} />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellIcon} activeOpacity={0.7} onPress={() => Haptics.selection()}>
              <Bell size={20} color="#2D3142" />
              <View style={styles.bellBadge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarCircle} activeOpacity={0.7} onPress={() => router.push('/(tabs)/settings' as any)}>
              <Text style={styles.avatarText}>A</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.greetingText}>
          Good morning, {userName}
        </Text>

        {/* AI Sound Engine Card */}
        <View style={styles.aiCardContainer}>
          <LinearGradient
            colors={['#7E57C2', '#5E35B1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCard}
          >
            <View style={styles.aiCardTop}>
              <View style={styles.aiCardTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.aiTitle}>AI SOUND ENGINE</Text>
                  <View style={styles.aiDot} />
                </View>
                <Text style={styles.aiSubtitle}>
                  Complete <Text style={{ textDecorationLine: 'underline' }}>Final mix review</Text> to unlock Mastering stage.
                </Text>
              </View>
            </View>

            <View style={styles.aiCardBottom}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.aiTimeText}>Est. time: ~15 mins</Text>
              </View>
              <TouchableOpacity
                style={styles.aiActionButton}
                activeOpacity={0.9}
                onPress={() => {
                  Haptics.selection();
                  if (featuredProject) router.push(`/projects/${featuredProject.id}` as any);
                }}
              >
                <Text style={styles.aiActionText}>Action Now</Text>
                <ChevronRight size={16} color="#5E35B1" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Featured Project */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Project</Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => {
              Haptics.selection();
              router.push('/(tabs)/projects' as any);
            }}
          >
            <Text style={styles.allProjectsText}>All Projects</Text>
            <ChevronRight size={16} color="#5E35B1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.selection();
            if (featuredProject) router.push(`/projects/${featuredProject.id}` as any);
          }}
          style={styles.projectCard}
        >
          <View style={styles.projectCardTop}>
            <View style={styles.projectInfo}>
              <View style={styles.stagePill}>
                <View style={styles.stageDot} />
                <Text style={styles.stagePillText}>Stage 3 of 5: {featuredProject?.currentStage || 'Mixing'}</Text>
              </View>
              <Text style={styles.projectTitle}>{featuredProject?.name || 'Midnight Dreams'}</Text>
              <Text style={styles.projectSubtitle}>{featuredProject?.genre || 'Pop'} • 124 BPM • Key: F# Minor</Text>
            </View>
            <TouchableOpacity style={styles.playButton} onPress={() => Haptics.selection()}>
              <Play size={20} color="#5E35B1" fill="#5E35B1" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Production Completion</Text>
            <View style={styles.progressPercentPill}>
              <Text style={styles.progressPercentText}>{featuredProject?.progress || 40}%</Text>
            </View>
          </View>

          <View style={styles.waveformContainer}>
            {waveBars.map((bar) => (
              <View
                key={bar.id}
                style={[
                  styles.waveBar,
                  { height: bar.height, backgroundColor: bar.isActive ? '#5E35B1' : '#EAEAF2' }
                ]}
              />
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.projectFooter}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CalendarDays size={16} color="#9093A3" />
              <Text style={styles.releaseDate}>Release: <Text style={{ color: '#2D3142', fontWeight: '500' }}>Sep 28, 2026</Text></Text>
            </View>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => {
                Haptics.selection();
                if (featuredProject) router.push(`/projects/${featuredProject.id}` as any);
              }}
            >
              <Text style={styles.openDawText}>Open in DAW</Text>
              <ArrowRight size={16} color="#5E35B1" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCardLeft}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.selection();
              router.push('/(tabs)/projects' as any);
            }}
          >
            <View style={styles.statIconBox}>
              <Music size={20} color="#42A5F5" />
            </View>
            <View>
              <Text style={styles.statTitle}>Updated Stems</Text>
              <Text style={styles.statValue}>3 New Files</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCardRight}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.selection();
              router.push('/(tabs)/projects' as any);
            }}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#F3E5F5' }]}>
              <MessageCircle size={20} color="#AB47BC" />
            </View>
            <View>
              <Text style={styles.statTitle}>Feedback</Text>
              <Text style={styles.statValue}>4 Comments</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Tasks */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <View style={styles.pendingPill}>
              <Text style={styles.pendingText}>{pendingTasks.length} pending</Text>
            </View>
          </View>
          <Text style={styles.sortText}>Sort by priority</Text>
        </View>

        <View style={styles.taskCard}>
          <Circle size={28} color="#C5C7D4" strokeWidth={1.5} />
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Final mix review</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={styles.highPriorityPill}>
                <Text style={styles.highPriorityText}>High Priority</Text>
              </View>
              <Text style={styles.taskProject}>Midnight Dreams</Text>
            </View>
          </View>
          <Text style={styles.taskTime}>11:00 AM</Text>
          <TouchableOpacity
            style={styles.addTaskBtn}
            onPress={() => {
              Haptics.success();
              router.push('/projects/create' as any);
            }}
          >
            <Plus size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 100 }} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  creativePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  creativePillText: {
    color: '#5E35B1',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  creativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5E35B1',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5E35B1',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5E35B1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A24',
    marginBottom: 24,
  },
  aiCardContainer: {
    marginBottom: 32,
    shadowColor: '#5E35B1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  aiCard: {
    borderRadius: 20,
    padding: 24,
  },
  aiCardTop: {
    flexDirection: 'row',
    // marginBottom: 24,
  },
  zapIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiCardTextCol: {
    flex: 1,
  },
  aiTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  aiSubtitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 22,
  },
  aiCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    
  },
  aiTimeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginLeft: 6,
  },
  aiActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiActionText: {
    color: '#5E35B1',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A24',
  },
  allProjectsText: {
    color: '#5E35B1',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#8E8EA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  projectCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  projectIconBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E5E4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  projectInfo: {
    flex: 1,
  },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  stageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
    marginRight: 6,
  },
  stagePillText: {
    color: '#E65100',
    fontSize: 11,
    fontWeight: '700',
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A24',
    marginBottom: 4,
  },
  projectSubtitle: {
    fontSize: 12,
    color: '#787C93',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E8',
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEBF0',
    marginVertical: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    color: '#2D3142',
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentPill: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressPercentText: {
    color: '#5E35B1',
    fontSize: 12,
    fontWeight: '700',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 42,
    backgroundColor: '#F4F4F8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  releaseDate: {
    color: '#787C93',
    fontSize: 14,
    marginLeft: 6,
  },
  openDawText: {
    color: '#5E35B1',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCardLeft: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#8E8EA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardRight: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#8E8EA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 12,
    color: '#787C93',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
  },
  pendingPill: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  pendingText: {
    color: '#5E35B1',
    fontSize: 12,
    fontWeight: '700',
  },
  sortText: {
    color: '#9093A3',
    fontSize: 14,
    fontWeight: '500',
  },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8E8EA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 16,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A24',
  },
  highPriorityPill: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  highPriorityText: {
    color: '#D32F2F',
    fontSize: 10,
    fontWeight: '700',
  },
  taskProject: {
    color: '#9093A3',
    fontSize: 12,
  },
  taskTime: {
    color: '#9093A3',
    fontSize: 14,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addTaskBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5E35B1',
    width: 30,
    height: 30,
    borderTopLeftRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

