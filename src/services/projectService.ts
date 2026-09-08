import { Project, WORKFLOW_STAGES } from '../types';
import { store } from '../store/store';
import { upsertProject, setProjects } from '../store/slices/projectSlice';
import { mockDb, hasFirebaseConfig } from './firebase/config';
import { addActivity } from '../store/slices/notificationSlice';

export const projectService = {
  subscribeToProjects: () => {
    // In a real app: 
    // const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
    //    const projects = snapshot.docs.map(doc => doc.data() as Project);
    //    store.dispatch(setProjects(projects));
    // });
    // return unsubscribe;
    
    // For MVP Mock, we just return a no-op since Redux handles initial state
    return () => {};
  },

  updateProjectProgress: async (projectId: string, progress: number) => {
    const project = store.getState().projects.projects[projectId];
    if (!project) return;

    // Calculate current stage based on progress
    let newStage = project.currentStage;
    if (progress === 100) newStage = 'Release';

    const updatedProject = {
      ...project,
      progress,
      currentStage: newStage,
      updatedAt: Date.now(),
    };

    // Optimistic update
    store.dispatch(upsertProject(updatedProject));

    try {
      if (hasFirebaseConfig) {
        // await updateDoc(doc(db, 'projects', projectId), { progress, currentStage: newStage, updatedAt: Date.now() });
      } else {
        await mockDb.set('projects', projectId, updatedProject);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Failed to sync project progress:', error);
      // Real app would enqueue retry here
    }
  },

  createProject: async (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: projectData.name || 'Untitled',
      artistId: projectData.artistId || 'user_1',
      genre: projectData.genre || 'Unknown',
      description: projectData.description || '',
      releaseDate: projectData.releaseDate || new Date().toISOString(),
      currentStage: projectData.currentStage || 'Idea',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    store.dispatch(upsertProject(newProject));
    
    store.dispatch(addActivity({
      id: `act_${Date.now()}`,
      projectId: newProject.id,
      userId: newProject.artistId,
      type: 'PROJECT_CREATED',
      message: `Created project ${newProject.name}`,
      createdAt: Date.now(),
    }));

    if (!hasFirebaseConfig) {
      await mockDb.set('projects', newProject.id, newProject);
    }
    return newProject;
  }
};
