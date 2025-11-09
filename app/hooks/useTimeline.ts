import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";

import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

export type TimelinePoint = {
  id: number;
  id_contrato: number;
  data: string;
  hora_entrada: string;
  hora_saida: string | null;
  tempo_trabalhado_minutos: number | null;
  alerta: string | null;
};

export type TimelineJustificativa = {
  id: number;
  id_contrato: number;
  tipo: string;
  motivo: string;
  status: string;
  criado_em: string;
  prazo_resposta: string | null;
};

export type TimelineDiario = {
  id: number;
  id_contrato: number;
  data_referencia: string;
  resumo: string;
  status: string;
};

export type TimelineAvaliacao = {
  id: number;
  id_contrato: number;
  periodo: string | null;
  status: string;
  rubrica?: { nome: string };
  criado_em: string;
};

export type TimelineResponse = {
  data: string;
  total_minutos: number;
  esperado_minutos: number | null;
  saldo_minutos: number | null;
  pontos: TimelinePoint[];
  justificativas: TimelineJustificativa[];
  diarios: TimelineDiario[];
  avaliacoes: TimelineAvaliacao[];
};

export const useTimeline = (dateIso?: string) => {
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<{ id: number; label: string }[]>([]);

  const fetchTimeline = useCallback(
    async (dateParam?: string) => {
      setLoading(true);
      setError(null);
      try {
        const api = getApiClient();
        const { timeline } = getEndpoints();
        const response = await api.get<TimelineResponse>(timeline, {
          params: dateParam ? { data: dateParam } : undefined,
        });
        setTimeline(response.data);
        const contractEntries = new Map<number, string>();
        const pushContract = (id?: number | null) => {
          if (typeof id === "number") {
            contractEntries.set(id, `Contrato ${id}`);
          }
        };
        response.data.pontos.forEach((p) => pushContract(p.id_contrato));
        response.data.justificativas.forEach((j) => pushContract(j.id_contrato));
        response.data.diarios.forEach((d) => pushContract(d.id_contrato));
        response.data.avaliacoes.forEach((a) => pushContract(a.id_contrato));
        setContracts(Array.from(contractEntries.entries()).map(([id, label]) => ({ id, label })));
      } catch (err: any) {
        console.error("Erro ao carregar timeline:", err);
        setError(
          err?.response?.data?.detail ??
            "Não foi possível carregar os eventos do dia. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTimeline(dateIso);
  }, [fetchTimeline, dateIso]);

  return {
    timeline,
    loading,
    error,
    contracts,
    refresh: () => fetchTimeline(dateIso),
  };
};

export default useTimeline;
