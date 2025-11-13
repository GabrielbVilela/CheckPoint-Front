import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import useDocumentosHook from "@/hooks/useDocumentos";
import useDocumentosResumo from "@/hooks/useDocumentosResumo";
import useCursos from "@/hooks/useCursos";
import useEmpresas from "@/hooks/useEmpresas";
import {
  DocumentoDTO,
  DocumentoFilterParams,
  DocumentoResumoDTO,
  DocumentoStatus,
  DocumentoTipo,
  exportDocumentosInline,
  uploadDocumentoFile,
} from "@/services/documentos";

const STATUS_OPTIONS: DocumentoStatus[] = ["pendente", "aprovado", "rejeitado"];
const TIPO_OPTIONS: { label: string; value: DocumentoTipo }[] = [
  { label: "TCE", value: "tce" },
  { label: "Plano de atividades", value: "plano_atividades" },
  { label: "Aditivo", value: "aditivo" },
  { label: "Outro", value: "outro" },
];

const STATUS_LABELS: Record<DocumentoStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const STATUS_COLORS: Record<DocumentoStatus, { bg: string; border: string; text: string }> = {
  pendente: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
  aprovado: { bg: "#DCFCE7", border: "#22C55E", text: "#166534" },
  rejeitado: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
};

const RESUMO_KEYS: Record<DocumentoStatus, keyof DocumentoResumoDTO> = {
  pendente: "pendentes",
  aprovado: "aprovados",
  rejeitado: "rejeitados",
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR")}`;
};

const extractFileName = (url?: string | null) => {
  if (!url) {
    return null;
  }
  try {
    const parts = url.split("/");
    return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    return url;
  }
};

