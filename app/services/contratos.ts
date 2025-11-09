import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

export interface ContratoDTO {
  id: number;
  id_aluno: number;
  id_professor: number;
  id_endereco: number;
  status: boolean;
  data_inicio?: string | null;
  data_final?: string | null;
  hora_inicio_prevista?: string | null;
  hora_fim_prevista?: string | null;
  tolerancia_minutos?: number | null;
  raio_permitido_metros?: number | null;
  professor?: { id: number; nome: string } | null;
  turma?: { id: number; nome: string; curso?: { id: number; nome: string } | null } | null;
  convenio?: { id: number; empresa?: { id: number; nome_fantasia?: string | null; razao_social?: string | null } | null } | null;
}

export const listContratosAtivosDoAluno = async () => {
  const api = getApiClient();
  const { contratosAluno } = getEndpoints();
  const response = await api.get<ContratoDTO[]>(contratosAluno);
  return response.data;
};
