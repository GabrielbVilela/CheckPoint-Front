import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

export interface AlunoResumo {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  turma?: string | null;
  periodo?: string | null;
  tipo_acesso?: string | null;
}

export interface AlunoImportPayload {
  nome: string;
  matricula: string;
  senha?: string;
  celular: string;
  email: string;
  turma: string;
  periodo?: string | null;
  cep?: string | null;
  logradouro: string;
  numero?: string | null;
  bairro?: string | null;
  cidade: string;
  estado: string;
  data_inicio?: string | null;
  data_final?: string | null;
  id_professor?: number | null;
  hora_inicio_prevista?: string | null;
  hora_fim_prevista?: string | null;
  tolerancia_minutos?: number | null;
  raio_permitido_metros?: number | null;
  id_turma?: number | null;
  id_convenio?: number | null;
  id_supervisor_externo?: number | null;
}

export interface AlunoImportResponse {
  total: number;
  importados: number;
  erros: string[];
}

export const fetchAlunos = async (params?: { search?: string; limit?: number }) => {
  const api = getApiClient();
  const { alunos } = getEndpoints();
  const response = await api.get<AlunoResumo[]>(alunos, {
    params: {
      search: params?.search,
      limit: params?.limit,
    },
  });
  return response.data;
};

export type AlunoUpdatePayload = {
  nome?: string;
  matricula?: string;
  senha?: string;
  contato?: string;
  email?: string;
  turma?: string;
  periodo?: string;
};

export const updateAluno = async (id: number, payload: AlunoUpdatePayload) => {
  const api = getApiClient();
  const { alunos } = getEndpoints();
  const response = await api.patch<AlunoResumo>(`${alunos}/${id}`, payload);
  return response.data;
};

export const deleteAluno = async (id: number) => {
  const api = getApiClient();
  const { alunos } = getEndpoints();
  await api.delete(`${alunos}/${id}`);
};

export const importAlunos = async (registros: AlunoImportPayload[]) => {
  const api = getApiClient();
  const { alunos } = getEndpoints();
  const response = await api.post<AlunoImportResponse>(`${alunos}/import`, { registros });
  return response.data;
};
