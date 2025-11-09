import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AvaliacaoForm from "@/components/forms/AvaliacaoForm";
import useAvaliacoesDashboard from "@/hooks/useAvaliacoesDashboard";
import { createAvaliacao } from "@/services/avaliacoes";

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 20,
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
    color: "#222",
  },
  subtitle: {
    color: "#666",
    fontSize: 13,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  badge: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  badgeLabel: {
    color: "#777",
    fontSize: 12,
  },
  badgeValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 6,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  item: {
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingVertical: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  itemSubtitle: {
    color: "#666",
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  actionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  secondaryButton: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  secondaryText: {
    color: "#fff",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 8,
  },
});

const AvaliacaoPanel = () => {
  const { avaliacoes, rubricas, resumo, loading, error, refresh } = useAvaliacoesDashboard();
  const [formVisible, setFormVisible] = useState(false);
  const list = useMemo(() => avaliacoes.slice(0, 5), [avaliacoes]);

  const handleCreate = async (payload: Parameters<typeof createAvaliacao>[0]) => {
    await createAvaliacao(payload);
    Alert.alert("Avaliação registrada", "A nova avaliação foi salva.");
    setFormVisible(false);
    refresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Avaliações por rubrica</Text>
        {loading && <ActivityIndicator />}
      </View>
      <Text style={styles.subtitle}>Registre avaliações periódicas e acompanhe o progresso dos estagiários.</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Total</Text>
          <Text style={styles.badgeValue}>{resumo.total}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Concluídas</Text>
          <Text style={styles.badgeValue}>{resumo.concluidas}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Pendentes</Text>
          <Text style={styles.badgeValue}>{resumo.pendentes}</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Últimas avaliações</Text>
        <TouchableOpacity onPress={refresh} disabled={loading}>
          <Text style={styles.actionText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {list.length === 0 ? (
        <Text style={styles.itemSubtitle}>Nenhuma avaliação registrada.</Text>
      ) : (
        list.map((avaliacao) => (
          <View key={avaliacao.id} style={styles.item}>
            <Text style={styles.itemTitle}>
              Contrato #{avaliacao.id_contrato} · {avaliacao.rubrica?.nome ?? `Rubrica ${avaliacao.id_rubrica}`}
            </Text>
            <Text style={styles.itemSubtitle}>
              Status: {avaliacao.status.toUpperCase()} · Atualizado em{" "}
              {new Date(avaliacao.atualizado_em).toLocaleDateString("pt-BR")}
            </Text>
            {avaliacao.feedback ? (
              <Text style={styles.itemSubtitle}>Feedback: {avaliacao.feedback}</Text>
            ) : null}
          </View>
        ))
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setFormVisible(true)}>
          <Text style={styles.actionText}>Nova avaliação</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={refresh} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.actionText, styles.secondaryText]}>Recarregar</Text>}
        </TouchableOpacity>
      </View>

      <AvaliacaoForm
        visible={formVisible}
        rubricas={rubricas}
        onSubmit={handleCreate}
        onCancel={() => setFormVisible(false)}
      />
    </View>
  );
};

export default AvaliacaoPanel;
