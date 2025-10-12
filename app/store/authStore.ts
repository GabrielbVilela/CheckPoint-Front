import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  token: string | null;
  userRole: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userRole: null,
  isAuthenticated: false,

  setAuth: async (token, role) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("role", role);
    set({ token, userRole: role, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    set({ token: null, userRole: null, isAuthenticated: false });
  },

  loadAuth: async () => {
    const token = await AsyncStorage.getItem("token");
    const role = await AsyncStorage.getItem("role");
    set({ token, userRole: role, isAuthenticated: !!token });
  },
}));
