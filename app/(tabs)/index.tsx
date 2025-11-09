import DiarioForm from "@/components/forms/DiarioForm";
import JustificativaForm from "@/components/forms/JustificativaForm";
import LogoutConfirm from "@/components/LogoutConfirm";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { usePointRegistration } from "@/hooks/usePointRegistration";
import { useTimeline } from "@/hooks/useTimeline";
import { useAlunoContratos } from "@/hooks/useAlunoContratos";
import { useAuthStore } from "@/store/authStore";
import { createDiario, DiarioPayload } from "@/services/diarios";
import { createJustificativa, JustificativaPayload } from "@/services/justificativas";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    backgroundColor: "#fff",
    flexGrow: 1,
    paddingBottom: 48,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    width: "100%",
  },
  mainTitle: {
    color: "#111",
    fontSize: 26,
    fontWeight: "700",
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
    fontSize: 14,
    fontWeight: "600",
  },
  pointCard: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    width: "100%",
  },
  userInfoBox: {
    borderBottomColor: "#f1f1f1",
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingBottom: 12,
    width: "100%",
  },
  collaboratorTitle: {
    color: "#444",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  userInfoText: {
    color: "#222",
    fontSize: 13,
  },
  timeText: {
    color: "#111",
    fontSize: 42,
    fontWeight: "700",
    textAlign: "center",
  },
  dateText: {
    color: "#666",
    fontSize: 16,
    marginBottom: 18,
    textAlign: "center",
  },
  confirmationText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  mainButton: {
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
  },
  cancelButton: {
    backgroundColor: "#E53935",
  },
  registerButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#E53935",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  syncCard: {
    backgroundColor: "#fff8e1",
    borderColor: "#ffe082",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    width: "100%",
  },
  syncTitle: {
    color: "#795548",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  syncDescription: {
    color: "#5d4037",
    fontSize: 13,
    marginBottom: 12,
  },
  syncButton: {
    alignItems: "center",
    backgroundColor: "#ffb300",
    borderRadius: 8,
    paddingVertical: 10,
  },
  syncButtonText: {
    color: "#4e342e",
    fontSize: 14,
    fontWeight: "600",
  },
  warningCard: {
    backgroundColor: "#ffebee",
    borderColor: "#ffcdd2",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
    width: "100%",
  },
  warningText: {
    color: "#b71c1c",
    fontSize: 13,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 8,
    width: "100%",
  },
  sectionTitle: {
    color: "#111",
    fontSize: 18,
    fontWeight: "700",
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refreshButtonText: {
    color: "#007aff",
    fontSize: 14,
    fontWeight: "600",
  },
  timelineCard: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
  },
  infoLabel: {
    color: "#666",
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginBottom: 16,
  },
  summaryBadge: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    margin: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 140,
  },
  summaryLabel: {
    color: "#666",
    fontSize: 12,
  },
  summaryValue: {
    color: "#111",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  timelineItem: {
    borderBottomColor: "#f1f1f1",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  timelineItemTitle: {
    color: "#222",
    fontSize: 15,
    fontWeight: "600",
  },
  timelineItemSubtitle: {
    color: "#555",
    fontSize: 13,
    marginTop: 2,
  },
  timelineAlert: {
    color: "#ef6c00",
    fontSize: 12,
    marginTop: 4,
  },
  placeholder: {
    color: "#888",
    fontSize: 14,
    marginTop: 4,
  },
  timelineActions: {
    flexDirection: "row",
    marginTop: 16,
  },
  secondaryButton: {
    borderColor: "#4CAF50",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#4CAF50",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});

const SectionTitle = ({ title }: { title: string }) => <Text style={styles.sectionSubtitle}>{title}</Text>;

const InfoCard = ({ title, value }: { title: string; value: string }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoLabel}>{title}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const placeholderText = "Nenhum registro encontrado para a data selecionada.";

const PointScreenAuthenticated = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const {
    pointData,
    loading: isProcessing,
    error: pointError,
    capturePoint,
    confirmPointRegistration,
    cancelConfirmation,
    queuedCount,
    syncingQueue,
    syncOfflinePoints,
  } = usePointRegistration();
  const { resetTimer } = useInactivityTimeout();
  const {
    timeline,
    loading: timelineLoading,
    error: timelineError,
    refresh: refreshTimeline,
    contracts,
  } = useTimeline();
  const { options: alunoContractOptions, error: alunoContractsError } = useAlunoContratos();

  const [localTime, setLocalTime] = useState(() => new Date().toISOString());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [justificativaVisible, setJustificativaVisible] = useState(false);
  const [diarioVisible, setDiarioVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setLocalTime(new Date().toISOString()), 1000);
    return () => clearInterval(interval);
  }, []);

  const displayTimestamp = pointData?.timestamp ?? localTime;

  const { time, fullDate } = useMemo(() => {
    const date = new Date(displayTimestamp);
    return {
      time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      fullDate: date.toLocaleDateString("pt-BR"),
    };
  }, [displayTimestamp]);

  const contractOptions = useMemo(() => {
    if (!contracts.length && alunoContractOptions.length) {
      return alunoContractOptions;
    }
    if (contracts.length && alunoContractOptions.length) {
      const map = new Map<number, { id: number; label: string }>();
      alunoContractOptions.forEach((option) => map.set(option.id, option));
      contracts.forEach((option) => map.set(option.id, option));
      return Array.from(map.values());
    }
    return contracts;
  }, [contracts, alunoContractOptions]);

  const timelineSummary = useMemo(() => {
    if (!timeline) {
      return null;
    }
    const justificativasPendentes = timeline.justificativas.filter((j) => (j.status ?? "").toLowerCase() === "pendente").length;
    const avaliacoesPendentes = timeline.avaliacoes.filter((a) => (a.status ?? "").toLowerCase() !== "concluida").length;
    return {
      justificativas: timeline.justificativas.length,
      justificativasPendentes,
      diarios: timeline.diarios.length,
      avaliacoesPendentes,
    };
  }, [timeline]);

  const ensureContractsAvailable = () => {
    if (!contractOptions.length) {
      Alert.alert("Sem contratos", "Nenhum contrato ativo encontrado para este aluno.");
      return false;
    }
    return true;
  };

  const handleSubmitJustificativa = async (payload: JustificativaPayload) => {
    await createJustificativa(payload);
    Alert.alert("Justificativa enviada", "Sua justificativa foi registrada.");
    setJustificativaVisible(false);
    refreshTimeline();
  };

  const handleSubmitDiario = async (payload: DiarioPayload) => {
    await createDiario(payload);
    Alert.alert("Diario registrado", "Seu diario foi salvo com sucesso.");
    setDiarioVisible(false);
    refreshTimeline();
  };

  const renderSyncCard = () => {
    if (queuedCount === 0 && !syncingQueue) {
      return null;
    }
    const description =
      queuedCount > 0
        ? `Ha ${queuedCount} ponto(s) aguardando sincronizacao.`
        : "Sincronizacao em andamento...";
    return (
      <View style={styles.syncCard}>
        <Text style={styles.syncTitle}>Modo offline</Text>
        <Text style={styles.syncDescription}>{description}</Text>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => {
            resetTimer();
            syncOfflinePoints();
          }}
          disabled={syncingQueue}
        >
          {syncingQueue ? <ActivityIndicator color="#4e342e" /> : <Text style={styles.syncButtonText}>Sincronizar agora</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  const renderPointCard = () => {
    if (pointData) {
      return (
        <View style={styles.pointCard}>
          <View style={styles.userInfoBox}>
            <Text style={styles.collaboratorTitle}>Colaborador</Text>
            <Text style={styles.userInfoText}>ALUNO: {user?.name ?? "Usuario autenticado"}</Text>
            <Text style={styles.userInfoText}>MATRICULA: {user?.matricula ?? user?.id ?? "-"}</Text>
          </View>
          <Text style={styles.timeText}>{time}</Text>
          <Text style={styles.dateText}>{fullDate}</Text>
          <Text style={styles.confirmationText}>Confirmar o registro?</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                resetTimer();
                cancelConfirmation();
              }}
              disabled={isProcessing}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.registerButton]}
              onPress={() => {
                resetTimer();
                confirmPointRegistration();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Registrar</Text>}
            </TouchableOpacity>
          </View>
          {pointError && <Text style={styles.errorText}>{pointError}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.pointCard}>
        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.dateText}>{fullDate}</Text>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => {
            resetTimer();
            capturePoint();
          }}
          disabled={isProcessing}
        >
          {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainButtonText}>BATER PONTO!</Text>}
        </TouchableOpacity>
        {pointError && <Text style={styles.errorText}>{pointError}</Text>}
      </View>
    );
  };

  const renderTimeline = () => {
    if (timelineLoading) {
      return (
        <View style={styles.timelineCard}>
          <ActivityIndicator />
        </View>
      );
    }

    if (timelineError) {
      return (
        <View style={styles.timelineCard}>
          <Text style={styles.errorText}>{timelineError}</Text>
          <TouchableOpacity style={[styles.mainButton, { marginTop: 12 }]} onPress={refreshTimeline}>
            <Text style={styles.mainButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!timeline) {
      return (
        <View style={styles.timelineCard}>
          <Text style={styles.placeholder}>Nenhuma informacao disponivel.</Text>
        </View>
      );
    }

    const formatHour = (iso?: string | null) =>
      iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--";
    const formatDate = (iso?: string | null) =>
      iso ? new Date(iso).toLocaleDateString("pt-BR") : "--";
    const saldo = timeline.saldo_minutos ?? 0;
    const saldoText = saldo >= 0 ? `+${saldo} min` : `${saldo} min`;

    return (
      <View style={styles.timelineCard}>
        <View style={styles.infoRow}>
          <InfoCard title="Realizado" value={`${timeline.total_minutos} min`} />
          <InfoCard title="Previsto" value={`${timeline.esperado_minutos ?? 0} min`} />
          <InfoCard title="Saldo" value={saldoText} />
        </View>

        <SectionTitle title="Pontos do dia" />
        {timeline.pontos.length === 0 ? (
          <Text style={styles.placeholder}>{placeholderText}</Text>
        ) : (
          timeline.pontos.map((ponto) => (
            <View key={ponto.id} style={styles.timelineItem}>
              <Text style={styles.timelineItemTitle}>
                Entrada {formatHour(ponto.hora_entrada)} · Saida {formatHour(ponto.hora_saida)}
              </Text>
              {ponto.alerta && <Text style={styles.timelineAlert}>{ponto.alerta}</Text>}
            </View>
          ))
        )}

        <SectionTitle title="Justificativas" />
        {timeline.justificativas.length === 0 ? (
          <Text style={styles.placeholder}>{placeholderText}</Text>
        ) : (
          timeline.justificativas.map((justificativa) => (
            <View key={justificativa.id} style={styles.timelineItem}>
              <Text style={styles.timelineItemTitle}>
                {justificativa.tipo} · {justificativa.status.toUpperCase()}
              </Text>
              <Text style={styles.timelineItemSubtitle}>{justificativa.motivo}</Text>
              <Text style={styles.timelineItemSubtitle}>Criado em {formatDate(justificativa.criado_em)}</Text>
            </View>
          ))
        )}

        <SectionTitle title="Diarios de atividades" />
        {timeline.diarios.length === 0 ? (
          <Text style={styles.placeholder}>{placeholderText}</Text>
        ) : (
          timeline.diarios.map((diario) => (
            <View key={diario.id} style={styles.timelineItem}>
              <Text style={styles.timelineItemTitle}>
                {formatDate(diario.data_referencia)} · {diario.status.toUpperCase()}
              </Text>
              <Text style={styles.timelineItemSubtitle}>{diario.resumo}</Text>
            </View>
          ))
        )}

        <SectionTitle title="Avaliacoes" />
        {timeline.avaliacoes.length === 0 ? (
          <Text style={styles.placeholder}>{placeholderText}</Text>
        ) : (
          timeline.avaliacoes.map((avaliacao) => (
            <View key={avaliacao.id} style={styles.timelineItem}>
              <Text style={styles.timelineItemTitle}>
                {avaliacao.rubrica?.nome ?? "Avaliacao"} · {avaliacao.status.toUpperCase()}
              </Text>
              <Text style={styles.timelineItemSubtitle}>Periodo: {avaliacao.periodo ?? "--"}</Text>
              <Text style={styles.timelineItemSubtitle}>Criado em {formatDate(avaliacao.criado_em)}</Text>
            </View>
          ))
        )}

        <View style={styles.timelineActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              resetTimer();
              if (ensureContractsAvailable()) {
                setJustificativaVisible(true);
              }
            }}
          >
            <Text style={styles.secondaryButtonText}>Nova justificativa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              resetTimer();
              if (ensureContractsAvailable()) {
                setDiarioVisible(true);
              }
            }}
          >
            <Text style={styles.secondaryButtonText}>Registrar diario</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={resetTimer} accessible={false}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Text style={styles.mainTitle}>Ponto do aluno</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>

          {renderSyncCard()}
          {contractOptions.length === 0 ? (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                Não encontramos contratos ativos vinculados à sua conta. Fale com a coordenação para confirmar o cadastro.
              </Text>
              {alunoContractsError ? <Text style={styles.warningText}>{alunoContractsError}</Text> : null}
            </View>
          ) : alunoContractsError ? (
            <Text style={styles.errorText}>{alunoContractsError}</Text>
          ) : null}

          {timelineSummary ? (
            <View style={styles.summaryRow}>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryLabel}>Justificativas</Text>
                <Text style={styles.summaryValue}>
                  {timelineSummary.justificativas} ({timelineSummary.justificativasPendentes} pendentes)
                </Text>
              </View>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryLabel}>Diários</Text>
                <Text style={styles.summaryValue}>{timelineSummary.diarios}</Text>
              </View>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryLabel}>Avaliações pendentes</Text>
                <Text style={styles.summaryValue}>{timelineSummary.avaliacoesPendentes}</Text>
              </View>
            </View>
          ) : null}

          {renderPointCard()}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Linha do tempo</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshTimeline}>
              <Text style={styles.refreshButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>

          {renderTimeline()}
        </ScrollView>
      </TouchableWithoutFeedback>

      <JustificativaForm
        visible={justificativaVisible}
        contratos={contractOptions}
        onSubmit={handleSubmitJustificativa}
        onCancel={() => setJustificativaVisible(false)}
      />

      <DiarioForm
        visible={diarioVisible}
        contratos={contractOptions}
        onSubmit={handleSubmitDiario}
        onCancel={() => setDiarioVisible(false)}
      />

      <LogoutConfirm
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          try {
            await logout();
            setShowLogoutModal(false);
            router.replace("/(tabs)/login");
          } catch (error) {
            console.error("Erro ao sair:", error);
            Alert.alert("Erro", "Nao foi possivel encerrar a sessao. Tente novamente.");
          }
        }}
      />
    </>
  );
};

const ROLE_ROUTES: Record<string, string> = {
  coordenador: "/(tabs)/coordenador",
  professor: "/(tabs)/professor",
  supervisor: "/(tabs)/supervisor",
  admin: "/(tabs)/admin",
};

const PointScreen = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.userRole);
  const router = useRouter();

  useEffect(() => {
    try {
      if (!isAuthenticated) {
        router.replace("/(tabs)/login");
        return;
      }
      if (userRole && userRole !== "aluno") {
        const targetRoute = ROLE_ROUTES[userRole] ?? "/(tabs)/login";
        router.replace(targetRoute as any);
      }
    } catch (error) {
      console.error("Erro ao redirecionar:", error);
    }
  }, [isAuthenticated, userRole, router]);

  if (!isAuthenticated || userRole !== "aluno") {
    return null;
  }

  return <PointScreenAuthenticated />;
};

export default PointScreen;
