import { useCallback, useEffect, useState } from "react";

import { ConvenioDTO, createConvenio, deleteConvenio, listConvenios, updateConvenio } from "@/services/catalogos";

export const useConvenios = () => {
  const [convenios, setConvenios] = useState<ConvenioDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConvenios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listConvenios();
      setConvenios(data);
    } catch (err: any) {
      console.error("Erro ao carregar convênios:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel carregar os convênios.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConvenios();
  }, [fetchConvenios]);

  const handleCreate = useCallback(
    async (payload: {
      id_empresa: number;
      id_curso: number;
      data_inicio?: string;
      data_fim?: string;
      status?: boolean;
      descricao?: string;
    }) => {
      setSubmitting(true);
      setError(null);
      try {
        await createConvenio(payload);
        await fetchConvenios();
      } catch (err: any) {
        console.error("Erro ao criar convênio:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel criar o convênio.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchConvenios]
  );

  return {
    convenios,
    loading,
    submitting,
    error,
    refresh: fetchConvenios,
    createConvenio: handleCreate,
    updateConvenio: async (id: number, payload: Partial<Omit<ConvenioDTO, "id" | "empresa" | "curso">>) => {
      setSubmitting(true);
      setError(null);
      try {
        await updateConvenio(id, payload);
        await fetchConvenios();
      } catch (err: any) {
        console.error("Erro ao atualizar convênio:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel atualizar o convênio.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    deleteConvenio: async (id: number) => {
      setSubmitting(true);
      setError(null);
      try {
        await deleteConvenio(id);
        await fetchConvenios();
      } catch (err: any) {
        console.error("Erro ao remover convênio:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel remover o convênio.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
  };
};

export default useConvenios;
