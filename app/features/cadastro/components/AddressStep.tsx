import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CadastroAlunoErrors, CadastroAlunoForm } from "../types";

/**
 * Props do componente AddressStep
 * - form: estado atual do formulário (sub-objeto de endereço)
 * - errors: mensagens de erro retornadas pela validação
 * - onChange: atualiza um campo do form
 * - onNext / onBack: controle de navegação entre steps
 * - clearError: limpa um erro específico quando o usuário edita o campo
 */
type AddressStepProps = {
  form: CadastroAlunoForm;
  errors: CadastroAlunoErrors;
  onChange: (field: keyof CadastroAlunoForm, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  clearError: (field: keyof CadastroAlunoErrors) => void;
};

export const AddressStep: React.FC<AddressStepProps> = ({
  form,
  errors,
  onChange,
  onNext,
  onBack,
  clearError,
}) => {
  return (
    <View>
      {/* CEP: usa keyboard numeric e aplica máscara via onChange no container */}
      <Text style={styles.label}>CEP</Text>
      <TextInput
        style={[styles.input, errors.cep && styles.inputError]}
        value={form.cep}
        onChangeText={(text) => {
          onChange("cep", text);
          clearError("cep");
        }}
        placeholder="00000-000"
        keyboardType="numeric"
      />
      {errors.cep ? <Text style={styles.errorText}>{errors.cep}</Text> : null}

      <Text style={styles.label}>Logradouro</Text>
      <TextInput
        style={[styles.input, errors.logradouro && styles.inputError]}
        value={form.logradouro}
        onChangeText={(text) => {
          onChange("logradouro", text);
          clearError("logradouro");
        }}
        placeholder="Rua, avenida, etc."
      />
      {errors.logradouro ? (
        <Text style={styles.errorText}>{errors.logradouro}</Text>
      ) : null}

      <Text style={styles.label}>Numero</Text>
      <TextInput
        style={[styles.input, errors.numero && styles.inputError]}
        value={form.numero}
        onChangeText={(text) => {
          onChange("numero", text);
          clearError("numero");
        }}
        placeholder="Numero"
        keyboardType="numeric"
      />
      {errors.numero ? (
        <Text style={styles.errorText}>{errors.numero}</Text>
      ) : null}

      <Text style={styles.label}>Cidade</Text>
      <TextInput
        style={[styles.input, errors.cidade && styles.inputError]}
        value={form.cidade}
        onChangeText={(text) => {
          onChange("cidade", text);
          clearError("cidade");
        }}
        placeholder="Cidade"
      />
      {errors.cidade ? (
        <Text style={styles.errorText}>{errors.cidade}</Text>
      ) : null}

      {/* Estado (UF): força maiúsculas e limita a 2 chars */}
      <Text style={styles.label}>Estado</Text>
      <TextInput
        style={[styles.input, errors.estado && styles.inputError]}
        value={form.estado}
        onChangeText={(text) => {
          onChange("estado", text.toUpperCase());
          clearError("estado");
        }}
        placeholder="UF"
        maxLength={2}
        autoCapitalize="characters"
      />
      {errors.estado ? (
        <Text style={styles.errorText}>{errors.estado}</Text>
      ) : null}

      <View style={styles.row}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
          <Text style={styles.buttonText}>Proximo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: "#555",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: "100%",
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "#e53935",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#4a4a4a",
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#42a148",
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

