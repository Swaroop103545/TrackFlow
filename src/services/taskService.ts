import { Task } from '../types';
import { store } from '../store/store';
import { toggleTaskComplete, upsertTask } from '../store/slices/taskSlice';
import { mockDb, hasFirebaseConfig } from './firebase/config';
import { projectService } from './projectService';
import { aiService } from './aiService';
import { addActivity } from '../store/slices/notificationSlice';

export const taskService = {
  subscribeToTasks: (projectId: string) => {
    // Mock subscription
    return () => {};
  },

  toggleTask: async (taskId: string) => {
    const task = store.getState().tasks.tasks[taskId];
    if (!task) return;

    // Optimistic UI update
    store.dispatch(toggleTaskComplete(taskId));
    
    const updatedTask = { ...task, completed: !task.completed, updatedAt: Date.now() };

    // Update Project Progress
    const allTasks = Object.values(store.getState().tasks.tasks);
    const project = store.getState().projects.projects[task.projectId];
    
    if (project) {
      const progress = aiService.calculateProgress(project, allTasks);
      await projectService.updateProjectProgress(project.id, progress);
      
      // Add activity
      if (updatedTask.completed) {
        store.dispatch(addActivity({
          id: `act_${Date.now()}`,
          projectId: project.id,
          userId: store.getState().auth.user?.id || 'unknown',
          type: 'TASK_COMPLETED',
          message: `Completed task: ${task.title}`,
          createdAt: Date.now(),
        }));
      }
    }

    try {
      if (hasFirebaseConfig) {
        // await updateDoc(doc(db, 'tasks', taskId), { completed: !task.completed });
      } else {
        await mockDb.set('tasks', taskId, updatedTask);
      }
    } catch (error) {
      console.error('Failed to sync task:', error);
      // Revert if needed
      store.dispatch(toggleTaskComplete(taskId)); 
    }
  },

  addTask: async (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      projectId: taskData.projectId!,
      title: taskData.title || 'New Task',
      stage: taskData.stage || 'Idea',
      completed: false,
      assignedTo: taskData.assignedTo,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    store.dispatch(upsertTask(newTask));

    // Update Progress
    const allTasks = Object.values(store.getState().tasks.tasks);
    const project = store.getState().projects.projects[newTask.projectId];
    if (project) {
      const progress = aiService.calculateProgress(project, allTasks);
      await projectService.updateProjectProgress(project.id, progress);
    }

    if (!hasFirebaseConfig) {
      await mockDb.set('tasks', newTask.id, newTask);
    }
    return newTask;
  }
};
