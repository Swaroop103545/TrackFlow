import { theme } from '../theme/theme';

export const useTheme = () => {
  // In a real app with dark/light mode toggle, this would listen to context or system scheme
  return { theme };
};
