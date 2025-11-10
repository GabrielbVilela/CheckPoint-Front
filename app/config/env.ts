import Constants from "expo-constants";

type EnvConfig = {
  apiUrl: string;
};

/**
 * Lê a configuração de ambiente em runtime. Evita leitura ao importar o módulo
 * (previne problemas de avaliação prematura ou ciclos de importação).
 */
export const getEnvConfig = (): EnvConfig => {
  const expoExtra = (Constants && (Constants as any).expoConfig?.extra) ?? {};
  const envApiUrl:
    | string
    | undefined = process.env.EXPO_PUBLIC_API_URL ?? (expoExtra.EXPO_PUBLIC_API_URL as string | undefined);

  const apiUrl = envApiUrl ?? "https://apps-back-checkpoint.uagslr.easypanel.host";

  if (!envApiUrl) {
    console.warn("[env] EXPO_PUBLIC_API_URL nao foi definido; usando fallback:", apiUrl);
  }

  return { apiUrl };
};

export const getEndpoints = () => {
  const { apiUrl } = getEnvConfig();
  return {
    login: `${apiUrl}/login`,
    registro: `${apiUrl}/ponto/entrada`,
    verificarLocalizacao: `${apiUrl}/ponto/verificar-localizacao`,
    alunos: `${apiUrl}/alunos`,
    timeline: `${apiUrl}/ponto/timeline`,
    justificativas: `${apiUrl}/justificativas`,
    diarios: `${apiUrl}/diarios`,
    cursos: `${apiUrl}/cursos`,
    turmas: `${apiUrl}/turmas`,
    empresas: `${apiUrl}/empresas`,
    supervisores: `${apiUrl}/supervisores-externos`,
    convenios: `${apiUrl}/convenios`,
    rubricas: `${apiUrl}/avaliacao/rubricas`,
    avaliacoes: `${apiUrl}/avaliacoes`,
    avaliacoesExportCsv: `${apiUrl}/avaliacoes/export/csv`,
    contratosAluno: `${apiUrl}/aluno/contratos/ativos`,
    documentos: `${apiUrl}/documentos`,
  } as const;
};

// compatibilidade (não recomendado para uso em import estático)
export default getEnvConfig;
