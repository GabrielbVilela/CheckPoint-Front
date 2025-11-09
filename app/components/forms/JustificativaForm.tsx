import { JustificativaPayload } from "@/services/justificativas";
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
  onSubmit: (payload: JustificativaPayload) => Promise<void>;
  onCancel: () => void;
  defaultTipo?: string;
  defaultMotivo?: string;
  defaultContratoId?: number;
};

const styles = StyleSheet.create({
  backLayer: {
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
  row: {
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

const JustificativaForm: React.FC<Props> = ({
  visible,
  contratos,
  onSubmit,
  onCancel,
  defaultTipo = "",
  defaultMotivo = "",
  defaultContratoId,
}) => {
  const [tipo, setTipo] = useState(defaultTipo);
  const [motivo, setMotivo] = useState(defaultMotivo);
  const [contratoId, setContratoId] = useState<number | null>(defaultContratoId ?? null);
  const [dataReferencia, setDataReferencia] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  useEffect(() => {
    if (!visible) {
      return;
    }
    setTipo(defaultTipo);
    setMotivo(defaultMotivo);
    setDataReferencia("");
    setContratoId(defaultContratoId ?? contratos[0]?.id ?? null);
    setPickerSearch("");
    setPickerVisible(false);
  }, [visible, defaultTipo, defaultMotivo, defaultContratoId, contratos]);

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

  const ensureContratoDisponivel = () => {
    if (contratos.length === 0) {
      Alert.alert("Sem contratos", "Nenhum contrato disponivel.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!contratoId) {
      Alert.alert("Campos obrigatorios", "Selecione um contrato.");
      return;
    }
    if (!tipo.trim()) {
      Alert.alert("Campos obrigatorios", "Informe o tipo da justificativa.");
      return;
    }
    if (!motivo.trim()) {
      Alert.alert("Campos obrigatorios", "Descreva o motivo.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        id_contrato: contratoId,
        tipo: tipo.trim(),
        motivo: motivo.trim(),
        data_referencia: dataReferencia.trim() || undefined,
      });
      setTipo("");
      setMotivo("");
      setContratoId(null);
      setDataReferencia("");
      onCancel();
    } catch (error: any) {
      const detail = error?.response?.data?.detail ?? "Nao foi possivel enviar a justificativa.";
      Alert.alert("Erro", detail);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backLayer} />
      </TouchableWithoutFeedback>

      <View style={styles.backLayer}>
        <View style={styles.container}>
          <Text style={styles.title}>Nova justificativa</Text>

          <Text style={styles.label}>Contrato</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => {
              if (!ensureContratoDisponivel()) {
                return;
              }
              setPickerVisible(true);
            }}
          >
            <Text style={styles.pickerValue}>{contratoLabel}</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>
            Escolha o contrato relacionado à justificativa. Em caso de dúvidas, fale com a coordenação.
          </Text>

          <Text style={styles.label}>Tipo</Text>
          <TextInput
            style={styles.input}
            value={tipo}
            onChangeText={setTipo}
            placeholder="Ex.: ajuste de ponto, ausencia..."
          />

          <Text style={styles.label}>Motivo</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={motivo}
            onChangeText={setMotivo}
            placeholder="Descreva o contexto e a justificativa."
            multiline
          />

          <Text style={styles.label}>Data de referencia</Text>
          <TextInput
            style={styles.input}
            value={dataReferencia}
            onChangeText={setDataReferencia}
            placeholder="AAAA-MM-DD (opcional)"
          />

          <View style={styles.row}>
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
                <Text style={[styles.buttonText, styles.submitText]}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={pickerVisible} onRequestClose={() => setPickerVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setPickerVisible(false)}>
          <View style={styles.backLayer} />
        </TouchableWithoutFeedback>
        <View style={styles.backLayer}>
          <View style={styles.pickerModal}>
            <Text style={styles.title}>Selecione o contrato</Text>
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

export default JustificativaForm;
