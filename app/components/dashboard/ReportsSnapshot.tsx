import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import useApprovalQueues from "@/hooks/useApprovalQueues";
import useAvaliacoesDashboard from "@/hooks/useAvaliacoesDashboard";
import useCatalogMetrics from "@/hooks/useCatalogMetrics";
import useDocumentosResumo from "@/hooks/useDocumentosResumo";
import useDocumentosAnalytics from "@/hooks/useDocumentosAnalytics";
import { exportDocumentosInline } from "@/services/documentos";

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
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  downloadButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    marginLeft: 8,
  },
  downloadButtonSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#6D28D9",
    marginLeft: 8,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadText: {
    color: "#fff",
    fontWeight: "600",
  },
  analyticsCard: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fdfdfd",
  },
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  analyticsSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
  analyticsSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 6,
  },
  analyticsEmpty: {
    fontSize: 12,
    color: "#6b7280",
  },
  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  analyticsLabel: {
    flex: 1,
    fontSize: 13,
    color: "#1f2937",
  },
  analyticsBadges: {
    flexDirection: "row",
    alignItems: "center",
  },
  analyticsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 4,
  },
  analyticsBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  analyticsBadgePendentes: {
    backgroundColor: "#F59E0B",
  },
  analyticsBadgeAprovados: {
    backgroundColor: "#22C55E",
  },
  analyticsBadgeRejeitados: {
    backgroundColor: "#EF4444",
  },
});

