import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, WorkflowStage } from '../../types';

interface ProjectState {
  projects: Record<string, Project>;
  activeProjectId: string | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

// Seed data
const seedProjects: Record<string, Project> = {
  'proj_1': {
    id: 'proj_1',
    name: 'Midnight Dreams',
    artistId: 'user_1',
    genre: 'Synthpop',
    description: '[Audio Specs: BPM: 124 | Key: F# Minor]\n\nMain track for upcoming summer EP.',
    releaseDate: '2026-09-28T00:00:00.000Z',
    currentStage: 'Mixing',
    progress: 78,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'proj_2': {
    id: 'proj_2',
    name: 'Summer Nights',
    artistId: 'user_1',
    genre: 'Pop',
    description: '[Audio Specs: BPM: 118 | Key: G Major]',
    releaseDate: '2026-10-15T00:00:00.000Z',
    currentStage: 'Recording',
    progress: 42,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  'proj_3': {
    id: 'proj_3',
    name: 'Ocean Drive',
    artistId: 'user_1',
    genre: 'Lo-Fi',
    description: '[Audio Specs: BPM: 85 | Key: C Major]',
    releaseDate: '2026-08-01T00:00:00.000Z',
    currentStage: 'Release',
    progress: 100,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
  }
};

const initialState: ProjectState = {
  projects: seedProjects,
  activeProjectId: null,
  searchQuery: '',
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      const projectsMap: Record<string, Project> = {};
      action.payload.forEach(p => {
        projectsMap[p.id] = p;
      });
      state.projects = projectsMap;
    },
    upsertProject: (state, action: PayloadAction<Project>) => {
      state.projects[action.payload.id] = action.payload;
    },
    setActiveProject: (state, action: PayloadAction<string | null>) => {
      state.activeProjectId = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
    updateProjectProgress: (state, action: PayloadAction<{ projectId: string; progress: number; currentStage: WorkflowStage }>) => {
      if (state.projects[action.payload.projectId]) {
        state.projects[action.payload.projectId].progress = action.payload.progress;
        state.projects[action.payload.projectId].currentStage = action.payload.currentStage;
        state.projects[action.payload.projectId].updatedAt = Date.now();
      }
    },
  },
});

export const {
  setProjects,
  upsertProject,
  setActiveProject,
  setSearchQuery,
  clearSearchQuery,
  updateProjectProgress,
} = projectSlice.actions;

export default projectSlice.reducer;
