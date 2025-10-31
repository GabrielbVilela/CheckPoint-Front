import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import * as Location from "expo-location";
import { useState } from "react";
import { Alert } from "react-native";

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
      const response = await api.post(endpoints.registro, {
        timestamp: pointData.timestamp,
        latitude: pointData.latitude,
        longitude: pointData.longitude,
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          "Sucesso",
          "Ponto registrado! O backend esta validando sua localizacao."
        );
        setPointData(null);
      }
    } catch (err: any) {
      console.error("Erro ao registrar ponto:", err);
      const errorMessage =
        err.response?.data?.detail ?? "Erro ao comunicar com o servidor.";
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
