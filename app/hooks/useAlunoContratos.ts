import { useCallback, useEffect, useMemo, useState } from "react";

import { ContratoDTO, listContratosAtivosDoAluno } from "@/services/contratos";

export type ContratoOption = { id: number; label: string; raw: ContratoDTO };

const buildLabel = (contrato: ContratoDTO): string => {
  const curso = contrato.turma?.curso?.nome;
  const turma = contrato.turma?.nome;
  const empresa = contrato.convenio?.empresa?.nome_fantasia ?? contrato.convenio?.empresa?.razao_social;

  if (curso && empresa) {
    return `${curso} · ${empresa}`;
  }
  if (curso && turma) {
    return `${curso} · ${turma}`;
  }
  if (empresa) {
    return `${empresa} (Contrato ${contrato.id})`;
  }
  return `Contrato ${contrato.id}`;
};

export const useAlunoContratos = () => {
  const [contratos, setContratos] = useState<ContratoOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContratos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listContratosAtivosDoAluno();
      setContratos(
        data.map((contrato) => ({
          id: contrato.id,
          label: buildLabel(contrato),
          raw: contrato,
        }))
      );
    } catch (err: any) {
      console.error("Falha ao buscar contratos do aluno:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Erro ao carregar contratos.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  const options = useMemo(() => contratos.map(({ id, label }) => ({ id, label })), [contratos]);

  return {
    contracts: contratos,
    options,
    loading,
    error,
    refresh: fetchContratos,
  };
};

export default useAlunoContratos;
