import { ERROR_MESSAGES } from "src/constants/auth.constants";
import { LoginCredentials } from "src/types/auth.types";

export interface ValidationError {
  field: "matricula" | "senha";
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateLoginFields = (
  credentials: LoginCredentials
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!credentials.matricula.trim()) {
    errors.push({
      field: "matricula",
      message: ERROR_MESSAGES.EMPTY_MATRICULA,
    });
  }

  if (!credentials.senha.trim()) {
    errors.push({
      field: "senha",
      message: ERROR_MESSAGES.EMPTY_SENHA,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeMatricula = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};