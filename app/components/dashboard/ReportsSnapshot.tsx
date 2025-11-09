import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";

import useApprovalQueues from "@/hooks/useApprovalQueues";
import useAvaliacoesDashboard from "@/hooks/useAvaliacoesDashboard";
import useCatalogMetrics from "@/hooks/useCatalogMetrics";
import useDocumentos from "@/hooks/useDocumentos";

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
  bodyText: {
    color: "#555",
    fontSize: 13,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  badge: {
    flexBasis: "50%",
    padding: 10,
  },
  badgeCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  badgeLabel: {
    fontSize: 12,
    color: "#777",
  },
  badgeValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    },
  refreshText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    marginLeft: 8,
  },
  exportText: {
    color: "#388E3C",
    fontWeight: "600",
  },
  alertCard: {
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffe0b2",
    backgroundColor: "#fff8e1",
    padding: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e65100",
    marginBottom: 4,
  },
  alertText: {
    color: "#5d4037",
    fontSize: 13,
  },
});

const ReportsSnapshot = () => {
  const { justificativas, diarios, loading: approvalsLoading, refresh: refreshApprovals } = useApprovalQueues();
  const {
    resumo,
    loading: avaliacaoLoading,
    refresh: refreshAvaliacoes,
  } = useAvaliacoesDashboard();
  const { metrics, loading: metricsLoading, refresh: refreshMetrics } = useCatalogMetrics();
  const {
    documentos,
    loading: documentosLoading,
    refresh: refreshDocumentos,
  } = useDocumentos();

  const loading = approvalsLoading || avaliacaoLoading || metricsLoading || documentosLoading;
  const refreshAll = () => {
    refreshApprovals();
    refreshAvaliacoes();
    refreshMetrics();
    refreshDocumentos();
  };

  const handleExport = async () => {
    const lines = [
      ["Indicador", "Valor"],
      ["Cursos", metrics.cursos],
      ["Turmas", metrics.turmas],
      ["Empresas", metrics.empresas],
      ["Convênios", metrics.convenios],
      ["Justificativas pendentes", justificativas.length],
      ["Diários pendentes", diarios.length],
      ["Avaliações concluídas", resumo.concluidas],
      ["Avaliações pendentes", resumo.pendentes],
    ]
      .map((row) => row.join(","))
      .join("\n");
    await Clipboard.setStringAsync(lines);
    Alert.alert("Relatório copiado", "Os dados em CSV foram copiados para a área de transferência.");
  };

  const alertMessages: string[] = [];
  if (justificativas.length > 5) {
    alertMessages.push(`${justificativas.length} justificativas aguardam análise.`);
  }
  if (diarios.length > 5) {
    alertMessages.push(`${diarios.length} diários pendentes podem atrasar avaliações.`);
  }
  if (resumo.pendentes > 0) {
    alertMessages.push(`${resumo.pendentes} avaliações ainda não foram concluídas.`);
  }
  const documentosPendentes = documentos.filter((doc) => (doc.status ?? "").toLowerCase() === "pendente").length;
  if (documentosPendentes > 0) {
    alertMessages.push(`${documentosPendentes} documentos aguardam assinatura/envio.`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Insights rápidos</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshAll} disabled={loading}>
            {loading ? <ActivityIndicator color="#007AFF" /> : <Text style={styles.refreshText}>Atualizar</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Text style={styles.exportText}>Copiar CSV</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.bodyText}>
        Combine métricas acadêmicas com pendências operacionais para priorizar ações diárias.
      </Text>

      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Cursos</Text>
            <Text style={styles.badgeValue}>{metrics.cursos}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Turmas</Text>
            <Text style={styles.badgeValue}>{metrics.turmas}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Empresas</Text>
            <Text style={styles.badgeValue}>{metrics.empresas}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Convênios</Text>
            <Text style={styles.badgeValue}>{metrics.convenios}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Justificativas pendentes</Text>
            <Text style={styles.badgeValue}>{justificativas.length}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Diários pendentes</Text>
            <Text style={styles.badgeValue}>{diarios.length}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Avaliações concluídas</Text>
            <Text style={styles.badgeValue}>{resumo.concluidas}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Avaliações pendentes</Text>
            <Text style={styles.badgeValue}>{resumo.pendentes}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Documentos pendentes</Text>
            <Text style={styles.badgeValue}>{documentosPendentes}</Text>
          </View>
        </View>
      </View>

      {alertMessages.length > 0 && (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>Atenção</Text>
          {alertMessages.map((alert) => (
            <Text key={alert} style={styles.alertText}>
              • {alert}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default ReportsSnapshot;
