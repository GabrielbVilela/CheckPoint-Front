import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

export type DocumentoTipo = "tce" | "plano_atividades" | "aditivo" | "outro";
export type DocumentoStatus = "pendente" | "aprovado" | "rejeitado";

export interface DocumentoPayload {
  id_contrato: number;
  tipo: DocumentoTipo;
  arquivo_url?: string;
  observacoes?: string;
  status?: DocumentoStatus;
}

export interface DocumentoLogDTO {
  id: number;
  status: DocumentoStatus;
  comentario?: string | null;
  usuario?: {
    id: number;
    nome: string;
    email: string;
  } | null;
  criado_em: string;
}

export interface DocumentoDTO extends DocumentoPayload {
  id: number;
  status: DocumentoStatus;
  criado_em: string;
  atualizado_em: string;
  logs: DocumentoLogDTO[];
}

export interface DocumentoFilterParams {
  contrato_id?: number;
  status?: DocumentoStatus;
  tipo?: string;
  curso_id?: number;
  empresa_id?: number;
  periodo?: string;
  data_inicio?: string;
  data_fim?: string;
}

export const listDocumentos = async (params?: DocumentoFilterParams) => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  const response = await api.get<DocumentoDTO[]>(documentos, {
    params: {
      contrato_id: params?.contrato_id,
      status_filter: params?.status,
      tipo: params?.tipo,
      curso_id: params?.curso_id,
      empresa_id: params?.empresa_id,
      periodo: params?.periodo,
      data_inicio: params?.data_inicio,
      data_fim: params?.data_fim,
    },
  });
  return response.data;
};

export const createDocumento = async (payload: DocumentoPayload) => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  const response = await api.post<DocumentoDTO>(documentos, payload);
  return response.data;
};

export const updateDocumento = async (
  id: number,
  payload: Partial<DocumentoPayload> & { status?: DocumentoStatus; comentario?: string }
) => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  const response = await api.patch<DocumentoDTO>(`${documentos}/${id}`, payload);
  return response.data;
};

export const deleteDocumento = async (id: number) => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  await api.delete(`${documentos}/${id}`);
};

export const uploadDocumentoFile = async (payload: { filename: string; content_base64: string }) => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  const response = await api.post<{ url: string }>(`${documentos}/upload`, payload);
  return response.data;
};

export interface DocumentoResumoDTO {
  pendentes: number;
  aprovados: number;
  rejeitados: number;
}

export const listDocumentosResumo = async () => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  const response = await api.get<DocumentoResumoDTO>(`${documentos}/resumo`);
  return response.data;
};

export type DocumentoAnalyticsGroup = "curso" | "empresa" | "periodo";

export interface DocumentoAnalyticsItem {
  chave?: string | null;
  label: string;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
}

export const listDocumentosAnalytics = async (groupBy: DocumentoAnalyticsGroup, limit = 5) => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  const response = await api.get<DocumentoAnalyticsItem[]>(`${documentos}/analytics`, {
    params: { group_by: groupBy, limit },
  });
  return response.data;
};

export interface DocumentoExportInlineResponse {
  filename: string;
  mime_type: string;
  content_base64: string;
}

export const exportDocumentosInline = async (
  formato: "csv" | "pdf",
  params?: DocumentoFilterParams
) => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  const response = await api.get<DocumentoExportInlineResponse>(`${documentos}/export`, {
    params: {
      formato,
      inline: true,
      contrato_id: params?.contrato_id,
      status_filter: params?.status,
      tipo: params?.tipo,
      curso_id: params?.curso_id,
      empresa_id: params?.empresa_id,
      periodo: params?.periodo,
      data_inicio: params?.data_inicio,
      data_fim: params?.data_fim,
    },
  });
  return response.data;
};
