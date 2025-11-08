import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';

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
  try {
    await Promise.all([
      SecureStore.deleteItemAsync('token'),
      SecureStore.deleteItemAsync('role'),
      SecureStore.deleteItemAsync('user'),
    ]);
  } catch (e) {
    console.warn('Erro ao limpar auth state seguro:', e);
  }
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
    try {
      await Promise.all([
        SecureStore.setItemAsync('token', token),
        SecureStore.setItemAsync('role', role),
        SecureStore.setItemAsync('user', JSON.stringify(user)),
      ]);
    } catch (e) {
      console.warn('Erro ao persistir auth de forma segura:', e);
    }
    set({ token, userRole: role, user, isAuthenticated: true });
  },

  logout: async () => {
    await clearAuthState();
    set({ token: null, userRole: null, user: null, isAuthenticated: false });
  },

  loadAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const role = await SecureStore.getItemAsync('role');
      const userRaw = await SecureStore.getItemAsync('user');

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
          console.warn('Nao foi possivel ler os dados do usuario:', error);
        }
      }

      set({ token, userRole: role, user, isAuthenticated: true });
    } catch (e) {
      console.warn('Erro ao carregar auth seguro:', e);
      await clearAuthState();
      set({ token: null, userRole: null, user: null, isAuthenticated: false });
    }
  },
}));

export default useAuthStore;