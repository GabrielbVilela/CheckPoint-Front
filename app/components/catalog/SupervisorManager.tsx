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
import useSupervisores from "@/hooks/useSupervisores";
import { SupervisorExternoDTO } from "@/services/catalogos";

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
    backgroundColor: "#ede7f6",
    borderColor: "#673AB7",
  },
  filterPillText: {
    color: "#555",
    fontSize: 12,
  },
  filterPillTextActive: {
    color: "#311B92",
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
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  pickerText: {
    color: "#555",
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

const SupervisorManager = () => {
  const { supervisores, loading, error, refresh, createSupervisor, updateSupervisor, deleteSupervisor, submitting } =
    useSupervisores();
  const { empresas, loading: loadingEmpresas, error: empresasError, refresh: refreshEmpresas } = useEmpresas();

  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");
  const [search, setSearch] = useState("");
  const [empresaFilterId, setEmpresaFilterId] = useState<number | null>(null);
  const [editingSupervisor, setEditingSupervisor] = useState<SupervisorExternoDTO | null>(null);

  const empresaLabel = useMemo(() => {
    if (empresaId == null) {
      return "Selecione a empresa";
    }
    return empresas.find((e) => e.id === empresaId)?.nome_fantasia ?? empresas.find((e) => e.id === empresaId)?.razao_social ?? "Selecione a empresa";
  }, [empresaId, empresas]);

  const data = useMemo(() => {
    const term = search.trim().toLowerCase();
    return supervisores
      .filter((sup) => {
        const base = `${sup.nome} ${sup.empresa?.nome_fantasia ?? sup.empresa?.razao_social ?? ""}`.toLowerCase();
        const matchesSearch = base.includes(term);
        const matchesEmpresa = empresaFilterId ? sup.id_empresa === empresaFilterId : true;
        return matchesSearch && matchesEmpresa;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [supervisores, search, empresaFilterId]);

  const resetForm = () => {
    setNome("");
    setEmpresaId(null);
    setEmail("");
    setTelefone("");
    setCargo("");
    setEditingSupervisor(null);
  };

  const handlePickEmpresa = () => {
    if (loadingEmpresas) {
      refreshEmpresas();
      return;
    }
    if (empresas.length === 0) {
      Alert.alert("Sem empresas", "Cadastre uma empresa antes de criar supervisores.");
      return;
    }
    if (empresas.length === 1) {
      setEmpresaId(empresas[0].id);
      return;
    }
    Alert.alert(
      "Escolha a empresa",
      "",
      empresas.map((empresa) => ({
        text: empresa.nome_fantasia ?? empresa.razao_social,
        onPress: () => setEmpresaId(empresa.id),
      }))
    );
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      Alert.alert("Campos obrigatórios", "Informe o nome do supervisor.");
      return;
    }
    if (empresaId == null) {
      Alert.alert("Campos obrigatórios", "Selecione a empresa.");
      return;
    }
    try {
      const payload = {
        nome: nome.trim(),
        id_empresa: empresaId,
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        cargo: cargo.trim() || undefined,
      };
      if (editingSupervisor) {
        await updateSupervisor(editingSupervisor.id, payload);
        Alert.alert("Supervisor atualizado", "Dados atualizados com sucesso.");
      } else {
        await createSupervisor(payload);
        Alert.alert("Supervisor criado", "Supervisor cadastrado com sucesso.");
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
        <Text style={styles.title}>Supervisores externos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addText}>Novo supervisor</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { marginBottom: 16 }]}
        placeholder="Buscar supervisor ou empresa..."
        value={search}
        onChangeText={setSearch}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
        <TouchableOpacity
          style={[styles.filterPill, empresaFilterId === null && styles.filterPillActive]}
          onPress={() => setEmpresaFilterId(null)}
        >
          <Text style={empresaFilterId === null ? styles.filterPillTextActive : styles.filterPillText}>Todas as empresas</Text>
        </TouchableOpacity>
        {empresas.slice(0, 4).map((empresa) => (
          <TouchableOpacity
            key={empresa.id}
            style={[styles.filterPill, empresaFilterId === empresa.id && styles.filterPillActive]}
            onPress={() => setEmpresaFilterId((prev) => (prev === empresa.id ? null : empresa.id))}
          >
            <Text style={empresaFilterId === empresa.id ? styles.filterPillTextActive : styles.filterPillText}>
              {(empresa.nome_fantasia ?? empresa.razao_social).split(" ")[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {empresasError && <Text style={styles.errorText}>{empresasError}</Text>}

      {loading ? (
        <ActivityIndicator />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>
          {search.trim() ? "Nenhum supervisor corresponde à busca." : "Nenhum supervisor cadastrado."}
        </Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.itemTitle}>{item.nome}</Text>
              <Text style={styles.itemSubtitle}>
                Empresa: {item.empresa?.nome_fantasia ?? item.empresa?.razao_social ?? item.id_empresa} · Email:{" "}
                {item.email ?? "-"} · Telefone: {item.telefone ?? "-"}
              </Text>
              <View style={styles.listActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingSupervisor(item);
                    setNome(item.nome);
                    setEmpresaId(item.id_empresa);
                    setEmail(item.email ?? "");
                    setTelefone(item.telefone ?? "");
                    setCargo(item.cargo ?? "");
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    Alert.alert(
                      "Remover supervisor",
                      "Esta ação removerá o supervisor do sistema. Deseja continuar?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Remover",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await deleteSupervisor(item.id);
                              Alert.alert("Supervisor removido", "Registro excluído com sucesso.");
                            } catch {
                              /* erro tratado */
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
            <Text style={styles.title}>Cadastrar supervisor</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />

            <Text style={styles.label}>Empresa</Text>
            <TouchableOpacity style={styles.picker} onPress={handlePickEmpresa}>
              <Text style={styles.pickerText}>{empresaLabel}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@empresa.com"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="(00) 0000-0000" />

            <Text style={styles.label}>Cargo</Text>
            <TextInput style={styles.input} value={cargo} onChangeText={setCargo} placeholder="Ex.: Supervisor" />

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

export default SupervisorManager;
