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

import useConvenios from "@/hooks/useConvenios";
import useEmpresas from "@/hooks/useEmpresas";
import useCursos from "@/hooks/useCursos";
import { ConvenioDTO } from "@/services/catalogos";

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
    backgroundColor: "#e8f5e9",
    borderColor: "#2e7d32",
  },
  filterPillText: {
    color: "#555",
    fontSize: 12,
  },
  filterPillTextActive: {
    color: "#1b5e20",
    fontSize: 12,
    fontWeight: "600",
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

const ConvenioManager = () => {
  const { convenios, loading, error, refresh, createConvenio, updateConvenio, deleteConvenio, submitting } = useConvenios();
  const { empresas, loading: loadingEmpresas, error: empresasError, refresh: refreshEmpresas } = useEmpresas();
  const { cursos, loading: loadingCursos, error: cursosError, refresh: refreshCursos } = useCursos();

  const [modalVisible, setModalVisible] = useState(false);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState(true);
  const [search, setSearch] = useState("");
  const [empresaFilterId, setEmpresaFilterId] = useState<number | null>(null);
  const [cursoFilterId, setCursoFilterId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ativo" | "inativo" | null>(null);
  const [editingConvenio, setEditingConvenio] = useState<ConvenioDTO | null>(null);

  const empresaLabel = useMemo(() => {
    if (empresaId == null) return "Selecione a empresa";
    return empresas.find((e) => e.id === empresaId)?.nome_fantasia ?? empresas.find((e) => e.id === empresaId)?.razao_social ?? "Selecione a empresa";
  }, [empresaId, empresas]);

  const cursoLabel = useMemo(() => {
    if (cursoId == null) return "Selecione o curso";
    return cursos.find((c) => c.id === cursoId)?.nome ?? "Selecione o curso";
  }, [cursoId, cursos]);

  const data = useMemo(() => {
    const term = search.trim().toLowerCase();
    return convenios
      .filter((conv) => {
        const empresa = conv.empresa?.nome_fantasia ?? conv.empresa?.razao_social ?? "";
        const curso = conv.curso?.nome ?? "";
        const matchesSearch = `${empresa} ${curso}`.toLowerCase().includes(term);
        const matchesEmpresa = empresaFilterId ? conv.id_empresa === empresaFilterId : true;
        const matchesCurso = cursoFilterId ? conv.id_curso === cursoFilterId : true;
        const matchesStatus =
          statusFilter == null ? true : statusFilter === "ativo" ? conv.status !== false : conv.status === false;
        return matchesSearch && matchesEmpresa && matchesCurso && matchesStatus;
      })
      .sort((a, b) => {
        const empresaA = a.empresa?.nome_fantasia ?? a.empresa?.razao_social ?? "";
        const empresaB = b.empresa?.nome_fantasia ?? b.empresa?.razao_social ?? "";
        return empresaA.localeCompare(empresaB);
      });
  }, [convenios, search, empresaFilterId, cursoFilterId, statusFilter]);

  const resetForm = () => {
    setEmpresaId(null);
    setCursoId(null);
    setDataInicio("");
    setDataFim("");
    setDescricao("");
    setStatus(true);
    setEditingConvenio(null);
  };

  const handlePickEmpresa = () => {
    if (empresas.length === 0) {
      Alert.alert("Sem empresas", "Cadastre uma empresa antes de criar convênios.");
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

  const handlePickCurso = () => {
    if (cursos.length === 0) {
      Alert.alert("Sem cursos", "Cadastre um curso antes de criar convênios.");
      return;
    }
    if (cursos.length === 1) {
      setCursoId(cursos[0].id);
      return;
    }
    Alert.alert(
      "Escolha o curso",
      "",
      cursos.map((curso) => ({
        text: curso.nome,
        onPress: () => setCursoId(curso.id),
      }))
    );
  };

  const handleSubmit = async () => {
    if (empresaId == null || cursoId == null) {
      Alert.alert("Campos obrigatórios", "Selecione empresa e curso.");
      return;
    }
    const payload: Parameters<typeof createConvenio>[0] = {
      id_empresa: empresaId,
      id_curso: cursoId,
      descricao: descricao.trim() || undefined,
      status,
    };
    if (dataInicio.trim()) {
      payload.data_inicio = dataInicio.trim();
    }
    if (dataFim.trim()) {
      payload.data_fim = dataFim.trim();
    }
    try {
      if (editingConvenio) {
        await updateConvenio(editingConvenio.id, payload);
        Alert.alert("Convênio atualizado", "Convênio atualizado com sucesso.");
      } else {
        await createConvenio(payload);
        Alert.alert("Convênio criado", "Convênio cadastrado com sucesso.");
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
        <Text style={styles.title}>Convênios ativos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addText}>Novo convênio</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { marginBottom: 16 }]}
        placeholder="Buscar convênio por empresa ou curso..."
        value={search}
        onChangeText={setSearch}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
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
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
        <TouchableOpacity
          style={[styles.filterPill, cursoFilterId === null && styles.filterPillActive]}
          onPress={() => setCursoFilterId(null)}
        >
          <Text style={cursoFilterId === null ? styles.filterPillTextActive : styles.filterPillText}>Todos os cursos</Text>
        </TouchableOpacity>
        {cursos.slice(0, 4).map((curso) => (
          <TouchableOpacity
            key={curso.id}
            style={[styles.filterPill, cursoFilterId === curso.id && styles.filterPillActive]}
            onPress={() => setCursoFilterId((prev) => (prev === curso.id ? null : curso.id))}
          >
            <Text style={cursoFilterId === curso.id ? styles.filterPillTextActive : styles.filterPillText}>
              {curso.nome.split(" ")[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {["ativo", "inativo"].map((statusOption) => (
          <TouchableOpacity
            key={statusOption}
            style={[styles.filterPill, statusFilter === statusOption && styles.filterPillActive]}
            onPress={() =>
              setStatusFilter((prev) => (prev === statusOption ? null : (statusOption as "ativo" | "inativo")))
            }
          >
            <Text style={statusFilter === statusOption ? styles.filterPillTextActive : styles.filterPillText}>
              {statusOption === "ativo" ? "Ativos" : "Inativos"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {empresasError && <Text style={styles.errorText}>{empresasError}</Text>}
      {cursosError && <Text style={styles.errorText}>{cursosError}</Text>}

      {loading ? (
        <ActivityIndicator />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>
          {search.trim() ? "Nenhum convênio corresponde à busca." : "Nenhum convênio cadastrado."}
        </Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.itemTitle}>
                {item.empresa?.nome_fantasia ?? item.empresa?.razao_social ?? `Empresa ${item.id_empresa}`} ·{" "}
                {item.curso?.nome ?? `Curso ${item.id_curso}`}
              </Text>
              <Text style={styles.itemSubtitle}>
                Vigência: {item.data_inicio ?? "-"} / {item.data_fim ?? "-"} · Status: {item.status ? "Ativo" : "Inativo"}
              </Text>
              <View style={styles.listActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingConvenio(item);
                    setEmpresaId(item.id_empresa);
                    setCursoId(item.id_curso);
                    setDataInicio(item.data_inicio ?? "");
                    setDataFim(item.data_fim ?? "");
                    setDescricao(item.descricao ?? "");
                    setStatus(item.status ?? true);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    Alert.alert(
                      item.status ? "Desativar convênio" : "Ativar convênio",
                      `Deseja ${item.status ? "desativar" : "ativar"} este convênio?`,
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: item.status ? "Desativar" : "Ativar",
                          style: item.status ? "destructive" : "default",
                          onPress: async () => {
                            try {
                              await updateConvenio(item.id, { status: !item.status });
                            } catch {
                              /* erro tratado */
                            }
                          },
                        },
                      ]
                    )
                  }
                >
                  <Text style={styles.actionText}>{item.status ? "Desativar" : "Ativar"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    Alert.alert(
                      "Remover convênio",
                      "Esta ação não pode ser desfeita. Deseja continuar?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Remover",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await deleteConvenio(item.id);
                              Alert.alert("Convênio removido", "Registro excluído com sucesso.");
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
            <Text style={styles.title}>Cadastrar convênio</Text>

            <Text style={styles.label}>Empresa</Text>
            <TouchableOpacity style={styles.picker} onPress={handlePickEmpresa}>
              <Text style={styles.pickerText}>{empresaLabel}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Curso</Text>
            <TouchableOpacity style={styles.picker} onPress={handlePickCurso}>
              <Text style={styles.pickerText}>{cursoLabel}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Data início (AAAA-MM-DD)</Text>
            <TextInput style={styles.input} value={dataInicio} onChangeText={setDataInicio} placeholder="2025-01-01" />

            <Text style={styles.label}>Data fim (AAAA-MM-DD)</Text>
            <TextInput style={styles.input} value={dataFim} onChangeText={setDataFim} placeholder="2025-12-31" />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              multiline
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Observações sobre o convênio"
            />

            <Text style={styles.label}>Status</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setStatus((prev) => !prev)}
            >
              <Text style={styles.pickerText}>{status ? "Ativo" : "Inativo"}</Text>
            </TouchableOpacity>

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

export default ConvenioManager;
