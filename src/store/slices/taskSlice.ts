import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types';

interface TaskState {
  tasks: Record<string, Task>;
  loading: boolean;
}

// Seed data
const seedTasks: Record<string, Task> = {
  'task_1': {
    id: 'task_1',
    projectId: 'proj_1',
    title: 'Vocal EQ',
    stage: 'Mixing',
    completed: true,
    assignedTo: 'Mike',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'task_2': {
    id: 'task_2',
    projectId: 'proj_1',
    title: 'Instrument balance',
    stage: 'Mixing',
    completed: true,
    assignedTo: 'Mike',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'task_3': {
    id: 'task_3',
    projectId: 'proj_1',
    title: 'Final mix review',
    stage: 'Mixing',
    completed: false,
    assignedTo: 'Alex',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'task_4': {
    id: 'task_4',
    projectId: 'proj_1',
    title: 'Export WAV',
    stage: 'Mixing',
    completed: false,
    assignedTo: 'Mike',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  'task_5': {
    id: 'task_5',
    projectId: 'proj_1',
    title: 'Approve artwork',
    stage: 'Artwork',
    completed: false,
    assignedTo: 'Alex',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
};

const initialState: TaskState = {
  tasks: seedTasks,
  loading: false,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      const tasksMap: Record<string, Task> = {};
      action.payload.forEach(t => {
        tasksMap[t.id] = t;
      });
      state.tasks = tasksMap;
    },
    upsertTask: (state, action: PayloadAction<Task>) => {
      state.tasks[action.payload.id] = action.payload;
    },
    toggleTaskComplete: (state, action: PayloadAction<string>) => {
      if (state.tasks[action.payload]) {
        state.tasks[action.payload].completed = !state.tasks[action.payload].completed;
        state.tasks[action.payload].updatedAt = Date.now();
      }
    },
  },
});

export const { setTasks, upsertTask, toggleTaskComplete } = taskSlice.actions;
export default taskSlice.reducer;