const DocumentManager = () => {
  const [statusFilter, setStatusFilter] = useState<"todos" | DocumentoStatus>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const { cursos } = useCursos();
  const { empresas } = useEmpresas();
  const [cursoFiltro, setCursoFiltro] = useState<number | null>(null);
  const [empresaFiltro, setEmpresaFiltro] = useState<number | null>(null);
  const [periodoFiltro, setPeriodoFiltro] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<DocumentoFilterParams | undefined>(undefined);

  const filterPayload = useMemo<DocumentoFilterParams | undefined>(() => {
    const payload: DocumentoFilterParams = {};
    if (statusFilter !== "todos") {
      payload.status = statusFilter;
    }
    if (appliedFilters) {
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          (payload as any)[key] = value;
        }
      });
    }
    return Object.keys(payload).length ? payload : undefined;
  }, [appliedFilters, statusFilter]);

  const { documentos, loading, submitting, error, refresh, createDocumento, updateDocumento, deleteDocumento } =
    useDocumentosHook(filterPayload);
  const {
    resumo,
    loading: resumoLoading,
    error: resumoError,
    refresh: refreshResumo,
  } = useDocumentosResumo();

  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editandoDocumento, setEditandoDocumento] = useState<DocumentoDTO | null>(null);
  const [detailDocumento, setDetailDocumento] = useState<DocumentoDTO | null>(null);
  const [contratoId, setContratoId] = useState("");
  const [tipo, setTipo] = useState<DocumentoTipo>("tce");
  const [status, setStatus] = useState<DocumentoStatus>("pendente");
  const [observacoes, setObservacoes] = useState("");
  const [comentarioStatus, setComentarioStatus] = useState("");
  const [arquivoUrl, setArquivoUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [detailStatus, setDetailStatus] = useState<DocumentoStatus>("pendente");
  const [detailComentario, setDetailComentario] = useState("");
  const [cursoModalVisible, setCursoModalVisible] = useState(false);
  const [empresaModalVisible, setEmpresaModalVisible] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  useEffect(() => {
    if (detailDocumento) {
      setDetailStatus(detailDocumento.status);
      setDetailComentario("");
    }
  }, [detailDocumento]);

  const resetForm = () => {
    setContratoId("");
    setTipo("tce");
    setStatus("pendente");
    setObservacoes("");
    setComentarioStatus("");
    setArquivoUrl("");
    setSelectedFileName(null);
    setEditandoDocumento(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (doc: DocumentoDTO) => {
    setEditandoDocumento(doc);
    setContratoId(String(doc.id_contrato));
    setTipo(doc.tipo);
    setStatus(doc.status);
    setObservacoes(doc.observacoes ?? "");
    setComentarioStatus("");
    setArquivoUrl(doc.arquivo_url ?? "");
    setSelectedFileName(extractFileName(doc.arquivo_url ?? "") ?? null);
    setModalVisible(true);
  };

  const openDetailModal = (doc: DocumentoDTO) => {
    setDetailDocumento(doc);
    setDetailVisible(true);
  };

  const closeDetailModal = () => {
    setDetailVisible(false);
    setDetailDocumento(null);
    setDetailComentario("");
  };

  const selectedCursoLabel = useMemo(() => {
    if (cursoFiltro === null) {
      return "Todos";
    }
    const curso = cursos.find((c) => c.id === cursoFiltro);
    return curso?.nome ?? `Curso #${cursoFiltro}`;
  }, [cursoFiltro, cursos]);

  const selectedEmpresaLabel = useMemo(() => {
    if (empresaFiltro === null) {
      return "Todas";
    }
    const empresa = empresas.find((e) => e.id === empresaFiltro);
    return empresa?.nome_fantasia ?? empresa?.razao_social ?? `Empresa #${empresaFiltro}`;
  }, [empresaFiltro, empresas]);

  const appliedCursoLabel = useMemo(() => {
    if (!appliedFilters?.curso_id) {
      return null;
    }
    const curso = cursos.find((c) => c.id === appliedFilters.curso_id);
    return curso?.nome ?? `Curso #${appliedFilters.curso_id}`;
  }, [appliedFilters?.curso_id, cursos]);

  const appliedEmpresaLabel = useMemo(() => {
    if (!appliedFilters?.empresa_id) {
      return null;
    }
    const empresa = empresas.find((e) => e.id === appliedFilters.empresa_id);
    return empresa?.nome_fantasia ?? empresa?.razao_social ?? `Empresa #${appliedFilters.empresa_id}`;
  }, [appliedFilters?.empresa_id, empresas]);

  const activeFiltersDescription = useMemo(() => {
    const parts: string[] = [];
    if (statusFilter !== "todos") {
      parts.push(`Status: ${STATUS_LABELS[statusFilter]}`);
    }
    if (appliedCursoLabel) {
      parts.push(`Curso: ${appliedCursoLabel}`);
    }
    if (appliedEmpresaLabel) {
      parts.push(`Empresa: ${appliedEmpresaLabel}`);
    }
    if (appliedFilters?.periodo) {
      parts.push(`Período: ${appliedFilters.periodo}`);
    }
    if (appliedFilters?.data_inicio || appliedFilters?.data_fim) {
      parts.push(`Janela: ${appliedFilters?.data_inicio ?? "..."} → ${appliedFilters?.data_fim ?? "..."}`);
    }
    return parts.length ? parts.join(" • ") : "Sem filtros avançados aplicados.";
  }, [appliedFilters, appliedCursoLabel, appliedEmpresaLabel, statusFilter]);

  const handleSelectCurso = (value: number | null) => {
    setCursoFiltro(value);
    setCursoModalVisible(false);
  };

  const handleSelectEmpresa = (value: number | null) => {
    setEmpresaFiltro(value);
    setEmpresaModalVisible(false);
  };

  const handleApplyFilters = () => {
    const normalizeDate = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return undefined;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        throw new Error("Use o formato AAAA-MM-DD para as datas.");
      }
      return trimmed;
    };
    try {
      const next: DocumentoFilterParams = {};
      if (cursoFiltro !== null) {
        next.curso_id = cursoFiltro;
      }
      if (empresaFiltro !== null) {
        next.empresa_id = empresaFiltro;
      }
      if (periodoFiltro.trim()) {
        next.periodo = periodoFiltro.trim();
      }
      const dataInicio = normalizeDate(dataInicioFiltro);
      const dataFim = normalizeDate(dataFimFiltro);
      if (dataInicio) {
        next.data_inicio = dataInicio;
      }
      if (dataFim) {
        next.data_fim = dataFim;
      }
      setAppliedFilters(Object.keys(next).length ? next : undefined);
    } catch (err: any) {
      Alert.alert("Filtro inválido", err?.message ?? "Reveja os valores dos filtros.");
    }
  };

  const handleClearFilters = () => {
    setCursoFiltro(null);
    setEmpresaFiltro(null);
    setPeriodoFiltro("");
    setDataInicioFiltro("");
    setDataFimFiltro("");
    setAppliedFilters(undefined);
  };

  const handleExportDocumentos = async (format: "csv" | "pdf") => {
    try {
      setExporting(format);
      const exportData = await exportDocumentosInline(format, filterPayload);
      const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!baseDir) {
        throw new Error("Diretório temporário indisponível.");
      }
      const targetPath = `${baseDir}${exportData.filename}`;
      await FileSystem.writeAsStringAsync(targetPath, exportData.content_base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(targetPath, {
          mimeType: exportData.mime_type,
          dialogTitle: `Exportar documentos (${format.toUpperCase()})`,
        });
      } else {
        Alert.alert("Exportação pronta", `Arquivo salvo em: ${targetPath}`);
      }
    } catch (err: any) {
      console.error("Erro ao exportar documentos:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível exportar no momento.";
      Alert.alert("Falha na exportação", detail);
    } finally {
      setExporting(null);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) {
        return;
      }
      const asset = result.assets[0];
      const fileUri = asset.fileCopyUri ?? asset.uri;
      if (!fileUri) {
        Alert.alert("Selecao invalida", "Nao foi possivel acessar o arquivo selecionado.");
        return;
      }
      setUploadingFile(true);
      const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: "base64" });
      const response = await uploadDocumentoFile({
        filename: asset.name ?? `documento-${Date.now()}`,
        content_base64: base64,
      });
      setArquivoUrl(response.url);
      setSelectedFileName(asset.name ?? extractFileName(response.url) ?? "arquivo");
      Alert.alert("Upload concluido", "Arquivo enviado com sucesso.");
    } catch (err) {
      console.error("Erro ao enviar documento:", err);
      Alert.alert("Falha no upload", "Nao foi possivel enviar o arquivo. Tente novamente.");
      setArquivoUrl("");
      setSelectedFileName(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async () => {
    const numericContrato = Number(contratoId);
    if (!editandoDocumento && (!Number.isInteger(numericContrato) || numericContrato <= 0)) {
      Alert.alert("Contrato invalido", "Informe um ID de contrato valido.");
      return;
    }
    if (!arquivoUrl && !editandoDocumento) {
      Alert.alert("Arquivo obrigatorio", "Envie o arquivo do documento antes de salvar.");
      return;
    }
    const payloadBase = {
      tipo,
      arquivo_url: arquivoUrl || undefined,
      status,
      observacoes: observacoes?.trim() ? observacoes.trim() : undefined,
    };
    try {
      if (editandoDocumento) {
        await updateDocumento(editandoDocumento.id, {
          ...payloadBase,
          comentario: comentarioStatus.trim() ? comentarioStatus.trim() : undefined,
        });
        Alert.alert("Documento atualizado", "As informacoes foram salvas com sucesso.");
      } else {
        await createDocumento({
          ...payloadBase,
          id_contrato: numericContrato,
        });
        Alert.alert("Documento criado", "Registro incluido com sucesso.");
      }
      resetForm();
      setModalVisible(false);
      await refreshResumo();
    } catch {
      // erros sao tratados no hook; apenas mantemos o modal aberto
    }
  };

  const handleDelete = (doc: DocumentoDTO) => {
    Alert.alert(
      "Remover documento",
      "Esta acao nao pode ser desfeita. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDocumento(doc.id);
              await refreshResumo();
              Alert.alert("Documento removido", "Registro excluido com sucesso.");
            } catch {
              /* erro tratado no hook */
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOpenFile = async (url?: string | null) => {
    if (!url) {
      Alert.alert("Arquivo indisponivel", "Nenhum arquivo foi anexado a este documento.");
      return;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Falha ao abrir", "Nao foi possivel abrir o arquivo.");
      return;
    }
    await Linking.openURL(url);
  };

  const handleSaveStatus = async () => {
    if (!detailDocumento) {
      return;
    }
    const statusChanged = detailStatus !== detailDocumento.status;
    if (detailStatus === "rejeitado" && !detailComentario.trim()) {
      Alert.alert("Comentario obrigatorio", "Inclua um motivo para rejeitar o documento.");
      return;
    }
    if (statusChanged && !detailComentario.trim()) {
      Alert.alert("Comentario obrigatorio", "Adicione um comentario para registrar a mudanca de status.");
      return;
    }
    try {
      await updateDocumento(detailDocumento.id, {
        status: detailStatus,
        comentario: detailComentario.trim() ? detailComentario.trim() : undefined,
      });
      await refreshResumo();
      closeDetailModal();
      Alert.alert("Status atualizado", "O documento foi atualizado.");
    } catch {
      /* erro tratado no hook */
    }
  };

  const filteredDocumentos = useMemo(() => {
    if (!searchTerm.trim()) {
      return documentos;
    }
    const term = searchTerm.trim().toLowerCase();
    return documentos.filter((doc) => {
      const contratoMatch = String(doc.id_contrato).includes(term);
      const tipoMatch = doc.tipo.toLowerCase().includes(term);
      const obsMatch = (doc.observacoes ?? "").toLowerCase().includes(term);
      const statusMatch = doc.status.toLowerCase().includes(term);
      return contratoMatch || tipoMatch || obsMatch || statusMatch;
    });
  }, [documentos, searchTerm]);

  const renderDocumento = ({ item }: { item: DocumentoDTO }) => {
    const statusStyle = STATUS_COLORS[item.status];
    return (
      <View style={styles.listItem}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>Contrato #{item.id_contrato}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{STATUS_LABELS[item.status]}</Text>
          </View>
        </View>
        <Text style={styles.itemSubtitle}>{TIPO_OPTIONS.find((t) => t.value === item.tipo)?.label ?? item.tipo}</Text>
        <Text style={styles.itemMeta}>Criado em {formatDateTime(item.criado_em)}</Text>
        {item.observacoes ? <Text style={styles.itemObs}>{item.observacoes}</Text> : null}
        <View style={styles.listActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenFile(item.arquivo_url)}>
            <Text style={styles.actionText}>Abrir arquivo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => openDetailModal(item)}>
            <Text style={styles.actionText}>Detalhes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
            <Text style={[styles.actionText, { color: "#B91C1C" }]}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Documentos institucionais</Text>
          <Text style={styles.subtitle}>Controle completo de uploads, status e trilha de auditoria.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addText}>Novo documento</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryRow}>
        {resumoError ? (
          <Text style={styles.errorText}>{resumoError}</Text>
        ) : (
          STATUS_OPTIONS.map((statusKey) => {
            const resumoKey = RESUMO_KEYS[statusKey];
            const resumoValue = resumoLoading ? "..." : resumo[resumoKey] ?? 0;
            return (
              <View key={statusKey} style={[styles.summaryCard, { borderColor: STATUS_COLORS[statusKey].border }]}>
                <Text style={styles.summaryLabel}>{STATUS_LABELS[statusKey]}</Text>
                <Text style={[styles.summaryValue, { color: STATUS_COLORS[statusKey].text }]}>{resumoValue}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "todos" && { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
          ]}
          onPress={() => setStatusFilter("todos")}
        >
          <Text style={[styles.filterChipText, statusFilter === "todos" && styles.filterChipTextActive]}>Todos</Text>
        </TouchableOpacity>
        {STATUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterChip,
              statusFilter === option && { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
            ]}
            onPress={() => setStatusFilter(option)}
          >
            <Text style={[styles.filterChipText, statusFilter === option && styles.filterChipTextActive]}>
              {STATUS_LABELS[option]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por contrato, tipo, status ou observacoes"
        value={searchTerm}
        onChangeText={setSearchTerm}
        autoCapitalize="none"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.filtersCard}>
        <View style={styles.filtersHeader}>
          <Text style={styles.filtersTitle}>Filtros avançados</Text>
          <View style={styles.filtersActions}>
            <TouchableOpacity style={styles.filterActionButton} onPress={handleApplyFilters}>
              <Text style={styles.filterActionText}>Aplicar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterClearButton} onPress={handleClearFilters}>
              <Text style={styles.filterClearText}>Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.filterSummary}>{activeFiltersDescription}</Text>
        <View style={styles.filterButtonsRow}>
          <TouchableOpacity style={styles.selectButton} onPress={() => setCursoModalVisible(true)}>
            <Text style={styles.selectButtonLabel}>Curso</Text>
            <Text style={styles.selectButtonValue}>{selectedCursoLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectButton, styles.selectButtonLast]}
            onPress={() => setEmpresaModalVisible(true)}
          >
            <Text style={styles.selectButtonLabel}>Empresa</Text>
            <Text style={styles.selectButtonValue}>{selectedEmpresaLabel}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Período (ex.: 5º)"
          value={periodoFiltro}
          onChangeText={setPeriodoFiltro}
        />
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="Início AAAA-MM-DD"
            value={dataInicioFiltro}
            onChangeText={setDataInicioFiltro}
          />
          <TextInput
            style={[styles.input, styles.dateInput, styles.dateInputLast]}
            placeholder="Fim AAAA-MM-DD"
            value={dataFimFiltro}
            onChangeText={setDataFimFiltro}
          />
        </View>
        <View style={styles.filtersExportRow}>
          <TouchableOpacity
            style={[
              styles.filtersExportButton,
              exporting === "csv" && styles.filtersExportButtonDisabled,
            ]}
            onPress={() => handleExportDocumentos("csv")}
            disabled={exporting !== null}
          >
            {exporting === "csv" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.filtersExportText}>Exportar CSV</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filtersExportButtonSecondary,
              exporting === "pdf" && styles.filtersExportButtonDisabled,
            ]}
            onPress={() => handleExportDocumentos("pdf")}
            disabled={exporting !== null}
          >
            {exporting === "pdf" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.filtersExportText}>Exportar PDF</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredDocumentos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderDocumento}
        refreshing={loading}
        onRefresh={refresh}
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.emptyText}>
              {searchTerm.trim()
                ? "Nenhum documento corresponde ao filtro informado."
                : "Nenhum documento foi cadastrado ate o momento."}
            </Text>
          )
        }
      />

      <Modal
        transparent
        animationType="fade"
        visible={cursoModalVisible}
        onRequestClose={() => setCursoModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCursoModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.selectorModalCard]}>
            <Text style={styles.modalTitle}>Selecionar curso</Text>
            <ScrollView style={styles.selectorList}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleSelectCurso(null)}
              >
                <Text style={styles.optionButtonText}>Todos os cursos</Text>
              </TouchableOpacity>
              {cursos.map((curso) => (
                <TouchableOpacity
                  key={curso.id}
                  style={styles.optionButton}
                  onPress={() => handleSelectCurso(curso.id)}
                >
                  <Text style={styles.optionButtonText}>{curso.nome}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={empresaModalVisible}
        onRequestClose={() => setEmpresaModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setEmpresaModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.selectorModalCard]}>
            <Text style={styles.modalTitle}>Selecionar empresa</Text>
            <ScrollView style={styles.selectorList}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleSelectEmpresa(null)}
              >
                <Text style={styles.optionButtonText}>Todas as empresas</Text>
              </TouchableOpacity>
              {empresas.map((empresa) => (
                <TouchableOpacity
                  key={empresa.id}
                  style={styles.optionButton}
                  onPress={() => handleSelectEmpresa(empresa.id)}
                >
                  <Text style={styles.optionButtonText}>
                    {empresa.nome_fantasia ?? empresa.razao_social}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (!submitting) {
              setModalVisible(false);
              resetForm();
            }
          }}
        >
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editandoDocumento ? "Editar documento" : "Novo documento"}</Text>

              <Text style={styles.label}>ID do contrato</Text>
              <TextInput
                style={styles.input}
                value={contratoId}
                onChangeText={setContratoId}
                placeholder="Ex.: 12"
                keyboardType="number-pad"
                editable={!editandoDocumento}
              />
              {editandoDocumento ? (
                <Text style={styles.hintText}>O contrato nao pode ser alterado apos o cadastro inicial.</Text>
              ) : null}

              <Text style={styles.label}>Tipo</Text>
              <View style={styles.statusRow}>
                {TIPO_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.statusChip, tipo === option.value && styles.statusChipActive]}
                    onPress={() => setTipo(option.value)}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        tipo === option.value && styles.statusChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Status</Text>
              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.statusChip, status === option && styles.statusChipActive]}
                    onPress={() => setStatus(option)}
                  >
                    <Text style={[styles.statusChipText, status === option && styles.statusChipTextActive]}>
                      {STATUS_LABELS[option]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Observacoes</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={observacoes}
                onChangeText={setObservacoes}
                placeholder="Observacoes internas ou pendencias"
                multiline
              />

              <Text style={styles.label}>Arquivo</Text>
              <View style={styles.uploadRow}>
                <TouchableOpacity style={styles.uploadButton} onPress={handlePickFile} disabled={uploadingFile}>
                  {uploadingFile ? (
                    <ActivityIndicator color="#0277BD" />
                  ) : (
                    <Text style={styles.uploadButtonText}>{arquivoUrl ? "Substituir" : "Selecionar"}</Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.fileInfoText}>
                  {selectedFileName ?? (arquivoUrl ? extractFileName(arquivoUrl) : "Nenhum arquivo selecionado")}
                </Text>
              </View>

              <Text style={styles.label}>Comentario (opcional)</Text>
              <TextInput
                style={styles.input}
                value={comentarioStatus}
                onChangeText={setComentarioStatus}
                placeholder="Use para registrar ajustes"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    if (!submitting) {
                      setModalVisible(false);
                      resetForm();
                    }
                  }}
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={detailVisible} onRequestClose={closeDetailModal}>
        <TouchableWithoutFeedback onPress={closeDetailModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: "85%" }]}>
            {detailDocumento ? (
              <ScrollView>
                <Text style={styles.modalTitle}>Detalhes do documento</Text>
                <Text style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Contrato: </Text>#{detailDocumento.id_contrato}
                </Text>
                <Text style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Tipo: </Text>
                  {TIPO_OPTIONS.find((t) => t.value === detailDocumento.tipo)?.label ?? detailDocumento.tipo}
                </Text>
                <Text style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Status atual: </Text>
                  {STATUS_LABELS[detailDocumento.status]}
                </Text>
                <Text style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Criado em: </Text>
                  {formatDateTime(detailDocumento.criado_em)}
                </Text>
                <Text style={styles.detailLine}>
                  <Text style={styles.detailLabel}>Atualizado em: </Text>
                  {formatDateTime(detailDocumento.atualizado_em)}
                </Text>
                {detailDocumento.observacoes ? (
                  <Text style={styles.detailLine}>
                    <Text style={styles.detailLabel}>Observacoes: </Text>
                    {detailDocumento.observacoes}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.uploadButton, { marginTop: 12 }]}
                  onPress={() => handleOpenFile(detailDocumento.arquivo_url)}
                >
                  <Text style={styles.uploadButtonText}>Abrir arquivo anexado</Text>
                </TouchableOpacity>

                <View style={styles.detailDivider} />
                <Text style={styles.label}>Atualizar status</Text>
                <View style={styles.statusRow}>
                  {STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.statusChip, detailStatus === option && styles.statusChipActive]}
                      onPress={() => setDetailStatus(option)}
                    >
                      <Text style={[styles.statusChipText, detailStatus === option && styles.statusChipTextActive]}>
                        {STATUS_LABELS[option]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.input, { minHeight: 70 }]}
                  placeholder="Comentario para a mudanca de status"
                  value={detailComentario}
                  onChangeText={setDetailComentario}
                  multiline
                />
                <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleSaveStatus}>
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Salvar status</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.detailDivider} />
                <Text style={styles.label}>Historico</Text>
                {detailDocumento.logs?.length ? (
                  detailDocumento.logs.map((log) => (
                    <View key={log.id} style={styles.historyItem}>
                      <Text style={styles.historyLabel}>{formatDateTime(log.criado_em)}</Text>
                      <Text style={styles.historyValue}>
                        {STATUS_LABELS[log.status]} {log.usuario ? `por ${log.usuario.nome}` : ""}
                      </Text>
                      {log.comentario ? <Text style={styles.historyComment}>{log.comentario}</Text> : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Sem registros de historico.</Text>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
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
  summaryRow: {
    marginBottom: 12,
  },
  summaryCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 120,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#4b5563",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 8,
  },
  filterChipText: {
    color: "#4b5563",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  filtersCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  filtersTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  filtersActions: {
    flexDirection: "row",
  },
  filterActionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    marginLeft: 8,
  },
  filterActionText: {
    color: "#fff",
    fontWeight: "600",
  },
  filterClearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
    marginLeft: 8,
  },
  filterClearText: {
    color: "#374151",
    fontWeight: "600",
  },
  filterSummary: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  filterButtonsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  selectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  selectButtonLast: {
    marginRight: 0,
  },
  selectButtonLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  selectButtonValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  dateInputLast: {
    marginRight: 0,
  },
  filtersExportRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  filtersExportButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  filtersExportButtonSecondary: {
    flex: 1,
    backgroundColor: "#6D28D9",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  filtersExportButtonDisabled: {
    opacity: 0.6,
  },
  filtersExportText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorText: {
    color: "#b91c1c",
    marginBottom: 8,
  },
  listItem: {
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  itemSubtitle: {
    color: "#4b5563",
    fontSize: 13,
    marginTop: 2,
  },
  itemMeta: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 2,
  },
  itemObs: {
    color: "#374151",
    fontSize: 13,
    marginTop: 6,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 6,
  },
  actionText: {
    fontSize: 12,
    color: "#374151",
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
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
  hintText: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: -8,
    marginBottom: 12,
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#0277BD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  uploadButtonText: {
    color: "#0277BD",
    fontWeight: "600",
  },
  fileInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#555",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 8,
    marginBottom: 8,
  },
  statusChipActive: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  statusChipText: {
    color: "#374151",
    fontWeight: "600",
  },
  statusChipTextActive: {
    color: "#fff",
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
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  submitButton: {
    backgroundColor: "#2563EB",
  },
  cancelText: {
    color: "#4b5563",
    fontWeight: "600",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  detailLine: {
    fontSize: 13,
    color: "#1f2937",
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: "600",
  },
  detailDivider: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginVertical: 16,
  },
  historyItem: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 10,
  },
  historyLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  historyValue: {
    fontSize: 13,
    color: "#1f2937",
    marginTop: 2,
  },
  historyComment: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
  },
  selectorModalCard: {
    maxHeight: "70%",
  },
  selectorList: {
    width: "100%",
  },
  optionButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  optionButtonText: {
    fontSize: 14,
    color: "#1f2937",
  },
});

export default DocumentManager;
