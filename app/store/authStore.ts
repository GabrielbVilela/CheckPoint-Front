import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthUser = {
  id: string | null;
  matricula?: string | null;
  name?: string | null;
};

interface AuthState {
  token: string | null;
  userRole: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (payload: { token: string; role: string; user: AuthUser }) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userRole: null,
  user: null,
  isAuthenticated: false,

  setAuth: async ({ token, role, user }) => {
    await AsyncStorage.multiSet([
      ["token", token],
      ["role", role],
      ["user", JSON.stringify(user)],
    ]);
    set({ token, userRole: role, user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(["token", "role", "user"]);
    set({ token: null, userRole: null, user: null, isAuthenticated: false });
  },

  loadAuth: async () => {
    const token = await AsyncStorage.getItem("token");
    const role = await AsyncStorage.getItem("role");
    const userRaw = await AsyncStorage.getItem("user");
    const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    set({ token, userRole: role, user, isAuthenticated: !!token });
  },
}));
