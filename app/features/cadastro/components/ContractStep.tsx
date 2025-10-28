import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CadastroAlunoErrors,
  CadastroAlunoForm,
  CadastroDateField,
} from "../types";

/**
 * ContractStep: step responsável por capturar datas de inicio e término do contrato.
 * O componente não faz parsing de strings -> recebe datas em formato texto (dd/mm/yyyy)
 * e delega a conversão e validação para o container (cadastroaluno.tsx / validation.ts).
 */
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
        // onChange: quando o usuário seleciona uma data o callback é acionado.
        // - Em iOS o picker pode ficar aberto (inline), em Android o picker fecha sozinho.
        // - event.type === 'set' indica que o usuário confirmou a data.
        onChange={(event, date) => {
          if (event.type === "set" && date) {
            onChangeDate(activeDateField, date);
          }
          if (Platform.OS === "android") {
            // Fechar o modal/picker após seleção no Android
            onClosePicker();
          }
        }}
        onTouchCancel={onClosePicker}
      />
    );
  };

  return (
    <View>
      {/* Data de início: ao tocar abre o DateTimePicker via onPickDate */}
      <Text style={styles.label}>Data de inicio</Text>
      <TouchableOpacity
        style={[styles.input, errors.dataInicio && styles.inputError]}
        onPress={() => onPickDate("dataInicio")}
      >
        <Text style={form.dataInicio ? styles.inputValue : styles.placeholder}>
          {form.dataInicio || "Selecione a data de inicio"}
        </Text>
      </TouchableOpacity>
      {errors.dataInicio ? (
        <Text style={styles.errorText}>{errors.dataInicio}</Text>
      ) : null}

      {/* Data de término: mesma lógica da data de início */}
      <Text style={styles.label}>Data de termino</Text>
      <TouchableOpacity
        style={[styles.input, errors.dataFim && styles.inputError]}
        onPress={() => onPickDate("dataFim")}
      >
        <Text style={form.dataFim ? styles.inputValue : styles.placeholder}>
          {form.dataFim || "Selecione a data de termino"}
        </Text>
      </TouchableOpacity>
      {errors.dataFim ? (
        <Text style={styles.errorText}>{errors.dataFim}</Text>
      ) : null}

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