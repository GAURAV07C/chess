import { useUserStore } from '../stores/userStore';

export const useUser = () => {
  return useUserStore((state) => state.user);
};

export const useLogout = () => {
  return useUserStore((state) => state.logout);
};
