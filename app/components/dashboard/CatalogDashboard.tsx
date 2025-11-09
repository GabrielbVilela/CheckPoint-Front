import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import useCatalogMetrics from "@/hooks/useCatalogMetrics";

type Action = {
  label: string;
  description: string;
  onPress: () => void;
};

type Props = {
  title: string;
  subtitle: string;
  actions?: Action[];
  onLogoutPress?: () => void;
  children?: ReactNode;
};

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
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    color: "#666",
    fontSize: 13,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  section: {
    marginTop: 24,
  },
  sectionTitleRow: {
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
  refreshText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 12,
    textAlign: "center",
  },
  infoText: {
    color: "#777",
    fontSize: 13,
    marginTop: 4,
  },
  actionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    padding: 16,
    backgroundColor: "#fafafa",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2933",
  },
  actionDescription: {
    marginTop: 6,
    color: "#4b5563",
    fontSize: 13,
  },
});

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.card}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const CatalogDashboard: React.FC<Props> = ({ title, subtitle, actions, onLogoutPress, children }) => {
  const { metrics, loading, error, lastUpdated, refresh } = useCatalogMetrics();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {lastUpdated && (
            <Text style={styles.infoText}>Atualizado em {new Date(lastUpdated).toLocaleString("pt-BR")}</Text>
          )}
        </View>
        {onLogoutPress && (
          <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.cardsGrid}>
        <SummaryCard label="Cursos ativos" value={metrics.cursos} />
        <SummaryCard label="Turmas cadastradas" value={metrics.turmas} />
        <SummaryCard label="Empresas conveniadas" value={metrics.empresas} />
        <SummaryCard label="Supervisores ativos" value={metrics.supervisores} />
        <SummaryCard label="Convênios" value={metrics.convenios} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refresh} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.refreshText}>Atualizar</Text>}
          </TouchableOpacity>
        </View>
        {actions && actions.length > 0 ? (
          actions.map((action) => (
            <TouchableOpacity key={action.label} style={styles.actionCard} onPress={action.onPress}>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.infoText}>Nenhuma ação configurada para este perfil.</Text>
        )}
      </View>

      {children}
    </ScrollView>
  );
};

export default CatalogDashboard;