const ReportsSnapshot = () => {
  const { justificativas, diarios, loading: approvalsLoading, refresh: refreshApprovals } = useApprovalQueues();
  const {
    resumo: avaliacoesResumo,
    loading: avaliacaoLoading,
    refresh: refreshAvaliacoes,
  } = useAvaliacoesDashboard();
  const { metrics, loading: metricsLoading, refresh: refreshMetrics } = useCatalogMetrics();
  const {
    resumo: documentosResumo,
    loading: documentosResumoLoading,
    error: documentosResumoError,
    refresh: refreshDocumentosResumo,
  } = useDocumentosResumo();
  const {
    data: documentosAnalytics,
    loading: analyticsLoading,
    error: analyticsError,
    refresh: refreshDocumentosAnalytics,
  } = useDocumentosAnalytics();
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const loading =
    approvalsLoading || avaliacaoLoading || metricsLoading || documentosResumoLoading || analyticsLoading;
  const refreshAll = () => {
    refreshApprovals();
    refreshAvaliacoes();
    refreshMetrics();
    refreshDocumentosResumo();
    refreshDocumentosAnalytics();
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
      ["Avaliações concluídas", avaliacoesResumo.concluidas],
      ["Avaliações pendentes", avaliacoesResumo.pendentes],
      ["Documentos pendentes", documentosResumo.pendentes],
      ["Documentos aprovados", documentosResumo.aprovados],
      ["Documentos rejeitados", documentosResumo.rejeitados],
    ]
      .map((row) => row.join(","))
      .join("\n");
    await Clipboard.setStringAsync(lines);
    Alert.alert("Relatório copiado", "Os dados em CSV foram copiados para a área de transferência.");
  };

  const analyticsSections = useMemo(
    () => [
      { title: "Por curso", data: documentosAnalytics.curso },
      { title: "Por empresa", data: documentosAnalytics.empresa },
      { title: "Por período", data: documentosAnalytics.periodo },
    ],
    [documentosAnalytics]
  );

  const handleExportDocumentos = async (format: "csv" | "pdf") => {
    try {
      setExporting(format);
      const file = await exportDocumentosInline(format);
      const basePath = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!basePath) {
        throw new Error("Diretório temporário indisponível.");
      }
      const targetPath = `${basePath}${file.filename}`;
      await FileSystem.writeAsStringAsync(targetPath, file.content_base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(targetPath, {
          mimeType: file.mime_type,
          dialogTitle: `Exportar documentos (${format.toUpperCase()})`,
        });
      } else {
        Alert.alert("Exportação pronta", `Arquivo salvo em: ${targetPath}`);
      }
    } catch (err: any) {
      console.error("Erro ao exportar documentos:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível exportar os documentos.";
      Alert.alert("Erro", detail);
    } finally {
      setExporting(null);
    }
  };

  const alertMessages: string[] = [];
  if (justificativas.length > 5) {
    alertMessages.push(`${justificativas.length} justificativas aguardam análise.`);
  }
  if (diarios.length > 5) {
    alertMessages.push(`${diarios.length} diários pendentes podem atrasar avaliações.`);
  }
  if (avaliacoesResumo.pendentes > 0) {
    alertMessages.push(`${avaliacoesResumo.pendentes} avaliações ainda não foram concluídas.`);
  }
  const documentosPendentes = documentosResumo.pendentes;
  if (documentosResumoError) {
    alertMessages.push("Falha ao carregar o resumo de documentos. Tente atualizar.");
  }
  if (analyticsError) {
    alertMessages.push("Falha ao carregar os indicadores de documentos por contexto.");
  }
  if (documentosPendentes > 0) {
    alertMessages.push(`${documentosPendentes} documentos aguardam assinatura/envio.`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Insights rápidos</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshAll} disabled={loading}>
            {loading ? <ActivityIndicator color="#007AFF" /> : <Text style={styles.refreshText}>Atualizar</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Text style={styles.exportText}>Copiar CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.downloadButton, exporting === "csv" && styles.downloadButtonDisabled]}
            onPress={() => handleExportDocumentos("csv")}
            disabled={exporting !== null}
          >
            {exporting === "csv" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.downloadText}>Exportar CSV</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.downloadButtonSecondary, exporting === "pdf" && styles.downloadButtonDisabled]}
            onPress={() => handleExportDocumentos("pdf")}
            disabled={exporting !== null}
          >
            {exporting === "pdf" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.downloadText}>Exportar PDF</Text>
            )}
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
            <Text style={styles.badgeValue}>{avaliacoesResumo.concluidas}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Avaliações pendentes</Text>
            <Text style={styles.badgeValue}>{avaliacoesResumo.pendentes}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Documentos pendentes</Text>
            <Text style={styles.badgeValue}>{documentosPendentes}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Documentos aprovados</Text>
            <Text style={styles.badgeValue}>{documentosResumo.aprovados}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeLabel}>Documentos rejeitados</Text>
            <Text style={styles.badgeValue}>{documentosResumo.rejeitados}</Text>
          </View>
        </View>
      </View>

      <View style={styles.analyticsCard}>
        <View style={styles.analyticsHeader}>
          <Text style={styles.analyticsTitle}>Documentos por contexto</Text>
          {analyticsLoading ? <ActivityIndicator size="small" color="#2563EB" /> : null}
        </View>
        {analyticsError ? (
          <Text style={styles.errorText}>{analyticsError}</Text>
        ) : (
          analyticsSections.map((section) => (
            <View key={section.title} style={styles.analyticsSection}>
              <Text style={styles.analyticsSectionTitle}>{section.title}</Text>
              {section.data.length === 0 ? (
                <Text style={styles.analyticsEmpty}>Sem dados suficientes para esta categoria.</Text>
              ) : (
                section.data.map((item) => (
                  <View key={`${section.title}-${item.chave ?? item.label}`} style={styles.analyticsRow}>
                    <Text style={styles.analyticsLabel}>{item.label}</Text>
                    <View style={styles.analyticsBadges}>
                      <View style={[styles.analyticsBadge, styles.analyticsBadgePendentes]}>
                        <Text style={styles.analyticsBadgeText}>P {item.pendentes}</Text>
                      </View>
                      <View style={[styles.analyticsBadge, styles.analyticsBadgeAprovados]}>
                        <Text style={styles.analyticsBadgeText}>A {item.aprovados}</Text>
                      </View>
                      <View style={[styles.analyticsBadge, styles.analyticsBadgeRejeitados]}>
                        <Text style={styles.analyticsBadgeText}>R {item.rejeitados}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          ))
        )}
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
