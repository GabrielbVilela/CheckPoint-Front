import { create } from 'zustand';

// Tipos de usuário com base no contexto do projeto
export type UserRole = 'aluno' | 'professor' | 'coordenador' | 'admin' | null;

interface AuthState {
  token: string | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  // O tipo de login é ajustado para armazenar o perfil
  login: (token: string, userRole: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userRole: null,
  isAuthenticated: false,
  
  // A função de login armazena o token e o perfil (role)
  login: (token, userRole) => set({ 
    token, 
    userRole, 
    isAuthenticated: true 
  }),
  
  logout: () => set({ 
    token: null, 
    userRole: null, 
    isAuthenticated: false 
  }),
}));

export default useAuthStore; 