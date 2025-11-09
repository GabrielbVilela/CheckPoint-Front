import { DiarioPayload } from "@/services/diarios";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  contratos: { id: number; label: string }[];
  onSubmit: (payload: DiarioPayload) => Promise<void>;
  onCancel: () => void;
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
  },
  title: {
    color: "#111",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderColor: "#ddd",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  picker: {
    borderColor: "#ddd",
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  pickerValue: {
    color: "#111",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  buttonText: {
    color: "#111",
    fontWeight: "600",
  },
  submitText: {
    color: "#fff",
  },
  helperText: {
    color: "#777",
    fontSize: 12,
    marginBottom: 8,
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: "70%",
    padding: 16,
    width: "90%",
  },
  pickerSearch: {
    borderColor: "#ddd",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickerItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  pickerItemText: {
    color: "#111",
    fontSize: 14,
  },
});

const DiarioForm: React.FC<Props> = ({ visible, contratos, onSubmit, onCancel }) => {
  const [contratoId, setContratoId] = useState<number | null>(contratos[0]?.id ?? null);
  const [dataReferencia, setDataReferencia] = useState("");
  const [resumo, setResumo] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [anexoUrl, setAnexoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  useEffect(() => {
    if (!visible) {
      return;
    }
    setContratoId(contratos[0]?.id ?? null);
    setDataReferencia("");
    setResumo("");
    setDetalhes("");
    setAnexoUrl("");
    setPickerSearch("");
    setPickerVisible(false);
  }, [visible, contratos]);

  useEffect(() => {
    if (contratos.length === 0) {
      setContratoId(null);
      return;
    }
    if (contratoId === null || !contratos.some((c) => c.id === contratoId)) {
      setContratoId(contratos[0].id);
    }
  }, [contratos, contratoId]);

  const contratoLabel = useMemo(
    () => contratos.find((c) => c.id === contratoId)?.label ?? "Selecione...",
    [contratos, contratoId]
  );

  const filteredContratos = useMemo(() => {
    const term = pickerSearch.trim().toLowerCase();
    return contratos.filter((item) => item.label.toLowerCase().includes(term));
  }, [contratos, pickerSearch]);

  const handleSubmit = async () => {
    if (!contratoId) {
      Alert.alert("Campos obrigatorios", "Selecione um contrato.");
      return;
    }
    if (!resumo.trim()) {
      Alert.alert("Campos obrigatorios", "Informe um resumo.");
      return;
    }
    if (!dataReferencia.trim()) {
      Alert.alert("Campos obrigatorios", "Informe a data de referencia (AAAA-MM-DD).");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        id_contrato: contratoId,
        data_referencia: dataReferencia.trim(),
        resumo: resumo.trim(),
        detalhes: detalhes.trim() || undefined,
        anexo_url: anexoUrl.trim() || undefined,
      });
      setResumo("");
      setDetalhes("");
      setAnexoUrl("");
      setDataReferencia("");
      onCancel();
    } catch (error: any) {
      const detail = error?.response?.data?.detail ?? "Nao foi possivel registrar o diario.";
      Alert.alert("Erro", detail);
    } finally {
      setLoading(false);
    }
  };

  const handleContratoPress = () => {
    if (contratos.length === 0) {
      Alert.alert("Sem contratos", "Nenhum contrato disponivel.");
      return;
    }
    setPickerVisible(true);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Registro de diario</Text>

          <Text style={styles.label}>Contrato</Text>
          <TouchableOpacity style={styles.picker} onPress={handleContratoPress}>
            <Text style={styles.pickerValue}>{contratoLabel}</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Selecione o contrato para associar o diário de atividades.</Text>

          <Text style={styles.label}>Data de referencia</Text>
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-DD"
            value={dataReferencia}
            onChangeText={setDataReferencia}
          />

          <Text style={styles.label}>Resumo</Text>
          <TextInput
            style={styles.input}
            placeholder="Descricao breve das atividades"
            value={resumo}
            onChangeText={setResumo}
          />

          <Text style={styles.label}>Detalhes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detalhe o que foi executado (opcional)"
            value={detalhes}
            onChangeText={setDetalhes}
            multiline
          />

          <Text style={styles.label}>Link do anexo</Text>
          <TextInput
            style={styles.input}
            placeholder="URL do anexo (opcional)"
            value={anexoUrl}
            onChangeText={setAnexoUrl}
            autoCapitalize="none"
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel} disabled={loading}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, styles.submitText]}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={pickerVisible} onRequestClose={() => setPickerVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setPickerVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.overlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.title}>Escolha o contrato</Text>
            <TextInput
              style={styles.pickerSearch}
              placeholder="Buscar..."
              value={pickerSearch}
              onChangeText={setPickerSearch}
            />
            {filteredContratos.length === 0 ? (
              <Text style={styles.helperText}>Nenhum contrato corresponde à busca.</Text>
            ) : (
              filteredContratos.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setContratoId(item.id);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default DiarioForm;
