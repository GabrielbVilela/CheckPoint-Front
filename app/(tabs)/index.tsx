import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  // 👉 Login inline
  const handleLogin = async () => {
    if (email === "" || senha === "") {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      // Aqui você chama a API de login
      const response = await axios.post("http://localhost:3000/login", {
        email,
        senha,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Sucesso", "Login realizado com sucesso!");
        console.log("Resposta da API (login):", response.data);

        // Exemplo: redirecionar para home
        // router.push("/home");
      } else {
        Alert.alert("Erro", "Usuário ou senha inválidos!");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar à API.");
      console.error("Erro no login:", error);
    }
  };

  // 👉 Exemplo de "Recuperar Senha" inline
  const handleRecuperar = async () => {
    try {
      const response = await axios.get("http://localhost:3000/clientes");
      Alert.alert("API respondeu:", JSON.stringify(response.data));
      console.log("Resposta da API (clientes):", response.data);
    } catch (error) {
      Alert.alert("Erro ao consultar clientes!");
      console.error("Erro no recuperar senha:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, Bem vindo.</Text>

      {/* Campo Email */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua Matrícula"
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Campo Senha */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Esqueceu a senha?{" "}
        <TouchableOpacity onPress={handleRecuperar}>
          <Text style={styles.registerLink}>Recuperar</Text>
        </TouchableOpacity>
      </Text>
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
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },

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

  button: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(66, 161, 72, 1)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  registerText: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  registerLink: {
    color: "rgba(66, 161, 72, 1)",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
