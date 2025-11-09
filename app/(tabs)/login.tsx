import { getEndpoints } from "@/config/env";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TokenPayload {
  sub: string;
  scope?: string;
  exp?: number;
  name?: string;
  given_name?: string;
  family_name?: string;
  matricula?: string;
  preferred_username?: string;
}

const ROUTES_BY_ROLE: Record<string, string> = {
  aluno: "/(tabs)",
  coordenador: "/(tabs)/coordenador",
  professor: "/(tabs)/professor",
  supervisor: "/(tabs)/supervisor",
  admin: "/(tabs)/admin",
};

const LoginScreen = () => {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaIncorreta, setSenhaIncorreta] = useState(false);
  const [matriculaErro, setMatriculaErro] = useState(false);
  const [matriculaErroMsg, setMatriculaErroMsg] = useState("");
  const [senhaErroMsg, setSenhaErroMsg] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

  const resetFieldErrors = () => {
    setMatriculaErro(false);
    setSenhaIncorreta(false);
    setMatriculaErroMsg("");
    setSenhaErroMsg("");
  };

  const handleLogin = async () => {
    resetFieldErrors();

    if (!matricula || !senha) {
      if (!matricula) {
        setMatriculaErro(true);
        setMatriculaErroMsg("Informe sua matricula.");
      }
      if (!senha) {
        setSenhaIncorreta(true);
        setSenhaErroMsg("Informe sua senha.");
      }
      return;
    }

    setLoading(true);
    try {
      const endpoints = getEndpoints();
      const response = await axios.post(
        endpoints.login,
        new URLSearchParams({
          username: matricula,
          password: senha,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const token = response.data.access_token;
      const decoded: TokenPayload = jwtDecode(token);

      const role = decoded.scope
        ? decoded.scope.trim().toLowerCase()
        : "aluno";

      const userName =
        decoded.name ??
        decoded.given_name ??
        decoded.preferred_username ??
        decoded.family_name ??
        null;

      await setAuth({
        token,
        role,
        user: {
          id: decoded.sub ?? null,
          matricula: decoded.matricula ?? decoded.sub ?? null,
          name: userName,
        },
      });

      setTimeout(() => {
        const targetRoute = ROUTES_BY_ROLE[role] ?? "/(tabs)";
        // router.replace has a narrow typing for allowed paths; cast to any to
        // preserve runtime behavior while keeping TypeScript happy.
        router.replace(targetRoute as any);
      }, 200);
    } catch (error: any) {
      console.error("Erro ao fazer login:", error.response?.data ?? error);
      const status = error.response?.status;
      const detail =
        error.response?.data?.detail ??
        "Nao foi possivel conectar ao servidor.";

      if (status === 401) {
        setSenhaIncorreta(true);
        setSenhaErroMsg("Matricula ou senha incorreta.");
      } else if (status === 404) {
        setMatriculaErro(true);
        setMatriculaErroMsg("Usuario nao encontrado.");
      } else {
        Alert.alert("Erro ao logar", detail);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo/logoblack.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Vamos marcar esse momento?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Matricula</Text>
        <TextInput
          placeholder="Digite sua matricula"
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={matricula}
          onChangeText={(text) => {
            setMatricula(text.replace(/[^0-9]/g, ""));
            if (matriculaErro) {
              setMatriculaErro(false);
              setMatriculaErroMsg("");
            }
          }}
          keyboardType="numeric"
          style={[styles.input, matriculaErro && styles.inputError]}
        />
        {matriculaErroMsg ? (
          <Text style={styles.errorText}>{matriculaErroMsg}</Text>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          placeholder="Digite sua senha"
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={senha}
          onChangeText={(text) => {
            setSenha(text);
            if (senhaIncorreta) {
              setSenhaIncorreta(false);
              setSenhaErroMsg("");
            }
          }}
          secureTextEntry
          style={[styles.input, senhaIncorreta && styles.inputError]}
        />
        {senhaErroMsg ? <Text style={styles.errorText}>{senhaErroMsg}</Text> : null}
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        style={[styles.button, loading && { opacity: 0.6 }]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footer}>Â(c) NassauCode</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  logo: {
    height: 216,
    marginBottom: 8,
    resizeMode: "contain",
    width: 720,
  },
  label: {
    backgroundColor: "#f9f9f9",
    color: "#555",
    fontSize: 12,
    left: 10,
    paddingHorizontal: 4,
    position: "absolute",
    top: -10,
    zIndex: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 10,
    width: "100%",
  },
  inputError: {
    borderColor: "#e53935",
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginTop: 6,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#42a148ff",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
    width: "100%",
  },
  footer: {
    color: "#000",
    marginTop: 18,
    opacity: 0.35,
    textAlign: "center",
    width: "100%",
  },
});

export default LoginScreen;


