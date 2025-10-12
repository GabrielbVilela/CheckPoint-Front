import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { router } from "expo-router";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaIncorreta, setSenhaIncorreta] = useState(false);
  const [matriculaErro, setMatriculaErro] = useState(false);
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const handleLogin = async () => {
    if (!matricula || !senha) {
      Alert.alert("Erro", "Preencha todos os campos");
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
      const role = "aluno"; // Ajuste conforme backend
      await setAuth(token, role);

      router.push("/(tabs)/");
    } catch (error: any) {
      console.log("❌ Erro ao fazer login:", error.response?.data || error.message);
      Alert.alert(
        "Erro ao logar",
        error.response?.data?.detail || "Não foi possível conectar ao servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, Bem-vindo.</Text>

      <View style={styles.inputContainer}>
      <Text style={styles.label}>Matrícula</Text>
      <TextInput
        placeholder="Digite sua Matrícula"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={matricula}
        onChangeText={setMatricula}
        style={[styles.input, matriculaErro && { borderColor: "red" }]}
      />
      </View>

      <View style={styles.inputContainer}>
      <Text style={styles.label}>Senha</Text>
      <TextInput
        placeholder="Digite sua senha"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={[styles.input, senhaIncorreta && { borderColor: "red" }]}
      />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
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
});
