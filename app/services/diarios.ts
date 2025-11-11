import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

export type DiarioPayload = {
  id_contrato: number;
  data_referencia: string;
  resumo: string;
  detalhes?: string;
  anexo_url?: string;
};

export type DiarioStatus = "pendente" | "aprovado" | "rejeitado";

export interface DiarioDTO extends DiarioPayload {
  id: number;
  id_aluno: number;
  status: DiarioStatus;
  comentario_avaliador?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export const createDiario = async (payload: DiarioPayload) => {
  const api = getApiClient();
  const { diarios } = getEndpoints();
  const response = await api.post<DiarioDTO>(diarios, payload);
  return response.data;
};

export const listDiarios = async (params?: { status?: DiarioStatus; data_referencia?: string }) => {
  const api = getApiClient();
  const { diarios } = getEndpoints();
  const response = await api.get<DiarioDTO[]>(diarios, {
    params: {
      status_filter: params?.status,
      data_referencia: params?.data_referencia,
    },
  });
  return response.data;
};

export const updateDiarioStatus = async (
  id: number,
  status: Extract<DiarioStatus, "aprovado" | "rejeitado">,
  comentario?: string
) => {
  const api = getApiClient();
  const { diarios } = getEndpoints();
  const response = await api.patch<DiarioDTO>(`${diarios}/${id}`, {
    status,
    comentario,
  });
  return response.data;
};
