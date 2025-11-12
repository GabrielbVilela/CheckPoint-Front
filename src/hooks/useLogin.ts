import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { NAVIGATION_DELAY, ROUTES_BY_ROLE } from "src/constants/auth.constants";
import { login, LoginError } from "src/services/auth.service";
import { sanitizeMatricula, validateLoginFields } from "src/services/login.validator";
import { useAuthStore } from "src/store/authStore";
import { UserRole } from "src/types/auth.types";

interface FieldError {
  matricula: { hasError: boolean; message: string };
  senha: { hasError: boolean; message: string };
}

export const useLogin = () => {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({
    matricula: { hasError: false, message: "" },
    senha: { hasError: false, message: "" },
  });

  const setAuth = useAuthStore((state) => state.setAuth);

  const resetFieldErrors = () => {
    setFieldErrors({
      matricula: { hasError: false, message: "" },
      senha: { hasError: false, message: "" },
    });
  };

  const handleMatriculaChange = (text: string) => {
    setMatricula(sanitizeMatricula(text));
    if (fieldErrors.matricula.hasError) {
      setFieldErrors((prev) => ({
        ...prev,
        matricula: { hasError: false, message: "" },
      }));
    }
  };

  const handleSenhaChange = (text: string) => {
    setSenha(text);
    if (fieldErrors.senha.hasError) {
      setFieldErrors((prev) => ({
        ...prev,
        senha: { hasError: false, message: "" },
      }));
    }
  };

  const handleLogin = async () => {
    resetFieldErrors();

    const validation = validateLoginFields({ matricula, senha });

    if (!validation.isValid) {
      const newErrors: FieldError = {
        matricula: { hasError: false, message: "" },
        senha: { hasError: false, message: "" },
      };

      validation.errors.forEach((error) => {
        newErrors[error.field] = {
          hasError: true,
          message: error.message,
        };
      });

      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const authData = await login({ matricula, senha });
      await setAuth(authData);

      setTimeout(() => {
        const targetRoute = ROUTES_BY_ROLE[authData.role as UserRole] ?? ROUTES_BY_ROLE.aluno;
        router.replace(targetRoute as any);
      }, NAVIGATION_DELAY);
    } catch (error) {
      const loginError = error as LoginError;

      if (loginError.field === "matricula") {
        setFieldErrors((prev) => ({
          ...prev,
          matricula: { hasError: true, message: loginError.message },
        }));
      } else if (loginError.field === "senha") {
        setFieldErrors((prev) => ({
          ...prev,
          senha: { hasError: true, message: loginError.message },
        }));
      } else {
        Alert.alert("Erro ao logar", loginError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    matricula,
    senha,
    loading,
    fieldErrors,
    handleMatriculaChange,
    handleSenhaChange,
    handleLogin,
  };
};