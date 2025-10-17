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
import { useAuthStore } from "../store/authStore";

interface TokenPayload {
  sub: string;
  scope?: string;
  exp?: number;
}

export default function LoginScreen() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaIncorreta, setSenhaIncorreta] = useState(false);
  const [matriculaErro, setMatriculaErro] = useState(false);
  const [matriculaErroMsg, setMatriculaErroMsg] = useState("");
  const [senhaErroMsg, setSenhaErroMsg] = useState("");
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const handleLogin = async () => {
    setMatriculaErro(false);
    setSenhaIncorreta(false);
    setMatriculaErroMsg("");
    setSenhaErroMsg("");

    if (!matricula || !senha) {
      if (!matricula) {
        setMatriculaErro(true);
        setMatriculaErroMsg("Informe sua matrícula");
      }
      if (!senha) {
        setSenhaIncorreta(true);
        setSenhaErroMsg("Informe sua senha");
      }
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://backend-expo-681689392736.us-central1.run.app/login",
        new URLSearchParams({
          username: matricula,
          password: senha,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const token = response.data.access_token;

      const decoded: TokenPayload = jwtDecode(token);
      console.log("📜 Token decodificado:", decoded);

      const role = decoded.scope
        ? decoded.scope.trim().toLowerCase()
        : "aluno";

      console.log("👤 Papel detectado:", role);

      await setAuth(token, role);

      setTimeout(() => {
        if (role === "aluno") {
          router.push("/(tabs)");
        } else {
          router.push("/(tabs)/cadastroaluno");
        }
      }, 200);

    } catch (error: any) {
      console.log("❌ Erro ao fazer login:", error.response?.data || error.message);
      const status = error.response?.status;
      const detail = error.response?.data?.detail || "Não foi possível conectar ao servidor.";

      if (status === 401) {
        setSenhaIncorreta(true);
        setSenhaErroMsg("Matrícula ou senha incorreta");
      } else if (status === 404) {
        setMatriculaErro(true);
        setMatriculaErroMsg("Usuário não encontrado");
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
        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          placeholder="Digite sua Matrícula"
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

      <Text style={styles.copyright}>© NassauCode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  logo: {
    width: 720,
    height: 216,
    resizeMode: "contain",
    marginBottom: 8,
  },
  label: {
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#555",
    zIndex: 1,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#e53935",
  },
  errorText: {
    color: "#e53935",
    marginTop: 6,
    fontSize: 12,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#42a148ff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
    position: "relative",
  },
  copyright: {
    marginTop: 18,
    color: "#000",
    opacity: 0.35,
    textAlign: "center",
    width: "100%",
  },
});
