import { useUserStore } from '../stores/userStore';

export const useUser = () => {
  return useUserStore((state) => state.user);
};
