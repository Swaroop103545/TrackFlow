import { Project, Task, WORKFLOW_STAGES } from '../types';

export const aiService = {
  getRecommendedNextAction: (project: Project, tasks: Task[]): string => {
    // 1. Check if the project is blocked
    if (project.currentStage === 'Release' && project.progress === 100) {
      return "Project is complete and ready for release!";
    }

    // 2. Find incomplete tasks in the current stage
    const currentStageTasks = tasks.filter(t => t.stage === project.currentStage && t.projectId === project.id);
    const incompleteTasks = currentStageTasks.filter(t => !t.completed);

    if (incompleteTasks.length > 0) {
      // Recommend the first incomplete task, maybe sort by due date if existed
      return `Complete '${incompleteTasks[0].title}' to progress the ${project.currentStage} stage.`;
    }

    // 3. If all tasks in current stage are complete, recommend moving to the next stage
    const currentStageIndex = WORKFLOW_STAGES.indexOf(project.currentStage);
    if (currentStageIndex >= 0 && currentStageIndex < WORKFLOW_STAGES.length - 1) {
      const nextStage = WORKFLOW_STAGES[currentStageIndex + 1];
      return `All tasks in ${project.currentStage} complete. Time to start ${nextStage}.`;
    }

    return "Keep up the great work!";
  },

  calculateProgress: (project: Project, tasks: Task[]): number => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(t => t.completed).length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  }
};
