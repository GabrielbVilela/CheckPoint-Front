import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";
import {
  enqueueOfflinePoint,
  getOfflineQueueLength,
  syncOfflinePoints,
} from "@/services/offlineQueue";
import { useAuthStore } from "@/store/authStore";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export interface PointData {
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

const isNetworkError = (err: any) =>
  err?.code === "ERR_NETWORK" || err?.message === "Network Error";

const extractApiMessage = (err: any, fallback: string) => {
  if (err?.response?.status === 422) {
    const detail = err?.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      const collected = detail
        .map((item: any) => item?.msg)
        .filter(Boolean)
        .join("; ");
      if (collected) {
        return collected;
      }
    }
  }
  if (typeof err?.response?.data?.detail === "string") {
    return err.response.data.detail;
  }
  return fallback;
};

export const usePointRegistration = () => {
  const [pointData, setPointData] = useState<PointData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [syncingQueue, setSyncingQueue] = useState(false);

  const ensureAuthenticated = () => {
    const currentAuth = useAuthStore.getState().isAuthenticated;
    if (!currentAuth) {
      setError("Sessao expirada. Faca login novamente.");
      return false;
    }
    return true;
  };

  const refreshQueuedCount = useCallback(async () => {
    try {
      const count = await getOfflineQueueLength();
      setQueuedCount(count);
    } catch (err) {
      console.warn("Falha ao ler fila offline:", err);
    }
  }, []);

  const handleSyncOfflinePoints = useCallback(
    async (showFeedback = false) => {
      setSyncingQueue(true);
      try {
        const result = await syncOfflinePoints();
        setQueuedCount(result.pending);
        if (showFeedback) {
          if (result.sent > 0) {
            Alert.alert(
              "Sincronizacao concluida",
              `${result.sent} ponto(s) enviados com sucesso.`
            );
          } else {
            Alert.alert(
              "Sincronizacao",
              "Nenhum ponto pendente encontrado."
            );
          }
        }
        return result;
      } catch (err) {
        console.error("Erro ao sincronizar pontos offline:", err);
        if (showFeedback) {
          Alert.alert(
            "Erro",
            "Nao foi possivel sincronizar agora. Verifique a conexao."
          );
        }
        throw err;
      } finally {
        setSyncingQueue(false);
      }
    },
    []
  );

  const storeOfflinePoint = useCallback(
    async (idAluno: number, data: PointData) => {
      await enqueueOfflinePoint({
        idAluno,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp,
      });
      await refreshQueuedCount();
      setPointData(null);
      Alert.alert(
        "Modo offline",
        "Sem conexao. O ponto foi salvo e sera sincronizado automaticamente."
      );
    },
    [refreshQueuedCount]
  );

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      await refreshQueuedCount();
      if (!mounted) {
        return;
      }
      try {
        await handleSyncOfflinePoints(false);
      } catch {
        console.debug("Fila offline sera sincronizada mais tarde.");
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [handleSyncOfflinePoints, refreshQueuedCount]);

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

      setPointData({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      });
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

    const authState = useAuthStore.getState();
    const rawId = authState.user?.id ?? authState.user?.matricula ?? null;
    const idAluno = rawId != null ? Number(rawId) : NaN;
    if (!Number.isFinite(idAluno)) {
      setError("Identificador do aluno ausente ou invalido (matricula/id).");
      return;
    }

    const payload = {
      id_aluno: idAluno,
      latitude_atual: pointData.latitude,
      longitude_atual: pointData.longitude,
    };

    const api = getApiClient();
    const endpoints = getEndpoints();

    setLoading(true);
    setError(null);

    try {
      try {
        await api.post(endpoints.verificarLocalizacao, payload);
      } catch (verr) {
        if (isNetworkError(verr)) {
          await storeOfflinePoint(idAluno, pointData);
          return;
        }
        const message = extractApiMessage(
          verr,
          "Nao foi possivel verificar sua localizacao."
        );
        setError(`Falha na verificacao de localizacao: ${message}`);
        return;
      }

      await api.post(endpoints.registro, payload);
      setPointData(null);
      Alert.alert("Ponto registrado", "Registro enviado com sucesso.");
      refreshQueuedCount();
      handleSyncOfflinePoints(false).catch(() => {
        console.debug("Fila offline sera sincronizada depois.");
      });
    } catch (err) {
      if (isNetworkError(err)) {
        await storeOfflinePoint(idAluno, pointData);
        return;
      }
      const message = extractApiMessage(err, "Requisicao invalida.");
      setError(`Falha no registro: ${message}`);
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
    queuedCount,
    syncingQueue,
    syncOfflinePoints: () => handleSyncOfflinePoints(true),
  };
};

export default usePointRegistration;
