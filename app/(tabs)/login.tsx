import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import api from "../services/api";
import { useAuthStore, UserRole } from "../store/authStore";

export default function LoginScreen() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaIncorreta, setSenhaIncorreta] = useState(false);
  const [matriculaErro, setMatriculaErro] = useState(false);

  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!matricula || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    if (matriculaErro) {
      Alert.alert("Erro", "Corrija os erros antes de continuar.");
      return;
    }

    setLoading(true);
    setSenhaIncorreta(false);

    try {
      const response = await api.post("/login", { matricula, senha });
      const { token, tipo_acesso: userRole } = response.data;

      if (token && userRole) {
        login(token, userRole as UserRole);
        if (userRole === "aluno") {
          router.replace("/(tabs)");
        }
      } else {
        Alert.alert("Erro", "Resposta da API incompleta. Token ou perfil ausente.");
      }
    } catch (error: any) {
      setSenhaIncorreta(true);
      console.log("Erro no login:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatriculaChange = (text: string) => {
    if (/^[0-9]*$/.test(text)) {
      setMatricula(text);
      setMatriculaErro(false);
    } else {
      setMatriculaErro(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, Bem-vindo.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          style={[styles.input, matriculaErro && styles.inputError]}
          placeholder="Digite sua Matrícula"
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={matricula}
          onChangeText={handleMatriculaChange}
          keyboardType="numeric"
          editable={!loading}
        />
        {matriculaErro && (
          <Text style={styles.errorText}>Apenas números são permitidos</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={[styles.input, senhaIncorreta && styles.inputError]}
          placeholder="Digite sua senha"
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={senha}
          onChangeText={(text) => {
            setSenha(text);
            if (senhaIncorreta) setSenhaIncorreta(false);
          }}
          secureTextEntry
          editable={!loading}
        />
        {senhaIncorreta && (
          <Text style={styles.errorText}>Senha incorreta</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
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
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
    position: "relative",
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
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 5,
    marginLeft: 4,
    fontSize: 14,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(66, 161, 72, 1)",
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
});
