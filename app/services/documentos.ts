import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

export type DocumentoTipo = "tce" | "plano_atividades" | "aditivo" | "outro";

export interface DocumentoPayload {
  id_contrato: number;
  tipo: DocumentoTipo;
  arquivo_url?: string;
  observacoes?: string;
}

export interface DocumentoDTO extends DocumentoPayload {
  id: number;
  status: string;
  criado_em: string;
  atualizado_em: string;
}

export const listDocumentos = async (params?: { contrato_id?: number }) => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  const response = await api.get<DocumentoDTO[]>(documentos, { params });
  return response.data;
};

export const createDocumento = async (payload: DocumentoPayload) => {
  const api = getApiClient();
  const { documentos } = getEndpoints();
  const response = await api.post<DocumentoDTO>(documentos, payload);
  return response.data;
};

export const updateDocumento = async (id: number, payload: Partial<DocumentoPayload> & { status?: string }) => {
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
