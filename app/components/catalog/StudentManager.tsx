import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import StudentWizardModal from "@/components/catalog/StudentWizardModal";
import useAlunosCatalog from "@/hooks/useAlunosCatalog";

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
});

const StudentManager = () => {
  const [wizardVisible, setWizardVisible] = useState(false);
  const [search, setSearch] = useState("");
  const { alunos, loading, error, load, refresh } = useAlunosCatalog();

  useEffect(() => {
    if (!search.trim()) {
      return;
    }
    const handler = setTimeout(() => {
      load({ search });
    }, 400);
    return () => clearTimeout(handler);
  }, [load, search]);

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
    </>
  );
};

export default StudentManager;
