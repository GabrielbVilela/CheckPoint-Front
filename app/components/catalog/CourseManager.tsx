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
  courseName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  courseMeta: {
    color: "#666",
    fontSize: 12,
  },
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginVertical: 16,
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
  errorText: {
    color: "#d32f2f",
    marginBottom: 12,
  },
});

const CourseManager = () => {
  const { cursos, loading, error, refresh, createCurso, submitting } = useCursos();
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [competencias, setCompetencias] = useState("");
  const [search, setSearch] = useState("");

  const resetForm = () => {
    setNome("");
    setCargaHoraria("");
    setCompetencias("");
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      Alert.alert("Campos obrigatórios", "Informe o nome do curso.");
      return;
    }
    let carga: number | undefined;
    if (cargaHoraria.trim()) {
      const parsed = Number(cargaHoraria.trim());
      if (Number.isNaN(parsed) || parsed < 0) {
        Alert.alert("Carga horária inválida", "Use apenas números positivos.");
        return;
      }
      carga = parsed;
    }
    try {
      await createCurso({
        nome: nome.trim(),
        carga_horaria_total: carga,
        competencias: competencias.trim() || undefined,
      });
      resetForm();
      setModalVisible(false);
      Alert.alert("Curso criado", "O curso foi cadastrado com sucesso.");
    } catch {
      // erro já tratado no hook
    }
  };

  const data = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cursos
      .filter((curso) => curso.nome.toLowerCase().includes(term))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [cursos, search]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Cursos cadastrados</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addText}>Novo curso</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { marginBottom: 16 }]}
        placeholder="Buscar curso..."
        value={search}
        onChangeText={setSearch}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {loading ? (
        <ActivityIndicator />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>
          {search.trim() ? "Nenhum curso corresponde à busca." : "Nenhum curso encontrado."}
        </Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.courseName}>{item.nome}</Text>
              <Text style={styles.courseMeta}>
                Carga horária: {item.carga_horaria_total ?? "-"} · Competências:{" "}
                {item.competencias ? item.competencias.slice(0, 60) : "não informado"}
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
            <Text style={styles.title}>Cadastrar curso</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex.: Engenharia Civil" />

            <Text style={styles.label}>Carga horária total</Text>
            <TextInput
              style={styles.input}
              value={cargaHoraria}
              onChangeText={setCargaHoraria}
              placeholder="Ex.: 3000"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Competências</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              multiline
              value={competencias}
              onChangeText={setCompetencias}
              placeholder="Descreva as competências principais"
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

export default CourseManager;
