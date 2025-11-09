import { useCallback, useEffect, useState } from "react";

import {
  createSupervisorExterno,
  deleteSupervisorExterno,
  listSupervisoresExternos,
  SupervisorExternoDTO,
  updateSupervisorExterno,
} from "@/services/catalogos";

export const useSupervisores = () => {
  const [supervisores, setSupervisores] = useState<SupervisorExternoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupervisores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSupervisoresExternos();
      setSupervisores(data);
    } catch (err: any) {
      console.error("Erro ao carregar supervisores:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel carregar os supervisores.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupervisores();
  }, [fetchSupervisores]);

  const handleCreate = useCallback(
    async (payload: { nome: string; id_empresa: number; email?: string; telefone?: string; cargo?: string }) => {
      setSubmitting(true);
      setError(null);
      try {
        await createSupervisorExterno(payload);
        await fetchSupervisores();
      } catch (err: any) {
        console.error("Erro ao criar supervisor:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel criar o supervisor.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchSupervisores]
  );

  return {
    supervisores,
    loading,
    submitting,
    error,
    refresh: fetchSupervisores,
    createSupervisor: handleCreate,
    updateSupervisor: async (
      id: number,
      payload: Partial<Omit<SupervisorExternoDTO, "id" | "empresa">> & { id_empresa?: number }
    ) => {
      setSubmitting(true);
      setError(null);
      try {
        await updateSupervisorExterno(id, payload);
        await fetchSupervisores();
      } catch (err: any) {
        console.error("Erro ao atualizar supervisor:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel atualizar o supervisor.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    deleteSupervisor: async (id: number) => {
      setSubmitting(true);
      setError(null);
      try {
        await deleteSupervisorExterno(id);
        await fetchSupervisores();
      } catch (err: any) {
        console.error("Erro ao remover supervisor:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel remover o supervisor.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
  };
};

export default useSupervisores;
