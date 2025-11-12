import axios, { AxiosError } from "axios";
import { ERROR_MESSAGES } from "src/constants/auth.constants";
import { getEndpoints } from "src/constants/env";
import {
    AuthState,
    LoginCredentials,
    LoginResponse,
} from "src/types/auth.types";
import {
    decodeToken,
    extractRole,
    extractUserFromToken,
} from "./token.service";

export interface LoginError {
  status?: number;
  message: string;
  field?: "matricula" | "senha" | "general";
}

export const login = async (
  credentials: LoginCredentials
): Promise<AuthState> => {
  try {
    const endpoints = getEndpoints();
    const response = await axios.post<LoginResponse>(
      endpoints.login,
      new URLSearchParams({
        username: credentials.matricula,
        password: credentials.senha,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const token = response.data.access_token;
    const decoded = decodeToken(token);
    const role = extractRole(decoded);
    const user = extractUserFromToken(decoded);

    return { token, role, user };
  } catch (error) {
    throw handleLoginError(error);
  }
};

const handleLoginError = (error: unknown): LoginError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    const status = axiosError.response?.status;
    const detail =
      axiosError.response?.data?.detail ?? ERROR_MESSAGES.SERVER_ERROR;

    if (status === 401) {
      return {
        status,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        field: "senha",
      };
    }

    if (status === 404) {
      return {
        status,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
        field: "matricula",
      };
    }

    return {
      status,
      message: detail,
      field: "general",
    };
  }

  return {
    message: ERROR_MESSAGES.SERVER_ERROR,
    field: "general",
  };
};