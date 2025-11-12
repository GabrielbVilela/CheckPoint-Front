import React from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useLogin } from "src/hooks/useLogin";
import { styles } from "./LoginForm.styles";

const logo = require("src/assets/images/logoblack.png");

export const LoginForm = () => {
  const {
    matricula,
    senha,
    loading,
    fieldErrors,
    handleMatriculaChange,
    handleSenhaChange,
    handleLogin,
  } = useLogin();

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />

      <Text style={styles.title}>Vamos marcar esse momento?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Matricula</Text>
        <TextInput
          placeholder="Digite sua matricula"
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={matricula}
          onChangeText={handleMatriculaChange}
          keyboardType="numeric"
          style={[
            styles.input,
            fieldErrors.matricula.hasError && styles.inputError,
          ]}
        />
        {fieldErrors.matricula.message ? (
          <Text style={styles.errorText}>{fieldErrors.matricula.message}</Text>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          placeholder="Digite sua senha"
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={senha}
          onChangeText={handleSenhaChange}
          secureTextEntry
          style={[
            styles.input,
            fieldErrors.senha.hasError && styles.inputError,
          ]}
        />
        {fieldErrors.senha.message ? (
          <Text style={styles.errorText}>{fieldErrors.senha.message}</Text>
        ) : null}
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
};