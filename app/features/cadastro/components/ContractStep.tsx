import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CadastroAlunoErrors,
  CadastroAlunoForm,
  CadastroDateField,
} from "../types";

type ContractStepProps = {
  form: CadastroAlunoForm;
  errors: CadastroAlunoErrors;
  onBack: () => void;
  onSubmit: () => void;
  onPickDate: (field: CadastroDateField) => void;
  showDatePicker: boolean;
  activeDateField: CadastroDateField | null;
  pickerDate: Date;
  onChangeDate: (field: CadastroDateField, date: Date) => void;
  onClosePicker: () => void;
  onChangeField: (field: keyof CadastroAlunoForm, value: string) => void;
  clearError: (field: keyof CadastroAlunoErrors) => void;
  onSelectTurma: () => void;
  onSelectConvenio: () => void;
  onSelectSupervisor: () => void;
  selectionLabels: {
    turma: string;
    convenio: string;
    supervisor: string;
  };
};

export const ContractStep: React.FC<ContractStepProps> = ({
  form,
  errors,
  onBack,
  onSubmit,
  onPickDate,
  showDatePicker,
  activeDateField,
  pickerDate,
  onChangeDate,
  onClosePicker,
  onChangeField,
  clearError,
  onSelectTurma,
  onSelectConvenio,
  onSelectSupervisor,
  selectionLabels,
}) => {
  const renderPicker = () => {
    if (!showDatePicker || !activeDateField) {
      return null;
    }

    return (
      <DateTimePicker
        value={pickerDate}
        mode="date"
        display={Platform.OS === "ios" ? "inline" : "default"}
        onChange={(event, date) => {
          if (event.type === "set" && date) {
            onChangeDate(activeDateField, date);
          }
          if (Platform.OS === "android") {
            onClosePicker();
          }
        }}
        onTouchCancel={onClosePicker}
      />
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Vinculacoes</Text>
      <Text style={styles.label}>Turma vinculada</Text>
      <TouchableOpacity
        style={[styles.selectorButton, errors.turmaId && styles.inputError]}
        onPress={onSelectTurma}
      >
        <Text style={selectionLabels.turma ? styles.selectorValue : styles.placeholder}>
          {selectionLabels.turma || "Selecione a turma"}
        </Text>
      </TouchableOpacity>
      {errors.turmaId ? <Text style={styles.errorText}>{errors.turmaId}</Text> : null}

      <Text style={styles.label}>Convenio</Text>
      <TouchableOpacity
        style={[styles.selectorButton, errors.convenioId && styles.inputError]}
        onPress={onSelectConvenio}
      >
        <Text style={selectionLabels.convenio ? styles.selectorValue : styles.placeholder}>
          {selectionLabels.convenio || "Selecione o Convenio"}
        </Text>
      </TouchableOpacity>
      {errors.convenioId ? <Text style={styles.errorText}>{errors.convenioId}</Text> : null}

      <Text style={styles.label}>Supervisor externo</Text>
      <TouchableOpacity
        style={[styles.selectorButton, errors.supervisorId && styles.inputError]}
        onPress={onSelectSupervisor}
      >
        <Text style={selectionLabels.supervisor ? styles.selectorValue : styles.placeholder}>
          {selectionLabels.supervisor || "Selecione o supervisor"}
        </Text>
      </TouchableOpacity>
      {errors.supervisorId ? <Text style={styles.errorText}>{errors.supervisorId}</Text> : null}

      <Text style={styles.sectionTitle}>Janela prevista</Text>
      <Text style={styles.label}>Hora de inicio prevista</Text>
      <TextInput
        style={[styles.input, errors.horaInicio && styles.inputError]}
        value={form.horaInicio}
        onChangeText={(text) => {
          onChangeField("horaInicio", text);
          clearError("horaInicio");
        }}
        placeholder="HH:MM"
        keyboardType="numeric"
        maxLength={5}
      />
      {errors.horaInicio ? <Text style={styles.errorText}>{errors.horaInicio}</Text> : null}

      <Text style={styles.label}>Hora de termino prevista</Text>
      <TextInput
        style={[styles.input, errors.horaFim && styles.inputError]}
        value={form.horaFim}
        onChangeText={(text) => {
          onChangeField("horaFim", text);
          clearError("horaFim");
        }}
        placeholder="HH:MM"
        keyboardType="numeric"
        maxLength={5}
      />
      {errors.horaFim ? <Text style={styles.errorText}>{errors.horaFim}</Text> : null}

      <View style={styles.fieldRow}>
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>Tolerancia (min)</Text>
          <TextInput
            style={[styles.input, errors.tolerancia && styles.inputError]}
            value={form.tolerancia}
            onChangeText={(text) => {
              onChangeField("tolerancia", text);
              clearError("tolerancia");
            }}
            keyboardType="numeric"
            placeholder="Ex.: 10"
            maxLength={3}
          />
          {errors.tolerancia ? <Text style={styles.errorText}>{errors.tolerancia}</Text> : null}
        </View>
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>Raio permitido (m)</Text>
          <TextInput
            style={[styles.input, errors.raio && styles.inputError]}
            value={form.raio}
            onChangeText={(text) => {
              onChangeField("raio", text);
              clearError("raio");
            }}
            keyboardType="numeric"
            placeholder="Ex.: 100"
            maxLength={4}
          />
          {errors.raio ? <Text style={styles.errorText}>{errors.raio}</Text> : null}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Datas do contrato</Text>
      <Text style={styles.label}>Data de inicio</Text>
      <TouchableOpacity
        style={[styles.input, errors.dataInicio && styles.inputError]}
        onPress={() => onPickDate("dataInicio")}
      >
        <Text style={form.dataInicio ? styles.inputValue : styles.placeholder}>
          {form.dataInicio || "Selecione a data de inicio"}
        </Text>
      </TouchableOpacity>
      {errors.dataInicio ? <Text style={styles.errorText}>{errors.dataInicio}</Text> : null}

      <Text style={styles.label}>Data de termino</Text>
      <TouchableOpacity
        style={[styles.input, errors.dataFim && styles.inputError]}
        onPress={() => onPickDate("dataFim")}
      >
        <Text style={form.dataFim ? styles.inputValue : styles.placeholder}>
          {form.dataFim || "Selecione a data de termino"}
        </Text>
      </TouchableOpacity>
      {errors.dataFim ? <Text style={styles.errorText}>{errors.dataFim}</Text> : null}

      {renderPicker()}

      <View style={styles.row}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={onSubmit}>
          <Text style={styles.buttonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: 12,
    marginTop: 8,
  },
  label: {
    color: "#555",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  selectorButton: {
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  selectorValue: {
    color: "#111",
    fontWeight: "600",
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
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
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

export default ContractStep;
