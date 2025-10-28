import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

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

type TokenPayload = {
  exp?: number;
};

const clearAuthState = async () => {
  await AsyncStorage.multiRemove(["token", "role", "user"]);
};

const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    if (!decoded.exp) {
      return false;
    }
    return decoded.exp * 1000 <= Date.now();
  } catch (error) {
    console.warn("Nao foi possivel decodificar o token:", error);
    return true;
  }
};

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
    await clearAuthState();
    set({ token: null, userRole: null, user: null, isAuthenticated: false });
  },

  loadAuth: async () => {
    const storedValues = await AsyncStorage.multiGet(["token", "role", "user"]);
    const [token, role, userRaw] = storedValues.map(([, value]) => value);

    if (!token || isTokenExpired(token)) {
      await clearAuthState();
      set({ token: null, userRole: null, user: null, isAuthenticated: false });
      return;
    }

    let user: AuthUser | null = null;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw) as AuthUser;
      } catch (error) {
        console.warn("Nao foi possivel ler os dados do usuario:", error);
      }
    }

    set({ token, userRole: role, user, isAuthenticated: true });
  },
}));

export default useAuthStore;