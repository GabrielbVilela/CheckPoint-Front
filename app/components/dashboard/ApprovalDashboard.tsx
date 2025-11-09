import React, { ReactNode, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import useApprovalQueues from "@/hooks/useApprovalQueues";
import { DiarioDTO, updateDiarioStatus } from "@/services/diarios";
import {
  JustificativaDTO,
  updateJustificativaStatus,
} from "@/services/justificativas";

type Props = {
  title: string;
  subtitle: string;
  emptyMessage?: string;
  onLogoutPress?: () => void;
  children?: ReactNode;
};

type ProcessingState =
  | { kind: "justificativa"; id: number }
  | { kind: "diario"; id: number }
  | null;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerTextWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    marginTop: 6,
    color: "#555",
    fontSize: 15,
  },
  logoutButton: {
    borderColor: "#ddd",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  logoutButtonText: {
    color: "#d32f2f",
    fontWeight: "600",
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
    backgroundColor: "#fff",
  },
  cardLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  refreshButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 12,
    textAlign: "center",
  },
  item: {
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingVertical: 12,
  },
  itemHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#43A047",
  },
  rejectButton: {
    backgroundColor: "#E53935",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
  placeholder: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
});

const formatDate = (value?: string | null) => {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.card}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const ApprovalDashboard: React.FC<Props> = ({
  title,
  subtitle,
  emptyMessage = "Nenhuma pendencia encontrada.",
  onLogoutPress,
  children,
}) => {
  const { justificativas, diarios, loading, error, refresh } = useApprovalQueues();
  const [processing, setProcessing] = useState<ProcessingState>(null);

  const busyKey = useMemo(() => {
    if (!processing) {
      return null;
    }
    return `${processing.kind}-${processing.id}`;
  }, [processing]);

  const handleJustificativaDecision = async (item: JustificativaDTO, status: "aprovado" | "rejeitado") => {
    setProcessing({ kind: "justificativa", id: item.id });
    try {
      await updateJustificativaStatus(item.id, status);
      Alert.alert("Sucesso", `Justificativa ${status === "aprovado" ? "aprovada" : "rejeitada"}.`);
      refresh();
    } catch (err: any) {
      console.error("Falha ao atualizar justificativa:", err);
      const detail = err?.response?.data?.detail ?? "Nao foi possivel atualizar o status.";
      Alert.alert("Erro", detail);
    } finally {
      setProcessing(null);
    }
  };

  const handleDiarioDecision = async (item: DiarioDTO, status: "aprovado" | "rejeitado") => {
    setProcessing({ kind: "diario", id: item.id });
    try {
      await updateDiarioStatus(item.id, status);
      Alert.alert("Sucesso", `Diario ${status === "aprovado" ? "aprovado" : "rejeitado"}.`);
      refresh();
    } catch (err: any) {
      console.error("Falha ao atualizar diario:", err);
      const detail = err?.response?.data?.detail ?? "Nao foi possivel atualizar o status.";
      Alert.alert("Erro", detail);
    } finally {
      setProcessing(null);
    }
  };

  const renderJustificativa = (item: JustificativaDTO) => {
    const isBusy = busyKey === `justificativa-${item.id}`;
    return (
      <View key={item.id} style={styles.item}>
        <Text style={styles.itemHeader}>
          {item.tipo} · #{item.id}
        </Text>
        <Text style={styles.itemSubtitle}>{item.motivo}</Text>
        <Text style={styles.itemSubtitle}>Criado em {formatDate(item.criado_em)}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleJustificativaDecision(item, "rejeitado")}
            disabled={isBusy}
          >
            {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Rejeitar</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleJustificativaDecision(item, "aprovado")}
            disabled={isBusy}
          >
            {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Aprovar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDiario = (item: DiarioDTO) => {
    const isBusy = busyKey === `diario-${item.id}`;
    return (
      <View key={item.id} style={styles.item}>
        <Text style={styles.itemHeader}>
          {item.resumo} · #{item.id}
        </Text>
        <Text style={styles.itemSubtitle}>Referencia: {formatDate(item.data_referencia)}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleDiarioDecision(item, "rejeitado")}
            disabled={isBusy}
          >
            {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Rejeitar</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleDiarioDecision(item, "aprovado")}
            disabled={isBusy}
          >
            {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Aprovar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {onLogoutPress && (
          <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardsRow}>
        <SummaryCard label="Justificativas pendentes" value={justificativas.length} />
        <SummaryCard label="Diarios pendentes" value={diarios.length} />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Justificativas em analise</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refresh} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.refreshButtonText}>Atualizar</Text>}
          </TouchableOpacity>
        </View>
        {justificativas.length === 0 ? (
          <Text style={styles.placeholder}>{emptyMessage}</Text>
        ) : (
          justificativas.map(renderJustificativa)
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Diarios aguardando avaliacao</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refresh} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.refreshButtonText}>Atualizar</Text>}
          </TouchableOpacity>
        </View>
        {diarios.length === 0 ? (
          <Text style={styles.placeholder}>{emptyMessage}</Text>
        ) : (
          diarios.map(renderDiario)
        )}
      </View>

      {children}
    </ScrollView>
  );
};

export default ApprovalDashboard;
