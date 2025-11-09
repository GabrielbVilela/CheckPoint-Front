import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

export type AvaliacaoStatus = "pendente" | "concluida";

export interface AvaliacaoRubricaDTO {
  id: number;
  nome: string;
  descricao?: string | null;
  criterios?: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface AvaliacaoPayload {
  id_contrato: number;
  id_rubrica: number;
  periodo?: string;
  notas?: Record<string, number>;
  feedback?: string;
  plano_acao?: string;
}

export interface AvaliacaoDTO extends AvaliacaoPayload {
  id: number;
  id_avaliador: number;
  status: AvaliacaoStatus;
  exportado: boolean;
  criado_em: string;
  atualizado_em: string;
  rubrica?: AvaliacaoRubricaDTO | null;
}

export const listRubricas = async (somenteAtivas?: boolean) => {
  const api = getApiClient();
  const { rubricas } = getEndpoints();
  const response = await api.get<AvaliacaoRubricaDTO[]>(rubricas, {
    params: somenteAtivas ? { somente_ativas: true } : undefined,
  });
  return response.data;
};

export const listAvaliacoes = async (params?: { contrato_id?: number }) => {
  const api = getApiClient();
  const { avaliacoes } = getEndpoints();
  const response = await api.get<AvaliacaoDTO[]>(avaliacoes, { params });
  return response.data;
};

export const createAvaliacao = async (payload: AvaliacaoPayload) => {
  const api = getApiClient();
  const { avaliacoes } = getEndpoints();
  const response = await api.post<AvaliacaoDTO>(avaliacoes, payload);
  return response.data;
};
