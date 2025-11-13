import React, { useEffect, useMemo, useState } from "react";
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

import StudentWizardModal from "@/components/catalog/StudentWizardModal";
import useAlunosCatalog from "@/hooks/useAlunosCatalog";
import { AlunoResumo, deleteAluno, updateAluno } from "@/services/alunos";

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
    alignItems: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2933",
  },
  description: {
    color: "#555",
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  refreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginVertical: 16,
  },
  itemRow: {
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingVertical: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  itemMeta: {
    color: "#555",
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    color: "#d32f2f",
    marginTop: 12,
  },
  rowActions: {
    flexDirection: "row",
    marginTop: 6,
  },
  smallButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  secondaryButton: {
    backgroundColor: "#2563EB",
  },
  rejectButton: {
    backgroundColor: "#E53935",
    marginLeft: 8,
  },
  smallButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  editOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  editCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  submitButton: {
    backgroundColor: "#2563EB",
  },
});

const StudentManager = () => {
  const [wizardVisible, setWizardVisible] = useState(false);
  const [search, setSearch] = useState("");
  const { alunos, loading, error, load, refresh } = useAlunosCatalog();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAluno, setEditingAluno] = useState<AlunoResumo | null>(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    celular: "",
    turma: "",
    periodo: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!search.trim()) {
      return;
    }
    const handler = setTimeout(() => {
      load({ search });
    }, 400);
    return () => clearTimeout(handler);
  }, [load, search]);

  const handleEditSubmit = async () => {
    if (!editingAluno) {
      return;
    }
    setSavingEdit(true);
    try {
      await updateAluno(editingAluno.id, {
        nome: editForm.nome.trim() || undefined,
        email: editForm.email.trim() || undefined,
        contato: editForm.celular.trim() || undefined,
        turma: editForm.turma.trim() || undefined,
        periodo: editForm.periodo.trim() || undefined,
      });
      refresh();
      setEditModalVisible(false);
      setEditingAluno(null);
    } catch (err: any) {
      console.error("Falha ao atualizar aluno:", err);
      const detail = err?.response?.data?.detail ?? "Nao foi possivel atualizar o aluno.";
      Alert.alert("Erro", detail);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemoveAluno = (aluno: AlunoResumo) => {
    Alert.alert(
      "Excluir aluno",
      `Tem certeza que deseja remover ${aluno.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setRemovingId(aluno.id);
            try {
              await deleteAluno(aluno.id);
              refresh();
            } catch (err: any) {
              console.error("Falha ao remover aluno:", err);
              const detail = err?.response?.data?.detail ?? "Nao foi possivel remover o aluno.";
              Alert.alert("Erro", detail);
            } finally {
              setRemovingId(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const listData = useMemo(() => alunos.slice(0, 50), [alunos]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (!value.trim()) {
      refresh();
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.title}>Cadastro individual de aluno</Text>
            <Text style={styles.description}>
              Execute o fluxo completo (dados pessoais + endereco + contrato) e acompanhe os ultimos cadastros criados.
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => setWizardVisible(true)}>
            <Text style={styles.buttonText}>Novo aluno</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome, matricula, email ou turma..."
          value={search}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          onSubmitEditing={() => load({ search })}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Ultimos cadastros ({alunos.length})</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refresh} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.refreshText}>Atualizar</Text>}
          </TouchableOpacity>
        </View>

        {loading && alunos.length === 0 ? (
          <ActivityIndicator />
        ) : listData.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum aluno encontrado.</Text>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemMeta}>
                  Matricula {item.matricula} - Turma {item.turma ?? "-"} - Email {item.email}
                </Text>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    style={[styles.smallButton, styles.secondaryButton]}
                    onPress={() => {
                      setEditingAluno(item);
                      setEditForm({
                        nome: item.nome,
                        email: item.email,
                        celular: item.celular ?? "",
                        turma: item.turma ?? "",
                        periodo: item.periodo ?? "",
                      });
                      setEditModalVisible(true);
                    }}
                  >
                    <Text style={styles.smallButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallButton, styles.rejectButton]}
                    onPress={() => handleRemoveAluno(item)}
                    disabled={removingId === item.id}
                  >
                    {removingId === item.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.smallButtonText}>Excluir</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
            refreshing={loading}
            onRefresh={refresh}
          />
        )}
      </View>

      <StudentWizardModal
        visible={wizardVisible}
        onClose={() => setWizardVisible(false)}
        onSuccess={() => {
          setWizardVisible(false);
          refresh();
        }}
      />

      <Modal transparent animationType="fade" visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.editOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.editOverlay}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Editar aluno</Text>
            <TextInput
              style={styles.editInput}
              placeholder="Nome"
              value={editForm.nome}
              onChangeText={(value) => setEditForm((prev) => ({ ...prev, nome: value }))}
            />
            <TextInput
              style={styles.editInput}
              placeholder="Email"
              value={editForm.email}
              onChangeText={(value) => setEditForm((prev) => ({ ...prev, email: value }))}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.editInput}
              placeholder="Celular"
              value={editForm.celular}
              onChangeText={(value) => setEditForm((prev) => ({ ...prev, celular: value }))}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.editInput}
              placeholder="Turma"
              value={editForm.turma}
              onChangeText={(value) => setEditForm((prev) => ({ ...prev, turma: value }))}
            />
            <TextInput
              style={styles.editInput}
              placeholder="Periodo"
              value={editForm.periodo}
              onChangeText={(value) => setEditForm((prev) => ({ ...prev, periodo: value }))}
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.smallButton, styles.cancelButton]}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingAluno(null);
                }}
                disabled={savingEdit}
              >
                <Text style={styles.smallButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton, styles.submitButton]}
                onPress={handleEditSubmit}
                disabled={savingEdit}
              >
                {savingEdit ? <ActivityIndicator color="#fff" /> : <Text style={styles.smallButtonText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default StudentManager;
