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

export type TimelineContrato = {
  id: number;
  status: boolean;
  data_inicio?: string | null;
  data_final?: string | null;
  hora_inicio_prevista?: string | null;
  hora_fim_prevista?: string | null;
  tolerancia_minutos?: number | null;
  raio_permitido_metros?: number | null;
  turma?: { nome?: string; turno?: string | null };
  convenio?: {
    id?: number;
    curso?: { nome?: string };
    empresa?: { nome_fantasia?: string; razao_social?: string };
  };
  supervisor_externo?: {
    id?: number;
    nome?: string;
    empresa?: { nome_fantasia?: string; razao_social?: string };
  };
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
  contratos: TimelineContrato[];
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
        const describeContract = (contract: TimelineContrato) => {
          const segments: string[] = [];
          if (contract.turma?.nome) {
            segments.push(contract.turma.turno ? `${contract.turma.nome} • ${contract.turma.turno}` : contract.turma.nome);
          }
          if (contract.convenio) {
            const empresa = contract.convenio.empresa?.nome_fantasia ?? contract.convenio.empresa?.razao_social;
            if (empresa) {
              segments.push(empresa);
            }
            if (contract.convenio.curso?.nome) {
              segments.push(contract.convenio.curso.nome);
            }
          }
          if (!segments.length) {
            return `Contrato ${contract.id}`;
          }
          return segments.join(" • ");
        };
        const contractEntries = new Map<number, string>();
        response.data.contratos.forEach((contract) => {
          contractEntries.set(contract.id, describeContract(contract));
        });
        setContracts(
          Array.from(contractEntries.entries()).map(([id, label]) => ({
            id,
            label,
          }))
        );
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
