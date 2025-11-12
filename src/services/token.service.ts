import { jwtDecode } from "jwt-decode";
import { DEFAULT_ROLE } from "src/constants/auth.constants";
import { TokenPayload, User, UserRole } from "src/types/auth.types";

export const decodeToken = (token: string): TokenPayload => {
  return jwtDecode<TokenPayload>(token);
};

export const extractRole = (decoded: TokenPayload): UserRole => {
  const scope = decoded.scope?.trim().toLowerCase();
  return (scope as UserRole) ?? DEFAULT_ROLE;
};

export const extractUserName = (decoded: TokenPayload): string | null => {
  return (
    decoded.name ??
    decoded.given_name ??
    decoded.preferred_username ??
    decoded.family_name ??
    null
  );
};

export const extractUserFromToken = (decoded: TokenPayload): User => {
  return {
    id: decoded.sub ?? null,
    matricula: decoded.matricula ?? decoded.sub ?? null,
    name: extractUserName(decoded),
  };
};