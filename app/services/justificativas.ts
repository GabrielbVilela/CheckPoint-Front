import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

export type JustificativaPayload = {
  id_contrato: number;
  tipo: string;
  motivo: string;
  id_ponto?: number;
  data_referencia?: string;
  evidencia_url?: string;
};

export type JustificativaStatus = "pendente" | "aprovado" | "rejeitado" | "expirado";

export interface JustificativaDTO extends JustificativaPayload {
  id: number;
  id_aluno: number;
  status: JustificativaStatus;
  comentario_resolucao?: string | null;
  prazo_resposta?: string | null;
  resolvido_em?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export const createJustificativa = async (payload: JustificativaPayload) => {
  const api = getApiClient();
  const { justificativas } = getEndpoints();
  const response = await api.post<JustificativaDTO>(justificativas, payload);
  return response.data;
};

export const listJustificativas = async (status?: JustificativaStatus) => {
  const api = getApiClient();
  const { justificativas } = getEndpoints();
  const response = await api.get<JustificativaDTO[]>(justificativas, {
    params: status ? { status_filter: status } : undefined,
  });
  return response.data;
};

export const updateJustificativaStatus = async (
  id: number,
  status: Extract<JustificativaStatus, "aprovado" | "rejeitado">,
  comentario?: string
) => {
  const api = getApiClient();
  const { justificativas } = getEndpoints();
  const response = await api.patch<JustificativaDTO>(`${justificativas}/${id}`, {
    status,
    comentario,
  });
  return response.data;
};
