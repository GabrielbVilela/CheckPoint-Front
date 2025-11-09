import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import {
  AddressStep,
} from "@/features/cadastro/components/AddressStep";
import {
  ContractStep,
} from "@/features/cadastro/components/ContractStep";
import {
  PeriodoModal,
} from "@/features/cadastro/components/PeriodoModal";
import {
  PersonalDataStep,
} from "@/features/cadastro/components/PersonalDataStep";
import {
  StepIndicator,
} from "@/features/cadastro/components/StepIndicator";
import {
  formatCep,
  formatDateFromDate,
  formatPhone,
  onlyDigits,
  formatTimeInput,
} from "@/features/cadastro/formatters";
import {
  CadastroAlunoErrors,
  CadastroAlunoForm,
  CadastroAlunoStep,
  CadastroDateField,
  PeriodoOption,
} from "@/features/cadastro/types";
import {
  isEndAfterStart,
  isValidDate,
  validateStep,
} from "@/features/cadastro/validation";
import getApiClient from "@/services/api";
import { getEndpoints } from "@/config/env";
import useTurmas from "@/hooks/useTurmas";
import useConvenios from "@/hooks/useConvenios";
import useSupervisores from "@/hooks/useSupervisores";

const INITIAL_FORM: CadastroAlunoForm = {
  nome: "",
  matricula: "",
  celular: "",
  email: "",
  turma: "",
  periodo: "",
  cep: "",
  logradouro: "",
  numero: "",
  cidade: "",
  estado: "",
  dataInicio: "",
  dataFim: "",
  horaInicio: "",
  horaFim: "",
  tolerancia: "10",
  raio: "100",
  turmaId: "",
  convenioId: "",
  supervisorId: "",
};

