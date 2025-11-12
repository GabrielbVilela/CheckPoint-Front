export interface TokenPayload {
  sub: string;
  scope?: string;
  exp?: number;
  name?: string;
  given_name?: string;
  family_name?: string;
  matricula?: string;
  preferred_username?: string;
}

export interface LoginCredentials {
  matricula: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface User {
  id: string | null;
  matricula: string | null;
  name: string | null;
}

export interface AuthState {
  token: string;
  role: string;
  user: User;
}

export type UserRole = "aluno" | "coordenador" | "professor";