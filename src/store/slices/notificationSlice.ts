import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Activity, Comment } from '../../types';

interface NotificationState {
  activities: Record<string, Activity>;
  comments: Record<string, Comment>;
}

const seedActivities: Record<string, Activity> = {
  'act_1': {
    id: 'act_1',
    projectId: 'proj_1',
    userId: 'user_1',
    type: 'SYSTEM_RECOMMENDATION',
    message: 'Complete artwork before distribution.',
    createdAt: Date.now(),
  },
  'act_2': {
    id: 'act_2',
    projectId: 'proj_1',
    userId: 'user_mike',
    type: 'TASK_COMPLETED',
    message: 'Mike completed Instrument balance',
    createdAt: Date.now() - 3600000,
  }
};

const seedComments: Record<string, Comment> = {
  'com_1': {
    id: 'com_1',
    projectId: 'proj_1',
    userId: 'user_1',
    text: 'Can we reduce the vocal reverb?',
    createdAt: Date.now() - 7200000,
  },
  'com_2': {
    id: 'com_2',
    projectId: 'proj_1',
    userId: 'user_mike',
    text: 'Sure, I\'ll update the mix.',
    createdAt: Date.now() - 3600000,
  }
};

const initialState: NotificationState = {
  activities: seedActivities,
  comments: seedComments,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities[action.payload.id] = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments[action.payload.id] = action.payload;
    },
  },
});

export const { addActivity, addComment } = notificationSlice.actions;
export default notificationSlice.reducer;
