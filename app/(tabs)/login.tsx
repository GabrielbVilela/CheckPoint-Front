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

// 1. Importa os novos serviços e a store
import { useRouter } from "expo-router";
import api from "../services/api";
import { useAuthStore, UserRole } from "../store/authStore";

export default function LoginScreen() {
  // 2. Corrigido para 'matricula' em vez de 'email', alinhado ao backend
  const [matricula, setMatricula] = useState(""); 
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  // 3. Obtém a função de login do Zustand
  const login = useAuthStore((state) => state.login); 

  const handleLogin = async () => {
    if (matricula === "" || senha === "") {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      // 4. Usa o cliente API (Axios) configurado
      const response = await api.post("/login", {
        matricula, 
        senha,
      });

      // Assumimos que o backend FastAPI retorna 'token' e 'tipo_acesso'
      const { token, tipo_acesso: userRole } = response.data; 

      if (token && userRole) {
        // 5. Armazena o estado globalmente e inicia a sessão
        login(token, userRole as UserRole); 
        
        // 6. Redirecionamento de acordo com o perfil
        if (userRole === 'aluno') {
          // Redireciona para a rota principal das abas (Bater Ponto)
          router.replace("/(tabs)"); 
        }
      } else {
        Alert.alert("Erro", "Resposta da API incompleta. Token ou perfil ausente.");
      }
    } catch (error: any) {
      // Tratamento de erro detalhado
      const errorMessage = error.response?.data?.detail || "Não foi possível conectar ou Matrícula/Senha inválida.";
      Alert.alert("Erro de Login", errorMessage);
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperar = () => {
    Alert.alert("Funcionalidade em desenvolvimento", "Em breve a recuperação de senha estará disponível.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, Bem vindo.</Text>

      {/* Campo Matrícula */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua Matrícula"
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={matricula}
          onChangeText={setMatricula}
          autoCapitalize="none"
          keyboardType="numeric" 
          editable={!loading}
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
          editable={!loading}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading 
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Entrar</Text>
        }
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
  // Seus estilos anteriores
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