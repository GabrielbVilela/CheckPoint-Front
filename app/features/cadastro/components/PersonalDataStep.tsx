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
 * PersonalDataStep: campos de dados pessoais e contato.
 * - onOpenPeriodoModal: abre o modal para seleção de período (PeriodoModal)
 * - clearError é usado para limpar mensagens de validação ao editar cada campo
 */
type PersonalDataStepProps = {
  form: CadastroAlunoForm;
  errors: CadastroAlunoErrors;
  onChange: (field: keyof CadastroAlunoForm, value: string) => void;
  onNext: () => void;
  onOpenPeriodoModal: () => void;
  clearError: (field: keyof CadastroAlunoErrors) => void;
};

export const PersonalDataStep: React.FC<PersonalDataStepProps> = ({
  form,
  errors,
  onChange,
  onNext,
  onOpenPeriodoModal,
  clearError,
}) => {
  return (
    <View>
      {/* Nome: validações mais estritas aplicadas no validation.ts */}
      <Text style={styles.label}>Nome completo</Text>
      <TextInput
        style={[styles.input, errors.nome && styles.inputError]}
        value={form.nome}
        onChangeText={(text) => {
          onChange("nome", text);
          clearError("nome");
        }}
        placeholder="Digite o nome completo"
      />
      {errors.nome ? <Text style={styles.errorText}>{errors.nome}</Text> : null}

      <Text style={styles.label}>Matricula</Text>
      <TextInput
        style={[styles.input, errors.matricula && styles.inputError]}
        value={form.matricula}
        onChangeText={(text) => {
          onChange("matricula", text);
          clearError("matricula");
        }}
        placeholder="Digite a matricula"
        keyboardType="numeric"
      />
      {errors.matricula ? (
        <Text style={styles.errorText}>{errors.matricula}</Text>
      ) : null}

      {/* Celular: esperar que formatters sejam aplicados no container (ex: formatPhone) */}
      <Text style={styles.label}>Celular</Text>
      <TextInput
        style={[styles.input, errors.celular && styles.inputError]}
        value={form.celular}
        onChangeText={(text) => {
          onChange("celular", text);
          clearError("celular");
        }}
        placeholder="(DD) 90000-0000"
        keyboardType="phone-pad"
      />
      {errors.celular ? (
        <Text style={styles.errorText}>{errors.celular}</Text>
      ) : null}

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        value={form.email}
        onChangeText={(text) => {
          onChange("email", text);
          clearError("email");
        }}
        placeholder="exemplo@dominio.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email ? (
        <Text style={styles.errorText}>{errors.email}</Text>
      ) : null}

      <Text style={styles.label}>Turma</Text>
      <TextInput
        style={[styles.input, errors.turma && styles.inputError]}
        value={form.turma}
        onChangeText={(text) => {
          onChange("turma", text);
          clearError("turma");
        }}
        placeholder="Turma"
      />
      {errors.turma ? (
        <Text style={styles.errorText}>{errors.turma}</Text>
      ) : null}

      {/* Periodo: este campo é um botão que abre o modal de seleção (PeriodoModal) */}
      <Text style={styles.label}>Periodo</Text>
      <TouchableOpacity
        style={[styles.input, styles.inputButton, errors.periodo && styles.inputError]}
        onPress={onOpenPeriodoModal}
      >
        <Text style={form.periodo ? styles.inputValue : styles.placeholder}>
          {form.periodo || "Selecione o periodo"}
        </Text>
      </TouchableOpacity>
      {errors.periodo ? (
        <Text style={styles.errorText}>{errors.periodo}</Text>
      ) : null}

      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>Proximo</Text>
      </TouchableOpacity>
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
  inputButton: {
    justifyContent: "center",
  },
  inputValue: {
    color: "#000",
  },
  placeholder: {
    color: "#999",
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
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#42a148",
    borderRadius: 8,
    marginTop: 10,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PersonalDataStep;