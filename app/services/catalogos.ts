import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

export interface CursoDTO {
  id: number;
  nome: string;
  carga_horaria_total?: number | null;
  competencias?: string | null;
}

export interface TurmaDTO {
  id: number;
  nome: string;
  ano?: number | null;
  semestre?: number | null;
  turno?: string | null;
  id_curso: number;
  curso?: CursoDTO | null;
}

export interface EmpresaDTO {
  id: number;
  razao_social: string;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
}

export interface SupervisorExternoDTO {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  id_empresa: number;
  empresa?: EmpresaDTO | null;
}

export interface ConvenioDTO {
  id: number;
  id_empresa: number;
  id_curso: number;
  data_inicio?: string | null;
  data_fim?: string | null;
  status?: boolean | null;
  descricao?: string | null;
  empresa?: EmpresaDTO | null;
  curso?: CursoDTO | null;
}

const api = getApiClient;

export const listCursos = async () => {
  const client = api();
  const { cursos } = getEndpoints();
  const response = await client.get<CursoDTO[]>(cursos);
  return response.data;
};

export const createCurso = async (payload: { nome: string; carga_horaria_total?: number | null; competencias?: string | null }) => {
  const client = api();
  const { cursos } = getEndpoints();
  const response = await client.post<CursoDTO>(cursos, payload);
  return response.data;
};

export const listTurmas = async () => {
  const client = api();
  const { turmas } = getEndpoints();
  const response = await client.get<TurmaDTO[]>(turmas);
  return response.data;
};

export const createTurma = async (payload: {
  nome: string;
  id_curso: number;
  ano?: number | null;
  semestre?: number | null;
  turno?: string | null;
}) => {
  const client = api();
  const { turmas } = getEndpoints();
  const response = await client.post<TurmaDTO>(turmas, payload);
  return response.data;
};

export const listEmpresas = async () => {
  const client = api();
  const { empresas } = getEndpoints();
  const response = await client.get<EmpresaDTO[]>(empresas);
  return response.data;
};

export const createEmpresa = async (payload: {
  razao_social: string;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
}) => {
  const client = api();
  const { empresas } = getEndpoints();
  const response = await client.post<EmpresaDTO>(empresas, payload);
  return response.data;
};

export const updateEmpresa = async (id: number, payload: Partial<Omit<EmpresaDTO, "id">>) => {
  const client = api();
  const { empresas } = getEndpoints();
  const response = await client.patch<EmpresaDTO>(`${empresas}/${id}`, payload);
  return response.data;
};

export const deleteEmpresa = async (id: number) => {
  const client = api();
  const { empresas } = getEndpoints();
  await client.delete(`${empresas}/${id}`);
};

export const listSupervisoresExternos = async () => {
  const client = api();
  const { supervisores } = getEndpoints();
  const response = await client.get<SupervisorExternoDTO[]>(supervisores);
  return response.data;
};

export const createSupervisorExterno = async (payload: {
  nome: string;
  id_empresa: number;
  email?: string | null;
  telefone?: string | null;
  cargo?: string | null;
}) => {
  const client = api();
  const { supervisores } = getEndpoints();
  const response = await client.post<SupervisorExternoDTO>(supervisores, payload);
  return response.data;
};

export const updateSupervisorExterno = async (
  id: number,
  payload: Partial<Omit<SupervisorExternoDTO, "id" | "empresa">> & { id_empresa?: number }
) => {
  const client = api();
  const { supervisores } = getEndpoints();
  const response = await client.patch<SupervisorExternoDTO>(`${supervisores}/${id}`, payload);
  return response.data;
};

export const deleteSupervisorExterno = async (id: number) => {
  const client = api();
  const { supervisores } = getEndpoints();
  await client.delete(`${supervisores}/${id}`);
};

export const listConvenios = async () => {
  const client = api();
  const { convenios } = getEndpoints();
  const response = await client.get<ConvenioDTO[]>(convenios);
  return response.data;
};

export const createConvenio = async (payload: {
  id_empresa: number;
  id_curso: number;
  data_inicio?: string | null;
  data_fim?: string | null;
  status?: boolean | null;
  descricao?: string | null;
}) => {
  const client = api();
  const { convenios } = getEndpoints();
  const response = await client.post<ConvenioDTO>(convenios, payload);
  return response.data;
};

export const updateConvenio = async (id: number, payload: Partial<Omit<ConvenioDTO, "id" | "empresa" | "curso">>) => {
  const client = api();
  const { convenios } = getEndpoints();
  const response = await client.patch<ConvenioDTO>(`${convenios}/${id}`, payload);
  return response.data;
};

export const deleteConvenio = async (id: number) => {
  const client = getApiClient();
  const { convenios } = getEndpoints();
  await client.delete(`${convenios}/${id}`);
};
