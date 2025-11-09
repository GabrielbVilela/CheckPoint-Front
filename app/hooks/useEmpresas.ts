import { useCallback, useEffect, useState } from "react";

import { createEmpresa, EmpresaDTO, listEmpresas, updateEmpresa, deleteEmpresa } from "@/services/catalogos";

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState<EmpresaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEmpresas();
      setEmpresas(data);
    } catch (err: any) {
      console.error("Erro ao carregar empresas:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel carregar as empresas.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const handleCreate = useCallback(
    async (payload: { razao_social: string; nome_fantasia?: string; cnpj?: string; telefone?: string; email?: string }) => {
      setSubmitting(true);
      setError(null);
      try {
        await createEmpresa(payload);
        await fetchEmpresas();
      } catch (err: any) {
        console.error("Erro ao criar empresa:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel criar a empresa.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchEmpresas]
  );

  return {
    empresas,
    loading,
    submitting,
    error,
    refresh: fetchEmpresas,
    createEmpresa: handleCreate,
    updateEmpresa: async (id: number, payload: Partial<Omit<EmpresaDTO, "id">>) => {
      setSubmitting(true);
      setError(null);
      try {
        await updateEmpresa(id, payload);
        await fetchEmpresas();
      } catch (err: any) {
        console.error("Erro ao atualizar empresa:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel atualizar a empresa.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    deleteEmpresa: async (id: number) => {
      setSubmitting(true);
      setError(null);
      try {
        await deleteEmpresa(id);
        await fetchEmpresas();
      } catch (err: any) {
        console.error("Erro ao remover empresa:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel remover a empresa.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
  };
};

export default useEmpresas;
