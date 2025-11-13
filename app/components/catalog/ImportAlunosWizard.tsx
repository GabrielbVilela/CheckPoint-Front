import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import { AlunoImportPayload, importAlunos } from "@/services/alunos";

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2933",
  },
  description: {
    color: "#555",
    fontSize: 13,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#1976D2",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#1976D2",
    fontWeight: "600",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  previewHeader: {
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  closeText: {
    color: "#1976D2",
    fontWeight: "600",
  },
});

const expectedHeaders = [
  "nome",
  "matricula",
  "senha",
  "celular",
  "email",
  "turma",
  "periodo",
  "cep",
  "logradouro",
  "numero",
  "bairro",
  "cidade",
  "estado",
  "data_inicio",
  "data_final",
];

const ImportAlunosWizard = () => {
  const [parsed, setParsed] = useState<AlunoImportPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultModal, setResultModal] = useState<{ total: number; importados: number; erros: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePickCsv = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "text/csv", copyToCacheDirectory: true });
      if (res.canceled || !res.assets || res.assets.length === 0) {
        return;
      }
      const content = await FileSystem.readAsStringAsync(res.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
      parseCsv(content);
    } catch (err) {
      console.error("CSV error:", err);
      setError("Não foi possível ler o arquivo CSV.");
    } finally {
      setLoading(false);
    }
  };

  const parseCsv = (content: string) => {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      setError("CSV vazio ou sem registros.");
      setParsed([]);
      return;
    }
    const headers = lines[0].split(";").map((h) => h.trim().toLowerCase());
    const missing = expectedHeaders.filter((h) => !headers.includes(h));
    if (missing.length) {
      setError(`CSV faltando colunas obrigatórias: ${missing.join(", ")}`);
      setParsed([]);
      return;
    }
    const registros: AlunoImportPayload[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(";").map((c) => c.trim());
      if (!cols.length || cols.every((c) => c === "")) continue;
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = cols[idx] ?? "";
      });
      registros.push({
        nome: row.nome,
        matricula: row.matricula,
        senha: row.senha || "123456",
        celular: row.celular,
        email: row.email,
        turma: row.turma,
        periodo: row.periodo || undefined,
        cep: row.cep || undefined,
        logradouro: row.logradouro,
        numero: row.numero || undefined,
        bairro: row.bairro || undefined,
        cidade: row.cidade,
        estado: row.estado,
        data_inicio: row.data_inicio || undefined,
        data_final: row.data_final || undefined,
      });
    }
    setParsed(registros);
  };

  const handleImport = async () => {
    if (!parsed.length) {
      Alert.alert("Importação", "Nenhum registro disponível. Faça o upload do CSV primeiro.");
      return;
    }
    setProcessing(true);
    try {
      const response = await importAlunos(parsed);
      setResultModal(response);
      if (response.erros.length === 0) {
        setParsed([]);
      }
    } catch (err: any) {
      console.error("Import error:", err);
      Alert.alert("Erro", err?.response?.data?.detail ?? "Falha ao importar alunos.");
    } finally {
      setProcessing(false);
    }
  };

  const preview = useMemo(() => parsed.slice(0, 5), [parsed]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Importação de alunos (CSV)</Text>
      </View>
      <Text style={styles.description}>
        Use um arquivo CSV com separador “;” e cabeçalho: {expectedHeaders.join(", ")}. Senha pode ser deixada vazia
        (será preenchida automaticamente).
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={handlePickCsv} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Selecionar CSV</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleImport}
          disabled={processing || parsed.length === 0}
        >
          {processing ? (
            <ActivityIndicator color="#1976D2" />
          ) : (
            <Text style={styles.secondaryButtonText}>Enviar ({parsed.length})</Text>
          )}
        </TouchableOpacity>
      </View>

      {parsed.length === 0 ? (
        <Text style={styles.description}>Nenhum registro carregado.</Text>
      ) : (
        <>
          <Text style={styles.description}>Pré-visualização dos primeiros registros:</Text>
          <View>
            <View style={[styles.previewRow, styles.previewHeader]}>
              <Text style={{ flex: 1 }}>Aluno</Text>
              <Text style={{ flex: 1 }}>Matrícula</Text>
              <Text style={{ flex: 1 }}>Turma</Text>
            </View>
            <FlatList
              data={preview}
              keyExtractor={(item, idx) => `${item.matricula}-${idx}`}
              renderItem={({ item }) => (
                <View style={styles.previewRow}>
                  <Text style={{ flex: 1 }}>{item.nome}</Text>
                  <Text style={{ flex: 1 }}>{item.matricula}</Text>
                  <Text style={{ flex: 1 }}>{item.turma}</Text>
                </View>
              )}
            />
          </View>
        </>
      )}

      <Modal transparent visible={!!resultModal} animationType="fade" onRequestClose={() => setResultModal(null)}>
        <TouchableWithoutFeedback onPress={() => setResultModal(null)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setResultModal(null)}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Resultado da importação</Text>
            <Text style={styles.description}>Total no arquivo: {resultModal?.total ?? 0}</Text>
            <Text style={styles.description}>Importados: {resultModal?.importados ?? 0}</Text>
            {resultModal?.erros?.length ? (
              <>
                <Text style={styles.errorText}>Erros encontrados:</Text>
                {resultModal.erros.map((erro) => (
                  <Text key={erro} style={{ color: "#b71c1c", fontSize: 12 }}>
                    • {erro}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={styles.description}>Todos os registros foram importados com sucesso.</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ImportAlunosWizard;
