import * as Location from "expo-location";
import { useState } from "react";
import { Alert } from "react-native";
import { getEndpoints } from "src/constants/env";
import getApiClient from "src/services/api";
import { useAuthStore } from "src/store/authStore";

export interface PointData {
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

export const usePointRegistration = () => {
  const [pointData, setPointData] = useState<PointData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureAuthenticated = () => {
    const currentAuth = useAuthStore.getState().isAuthenticated;
    if (!currentAuth) {
      setError("Sessao expirada. Faca login novamente.");
      return false;
    }
    return true;
  };

  const capturePoint = async () => {
    if (!ensureAuthenticated()) {
      return;
    }

    setLoading(true);
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError(
        "Permissao de acesso a localizacao negada. Habilite o GPS nas configuracoes."
      );
      setLoading(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
      });

      const newPointData: PointData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      setPointData(newPointData);
    } catch (err) {
      console.error("Erro ao capturar localizacao:", err);
      setError("Nao foi possivel obter a sua localizacao. Verifique o GPS.");
    } finally {
      setLoading(false);
    }
  };

  const confirmPointRegistration = async () => {
    if (!ensureAuthenticated()) {
      return;
    }
    if (!pointData) {
      setError("Nenhum dado de ponto para registrar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const endpoints = getEndpoints();
      const authState = useAuthStore.getState();
      const rawId = authState.user?.id ?? authState.user?.matricula ?? null;
      const idAluno = rawId != null ? parseInt(String(rawId), 10) : NaN;

      if (!Number.isFinite(idAluno)) {
        throw new Error("Identificador do aluno ausente ou invalido (matricula/id).");
      }

      const payload = {
        id_aluno: idAluno,
        latitude_atual: pointData.latitude,
        longitude_atual: pointData.longitude,
      };

      // Passo 1: verificar localizacao antes de registrar
      try {
        await api.post(endpoints.verificarLocalizacao, payload);
      } catch (verr: any) {
        let vMsg = "Nao foi possivel verificar sua localizacao.";
        if (verr?.code === "ERR_NETWORK" || verr?.message === "Network Error") {
          vMsg =
            "Falha de comunicacao com o servidor. Se estiver no navegador, atualize a pagina e tente novamente.";
        } else if (verr?.response?.status === 422) {
          const detail = verr?.response?.data?.detail;
          if (typeof detail === "string") {
            vMsg = detail;
          } else if (Array.isArray(detail)) {
            vMsg =
              detail
                .map((d: any) => d?.msg)
                .filter(Boolean)
                .join("; ") || vMsg;
          }
        } else if (verr?.response?.data?.detail) {
          vMsg = verr.response.data.detail;
        }
        setError(`Falha na verificacao de localizacao: ${vMsg}`);
        return; // nao prosseguir para o registro
      }

      // Passo 2: registrar ponto
      const response = await api.post(endpoints.registro, payload);

      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          "Sucesso",
          "Ponto registrado! O backend esta validando sua localizacao."
        );
        setPointData(null);
      }
    } catch (err: any) {
      console.error("Erro ao registrar ponto:", err);
      let errorMessage = "Erro ao comunicar com o servidor.";

      if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
        errorMessage =
          "Falha de comunicacao com o servidor. Se estiver no navegador, atualize a pagina e tente novamente.";
      } else if (err?.response?.status === 422) {
        const detail = err?.response?.data?.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage =
            detail
              .map((d: any) => d?.msg)
              .filter(Boolean)
              .join("; ") || "Requisicao invalida.";
        } else {
          errorMessage = "Requisicao invalida.";
        }
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }

      setError(`Falha no registro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelConfirmation = () => setPointData(null);

  return {
    pointData,
    loading,
    error,
    capturePoint,
    confirmPointRegistration,
    cancelConfirmation,
  };
};

export default usePointRegistration;
