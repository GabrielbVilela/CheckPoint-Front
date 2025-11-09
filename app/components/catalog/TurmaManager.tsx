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

import useCursos from "@/hooks/useCursos";
import useTurmas from "@/hooks/useTurmas";

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
    backgroundColor: "#e3f2fd",
    borderColor: "#2196F3",
  },
  filterPillText: {
    color: "#555",
    fontSize: 12,
  },
  filterPillTextActive: {
    color: "#0d47a1",
    fontSize: 12,
    fontWeight: "600",
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

const TurmaManager = () => {
  const { turmas, loading, error, refresh, createTurma, submitting } = useTurmas();
  const { cursos, loading: loadingCursos, error: cursosError, refresh: refreshCursos } = useCursos();
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [ano, setAno] = useState("");
  const [semestre, setSemestre] = useState("");
  const [turno, setTurno] = useState("");
  const [search, setSearch] = useState("");
  const [cursoFilterId, setCursoFilterId] = useState<number | null>(null);
  const [turnoFilter, setTurnoFilter] = useState<string | null>(null);

  const courseLabel = useMemo(() => {
    if (cursoId == null) {
      return "Selecione o curso";
    }
    return cursos.find((curso) => curso.id === cursoId)?.nome ?? "Selecione o curso";
  }, [cursoId, cursos]);

  const data = useMemo(() => {
    const term = search.trim().toLowerCase();
    return turmas
      .filter((turma) => {
        const base = `${turma.nome} ${turma.curso?.nome ?? ""}`.toLowerCase();
        const matchesSearch = base.includes(term);
        const matchesCurso = cursoFilterId ? turma.id_curso === cursoFilterId : true;
        const matchesTurno = turnoFilter ? (turma.turno ?? "").toLowerCase() === turnoFilter.toLowerCase() : true;
        return matchesSearch && matchesCurso && matchesTurno;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [turmas, search, cursoFilterId, turnoFilter]);

  const resetForm = () => {
    setNome("");
    setCursoId(null);
    setAno("");
    setSemestre("");
    setTurno("");
  };

  const handlePickCurso = () => {
    if (loadingCursos) {
      return;
    }
    if (cursos.length === 0) {
      Alert.alert("Sem cursos", "Cadastre um curso antes de criar turmas.");
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
    if (!nome.trim()) {
      Alert.alert("Campos obrigatórios", "Informe o nome da turma.");
      return;
    }
    if (cursoId == null) {
      Alert.alert("Campos obrigatórios", "Escolha o curso relacionado.");
      return;
    }
    const anoNum = ano.trim() ? Number(ano.trim()) : undefined;
    if (ano.trim() && (Number.isNaN(anoNum) || anoNum < 0)) {
      Alert.alert("Ano inválido", "Use apenas números positivos.");
      return;
    }
    const semestreNum = semestre.trim() ? Number(semestre.trim()) : undefined;
    if (semestre.trim() && (Number.isNaN(semestreNum) || semestreNum <= 0 || semestreNum > 2)) {
      Alert.alert("Semestre inválido", "Use valores 1 ou 2.");
      return;
    }
    try {
      await createTurma({
        nome: nome.trim(),
        id_curso: cursoId,
        ano: anoNum,
        semestre: semestreNum,
        turno: turno.trim() || undefined,
      });
      resetForm();
      setModalVisible(false);
      Alert.alert("Turma criada", "A turma foi cadastrada com sucesso.");
    } catch {
      // erro mostrado pelo hook
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Turmas cadastradas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addText}>Nova turma</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { marginBottom: 16 }]}
        placeholder="Buscar turma ou curso..."
        value={search}
        onChangeText={setSearch}
      />
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
        <TouchableOpacity style={styles.filterPill} onPress={refreshCursos}>
          <Text style={styles.filterPillText}>Atualizar cursos</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {["Manhã", "Tarde", "Noite"].map((turnoOption) => (
          <TouchableOpacity
            key={turnoOption}
            style={[styles.filterPill, turnoFilter === turnoOption && styles.filterPillActive]}
            onPress={() => setTurnoFilter((prev) => (prev === turnoOption ? null : turnoOption))}
          >
            <Text style={turnoFilter === turnoOption ? styles.filterPillTextActive : styles.filterPillText}>{turnoOption}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {cursosError && <Text style={styles.errorText}>{cursosError}</Text>}

      {loading ? (
        <ActivityIndicator />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>
          {search.trim() ? "Nenhuma turma corresponde à busca." : "Nenhuma turma encontrada."}
        </Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.itemTitle}>{item.nome}</Text>
              <Text style={styles.itemSubtitle}>
                Curso: {item.curso?.nome ?? item.id_curso} · Ano/Sem.: {item.ano ?? "-"} / {item.semestre ?? "-"} ·
                Turno: {item.turno ?? "-"}
              </Text>
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
            <Text style={styles.title}>Cadastrar turma</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex.: 5º período A" />

            <Text style={styles.label}>Curso</Text>
            <TouchableOpacity style={styles.picker} onPress={handlePickCurso}>
              <Text style={styles.pickerText}>{courseLabel}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Ano</Text>
            <TextInput
              style={styles.input}
              value={ano}
              onChangeText={setAno}
              placeholder="Ex.: 2025"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Semestre</Text>
            <TextInput
              style={styles.input}
              value={semestre}
              onChangeText={setSemestre}
              placeholder="1 ou 2"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Turno</Text>
            <TextInput
              style={styles.input}
              value={turno}
              onChangeText={setTurno}
              placeholder="Ex.: Noturno"
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

export default TurmaManager;
