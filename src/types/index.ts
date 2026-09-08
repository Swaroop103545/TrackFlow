export type StageStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export type WorkflowStage =
  | 'Idea'
  | 'Recording'
  | 'Editing'
  | 'Mixing'
  | 'Mastering'
  | 'Artwork'
  | 'Distribution'
  | 'Release';

export const WORKFLOW_STAGES: WorkflowStage[] = [
  'Idea',
  'Recording',
  'Editing',
  'Mixing',
  'Mastering',
  'Artwork',
  'Distribution',
  'Release',
];

export interface Project {
  id: string;
  name: string;
  artistId: string;
  genre: string;
  description?: string;
  releaseDate: string; // ISO string
  currentStage: WorkflowStage;
  progress: number; // 0-100
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  stage: WorkflowStage;
  completed: boolean;
  assignedTo?: string; // userId
  dueDate?: string; // ISO string
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  text: string;
  createdAt: number;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  type: 'STAGE_UPDATED' | 'TASK_COMPLETED' | 'COMMENT_ADDED' | 'PROJECT_CREATED' | 'SYSTEM_RECOMMENDATION';
  message: string;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  role: 'Artist' | 'Producer' | 'Mix Engineer' | 'Manager' | 'Collaborator';
}
