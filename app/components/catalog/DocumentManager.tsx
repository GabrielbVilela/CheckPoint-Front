import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import useDocumentos from "@/hooks/useDocumentos";
import { DocumentoDTO, DocumentoTipo, uploadDocumentoFile } from "@/services/documentos";

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
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  addText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  listItem: {
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingVertical: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  itemSubtitle: {
    color: "#666",
    fontSize: 12,
  },
  listActions: {
    flexDirection: "row",
    marginTop: 6,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#555",
  },
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginVertical: 16,
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
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
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  modalButton: {
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
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#0288D1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 12,
  },
  uploadButtonText: {
    color: "#0277BD",
    fontWeight: "600",
  },
  fileInfoText: {
    color: "#555",
    fontSize: 12,
    flex: 1,
  },
});

const documentTypeLabels: Record<DocumentoTipo, string> = {
  tce: "TCE",
  plano_atividades: "Plano de Atividades",
  aditivo: "Aditivo",
  outro: "Outro",
};

const DocumentManager = () => {
  const { documentos, loading, error, refresh, createDocumento, updateDocumento, deleteDocumento, submitting } =
    useDocumentos();
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoDocumento, setEditandoDocumento] = useState<DocumentoDTO | null>(null);
  const [contratoId, setContratoId] = useState("");
  const [tipo, setTipo] = useState<DocumentoTipo>("tce");
  const [arquivoUrl, setArquivoUrl] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState("pendente");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const data = useMemo(() => documentos.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()), [documentos]);

  const resetForm = () => {
    setContratoId("");
    setTipo("tce");
    setArquivoUrl("");
    setObservacoes("");
    setStatus("pendente");
    setEditandoDocumento(null);
    setSelectedFileName(null);
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) {
        return;
      }
      const asset = result.assets[0];
      setUploadingFile(true);
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const response = await uploadDocumentoFile({
        filename: asset.name ?? "documento.pdf",
        content_base64: base64,
      });
      setArquivoUrl(response.url);
      setSelectedFileName(asset.name ?? "arquivo enviado");
      Alert.alert("Upload concluído", "Arquivo anexado ao documento.");
    } catch (err) {
      console.error("Erro ao anexar arquivo:", err);
      Alert.alert("Erro", "Não foi possível anexar o arquivo. Tente novamente.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async () => {
    if (!contratoId.trim()) {
      Alert.alert("Campos obrigatórios", "Informe o ID do contrato.");
      return;
    }
    const idContratoNum = Number(contratoId.trim());
    if (Number.isNaN(idContratoNum)) {
      Alert.alert("Contrato inválido", "Use apenas números.");
      return;
    }
    try {
      if (editandoDocumento) {
        await updateDocumento(editandoDocumento.id, {
          id_contrato: idContratoNum,
          tipo,
          arquivo_url: arquivoUrl.trim() || undefined,
          observacoes: observacoes.trim() || undefined,
          status,
        });
        Alert.alert("Documento atualizado", "Registro atualizado com sucesso.");
      } else {
        await createDocumento({
          id_contrato: idContratoNum,
          tipo,
          arquivo_url: arquivoUrl.trim() || undefined,
          observacoes: observacoes.trim() || undefined,
        });
        Alert.alert("Documento criado", "Registro criado com sucesso.");
      }
      resetForm();
      setModalVisible(false);
    } catch {
      // hook já exibe erro
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Documentos (TCE/Planos)</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addText}>Novo documento</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {loading ? (
        <ActivityIndicator />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum documento cadastrado.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.itemTitle}>
                {documentTypeLabels[item.tipo as DocumentoTipo] ?? item.tipo} · Contrato #{item.id_contrato}
              </Text>
              <Text style={styles.itemSubtitle}>
                Status: {item.status.toUpperCase()} · Última atualização: {new Date(item.atualizado_em).toLocaleDateString("pt-BR")}
              </Text>
              <View style={styles.listActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditandoDocumento(item);
                    setContratoId(String(item.id_contrato));
                    setTipo(item.tipo as DocumentoTipo);
                    setArquivoUrl(item.arquivo_url ?? "");
                    setSelectedFileName(item.arquivo_url ? item.arquivo_url.split("/").pop() ?? item.arquivo_url : null);
                    setObservacoes(item.observacoes ?? "");
                    setStatus(item.status ?? "pendente");
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    Alert.alert("Remover documento", "Confirma remoção?", [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Remover",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await deleteDocumento(item.id);
                            Alert.alert("Documento removido", "Registro excluído.");
                          } catch {
                            // erro tratado
                          }
                        },
                      },
                    ])
                  }
                >
                  <Text style={styles.actionText}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          onRefresh={refresh}
          refreshing={loading}
        />
      )}

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>{editandoDocumento ? "Editar documento" : "Cadastrar documento"}</Text>

            <Text style={styles.label}>Contrato</Text>
            <TextInput
              style={styles.input}
              value={contratoId}
              onChangeText={setContratoId}
              placeholder="ID do contrato"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Tipo</Text>
            <TextInput
              style={styles.input}
              value={tipo}
              onChangeText={(text) => setTipo((text as DocumentoTipo) || "outro")}
              placeholder="tce, plano_atividades, aditivo..."
            />

            <Text style={styles.label}>URL do arquivo (opcional)</Text>
            <TextInput
              style={styles.input}
              value={arquivoUrl}
              onChangeText={setArquivoUrl}
              placeholder="https://..."
              autoCapitalize="none"
            />
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.uploadButton} onPress={handlePickFile} disabled={uploadingFile}>
                {uploadingFile ? (
                  <ActivityIndicator color="#0277BD" />
                ) : (
                  <Text style={styles.uploadButtonText}>Selecionar arquivo</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.fileInfoText}>
                {selectedFileName
                  ? `Anexo: ${selectedFileName}`
                  : "Nenhum arquivo anexado. Você pode colar um link ou enviar um arquivo."}
              </Text>
            </View>

            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              value={observacoes}
              onChangeText={setObservacoes}
              placeholder="Descrição adicional"
              multiline
            />

            <Text style={styles.label}>Status</Text>
            <TextInput
              style={styles.input}
              value={status}
              onChangeText={setStatus}
              placeholder="pendente, assinado, em revisão..."
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
                disabled={submitting}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DocumentManager;
