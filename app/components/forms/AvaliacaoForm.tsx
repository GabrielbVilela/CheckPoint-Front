import { AvaliacaoRubricaDTO, AvaliacaoPayload } from "@/services/avaliacoes";
import React, { useMemo, useState } from "react";
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
  rubricas: AvaliacaoRubricaDTO[];
  onSubmit: (payload: AvaliacaoPayload) => Promise<void>;
  onCancel: () => void;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  textarea: {
    height: 90,
    textAlignVertical: "top",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  pickerHint: {
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
});

const AvaliacaoForm: React.FC<Props> = ({ visible, rubricas, onSubmit, onCancel }) => {
  const [contratoId, setContratoId] = useState("");
  const [rubricaId, setRubricaId] = useState<number | null>(rubricas[0]?.id ?? null);
  const [periodo, setPeriodo] = useState("");
  const [feedback, setFeedback] = useState("");
  const [planoAcao, setPlanoAcao] = useState("");
  const [notasJson, setNotasJson] = useState("");
  const [loading, setLoading] = useState(false);

  const rubricaLabel = useMemo(() => {
    if (!rubricaId) {
      return "Selecione uma rubrica";
    }
    return rubricas.find((r) => r.id === rubricaId)?.nome ?? "Selecione uma rubrica";
  }, [rubricas, rubricaId]);

  const handlePickRubrica = () => {
    if (rubricas.length === 0) {
      Alert.alert("Sem rubricas", "Cadastre uma rubrica antes de avaliar.");
      return;
    }
    if (rubricas.length === 1) {
      setRubricaId(rubricas[0].id);
      return;
    }
    Alert.alert(
      "Escolha a rubrica",
      "",
      rubricas.map((rubrica) => ({
        text: rubrica.nome,
        onPress: () => setRubricaId(rubrica.id),
      }))
    );
  };

  const resetForm = () => {
    setContratoId("");
    setRubricaId(rubricas[0]?.id ?? null);
    setPeriodo("");
    setFeedback("");
    setPlanoAcao("");
    setNotasJson("");
  };

  const handleSubmit = async () => {
    if (!contratoId.trim()) {
      Alert.alert("Campos obrigatórios", "Informe o número do contrato.");
      return;
    }
    if (!rubricaId) {
      Alert.alert("Campos obrigatórios", "Escolha a rubrica de avaliação.");
      return;
    }

    const idContratoNum = Number(contratoId.trim());
    if (Number.isNaN(idContratoNum) || idContratoNum <= 0) {
      Alert.alert("Contrato inválido", "O ID do contrato deve ser um número válido.");
      return;
    }

    let notas: Record<string, number> | undefined;
    if (notasJson.trim()) {
      try {
        const parsed = JSON.parse(notasJson);
        if (typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error();
        }
        notas = parsed;
      } catch {
        Alert.alert("Notas inválidas", "As notas devem estar em formato JSON (ex.: {\"criterio\": 5}).");
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit({
        id_contrato: idContratoNum,
        id_rubrica: rubricaId,
        periodo: periodo.trim() || undefined,
        feedback: feedback.trim() || undefined,
        plano_acao: planoAcao.trim() || undefined,
        notas,
      });
      resetForm();
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "Não foi possível registrar a avaliação.";
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
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Nova avaliação</Text>

          <Text style={styles.label}>ID do contrato</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: 1024"
            keyboardType="numeric"
            value={contratoId}
            onChangeText={setContratoId}
          />

          <Text style={styles.label}>Rubrica</Text>
          <TouchableOpacity style={styles.picker} onPress={handlePickRubrica}>
            <Text style={styles.pickerHint}>{rubricaLabel}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Período</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: 2025.1"
            value={periodo}
            onChangeText={setPeriodo}
          />

          <Text style={styles.label}>Feedback</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            multiline
            placeholder="Pontos fortes, oportunidades..."
            value={feedback}
            onChangeText={setFeedback}
          />

          <Text style={styles.label}>Plano de ação</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            multiline
            placeholder="Acordos e próximos passos"
            value={planoAcao}
            onChangeText={setPlanoAcao}
          />

          <Text style={styles.label}>Notas (JSON opcional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            multiline
            placeholder='{"assiduidade": 5, "tecnica": 4}'
            value={notasJson}
            onChangeText={setNotasJson}
            autoCapitalize="none"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AvaliacaoForm;