const STEP_TITLES: Record<CadastroAlunoStep, string> = {
  1: "Dados",
  2: "EndereÃ§o",
  3: "Contrato",
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type SelectorType = "turma" | "convenio" | "supervisor";

type SelectionOption = {
  value: string;
  label: string;
  description?: string;
};

const StudentWizardModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const [step, setStep] = useState<CadastroAlunoStep>(1);
  const [form, setForm] = useState<CadastroAlunoForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<CadastroAlunoErrors>({});
  const [periodoVisible, setPeriodoVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<CadastroDateField | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const { turmas, loading: turmasLoading } = useTurmas();
  const { convenios, loading: conveniosLoading } = useConvenios();
  const { supervisores, loading: supervisoresLoading } = useSupervisores();
  const [selectorType, setSelectorType] = useState<SelectorType | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setStep(1);
    setForm(INITIAL_FORM);
    setErrors({});
    setSelectorType(null);
  }, [visible]);

  const clearError = (field: keyof CadastroAlunoErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (field: keyof CadastroAlunoForm, value: string) => {
    let nextValue = value;
    if (field === "matricula") {
      nextValue = onlyDigits(value).slice(0, 8);
    }
    if (field === "celular") {
      nextValue = formatPhone(value);
    }
    if (field === "cep") {
      nextValue = formatCep(value);
    }
    if (field === "numero") {
      nextValue = onlyDigits(value).slice(0, 6);
    }
    if (field === "estado") {
      nextValue = value.toUpperCase();
    }
    if (field === "horaInicio" || field === "horaFim") {
      nextValue = formatTimeInput(value);
    }
    if (field === "tolerancia") {
      nextValue = onlyDigits(value).slice(0, 3);
    }
    if (field === "raio") {
      nextValue = onlyDigits(value).slice(0, 4);
    }
    if (field === "turmaId" || field === "convenioId" || field === "supervisorId") {
      nextValue = onlyDigits(value);
    }
    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handlePeriodoSelect = (option: PeriodoOption) => {
    setForm((prev) => ({ ...prev, periodo: option.label }));
    setPeriodoVisible(false);
    clearError("periodo");
  };

  const selectionOptions = useMemo(
    () => ({
      turma: turmas.map((turma) => ({
        value: String(turma.id),
        label: turma.nome,
        description: turma.curso?.nome ? `${turma.curso.nome}${turma.turno ? ` - ${turma.turno}` : ""}` : turma.turno ?? undefined,
      })),
      convenio: convenios.map((convenio) => ({
        value: String(convenio.id),
        label: convenio.empresa?.nome_fantasia ?? convenio.empresa?.razao_social ?? "Convenio",
        description: convenio.curso?.nome ?? undefined,
      })),
      supervisor: supervisores.map((supervisor) => ({
        value: String(supervisor.id),
        label: supervisor.nome,
        description:
          supervisor.empresa?.nome_fantasia ??
          supervisor.empresa?.razao_social ??
          undefined,
      })),
    }),
    [turmas, convenios, supervisores]
  );

  const selectedTurma = useMemo(
    () => turmas.find((turma) => String(turma.id) === form.turmaId) ?? null,
    [turmas, form.turmaId]
  );
  const selectedConvenio = useMemo(
    () => convenios.find((convenio) => String(convenio.id) === form.convenioId) ?? null,
    [convenios, form.convenioId]
  );
  const selectedSupervisor = useMemo(
    () => supervisores.find((sup) => String(sup.id) === form.supervisorId) ?? null,
    [supervisores, form.supervisorId]
  );

  const selectionLabels = useMemo(
    () => ({
      turma:
        selectedTurma?.nome ??
        (form.turma ? `${form.turma}${form.turmaId ? "" : " (manual)"}` : ""),
      convenio:
        selectedConvenio
          ? `${selectedConvenio.empresa?.nome_fantasia ?? selectedConvenio.empresa?.razao_social ?? "Convenio"}${
              selectedConvenio.curso?.nome ? ` - ${selectedConvenio.curso?.nome}` : ""
            }`
          : "",
      supervisor:
        selectedSupervisor
          ? `${selectedSupervisor.nome}${
              selectedSupervisor.empresa?.nome_fantasia
                ? ` - ${selectedSupervisor.empresa?.nome_fantasia}`
                : selectedSupervisor.empresa?.razao_social
                ? ` - ${selectedSupervisor.empresa?.razao_social}`
                : ""
            }`
          : "",
    }),
    [selectedTurma, selectedConvenio, selectedSupervisor, form.turma, form.turmaId]
  );

  const selectorTitles: Record<SelectorType, string> = {
    turma: "Selecione a turma",
    convenio: "Selecione o convenio",
    supervisor: "Selecione o supervisor",
  };

  const selectorLoading = {
    turma: turmasLoading,
    convenio: conveniosLoading,
    supervisor: supervisoresLoading,
  };

  const selectorEmptyMessages: Record<SelectorType, string> = {
    turma: "Nenhuma turma cadastrada.",
    convenio: "Nenhum Convenio cadastrado.",
    supervisor: "Nenhum supervisor externo cadastrado.",
  };

  const handleSelectorPick = (type: SelectorType, option: SelectionOption) => {
    setForm((prev) => {
      if (type === "turma") {
        return { ...prev, turmaId: option.value, turma: option.label };
      }
      if (type === "convenio") {
        return { ...prev, convenioId: option.value };
      }
      return { ...prev, supervisorId: option.value };
    });
    clearError(type === "turma" ? "turmaId" : type === "convenio" ? "convenioId" : "supervisorId");
    setSelectorType(null);
  };

  const openDatePicker = (field: CadastroDateField) => {
    setActiveDateField(field);
    const initialDate = form[field === "dataInicio" ? "dataInicio" : "dataFim"];
    if (initialDate && isValidDate(initialDate)) {
      const [day, month, year] = initialDate.split("/");
      setPickerDate(new Date(Number(year), Number(month) - 1, Number(day)));
    } else {
      setPickerDate(new Date());
    }
    setDatePickerVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (!selectedDate || !activeDateField) {
      return;
    }
    setPickerDate(selectedDate);
    const formatted = formatDateFromDate(selectedDate);
    setForm((prev) => ({ ...prev, [activeDateField]: formatted }));
    clearError(activeDateField);
  };

  const closeDatePicker = () => setDatePickerVisible(false);

  const handleNext = () => {
    const fieldErrors = validateStep(step, form);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    if (step === 3 && form.dataInicio && form.dataFim && !isEndAfterStart(form.dataInicio, form.dataFim)) {
      setErrors({ dataFim: "Data final deve ser posterior Ã  data inÃ­cio." });
      return;
    }
    setStep((prev) => Math.min(3, prev + 1) as CadastroAlunoStep);
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1) as CadastroAlunoStep);

  const handleSubmit = async () => {
    const fieldErrors = validateStep(step, form);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    const api = getApiClient();
    const endpoints = getEndpoints();
    try {
      await api.post(endpoints.alunos, {
        nome: form.nome,
        matricula: form.matricula,
        senha: "123456",
        celular: form.celular,
        email: form.email,
        turma: form.turma,
        periodo: form.periodo,
        cep: form.cep,
        logradouro: form.logradouro,
        numero: form.numero,
        cidade: form.cidade,
        estado: form.estado,
        data_inicio: form.dataInicio || undefined,
        data_final: form.dataFim || undefined,
        hora_inicio_prevista: form.horaInicio || undefined,
        hora_fim_prevista: form.horaFim || undefined,
        tolerancia_minutos: form.tolerancia ? Number(form.tolerancia) : undefined,
        raio_permitido_metros: form.raio ? Number(form.raio) : undefined,
        id_turma: form.turmaId ? Number(form.turmaId) : undefined,
        id_convenio: form.convenioId ? Number(form.convenioId) : undefined,
        id_supervisor_externo: form.supervisorId ? Number(form.supervisorId) : undefined,
      });
      Alert.alert("Sucesso", "Aluno cadastrado com sucesso!");
      setForm(INITIAL_FORM);
      setStep(1);
      onSuccess?.();
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "NÃ£o foi possÃ­vel cadastrar o aluno.";
      Alert.alert("Erro", detail);
    }
  };

  const renderCurrentStep = () => {
    if (step === 1) {
      return (
        <PersonalDataStep
          form={form}
          errors={errors}
          onChange={handleChange}
          onNext={handleNext}
          onOpenPeriodoModal={() => setPeriodoVisible(true)}
          clearError={clearError}
        />
      );
    }
    if (step === 2) {
      return (
        <AddressStep
          form={form}
          errors={errors}
          onChange={handleChange}
          onNext={handleNext}
          onBack={handleBack}
          clearError={clearError}
        />
      );
    }
    return (
      <ContractStep
        form={form}
        errors={errors}
        onBack={handleBack}
        onSubmit={handleSubmit}
        onPickDate={openDatePicker}
        showDatePicker={datePickerVisible}
        activeDateField={activeDateField}
        pickerDate={pickerDate}
        onChangeDate={handleDateChange}
        onClosePicker={closeDatePicker}
        onChangeField={handleChange}
        clearError={clearError}
        onSelectTurma={() => setSelectorType("turma")}
        onSelectConvenio={() => setSelectorType("convenio")}
        onSelectSupervisor={() => setSelectorType("supervisor")}
        selectionLabels={selectionLabels}
      />
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cadastro completo de aluno</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>
          <StepIndicator activeStep={step} />
          <Text style={styles.stepHelper}>Etapa atual: {STEP_TITLES[step]}</Text>
          {renderCurrentStep()}
        </ScrollView>
      </KeyboardAvoidingView>
      <PeriodoModal visible={periodoVisible} onClose={() => setPeriodoVisible(false)} onSelect={handlePeriodoSelect} />

      <SelectionModal
        visible={selectorType !== null}
        title={selectorType ? selectorTitles[selectorType] : ""}
        options={selectorType ? selectionOptions[selectorType] : []}
        loading={selectorType ? selectorLoading[selectorType] : false}
        emptyMessage={selectorType ? selectorEmptyMessages[selectorType] : undefined}
        onSelect={(option) => {
          if (selectorType) {
            handleSelectorPick(selectorType, option);
          }
        }}
        onClose={() => setSelectorType(null)}
      />
    </Modal>
  );
};

type SelectionModalProps = {
  visible: boolean;
  title: string;
  options: SelectionOption[];
  loading: boolean;
  emptyMessage?: string;
  onSelect: (option: SelectionOption) => void;
  onClose: () => void;
};

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  title,
  options,
  loading,
  emptyMessage,
  onSelect,
  onClose,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.selectorOverlay} />
      </TouchableWithoutFeedback>
      <View style={styles.selectorWrapper}>
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <Text style={styles.selectorTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator />
          ) : options.length === 0 ? (
            <Text style={styles.emptySelectorText}>{emptyMessage ?? "Nenhuma opcao disponivel."}</Text>
          ) : (
            <ScrollView style={{ maxHeight: 320 }}>
              {options.map((option) => (
                <TouchableOpacity key={option.value} style={styles.selectorOption} onPress={() => onSelect(option)}>
                  <Text style={styles.selectorOptionLabel}>{option.label}</Text>
                  {option.description ? (
                    <Text style={styles.selectorOptionDescription}>{option.description}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeText: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  stepHelper: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  selectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  selectorWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  selectorCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 20,
    maxHeight: "80%",
  },
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  selectorOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  selectorOptionLabel: {
    fontSize: 16,
    color: "#111",
    fontWeight: "600",
  },
  selectorOptionDescription: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  emptySelectorText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
});

export default StudentWizardModal;
