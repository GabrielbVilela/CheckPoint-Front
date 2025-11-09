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

import useEmpresas from "@/hooks/useEmpresas";
import { EmpresaDTO } from "@/services/catalogos";

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
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginVertical: 16,
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
  filterPill: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterPillActive: {
    backgroundColor: "#e1f5fe",
    borderColor: "#0288D1",
  },
  filterPillText: {
    color: "#555",
    fontSize: 12,
  },
  filterPillTextActive: {
    color: "#01579b",
    fontSize: 12,
    fontWeight: "600",
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
});

const CompanyManager = () => {
  const { empresas, loading, error, refresh, createEmpresa, updateEmpresa, deleteEmpresa, submitting } = useEmpresas();
  const [modalVisible, setModalVisible] = useState(false);
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaDTO | null>(null);

  const data = useMemo(() => {
    const term = search.trim().toLowerCase();
    return empresas
      .filter((empresa) => {
        const base = `${empresa.nome_fantasia ?? ""} ${empresa.razao_social}`.toLowerCase();
        return base.includes(term);
      })
      .sort((a, b) => (a.nome_fantasia ?? a.razao_social).localeCompare(b.nome_fantasia ?? b.razao_social));
  }, [empresas, search]);

  const resetForm = () => {
    setRazaoSocial("");
    setNomeFantasia("");
    setCnpj("");
    setTelefone("");
    setEmail("");
    setEditingEmpresa(null);
  };

  const handleSubmit = async () => {
    if (!razaoSocial.trim()) {
      Alert.alert("Campos obrigatórios", "Informe a razão social.");
      return;
    }
    try {
      const payload = {
        razao_social: razaoSocial.trim(),
        nome_fantasia: nomeFantasia.trim() || undefined,
        cnpj: cnpj.trim() || undefined,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
      };
      if (editingEmpresa) {
        await updateEmpresa(editingEmpresa.id, payload);
        Alert.alert("Empresa atualizada", "Dados atualizados com sucesso.");
      } else {
        await createEmpresa(payload);
        Alert.alert("Empresa criada", "Empresa cadastrada com sucesso.");
      }
      resetForm();
      setModalVisible(false);
    } catch {
      // erro exibido pelo hook
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Empresas conveniadas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addText}>Nova empresa</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { marginBottom: 12 }]}
        placeholder="Buscar empresa..."
        value={search}
        onChangeText={setSearch}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
        <TouchableOpacity
          style={[styles.filterPill, styles.filterPillActive]}
          onPress={() => refresh()}
        >
          <Text style={styles.filterPillTextActive}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {loading ? (
        <ActivityIndicator />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>
          {search.trim() ? "Nenhuma empresa corresponde à busca." : "Nenhuma empresa cadastrada."}
        </Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.itemTitle}>{item.nome_fantasia ?? item.razao_social}</Text>
              <Text style={styles.itemSubtitle}>
                CNPJ: {item.cnpj ?? "-"} · Telefone: {item.telefone ?? "-"} · Email: {item.email ?? "-"}
              </Text>
              <View style={styles.listActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingEmpresa(item);
                    setRazaoSocial(item.razao_social);
                    setNomeFantasia(item.nome_fantasia ?? "");
                    setCnpj(item.cnpj ?? "");
                    setTelefone(item.telefone ?? "");
                    setEmail(item.email ?? "");
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    Alert.alert(
                      "Remover empresa",
                      "Esta ação não pode ser desfeita. Deseja continuar?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Remover",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await deleteEmpresa(item.id);
                              Alert.alert("Empresa removida", "Registro excluído com sucesso.");
                            } catch {
                              /* erro tratado no hook */
                            }
                          },
                        },
                      ]
                    )
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
            <Text style={styles.title}>{editingEmpresa ? "Editar empresa" : "Cadastrar empresa"}</Text>

            <Text style={styles.label}>Razão social</Text>
            <TextInput style={styles.input} value={razaoSocial} onChangeText={setRazaoSocial} placeholder="Nome legal" />

            <Text style={styles.label}>Nome fantasia</Text>
            <TextInput
              style={styles.input}
              value={nomeFantasia}
              onChangeText={setNomeFantasia}
              placeholder="Nome comercial"
            />

            <Text style={styles.label}>CNPJ</Text>
            <TextInput style={styles.input} value={cnpj} onChangeText={setCnpj} placeholder="00.000.000/0000-00" />

            <Text style={styles.label}>Telefone</Text>
            <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="(00) 0000-0000" />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="contato@empresa.com"
              autoCapitalize="none"
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

export default CompanyManager;
