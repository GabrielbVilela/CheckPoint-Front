import { getEndpoints } from "@/config/env";
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
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
};

const STEP_TITLES: Record<CadastroAlunoStep, string> = {
  1: "Dados",
  2: "Endereco",
  3: "Contrato",
};

const CadastroAlunoScreen = () => {
  const [step, setStep] = useState<CadastroAlunoStep>(1);
  const [form, setForm] = useState<CadastroAlunoForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<CadastroAlunoErrors>({});
  const [periodoVisible, setPeriodoVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] =
    useState<CadastroDateField | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

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
    if (field === "dataInicio" || field === "dataFim") {
      nextValue = value;
    }

    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  useEffect(() => {
    const cepDigits = onlyDigits(form.cep);
    if (cepDigits.length !== 8) {
      return;
    }
    let cancelled = false;

    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepDigits}/json/`
        );
        const data = await response.json();
        if (cancelled) {
          return;
        }
        if (data.erro) {
          Alert.alert("CEP nao encontrado");
          setForm((prev) => ({
            ...prev,
            logradouro: "",
            cidade: "",
            estado: "",
          }));
          setErrors((prev) => ({ ...prev, cep: "CEP invalido." }));
          return;
        }
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro ?? "",
          cidade: data.localidade ?? "",
          estado: (data.uf ?? "").toUpperCase(),
        }));
      } catch (err) {
        if (!cancelled) {
          console.error("Erro ao buscar CEP:", err);
          Alert.alert("Erro ao buscar CEP");
        }
      }
    };

    fetchAddress();

    return () => {
      cancelled = true;
    };
  }, [form.cep]);

  const handleNext = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3) as CadastroAlunoStep);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as CadastroAlunoStep);
  };

  const handlePeriodoSelect = (option: PeriodoOption) => {
    setForm((prev) => ({ ...prev, periodo: option.label }));
    clearError("periodo");
    setPeriodoVisible(false);
  };

  const openDatePicker = (field: CadastroDateField) => {
    setActiveDateField(field);
    const currentValue = form[field];
    if (isValidDate(currentValue)) {
      const digits = onlyDigits(currentValue);
      const parsed = new Date(
        Number(digits.slice(4)),
        Number(digits.slice(2, 4)) - 1,
        Number(digits.slice(0, 2))
      );
      setPickerDate(parsed);
    } else {
      setPickerDate(new Date());
    }
    setDatePickerVisible(true);
  };

  const closeDatePicker = () => {
    setDatePickerVisible(false);
    setActiveDateField(null);
  };

  const handleDateChange = (field: CadastroDateField, date: Date) => {
    const formatted = formatDateFromDate(date);
    setForm((prev) => ({
      ...prev,
      [field]: formatted,
    }));
    clearError(field);
    if (field === "dataFim") {
      if (!isEndAfterStart(form.dataInicio, formatted)) {
        setErrors((prev) => ({
          ...prev,
          dataFim: "A data de termino deve ser posterior a data de inicio.",
        }));
      } else {
        clearError("dataFim");
      }
    }
    if (field === "dataInicio" && form.dataFim) {
      if (!isEndAfterStart(formatted, form.dataFim)) {
        setErrors((prev) => ({
          ...prev,
          dataFim: "A data de termino deve ser posterior a data de inicio.",
        }));
      } else {
        clearError("dataFim");
      }
    }
    if (Platform.OS === "ios") {
      setPickerDate(date);
    } else {
      closeDatePicker();
    }
  };

  const findFirstInvalidStep = (aggregatedErrors: CadastroAlunoErrors) => {
    const stepKeys: Record<CadastroAlunoStep, (keyof CadastroAlunoForm)[]> = {
      1: ["nome", "matricula", "celular", "email", "turma", "periodo"],
      2: ["cep", "logradouro", "numero", "cidade", "estado"],
      3: ["dataInicio", "dataFim"],
    };

    for (const currentStep of [1, 2, 3] as CadastroAlunoStep[]) {
      if (
        stepKeys[currentStep].some((field) => aggregatedErrors[field] !== undefined)
      ) {
        return currentStep;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    let aggregatedErrors: CadastroAlunoErrors = {};
    ( [1, 2, 3] as CadastroAlunoStep[] ).forEach((currentStep) => {
      const currentErrors = validateStep(currentStep, form);
      aggregatedErrors = { ...aggregatedErrors, ...currentErrors };
    });

    const firstInvalid = findFirstInvalidStep(aggregatedErrors);
    if (firstInvalid) {
      setErrors(aggregatedErrors);
      setStep(firstInvalid);
      Alert.alert("Erro", "Revise os campos destacados antes de finalizar.");
      return;
    }

    try {
      const api = getApiClient();
      const endpoints = getEndpoints();
      await api.post(endpoints.alunos, form);
      Alert.alert("Sucesso", "Aluno cadastrado com sucesso!");
      setForm({ ...INITIAL_FORM });
      setErrors({});
      setStep(1);
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ?? "Nao foi possivel cadastrar o aluno.";
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
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <StepIndicator activeStep={step} />
        <View style={styles.titleContainer}>
          <View style={styles.titleDivider} />
          <View style={styles.titleBox}>
            <Text style={styles.stepTitle}>{STEP_TITLES[step]}</Text>
          </View>
          <View style={styles.titleDivider} />
        </View>
        {renderCurrentStep()}
      </ScrollView>
      <PeriodoModal
        visible={periodoVisible}
        onClose={() => setPeriodoVisible(false)}
        onSelect={handlePeriodoSelect}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  titleContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  titleDivider: {
    backgroundColor: "#ddd",
    flex: 1,
    height: 1,
  },
  titleBox: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
  },
  stepTitle: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CadastroAlunoScreen;
