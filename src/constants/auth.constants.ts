import { UserRole } from "src/types/auth.types";

export const ROUTES_BY_ROLE: Record<UserRole, string> = {
  aluno: "/(tabs)",
  coordenador: "/(tabs)/cadastroaluno",
  professor: "/(tabs)/cadastroaluno",
};

export const ERROR_MESSAGES = {
  EMPTY_MATRICULA: "Informe sua matricula.",
  EMPTY_SENHA: "Informe sua senha.",
  INVALID_CREDENTIALS: "Matricula ou senha incorreta.",
  USER_NOT_FOUND: "Usuario nao encontrado.",
  SERVER_ERROR: "Nao foi possivel conectar ao servidor.",
} as const;

export const DEFAULT_ROLE: UserRole = "aluno";
export const NAVIGATION_DELAY = 200;