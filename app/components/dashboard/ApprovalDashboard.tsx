import React, { ReactNode, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
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

type DetailItem =
  | { kind: "justificativa"; item: JustificativaDTO }
  | { kind: "diario"; item: DiarioDTO }
  | null;

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
  detailRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  detailLink: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#555",
    marginBottom: 12,
  },
  detailLine: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#777",
  },
  detailValue: {
    fontSize: 14,
    color: "#111",
    marginTop: 2,
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    minHeight: 90,
    padding: 12,
    textAlignVertical: "top",
    marginTop: 8,
  },
  modalError: {
    color: "#e53935",
    fontSize: 12,
    marginTop: 6,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: "#f0f0f0",
  },
  modalButtonPrimary: {
    backgroundColor: "#2563EB",
  },
  modalButtonText: {
    color: "#111",
    fontWeight: "600",
  },
  modalButtonTextPrimary: {
    color: "#fff",
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
  const [detailItem, setDetailItem] = useState<DetailItem>(null);
  const [decisionTarget, setDecisionTarget] = useState<{ kind: "justificativa" | "diario"; status: "aprovado" | "rejeitado"; item: JustificativaDTO | DiarioDTO } | null>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  const busyKey = useMemo(() => {
    if (!processing) {
      return null;
    }
    return `${processing.kind}-${processing.id}`;
  }, [processing]);

  const openDetailModal = (payload: DetailItem) => {
    setDetailItem(payload);
  };

  const openDecisionModal = (item: JustificativaDTO | DiarioDTO, kind: "justificativa" | "diario", status: "aprovado" | "rejeitado") => {
    setDecisionTarget({ kind, status, item });
    setComment("");
    setCommentError(null);
  };

  const closeDecisionModal = () => {
    setDecisionTarget(null);
    setComment("");
    setCommentError(null);
  };

  const confirmDecision = async () => {
    if (!decisionTarget) {
      return;
    }
    const requiresComment = decisionTarget.status === "rejeitado";
    if (requiresComment && !comment.trim()) {
      setCommentError("Informe um comentario para rejeitar.");
      return;
    }
    setProcessing({ kind: decisionTarget.kind, id: decisionTarget.item.id });
    try {
      const note = comment.trim() || undefined;
      if (decisionTarget.kind === "justificativa") {
        await updateJustificativaStatus(decisionTarget.item.id, decisionTarget.status, note);
        Alert.alert("Sucesso", `Justificativa ${decisionTarget.status === "aprovado" ? "aprovada" : "rejeitada"}.`);
      } else {
        await updateDiarioStatus(decisionTarget.item.id, decisionTarget.status, note);
        Alert.alert("Sucesso", `Diario ${decisionTarget.status === "aprovado" ? "aprovado" : "rejeitado"}.`);
      }
      closeDecisionModal();
      refresh();
    } catch (err: any) {
      console.error("Falha ao atualizar pendencia:", err);
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
        <View style={styles.detailRow}>
          <TouchableOpacity onPress={() => openDetailModal({ kind: "justificativa", item })}>
            <Text style={styles.detailLink}>Ver detalhes</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => openDecisionModal(item, "justificativa", "rejeitado")}
            disabled={isBusy}
          >
            {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Rejeitar</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => openDecisionModal(item, "justificativa", "aprovado")}
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
        <View style={styles.detailRow}>
          <TouchableOpacity onPress={() => openDetailModal({ kind: "diario", item })}>
            <Text style={styles.detailLink}>Ver detalhes</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => openDecisionModal(item, "diario", "rejeitado")}
            disabled={isBusy}
          >
            {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Rejeitar</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => openDecisionModal(item, "diario", "aprovado")}
            disabled={isBusy}
          >
            {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Aprovar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  return (
    <>
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

      <Modal transparent visible={!!detailItem} animationType="fade" onRequestClose={() => setDetailItem(null)}>
        <TouchableWithoutFeedback onPress={() => setDetailItem(null)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Detalhes da pendencia</Text>
            <Text style={styles.modalSubtitle}>ID #{detailItem?.item.id}</Text>
            {detailItem?.kind === "justificativa" ? (
              <>
                <View style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={styles.detailValue}>{detailItem.item.tipo}</Text>
                </View>
                <View style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Motivo</Text>
                  <Text style={styles.detailValue}>{detailItem.item.motivo}</Text>
                </View>
                <View style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Data de referencia</Text>
                  <Text style={styles.detailValue}>{detailItem.item.data_referencia ?? "--"}</Text>
                </View>
                <View style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Evidencia</Text>
                  <Text style={styles.detailValue}>{detailItem.item.evidencia_url ?? "--"}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Resumo</Text>
                  <Text style={styles.detailValue}>{detailItem?.item.resumo}</Text>
                </View>
                <View style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Detalhes</Text>
                  <Text style={styles.detailValue}>{detailItem?.item.detalhes || "--"}</Text>
                </View>
                <View style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Anexo</Text>
                  <Text style={styles.detailValue}>{detailItem?.item.anexo_url || "--"}</Text>
                </View>
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setDetailItem(null)}>
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!decisionTarget} animationType="fade" onRequestClose={closeDecisionModal}>
        <TouchableWithoutFeedback onPress={closeDecisionModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar {decisionTarget?.status === "aprovado" ? "aprovacao" : "rejeicao"}</Text>
            <Text style={styles.modalSubtitle}>ID #{decisionTarget?.item.id}</Text>
            <Text style={styles.detailLabel}>Comentario</Text>
            <TextInput
              style={styles.modalTextArea}
              placeholder={decisionTarget?.status === "rejeitado" ? "Comentario obrigatorio para rejeicao" : "Comentario (opcional)"}
              value={comment}
              onChangeText={(value) => {
                setComment(value);
                setCommentError(null);
              }}
              multiline
            />
            {commentError ? <Text style={styles.modalError}>{commentError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={closeDecisionModal} disabled={!!processing}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={confirmDecision}
                disabled={!!processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ApprovalDashboard;
